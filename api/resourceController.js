import { privateApi, publicApi } from "./axiosInstance"

export const resourceController = {
   getAllResource : async (page,size)=>{
    return await publicApi.get(`/api/orders/template?page=${page}&size=${size}`,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
   getAllResourcePopular : async (limit)=>{
    return await publicApi.get(`/api/orders/template/popular?limit=${limit}`,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
   getAllResourceLatest : async (limit)=>{
    return await publicApi.get(`/api/orders/template/latest?limit=${limit}`,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
   getResourceById : async (id)=>{
    return await publicApi.get(`/api/orders/template/${id}`,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
   uploadResource : async (data)=>{
    return await privateApi.post(`/api/orders/template`,data,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
   getResourceByUserId : async (page,size)=>{
    return await privateApi.get(`/api/orders/template/my-template?page=${page}&size=${size}`,{
        baseURL:"http://146.190.90.222:8083"
    })
   },
}