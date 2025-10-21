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
}