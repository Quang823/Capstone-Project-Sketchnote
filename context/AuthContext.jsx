// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../service/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true); // true until we verify authentication
  const [isLoading, setIsLoading] = useState(true); // true during initial auth check

  // Lấy user từ token khi app load
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("accessToken");

      // No token means user is not logged in
      if (!token) {
        setUser(null);
        setIsGuest(true);
        return;
      }

      // Try to fetch profile with existing token
      const u = await authService.getMyProfile(token);
      setUser(u);
      setIsGuest(false);
    } catch (err) {
      console.error("Failed to fetch user:", err);

      // If profile fetch fails, it means token is invalid/expired
      // The interceptor will try to refresh automatically
      // If refresh also fails, tokens will be cleared by interceptor

      // Clear local state
      setUser(null);
      setIsGuest(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Login: sử dụng authService, lưu token, fetch user
  const login = async (email, password) => {
    const res = await authService.login(email, password); // trả về { accessToken, refreshToken, roles }
    await fetchUser(); // cập nhật user từ token mới
    return res;
  };

  // Logout: logic hoàn toàn trong AuthContext
  const logout = async () => {
    try {
      // Xóa token + roles khỏi AsyncStorage
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "roles"]);
      setUser(null); // reset user
      setIsGuest(true); // return to guest mode
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Switch to guest mode explicitly
  const continueAsGuest = () => {
    setIsGuest(true);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isGuest,
        isLoading,
        continueAsGuest,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
