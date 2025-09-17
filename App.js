import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {" "}
      <NavigationContainer>
        {" "}
        <AppNavigator />{" "}
      </NavigationContainer>{" "}
      <Toast />{" "}
    </GestureHandlerRootView>
  );
}
