import { publicApi, privateApi } from "./axiosInstance";

export const authApiController = {
  login: async (credentials) => {
    return await publicApi.post(`/api/auth/login`, credentials);
  },
  register: async (userData) => {
    return await publicApi.post(`/api/auth/register`, userData);
  },
  refeshToken: async (refreshToken) => {
    return await publicApi.post(`/api/auth/refresh-token`, { refreshToken });
  },

  getCurrentUser: async (sub) => {
    return await privateApi.get(`/api/users/keycloak/${sub}`);
  },
};
