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
      await AsyncStorage.removeItem("accessToken");
      return true;
    } catch (e) {
      console.error("Error logging out:", e);
      return false;
    }
  },
}
