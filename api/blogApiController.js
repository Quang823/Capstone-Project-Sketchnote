import { privateApi } from "./axiosInstance";

export const blogApiController = {
    getBlogs: async () => {
        return await privateApi.get(`/api/blogs`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    getBlogByUserId: async () => {
        return await privateApi.get(`/api/blogs/my-blog`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    createBlog: async (blog) => {
        return await privateApi.post(`/api/blogs`, blog,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    updateBlog: async (id, blog) => {
        return await privateApi.put(`/api/blogs/${id}`, blog,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    deleteBlog: async (id) => {
        return await privateApi.delete(`/api/blogs/${id}`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    
}