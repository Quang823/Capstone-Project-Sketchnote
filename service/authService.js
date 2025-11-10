import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApiController } from "../api/authApiController";
import { jwtDecode } from "jwt-decode";

export const authService = {
  login: async (email, password) => {
    try {
      const res = await authApiController.login({ email, password });
      if (res?.data?.result) {
        const { accessToken, refreshToken } = res.data.result;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        const decoded = jwtDecode(accessToken);
        const roles = decoded?.realm_access?.roles || [];
        await AsyncStorage.setItem("roles", JSON.stringify(roles));

        return { accessToken, refreshToken, roles };
      }
      throw new Error("Login failed. Token not received.");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed.";
      
      throw new Error(message);
    }
  },

  register: async (userData) => {
    try {
      const res = await authApiController.register(userData);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || "Register failed. Please try again.";
      throw new Error(message);
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      const res = await authApiController.refreshToken(refreshToken);

      if (res?.data?.result?.accessToken) {
        await AsyncStorage.setItem("accessToken", res.data.result.accessToken);
        return res.data.result.accessToken;
      }

      return null;
    } catch (err) {
      
      return null;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "roles"]);
      return true;
    } catch (e) {
      console.error("Error logging out:", e);
      return false;
    }
  },
};
