import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Animated,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

const ICON_SIZE = 26;
const PANEL_WIDTH_COLLAPSED = 60;
const PANEL_WIDTH_EXPANDED = 300;

export default function PenSettingsPanel({
  tool,
  setTool,
  config = {},
  onSettingChange,
  visible,
}) {
  const [expanded, setExpanded] = useState(false);

  const position = useRef(new Animated.ValueXY({ x: 300, y: 200 })).current;
  const widthAnim = useRef(new Animated.Value(PANEL_WIDTH_COLLAPSED)).current;
  const tapStartTime = useRef(0);

  const toggleExpand = useCallback(() => {
    const targetWidth = expanded ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;
    setExpanded((prev) => !prev);
    Animated.spring(widthAnim, {
      toValue: targetWidth,
      friction: 6,
      tension: 120,
      useNativeDriver: false,
    }).start();
  }, [expanded, widthAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          tapStartTime.current = Date.now();
          position.setOffset({
            x: position.x._value,
            y: position.y._value,
          });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: position.x, dy: position.y }],
          {
            useNativeDriver: false,
          }
        ),
        onPanResponderRelease: (_, gesture) => {
          position.flattenOffset();
          const pressDuration = Date.now() - tapStartTime.current;
          if (
            Math.abs(gesture.dx) < 5 &&
            Math.abs(gesture.dy) < 5 &&
            pressDuration < 200
          ) {
            toggleExpand();
          }
        },
      }),
    [position, toggleExpand]
  );

  const handleValueChange = useCallback(
    (key, value) => {
      requestAnimationFrame(() => {
        onSettingChange(tool, key, value);
      });
    },
    [tool, onSettingChange]
  );

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: widthAnim,
          transform: [{ translateX: position.x }, { translateY: position.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.header}>
        <View style={styles.dragZone}>
          {expanded ? (
            <Text style={styles.title}>Pen Settings</Text>
          ) : (
            <MaterialIcons name="edit" size={ICON_SIZE} color="#fff" />
          )}
        </View>
      </View>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.toolRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
            >
              {[
                { name: "pen", icon: "pen" },
                { name: "pencil", icon: "pencil-outline" },
                { name: "brush", icon: "brush" },
                { name: "calligraphy", icon: "fountain-pen" },
                { name: "highlighter", icon: "marker" },
                { name: "marker", icon: "marker-check" },
                { name: "airbrush", icon: "spray" },
                { name: "crayon", icon: "lead-pencil" },
              ].map((item) => (
                <TouchableOpacity
                  key={item.name}
                  onPress={() => setTool(item.name)}
                  style={[
                    styles.toolButton,
                    tool === item.name && styles.activeTool,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={ICON_SIZE}
                    color={tool === item.name ? "#2563eb" : "#aaa"}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Scrollable sliders area */}
          <ScrollView style={{ maxHeight: 360 }}>
            {/* Core sliders */}
            {[
              {
                key: "pressure",
                label: "Pressure",
                icon: "gesture-tap",
                color: "#3b82f6",
                min: 0,
                max: 1,
                step: 0.01,
                valueLabel: `${Math.round((config.pressure ?? 0.5) * 100)}%`,
              },
              {
                key: "thickness",
                label: "Thickness",
                icon: "circle-outline",
                color: "#10b981",
                min: 0.2,
                max: 5,
                step: 0.05,
                valueLabel: `${(config.thickness ?? 1).toFixed(2)} mm`,
              },
              {
                key: "stabilization",
                label: "Stabilization",
                icon: "gesture",
                color: "#f59e0b",
                min: 0,
                max: 1,
                step: 0.01,
                valueLabel: `${Math.round((config.stabilization ?? 0) * 100)}%`,
              },
            ].map((item) => (
              <View key={item.key} style={styles.sliderBlock}>
                <View style={styles.sliderHeader}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={16}
                    color="#111"
                  />
                  <Text style={styles.label}>{` ${item.label}`}</Text>
                  <Text style={styles.valueText}>{item.valueLabel}</Text>
                </View>
                <Slider
                  value={config[item.key] ?? 0}
                  onValueChange={(v) => handleValueChange(item.key, v)}
                  minimumValue={item.min}
                  maximumValue={item.max}
                  step={item.step}
                  minimumTrackTintColor={item.color}
                  maximumTrackTintColor="#ccc"
                  thumbTintColor="#000"
                />
              </View>
            ))}

            {/* Advanced per-tool sliders */}
            {tool === "brush" && (
              <View style={styles.sliderBlock}>
                <View style={styles.sliderHeader}>
                  <MaterialCommunityIcons name="blur" size={16} color="#111" />
                  <Text style={styles.label}> Brush softness</Text>
                  <Text style={styles.valueText}>{`${Math.round(
                    (config.brushSoftness ?? 0.28) * 100
                  )}%`}</Text>
                </View>
                <Slider
                  value={config.brushSoftness ?? 0.28}
                  onValueChange={(v) => handleValueChange("brushSoftness", v)}
                  minimumValue={0.06}
                  maximumValue={0.6}
                  step={0.01}
                  minimumTrackTintColor="#7c3aed"
                  maximumTrackTintColor="#ccc"
                  thumbTintColor="#000"
                />
              </View>
            )}

            {tool === "calligraphy" && (
              <View style={styles.sliderBlock}>
                <View style={styles.sliderHeader}>
                  <MaterialCommunityIcons
                    name="alpha-a"
                    size={16}
                    color="#111"
                  />
                  <Text style={styles.label}> Calligraphy tilt</Text>
                  <Text style={styles.valueText}>{`${Math.round(
                    (config.calligraphyAngle ?? 0.6) * 100
                  )}%`}</Text>
                </View>
                <Slider
                  value={config.calligraphyAngle ?? 0.6}
                  onValueChange={(v) =>
                    handleValueChange("calligraphyAngle", v)
                  }
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  minimumTrackTintColor="#ef4444"
                  maximumTrackTintColor="#ccc"
                  thumbTintColor="#000"
                />
              </View>
            )}

            {tool === "airbrush" && (
              <>
                <View style={styles.sliderBlock}>
                  <View style={styles.sliderHeader}>
                    <MaterialCommunityIcons
                      name="spray"
                      size={16}
                      color="#111"
                    />
                    <Text style={styles.label}> Airbrush spread</Text>
                    <Text style={styles.valueText}>{`${(
                      config.airbrushSpread ?? 1.6
                    ).toFixed(2)}x`}</Text>
                  </View>
                  <Slider
                    value={config.airbrushSpread ?? 1.6}
                    onValueChange={(v) =>
                      handleValueChange("airbrushSpread", v)
                    }
                    minimumValue={0.6}
                    maximumValue={3}
                    step={0.02}
                    minimumTrackTintColor="#06b6d4"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#000"
                  />
                </View>

                <View style={styles.sliderBlock}>
                  <View style={styles.sliderHeader}>
                    <MaterialCommunityIcons
                      name="dots-horizontal"
                      size={16}
                      color="#111"
                    />
                    <Text style={styles.label}> Airbrush density</Text>
                    <Text style={styles.valueText}>{`${Math.round(
                      (config.airbrushDensity ?? 0.55) * 100
                    )}%`}</Text>
                  </View>
                  <Slider
                    value={config.airbrushDensity ?? 0.55}
                    onValueChange={(v) =>
                      handleValueChange("airbrushDensity", v)
                    }
                    minimumValue={0.08}
                    maximumValue={1}
                    step={0.01}
                    minimumTrackTintColor="#06b6d4"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#000"
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: { alignItems: "center" },
  dragZone: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "100%",
  },
  title: { color: "#fff", fontWeight: "600", fontSize: 15 },
  content: { marginTop: 12 },
  toolRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  toolButton: { padding: 6, borderRadius: 12, marginHorizontal: 6 },
  activeTool: {
    backgroundColor: "rgba(59,130,246,0.2)",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  sliderBlock: { marginBottom: 14 },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    flex: 1,
    color: "#111",
    fontWeight: "500",
    fontSize: 13,
    marginLeft: 4,
  },
  valueText: { color: "#111", fontSize: 12, fontWeight: "500" },
});
