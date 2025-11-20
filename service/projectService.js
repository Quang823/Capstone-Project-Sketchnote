import { projectAPIController } from "../api/projectAPIController";
import * as FileSystem from "expo-file-system";
import { parseJsonInBackground } from "../utils/jsonUtils";
import * as offlineStorage from "../utils/offlineStorage";
import NetInfo from "@react-native-community/netinfo";

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
      console.error("❌ Failed to upload asset:", error);
      throw error;
    }
  },

  /**
   * Uploads a single page's data object to S3 and returns the page number and final URL.
   * This function does NOT call the createPage API.
   */
  uploadPageToS3: async (projectId, pageNumber, dataObject) => {
    // console.log(`☁️ [Service] Uploading page to S3: PageNumber=${pageNumber}`);
    const fileName = `${projectId}_page_${pageNumber}_${Date.now()}.json`;

    const presignData = await projectService.getPresign(fileName, "JSON");

    const finalUrl = await projectService.uploadToPresignedUrl(
      dataObject,
      presignData.uploadUrl
    );

    // console.log(
    //   `✅ [Service] S3 Upload successful for page ${pageNumber}, URL: ${finalUrl}`
    // );
    return { pageNumber, url: finalUrl };
  },

  /**
   * Creates/updates pages for a project in the database by sending a list of pages.
   * This is the final step of the save process.
   */
  createPage: async (pageData) => {
    try {
      // console.log(
      //   "🚀 [Service] Calling createPage API with payload:",
      //   JSON.stringify(pageData, null, 2)
      // );
      const response = await projectAPIController.createPage(pageData);
      if (response?.data?.result) {
        // console.log("✅ [Service] createPage API call successful.");
        return response.data.result;
      }
      throw new Error("Invalid response from createPage API");
    } catch (err) {
      console.error("❌ Failed to create/update pages in DB:", err);
      throw err;
    }
  },

  /**
   * Loads a single page's data with a cache-first strategy.
   */
  loadPageData: async (projectId, pageNumber, remoteUrl, options = {}) => {
    const localKey = getPageLocalKey(projectId, pageNumber);

    const localData = await offlineStorage.loadProjectLocally(localKey);
    if (localData) {
      return localData;
    }

    try {
      const remoteData = await projectService.getProjectFile(
        remoteUrl,
        options
      );
      if (remoteData) {
        await offlineStorage.saveProjectLocally(localKey, remoteData);
      }
      return remoteData;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(
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

        // 4. Load local data for pending pages
        const localPagesData = [];
        for (const key of projectKeys) {
          const pageData = await offlineStorage.loadProjectLocally(key);
          const pageNumber = parseInt(key.split("_")[2], 10);
          if (pageData && !isNaN(pageNumber)) {
            localPagesData.push({ pageNumber, dataObject: pageData });
          }
        }

        // 5. Upload pending pages to S3
        const uploadPromises = localPagesData.map((p) =>
          projectService.uploadPageToS3(projectId, p.pageNumber, p.dataObject)
        );
        const uploadedPages = await Promise.all(uploadPromises);

        // 6. Merge remote pages with newly uploaded pages
        uploadedPages.forEach((uploadedPage) => {
          remotePagesMap.set(uploadedPage.pageNumber, {
            pageNumber: uploadedPage.pageNumber,
            strokeUrl: uploadedPage.url,
          });
        });

        const finalPagesList = Array.from(remotePagesMap.values());
        // 7. Call the final batch update API
        const payload = {
          projectId: projectId,
          pages: finalPagesList,
        };
        await projectService.createPage(payload);

        // 8. Clean up the sync queue for this project
        for (const key of projectKeys) {
          await offlineStorage.removeProjectFromSyncQueue(key);
        }
      } catch (error) {
        console.error(`❌ FAILED to sync project ${projectId}:`, error);
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
      console.error("Error in getUserProjects:", error);
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
      console.error("❌ Failed to get presign URL:", err);
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
      console.error(`❌ Failed to upload to presigned URL:`, err);
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
        //  console.log(`[Service] Fetch aborted for URL: ${url}`);
      } else {
        console.error("❌ Error loading JSON:", err);
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
      console.error("❌ Failed to create project:", err);
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
      console.error("❌ Failed to get project by ID:", err);
      throw err;
    }
  },

  inviteCollaborator: async (projectId, email, edited = true) => {
    try {
      const response = await projectAPIController.inviteCollaborator({
        projectId,
        email,
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
        err.response?.data?.message || err.message || "Update permission failed";
      throw new Error(message);
    }
  },

  realtime: (() => {
    let socket = null;
    let isConnected = false;
    let activeProjectId = null;
    let onMessageCb = null;
    let heartbeatTimer = null;

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
        if (isConnected && activeProjectId === projectId) return true;
        activeProjectId = projectId;
        onMessageCb = onMessage;
        socket = new WebSocket("wss://sketchnote.litecsys.com/ws");
        socket.onopen = () => {
          const frame = buildFrame("CONNECT", {
            "accept-version": "1.2",
            "heart-beat": "0,0",
          });
          socket.send(frame);
        };
        socket.onmessage = (ev) => {
          const frame = parseFrame(ev.data);
          if (!frame) return;
          if (frame.command === "CONNECTED") {
            isConnected = true;
            const sub = buildFrame("SUBSCRIBE", {
              destination: `/topic/project/${projectId}`,
              id: `sub-${projectId}`,
              ack: "auto",
            });
            socket.send(sub);
            heartbeatTimer = setInterval(() => {
              try {
                socket.send("\n");
              } catch {}
            }, 20000);
          } else if (frame.command === "MESSAGE") {
            try {
              const json = JSON.parse(frame.body || "{}");
              if (typeof onMessageCb === "function") onMessageCb(json);
            } catch {}
          }
        };
        socket.onerror = () => {};
        socket.onclose = () => {
          isConnected = false;
          activeProjectId = null;
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
        };
        return true;
      } catch (err) {
        throw err;
      }
    };

    const disconnect = () => {
      try {
        if (socket && isConnected) {
          try {
            const frame = buildFrame("DISCONNECT");
            socket.send(frame);
          } catch {}
        }
      } finally {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
        try {
          socket?.close?.();
        } catch {}
        socket = null;
        isConnected = false;
        activeProjectId = null;
        onMessageCb = null;
      }
    };

    const sendAction = (projectId, userId, actionType, payload = {}) => {
      try {
        if (!socket || !isConnected) return;
        const body = JSON.stringify({
          type: actionType,
          tool: payload.tool || "pen",
          projectId,
          userId,
          payload,
        });
        const frame = buildFrame("SEND", {
          destination: `/app/project/${projectId}/action`,
          "content-type": "application/json",
        }, body);
        socket.send(frame);
      } catch {}
    };

    const sendDraw = (projectId, userId, tool, points = []) => {
      const pts = Array.isArray(points)
        ? points.map((p) => (Array.isArray(p) ? p : [p.x, p.y]))
        : [];
      sendAction(projectId, userId, "DRAW", { tool, points: pts });
    };

    return { connect, disconnect, sendAction, sendDraw };
  })(),
};
