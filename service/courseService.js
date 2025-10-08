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
  
}