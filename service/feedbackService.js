import { feedbackApiController } from "../api/feedbackApiController";

export const feedbackService = {
    getAllFeedbackCourse :  async (courseId) =>{
        try {
            const res = await feedbackApiController.getAllFeedbackCourse(courseId);
            return res.data.result;
        } catch (error) {
             const message =
                error.response?.data?.message || error.message || "Get all feedback course failed.";
            throw new Error(message);
        }
    },
    postFeedbackCourse :  async (feedback) =>{
        try {
            const res = await feedbackApiController.postFeedbackCourse(feedback);
            return res.data.result;
        } catch (error) {
             const message =
                error.response?.data?.message || error.message || "Post feedback course failed.";
            throw new Error(message);
        }
    },
    getAllFeedbackResource :  async (resourceId) =>{
        try {
            const res = await feedbackApiController.getAllFeedbackResource(resourceId);
            return res.data.result;
        } catch (error) {
             const message =
                error.response?.data?.message || error.message || "Get all feedback resource failed.";
            throw new Error(message);
        }
    },
    postFeedbackResource :  async (feedback) =>{
        try {
            const res = await feedbackApiController.postFeedbackResource(feedback);
            return res.data.result;
        } catch (error) {
             const message =
                error.response?.data?.message || error.message || "Post feedback resource failed.";
            throw new Error(message);
        }   
    },
}