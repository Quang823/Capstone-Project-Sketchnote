import React, { useState } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons, Entypo, Feather } from "@expo/vector-icons";

export default function HeaderToolbar({
  onBack,
  onToggleToolbar,
  onLayers,
  onAddPage,
  onPreview,
  onSettings,
  onMore,
  onTogglePenType, // callback báo cho cha biết chế độ vẽ
}) {
  const [isPenMode, setIsPenMode] = useState(false); // true = stylus, false = hand

  const renderButton = (
    icon,
    onPress,
    IconComponent = Ionicons,
    active = false
  ) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          borderRadius: 12,
          backgroundColor: active ? "#E0F2FE" : "transparent", // highlight khi active
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.iconButton}
        >
          <IconComponent name={icon} size={22} color="#111827" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {/* Left */}
        <View style={[styles.row, { gap: 12 }]}>
          {renderButton("arrow-back", onBack, Ionicons)}
          {renderButton("camera-outline", () => console.log("Camera"))}
          {renderButton("crop", () => console.log("Crop"), MaterialIcons)}
          {renderButton("mic-outline", () => console.log("Mic"), Ionicons)}
        </View>

        {/* Right */}
        <View style={[styles.row, { gap: 12 }]}>
          {renderButton("circle-with-cross", onToggleToolbar, Entypo)}

          {/* ✍️ Toggle Pen / Hand mode */}
          {renderButton(
            isPenMode ? "pencil" : "hand-left-outline", // fix icon tay
            () => {
              const nextMode = !isPenMode;
              setIsPenMode(nextMode);
              onTogglePenType?.(nextMode); // báo cho cha biết mode
            },
            Ionicons,
            true // luôn highlight khi active
          )}

          {renderButton("layers", onLayers, MaterialIcons)}
          {renderButton("add-circle-outline", onAddPage, Ionicons)}
          {renderButton("preview", onPreview, MaterialIcons)}
          {renderButton("settings", onSettings, Feather)}
          {renderButton("dots-three-vertical", onMore, Entypo)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    borderRadius: 12,
    padding: 6,
  },
});
