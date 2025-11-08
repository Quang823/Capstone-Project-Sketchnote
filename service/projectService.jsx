// services/projectService.js
import { projectAPIController } from "../api/projectAPIController";

export const projectService = {
  /**
   * Lấy danh sách project của người dùng
   * @returns {Promise<Array>} - Danh sách project
   */
  getUserProjects: async () => {
    try {
      const response = await projectAPIController.getUserProjects();
      if (response?.data?.result) {
        return response.data.result;
      }
      return [];
    } catch (error) {
      console.error("Error in getUserProjects:", error);
      throw error;
    }
  },

  /**
   * Lấy presigned URL để upload stroke JSON lên S3
   * @param {string} fileName - tên file muốn lưu trên S3
   * @param {string} contentType - MIME type, mặc định 'application/json'
   * @returns {Promise<{ uploadUrl: string, strokeUrl: string }>} - URLs từ backend
   */
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
  /**
   * Upload dữ liệu 1 trang (CanvasContainer) lên cloud
   * @param {object} dataObject - dữ liệu JSON cần lưu
   * @param {string} presignedUrl - URL đã ký sẵn để upload
   * @returns {Promise<string>} - trả về URL file sau khi upload
   */
  uploadToPresignedUrl: async (dataObject, presignedUrl) => {
    try {
      const uploadContentType = "application/json";

      // 🟢 Upload dữ liệu JSON lên S3 bằng fetch PUT
      const putRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": uploadContentType },
        body: JSON.stringify(dataObject),
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        throw new Error(`Upload failed: ${putRes.status} - ${errText}`);
      }

      // Trả về URL gốc (không có query params)
      const finalUrl = presignedUrl.split("?")[0];
      return finalUrl;
    } catch (err) {
      console.error(`❌ Upload to presigned URL thất bại:`, err);
      throw err;
    }
  },

  uploadProjectFile: async (presignedUrl, fileData) => {
    try {
      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: fileData,
        headers: {
          "Content-Type": "application/octet-stream", // or the appropriate content type
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`File upload failed: ${errorText}`);
      }

      // Return the URL without the query string
      return presignedUrl.split("?")[0];
    } catch (error) {
      console.error("Error uploading project file:", error);
      throw error;
    }
  },

  getProjectFile: async (url, timeout = 10000) => {
    try {
      // ✅ Thêm timeout để tránh hang quá lâu (10 giây mặc định)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }

        const text = await res.text(); // đọc raw text để kiểm tra CORS
        const data = JSON.parse(text);
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === "AbortError") {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw fetchError;
      }
    } catch (err) {
      console.error("❌ Lỗi tải JSON:", err);
      throw err;
    }
  },

  /**
   * Tạo project mới
   * @param {object} projectData - { name, description, imageUrl }
   * @returns {Promise<object>} - response từ backend
   */
  createProject: async (projectData) => {
    try {
      // console.log("🚀 Creating project:", projectData);
      const response = await projectAPIController.createProject(projectData);

      if (response?.data?.result) {
        //   console.log("✅ Project created successfully:", response.data.result);
        return response.data.result;
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      console.error("❌ Failed to create project:", err);
      throw err;
    }
  },

  /**
   * Lấy chi tiết project theo ID
   * @param {string} projectId - ID của project
   * @returns {Promise<object>} - chi tiết project
   */
  getProjectById: async (projectId) => {
    try {
      //  console.log("🚀 Getting project by ID:", projectId);
      const response = await projectAPIController.getProjectById(projectId);

      if (response?.data?.result) {
        //  console.log("✅ Project fetched successfully:", response.data.result);
        return response.data.result;
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      console.error("❌ Failed to get project by ID:", err);
      throw err;
    }
  },

  /**
   * Tạo page mới
   * @param {object} pageData - { projectId, pageNumber, strokeUrl }
   * @returns {Promise<object>} - response từ backend
   */
  createPage: async (pageData) => {
    try {
      //   console.log("🚀 Creating page:", pageData);
      const response = await projectAPIController.createPage(pageData);

      if (response?.data?.result) {
        //   console.log("✅ Page created successfully:", response.data.result);
        return response.data.result;
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      console.error("❌ Failed to create page:", err);
      throw err;
    }
  },
};
