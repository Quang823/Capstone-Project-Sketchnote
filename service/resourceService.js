import { resourceController } from "../api/resourceController";

export const resourceService = {
    getAllResource : async (page,size)=>{
    try {
        const response = await resourceController.getAllResource(page,size);
        return response.data.result;
    } catch (error) {
        const message =
        error.response?.data?.message || error.message || "Get resource failed.";
      throw new Error(message);
    }
    },
    getAllResourcePopular : async (limit)=>{
        try {
            const response = await resourceController.getAllResourcePopular(limit);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get popular resource failed.";
          throw new Error(message);
        }
    },
    getAllResourceLatest : async (limit)=>{
        try {
            const response = await resourceController.getAllResourceLatest(limit);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get latest resource failed.";
          throw new Error(message);
        }
    },
    getResourceById : async (id)=>{
        try {
            const response = await resourceController.getResourceById(id);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get resource by id failed.";
          throw new Error(message);
        }
    },
    uploadResource : async (data)=>{
        try {
            const response = await resourceController.uploadResource(data);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Upload resource failed.";
          throw new Error(message);
        }
    },
    getResourceByUserId : async (page,size)=>{
        try {
            const response = await resourceController.getResourceByUserId(page,size);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get resource by user id failed.";
          throw new Error(message);
        }
    },
    getProjectByUserId : async ()=>{
        try {
            const response = await resourceController.getProjectByUserId();
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get project by user id failed.";
          throw new Error(message);
        }
    },
    uploadTemplate: async (projectId,data)=>{
        try {
            const response = await resourceController.uploadTemplate(projectId,data);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Upload template failed.";
          throw new Error(message);
        }
    },
    getResourceByUserId : async ()=>{
        try {
            const response = await resourceController.getResourceByUserId();
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get resource by user id failed.";
          throw new Error(message);
        }
    }
}