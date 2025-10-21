import { publicApi, privateApi } from "./axiosInstance";

export const projectAPIController = {
  // 🔹 Lấy presigned URL (đổi sang privateApi)
  getPresign: async (fileName, contentType) => {
    try {
      const res = await privateApi.get(`/api/projects/storage/presign`, {
        params: { fileName, contentType },
      });
      return res;
    } catch (err) {
      console.error("❌ Error getting presign:", err);
      throw err;
    }
  },

  // 🔹 Lưu metadata project
  saveProject: async (projectData) => {
    try {
      return await privateApi.post(`/api/projects`, projectData);
    } catch (err) {
      console.error("❌ Error saving project:", err);
      throw err;
    }
  },
};
