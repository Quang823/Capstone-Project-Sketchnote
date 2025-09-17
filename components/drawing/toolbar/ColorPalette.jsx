import React from "react";
import { View, ScrollView } from "react-native";
import ColorButton from "./ColorButton";
import { DEFAULT_COLORS } from "./constants";

export default function ColorPalette({ color, setColor }) {
  return (
    <View style={{ paddingTop: 12, paddingBottom: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          alignItems: "center",
        }}
      >
        {DEFAULT_COLORS.map((c) => (
          <ColorButton
            key={c}
            color={c}
            isSelected={color === c}
            onPress={() => setColor(c)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
