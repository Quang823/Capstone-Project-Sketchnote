// ToolButton.jsx
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

export default function ToolButton({ active, icon, children, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        active && styles.buttonActive,
        active && styles.buttonShadow,
      ]}
    >
      {icon || children} {/* <- supports both props.icon and children */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#374151",
  },
  buttonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#3b82f6",
  },
  buttonShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
