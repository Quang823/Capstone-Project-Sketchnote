import { privateApi, privateApi2 } from "./axiosInstance";

export const projectAPIController = {
  // 🔹 Lấy danh sách project của người dùng
  getUserProjects: async () => {
    try {
      const res = await privateApi2.get(`/api/projects/me`);
      //console.log("✅ Get user projects response:", res.data);
      return res;
    } catch (err) {
      // console.error("❌ Error getting user projects:", err);
      //  console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },
  // 🔹 Lấy presigned URL (đổi sang privateApi)
  getPresign: async (fileName, contentType) => {
    try {
      const res = await privateApi2.get(`/api/projects/storage/presign`, {
        params: { fileName, contentType },
      });
      // console.log("✅ Presign URL response:", res.data);
      return res;
    } catch (err) {
      // console.error("❌ Error getting presign:", err);
      throw err;
    }
  },

  // 🔹 Lưu metadata project
  saveProject: async (projectData) => {
    try {
      // console.log("📤 Saving project with data:", projectData);
      const res = await privateApi2.post(`/api/projects/me`, projectData);
      // console.log("✅ Save project response:", res.data);
      // console.log("✅ Full response:", res);
      return res;
    } catch (err) {
      //  console.error("❌ Error saving project:", err);
      //console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  // 🔹 Tạo project mới
  createProject: async (projectData) => {
    try {
      // console.log("📤 Creating project with data:", projectData);
      const res = await privateApi2.post(`/api/projects`, {
        name: projectData.name,
        description: projectData.description || "",
        imageUrl: projectData.imageUrl || "",
      });
      //  console.log("✅ Create project response:", res.data);
      return res;
    } catch (err) {
      //  console.error("❌ Error creating project:", err);
      //  console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  // 🔹 Lấy chi tiết project theo ID
  getProjectById: async (projectId) => {
    try {
      // console.log("📋 Getting project by ID:", projectId);
      const res = await privateApi2.get(`/api/projects/${projectId}`);
      //  console.log("✅ Get project by ID response:", res.data);
      return res;
    } catch (err) {
      //  console.error("❌ Error getting project by ID:", err);
      // console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },

  // 🔹 Tạo page mới
  createPage: async (pageData) => {
    try {
      //  console.log("📄 Creating page with data:", pageData);
      // Backend expects: { projectId, pages: [{ pageNumber, strokeUrl }] }
      const payload = pageData.pages
        ? pageData
        : {
            projectId: pageData.projectId,
            pages: [
              {
                pageNumber: pageData.pageNumber,
                strokeUrl: pageData.strokeUrl,
              },
            ],
          };
      const res = await privateApi2.post(`/api/pages`, payload);
      //  console.log("✅ Create page response:", res.data);
      return res;
    } catch (err) {
      //  console.error("❌ Error creating page:", err);
      //  console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },
};
