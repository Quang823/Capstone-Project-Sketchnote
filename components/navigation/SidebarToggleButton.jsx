import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "../../context/NavigationContext";

// Toggle Button Component - có thể đặt ở bất kỳ đâu trong app
export default function SidebarToggleButton({ style, iconColor = "#4F46E5", iconSize = 28 }) {
  const { toggleSidebar } = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.toggleButton, style]}
      onPress={toggleSidebar}
      activeOpacity={0.7}
    >
      <Icon name="menu" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
