import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  PanResponder,
} from "react-native";

export default function LassoSelectionBox({
  box,
  onCopy,
  onCut,
  onDelete,
  onMove,
  onMoveEnd,
  onClear,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onMoveRef = useRef(onMove);
  const onMoveEndRef = useRef(onMoveEnd);

  useEffect(() => {
    onMoveRef.current = onMove;
    onMoveEndRef.current = onMoveEnd;
  }, [onMove, onMoveEnd]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          // Không cần làm gì - parent sẽ handle offset
        },
        onPanResponderMove: (_, g) => {
          // ✅ Chỉ gọi callback - parent sẽ update lassoVisualOffset
          // Không update localOffset nữa
          onMoveRef.current?.(g.dx, g.dy);
        },
        onPanResponderRelease: (_, g) => {
          onMoveEndRef.current?.(g.dx, g.dy);
        },
        onPanResponderTerminate: () => {
          onMoveEndRef.current?.(0, 0);
        },
      }),
    []
  );

  if (!box) return null;
  const { x, y, width, height } = box;
  const menuWidth = Math.max(180, width);

  // ✅ Sử dụng box position trực tiếp - đã bao gồm offset từ parent
  return (
    <>
      {/* Transparent overlay to tap outside to clear selection */}
      <TouchableOpacity
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={onClear}
      />

      {/* --- Selection box --- */}
      <Animated.View
        {...moveResponder.panHandlers}
        style={[
          styles.selectionBox,
          {
            left: x,
            top: y,
            width,
            height,
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.border} />
      </Animated.View>

      {/* --- Toolbar (copy / cut / delete) --- */}
      <Animated.View
        style={[
          styles.toolbar,
          {
            left: x + (width - menuWidth) / 2,
            top: y - 70,
            width: menuWidth,
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity style={styles.toolBtn} onPress={onCopy}>
          <Text style={styles.toolText}>Copy</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.toolBtn} onPress={onCut}>
          <Text style={styles.toolText}>Cut</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.toolBtn} onPress={onDelete}>
          <Text style={[styles.toolText, { color: "#DC2626" }]}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  selectionBox: {
    position: "absolute",
    zIndex: 40,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: "#2563EB",
    borderStyle: "dashed",
    borderRadius: 4,
  },
  toolbar: {
    position: "absolute",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  toolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toolText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 6,
  },
});
