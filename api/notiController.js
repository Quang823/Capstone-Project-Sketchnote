import { privateApi } from "./axiosInstance"

export const notiController = {
    getCountNotiUnRead : async () =>{
        return await privateApi.get("/api/notifications/count-unread")
    },
    getAllNoti : async (page,size) =>{
        return await privateApi.get("/api/notifications",{
            params : {
                page,
                size
            }
        })
    },
    readAllNoti : async () =>{
        return await privateApi.patch("/api/notifications/read-all")
    },
    readNotiByNotiId : async (notiId) =>{
        return await privateApi.patch(`/api/notifications/${notiId}/read`)
    }
}