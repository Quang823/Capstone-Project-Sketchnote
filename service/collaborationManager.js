/**
 * =============================================================================
 * COLLABORATION MANAGER
 * =============================================================================
 *
 * Central manager for real-time collaboration in the sketchnote app.
 * Handles WebSocket communication, state synchronization, and conflict resolution.
 *
 * IMPORTANT: This integrates with existing stroke sync logic - does NOT replace it.
 */

import { webSocketService } from "./webSocketService";
import { EventTypes, ElementTypes } from "../types/collaboration.types";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  // Throttle settings (ms)
  DRAG_THROTTLE: 50, // Position updates during drag
  CURSOR_THROTTLE: 100, // Cursor position updates
  STROKE_THROTTLE: 16, // ~60fps for smooth stroke sync

  // Batch settings
  STROKE_BATCH_SIZE: 10, // Points to batch before sending
  STROKE_BATCH_TIMEOUT: 50, // Max wait before sending partial batch

  // Reconnection
  RECONNECT_DELAY: 2000,
  MAX_RECONNECT_ATTEMPTS: 5,

  // Message queue
  MAX_PENDING_MESSAGES: 100,

  // *** CRITICAL: Version & Ordering ***
  SEQUENCE_GAP_THRESHOLD: 10, // Request resync if gap > this
  MAX_OUT_OF_ORDER_BUFFER: 50, // Buffer for reordering messages
  LOCK_REQUEST_TIMEOUT: 5000, // 5s timeout for lock requests
  DEFAULT_LOCK_TTL: 30000, // 30s lock time-to-live
};

// =============================================================================
// COLLABORATION MANAGER CLASS
// =============================================================================

class CollaborationManager {
  constructor() {
    // Connection state
    this.projectId = null;
    this.userId = null;
    this.connected = false;
    this.connecting = false;

    // Document state
    this.documentState = null;
    this.activePageId = null;

    // *** CRITICAL: Server-authoritative versioning ***
    this.serverVersion = 0; // Server's document version
    this.lastProcessedSeq = 0; // Last processed sequence number
    this.localSeq = 0; // Local sequence counter for outgoing messages
    this.seqInitialized = false; // 🔥 Track if seq has been initialized from server

    // *** CRITICAL: Message ordering ***
    this.outOfOrderBuffer = new Map(); // seq -> message (for reordering)
    this.pendingAcks = new Map(); // messageId -> { resolve, reject, timeout }

    // *** CRITICAL: Element locking ***
    this.elementLocks = new Map(); // elementId -> { lockedBy, expiresAt, lockToken }
    this.pendingLockRequests = new Map(); // elementId -> { resolve, reject, timeout }

    // *** CRITICAL: Active strokes (for late join) ***
    this.activeStrokes = new Map(); // strokeId -> { userId, pageId, tool, color, points[] }

    // *** CRITICAL: Chunked sync state ***
    this.syncInProgress = false;
    this.syncChunks = []; // Accumulate chunks during sync
    this.expectedChunkCount = 0;

    // Active users
    this.activeUsers = new Map();

    // Pending operations (for offline support)
    this.pendingOperations = [];

    // Stroke batching
    this.strokeBatches = new Map(); // strokeId -> { points: [], timeout: null }

    // Callbacks
    this.onElementCreate = null;
    this.onElementUpdate = null;
    this.onElementDelete = null;
    this.onStrokeAppend = null;
    this.onStrokeEnd = null;
    this.onStrokeInit = null; // *** NEW: For late join stroke initialization ***
    this.onPageCreate = null;
    this.onPageUpdate = null;
    this.onPageDelete = null;
    this.onPageSwitch = null;
    this.onUserJoin = null;
    this.onUserLeave = null;
    this.onUserCursor = null;
    this.onSyncComplete = null;
    this.onSyncProgress = null; // *** NEW: Progress during chunked sync ***
    this.onLockAcquired = null; // *** NEW: Lock callbacks ***
    this.onLockReleased = null;
    this.onLockRejected = null;
    this.onVersionConflict = null; // *** NEW: Server rejected due to version ***
    this.onError = null;

    // Throttled functions
    this._sendPositionUpdate = throttle(
      this._sendPositionUpdateImmediate.bind(this),
      CONFIG.DRAG_THROTTLE,
      { leading: true, trailing: true }
    );

    this._sendCursorUpdate = throttle(
      this._sendCursorUpdateImmediate.bind(this),
      CONFIG.CURSOR_THROTTLE,
      { leading: true, trailing: false }
    );

    // Message deduplication
    this.processedMessageIds = new Set();
    this.MESSAGE_ID_RETENTION = 60000; // 1 minute

    // Cleanup old message IDs periodically
    setInterval(() => this._cleanupMessageIds(), 30000);

    // *** CRITICAL: Cleanup expired locks periodically ***
    setInterval(() => this._cleanupExpiredLocks(), 5000);
  }

  // ===========================================================================
  // CONNECTION MANAGEMENT
  // ===========================================================================

  /**
   * Connect to a project's collaboration session
   * @param {string|number} projectId
   * @param {string|number} userId
   * @param {Object} options
   */
  async connect(projectId, userId, options = {}) {
    if (this.connected && this.projectId === projectId) {
      console.log("[CollabManager] Already connected to project:", projectId);
      return true;
    }

    // Disconnect from previous project if any
    if (this.connected) {
      await this.disconnect();
    }

    this.projectId = projectId;
    this.userId = userId;
    this.connecting = true;

    // *** CRITICAL: Reset version/sequence state ***
    this.serverVersion = 0;
    this.lastProcessedSeq = 0;
    this.localSeq = 0;
    this.seqInitialized = false; // 🔥 Reset seq initialization flag
    this.outOfOrderBuffer.clear();
    this.elementLocks.clear();
    this.activeStrokes.clear();
    this.syncInProgress = false;
    this.syncChunks = [];

    try {
      const wsUrl = options.wsUrl || "wss://sketchnote.litecsys.com/ws";

      await webSocketService.connect(
        wsUrl,
        () => this._onConnected(),
        (error) => this._onError(error)
      );

      // *** ROUTE SEPARATED ***
      // Subscribe to collaboration topic (element, page, sync, lock events)
      // Stroke events are handled by existing projectService.realtime
      const collaborationTopic = `/topic/project/${projectId}/collaboration`;
      webSocketService.subscribe(collaborationTopic, (message) => {
        this._handleMessage(message);
      });

      this.connected = true;
      this.connecting = false;

      // Send join event
      this._sendEvent(EventTypes.USER_JOIN, {
        user: {
          userId: this.userId,
          userName: options.userName || `User ${userId}`,
          avatarUrl: options.avatarUrl,
          currentPageId: this.activePageId,
        },
      });

      // Request full sync
      this._requestSync();

      return true;
    } catch (error) {
      this.connecting = false;
      console.error("[CollabManager] Connection failed:", error);
      throw error;
    }
  }

  /**
   * Disconnect from collaboration session
   */
  async disconnect() {
    if (!this.connected) return;

    // Send leave event
    this._sendEvent(EventTypes.USER_LEAVE, {});

    // Flush pending stroke batches
    this._flushAllStrokeBatches();

    // Clear state
    this.projectId = null;
    this.connected = false;
    this.activeUsers.clear();
    this.strokeBatches.clear();

    webSocketService.disconnect();
  }

  _onConnected() {
    console.log("[CollabManager] Connected to project:", this.projectId);
  }

  _onError(error) {
    console.error("[CollabManager] WebSocket error:", error);
    this.onError?.(error);
  }

  // ===========================================================================
  // MESSAGE HANDLING
  // ===========================================================================

  /**
   * Handle incoming WebSocket message
   * @param {Object} message
   */
  _handleMessage(message) {
    if (!message || !message.type) return;

    // Skip own messages (except for ACKs and server responses)
    const isServerResponse = [
      "SYNC_RESPONSE",
      "SYNC_RESPONSE_START",
      "SYNC_RESPONSE_CHUNK",
      "SYNC_RESPONSE_END",
      "LOCK_GRANTED",
      "LOCK_RELEASED",
      "SERVER_REJECT",
      "ACK",
    ].includes(message.type);

    // 🔥 Compare as strings to handle type mismatch (number vs string)
    const messageUserId = String(message.userId || "");
    const myUserId = String(this.userId || "");

    if (
      messageUserId &&
      myUserId &&
      messageUserId === myUserId &&
      !isServerResponse
    ) {
      // Skip own message - already applied optimistically
      return;
    }

    // Deduplicate messages
    if (message.messageId) {
      if (this.processedMessageIds.has(message.messageId)) {
        return;
      }
      this.processedMessageIds.add(message.messageId);
    }

    // *** CRITICAL: Sequence ordering ***
    if (message.seq !== undefined && message.seq !== null) {
      // 🔥 First message after connect: initialize seq from server
      if (!this.seqInitialized) {
        this.lastProcessedSeq = message.seq;
        this.seqInitialized = true;
        console.log(
          "[CollabManager] Initialized seq from server:",
          message.seq
        );
      } else {
        // Check for sequence gap
        if (message.seq > this.lastProcessedSeq + 1) {
          // Gap detected - buffer this message
          if (
            message.seq - this.lastProcessedSeq >
            CONFIG.SEQUENCE_GAP_THRESHOLD
          ) {
            // Gap too large - request resync
            console.warn(
              "[CollabManager] Sequence gap too large, requesting resync. Expected:",
              this.lastProcessedSeq + 1,
              "Got:",
              message.seq
            );
            this._requestSync(this.serverVersion);
            return;
          }

          // Buffer for later processing
          if (this.outOfOrderBuffer.size < CONFIG.MAX_OUT_OF_ORDER_BUFFER) {
            this.outOfOrderBuffer.set(message.seq, message);
            return;
          }
        } else if (message.seq <= this.lastProcessedSeq) {
          // Already processed - skip
          console.log(
            "[CollabManager] Skipping already processed seq:",
            message.seq
          );
          return;
        }

        // Process in order
        this.lastProcessedSeq = message.seq;
      }
    }

    // *** CRITICAL: Update server version ***
    if (message.version !== undefined) {
      this.serverVersion = Math.max(this.serverVersion, message.version);
    }

    // Route to appropriate handler
    this._routeMessage(message);

    // *** CRITICAL: Process buffered out-of-order messages ***
    this._processBufferedMessages();
  }

  /**
   * Route message to appropriate handler
   */
  _routeMessage(message) {
    switch (message.type) {
      case EventTypes.ELEMENT_CREATE:
        this._handleElementCreate(message);
        break;

      case EventTypes.ELEMENT_UPDATE:
        this._handleElementUpdate(message);
        break;

      case EventTypes.ELEMENT_DELETE:
        this._handleElementDelete(message);
        break;

      case EventTypes.STROKE_APPEND:
        this._handleStrokeAppend(message);
        break;

      case EventTypes.STROKE_END:
        this._handleStrokeEnd(message);
        break;

      // *** CRITICAL: Late join stroke initialization ***
      case "STROKE_INIT":
        this._handleStrokeInit(message);
        break;

      case EventTypes.PAGE_CREATE:
        this._handlePageCreate(message);
        break;

      case EventTypes.PAGE_UPDATE:
        this._handlePageUpdate(message);
        break;

      case EventTypes.PAGE_DELETE:
        this._handlePageDelete(message);
        break;

      case EventTypes.PAGE_SWITCH:
        this._handlePageSwitch(message);
        break;

      case EventTypes.USER_JOIN:
        this._handleUserJoin(message);
        break;

      case EventTypes.USER_LEAVE:
        this._handleUserLeave(message);
        break;

      case EventTypes.USER_CURSOR:
        this._handleUserCursor(message);
        break;

      case EventTypes.SYNC_RESPONSE:
        this._handleSyncResponse(message);
        break;

      // *** CRITICAL: Chunked sync ***
      case "SYNC_RESPONSE_START":
        this._handleSyncResponseStart(message);
        break;

      case "SYNC_RESPONSE_CHUNK":
        this._handleSyncResponseChunk(message);
        break;

      case "SYNC_RESPONSE_END":
        this._handleSyncResponseEnd(message);
        break;

      // *** CRITICAL: Element locking ***
      case "ELEMENT_LOCK":
        this._handleElementLock(message);
        break;

      case "LOCK_GRANTED":
        this._handleLockGranted(message);
        break;

      case "LOCK_RELEASED":
        this._handleLockReleased(message);
        break;

      case "LOCK_REJECTED":
        this._handleLockRejected(message);
        break;

      // *** CRITICAL: Server rejection due to version conflict ***
      case "SERVER_REJECT":
        this._handleServerReject(message);
        break;

      // Legacy support for existing DRAW action
      case "DRAW":
        this._handleLegacyDraw(message);
        break;

      default:
        console.warn("[CollabManager] Unknown message type:", message.type);
    }
  }

  /**
   * Process buffered out-of-order messages in sequence
   */
  _processBufferedMessages() {
    let nextSeq = this.lastProcessedSeq + 1;
    while (this.outOfOrderBuffer.has(nextSeq)) {
      const bufferedMessage = this.outOfOrderBuffer.get(nextSeq);
      this.outOfOrderBuffer.delete(nextSeq);
      this.lastProcessedSeq = nextSeq;
      this._routeMessage(bufferedMessage);
      nextSeq++;
    }
  }

  // ===========================================================================
  // ELEMENT HANDLERS
  // ===========================================================================

  _handleElementCreate(message) {
    const { pageId, element } = message.payload || {};
    if (!element) return;

    // 🔥 Decompress points if they were compressed
    const decompressedElement = { ...element };
    if (element.points && element.points.length > 0) {
      decompressedElement.points = this._decompressPoints(element.points);
    }

    this.onElementCreate?.({
      pageId,
      element: decompressedElement,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handleElementUpdate(message) {
    const { pageId, elementId, changes, transient } = message.payload || {};
    if (!elementId) return;

    this.onElementUpdate?.({
      pageId,
      elementId,
      changes,
      transient,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handleElementDelete(message) {
    const { pageId, elementId } = message.payload || {};
    if (!elementId) return;

    this.onElementDelete?.({
      pageId,
      elementId,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  // ===========================================================================
  // STROKE HANDLERS (preserving existing real-time stroke sync)
  // ===========================================================================

  _handleStrokeAppend(message) {
    const { pageId, strokeId, points, strokeInit } = message.payload || {};
    if (!strokeId || !points) return;

    // Decompress points if needed
    const decompressedPoints = this._decompressPoints(points);

    this.onStrokeAppend?.({
      pageId,
      strokeId,
      points: decompressedPoints,
      strokeInit,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handleStrokeEnd(message) {
    const { pageId, strokeId } = message.payload || {};
    if (!strokeId) return;

    this.onStrokeEnd?.({
      pageId,
      strokeId,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  /**
   * Handle legacy DRAW messages for backward compatibility
   */
  _handleLegacyDraw(message) {
    const payload = message.payload || {};

    // Convert legacy format to new format
    if (payload.stroke) {
      // This is already handled by existing code in DrawingScreen
      // Just pass through to existing handler
      this.onElementCreate?.({
        pageId: payload.pageId,
        element: {
          ...payload.stroke,
          type: ElementTypes.STROKE,
          points:
            this._decompressPoints(payload.points) || payload.stroke.points,
        },
        userId: message.userId,
        timestamp: message.timestamp,
        legacy: true, // Flag to indicate legacy format
      });
    }
  }

  // ===========================================================================
  // PAGE HANDLERS
  // ===========================================================================

  _handlePageCreate(message) {
    const { page, insertAt } = message.payload || {};
    if (!page) return;

    this.onPageCreate?.({
      page,
      insertAt,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handlePageUpdate(message) {
    const { pageId, changes } = message.payload || {};
    if (!pageId) return;

    this.onPageUpdate?.({
      pageId,
      changes,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handlePageDelete(message) {
    const { pageId } = message.payload || {};
    if (!pageId) return;

    this.onPageDelete?.({
      pageId,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  _handlePageSwitch(message) {
    const { pageId } = message.payload || {};

    // Update user's current page in active users map
    const user = this.activeUsers.get(message.userId);
    if (user) {
      user.currentPageId = pageId;
    }

    this.onPageSwitch?.({
      pageId,
      userId: message.userId,
      timestamp: message.timestamp,
    });
  }

  // ===========================================================================
  // USER PRESENCE HANDLERS
  // ===========================================================================

  _handleUserJoin(message) {
    const { user } = message.payload || {};
    if (!user) return;

    this.activeUsers.set(user.userId, {
      ...user,
      lastSeen: Date.now(),
    });

    this.onUserJoin?.(user);
  }

  _handleUserLeave(message) {
    this.activeUsers.delete(message.userId);
    this.onUserLeave?.(message.userId);
  }

  _handleUserCursor(message) {
    const { cursor, pageId } = message.payload || {};

    const user = this.activeUsers.get(message.userId);
    if (user) {
      user.cursor = cursor;
      user.currentPageId = pageId;
      user.lastSeen = Date.now();
    }

    this.onUserCursor?.({
      userId: message.userId,
      cursor,
      pageId,
    });
  }

  // ===========================================================================
  // SYNC HANDLERS
  // ===========================================================================

  _handleSyncResponse(message) {
    const { document, activeUsers } = message.payload || {};

    if (document) {
      this.documentState = document;
      this.serverVersion = document.version || 0;
    }

    if (activeUsers) {
      activeUsers.forEach((user) => {
        this.activeUsers.set(user.userId, user);
      });
    }

    this.onSyncComplete?.({
      document,
      activeUsers: Array.from(this.activeUsers.values()),
    });
  }

  // *** CRITICAL: Chunked sync handlers ***
  _handleSyncResponseStart(message) {
    const { totalChunks, totalElements, version } = message.payload || {};

    this.syncInProgress = true;
    this.syncChunks = [];
    this.expectedChunkCount = totalChunks || 1;
    this.serverVersion = version || 0;

    console.log(
      `[CollabManager] Sync started: ${totalChunks} chunks, ${totalElements} elements`
    );

    this.onSyncProgress?.({
      phase: "start",
      progress: 0,
      totalChunks,
      totalElements,
    });
  }

  _handleSyncResponseChunk(message) {
    const { chunkIndex, pageId, elements, activeStrokes } =
      message.payload || {};

    // Accumulate chunk data
    this.syncChunks.push({
      chunkIndex,
      pageId,
      elements: elements || [],
      activeStrokes: activeStrokes || [],
    });

    const progress = (this.syncChunks.length / this.expectedChunkCount) * 100;
    console.log(
      `[CollabManager] Sync chunk ${chunkIndex + 1}/${this.expectedChunkCount}`
    );

    this.onSyncProgress?.({
      phase: "chunk",
      progress,
      chunkIndex,
      pageId,
      elementCount: elements?.length || 0,
    });

    // *** CRITICAL: Process active strokes for late join ***
    if (activeStrokes && activeStrokes.length > 0) {
      activeStrokes.forEach((stroke) => {
        this.activeStrokes.set(stroke.strokeId, stroke);
        // Notify UI to create ghost stroke
        this.onStrokeInit?.({
          strokeId: stroke.strokeId,
          pageId: stroke.pageId,
          userId: stroke.userId,
          tool: stroke.tool,
          color: stroke.color,
          points: stroke.points || [],
        });
      });
    }
  }

  _handleSyncResponseEnd(message) {
    const { version, seq, lockState } = message.payload || {};

    this.syncInProgress = false;
    this.serverVersion = version || this.serverVersion;
    this.lastProcessedSeq = seq || 0;
    this.seqInitialized = true; // 🔥 Mark seq as initialized after sync

    // Apply accumulated chunks to build document state
    const document = this._buildDocumentFromChunks(this.syncChunks);
    this.documentState = document;

    // Apply lock state
    if (lockState) {
      Object.entries(lockState).forEach(([elementId, lock]) => {
        this.elementLocks.set(elementId, lock);
      });
    }

    console.log(
      `[CollabManager] Sync complete: version=${version}, seq=${seq}`
    );

    this.onSyncProgress?.({
      phase: "end",
      progress: 100,
    });

    this.onSyncComplete?.({
      document,
      activeUsers: Array.from(this.activeUsers.values()),
      version,
    });

    // Clear chunks after processing
    this.syncChunks = [];
  }

  _buildDocumentFromChunks(chunks) {
    const pages = new Map();

    chunks.forEach((chunk) => {
      if (!pages.has(chunk.pageId)) {
        pages.set(chunk.pageId, {
          id: chunk.pageId,
          elements: [],
        });
      }

      const page = pages.get(chunk.pageId);
      page.elements.push(...chunk.elements);
    });

    return {
      pages: Array.from(pages.values()),
      version: this.serverVersion,
    };
  }

  _requestSync(fromVersion = 0) {
    this._sendEvent(EventTypes.SYNC_REQUEST, {
      fromVersion,
    });
  }

  // ===========================================================================
  // STROKE INIT HANDLER (Late Join)
  // ===========================================================================

  /**
   * *** CRITICAL: Handle STROKE_INIT for late joiners ***
   * When User B joins while User A is mid-stroke, server sends STROKE_INIT
   * so User B can see the partial stroke
   */
  _handleStrokeInit(message) {
    const { strokeId, pageId, userId, tool, color, strokeWidth, points } =
      message.payload || {};
    if (!strokeId) return;

    // Store in active strokes
    this.activeStrokes.set(strokeId, {
      strokeId,
      pageId,
      userId,
      tool,
      color,
      strokeWidth,
      points: this._decompressPoints(points) || [],
    });

    // Notify UI to create the partial stroke
    this.onStrokeInit?.({
      strokeId,
      pageId,
      userId,
      tool,
      color,
      strokeWidth,
      points: this._decompressPoints(points) || [],
      isLateJoin: true,
    });
  }

  // ===========================================================================
  // ELEMENT LOCKING HANDLERS
  // ===========================================================================

  /**
   * Handle lock notification from another user
   */
  _handleElementLock(message) {
    const { elementId, lockedBy, expiresAt, lockToken } = message.payload || {};
    if (!elementId) return;

    this.elementLocks.set(elementId, {
      lockedBy,
      expiresAt,
      lockToken,
    });

    this.onLockAcquired?.({
      elementId,
      lockedBy,
      expiresAt,
      userId: message.userId,
    });
  }

  /**
   * Handle lock granted response (for our own lock request)
   */
  _handleLockGranted(message) {
    const { elementId, lockToken, expiresAt } = message.payload || {};
    if (!elementId) return;

    // Store our lock
    this.elementLocks.set(elementId, {
      lockedBy: this.userId,
      expiresAt,
      lockToken,
    });

    // Resolve pending lock request
    const pending = this.pendingLockRequests.get(elementId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve({ elementId, lockToken, expiresAt });
      this.pendingLockRequests.delete(elementId);
    }
  }

  /**
   * Handle lock released notification
   */
  _handleLockReleased(message) {
    const { elementId } = message.payload || {};
    if (!elementId) return;

    this.elementLocks.delete(elementId);

    this.onLockReleased?.({
      elementId,
      userId: message.userId,
    });
  }

  /**
   * Handle lock rejected (element already locked by someone else)
   */
  _handleLockRejected(message) {
    const { elementId, reason, lockedBy } = message.payload || {};
    if (!elementId) return;

    // Reject pending lock request
    const pending = this.pendingLockRequests.get(elementId);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error(reason || "Lock rejected"));
      this.pendingLockRequests.delete(elementId);
    }

    this.onLockRejected?.({
      elementId,
      reason,
      lockedBy,
    });
  }

  /**
   * *** CRITICAL: Handle server rejection due to version conflict ***
   */
  _handleServerReject(message) {
    const { reason, expectedVersion, actualVersion, originalEvent } =
      message.payload || {};

    console.warn(`[CollabManager] Server rejected: ${reason}`, {
      expectedVersion,
      actualVersion,
    });

    this.onVersionConflict?.({
      reason,
      expectedVersion,
      actualVersion,
      originalEvent,
    });

    // If version mismatch, request full resync
    if (reason === "VERSION_MISMATCH" || reason === "STALE_CLIENT") {
      this._requestSync(0);
    }
  }

  /**
   * Cleanup expired locks
   */
  _cleanupExpiredLocks() {
    const now = Date.now();
    for (const [elementId, lock] of this.elementLocks) {
      if (lock.expiresAt && lock.expiresAt < now) {
        this.elementLocks.delete(elementId);
        this.onLockReleased?.({ elementId, expired: true });
      }
    }
  }

  // ===========================================================================
  // SEND METHODS (Public API)
  // ===========================================================================

  /**
   * Send element creation event
   * @param {string|number} pageId
   * @param {Object} element
   */
  sendElementCreate(pageId, element) {
    if (!this.connected) {
      this._queueOperation({
        type: EventTypes.ELEMENT_CREATE,
        pageId,
        element,
      });
      return;
    }

    this._sendEvent(EventTypes.ELEMENT_CREATE, {
      pageId,
      element: this._sanitizeElement(element),
    });
  }

  /**
   * Send element update event (throttled for drag operations)
   * @param {string|number} pageId
   * @param {string} elementId
   * @param {Object} changes
   * @param {Object} options
   */
  sendElementUpdate(pageId, elementId, changes, options = {}) {
    if (!this.connected) {
      this._queueOperation({
        type: EventTypes.ELEMENT_UPDATE,
        pageId,
        elementId,
        changes,
      });
      return;
    }

    if (
      options.throttle !== false &&
      (changes.x !== undefined || changes.y !== undefined)
    ) {
      // Throttle position updates
      this._sendPositionUpdate(pageId, elementId, changes, options.transient);
    } else {
      this._sendEvent(EventTypes.ELEMENT_UPDATE, {
        pageId,
        elementId,
        changes,
        transient: options.transient,
      });
    }
  }

  /**
   * Send element deletion event
   * @param {string|number} pageId
   * @param {string} elementId
   */
  sendElementDelete(pageId, elementId) {
    if (!this.connected) {
      this._queueOperation({
        type: EventTypes.ELEMENT_DELETE,
        pageId,
        elementId,
      });
      return;
    }

    this._sendEvent(EventTypes.ELEMENT_DELETE, {
      pageId,
      elementId,
    });
  }

  /**
   * Send stroke points (batched for performance)
   * Called frequently during drawing - handles batching internally
   * @param {string|number} pageId
   * @param {string} strokeId
   * @param {Array} points
   * @param {Object} strokeInit - Initial stroke properties (only for first batch)
   */
  sendStrokePoints(pageId, strokeId, points, strokeInit = null) {
    if (!this.connected || !points || points.length === 0) return;

    // Get or create batch for this stroke
    let batch = this.strokeBatches.get(strokeId);
    if (!batch) {
      batch = {
        pageId,
        strokeInit,
        points: [],
        timeout: null,
      };
      this.strokeBatches.set(strokeId, batch);
    }

    // Add points to batch
    batch.points.push(...points);

    // Clear existing timeout
    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }

    // Send if batch is full
    if (batch.points.length >= CONFIG.STROKE_BATCH_SIZE) {
      this._flushStrokeBatch(strokeId);
    } else {
      // Set timeout to flush partial batch
      batch.timeout = setTimeout(() => {
        this._flushStrokeBatch(strokeId);
      }, CONFIG.STROKE_BATCH_TIMEOUT);
    }
  }

  /**
   * Signal stroke drawing completed
   * @param {string|number} pageId
   * @param {string} strokeId
   */
  sendStrokeEnd(pageId, strokeId) {
    // Flush any remaining points
    this._flushStrokeBatch(strokeId);

    this._sendEvent(EventTypes.STROKE_END, {
      pageId,
      strokeId,
    });
  }

  /**
   * Send page creation event
   * @param {Object} page
   * @param {number} insertAt
   */
  sendPageCreate(page, insertAt = -1) {
    if (!this.connected) {
      this._queueOperation({ type: EventTypes.PAGE_CREATE, page, insertAt });
      return;
    }

    this._sendEvent(EventTypes.PAGE_CREATE, {
      page: this._sanitizePage(page),
      insertAt,
    });
  }

  /**
   * Send page update event
   * @param {string|number} pageId
   * @param {Object} changes
   */
  sendPageUpdate(pageId, changes) {
    if (!this.connected) {
      this._queueOperation({ type: EventTypes.PAGE_UPDATE, pageId, changes });
      return;
    }

    this._sendEvent(EventTypes.PAGE_UPDATE, {
      pageId,
      changes,
    });
  }

  /**
   * Send page deletion event
   * @param {string|number} pageId
   */
  sendPageDelete(pageId) {
    if (!this.connected) {
      this._queueOperation({ type: EventTypes.PAGE_DELETE, pageId });
      return;
    }

    this._sendEvent(EventTypes.PAGE_DELETE, {
      pageId,
    });
  }

  /**
   * Send page switch event (user navigated to different page)
   * @param {string|number} pageId
   */
  sendPageSwitch(pageId) {
    this.activePageId = pageId;

    if (!this.connected) return;

    this._sendEvent(EventTypes.PAGE_SWITCH, {
      pageId,
    });
  }

  /**
   * Send cursor position (throttled)
   * @param {number} x
   * @param {number} y
   */
  sendCursorPosition(x, y) {
    this._sendCursorUpdate(x, y);
  }

  // ===========================================================================
  // ELEMENT LOCKING (Public API)
  // ===========================================================================

  /**
   * *** CRITICAL: Request lock on an element before dragging/editing ***
   * @param {string} elementId
   * @param {string|number} pageId
   * @returns {Promise<{ elementId, lockToken, expiresAt }>}
   */
  async requestLock(elementId, pageId) {
    if (!this.connected) {
      throw new Error("Not connected");
    }

    // Check if already locked by someone else
    const existingLock = this.elementLocks.get(elementId);
    if (existingLock && existingLock.lockedBy !== this.userId) {
      if (existingLock.expiresAt > Date.now()) {
        throw new Error(`Element locked by user ${existingLock.lockedBy}`);
      }
    }

    // Check if we already have the lock
    if (existingLock && existingLock.lockedBy === this.userId) {
      return {
        elementId,
        lockToken: existingLock.lockToken,
        expiresAt: existingLock.expiresAt,
      };
    }

    // Send lock request and wait for response
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingLockRequests.delete(elementId);
        reject(new Error("Lock request timed out"));
      }, CONFIG.LOCK_REQUEST_TIMEOUT);

      this.pendingLockRequests.set(elementId, { resolve, reject, timeout });

      this._sendEvent("ELEMENT_LOCK_REQUEST", {
        pageId,
        elementId,
        requestedTtl: CONFIG.DEFAULT_LOCK_TTL,
      });
    });
  }

  /**
   * *** CRITICAL: Release lock on an element after drag/edit complete ***
   * @param {string} elementId
   */
  releaseLock(elementId) {
    const lock = this.elementLocks.get(elementId);
    if (!lock || lock.lockedBy !== this.userId) {
      return; // Don't have the lock
    }

    this.elementLocks.delete(elementId);

    if (this.connected) {
      this._sendEvent("ELEMENT_LOCK_RELEASE", {
        elementId,
        lockToken: lock.lockToken,
      });
    }
  }

  /**
   * Check if element is locked by another user
   * @param {string} elementId
   * @returns {{ locked: boolean, lockedBy?: string|number, expiresAt?: number }}
   */
  isElementLocked(elementId) {
    const lock = this.elementLocks.get(elementId);

    if (!lock) {
      return { locked: false };
    }

    // Check if expired
    if (lock.expiresAt && lock.expiresAt < Date.now()) {
      this.elementLocks.delete(elementId);
      return { locked: false };
    }

    // Locked by us is okay
    if (lock.lockedBy === this.userId) {
      return { locked: false, ownLock: true };
    }

    return {
      locked: true,
      lockedBy: lock.lockedBy,
      expiresAt: lock.expiresAt,
    };
  }

  // ===========================================================================
  // INTERNAL METHODS
  // ===========================================================================

  /**
   * Send event to server
   * *** CRITICAL: Now includes version and seq for ordering ***
   * *** ROUTE: /app/project/{projectId}/collaboration (NOT /action) ***
   */
  _sendEvent(type, payload) {
    // Increment local sequence
    this.localSeq++;

    const message = {
      type,
      projectId: this.projectId,
      userId: this.userId,
      timestamp: Date.now(),
      messageId: `${this.userId}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      // *** CRITICAL: Include version for server-side validation ***
      version: this.serverVersion,
      // *** CRITICAL: Include local seq for client-side ordering ***
      localSeq: this.localSeq,
      payload,
    };

    // *** ROUTE SEPARATED: Use /collaboration instead of /action ***
    // /action is used by CanvasController for strokes
    // /collaboration is used by CollaborationWebSocketController for everything else
    const destination = `/app/project/${this.projectId}/collaboration`;
    webSocketService.send(destination, message);
  }

  /**
   * Throttled position update
   */
  _sendPositionUpdateImmediate(pageId, elementId, changes, transient) {
    this._sendEvent(EventTypes.ELEMENT_UPDATE, {
      pageId,
      elementId,
      changes,
      transient,
    });
  }

  /**
   * Throttled cursor update
   */
  _sendCursorUpdateImmediate(x, y) {
    this._sendEvent(EventTypes.USER_CURSOR, {
      cursor: { x, y },
      pageId: this.activePageId,
    });
  }

  /**
   * Flush stroke batch
   */
  _flushStrokeBatch(strokeId) {
    const batch = this.strokeBatches.get(strokeId);
    if (!batch || batch.points.length === 0) return;

    // Clear timeout
    if (batch.timeout) {
      clearTimeout(batch.timeout);
      batch.timeout = null;
    }

    // Compress and send points
    const compressedPoints = this._compressPoints(batch.points);

    this._sendEvent(EventTypes.STROKE_APPEND, {
      pageId: batch.pageId,
      strokeId,
      points: compressedPoints,
      strokeInit: batch.strokeInit,
    });

    // Clear batch points but keep batch for more points
    batch.points = [];
    batch.strokeInit = null; // Only send init once
  }

  /**
   * Flush all pending stroke batches
   */
  _flushAllStrokeBatches() {
    this.strokeBatches.forEach((_, strokeId) => {
      this._flushStrokeBatch(strokeId);
    });
    this.strokeBatches.clear();
  }

  /**
   * Queue operation for when connection is restored
   */
  _queueOperation(operation) {
    if (this.pendingOperations.length >= CONFIG.MAX_PENDING_MESSAGES) {
      this.pendingOperations.shift(); // Remove oldest
    }
    this.pendingOperations.push({
      ...operation,
      timestamp: Date.now(),
    });
  }

  /**
   * Flush pending operations after reconnection
   */
  _flushPendingOperations() {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    operations.forEach((op) => {
      switch (op.type) {
        case EventTypes.ELEMENT_CREATE:
          this.sendElementCreate(op.pageId, op.element);
          break;
        case EventTypes.ELEMENT_UPDATE:
          this.sendElementUpdate(op.pageId, op.elementId, op.changes);
          break;
        case EventTypes.ELEMENT_DELETE:
          this.sendElementDelete(op.pageId, op.elementId);
          break;
        // ... handle other operation types
      }
    });
  }

  // ===========================================================================
  // COMPRESSION / DECOMPRESSION
  // ===========================================================================

  /**
   * Compress points using delta encoding
   */
  _compressPoints(points) {
    if (!Array.isArray(points) || points.length === 0) {
      return { compressed: true, data: [] };
    }

    // For short strokes, don't compress
    if (points.length < 10) {
      return {
        compressed: false,
        data: points.map((p) => [
          Math.round((p?.x || 0) * 100) / 100,
          Math.round((p?.y || 0) * 100) / 100,
        ]),
      };
    }

    // Delta encoding
    const firstPoint = points[0];
    const baseX = Math.round((firstPoint?.x || 0) * 100) / 100;
    const baseY = Math.round((firstPoint?.y || 0) * 100) / 100;

    const deltas = [];
    let prevX = baseX;
    let prevY = baseY;

    for (let i = 1; i < points.length; i++) {
      const currX = Math.round((points[i]?.x || 0) * 100) / 100;
      const currY = Math.round((points[i]?.y || 0) * 100) / 100;
      deltas.push(Math.round((currX - prevX) * 100));
      deltas.push(Math.round((currY - prevY) * 100));
      prevX = currX;
      prevY = currY;
    }

    return {
      compressed: true,
      base: [baseX, baseY],
      deltas,
    };
  }

  /**
   * Decompress points
   */
  _decompressPoints(data) {
    if (!data) return [];

    // Uncompressed format
    if (!data.compressed) {
      return (data.data || []).map((p) =>
        Array.isArray(p) ? { x: p[0], y: p[1] } : p
      );
    }

    // Empty data
    if (!data.base || !data.deltas) {
      return (data.data || []).map((p) =>
        Array.isArray(p) ? { x: p[0], y: p[1] } : p
      );
    }

    // Decompress deltas
    const points = [{ x: data.base[0], y: data.base[1] }];
    let currX = data.base[0];
    let currY = data.base[1];

    for (let i = 0; i < data.deltas.length; i += 2) {
      currX += data.deltas[i] / 100;
      currY += data.deltas[i + 1] / 100;
      points.push({ x: currX, y: currY });
    }

    return points;
  }

  // ===========================================================================
  // SANITIZATION
  // ===========================================================================

  /**
   * Sanitize element for transmission
   */
  _sanitizeElement(element) {
    if (!element) return null;

    const clean = {
      id: element.id,
      type: element.type,
      tool: element.tool,
    };

    // Only include non-default values
    if (element.x != null) clean.x = element.x;
    if (element.y != null) clean.y = element.y;
    if (element.width != null) clean.width = element.width;
    if (element.height != null) clean.height = element.height;
    if (element.rotation && element.rotation !== 0)
      clean.rotation = element.rotation;
    if (element.opacity != null && element.opacity !== 1)
      clean.opacity = element.opacity;
    if (element.color) clean.color = element.color;
    if (element.layerId) clean.layerId = element.layerId;
    if (element.text) clean.text = element.text;
    if (element.fontSize) clean.fontSize = element.fontSize;
    if (element.uri) clean.uri = element.uri;
    if (element.shape) clean.shape = element.shape;
    if (element.fill) clean.fill = element.fill;
    if (element.fillColor) clean.fillColor = element.fillColor;

    // 🔥 Additional shape-related properties
    if (element.shapeSettings) clean.shapeSettings = element.shapeSettings;
    if (element.tapeSettings) clean.tapeSettings = element.tapeSettings;
    if (element.sides) clean.sides = element.sides;
    if (element.pressure != null) clean.pressure = element.pressure;
    if (element.thickness != null) clean.thickness = element.thickness;
    if (element.stabilization != null)
      clean.stabilization = element.stabilization;

    // Compress points if present
    if (element.points && element.points.length > 0) {
      clean.points = this._compressPoints(element.points);
    }

    return clean;
  }

  /**
   * Sanitize page for transmission
   */
  _sanitizePage(page) {
    if (!page) return null;

    return {
      id: page.id,
      pageNumber: page.pageNumber,
      type: page.type,
      backgroundColor: page.backgroundColor,
      template: page.template,
      backgroundImageUrl: page.backgroundImageUrl,
      // Don't send layers/elements in page create - they're synced separately
    };
  }

  /**
   * Cleanup old message IDs to prevent memory leak
   */
  _cleanupMessageIds() {
    // Keep last 1000 message IDs or clear if too many
    if (this.processedMessageIds.size > 1000) {
      this.processedMessageIds.clear();
    }
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  /**
   * Get list of active users
   */
  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  /**
   * Get current connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get current document version (server-authoritative)
   */
  getVersion() {
    return this.serverVersion;
  }

  /**
   * Get last processed sequence number
   */
  getLastProcessedSeq() {
    return this.lastProcessedSeq;
  }

  /**
   * Get all current locks
   */
  getAllLocks() {
    return Object.fromEntries(this.elementLocks);
  }

  /**
   * Get active strokes (for late join recovery)
   */
  getActiveStrokes() {
    return Array.from(this.activeStrokes.values());
  }

  /**
   * Check if sync is currently in progress
   */
  isSyncing() {
    return this.syncInProgress;
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const collaborationManager = new CollaborationManager();
export default collaborationManager;
