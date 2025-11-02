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

// Ngăn splash tự ẩn sớm
SplashScreen.preventAutoHideAsync();

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
