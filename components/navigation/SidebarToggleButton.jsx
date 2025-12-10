import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "../../context/NavigationContext";
import { useTheme } from "../../context/ThemeContext";

// Toggle Button Component - có thể đặt ở bất kỳ đâu trong app
export default function SidebarToggleButton({
  style,
  iconColor,
  iconSize = 28,
  onPress,
}) {
  const { toggleSidebar } = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Determine icon color: use prop if provided, otherwise default based on theme
  const finalIconColor = iconColor || (isDark ? "#FFFFFF" : "#4F46E5");

  return (
    <TouchableOpacity
      style={[styles.toggleButton, isDark && styles.toggleButtonDark, style]}
      onPress={onPress || toggleSidebar}
      activeOpacity={0.7}
    >
      <Icon name="menu" size={iconSize} color={finalIconColor} />
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
  toggleButtonDark: {
    backgroundColor: "#1E293B",
    shadowColor: "#000",
    shadowOpacity: 0.3,
  },
});
