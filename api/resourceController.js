import { privateApi, publicApi } from "./axiosInstance";

export const resourceController = {
  getAllResource: async (page, size) => {
    return await publicApi.get(
      `/api/orders/template?page=${page}&size=${size}`
    );
  },
  getAllResourcePopular: async (limit) => {
    return await publicApi.get(`/api/orders/template/popular?limit=${limit}`);
  },
  getAllResourceLatest: async (limit) => {
    return await publicApi.get(`/api/orders/template/latest?limit=${limit}`);
  },
  getResourceById: async (id) => {
    return await publicApi.get(`/api/orders/template/${id}`);
  },
  uploadResource: async (data) => {
    return await privateApi.post(`/api/orders/template`, data);
  },
  getResourceByUserId: async (page, size) => {
    return await privateApi.get(
      `/api/orders/template/my-template?page=${page}&size=${size}`
    );
  },
};
