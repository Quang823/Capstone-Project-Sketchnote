import React from "react";
import { View, ScrollView } from "react-native";
import ColorButton from "./ColorButton";

export default function ColorPalette({
  colors,
  selectedColor,
  onSelectColor,
  onSelectColorSet, // 👈 thêm prop mới
  colorHistory, // 👈 Thêm colorHistory
}) {
  return (
    <View style={{ paddingVertical: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          alignItems: "center",
        }}
      >
        {colors.map((c, index) => (
          <ColorButton
            key={c + index}
            color={c}
            isSelected={selectedColor === c}
            selectedColor={selectedColor}
            colorHistory={colorHistory} // 👈 Truyền colorHistory
            onPress={() => onSelectColor(c, index)}
            onSelectColor={(newColor) => onSelectColor(newColor, index)}
            onSelectColorSet={onSelectColorSet} // 👈 thêm
          />
        ))}
      </ScrollView>
    </View>
  );
}
