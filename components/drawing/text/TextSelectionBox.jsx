// components/text/TextSelectionBox.jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
} from "react-native";

export default function TextSelectionBox({
  x,
  y,
  width,
  height,
  onMove, // (dx, dy)
  onResize, // (corner, dx, dy)
  onDelete,
  onCut,
  onCopy,
  onEdit, // New prop to open editor on tap
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pos = useRef(new Animated.ValueXY({ x, y })).current; // 🟢 Vị trí động để move mượt

  const dotSize = 10;
  const half = dotSize / 2;
  const startPos = useRef({ x: 0, y: 0 });
  const lastMove = useRef({ dx: 0, dy: 0 });
  const startTime = useRef(0);

  // 🟢 Hiệu ứng fade-in khi xuất hiện box
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, []);

  // 🟦 Đồng bộ khi state x/y thay đổi từ bên ngoài
  useEffect(() => {
    pos.setValue({ x, y });
  }, [x, y]);

  // 🟢 PanResponder: move mượt bằng Animated
  const movePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        startPos.current = { x: g.x0, y: g.y0 };
        lastMove.current = { dx: 0, dy: 0 };
        startTime.current = Date.now();
      },
      onPanResponderMove: (_, g) => {
        const dx = g.moveX - startPos.current.x;
        const dy = g.moveY - startPos.current.y;

        // Cập nhật Animated.ValueXY (UI thread)
        pos.setValue({ x: x + dx, y: y + dy });

        // Gửi delta về callback để cập nhật logic (React thread)
        const diffX = dx - lastMove.current.dx;
        const diffY = dy - lastMove.current.dy;
        onMove?.(diffX, diffY);
        lastMove.current = { dx, dy };
      },
      onPanResponderRelease: () => {
        const endTime = Date.now();
        const duration = endTime - startTime.current;
        const distance = Math.hypot(lastMove.current.dx, lastMove.current.dy);
        if (duration < 200 && distance < 3) {
          requestAnimationFrame(() => onEdit?.());
        }
        lastMove.current = { dx: 0, dy: 0 };
      },
    })
  ).current;

  // 🟩 Resize 4 góc
  const makeResizePan = (corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        onResize?.(corner, g.dx, g.dy);
      },
    });

  const cornerPans = {
    tl: useRef(makeResizePan("tl")).current,
    tr: useRef(makeResizePan("tr")).current,
    bl: useRef(makeResizePan("bl")).current,
    br: useRef(makeResizePan("br")).current,
  };

  return (
    <Animated.View
      style={[
        styles.box,
        {
          width,
          height,
          opacity: fadeAnim,
          transform: [{ translateX: pos.x }, { translateY: pos.y }],
        },
      ]}
    >
      {/* 🧰 Toolbar */}
      <View style={styles.toolbar}>
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
      </View>

      {/* 🔵 Vùng di chuyển */}
      <View
        style={StyleSheet.absoluteFill}
        {...movePan.panHandlers}
        pointerEvents="box-only"
      />

      {/* 🔹 4 chấm resize */}
      <View
        {...cornerPans.tl.panHandlers}
        style={[styles.dot, { top: -half, left: -half }]}
      />
      <View
        {...cornerPans.tr.panHandlers}
        style={[styles.dot, { top: -half, right: -half }]}
      />
      <View
        {...cornerPans.bl.panHandlers}
        style={[styles.dot, { bottom: -half, left: -half }]}
      />
      <View
        {...cornerPans.br.panHandlers}
        style={[styles.dot, { bottom: -half, right: -half }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    borderRadius: 6,
    zIndex: 100,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    overflow: "visible",
  },
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "#3B82F6",
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 6,
    zIndex: 101,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
  },
  toolbar: {
    position: "absolute",
    top: -58,
    left: "50%",
    transform: [{ translateX: -90 }],
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    zIndex: 200,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  toolBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "transparent",
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
    alignSelf: "center",
  },
});
