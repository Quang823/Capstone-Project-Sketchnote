import { blogApiController } from "../api/blogApiController";

export const blogService = {
    getAllBlogs : async (pageNo,pageSize) =>{
     try {
      const res = await blogApiController.getBlogs(pageNo,pageSize);
      return res.data;
     } catch (error) {
      const message =
          error.response?.data?.message || error.message || "Get all blogs failed.";
        throw new Error(message);
     }
    },
    getBlogByUserId : async () =>{
      try {
        const res = await blogApiController.getBlogByUserId();
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get blog by user id failed.";
        throw new Error(message);
      }
    },
    createBlog : async (blogData) =>{
      try {
        const res = await blogApiController.createBlog(blogData);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Create blog failed.";
        throw new Error(message);
      }
    },
    updateBlog : async (id,blogData) =>{
      try {
        const res = await blogApiController.updateBlog(id,blogData);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Update blog failed.";
        throw new Error(message);
      }
    },
    deleteBlog : async (id) =>{
      try {
        const res = await blogApiController.deleteBlog(id);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Delete blog failed.";
        throw new Error(message);
      }
    },
    getBlogById : async (id) =>{
      try {
        const res = await blogApiController.getBlogById(id);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get blog by id failed.";
        throw new Error(message);
      }
    },
    updateContent : async (id,content) =>{
      try {
        const res = await blogApiController.updateContent(id,content);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Update content failed.";
        throw new Error(message);
      }
    },
    createContent : async (blogId,content) =>{
      try {
        const res = await blogApiController.createContent(blogId,content);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Create content failed.";
        throw new Error(message);
      }
    },
    deleteContent : async (id) =>{
      try {
        const res = await blogApiController.deleteContent(id);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Delete content failed.";
        throw new Error(message);
      }
    },
    getCommentsBlog : async (blogId,page,size) =>{
      try {
        const res = await blogApiController.getCommentsBlog(blogId,page,size);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get comments blog failed.";
        throw new Error(message);
      }
    },
    createCommentsBlog : async (blogId,comment) =>{
      try {
        const res = await blogApiController.createCommentsBlog(blogId,comment);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Create comments blog failed.";
        throw new Error(message);
      }
    },
    updateCommentsBlog : async (commentId,comment) =>{
      try {
        const res = await blogApiController.updateCommentsBlog(commentId,comment);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Update comments blog failed.";
        throw new Error(message);
      }
    },
    deleteCommentsBlog : async (commentId) =>{
      try {
        const res = await blogApiController.deleteCommentsBlog(commentId);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Delete comments blog failed.";
        throw new Error(message);
      }
    },
    getReplyCommentsBlog : async (commentId,page,size) =>{
      try {
        const res = await blogApiController.getReplyCommentsBlog(commentId,page,size);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get reply comments blog failed.";
        throw new Error(message);
      }
    },
    changeBlogStatus : async (id,status) =>{
      try {
        const res = await blogApiController.changeBlogStatus(id,status);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Change blog status failed.";
        throw new Error(message);
      }
    },
    getBlogWithStatusPending : async (pageNo,pageSize,status) =>{
      try {
        const res = await blogApiController.getBlogWithStatusPending(pageNo,pageSize,status);
        return res.data.result;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get blog with status pending failed.";
        throw new Error(message);
      }
    },
    getBLogwithModeration : async (id) =>{
      try {
        const res = await blogApiController.getBLogwithModeration(id);
        return res.data;
      } catch (error) {
        const message =
          error.response?.data?.message || error.message || "Get blog with moderation failed.";
        throw new Error(message);
      }
    }
}