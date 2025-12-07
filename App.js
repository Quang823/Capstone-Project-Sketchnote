// App.js
import React, { useEffect, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "./context/ToastContext";
import { FontProvider } from "./context/FontContext";
import AppNavigator from "./navigation/AppNavigator";
import useLoadFonts from "./hooks/useLoadFonts";
import { CartProvider } from "./context/CartContext";
import { NavigationProvider } from "./context/NavigationContext";
import GlobalSidebar from "./components/navigation/GlobalSidebar";
import * as SplashScreen from "expo-splash-screen";
import { BackgroundJsonParser } from "./utils/jsonUtils";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import ChatWidget from "./components/ChatWidget";
import LottieView from "lottie-react-native";
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
  const [currentRoute, setCurrentRoute] = React.useState("GuestHome");
  const [chatVisible, setChatVisible] = React.useState(false);

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

  const excludedRoutes = [
    "Login",
    "Register",
    "VerifyEmail",
    "GuestHome",
    "ForgetPassword",
    "ResetPassword",
    "DrawingScreen",
  ];

  const shouldShowChat = !excludedRoutes.includes(currentRoute);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ErrorBoundary fallbackText="The background parser has crashed. Please restart the app.">
            <BackgroundJsonParser />
          </ErrorBoundary>
          <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <CartProvider>
              <FontProvider fontsLoaded={fontsLoaded}>
                <ToastProvider>
                  <NavigationProvider>
                    <NavigationContainer
                      onStateChange={(state) => {
                        const routeName = state?.routes[state.index]?.name;
                        if (routeName) {
                          setCurrentRoute(routeName);
                        }
                      }}
                    >
                      <AppNavigator />
                      <GlobalSidebar />
                      {shouldShowChat && (
                        <>
                          <TouchableOpacity
                            onPress={() => setChatVisible(true)}
                            activeOpacity={0.8}
                            style={{
                              position: "absolute",
                              right: 20,
                              bottom: 40,
                              zIndex: 50,
                            }}
                          >
                            <LottieView
                              source={require("./assets/chatbox.json")}
                              autoPlay
                              loop
                              style={{
                                width: 80,
                                height: 80,
                              }}
                            />
                          </TouchableOpacity>
                          <ChatWidget
                            visible={chatVisible}
                            onClose={() => setChatVisible(false)}
                          />
                        </>
                      )}
                    </NavigationContainer>
                  </NavigationProvider>
                </ToastProvider>
              </FontProvider>
            </CartProvider>
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
