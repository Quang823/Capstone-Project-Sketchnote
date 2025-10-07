import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

export default function ToolButton({ active, icon, children, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, active && styles.buttonActive]}
      activeOpacity={0.7}
    >
      {icon || children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
