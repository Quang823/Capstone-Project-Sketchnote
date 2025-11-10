// App.js
import React, { useEffect, useCallback } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "./context/ToastContext";
import { FontProvider } from "./context/FontContext";
import AppNavigator from "./navigation/AppNavigator";
import useLoadFonts from "./hooks/useLoadFonts";
import { CartProvider } from "./context/CartContext";
import * as SplashScreen from "expo-splash-screen";
import { BackgroundJsonParser } from "./utils/jsonUtils";
import ErrorBoundary from "./components/ErrorBoundary";

// Ngăn splash tự ẩn sớm
SplashScreen.preventAutoHideAsync();

// ✅ Global error handler để bắt unhandled promise rejections và errors
// Giúp app không crash khi có lỗi không được xử lý
if (typeof ErrorUtils !== "undefined") {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("🚨 Global Error Handler:", error, "isFatal:", isFatal);
    // Log error nhưng không crash app ngay lập tức
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

// ✅ Handle unhandled promise rejections
// Tránh crash khi có promise rejection không được catch
if (typeof global !== "undefined") {
  const originalUnhandledRejection = global.onunhandledrejection;
  global.onunhandledrejection = (event) => {
    console.error("🚨 Unhandled Promise Rejection:", event?.reason || event);
    // Prevent default crash behavior
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    if (originalUnhandledRejection) {
      originalUnhandledRejection(event);
    }
  };
}

export default function App() {
  const fontsLoaded = useLoadFonts();

  // Callback này gọi khi layout đã render => ẩn splash
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Nếu fonts chưa load xong thì chưa render UI
  if (!fontsLoaded) {
    return null;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary fallbackText="The background parser has crashed. Please restart the app.">
        <BackgroundJsonParser />
      </ErrorBoundary>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <CartProvider>
          <FontProvider fontsLoaded={fontsLoaded}>
            <ToastProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </ToastProvider>
          </FontProvider>
        </CartProvider>
      </View>
    </GestureHandlerRootView>
  );
}
