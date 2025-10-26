// services/projectService.js
import { projectAPIController } from "../api/projectAPIController";

export const projectService = {
  /**
   * Upload dữ liệu 1 trang (CanvasContainer) lên cloud
   * @param {object} dataObject - dữ liệu JSON cần lưu
   * @param {string} fileName - tên file muốn lưu (ví dụ: "Test-123")
   * @returns {Promise<string>} - trả về URL file sau khi upload
   */
  uploadProjectFile: async (dataObject, fileName = "Test123") => {
    try {
      // Loại content gửi cho backend (để tạo presign)
      const presignContentType = "JSON"; // backend bạn cần "JSON" dạng string
      // Loại content thực tế khi PUT lên S3
      const uploadContentType = "application/json";

      // 🟢 B1: Lấy presigned URL từ backend
      const presignRes = await projectAPIController.getPresign(
        fileName,
        presignContentType
      );

      if (!presignRes?.data?.result) {
        throw new Error("Invalid presign response");
      }

      const { uploadUrl, strokeUrl } = presignRes.data.result;


      // 🟢 B2: Upload dữ liệu JSON lên S3 bằng fetch PUT
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadContentType },
        body: JSON.stringify(dataObject),
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`Upload failed: ${putRes.status} - ${errText}`);
      }

      
      return strokeUrl;
    } catch (err) {
      console.error(`❌ Upload ${fileName} thất bại:`, err);
      throw err;
    }
  },

  getProjectFile: async (url) => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const text = await res.text(); // đọc raw text để kiểm tra CORS
      const data = JSON.parse(text);
      return data;
    } catch (err) {
      console.error("❌ Lỗi tải JSON:", err);
      throw err;
    }
  },
};
