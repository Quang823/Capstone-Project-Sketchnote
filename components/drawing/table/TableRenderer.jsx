import React from "react";
import { Rect, Line, Group } from "@shopify/react-native-skia";

export default function TableRenderer({ table, isSelected }) {
  if (!table || !table.rows || !table.cols) return null;

  const {
    x = 0,
    y = 0,
    width = 300,
    height = 200,
    rows = 3,
    cols = 3,
    rotation = 0,
    strokeColor = "#1e293b",
    strokeWidth = 2,
  } = table;

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  // Center point for rotation
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <Group
      transform={[
        { translateX: centerX },
        { translateY: centerY },
        { rotate: (rotation * Math.PI) / 180 },
        { translateX: -centerX },
        { translateY: -centerY },
      ]}
    >
      {/* Background */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        color={isSelected ? "rgba(59, 130, 246, 0.05)" : "rgba(255,255,255,0.95)"}
      />

      {/* Outer border */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        style="stroke"
        strokeWidth={strokeWidth}
        color={strokeColor}
      />

      {/* Vertical lines */}
      {Array.from({ length: cols - 1 }).map((_, i) => {
        const lineX = x + (i + 1) * cellWidth;
        return (
          <Line
            key={`v-${i}`}
            p1={{ x: lineX, y }}
            p2={{ x: lineX, y: y + height }}
            color={strokeColor}
            strokeWidth={strokeWidth * 0.7}
          />
        );
      })}

      {/* Horizontal lines */}
      {Array.from({ length: rows - 1 }).map((_, i) => {
        const lineY = y + (i + 1) * cellHeight;
        return (
          <Line
            key={`h-${i}`}
            p1={{ x, y: lineY }}
            p2={{ x: x + width, y: lineY }}
            color={strokeColor}
            strokeWidth={strokeWidth * 0.7}
          />
        );
      })}

      {/* Selection border */}
      {isSelected && (
        <Rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          style="stroke"
          strokeWidth={2}
          color="#3b82f6"
        />
      )}
    </Group>
  );
}
