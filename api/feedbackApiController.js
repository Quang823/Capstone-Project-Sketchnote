import { privateApi, publicApi } from "./axiosInstance";

export const feedbackApiController = {
    getAllFeedbackCourse: async (courseId) => {
        return await privateApi.get(`/api/feedback/course/${courseId}`);
    },
    postFeedbackCourse: async (feedback) => {
        return await privateApi.post(`/api/feedback/course`, feedback);
    },
    getAllFeedbackResource: async (resourceId) => {
        return await privateApi.get(`/api/feedback/resource/${resourceId}`);
    },
    postFeedbackResource: async (feedback) => {
        return await privateApi.post(`/api/feedback/resource`, feedback);
    },
}