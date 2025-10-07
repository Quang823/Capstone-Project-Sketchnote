// ColorDropdown.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  PanResponder,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Popover from "react-native-popover-view";
import { COLOR_SETS } from "./constants";

// ===== Utility =====
function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  const r = Math.round(255 * f(5));
  const g = Math.round(255 * f(3));
  const b = Math.round(255 * f(1));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsv(hex) {
  let r = 0,
    g = 0,
    b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h,
    s = max === 0 ? 0 : d / max;
  let v = max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

function hexToRgba(hex, opacity) {
  if (!hex || !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
    return `rgba(0,0,0,${opacity / 100})`;
  }
  hex = hex.replace("#", "");
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

const useThrottledCallback = (callback, delay) => {
  const lastCallRef = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

// ===== Component =====
export default function ColorDropdown({
  visible,
  from,
  onClose,
  onSelectColor = () => {},
  onSelectColorSet = () => {},
  selectedColor = "#3b82f6",
}) {
  const [tab, setTab] = useState("palette");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [value, setValue] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [boxSize, setBoxSize] = useState({ width: 316, height: 180 });
  const [isDragging, setIsDragging] = useState(false);

  const cursorAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const throttledUpdateSV = useThrottledCallback((s, v) => {
    setSaturation(s);
    setValue(v);
  }, 30);

  // ===== Init on open =====
  useEffect(() => {
    if (visible && selectedColor) {
      let baseHex = selectedColor;
      let initOpacity = 100;
      if (baseHex.startsWith("rgba")) {
        const match = baseHex.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/
        );
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
          baseHex = `#${[r, g, b]
            .map((x) => x.toString(16).padStart(2, "0"))
            .join("")}`;
          initOpacity = Math.round(a * 100);
        }
      }

      const { h, s, v } = hexToHsv(baseHex);
      setHue(h);
      setSaturation(s);
      setValue(v);
      setOpacity(initOpacity);

      // reset cursor position here only
      cursorAnim.setValue({
        x: (s / 100) * boxSize.width,
        y: ((100 - v) / 100) * boxSize.height,
      });
    }
  }, [visible, selectedColor]);

  // ===== Handlers =====
  const updateCursor = (x, y) => {
    x = Math.max(0, Math.min(x, boxSize.width));
    y = Math.max(0, Math.min(y, boxSize.height));
    cursorAnim.setValue({ x, y });

    const s = Math.round((x / boxSize.width) * 100);
    const v = Math.round(100 - (y / boxSize.height) * 100);
    throttledUpdateSV(s, v);
  };

  const handleApply = () => {
    const finalHex = hsvToHex(hue, saturation, value);
    const finalColor = hexToRgba(finalHex, opacity);
    onSelectColor(finalColor);
    onClose();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      updateCursor(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
    },
    onPanResponderMove: (evt) =>
      updateCursor(evt.nativeEvent.locationX, evt.nativeEvent.locationY),
    onPanResponderRelease: () => {
      setIsDragging(false);
      const { x, y } = cursorAnim.__getValue(); // ✅ dùng __getValue()
      const s = Math.round((x / boxSize.width) * 100);
      const v = Math.round(100 - (y / boxSize.height) * 100);
      setSaturation(s);
      setValue(v);
    },
  });

  const previewHex = hsvToHex(hue, saturation, value);

  return (
    <Popover
      isVisible={visible}
      from={from}
      onRequestClose={onClose}
      onCloseComplete={() => setTab("palette")}
      placement="bottom"
      arrowStyle={{ backgroundColor: "#fff" }}
    >
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setTab("palette")}>
            <Text style={[styles.tab, tab === "palette" && styles.tabActive]}>
              🎨 Color Palette
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("set")}>
            <Text style={[styles.tab, tab === "set" && styles.tabActive]}>
              🌈 Color Sets
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "palette" ? (
          <View style={{ padding: 12 }}>
            {/* Preview */}
            <View style={styles.previewBox}>
              <View
                style={[styles.previewColor, { backgroundColor: previewHex }]}
              />
              <View style={styles.previewInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>HEX</Text>
                  <TextInput
                    style={styles.hexInput}
                    value={previewHex.replace("#", "").toUpperCase()}
                    onChangeText={(input) => {
                      const clean = input
                        .replace(/[^0-9A-Fa-f]/g, "")
                        .toUpperCase();
                      const val = "#" + clean;
                      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
                        const { h, s, v: newV } = hexToHsv(val);
                        setHue(h);
                        setSaturation(s);
                        setValue(newV);
                      }
                    }}
                  />
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>RGBA</Text>
                  <Text style={styles.valueText}>
                    {hexToRgba(previewHex, opacity)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Opacity</Text>
                  <Text style={styles.valueText}>{opacity}%</Text>
                </View>
              </View>
            </View>

            {/* Gradient Box */}
            <View
              style={styles.gradientBox}
              onLayout={(e) => setBoxSize(e.nativeEvent.layout)}
              {...panResponder.panHandlers}
            >
              <LinearGradient
                colors={["#fff", `hsl(${hue},100%,50%)`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={["transparent", "#000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Animated.View
                style={[
                  styles.cursor,
                  {
                    transform: cursorAnim.getTranslateTransform(),
                    backgroundColor: previewHex,
                  },
                ]}
              />
            </View>

            {/* Hue Slider */}
            {/* Hue Slider */}
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Hue</Text>
              <Text style={styles.sliderValue}>{hue}°</Text>
            </View>
            <View style={styles.sliderWrapper}>
              <LinearGradient
                colors={[
                  "#ff0000",
                  "#ffff00",
                  "#00ff00",
                  "#00ffff",
                  "#0000ff",
                  "#ff00ff",
                  "#ff0000",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sliderGradient}
              />
              <Slider
                style={StyleSheet.absoluteFill}
                minimumValue={0}
                maximumValue={360}
                step={1}
                value={hue}
                onValueChange={setHue}
                thumbTintColor="#fff"
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
              />
            </View>

            {/* Opacity Slider */}
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionLabel}>Opacity</Text>
              <Text style={styles.sliderValue}>{opacity}%</Text>
            </View>
            <View style={styles.sliderWrapper}>
              <LinearGradient
                colors={[hexToRgba(previewHex, 0), hexToRgba(previewHex, 100)]}
                style={styles.sliderGradient}
              />
              <Slider
                style={StyleSheet.absoluteFill}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={opacity}
                onValueChange={setOpacity}
                thumbTintColor="#fff"
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
              />
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={{ color: "#374151" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 300, padding: 12 }}>
            {Object.entries(COLOR_SETS).map(([name, colors]) => (
              <TouchableOpacity
                key={name}
                style={styles.setBox}
                onPress={() => {
                  onSelectColorSet(colors);
                  onClose();
                }}
              >
                <Text style={styles.setTitle}>{name}</Text>
                <View style={styles.colorRow}>
                  {colors.map((c) => (
                    <View
                      key={c}
                      style={[styles.colorPreview, { backgroundColor: c }]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Popover>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
    overflow: "hidden",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    justifyContent: "space-around",
    paddingVertical: 6,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  tabActive: {
    color: "#3b82f6",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    fontWeight: "700",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewColor: {
    width: 70,
    height: 70,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
    width: 60,
  },
  valueText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "500",
  },
  hexInput: {
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    width: 100,
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
  cursor: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  gradientBox: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  sectionLabel: {
    color: "#111827",
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  hexInput: {
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginVertical: 4,
    width: 100,
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
  sliderWrapper: {
    height: 26, // ✅ thấp hơn
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 4, // giảm khoảng cách
    marginBottom: 8, // giảm khoảng cách
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sliderGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  sliderValue: {
    alignSelf: "flex-end",
    marginBottom: 4,
    marginRight: 4,
    color: "#6b7280",
    fontSize: 12.5,
    fontWeight: "600",
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 10,
  },
  applyBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  setBox: {
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  setTitle: { color: "#111827", fontWeight: "600", marginBottom: 8 },
  colorRow: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    height: 30,
  },
  colorPreview: { flex: 1, height: "100%" },
});
