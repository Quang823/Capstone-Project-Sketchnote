import React from "react";
import { View, TouchableOpacity } from "react-native";

export default function ColorButton({ color, isSelected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: color,
          borderWidth: isSelected ? 3 : color === "#ffffff" ? 1 : 0,
          borderColor: isSelected ? "#3b82f6" : "#374151",
          marginHorizontal: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        }}
      />
    </TouchableOpacity>
  );
}
