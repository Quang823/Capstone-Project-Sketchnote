// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../service/authService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isGuest, setIsGuest] = useState(true); // true until we verify authentication
  const [isLoading, setIsLoading] = useState(true); // true during initial auth check

  // Lấy user từ token khi app load
  const fetchUser = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const token = await AsyncStorage.getItem("accessToken");

      // No token means user is not logged in (expected scenario)
      if (!token) {
        setUser(null);
        setRoles([]);
        setIsGuest(true);
        return;
      }

      // Get roles from storage
      const storedRoles = await AsyncStorage.getItem("roles");
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      } else if (token) {
        try {
          const decoded = jwtDecode(token);
          const rolesFromToken = decoded?.realm_access?.roles || [];
          setRoles(rolesFromToken);
          await AsyncStorage.setItem("roles", JSON.stringify(rolesFromToken));
        } catch (e) {
          console.warn("Error decoding token in fetchUser:", e);
        }
      }

      // Try to fetch profile with existing token
      const u = await authService.getMyProfile(token);
      setUser(u);
      setIsGuest(false);
    } catch (err) {
      // If profile fetch fails, it means token is invalid/expired
      // The interceptor will try to refresh automatically
      // If refresh also fails, tokens will be cleared by interceptor

      // Only log unexpected errors (not auth-related)
      if (!err.message?.includes("Invalid email or password") &&
        !err.message?.includes("Unauthorized")) {
        console.warn("Unexpected error fetching user:", err);
      }

      // Clear local state (this is expected when tokens expire)
      setUser(null);
      setRoles([]);
      setIsGuest(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Login: sử dụng authService, lưu token, fetch user
  const login = async (email, password) => {
    const res = await authService.login(email, password); // trả về { accessToken, refreshToken, roles }
    if (res?.roles) {
      setRoles(res.roles);
    }
    await fetchUser(); // cập nhật user từ token mới
    return res;
  };

  // Logout: logic hoàn toàn trong AuthContext
  const logout = async () => {
    try {
      // Xóa token + roles khỏi AsyncStorage
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "roles"]);
      setUser(null); // reset user
      setRoles([]); // reset roles
      setIsGuest(true); // return to guest mode
    } catch (err) {
      console.warn("Logout failed:", err);
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
        roles,
        setRoles,
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
