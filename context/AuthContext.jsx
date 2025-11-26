// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../service/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Lấy user từ token khi app load
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setUser(null);
        return;
      }
      const u = await authService.getMyProfile(token);
      setUser(u);
    } catch (err) {
      setUser(null);
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
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
