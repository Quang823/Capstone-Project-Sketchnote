import React, { useMemo, useRef } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import debounce from "lodash/debounce";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ icon xoay

export default function ImageTransformBox({
  x,
  y,
  width,
  height,
  rotation = 0,
  onMove,
  onResize,
  onRotate,
  scale = 1,
  pan = { x: 0, y: 0 },
}) {
  const w = Math.max(1, Number(width) || 0);
  const h = Math.max(1, Number(height) || 0);
  const left = Number(x) || 0;
  const top = Number(y) || 0;

  const boxRef = useRef(null);
  const rotateStart = useRef({ angle: 0, initRot: 0 });

  const debouncedRotate = useMemo(() => debounce(onRotate, 8), [onRotate]);

  // Move
  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => onMove?.(g.dx / scale, g.dy / scale),
      }),
    [onMove, scale]
  );

  // Resize
  const makeCornerResponder = (corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) =>
        onResize?.(corner, g.dx / scale, g.dy / scale),
    });

  // ✅ Rotate — xoay quanh đúng tâm box
  const rotateResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          const cx = w / 2;
          const cy = h / 2;
          const localX = gestureState.x0 - left;
          const localY = gestureState.y0 - top;
          const dx = localX - cx;
          const dy = localY - cy;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          rotateStart.current = { angle, initRot: rotation };
        },
        onPanResponderMove: (_, gestureState) => {
          const { angle: startAngle, initRot } = rotateStart.current;
          const cx = w / 2;
          const cy = h / 2;
          const localX = gestureState.moveX - left;
          const localY = gestureState.moveY - top;
          const dx = localX - cx;
          const dy = localY - cy;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const delta = angle - startAngle;
          const newRot = initRot + delta;
          debouncedRotate?.(newRot);
        },
        onPanResponderRelease: () => {
          debouncedRotate.flush();
        },
      }),
    [rotation, debouncedRotate, left, top, w, h]
  );

  const responders = useMemo(
    () => ({
      tl: makeCornerResponder("tl"),
      tr: makeCornerResponder("tr"),
      bl: makeCornerResponder("bl"),
      br: makeCornerResponder("br"),
    }),
    [onResize, scale]
  );

  return (
    <View
      ref={boxRef}
      style={[
        styles.box,
        {
          left,
          top,
          width: w,
          height: h,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale },
            { rotate: `${rotation}deg` }, // ✅ xoay toàn box (border + handle)
          ],
        },
      ]}
      {...moveResponder.panHandlers}
      pointerEvents="box-none"
    >
      {/* viền */}
      <View style={styles.border} />

      {/* handle resize + rotate */}
      <View style={StyleSheet.absoluteFill}>
        {/* 4 góc resize */}
        <View
          style={[styles.handle, { left: -8, top: -8 }]}
          {...responders.tl.panHandlers}
        />
        <View
          style={[styles.handle, { left: w - 8, top: -8 }]}
          {...responders.tr.panHandlers}
        />
        <View
          style={[styles.handle, { left: -8, top: h - 8 }]}
          {...responders.bl.panHandlers}
        />
        <View
          style={[styles.handle, { left: w - 8, top: h - 8 }]}
          {...responders.br.panHandlers}
        />

        {/* ✅ icon xoay — bên phải giữa */}
        <View
          style={[styles.rotateHandle, { left: w + 20, top: h / 2 - 16 }]}
          {...rotateResponder.panHandlers}
        >
          <MaterialCommunityIcons
            name="rotate-right"
            size={28}
            color="#10B981"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: "absolute", zIndex: 20 },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderStyle: "dashed",
  },
  handle: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563EB",
  },
  rotateHandle: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
  },
});
