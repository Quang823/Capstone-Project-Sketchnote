import { privateApi } from "./axiosInstance";

export const collabApiController = {
    getCollaborators: (projectId) => {
        return privateApi.get(`/api/collaborations/${projectId}`);
    },
};
