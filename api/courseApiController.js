import { privateApi, publicApi } from "./axiosInstance";

export const courseApiController = {
  getAll: async () => {
    return await publicApi.get("/api/learning/courses");
  },

  getCourseById: async (id) => {
    return await publicApi.get(`/api/learning/courses/${id}`);
  },

  createCourse: async (courseData) => {
    return await publicApi.post(`/api/learning/courses/courses`, courseData);
  },

  getLessonsByCourseId: async (id) => {
    return await publicApi.get(`/api/learning/lessons/${id}`);
  },

  enrollCourse: async (courseId) => {
    return await privateApi.post(`/api/learning/enrollments/${courseId}`, null);
  },

  getAllCourseEnrollments: async () => {
    return await privateApi.get(`/api/learning/courses/enrolled/me`);
  },

  getAllCourseNotEnrollments: async () => {
    return await privateApi.get(`/api/learning/courses/not-enrolled`);
  },

  buyCourse: async (price) => {
    return await privateApi.post(`/api/wallet/charge-course?price=${price}`, null);
  },

  saveLessonProgress: async (courseId, lessonId, progressData) => {
    return await privateApi.post(
      `/api/learning/courses/${courseId}/lessons/${lessonId}/progress`,
      progressData
    );
  },

  getAllCourseEnrollments2: async () => {
    return await privateApi.get(`/api/learning/enrollments/me`);
  },

  getCourseByIdEnrolled: async (id) => {
    return await privateApi.get(`/api/learning/enrollments/course/${id}/me`);
  },
};
