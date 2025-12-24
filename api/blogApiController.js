import { privateApi, publicApi } from "./axiosInstance";

export const blogApiController = {
  getBlogs: async (pageNo, pageSize) => {
    return await publicApi.get(`/api/blogs`, {
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
    return await publicApi.get(`/api/blogs/${id}`);
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
  getCommentsBlog: async (blogId, page, size) => {
    return await privateApi.get(`/api/blogs/${blogId}/comments`, {
      params: { page, size }
    });
  },
  createCommentsBlog: async (blogId, comment) => {
    return await privateApi.post(`/api/blogs/${blogId}/comments`, comment);
  },
  updateCommentsBlog: async (commentId, comment) => {
    return await privateApi.put(`/api/blogs/comments/${commentId}`, comment);
  },
  deleteCommentsBlog: async (commentId) => {
    return await privateApi.delete(`/api/blogs/comments/${commentId}`);
  },
  getReplyCommentsBlog: async (commentId, page, size) => {
    return await privateApi.get(`/api/blogs/comments/${commentId}/replies`, {
      params: { page, size }
    });
  },
  changeBlogStatus: async (id, status) => {
    return await privateApi.put(`/api/blogs/${id}/publish`, { status });
  },
  getBlogWithStatusPending: async (pageNo, pageSize,status) => {
    return await privateApi.get(`/api/blogs?pageNo=${pageNo}&pageSize=${pageSize}&status=${status}`);
  },
};
