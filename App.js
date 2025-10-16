// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastProvider } from "./context/ToastContext";
import { FontProvider } from "./context/FontContext";
import AppNavigator from "./navigation/AppNavigator";
import useLoadFonts from "./hooks/useLoadFonts";
import AppLoading from "expo-app-loading";

export default function App() {
  const fontsLoaded = useLoadFonts();

  if (!fontsLoaded) return <AppLoading />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FontProvider fontsLoaded={fontsLoaded}>
        <ToastProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ToastProvider>
      </FontProvider>
    </GestureHandlerRootView>
  );
}
