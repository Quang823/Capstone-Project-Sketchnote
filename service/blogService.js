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
}