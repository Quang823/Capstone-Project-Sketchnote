import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// import { authService } from "./authService"; // Nếu bạn có file này

// const API_URL = process.env.EXPO_PUBLIC_API_URL;
// const API_URL2 = process.env.EXPO_PUBLIC_API_URL2;

const API_URL = "http://139.59.119.65:8888/";
const API_URL2 = "http://146.190.90.222:8087/";


// 🟢 API 1 (server chính)
export const publicApi = axios.create({
  baseURL: API_URL,
});

export const privateApi = axios.create({
  baseURL: API_URL,
});

// 🟣 API 2 (server phụ)
export const publicApi2 = axios.create({
  baseURL: API_URL2,
});

export const privateApi2 = axios.create({
  baseURL: API_URL2,
});

// =========================
// Interceptors cho private API
// =========================
const attachAuthInterceptor = (instance) => {
  // 🪪 Gắn token trước mỗi request
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 🔄 Tự refresh token nếu 401
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await authService.refreshToken(); 
          if (newToken) {
            await AsyncStorage.setItem("accessToken", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (err) {
          console.error("❌ Refresh token failed:", err);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Gắn interceptor cho cả 2 private API
attachAuthInterceptor(privateApi);
attachAuthInterceptor(privateApi2);
