import { publicApi } from "./axiosInstance";






export const authApiController = {
login: async (credentials) => {
    
      return await publicApi.post(`/api/auth/login`, credentials); 
    
  },
register: async (userData) => {
   
        return await publicApi.post(`/api/auth/register`, userData);
   
  },
refeshToken : async (refreshToken) => {

       return await publicApi.post(`/api/auth/refresh-token`, { refreshToken });
 
},
logout: async () => {
    try {
      return await publicApi.post(`/api/auth/logout`);
    } catch (e) {
      console.error("Error calling logout API:", e);
      throw e;
    }
  },
}
