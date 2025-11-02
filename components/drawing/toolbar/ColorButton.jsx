import React, { useRef, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ColorDropdown from "./ColorDropdown";

export default function ColorButton({
  color,
  isSelected,
  onPress,
  onSelectColor,
  onSelectColorSet,
  selectedColor,
  colorHistory, // 👈 Thêm prop
}) {
  const buttonRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePress = () => {
    if (isSelected) setShowDropdown(true);
    else onPress?.();
  };

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View
          style={{
            width: 32, // nhỏ hơn (40 → 32)
            height: 32,
            borderRadius: 10,
            backgroundColor: color,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? "#3b82f6" : "#000000",
            marginHorizontal: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 1.5,
            elevation: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isSelected && (
            <MaterialIcons name="arrow-drop-down" size={18} color="#3b82f6" />
          )}
        </View>
      </TouchableOpacity>

      {/* Dropdown */}
      <ColorDropdown
        visible={showDropdown}
        from={buttonRef}
        onClose={() => setShowDropdown(false)}
        selectedColor={selectedColor || color}
        colorHistory={colorHistory} // 👈 Truyền colorHistory
        onSelectColor={(c) => {
          onSelectColor(c);
          setShowDropdown(false);
        }}
        onSelectColorSet={(colors) => {
          if (onSelectColorSet) onSelectColorSet(colors);
          setShowDropdown(false);
        }}
      />
    </>
  );
}
