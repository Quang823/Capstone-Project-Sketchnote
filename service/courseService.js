import { courseApiController } from "../api/courseApiController";

export const courseService = {
  getAllCourse : async () =>{
   try {
    const res = await courseApiController.getAll();
    return res.data;
   } catch (error) {
    const message =
        error.response?.data?.message || error.message || "Get all courses failed.";
      throw new Error(message);
   }
  },
  getCourseById : async (id) =>{
    try {
      const res = await courseApiController.getCourseById(id);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get course by id failed.";
      throw new Error(message);
    }
  },
  createCourse : async (courseData) =>{
    try {
      const res = await courseApiController.createCourse(courseData);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Create course failed.";
      throw new Error(message);
    }
  },
  getLessonsByCourseId : async (id) =>{
    try {
      const res = await courseApiController.getLessonsByCourseId(id);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get lessons by course id failed.";
      throw new Error(message);
    }
  },
  buyCourse : async (price) =>{
    try {
      const res = await courseApiController.buyCourse(price);
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Buy course by id failed.";
      throw new Error(message);
    }
  },
  enrollCourse : async (id) =>{
    try {
      const res = await courseApiController.enrollCourse(id);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Enroll course failed.";
      throw new Error(message);
    }
  },
  getAllCourseEnrollments : async () =>{
    try {
      const res = await courseApiController.getAllCourseEnrollments();
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get all course enrollments failed.";
      throw new Error(message);
    }
  },
  getAllCourseNotEnrollments : async () =>{
    try {
      const res = await courseApiController.getAllCourseNotEnrollments();
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get all course not enrollments failed.";
      throw new Error(message);
    }
  },
  saveLessonProgress : async (courseId, lessonId, progressData) =>{
    try {
      const res = await courseApiController.saveLessonProgress(courseId, lessonId, progressData);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Save lesson progress failed.";
      throw new Error(message);
    }
  },
  getAllCourseEnrollments2 : async () =>{
    try {
      const res = await courseApiController.getAllCourseEnrollments2();
      return res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get all course enrollments failed.";
      throw new Error(message);
    }
  },
  getCourseByIdEnrolled : async (id) =>{
    try {
      const res = await courseApiController.getCourseByIdEnrolled(id);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get course by id enrolled failed.";
      throw new Error(message);
    }
  },
  getCourseEnrollmentsByCourseId : async (id) =>{
    try {
      const res = await courseApiController.getCourseEnrollmentsByCourseId(id);
      return res.data.result;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Get course enrollments by course id failed.";
      throw new Error(message);
    }
  },
}