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

  sendVerifyEmail: async (email) => {
    return await publicApi.post(`/api/auth/send-verify-email`, { email });
  },

  getCurrentUser: async (sub) => {
    return await privateApi.get(`/api/users/keycloak/${sub}`);
  },
  getUserById: async (id) => {
    return await privateApi.get(`/api/users/${id}`);
  },
  getUserByEmail: async (email) => {
    return await privateApi.get(`/api/users/email/${encodeURIComponent(email)}`);
  },
  updateUser: async (id, data) => {
    return await privateApi.put(`/api/users/${id}`, data);
  },
  getMyProfile: async (config) => {
    return await privateApi.get(`/api/users/me/profile`, config);
  },
  loginGoogle: async (code, redirectUri) => {
    return await publicApi.post(`/api/auth/login-google`, { code, redirectUri });
  },
  // Login Google for mobile (using idToken)
  loginGoogleMobile: async (idToken) => {
    return await publicApi.post(`/api/auth/login-google-mobile`, { idToken });
  },
  getUserRoleAdmin: async () => {
    return await privateApi.get(`/api/users/role?role=ADMIN`);
  },
};
