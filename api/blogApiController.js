import { privateApi } from "./axiosInstance";

export const blogApiController = {
  getBlogs: async (pageNo, pageSize) => {
    return await privateApi.get(`/api/blogs`, {
      params: { pageNo, pageSize }
    });
  },

  getBlogByUserId: async () => {
    return await privateApi.get(`/api/blogs/my-blog`);
  },

  createBlog: async (blog) => {
    return await privateApi.post(`/api/blogs`, blog);
  },

  updateBlog: async (id, blog) => {
    return await privateApi.put(`/api/blogs/${id}`, blog);
  },

  deleteBlog: async (id) => {
    return await privateApi.delete(`/api/blogs/${id}`);
  },

  getBlogById: async (id) => {
    return await privateApi.get(`/api/blogs/${id}`);
  },

  updateContent: async (id, content) => {
    return await privateApi.put(`/api/contents/${id}`, content);
  },

  createContent: async (blogId, content) => {
    return await privateApi.post(`/api/contents/${blogId}`, content);
  },

  deleteContent: async (id) => {
    return await privateApi.delete(`/api/contents/${id}`);
  },
};
