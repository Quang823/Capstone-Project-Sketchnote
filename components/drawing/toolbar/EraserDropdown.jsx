import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Slider from "@react-native-community/slider";
import Popover from "react-native-popover-view";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Checkerboard nền mờ 8x8 pixel
const CHECKER_BG = {
  uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAM0lEQVQoU2NkIAIwEqmOgYGB4T8dAqYgikDUAqZhoAgpEACMGAaMUIXgEwM+EwQUGwAAEAgbV7KDGU6eAAAAAElFTkSuQmCC",
};

export default function EraserDropdown({
  from,
  visible,
  onClose,
  eraserMode,
  setEraserMode,
  eraserSize,
  setEraserSize,
}) {
  const modes = [
    { name: "pixel", icon: "circle-outline", label: "Pixel" },
    { name: "stroke", icon: "gesture", label: "Stroke" },
    { name: "object", icon: "select-drag", label: "Object" },
  ];

  return (
    <Popover
      isVisible={visible}
      from={from}
      placement="bottom"
      offset={10}
      onRequestClose={onClose}
      arrowStyle={{ backgroundColor: "transparent" }}
      backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      animationType="fade"
    >
      <View style={styles.container}>
        <Text style={styles.header}>Eraser Settings</Text>

        {/* 🎯 Mode Selector */}
        <View style={styles.modeRow}>
          {modes.map((m) => {
            const active = eraserMode === m.name;
            return (
              <TouchableOpacity
                key={m.name}
                style={[styles.modeButton, active && styles.modeButtonActive]}
                onPress={() => setEraserMode(m.name)}
                activeOpacity={0.9}
              >
                {active ? (
                  <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    style={styles.modeButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name={m.icon}
                      size={22}
                      color="#fff"
                    />
                    <Text style={[styles.modeLabel, { color: "#fff" }]}>
                      {m.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name={m.icon}
                      size={22}
                      color="#334155"
                    />
                    <Text style={styles.modeLabel}>{m.label}</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ⚙️ Size Preview & Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            Size:{" "}
            <Text style={{ fontWeight: "700", color: "#1e293b" }}>
              {eraserSize.toFixed(1)} px
            </Text>
          </Text>

          <ImageBackground
            source={CHECKER_BG}
            resizeMode="repeat"
            style={styles.previewContainer}
            imageStyle={{ opacity: 0.25 }}
          >
            <View
              style={[
                styles.sizePreview,
                {
                  width: eraserSize,
                  height: eraserSize,
                  borderRadius: eraserSize / 2,
                },
              ]}
            />
          </ImageBackground>

          <Slider
            style={styles.slider}
            minimumValue={4}
            maximumValue={60}
            step={0.5}
            value={eraserSize}
            onValueChange={setEraserSize}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#cbd5e1"
            thumbTintColor="#2563eb"
          />

          {/* Label scale */}
          <View style={styles.sliderScale}>
            <Text style={styles.scaleText}>Small</Text>
            <Text style={styles.scaleText}>Medium</Text>
            <Text style={styles.scaleText}>Large</Text>
          </View>
        </View>

        {/* ✅ Done Button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            style={styles.doneGradient}
          >
            <MaterialCommunityIcons name="check" size={18} color="#fff" />
            <Text style={styles.doneText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Popover>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 270,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  header: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 14,
  },
  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginHorizontal: 4,
    height: 58,
    backgroundColor: "#f8fafc",
  },
  modeButtonGradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonActive: {
    borderColor: "#2563eb",
  },
  modeLabel: {
    fontSize: 12.5,
    marginTop: 3,
    color: "#475569",
    fontWeight: "500",
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 14,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
  },
  previewContainer: {
    height: 80,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
    backgroundColor: "#f1f5f9",
  },
  sizePreview: {
    backgroundColor: "#334155",
    opacity: 0.6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  slider: {
    width: 200,
    height: 30,
  },
  sliderScale: {
    width: 200,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  scaleText: {
    fontSize: 11,
    color: "#64748b",
  },
  doneBtn: {
    alignSelf: "center",
    marginTop: 8,
    width: 120,
    borderRadius: 10,
    overflow: "hidden",
  },
  doneGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  doneText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 6,
  },
});