import React, { useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/**
 * ImageTransformBox — box bo quanh ảnh để Move / Resize / Rotate mượt realtime
 * Tối ưu:
 *  ✅ Không xung đột giữa PanResponder
 *  ✅ Rotate realtime theo requestAnimationFrame
 *  ✅ Resize và Move phản hồi nhanh hơn (không debounce)
 */
export default function ImageTransformBox({
  x,
  y,
  width,
  height,
  rotation = 0,
  onMove,
  onMoveStart,
  onMoveEnd,
  onResize,
  onResizeStart,
  onResizeEnd,
  onRotate,
  onRotateStart,
  onRotateEnd,
  scale = 1,
  pan = { x: 0, y: 0 },
}) {
  const w = Math.max(1, Number(width) || 0);
  const h = Math.max(1, Number(height) || 0);
  const left = Number(x) || 0;
  const top = Number(y) || 0;
  // Removed alignOffsetY (previously added small offset based on scale) because it caused
  // occasional vertical drift of the transform box under zoom/pan.

  const rotateStart = useRef({ angle: 0, initRot: 0 });
  const rotateFrame = useRef(null);

  // Keep stable refs for callbacks to prevent responder re-creation during drag
  const onResizeRef = useRef(onResize);
  const onResizeStartRef = useRef(onResizeStart);
  const onResizeEndRef = useRef(onResizeEnd);
  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);
  useEffect(() => {
    onResizeStartRef.current = onResizeStart;
  }, [onResizeStart]);
  useEffect(() => {
    onResizeEndRef.current = onResizeEnd;
  }, [onResizeEnd]);

  // ------------------ MOVE ------------------
  const moveResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => onMoveStart?.(),
        onPanResponderMove: (_, g) => {
          onMove?.(g.dx / scale, g.dy / scale);
        },
        onPanResponderRelease: () => onMoveEnd?.(),
      }),
    [onMove, onMoveStart, onMoveEnd, scale]
  );

  // ------------------ RESIZE ------------------
  const makeCornerResponder = (corner) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => onResizeStartRef.current?.(corner),
      onPanResponderMove: (_, g) => {
        // Convert screen-space deltas to local box-space deltas by removing rotation
        const dx = g.dx / (scale || 1);
        const dy = g.dy / (scale || 1);
        const rad = (rotation || 0) * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        // rotate by -rad: x' = x*cos + y*sin; y' = -x*sin + y*cos
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;
        onResizeRef.current?.(corner, localDx, localDy);
      },
      onPanResponderRelease: () => onResizeEndRef.current?.(corner),
    });

  const responders = useMemo(
    () => ({
      tl: makeCornerResponder("tl"),
      tr: makeCornerResponder("tr"),
      bl: makeCornerResponder("bl"),
      br: makeCornerResponder("br"),
    }),
    [scale, rotation]
  );

  // ------------------ ROTATE ------------------
  const rotateResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, g) => {
          onRotateStart?.();
          const cx = w / 2;
          const cy = h / 2;
          const localX = (g.x0 - (left + (pan?.x || 0))) / (scale || 1);
          const localY = (g.y0 - (top + (pan?.y || 0))) / (scale || 1);
          const dx = localX - cx;
          const dy = localY - cy;
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          rotateStart.current = { angle, initRot: rotation };
        },
        onPanResponderMove: (_, g) => {
          cancelAnimationFrame(rotateFrame.current);
          rotateFrame.current = requestAnimationFrame(() => {
            const { angle: startAngle, initRot } = rotateStart.current;
            const cx = w / 2;
            const cy = h / 2;
            const localX = (g.moveX - (left + (pan?.x || 0))) / (scale || 1);
            const localY = (g.moveY - (top + (pan?.y || 0))) / (scale || 1);
            const dx = localX - cx;
            const dy = localY - cy;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const delta = angle - startAngle;
            const newRot = initRot + delta;
            onRotate?.(newRot);
          });
        },
        onPanResponderRelease: () => {
          cancelAnimationFrame(rotateFrame.current);
          onRotateEnd?.();
        },
      }),
    [
      rotation,
      onRotate,
      onRotateStart,
      onRotateEnd,
      w,
      h,
      left,
      top,
      scale,
      pan,
    ]
  );

  // ------------------ RENDER ------------------
  return (
    <View
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
            { rotate: `${rotation}deg` },
          ],
        },
      ]}
      {...moveResponder.panHandlers}
      pointerEvents="box-none"
    >
      <View style={styles.border} />

      {/* 4 góc resize */}
      <View style={StyleSheet.absoluteFill}>
        {[
          { name: "tl", left: -8, top: -8 },
          { name: "tr", left: w - 8, top: -8 },
          { name: "bl", left: -8, top: h - 8 },
          { name: "br", left: w - 8, top: h - 8 },
        ].map((pos) => (
          <View
            key={pos.name}
            style={[styles.handle, { left: pos.left, top: pos.top }]}
            {...responders[pos.name].panHandlers}
            pointerEvents="box-only"
          />
        ))}

        {/* Nút xoay */}
        <View
          style={[styles.rotateHandle, { left: w + 26, top: h / 2 - 16 }]}
          {...rotateResponder.panHandlers}
          pointerEvents="box-only"
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
  box: { position: "absolute", zIndex: 30 },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderStyle: "dashed",
  },
  handle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
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
