import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Line, Rect } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GridTableBox({
  grid,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}) {
  const translateX = useSharedValue(grid.x || 0);
  const translateY = useSharedValue(grid.y || 0);
  const width = useSharedValue(grid.width || 200);
  const height = useSharedValue(grid.height || 200);

  const [localGrid, setLocalGrid] = useState(grid);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  const updateGrid = (updates) => {
    const newGrid = { ...localGrid, ...updates };
    setLocalGrid(newGrid);
    if (onUpdate) {
      onUpdate(newGrid);
    }
  };

  // Pan gesture for moving
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(onSelect)();
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(updateGrid)({
        x: translateX.value,
        y: translateY.value,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const renderGrid = () => {
    const lines = [];
    const cols = localGrid.cols || 5;
    const rows = localGrid.rows || 5;
    const w = width.value;
    const h = height.value;
    const cellWidth = w / cols;
    const cellHeight = h / rows;

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * cellWidth;
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={h}
          stroke={localGrid.color || "#1e293b"}
          strokeWidth={localGrid.strokeWidth || 2}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * cellHeight;
      lines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={w}
          y2={y}
          stroke={localGrid.color || "#1e293b"}
          strokeWidth={localGrid.strokeWidth || 2}
        />
      );
    }

    return lines;
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Svg width={width.value} height={height.value}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={width.value}
            height={height.value}
            fill={localGrid.backgroundColor || "transparent"}
          />
          {renderGrid()}
        </Svg>

        {/* Selection border and resize handles */}
        {isSelected && (
          <View style={styles.selectionOverlay}>
            <View style={[styles.selectionBorder, { width: width.value, height: height.value }]} />
            
            {/* Resize handles */}
            <View style={[styles.handle, styles.handleTopLeft]} />
            <View style={[styles.handle, styles.handleTopRight, { left: width.value - 8 }]} />
            <View style={[styles.handle, styles.handleBottomLeft, { top: height.value - 8 }]} />
            <View style={[styles.handle, styles.handleBottomRight, { left: width.value - 8, top: height.value - 8 }]} />
            
            {/* Delete button */}
            <View style={[styles.deleteButton, { left: width.value - 30 }]}>
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color="#ef4444"
                onPress={onDelete}
              />
            </View>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  selectionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  selectionBorder: {
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderStyle: "dashed",
  },
  handle: {
    position: "absolute",
    width: 16,
    height: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 8,
  },
  handleTopLeft: {
    top: -8,
    left: -8,
  },
  handleTopRight: {
    top: -8,
  },
  handleBottomLeft: {
    left: -8,
  },
  handleBottomRight: {},
  deleteButton: {
    position: "absolute",
    top: -32,
  },
});
