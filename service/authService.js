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

  sendVerifyEmail: async (email) => {
    try {
      if (!email || !email.trim()) throw new Error("Missing email");
      const res = await authApiController.sendVerifyEmail(email.trim());
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send verify email.";
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

  getCurrentUser: async (sub) => {
    try {
      if (!sub) throw new Error("Missing sub when fetching current user");

      const res = await authApiController.getCurrentUser(sub);

      if (res?.data?.result) {
        return res.data.result;
      }

      throw new Error("User data not found.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch current user.";
      throw new Error(message);
    }
  },
  getUserById: async (id) => {
    try {
      if (!id && id !== 0) throw new Error("Missing user id");
      const res = await authApiController.getUserById(id);
      if (res?.data?.result) return res.data.result;
      throw new Error("User not found");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to get user.";
      throw new Error(message);
    }
  },
  getUserByEmail: async (email) => {
    try {
      if (!email || !email.trim()) throw new Error("Missing email");
      const res = await authApiController.getUserByEmail(email.trim());
      if (res?.data?.result) return res.data.result;
      throw new Error("User not found");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to get user by email.";
      throw new Error(message);
    }
  },
  updateUser: async (id, payload) => {
    try {
      if (!id && id !== 0) throw new Error("Missing user id");
      const res = await authApiController.updateUser(id, payload || {});
      if (res?.data?.result) return res.data.result;
      throw new Error("Update failed");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to update user.";
      throw new Error(message);
    }
  },
  getMyProfile: async (accessToken) => {
    try {
      const res = await authApiController.getMyProfile({
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      return res?.data?.result || null;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to get profile.";
      throw new Error(message);
    }
  },
  loginGoogle: async (code, redirectUri) => {
    try {
      const res = await authApiController.loginGoogle(code, redirectUri);
      if (res?.data?.result) {
        const { accessToken, refreshToken } = res.data.result;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        try {
          const decoded = jwtDecode(accessToken);
          const roles = decoded?.realm_access?.roles || [];
          await AsyncStorage.setItem("roles", JSON.stringify(roles));

          // Return consistent structure with login
          return { accessToken, refreshToken, roles };
        } catch (decodeError) {
          console.error("Error decoding token during Google login:", decodeError);
          // Still return tokens even if decoding fails, but roles will be missing
          return { accessToken, refreshToken, roles: [] };
        }
      }
      throw new Error("Login failed. Token not received.");
    } catch (err) {
      console.error("Google Login Error:", err);
      const message =
        err.response?.data?.message || err.message || "Login failed.";
      throw new Error(message);
    }
  },
  // Login Google for mobile using idToken
  loginGoogleMobile: async (idToken) => {
    try {
      const res = await authApiController.loginGoogleMobile(idToken);
      if (res?.data?.result) {
        const { accessToken, refreshToken } = res.data.result;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        try {
          const decoded = jwtDecode(accessToken);
          const roles = decoded?.realm_access?.roles || [];
          await AsyncStorage.setItem("roles", JSON.stringify(roles));

          return { accessToken, refreshToken, roles };
        } catch (decodeError) {
          console.error("Error decoding token during Google mobile login:", decodeError);
          return { accessToken, refreshToken, roles: [] };
        }
      }
      throw new Error("Login failed. Token not received.");
    } catch (err) {
      console.error("Google Mobile Login Error:", err);
      const message =
        err.response?.data?.message || err.message || "Login failed.";
      throw new Error(message);
    }
  },
  // Get all admin users
  getUserRoleAdmin: async () => {
    try {
      const res = await authApiController.getUserRoleAdmin();
      if (res?.data?.result) return res.data.result;
      throw new Error("Failed to get admin users.");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to get admin users.";
      throw new Error(message);
    }
  },
};
