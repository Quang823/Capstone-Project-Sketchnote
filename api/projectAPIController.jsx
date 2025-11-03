import { publicApi, privateApi, privateApi2 } from "./axiosInstance";

export const projectAPIController = {
  // 🔹 Lấy presigned URL (đổi sang privateApi)
  getPresign: async (fileName, contentType) => {
    try {
      const res = await privateApi2.get(`/api/projects/storage/presign`, {
        params: { fileName, contentType },
      });
      console.log("✅ Presign URL response:", res.data);
      return res;
    } catch (err) {
      console.error("❌ Error getting presign:", err);
      throw err;
    }
  },

  // 🔹 Lưu metadata project
  saveProject: async (projectData) => {
    try {
      console.log("📤 Saving project with data:", projectData);
      const res = await privateApi2.post(`/api/projects`, projectData);
      console.log("✅ Save project response:", res.data);
      console.log("✅ Full response:", res);
      return res;
    } catch (err) {
      console.error("❌ Error saving project:", err);
      console.error("❌ Error response:", err.response?.data);
      throw err;
    }
  },
};
