import { privateApi, privateApi2 } from "./axiosInstance";

export const projectAPIController = {
  // 🔹 Lấy danh sách project của người dùng
  getUserProjects: async () => {
    try {
      const res = await privateApi2.get(`/api/projects/me`);
      return res;
    } catch (err) {
      // console.error("❌ Error getting user projects:", err);
      //  console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },
  // 🔹 Lấy danh sách project được share cho tôi
  getSharedProjects: async () => {
    try {
      const res = await privateApi2.get(`/api/projects/me/shared`);
      return res;
    } catch (err) {
      throw err;
    }
  },
  // 🔹 Lấy presigned URL (đổi sang privateApi)
  getPresign: async (fileName, contentType) => {
    try {
      const res = await privateApi2.get(`/api/projects/storage/presign`, {
        params: { fileName, contentType },
      });
      return res;
    } catch (err) {
      // console.error("❌ Error getting presign:", err);
      throw err;
    }
  },

  // 🔹 Lưu metadata project
  saveProject: async (projectData) => {
    try {
      const res = await privateApi2.post(`/api/projects/me`, projectData);
      return res;
    } catch (err) {
      console.error("❌ Error saving project:", err);
      console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  // 🔹 Tạo project mới
  createProject: async (projectData) => {
    try {
      const res = await privateApi2.post(`/api/projects`, {
        name: projectData.name,
        description: projectData.description || "",
        imageUrl: projectData.imageUrl || "",
      });
      return res;
    } catch (err) {
      console.error("❌ Error creating project:", err);
      console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },
  updateProject: async (projectId, projectData) => {
    try {
      const res = await privateApi2.put(`/api/projects/${projectId}`, {
        name: projectData.name,
        description: projectData.description || "",
        imageUrl: projectData.imageUrl || "",
      });
      return res;
    } catch (err) {
      console.error("Error updating project:", err.response?.data || err);
      throw err;
    }
  },

  deleteProject: async (projectId) => {
    try {
      const res = await privateApi2.delete(`/api/projects/${projectId}`);
      return res;
    } catch (err) {
      console.error("Error deleting project:", err.response?.data || err);
      throw err;
    }
  },
  // 🔹 Lấy chi tiết project theo ID
  getProjectById: async (projectId) => {
    try {
      const res = await privateApi2.get(`/api/projects/${projectId}`);
      return res;
    } catch (err) {
      console.error("❌ Error getting project by ID:", err);
      console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  // 🔹 Tạo page mới
  createPage: async (pageData) => {
    try {
      const payload = pageData.pages
        ? pageData
        : {
          projectId: pageData.projectId,
          pages: [
            {
              pageNumber: pageData.pageNumber,
              strokeUrl: pageData.strokeUrl,
              snapshotUrl: pageData.snapshotUrl || "",
            },
          ],
        };
      const res = await privateApi2.post(`/api/pages`, payload);
      return res;
    } catch (err) {
      console.error("❌ Error creating page:", err);
      console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  inviteCollaborator: async ({ projectId, userId, edited }) => {
    try {
      const res = await privateApi2.post(`/api/collaborations/invite`, {
        projectId,
        userId,
        edited,
      });
      //console.log("✅ Invite collaborator response:", res.data);
      return res;
    } catch (err) {
      throw err;
    }
  },

  updateCollaboratorPermission: async ({ projectId, email, edited }) => {
    try {
      const res = await privateApi2.put(`/api/collaborations/permission`, {
        projectId,
        email,
        edited,
      });
      return res;
    } catch (err) {
      throw err;
    }
  },

  // 🔹 Lấy danh sách version của project
  getProjectVersions: async (projectId) => {
    try {
      const res = await privateApi2.get(`/api/projects/${projectId}/versions`);
      return res;
    } catch (err) {
      console.error("❌ Error getting project versions:", err);
      throw err;
    }
  },

  // 🔹 Restore version của project
  restoreProjectVersion: async (projectId, versionId) => {
    try {
      const res = await privateApi2.post(
        `/api/projects/${projectId}/versions/${versionId}/restore`
      );
      return res;
    } catch (err) {
      console.error("❌ Error restoring project version:", err);
      throw err;
    }
  },
};
