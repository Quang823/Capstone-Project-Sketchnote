import { privateApi } from "./axiosInstance";

export const blogApiController = {
  getBlogs: async (pageNo, pageSize) => {
    return await privateApi.get(`/api/blogs`, {
      baseURL: "http://146.190.90.222:8089",
      params: {
        pageNo,
        pageSize,
      },
    });
  },

  getBlogByUserId: async () => {
    return await privateApi.get(`/api/blogs/my-blog`, {
      baseURL: "http://146.190.90.222:8089",
    });
  },

  createBlog: async (blog) => {
    return await privateApi.post(`/api/blogs`, blog, {
      baseURL: "http://146.190.90.222:8089",
    });
  },

  updateBlog: async (id, blog) => {
    return await privateApi.put(`/api/blogs/${id}`, blog, {
      baseURL: "http://146.190.90.222:8089",
    });
  },

  deleteBlog: async (id) => {
    return await privateApi.delete(`/api/blogs/${id}`, {
      baseURL: "http://146.190.90.222:8089",
    });
  },
  getBlogById: async (id) => {
    return await privateApi.get(`/api/blogs/${id}`, {
      baseURL: "http://146.190.90.222:8089",
    });
  },
  updateContent: async (id, content) => {
    return await privateApi.put(`/api/contents/${id}`, content, {
      baseURL: "http://146.190.90.222:8089",
    });
  },
  createContent: async (blogId,content) => {
    return await privateApi.post(`/api/contents/${blogId}`, content, {
      baseURL: "http://146.190.90.222:8089",
    });
  },
  deleteContent: async (id) => {
    return await privateApi.delete(`/api/contents/${id}`, {
      baseURL: "http://146.190.90.222:8089",
    });
  },
};
