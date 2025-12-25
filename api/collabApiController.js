import { privateApi } from "./axiosInstance";

export const collabApiController = {
    getCollaborators: (projectId) => {
        return privateApi.get(`/api/collaborations/${projectId}`);
    },
    updatePermission: (projectId, userId, edited) => {
        return privateApi.put('/api/collaborations/permission', {
            projectId,
            userId,
            edited
        });
    },
};
