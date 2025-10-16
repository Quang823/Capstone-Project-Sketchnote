import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { error } from "pdf-lib";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const publicApi = axios.create({
    baseURL:API_URL,
})

export const privateApi  = axios.create({
    baseURL:API_URL,
})

privateApi.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
privateApi.interceptors.response.use(
    (response) => response,
    async (error) =>{
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            const newtoken = await authService.refreshToken();
          if (newtoken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return privateApi(originalRequest);
      }
            
        }
        return Promise.reject(error)
    }
)