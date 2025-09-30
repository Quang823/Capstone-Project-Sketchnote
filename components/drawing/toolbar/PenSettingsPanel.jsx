import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
} from "react-native";
import Slider from "@react-native-community/slider";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const ICON_SIZE = 26;

export default function PenSettingsPanel({
  tool,
  setTool,
  pressure,
  setPressure,
  thickness,
  setThickness,
  stabilization,
  setStabilization,
  visible,
}) {
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 200 });

  // PanResponder để kéo modal
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      setPosition({
        x: position.x + gesture.dx,
        y: position.y + gesture.dy,
      });
    },
    onPanResponderRelease: () => {},
  });

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        { top: position.y, left: position.x, width: expanded ? 280 : 50 },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Drag handle + nút toggle */}
      <View style={styles.header}>
        {expanded && <View style={styles.dragHandle} />}
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.toggleButton}
        >
          {expanded ? (
            <Text style={styles.title}>Pen Settings</Text>
          ) : (
            <MaterialIcons name="settings" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Nội dung */}
      {expanded && (
        <View style={styles.content}>
          {/* Icon các bút */}
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setTool("pen")}>
              <MaterialCommunityIcons
                name="pen"
                size={ICON_SIZE}
                color={tool === "pen" ? "#007AFF" : "#bbb"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTool("pencil")}>
              <FontAwesome5
                name="pencil-alt"
                size={ICON_SIZE}
                color={tool === "pencil" ? "#007AFF" : "#bbb"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTool("brush")}>
              <MaterialCommunityIcons
                name="brush-variant"
                size={ICON_SIZE}
                color={tool === "brush" ? "#007AFF" : "#bbb"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTool("calligraphy")}>
              <MaterialCommunityIcons
                name="fountain-pen"
                size={ICON_SIZE}
                color={tool === "calligraphy" ? "#007AFF" : "#bbb"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTool("highlighter")}>
              <MaterialCommunityIcons
                name="marker"
                size={ICON_SIZE}
                color={tool === "highlighter" ? "#007AFF" : "#bbb"}
              />
            </TouchableOpacity>
          </View>

          {/* Pressure */}
          <Text style={styles.label}>
            Pressure sensitivity: {Math.round(pressure * 100)}%
          </Text>
          <Slider
            value={pressure}
            onValueChange={setPressure}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
          />

          {/* Thickness */}
          <Text style={styles.label}>Thickness: {thickness.toFixed(2)} mm</Text>
          <Slider
            value={thickness}
            onValueChange={setThickness}
            minimumValue={0.1}
            maximumValue={2}
            step={0.05}
          />

          {/* Stabilization */}
          <Text style={styles.label}>
            Stroke Stabilization: {Math.round(stabilization * 100)}%
          </Text>
          <Slider
            value={stabilization}
            onValueChange={setStabilization}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 8,
    zIndex: 999,
  },
  header: {
    alignItems: "center",
  },
  dragHandle: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#888",
    marginBottom: 6,
  },
  toggleButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 8,
  },
  content: {
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  label: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 4,
  },
});
