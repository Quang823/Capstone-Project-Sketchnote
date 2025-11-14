import { publicApi, privateApi } from "./axiosInstance";

export const authApiController = {
  login: async (credentials) => {
    return await publicApi.post(`/api/auth/login`, credentials);
  },
  register: async (userData) => {
    return await publicApi.post(`/api/auth/register`, userData);
  },
  refreshToken: async (refreshToken) => {
    return await publicApi.post(`/api/auth/refresh-token`, { refreshToken });
  },

  getCurrentUser: async (sub) => {
    return await privateApi.get(`/api/users/keycloak/${sub}`);
  },
  getUserById: async (id) => {
    return await privateApi.get(`/api/users/${id}`);
  },
  updateUser: async (id, data) => {
    return await privateApi.put(`/api/users/${id}`, data);
  },
};
