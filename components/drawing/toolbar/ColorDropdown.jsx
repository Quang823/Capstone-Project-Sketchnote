import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  PanResponder,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import Popover from "react-native-popover-view";
import { COLOR_SETS } from "./constants";

// Hàm chuyển HSV → HEX
function hsvToHex(h, s, v) {
  s /= 100;
  v /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  const r = Math.round(255 * f(5)),
    g = Math.round(255 * f(3)),
    b = Math.round(255 * f(1));
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

// HEX → HSV
function hexToHsv(hex) {
  hex = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = 0,
    s = max === 0 ? 0 : d / max,
    v = max;
  if (max !== min) {
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

// HEX → RGBA
function hexToRgba(hex, opacity) {
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
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

export default function ColorDropdownCompact({
  visible,
  from,
  onClose,
  onSelectColor = () => {},
  onSelectColorSet = () => {},
  selectedColor = "#3b82f6",
  colorHistory = [], // 👈 Thêm prop colorHistory
}) {
  const [tab, setTab] = useState("palette");
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [boxSize, setBoxSize] = useState({ width: 250, height: 140 });

  const cursorAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastSVRef = useRef({ s: 100, v: 100 });
  const framePendingRef = useRef(false);

  // ref để đo vị trí tuyệt đối của gradient box
  const boxRef = useRef(null);
  // lưu vị trí tuyệt đối và kích thước
  const boxLayoutRef = useRef({ x: 0, y: 0, width: 250, height: 140 });

  useEffect(() => {
    if (visible && selectedColor) {
      let baseHex = selectedColor,
        initOpacity = 100;
      if (baseHex.startsWith("rgba")) {
        const m = baseHex.match(
          /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/
        );
        if (m) {
          const [r, g, b, a] = m.slice(1);
          baseHex = `#${[r, g, b]
            .map((x) => parseInt(x, 10).toString(16).padStart(2, "0"))
            .join("")}`;
          initOpacity = Math.round((a ? parseFloat(a) : 1) * 100);
        }
      }
      const { h, s, v } = hexToHsv(baseHex);
      setHue(h);
      setSaturation(s);
      setValue(v);
      setOpacity(initOpacity);
      // set cursor position based on boxSize (center)
      cursorAnim.setValue({
        x: (s / 100) * boxSize.width,
        y: (1 - v / 100) * boxSize.height,
      });
      lastSVRef.current = { s, v };
    }
  }, [visible, selectedColor]);

  // update cursor + state (throttle bằng requestAnimationFrame)
  const updateCursor = (x, y) => {
    // clamp x,y
    const w = boxLayoutRef.current.width || boxSize.width;
    const h = boxLayoutRef.current.height || boxSize.height;
    const cx = Math.max(0, Math.min(x, w));
    const cy = Math.max(0, Math.min(y, h));

    // move animated cursor ngay lập tức (mượt)
    cursorAnim.setValue({ x: cx, y: cy });

    const s = Math.round((cx / w) * 100);
    const v = Math.round(100 - (cy / h) * 100);

    // ignore tiny fluctuations (<2) để tránh nhảy do rounding/frequency
    const { s: ls, v: lv } = lastSVRef.current;
    if (Math.abs(s - ls) < 2 && Math.abs(v - lv) < 2) return;
    lastSVRef.current = { s, v };

    if (!framePendingRef.current) {
      framePendingRef.current = true;
      requestAnimationFrame(() => {
        framePendingRef.current = false;
        const { s: ns, v: nv } = lastSVRef.current;
        setSaturation(ns);
        setValue(nv);
      });
    }
  };

  // PanResponder: sử dụng pageX/pageY nếu có, fallback về locationX
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      // đo lại vị trí view trên màn hình để bám chắc tọa độ tuyệt đối
      if (boxRef.current && boxRef.current.measureInWindow) {
        boxRef.current.measureInWindow((px, py, w, h) => {
          boxLayoutRef.current = { x: px, y: py, width: w, height: h };
          // compute relative coordinates
          const pageX = e.nativeEvent.pageX ?? e.nativeEvent.locationX + px;
          const pageY = e.nativeEvent.pageY ?? e.nativeEvent.locationY + py;
          const relX = pageX - px;
          const relY = pageY - py;
          updateCursor(relX, relY);
        });
      } else {
        // fallback
        const locX = e.nativeEvent.locationX ?? 0;
        const locY = e.nativeEvent.locationY ?? 0;
        updateCursor(locX, locY);
      }
    },
    onPanResponderMove: (e) => {
      // prefer pageX/pageY for stability
      const px = boxLayoutRef.current.x;
      const py = boxLayoutRef.current.y;
      const pageX = e.nativeEvent.pageX ?? e.nativeEvent.locationX + px;
      const pageY = e.nativeEvent.pageY ?? e.nativeEvent.locationY + py;
      const relX = pageX - px;
      const relY = pageY - py;
      updateCursor(relX, relY);
    },
    onPanResponderRelease: () => {
      // nothing special
    },
  });

  const handleApply = () => {
    onSelectColor(hexToRgba(hsvToHex(hue, saturation, value), opacity));
    onClose();
  };
  const previewHex = hsvToHex(hue, saturation, value);

  return (
    <Popover
      isVisible={visible}
      from={from}
      onRequestClose={onClose}
      placement="bottom"
      arrowStyle={{ backgroundColor: "#fff" }}
    >
      <View style={s.container}>
        <View style={s.tabBar}>
          <TouchableOpacity onPress={() => setTab("palette")}>
            <Text style={[s.tab, tab === "palette" && s.tabActive]}>
              🎨 Palette
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab("set")}>
            <Text style={[s.tab, tab === "set" && s.tabActive]}>🌈 Sets</Text>
          </TouchableOpacity>
        </View>

        {tab === "palette" ? (
          <View style={{ padding: 8 }}>
            {/* preview */}
            <View style={s.previewBox}>
              <View style={[s.previewColor, { backgroundColor: previewHex }]} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <View style={s.infoRow}>
                  <Text style={s.label}>HEX</Text>
                  <TextInput
                    style={s.hexInput}
                    value={previewHex.replace("#", "").toUpperCase()}
                    onChangeText={(text) => {
                      const clean = text.replace(/[^0-9A-Fa-f]/g, "");
                      if (/^([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(clean)) {
                        const { h, s, v } = hexToHsv("#" + clean);
                        setHue(h);
                        setSaturation(s);
                        setValue(v);
                        // update cursor position when user edits hex
                        const w = boxLayoutRef.current.width || boxSize.width;
                        const hgt =
                          boxLayoutRef.current.height || boxSize.height;
                        cursorAnim.setValue({
                          x: (s / 100) * w,
                          y: (1 - v / 100) * hgt,
                        });
                        lastSVRef.current = { s, v };
                      }
                    }}
                  />
                </View>
                <View style={s.infoRow}>
                  <Text style={s.label}>RGBA</Text>
                  <Text style={s.valueText}>
                    {hexToRgba(previewHex, opacity)}
                  </Text>
                </View>
              </View>
            </View>

            {/* gradient box */}
            <View
              ref={boxRef}
              style={s.gradientBox}
              {...panResponder.panHandlers}
              onLayout={(e) => {
                const layout = e.nativeEvent.layout;
                setBoxSize({ width: layout.width, height: layout.height });
                // measure absolute pos to be robust against nesting/scroll
                if (boxRef.current && boxRef.current.measureInWindow) {
                  // small timeout ensures layout stabilized on some devices
                  setTimeout(() => {
                    boxRef.current.measureInWindow((px, py, w, h) => {
                      boxLayoutRef.current = {
                        x: px,
                        y: py,
                        width: w,
                        height: h,
                      };
                    });
                  }, 0);
                } else {
                  boxLayoutRef.current = {
                    x: layout.x,
                    y: layout.y,
                    width: layout.width,
                    height: layout.height,
                  };
                }
              }}
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
                  s.cursor,
                  {
                    transform: cursorAnim.getTranslateTransform(),
                    backgroundColor: previewHex,
                  },
                ]}
                pointerEvents="none"
              />
            </View>

            {/* sliders */}
            <View style={s.sliderHeader}>
              <Text style={s.sectionLabel}>Hue</Text>
              <Text style={s.sliderValue}>{hue}°</Text>
            </View>
            <View style={s.sliderWrapper}>
              <LinearGradient
                colors={[
                  "#f00",
                  "#ff0",
                  "#0f0",
                  "#0ff",
                  "#00f",
                  "#f0f",
                  "#f00",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.sliderGradient}
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

            <View style={s.sliderHeader}>
              <Text style={s.sectionLabel}>Opacity</Text>
              <Text style={s.sliderValue}>{opacity}%</Text>
            </View>
            <View style={s.sliderWrapper}>
              <LinearGradient
                colors={[hexToRgba(previewHex, 0), hexToRgba(previewHex, 100)]}
                style={s.sliderGradient}
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

            {/* Color History */}
            {colorHistory && colorHistory.length > 0 && (
              <View style={s.historySection}>
                <Text style={s.sectionLabel}>Color History</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={s.historyScroll}
                >
                  {colorHistory.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[s.historyColor, { backgroundColor: color }]}
                      onPress={() => {
                        // Parse color nếu là rgba
                        let baseHex = color;
                        let initOpacity = 100;
                        if (color.startsWith("rgba")) {
                          const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
                          if (m) {
                            const [r, g, b, a] = m.slice(1);
                            baseHex = `#${[r, g, b].map((x) => parseInt(x, 10).toString(16).padStart(2, "0")).join("")}`;
                            initOpacity = Math.round((a ? parseFloat(a) : 1) * 100);
                          }
                        }
                        const { h, s, v } = hexToHsv(baseHex);
                        setHue(h);
                        setSaturation(s);
                        setValue(v);
                        setOpacity(initOpacity);
                        cursorAnim.setValue({
                          x: (s / 100) * boxSize.width,
                          y: (1 - v / 100) * boxSize.height,
                        });
                        lastSVRef.current = { s, v };
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.applyBtn} onPress={handleApply}>
                <Text style={{ color: "#fff" }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 200, padding: 8 }}>
            {Object.entries(COLOR_SETS).map(([name, colors]) => (
              <TouchableOpacity
                key={name}
                style={s.setBox}
                onPress={() => {
                  onSelectColorSet(colors);
                  onClose();
                }}
              >
                <Text style={s.setTitle}>{name}</Text>
                <View style={s.colorRow}>
                  {colors.map((c) => (
                    <View
                      key={c}
                      style={[s.colorPreview, { backgroundColor: c }]}
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

const s = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 300,
    overflow: "hidden",
    elevation: 6,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: { paddingVertical: 8, color: "#111827", fontWeight: "500" },
  tabActive: {
    color: "#3b82f6",
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    fontWeight: "700",
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewColor: {
    width: 50,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#374151", width: 50 },
  valueText: { fontSize: 12, color: "#111827" },
  hexInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 4,
    width: 80,
    textAlign: "center",
    fontWeight: "600",
    color: "#111827",
  },
  gradientBox: {
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cursor: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#111827" },
  sliderWrapper: {
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sliderGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 10 },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between" },
  sliderValue: { fontSize: 12, color: "#6b7280" },
  btnRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    marginRight: 6,
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#3b82f6",
    borderRadius: 6,
  },
  setBox: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  setTitle: { fontWeight: "600", marginBottom: 4 },
  colorRow: {
    flexDirection: "row",
    height: 24,
    borderRadius: 6,
    overflow: "hidden",
  },
  colorPreview: { flex: 1, height: "100%" },
  historySection: {
    marginTop: 12,
    marginBottom: 8,
  },
  historyScroll: {
    marginTop: 8,
  },
  historyColor: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
