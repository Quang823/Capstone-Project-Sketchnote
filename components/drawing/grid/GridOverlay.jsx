import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";

const SCREEN = Dimensions.get("window");

export default function GridOverlay({ visible, gridSize = 20, gridColor = "#cbd5e1", gridType = "square" }) {
  if (!visible) return null;

  const width = SCREEN.width;
  const height = SCREEN.height;

  const renderSquareGrid = () => {
    const lines = [];
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(<Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={height} stroke={gridColor} strokeWidth={1} />);
    }
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(<Line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={gridColor} strokeWidth={1} />);
    }
    return lines;
  };

  const renderDotGrid = () => {
    const dots = [];
    for (let x = 0; x <= width; x += gridSize) {
      for (let y = 0; y <= height; y += gridSize) {
        dots.push(<Circle key={`dot-${x}-${y}`} cx={x} cy={y} r={1.5} fill={gridColor} />);
      }
    }
    return dots;
  };

  const renderLineGrid = () => {
    const lines = [];
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(<Line key={`h-${y}`} x1={0} y1={y} x2={width} y2={y} stroke={gridColor} strokeWidth={1} />);
    }
    return lines;
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Svg width={width} height={height}>
        {gridType === "square" && renderSquareGrid()}
        {gridType === "dot" && renderDotGrid()}
        {gridType === "line" && renderLineGrid()}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
});
