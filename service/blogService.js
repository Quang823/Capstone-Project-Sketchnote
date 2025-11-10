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
    }
}