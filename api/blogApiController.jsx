export const blogApiController = {
    getBlogs: async () => {
        return await publicApi.get(`/api/blogs`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    getBlogById: async (id) => {
        return await publicApi.get(`/api/blogs/${id}`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    createBlog: async (blog) => {
        return await publicApi.post(`/api/blogs`, blog,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    updateBlog: async (id, blog) => {
        return await publicApi.put(`/api/blogs/${id}`, blog,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    deleteBlog: async (id) => {
        return await publicApi.delete(`/api/blogs/${id}`,{
             baseURL: "http://146.190.90.222:8086",
        });
    },
    
}