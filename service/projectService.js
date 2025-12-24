import { projectAPIController } from "../api/projectAPIController";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client as StompClient } from "@stomp/stompjs";
import * as FileSystem from "expo-file-system";
import { parseJsonInBackground } from "../utils/jsonUtils";
import * as offlineStorage from "../utils/offlineStorage";
import NetInfo from "@react-native-community/netinfo";
// ❌ Removed SockJS - using native WebSocket instead

const getPageLocalKey = (projectId, pageNumber) =>
  `${projectId}_page_${pageNumber}`;

export const projectService = {
  /**
   * Uploads a generic asset (like an image for the canvas) to cloud storage.
   */
  uploadAsset: async (fileUri, mimeType = "image/jpeg") => {
    try {
      const fileExtension = mimeType.split("/")[1] || "jpg";
      const fileName = `asset_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExtension}`;

      // Lấy URL upload tạm từ backend
      const { uploadUrl } = await projectService.getPresign(fileName, mimeType);

      // ✅ Dùng API mới: FileSystem.File().upload()
      const file = FileSystem.File(fileUri);
      const response = await file.upload(uploadUrl, {
        httpMethod: "PUT",
        headers: { "Content-Type": mimeType },
      });

      if (response.status !== 200) {
        throw new Error(
          `Asset upload failed with status ${response.status}: ${response.body}`
        );
      }

      // Trả về URL thật (bỏ phần query)
      return uploadUrl.split("?")[0];
    } catch (error) {
      console.warn("❌ Failed to upload asset:", error);
      throw error;
    }
  },

  /**
   * Uploads a single page's data object to S3 and returns the page number and final URL.
   * This function does NOT call the createPage API.
   */
  uploadPageToS3: async (projectId, pageNumber, dataObject) => {
    const fileName = `${projectId}_page_${pageNumber}_${Date.now()}.json`;

    const presignData = await projectService.getPresign(fileName, "JSON");

    await projectService.uploadToPresignedUrl(
      dataObject,
      presignData.uploadUrl
    );

    // Use strokeUrl provided by backend (may be signed or proxied for GET)
    const getUrl = presignData.strokeUrl;
    return { pageNumber, url: getUrl };
  },

  /**
   * Creates/updates pages for a project in the database by sending a list of pages.
   * This is the final step of the save process.
   */
  createPage: async (pageData) => {
    try {
      const response = await projectAPIController.createPage(pageData);
      if (response?.data?.result) {
        return response.data.result;
      }
      throw new Error("Invalid response from createPage API");
    } catch (err) {
      console.warn("❌ Failed to create/update pages in DB:", err);
      throw err;
    }
  },

  /**
   * Loads a single page's data. Supports remote-first for collab sessions.
   */
  loadPageData: async (projectId, pageNumber, remoteUrl, options = {}) => {
    const localKey = getPageLocalKey(projectId, pageNumber);
    const preferRemote = options.preferRemote === true;
    const skipLocal = options.skipLocal === true;

    // Helper to fetch with retry on 403
    const fetchWithRetry = async (url) => {
      try {
        return await projectService.getProjectFile(url, options);
      } catch (error) {
        // Check if error is 403 (Access Denied)
        const is403 =
          error.message?.includes("403") ||
          error.message?.includes("Access Denied");

        if (is403 && url) {
          try {
            // Extract filename from URL (assuming it's the last part of the path)
            // Example: .../projectId_page_1_timestamp.json?...
            const fileName = decodeURIComponent(
              url.split("?")[0].split("/").pop()
            );

            if (fileName) {
              const presignData = await projectService.getPresign(
                fileName,
                "JSON"
              );
              if (presignData?.strokeUrl) {
                // Retry with new URL
                return await projectService.getProjectFile(
                  presignData.strokeUrl,
                  options
                );
              }
            }
          } catch (refreshError) {
            console.warn("❌ [Service] Failed to refresh URL:", refreshError);
          }
        }
        throw error;
      }
    };

    try {
      if (preferRemote) {
        const remoteData = await fetchWithRetry(remoteUrl);
        if (remoteData) {
          try {
            await offlineStorage.saveProjectPageLocally(
              projectId,
              pageNumber,
              remoteData
            );
          } catch {}
        }
        return remoteData;
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        console.warn(
          `[Service] Remote load failed for page ${pageNumber}:`,
          e?.message || e
        );
      }
    }

    if (!skipLocal) {
      const localData = await offlineStorage.loadProjectPageLocally(
        projectId,
        pageNumber
      );
      if (localData) {
        return localData;
      }
    }

    try {
      const remoteData = await fetchWithRetry(remoteUrl);
      if (remoteData) {
        try {
          await offlineStorage.saveProjectPageLocally(
            projectId,
            pageNumber,
            remoteData
          );
        } catch {}
      }
      return remoteData;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn(
          `❌ Failed to load page ${pageNumber} from both cache and server.`,
          error
        );
      }
      return null;
    }
  },

  syncPendingPages: async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      return;
    }

    const pendingKeys = await offlineStorage.getProjectsToSync();
    if (!pendingKeys || pendingKeys.length === 0) {
      return;
    }

    // 1. Group keys by projectId
    const pagesByProject = pendingKeys.reduce((acc, key) => {
      const projectId = key.split("_")[0];
      if (projectId) {
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push(key);
      }
      return acc;
    }, {});

    // 2. Process each project
    for (const projectId in pagesByProject) {
      try {
        const projectKeys = pagesByProject[projectId];

        // 3. Fetch the project's current state from the server
        const remoteProject = await projectService.getProjectById(projectId);
        const remotePagesMap = new Map(
          (remoteProject?.pages || []).map((p) => [p.pageNumber, p])
        );

        // 4. Process pages in batches to save memory
        const BATCH_SIZE = 2;
        const processedKeys = [];

        for (let i = 0; i < projectKeys.length; i += BATCH_SIZE) {
          const batchKeys = projectKeys.slice(i, i + BATCH_SIZE);
          const localPagesData = [];

          // Load data for this batch only
          for (const key of batchKeys) {
            try {
              const pageNumber = parseInt(key.split("_")[2], 10);
              const pageData = await offlineStorage.loadProjectPageLocally(
                projectId,
                pageNumber
              );
              if (pageData && !isNaN(pageNumber)) {
                localPagesData.push({ pageNumber, dataObject: pageData });
              }
              processedKeys.push(key);
            } catch (err) {
              console.warn(`Failed to load local data for ${key}`, err);
            }
          }

          if (localPagesData.length === 0) continue;

          // 5. Upload pending pages to S3 (Batch)
          const uploadPromises = localPagesData.map((p) =>
            projectService.uploadPageToS3(projectId, p.pageNumber, p.dataObject)
          );

          try {
            const uploadedPages = await Promise.all(uploadPromises);

            // 6. Merge remote pages with newly uploaded pages
            uploadedPages.forEach((uploadedPage) => {
              remotePagesMap.set(uploadedPage.pageNumber, {
                pageNumber: uploadedPage.pageNumber,
                strokeUrl: uploadedPage.url,
              });
            });
          } catch (uploadErr) {
            console.warn(
              `Failed to upload batch for project ${projectId}`,
              uploadErr
            );
            // Continue to next batch? Or stop?
            // If upload fails, we shouldn't update remotePagesMap for these pages.
          }

          // Explicitly clear data to free memory
          localPagesData.length = 0;
        }

        const finalPagesList = Array.from(remotePagesMap.values());
        // 7. Call the final batch update API
        const payload = {
          projectId: projectId,
          pages: finalPagesList,
        };
        await projectService.createPage(payload);

        // 8. Clean up the sync queue for this project
        for (const key of processedKeys) {
          await offlineStorage.removeProjectFromSyncQueue(key);
        }
      } catch (error) {
        console.warn(`❌ FAILED to sync project ${projectId}:`, error);
        // Don't remove from queue if sync fails, it will be retried next time.
      }
    }
  },

  // ====================================================================
  // HELPER AND OTHER ORIGINAL FUNCTIONS
  // ====================================================================

  getUserProjects: async () => {
    try {
      const response = await projectAPIController.getUserProjects();
      if (response?.data?.result?.projects) {
        return response.data.result.projects;
      }
      return [];
    } catch (error) {
      console.warn("Error in getUserProjects:", error);
      throw error;
    }
  },
  getUserProjectsPaged: async (pageNo = 0, pageSize = 8) => {
    try {
      const response = await projectAPIController.getUserProjectsPaged(
        pageNo,
        pageSize
      );
      const r = response?.data?.result ?? response?.data ?? {};
      const content = Array.isArray(r?.projects)
        ? r.projects
        : Array.isArray(r?.content)
        ? r.content
        : [];
      const totalElements =
        r?.totalElements ??
        r?.page?.totalElements ??
        r?.pagination?.total ??
        content.length;
      const totalPages =
        r?.totalPages ??
        r?.page?.totalPages ??
        r?.pagination?.totalPages ??
        Math.max(1, Math.ceil(totalElements / pageSize));
      const currentPage =
        r?.pageNo ?? r?.pageNumber ?? r?.page?.number ?? pageNo;
      return {
        content,
        totalElements,
        totalPages,
        pageNo: currentPage,
        pageSize,
      };
    } catch (error) {
      console.warn("Error in getUserProjectsPaged:", error);
      throw error;
    }
  },

  getSharedProjects: async () => {
    try {
      const response = await projectAPIController.getSharedProjects();
      if (response?.data?.result?.projects) {
        return response.data.result.projects;
      }
      return [];
    } catch (error) {
      console.warn("Error in getSharedProjects:", error);
      throw error;
    }
  },

  getPresign: async (fileName, contentType = "JSON") => {
    try {
      const response = await projectAPIController.getPresign(
        fileName,
        contentType
      );
      const result = response?.data?.result;
      if (!result?.uploadUrl || !result?.strokeUrl) {
        throw new Error("Invalid presign response");
      }
      return result;
    } catch (err) {
      console.warn("❌ Failed to get presign URL:", err);
      throw err;
    }
  },

  uploadToPresignedUrl: async (dataObject, presignedUrl) => {
    try {
      const uploadContentType = "application/json";
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadContentType },
        body: JSON.stringify(dataObject),
      });
      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`Upload failed: ${putRes.status} - ${errText}`);
      }
      return presignedUrl.split("?")[0];
    } catch (err) {
      console.warn(`❌ Failed to upload to presigned URL:`, err);
      throw err;
    }
  },

  getProjectFile: async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: options.signal, // Pass signal to fetch
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      const text = await res.text();
      return await parseJsonInBackground(text);
    } catch (err) {
      if (err.name === "AbortError") {
      } else {
        console.warn("❌ Error loading JSON:", err);
      }
      throw err; // Re-throw so the caller can handle it
    }
  },

  createProject: async (projectData) => {
    try {
      const response = await projectAPIController.createProject(projectData);
      if (response?.data?.result) {
        return response.data.result;
      }
      throw new Error("Invalid response from server");
    } catch (err) {
      console.warn("❌ Failed to create project:", err);
      throw err;
    }
  },
  updateProject: async (projectId, projectData) => {
    try {
      const response = await projectAPIController.updateProject(
        projectId,
        projectData
      );
      if (response?.data?.result) {
        return response.data.result;
      }
      throw new Error("Update failed");
    } catch (err) {
      console.warn("Failed to update project:", err);
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const response = await projectAPIController.deleteProject(projectId);
      if (response?.data?.code === 200 || response?.status === 200) {
        return { success: true };
      }
      throw new Error("Delete failed");
    } catch (err) {
      console.warn("Failed to delete project:", err);
      throw err;
    }
  },
  getProjectById: async (projectId) => {
    try {
      const response = await projectAPIController.getProjectById(projectId);
      if (response?.data?.result) {
        return response.data.result;
      }
      throw new Error("Invalid response from server");
    } catch (err) {
      console.warn("❌ Failed to get project by ID:", err);
      throw err;
    }
  },

  inviteCollaborator: async (projectId, userId, edited = true) => {
    try {
      const response = await projectAPIController.inviteCollaborator({
        projectId,
        userId,
        edited,
      });
      return response?.data?.result;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Invite failed";
      throw new Error(message);
    }
  },

  updateCollaboratorPermission: async (projectId, email, edited = true) => {
    try {
      const response = await projectAPIController.updateCollaboratorPermission({
        projectId,
        email,
        edited,
      });
      return response?.data?.result;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Update permission failed";
      throw new Error(message);
    }
  },

  realtime: (() => {
    let socket = null;
    let isConnected = false;
    let activeProjectId = null;
    let onMessageCb = null;
    let heartbeatTimer = null;
    let pendingQueue = [];
    let stompClient = null;
    let activeSubscription = null; // ✅ FIXED: Track subscription for cleanup

    const buildFrame = (command, headers = {}, body = "") => {
      const lines = [command];
      Object.keys(headers).forEach((k) => {
        const v = headers[k] != null ? String(headers[k]) : "";
        lines.push(`${k}:${v}`);
      });
      lines.push("");
      lines.push(body);
      return lines.join("\n") + "\0";
    };

    const parseFrame = (data) => {
      if (typeof data !== "string") return null;
      const nulIdx = data.indexOf("\0");
      const raw = nulIdx >= 0 ? data.slice(0, nulIdx) : data;
      const parts = raw.split("\n\n");
      const headerPart = parts[0] || "";
      const body = parts[1] || "";
      const headerLines = headerPart.split("\n");
      const command = headerLines.shift() || "";
      const headers = {};
      headerLines.forEach((line) => {
        const idx = line.indexOf(":");
        if (idx > 0) headers[line.slice(0, idx)] = line.slice(idx + 1);
      });
      return { command, headers, body };
    };

    const connect = async (projectId, userId, onMessage) => {
      try {
        if (isConnected && activeProjectId === projectId) {
          return true;
        }

        activeProjectId = projectId;
        onMessageCb = onMessage;

        // ✅ Use native WebSocket with wss:// protocol
        const wsUrl = "wss://sketchnote.litecsys.com/ws";

        const token = await AsyncStorage.getItem("accessToken");

        stompClient = new StompClient({
          // ✅ Use brokerURL for native WebSocket (not webSocketFactory)
          brokerURL: wsUrl,

          // ✅ Force use WebSocket for React Native compatibility
          webSocketFactory: () => {
            return new WebSocket(wsUrl);
          },

          debug: (str) => {},

          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          // ✅ Critical for React Native + StompJS v7
          forceBinaryWSFrames: true,
          appendMissingNULLonIncoming: true,

          connectHeaders: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,

          beforeConnect: () => {},

          onConnect: (frame) => {
            isConnected = true;

            // *** ROUTE SEPARATED: Subscribe to stroke topic only ***
            // Stroke drawing messages go to /topic/project/{projectId}/stroke
            // Collaboration messages (element, page, sync) go to /topic/project/{projectId}/collaboration
            // This projectService handles stroke sync; collaborationManager handles the rest
            const topicPath = `/topic/project/${projectId}/stroke`;

            // ✅ FIXED: Store subscription for cleanup
            activeSubscription = stompClient.subscribe(topicPath, (message) => {
              try {
                const json = JSON.parse(message.body || "{}");
                if (typeof onMessageCb === "function") {
                  onMessageCb(json);
                }
              } catch (err) {
                console.error("❌ [Realtime] Error processing message:", err);
              }
            });

            // Flush pending queue
            if (pendingQueue.length > 0) {
              pendingQueue.forEach((f) => {
                try {
                  const parsed = parseFrame(f);
                  if (parsed?.command === "SEND") {
                    stompClient.publish({
                      destination: parsed.headers?.destination,
                      body: parsed.body || "",
                      headers: { "content-type": "application/json" },
                    });
                  }
                } catch (err) {
                  console.error("❌ [Realtime] Error flushing message:", err);
                }
              });
              pendingQueue = [];
            }
          },

          onWebSocketError: (e) => {
            console.error("❌❌❌ [Realtime] WebSocket ERROR ❌❌❌", e);
          },

          onStompError: (frame) => {
            console.error("❌❌❌ [Realtime] STOMP ERROR ❌❌❌", frame);
          },

          onWebSocketClose: (e) => {
            isConnected = false;
            activeProjectId = null;
            activeSubscription = null; // ✅ Clear subscription reference
          },
        });

        stompClient.activate();

        return true;
      } catch (err) {
        console.error("❌❌❌ [Realtime] CONNECT ERROR ❌❌❌", err);
        throw err;
      }
    };

    const disconnect = () => {
      try {
        // ✅ FIXED: Unsubscribe before deactivating
        if (activeSubscription) {
          try {
            activeSubscription.unsubscribe();
          } catch (err) {
            console.warn("⚠️ [Realtime] Error unsubscribing:", err);
          }
          activeSubscription = null;
        }

        // ✅ Deactivate STOMP client
        if (stompClient) {
          try {
            stompClient.deactivate();
          } catch (err) {
            console.warn("⚠️ [Realtime] Error deactivating STOMP:", err);
          }
          stompClient = null;
        }
      } finally {
        // ✅ Clear heartbeat timer
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }

        // ✅ Close underlying WebSocket if still open
        try {
          socket?.close?.();
        } catch (err) {
          console.warn("⚠️ [Realtime] Error closing socket:", err);
        }
        socket = null;

        // ✅ Reset state
        isConnected = false;
        activeProjectId = null;
        onMessageCb = null;

        // ✅ FIXED: Clear pending queue properly
        pendingQueue.length = 0;
        pendingQueue = [];
      }
    };

    const sendAction = (projectId, userId, actionType, payload = {}) => {
      try {
        const body = JSON.stringify({
          projectId,
          userId,
          type: actionType,
          payload: payload,
        });
        // *** ROUTE SEPARATED: Use /stroke for drawing actions ***
        // /stroke → CanvasController (stroke drawing)
        // /collaboration → CollaborationWebSocketController (element, page, sync)
        const destination = `/app/project/${projectId}/stroke`;
        const frame = buildFrame(
          "SEND",
          { destination, "content-type": "application/json" },
          body
        );
        if (stompClient && stompClient.active) {
          stompClient.publish({
            destination,
            body,
            headers: { "content-type": "application/json" },
          });
        } else {
          pendingQueue.push(frame);
        }
      } catch {}
    };

    const sendDraw = (projectId, userId, tool, points = []) => {
      const pts = Array.isArray(points)
        ? points.map((p) => (Array.isArray(p) ? p : [p.x, p.y]))
        : [];
      sendAction(projectId, userId, "DRAW", { tool, points: pts });
    };

    /**
     * Compress points using delta encoding to reduce payload size
     * Instead of sending full coordinates, send deltas from first point
     * @param {Array} points - Array of point objects with x, y
     * @returns {Object} Compressed points data
     */
    const compressPoints = (points) => {
      if (!Array.isArray(points) || points.length === 0) {
        return { compressed: true, data: [] };
      }

      // For very short strokes (< 10 points), don't compress
      if (points.length < 10) {
        return {
          compressed: false,
          data: points.map((p) => [
            Math.round((p?.x || 0) * 100) / 100,
            Math.round((p?.y || 0) * 100) / 100,
          ]),
        };
      }

      // Delta encoding: store first point as base, then deltas
      const firstPoint = points[0];
      const baseX = Math.round((firstPoint?.x || 0) * 100) / 100;
      const baseY = Math.round((firstPoint?.y || 0) * 100) / 100;

      // Store deltas as integers (multiply by 100 for 2 decimal precision)
      const deltas = [];
      let prevX = baseX;
      let prevY = baseY;

      for (let i = 1; i < points.length; i++) {
        const currX = Math.round((points[i]?.x || 0) * 100) / 100;
        const currY = Math.round((points[i]?.y || 0) * 100) / 100;
        // Store delta * 100 as integer for smaller JSON
        deltas.push(Math.round((currX - prevX) * 100));
        deltas.push(Math.round((currY - prevY) * 100));
        prevX = currX;
        prevY = currY;
      }

      return {
        compressed: true,
        base: [baseX, baseY],
        deltas: deltas, // Flat array of [dx1, dy1, dx2, dy2, ...]
      };
    };

    /**
     * Send stroke data via WebSocket with optimized payload
     * Removed duplicate data to reduce message size significantly
     */
    const sendStroke = (
      projectId,
      userId,
      pageId,
      stroke = {},
      pagePayload
    ) => {
      // Only extract essential stroke properties (no duplicate)
      const hasPoints =
        Array.isArray(stroke.points) && stroke.points.length > 0;

      // Compress points for tools that have them
      const compressedPoints = hasPoints ? compressPoints(stroke.points) : null;

      // Build minimal stroke object - only include non-null values
      const minimalStroke = {
        id: stroke.id,
        tool: stroke.tool || "pen",
      };

      // Only add properties if they have meaningful values
      if (stroke.x != null) minimalStroke.x = stroke.x;
      if (stroke.y != null) minimalStroke.y = stroke.y;
      if (stroke.width != null) minimalStroke.width = stroke.width;
      if (stroke.height != null) minimalStroke.height = stroke.height;
      if (stroke.rotation != null && stroke.rotation !== 0)
        minimalStroke.rotation = stroke.rotation;
      if (stroke.opacity != null && stroke.opacity !== 1)
        minimalStroke.opacity = stroke.opacity;
      if (stroke.color) minimalStroke.color = stroke.color;
      if (stroke.layerId) minimalStroke.layerId = stroke.layerId;
      if (stroke.text) minimalStroke.text = stroke.text;
      if (stroke.fontSize) minimalStroke.fontSize = stroke.fontSize;
      if (stroke.padding) minimalStroke.padding = stroke.padding;
      if (stroke.uri) minimalStroke.uri = stroke.uri;
      if (stroke.rows) minimalStroke.rows = stroke.rows;
      if (stroke.cols) minimalStroke.cols = stroke.cols;

      // Build optimized payload - NO DUPLICATES
      const payload = {
        pageId,
        stroke: minimalStroke,
      };

      // Add compressed points separately (not inside stroke to avoid duplication)
      if (compressedPoints) {
        payload.points = compressedPoints;
      }

      // Only include minimal page info if needed (NOT full page with strokes)
      if (pagePayload && typeof pagePayload === "object") {
        payload.pageInfo = {
          id: pagePayload.id,
          type: pagePayload.type,
          backgroundColor: pagePayload.backgroundColor,
          template: pagePayload.template,
        };
      }

      sendAction(projectId, userId, "DRAW", payload);
    };

    return { connect, disconnect, sendAction, sendDraw, sendStroke };
  })(),

  // ============================================================================
  // OFFLINE / GUEST PROJECT MANAGEMENT
  // ============================================================================

  /**
   * Create a project locally without API call (for guest/offline mode)
   * @param {object} projectData - Project metadata
   * @returns {Promise<object>} Created project with local ID
   */
  createProjectLocally: async (projectData) => {
    try {
      const localId = `local_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const localProject = {
        projectId: localId,
        name: projectData.name || "Untitled",
        description: projectData.description || "",
        imageUrl: projectData.imageUrl || null,
        orientation: projectData.orientation || "portrait",
        paperSize: projectData.paperSize || "A4",
        pages: projectData.pages || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocal: true,
      };

      // Save to local storage
      await offlineStorage.saveGuestProject(localId, localProject);

      return localProject;
    } catch (error) {
      console.warn("Failed to create local project:", error);
      throw error;
    }
  },

  /**
   * Get all local projects
   * @returns {Promise<Array>} Array of local projects
   */
  getLocalProjects: async () => {
    try {
      return await offlineStorage.getAllGuestProjects();
    } catch (error) {
      console.warn("Failed to get local projects:", error);
      return [];
    }
  },

  /**
   * Upload a local project to the cloud (after user logs in)
   * @param {string} localProjectId - The local project ID
   * @returns {Promise<object>} Created cloud project
   */
  uploadLocalProject: async (localProjectId) => {
    try {
      // Load local project
      const localProject = await offlineStorage.loadGuestProject(
        localProjectId
      );
      if (!localProject) {
        throw new Error("Local project not found");
      }

      // Create project on server
      const cloudProject = await projectService.createProject({
        name: localProject.name,
        description: localProject.description,
        imageUrl: localProject.imageUrl,
        orientation: localProject.orientation,
        paperSize: localProject.paperSize,
      });

      const cloudProjectId = cloudProject?.projectId || cloudProject?.id;
      if (!cloudProjectId) {
        throw new Error("Failed to get cloud project ID");
      }

      // Upload pages if any
      if (Array.isArray(localProject.pages) && localProject.pages.length > 0) {
        const uploadPromises = localProject.pages.map((page) => {
          if (page.dataObject && page.pageNumber) {
            return projectService.uploadPageToS3(
              cloudProjectId,
              page.pageNumber,
              page.dataObject
            );
          }
          return null;
        });

        const uploadedPages = await Promise.all(uploadPromises.filter(Boolean));

        if (uploadedPages.length > 0) {
          const payload = {
            projectId: cloudProjectId,
            pages: uploadedPages.map((p) => ({
              pageNumber: p.pageNumber,
              strokeUrl: p.url,
            })),
          };
          await projectService.createPage(payload);
        }
      }

      // Optionally delete local project after successful upload
      // await offlineStorage.deleteGuestProject(localProjectId);

      return cloudProject;
    } catch (error) {
      console.warn("Failed to upload local project:", error);
      throw error;
    }
  },

  /**
   * Check if a project ID is local
   * @param {string} projectId - Project ID to check
   * @returns {boolean} True if local project
   */
  isLocalProject: (projectId) => {
    return typeof projectId === "string" && projectId.startsWith("local_");
  },

  /**
   * Get all versions of a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of project versions
   */
  getProjectVersions: async (projectId) => {
    try {
      const response = await projectAPIController.getProjectVersions(projectId);
      if (response?.data?.result) {
        return response.data.result;
      }
      throw new Error("Invalid response from server");
    } catch (err) {
      console.warn("❌ Failed to get project versions:", err);
      throw err;
    }
  },

  /**
   * Restore a specific version of a project
   * @param {string} projectId - Project ID
   * @param {string} versionId - Version ID to restore
   * @returns {Promise<object>} Restore response
   */
  restoreProjectVersion: async (projectId, versionId) => {
    try {
      const response = await projectAPIController.restoreProjectVersion(
        projectId,
        versionId
      );
      if (response?.data?.code === 200) {
        return response.data;
      }
      throw new Error("Failed to restore version");
    } catch (err) {
      console.warn("❌ Failed to restore project version:", err);
      throw err;
    }
  },

  /**
   * Accept a project invitation
   * @param {string} projectId - Project ID to accept
   * @param {boolean} accepted - Acceptance status
   * @returns {Promise<object>} API response
   */
  acceptCollaboration: async (projectId, accepted = true) => {
    try {
      const response = await projectAPIController.acceptCollaboration(
        projectId,
        accepted
      );
      return response.data;
    } catch (err) {
      console.warn("❌ Failed to accept collaboration:", err);
      throw err;
    }
  },
};
