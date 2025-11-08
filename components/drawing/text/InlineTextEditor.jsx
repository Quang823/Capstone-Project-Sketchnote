import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { getFontVariant } from "../../../utils/fontUtils";

const COLORS = ["#000", "#2563EB", "#DC2626", "#16A34A", "#CA8A04", "#FFF"];
const FONTS = [
  "Roboto-Regular",
  "Inter-Regular",
  "Lato-Regular",
  "Montserrat-Regular",
  "OpenSans-Regular",
  "Pacifico-Regular",
  "Poppins-Regular",
];

export default function InlineTextEditor({
  visible,
  x,
  y,
  safeText = "",
  initialData = {}, // Full styles khi edit existing text
  onCancel,
  onSubmit,
  onChange, // Prop mới để cập nhật real-time
  isEditingExisting = false, // Biến để biết đang edit existing text
}) {
  const [text, setText] = useState(safeText || "");

  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState("left");
  const [color, setColor] = useState("#000");
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("Roboto-Regular");
  const [showFonts, setShowFonts] = useState(false);
  const { width, height } = useWindowDimensions();

  // Reanimated shared values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const debounceTimeout = useRef(null);
  const effectiveFont =
    getFontVariant(fontFamily, bold, italic) || "Roboto-Regular";

  initialData = initialData || {};
  const safeFont = initialData.fontFamily || "Roboto-Regular";
  const safeTextValue =
    typeof safeText === "string"
      ? safeText
      : typeof initialData.text === "string"
      ? initialData.text
      : "";

  // Sticky/Comment should not render extra white background while editing
  const isStickyLike = ["sticky", "comment"].includes(
    (initialData && initialData.tool) || ""
  );

  const triggerChange = (override = {}) => {
    if (!onChange) return;
    onChange({
      text,
      bold,
      italic,
      underline,
      align,
      color,
      fontSize,
      fontFamily: effectiveFont || "Roboto-Regular",
      ...override,
    });
  };

  useEffect(() => {
    if (visible) opacity.value = withTiming(1, { duration: 250 });
    else opacity.value = withTiming(0, { duration: 150 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const panResponder = useRef(
    require("react-native").PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateX.value = gesture.dx;
        translateY.value = gesture.dy;
      },
      onPanResponderRelease: () => {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    })
  ).current;

  // Load full initial data khi visible thay đổi
  useEffect(() => {
    if (visible) {
      setText(initialData.text || safeTextValue);
      setBold(!!initialData.bold);
      setItalic(!!initialData.italic);
      setUnderline(!!initialData.underline);
      setAlign(initialData.align || "left");
      setColor(initialData.color || "#000");
      setFontSize(initialData.fontSize || 16);
      setFontFamily(safeFont);
    }
  }, [visible, initialData, safeTextValue]);

  // Gửi thay đổi real-time về parent
  useEffect(() => {
    if (visible && onChange) {
      // Hủy timeout trước đó nếu có
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      // Gọi onChange sau 300ms để tránh cập nhật quá nhanh
      debounceTimeout.current = setTimeout(() => {
        onChange({
          text,
          bold,
          italic,
          underline,
          align,
          color,
          fontSize,
          fontFamily: effectiveFont,
        });
      }, 300);
    }
    // Cleanup khi component unmount hoặc dependencies thay đổi
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [
    text,
    bold,
    italic,
    underline,
    align,
    color,
    fontSize,
    fontFamily,
    visible,
    onChange,
  ]);

  if (!visible) return null;

  const isLandscape = width > height;

  // 🔑 Tính top để khớp với baseline của text trên canvas
  const padding =
    typeof initialData.padding === "number" ? initialData.padding : 0;
  const textBoxTop = y - fontSize * 1.05 - padding;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay để tắt */}
      <TouchableWithoutFeedback
        onPress={() => {
          if (showFonts) setShowFonts(false);
          else onCancel?.();
        }}
      >
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Floating Toolbar */}
      <Animated.View
        {...(!showFonts ? panResponder.panHandlers : {})}
        pointerEvents={showFonts ? "box-none" : "auto"}
        style={[
          styles.toolbar,
          {
            top: Math.max(10, y - 90),
            left: Math.max(10, Math.min(x - 150, width - 320)),
            maxWidth: width - 20,
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={["#f9fafb", "#e2e8f0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.toolbarInner,
            !isLandscape && { flexDirection: "column", gap: 8 },
          ]}
        >
          {/* Row 1: Font, Size, B/I/U (Portrait mode) */}
          <View
            style={[
              styles.toolbarRow,
              !isLandscape && { flexDirection: "row", gap: 4 },
            ]}
          >
            {/* Font Picker */}
            <View style={styles.group}>
            <TouchableOpacity
              onPress={() => setShowFonts((s) => !s)}
              style={styles.fontButton}
            >
              <Text style={styles.fontLabel} numberOfLines={1}>
                {fontFamily.replace("-Regular", "")}
              </Text>
              <MaterialCommunityIcons
                name={showFonts ? "chevron-up" : "chevron-down"}
                size={18}
                color="#1e40af"
              />
            </TouchableOpacity>
          </View>

          {/* Font size */}
          <View style={styles.group}>
            <TouchableOpacity
              onPress={() => setFontSize((f) => Math.max(10, f - 1))}
            >
              <MaterialCommunityIcons name="minus" size={20} color="#1e40af" />
            </TouchableOpacity>
            <Text style={styles.sizeLabel}>{fontSize}</Text>
            <TouchableOpacity
              onPress={() => {
                setFontSize((f) => {
                  const newVal = Math.min(48, f + 1);
                  triggerChange({ fontSize: newVal });
                  return newVal;
                });
              }}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#1e40af" />
            </TouchableOpacity>
          </View>

          {/* B / I / U */}
          <View style={styles.group}>
            <TouchableOpacity
              onPress={() => {
                setBold((b) => {
                  const newVal = !b;
                  triggerChange({ bold: newVal });
                  return newVal;
                });
              }}
            >
              <Text style={[styles.formatBtn, bold && styles.active]}>B</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setItalic((b) => {
                  const newVal = !b;
                  triggerChange({ italic: newVal });
                  return newVal;
                });
              }}
            >
              <Text
                style={[
                  styles.formatBtn,
                  italic && styles.active,
                  { fontStyle: "italic" },
                ]}
              >
                I
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setUnderline((b) => {
                  const newVal = !b;
                  triggerChange({ underline: newVal });
                  return newVal;
                });
              }}
            >
              <Text
                style={[
                  styles.formatBtn,
                  underline && styles.active,
                  { textDecorationLine: "underline" },
                ]}
              >
                U
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alignment */}
          <View style={styles.group}>
            {["left", "center", "right"].map((pos) => (
              <TouchableOpacity
                key={pos}
                onPress={() => {
                  setAlign(pos);
                  triggerChange({ align: pos });
                }}
              >
                <MaterialCommunityIcons
                  name={`format-align-${pos}`}
                  size={20}
                  color={align === pos ? "#2563EB" : "#475569"}
                />
              </TouchableOpacity>
            ))}
          </View>
          </View>

          {/* Row 2: Color, Cancel, Done (Portrait mode) */}
          <View
            style={[
              styles.toolbarRow,
              !isLandscape && { flexDirection: "row", gap: 4 },
            ]}
          >
            {/* Color picker */}
            <View style={[styles.group, { paddingHorizontal: 4 }]}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c,
                      borderColor: c === color ? "#2563EB" : "#cbd5e1",
                      transform: [{ scale: c === color ? 1.2 : 1 }],
                    },
                  ]}
                  onPress={() => {
                    setColor(c);
                    triggerChange({ color: c });
                  }}
                />
              ))}
            </View>

            {/* Done / Cancel */}
            <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onSubmit?.({
                  text,
                  bold,
                  italic,
                  underline,
                  align,
                  color,
                  fontSize,
                  fontFamily: effectiveFont || "Roboto-Regular",
                })
              }
              style={styles.doneBtn}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Font Dropdown */}
        {showFonts && (
          <Animated.View style={styles.dropdown}>
            {FONTS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.fontOption,
                  item.replace(/-.+$/, "") === fontFamily.replace(/-.+$/, "") &&
                    styles.fontOptionActive,
                ]}
                onPress={() => {
                  setFontFamily(item);
                  setShowFonts(false);
                  triggerChange({
                    fontFamily: getFontVariant(item, bold, italic),
                  });
                }}
              >
                <Text
                  style={{
                    fontFamily: item,
                    fontSize: 12,
                    color: "#1e293b",
                  }}
                >
                  {item.replace("-Regular", "")}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      {/* Inline Text Box */}
      <View
        style={[
          styles.textBoxWrapper,
          {
            top: textBoxTop,
            left: x - padding,
            minWidth: (text.length || 1) * fontSize * 0.6 + padding * 2,
            minHeight: fontSize * 1.5,
          },
        ]}
      >
        <View style={styles.selectionBox}>
          <View style={[styles.dot, { top: -6, left: -6 }]} />
          <View style={[styles.dot, { top: -6, right: -6 }]} />
          <View style={[styles.dot, { bottom: -6, left: -6 }]} />
          <View style={[styles.dot, { bottom: -6, right: -6 }]} />
        </View>

        <TextInput
          key={`${fontFamily}-${bold}-${italic}-${underline}-${fontSize}-${color}`}
          value={text}
          onChangeText={(t) => {
            setText(t);
            triggerChange({ text: t });
          }}
          placeholder="Enter text..."
          placeholderTextColor="#94A3B8"
          multiline
          autoFocus
          style={[
            styles.input,
            {
              color: isEditingExisting ? "rgba(0,0,0,0.05)" : color,
              opacity: isEditingExisting ? 0.25 : 1,
              fontFamily: getFontVariant(fontFamily, bold, italic),
              textDecorationLine: underline ? "underline" : "none",
              textAlign: align,
              fontSize,
              padding: padding,
              // Use transparent background for sticky/comment and when editing existing text
              backgroundColor:
                isEditingExisting || isStickyLike
                  ? "transparent"
                  : "rgba(255,255,255,0.9)",
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  textBox: {
    position: "absolute",
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    maxWidth: 320,
    borderWidth: 0,
  },
  input: {
    minHeight: 20,
    maxHeight: 180,
    padding: 0,
    backgroundColor: "transparent",
  },
  toolbar: {
    position: "absolute",
    zIndex: 999,
    borderRadius: 14,
    overflow: "visible",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  toolbarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexWrap: "wrap",
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  group: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  formatBtn: {
    fontSize: 18,
    color: "#334155",
    marginHorizontal: 4,
    fontWeight: "bold",
  },
  active: { color: "#2563EB" },
  sizeLabel: {
    fontSize: 15,
    color: "#1e40af",
    marginHorizontal: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  doneBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cancelText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  doneText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  fontButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  fontLabel: {
    color: "#1e40af",
    fontSize: 14,
    marginRight: 3,
    maxWidth: 90,
  },
  dropdown: {
    position: "absolute",
    top: 52,
    left: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 5,
    width: 100,
    maxHeight: 280,
  },
  fontOption: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  fontOptionActive: {
    backgroundColor: "#e0f2fe",
  },
  textBoxWrapper: {
    position: "absolute",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "stretch",
  },

  selectionBox: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 4,
    zIndex: 1,
    pointerEvents: "none", // không chặn touch
  },

  dot: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#2563EB",
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#fff",
    zIndex: 2,
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
});
