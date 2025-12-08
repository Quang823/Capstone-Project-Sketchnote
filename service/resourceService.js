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
    getResourceProjectByUserId : async (page,size)=>{
        try {
            const response = await resourceController.getResourceProjectByUserId(page,size);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.message || error.message || "Get resource project by user id failed.";
          throw new Error(message);
        }
    },
    /////////////////////////////////////////////////////////
    createResourceVersion : async (resourceId,data)=>{
        try {
            const response = await resourceController.createResourceVersion(resourceId,data);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Create resource version failed.";
          throw new Error(message);
        }
    },
    getAllProductBuyDesigner : async (page,size,sortBy,sortDir,search,isArchived)=>{
        try {
            const response = await resourceController.getAllProductBuyDesigner(page,size,sortBy,sortDir,search,isArchived);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Get all product buy designer failed.";
          throw new Error(message);
        }
    },
    republishResourceVersionWhenStaffNotConfirm : async (versionId)=>{
        try {
            const response = await resourceController.republishResourceVersionWhenStaffNotConfirm(versionId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Republish resource version when staff not confirm failed.";
          throw new Error(message);
        }
    },
    archiveResourceTemplate : async (resourceTemplateId)=>{
        try {
            const response = await resourceController.archiveResourceTemplate(resourceTemplateId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Archive resource template failed.";
          throw new Error(message);
        }
    },
    unarchiveResourceVersion : async (resourceTemplateId)=>{
        try {
            const response = await resourceController.unarchiveResourceVersion(resourceTemplateId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Unarchive resource version failed.";
          throw new Error(message);
        }
    },
    deleteResourceVersion : async (versionId)=>{
        try {
            const response = await resourceController.deleteResourceVersion(versionId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Delete resource version failed.";
          throw new Error(message);
        }
    },
    pubicResourceVersion : async (versionId)=>{
        try {
            const response = await resourceController.pubicResourceVersion(versionId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Public resource version failed.";
          throw new Error(message);
        }
    },

    archiveResourceTemplate: async (resourceTemplateId) => {
        try {
            const response = await resourceController.archiveResourceTemplate(resourceTemplateId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Archive resource template failed.";
          throw new Error(message);
        }
    },

    unarchiveResourceTemplate: async (resourceTemplateId) => {
        try {
            const response = await resourceController.unarchiveResourceTemplate(resourceTemplateId);
            return response.data.result;
        } catch (error) {
            const message =
            error.response?.data?.message || error.message || "Unarchive resource template failed.";
          throw new Error(message);
        }
    },

}