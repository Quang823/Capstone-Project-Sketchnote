import { collabApiController } from "../api/collabApiController";

export const collabService = {
    getCollaborators: async (projectId) => {
        try {
            const response = await collabApiController.getCollaborators(projectId);
            if (response?.data?.result) {
                return response.data.result;
            }
            return [];
        } catch (error) {
            console.warn("Error in getCollaborators:", error);
            throw error;
        }
    },
};
