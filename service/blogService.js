import { blogApiController } from "../api/blogApiController";

export const blogService = {
    getAllBlogs : async () =>{
     try {
      const res = await blogApiController.getBlogs();
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
}