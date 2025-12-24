/**
 * =============================================================================
 * useCollaboration Hook
 * =============================================================================
 * 
 * React hook for integrating real-time collaboration into drawing components.
 * Manages connection lifecycle, event handling, and state synchronization.
 * 
 * IMPORTANT: This hook works alongside existing stroke sync - it doesn't replace it.
 * 
 * *** CRITICAL FEATURES ***
 * - Server-authoritative versioning
 * - Element locking for concurrent edits
 * - Chunked sync for large documents
 * - Late join stroke handling (STROKE_INIT)
 * - Message sequence ordering
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { collaborationManager } from '../service/collaborationManager';
import { EventTypes, ElementTypes } from '../types/collaboration.types';

/**
 * Hook configuration options
 * @typedef {Object} UseCollaborationOptions
 * @property {string|number} projectId - Project ID to connect to
 * @property {string|number} userId - Current user ID
 * @property {string} [userName] - User's display name
 * @property {string} [avatarUrl] - User's avatar URL
 * @property {boolean} [enabled=true] - Whether collaboration is enabled
 * @property {Function} [onElementCreate] - Called when remote user creates element
 * @property {Function} [onElementUpdate] - Called when remote user updates element
 * @property {Function} [onElementDelete] - Called when remote user deletes element
 * @property {Function} [onStrokeAppend] - Called when remote user appends stroke points
 * @property {Function} [onStrokeInit] - *** CRITICAL: Called for late-join partial strokes ***
 * @property {Function} [onPageCreate] - Called when remote user creates page
 * @property {Function} [onPageUpdate] - Called when remote user updates page
 * @property {Function} [onPageDelete] - Called when remote user deletes page
 * @property {Function} [onUserJoin] - Called when user joins session
 * @property {Function} [onUserLeave] - Called when user leaves session
 * @property {Function} [onSyncComplete] - Called when initial sync completes
 * @property {Function} [onSyncProgress] - *** CRITICAL: Called during chunked sync ***
 * @property {Function} [onLockAcquired] - *** CRITICAL: Called when element is locked ***
 * @property {Function} [onLockReleased] - Called when element lock is released
 * @property {Function} [onLockRejected] - Called when lock request is rejected
 * @property {Function} [onVersionConflict] - *** CRITICAL: Called on server rejection ***
 */

/**
 * Real-time collaboration hook
 * @param {UseCollaborationOptions} options 
 */
export function useCollaboration(options) {
  const {
    projectId,
    userId,
    userName,
    avatarUrl,
    enabled = true,
    onElementCreate,
    onElementUpdate,
    onElementDelete,
    onStrokeAppend,
    onStrokeInit,       // *** NEW: Late join ***
    onPageCreate,
    onPageUpdate,
    onPageDelete,
    onUserJoin,
    onUserLeave,
    onSyncComplete,
    onSyncProgress,     // *** NEW: Chunked sync ***
    onLockAcquired,     // *** NEW: Locking ***
    onLockReleased,
    onLockRejected,
    onVersionConflict,  // *** NEW: Server rejection ***
  } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [serverVersion, setServerVersion] = useState(0);

  // *** CRITICAL: Track element locks ***
  const [elementLocks, setElementLocks] = useState({});

  // Refs to hold latest callbacks (avoid stale closures)
  const callbacksRef = useRef({});

  useEffect(() => {
    callbacksRef.current = {
      onElementCreate,
      onElementUpdate,
      onElementDelete,
      onStrokeAppend,
      onStrokeInit,
      onPageCreate,
      onPageUpdate,
      onPageDelete,
      onUserJoin,
      onUserLeave,
      onSyncComplete,
      onSyncProgress,
      onLockAcquired,
      onLockReleased,
      onLockRejected,
      onVersionConflict,
    };
  });

  // Connect/disconnect based on enabled state and IDs
  useEffect(() => {
    if (!enabled || !projectId || !userId) {
      if (collaborationManager.isConnected()) {
        collaborationManager.disconnect();
      }
      setIsConnected(false);
      return;
    }

    // Setup callbacks
    collaborationManager.onElementCreate = (data) => {
      callbacksRef.current.onElementCreate?.(data);
    };

    collaborationManager.onElementUpdate = (data) => {
      callbacksRef.current.onElementUpdate?.(data);
    };

    collaborationManager.onElementDelete = (data) => {
      callbacksRef.current.onElementDelete?.(data);
    };

    collaborationManager.onStrokeAppend = (data) => {
      callbacksRef.current.onStrokeAppend?.(data);
    };

    // *** CRITICAL: Late join stroke initialization ***
    collaborationManager.onStrokeInit = (data) => {
      callbacksRef.current.onStrokeInit?.(data);
    };

    collaborationManager.onStrokeEnd = (data) => {
      // Stroke end can trigger finalization logic if needed
    };

    collaborationManager.onPageCreate = (data) => {
      callbacksRef.current.onPageCreate?.(data);
    };

    collaborationManager.onPageUpdate = (data) => {
      callbacksRef.current.onPageUpdate?.(data);
    };

    collaborationManager.onPageDelete = (data) => {
      callbacksRef.current.onPageDelete?.(data);
    };

    collaborationManager.onUserJoin = (user) => {
      setActiveUsers(collaborationManager.getActiveUsers());
      callbacksRef.current.onUserJoin?.(user);
    };

    collaborationManager.onUserLeave = (leftUserId) => {
      setActiveUsers(collaborationManager.getActiveUsers());
      callbacksRef.current.onUserLeave?.(leftUserId);
    };

    // *** CRITICAL: Chunked sync progress ***
    collaborationManager.onSyncProgress = (data) => {
      if (data.phase === 'start') {
        setIsSyncing(true);
        setSyncProgress(0);
      } else if (data.phase === 'chunk') {
        setSyncProgress(data.progress);
      } else if (data.phase === 'end') {
        setSyncProgress(100);
      }
      callbacksRef.current.onSyncProgress?.(data);
    };

    collaborationManager.onSyncComplete = (data) => {
      setIsSyncing(false);
      setSyncProgress(100);
      setActiveUsers(data.activeUsers || []);
      setServerVersion(data.version || 0);
      callbacksRef.current.onSyncComplete?.(data);
    };

    // *** CRITICAL: Element locking callbacks ***
    collaborationManager.onLockAcquired = (data) => {
      setElementLocks(collaborationManager.getAllLocks());
      callbacksRef.current.onLockAcquired?.(data);
    };

    collaborationManager.onLockReleased = (data) => {
      setElementLocks(collaborationManager.getAllLocks());
      callbacksRef.current.onLockReleased?.(data);
    };

    collaborationManager.onLockRejected = (data) => {
      callbacksRef.current.onLockRejected?.(data);
    };

    // *** CRITICAL: Version conflict handling ***
    collaborationManager.onVersionConflict = (data) => {
      setServerVersion(collaborationManager.getVersion());
      callbacksRef.current.onVersionConflict?.(data);
    };

    // Connect
    setIsSyncing(true);
    collaborationManager.connect(projectId, userId, {
      userName,
      avatarUrl,
    }).then(() => {
      setIsConnected(true);
    }).catch((error) => {
      console.warn('[useCollaboration] Connection failed:', error);
      setIsConnected(false);
      setIsSyncing(false);
    });

    // Cleanup on unmount or dependency change
    return () => {
      collaborationManager.disconnect();
      setIsConnected(false);
    };
  }, [enabled, projectId, userId, userName, avatarUrl]);

  // ===========================================================================
  // SEND METHODS
  // ===========================================================================

  /**
   * Create a new element (shape, image, text, etc.)
   */
  const createElement = useCallback((pageId, element) => {
    collaborationManager.sendElementCreate(pageId, element);
  }, []);

  /**
   * Update an element (position, size, properties)
   * @param {Object} options - { throttle: boolean, transient: boolean }
   */
  const updateElement = useCallback((pageId, elementId, changes, options = {}) => {
    collaborationManager.sendElementUpdate(pageId, elementId, changes, options);
  }, []);

  /**
   * Delete an element
   */
  const deleteElement = useCallback((pageId, elementId) => {
    collaborationManager.sendElementDelete(pageId, elementId);
  }, []);

  /**
   * Send stroke points during drawing
   * This is called frequently - internal batching handles optimization
   */
  const sendStrokePoints = useCallback((pageId, strokeId, points, strokeInit = null) => {
    collaborationManager.sendStrokePoints(pageId, strokeId, points, strokeInit);
  }, []);

  /**
   * Signal stroke drawing completed
   */
  const endStroke = useCallback((pageId, strokeId) => {
    collaborationManager.sendStrokeEnd(pageId, strokeId);
  }, []);

  /**
   * Create a new page
   */
  const createPage = useCallback((page, insertAt = -1) => {
    collaborationManager.sendPageCreate(page, insertAt);
  }, []);

  /**
   * Update page properties
   */
  const updatePage = useCallback((pageId, changes) => {
    collaborationManager.sendPageUpdate(pageId, changes);
  }, []);

  /**
   * Delete a page
   */
  const deletePage = useCallback((pageId) => {
    collaborationManager.sendPageDelete(pageId);
  }, []);

  /**
   * Switch to a different page
   */
  const switchPage = useCallback((pageId) => {
    collaborationManager.sendPageSwitch(pageId);
  }, []);

  /**
   * Send cursor position (for showing other users' cursors)
   */
  const sendCursor = useCallback((x, y) => {
    collaborationManager.sendCursorPosition(x, y);
  }, []);

  // ===========================================================================
  // ELEMENT LOCKING (CRITICAL)
  // ===========================================================================

  /**
   * *** CRITICAL: Request lock on an element before drag/edit ***
   * Must be called before allowing user to drag/resize an element
   * @param {string} elementId 
   * @param {string|number} pageId
   * @returns {Promise<{ elementId, lockToken, expiresAt }>}
   */
  const requestLock = useCallback(async (elementId, pageId) => {
    return collaborationManager.requestLock(elementId, pageId);
  }, []);

  /**
   * *** CRITICAL: Release lock after drag/edit complete ***
   * Must be called when user finishes dragging/editing
   * @param {string} elementId 
   */
  const releaseLock = useCallback((elementId) => {
    collaborationManager.releaseLock(elementId);
  }, []);

  /**
   * Check if element is locked by another user
   * @param {string} elementId 
   * @returns {{ locked: boolean, lockedBy?: string|number }}
   */
  const isElementLocked = useCallback((elementId) => {
    return collaborationManager.isElementLocked(elementId);
  }, []);

  return {
    // State
    isConnected,
    activeUsers,
    isSyncing,
    syncProgress,       // *** NEW: For chunked sync progress UI ***
    serverVersion,      // *** NEW: Server-authoritative version ***
    elementLocks,       // *** NEW: Current lock state ***

    // Element operations
    createElement,
    updateElement,
    deleteElement,

    // Stroke operations (for real-time drawing)
    sendStrokePoints,
    endStroke,

    // Page operations
    createPage,
    updatePage,
    deletePage,
    switchPage,

    // Cursor
    sendCursor,

    // *** CRITICAL: Locking operations ***
    requestLock,
    releaseLock,
    isElementLocked,
  };
}

export default useCollaboration;
