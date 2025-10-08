

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const decodeToken = (token) => {
  try {
    return jwtDecode(token); 
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

export const getUserFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      name: decoded?.name,
      email: decoded?.email,
      username: decoded?.preferred_username,
      roles: decoded?.realm_access?.roles || [],
    };
  } catch (e) {
    console.error("Error getting user from token:", e);
    return null;
  }
};


