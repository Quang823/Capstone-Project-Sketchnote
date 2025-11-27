import { notiController } from "../api/notiController";

export const notiService = {
    getCountNotiUnRead : async () =>{
        try {
            const response = await notiController.getCountNotiUnRead()
            return response.data
        } catch (error) {
              const message =
        error.response?.data?.message ||
        error.message ||
        "Get count noti unread failed.";
      throw new Error(message);
    }
        
    },
    getAllNoti : async (page,size) =>{
        try {
            const response = await notiController.getAllNoti(page,size)
            return response.data
        } catch (error) {
              const message =
        error.response?.data?.message ||
        error.message ||
        "Get all noti failed.";
      throw new Error(message);
    }
    },
    readAllNoti : async () =>{
      try {
        const response = await notiController.readAllNoti()
        return response.data
      } catch (error) {
        const message =
        error.response?.data?.message ||
        error.message ||
        "Read all noti failed.";
      throw new Error(message);
      }
    },
    readNotiByNotiId : async (notiId) =>{
        try {
            const response = await notiController.readNotiByNotiId(notiId)
            return response.data
        } catch (error) {
              const message =
        error.response?.data?.message ||
        error.message ||
        "Read noti failed.";
      throw new Error(message);
    }
}
}