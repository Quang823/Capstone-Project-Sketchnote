import { publicApi } from "./axiosInstance";


export const courseApiController = {
 getAll: async () => {
    return await publicApi.get("/api/learning/courses", {
      baseURL: "http://146.190.90.222:8085"
    });
  },
    getCourseById : async (id) =>{
      return await publicApi.get(`/api/learning/courses/${id}`, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
    createCourse : async (courseData) =>{
      return await publicApi.post(`/api/learning/courses/courses`, courseData, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
    getLessonsByCourseId : async (id) =>{
      return await publicApi.get(`/api/learning/lessons/${id}`, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
    
  }
