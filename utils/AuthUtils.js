import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { authService } from "../service/authService";

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    console.warn("⚠️ Invalid token (cannot decode)");
    return null;
  }
};

export const getUserFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      return null;
    }
    const decoded = decodeToken(token);

    if (!decoded) {
      return null;
    }

    const sub = decoded?.sub;

    if (!sub) return null;

    const user = await authService.getCurrentUser(sub);
    console.log(user);
    return user || null;
  } catch (e) {
    if (e.message?.includes("Unauthenticated")) {
      console.warn("⚠️ User not authenticated (token expired or invalid)");
      return null;
    }

    console.error("Error getting user from token:", e);
    return null;
  }
};
