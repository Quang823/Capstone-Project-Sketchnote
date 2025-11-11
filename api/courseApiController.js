import { privateApi, publicApi } from "./axiosInstance";


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
    enrollCourse: async (courseId) => {
  return await privateApi.post(
    `/api/learning/enrollments/${courseId}`,
    null,
    { baseURL: "http://146.190.90.222:8085" }
  );
},

    getAllCourseEnrollments : async () =>{
      return await privateApi.get(`/api/learning/courses/enrolled/me`, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
    getAllCourseNotEnrollments : async () =>{
      return await privateApi.get(`/api/learning/courses/not-enrolled`, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
    buyCourse: async (price) => {
  return await privateApi.post(`/api/wallet/charge-course?price=${price}`, null, {
    baseURL: "http://146.190.90.222:8089",
  });
},
saveLessonProgress: async (courseId, lessonId, progressData) => {
  return await privateApi.post(
    `/api/learning/courses/${courseId}/lessons/${lessonId}/progress`,
    progressData,
    { baseURL: "http://146.190.90.222:8085" }
  );
},
 getAllCourseEnrollments2 : async () =>{
      return await privateApi.get(`/api/learning/enrollments/me`, {
        baseURL: "http://146.190.90.222:8085"
      });
    },
   
  }
