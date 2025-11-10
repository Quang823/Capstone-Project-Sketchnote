import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Rect, Path } from "react-native-svg";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const SCREEN = Dimensions.get("window");

export default function RulerOverlay({ visible, position, onChange }) {
  // --- shared values (hooks) - MUST be declared unconditionally ---
  const width = useSharedValue(position?.width ?? SCREEN.width);
  const height = useSharedValue(position?.height ?? 60);

  const translateX = useSharedValue(
    position?.x ?? SCREEN.width / 2 - (position?.width ?? SCREEN.width) / 2
  );
  const translateY = useSharedValue(position?.y ?? 120);
  const rotation = useSharedValue(position?.rotation ?? 0);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startRotation = useSharedValue(0);

  // emit worklet
  const emit = () => {
    "worklet";
    const payload = {
      x: translateX.value,
      y: translateY.value,
      rotation: rotation.value,
      width: width.value,
      height: height.value,
      scale: 1,
    };
    if (typeof onChange === "function") runOnJS(onChange)(payload);
  };

  // keep shared values in sync with incoming position object
  useEffect(() => {
    if (position && typeof position === "object") {
      if (position.x !== undefined) translateX.value = position.x;
      if (position.y !== undefined) translateY.value = position.y;
      if (position.rotation !== undefined) rotation.value = position.rotation;
      if (position.width !== undefined) width.value = position.width;
      if (position.height !== undefined) height.value = position.height;
    }
  }, [position]);

  // gesture hooks (unconditional)
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      emit();
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
      emit();
    })
    .onEnd((e) => {
      // Đảm bảo vị trí cuối cùng được cập nhật chính xác
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
      emit();
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
      emit();
    })
    .onEnd(() => emit());

  const composedGesture = Gesture.Simultaneous(panGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // --- ALL useAnimatedProps MUST be declared HERE (before any conditional return) ---
  const svgSizeProps = useAnimatedProps(() => ({
    width: Math.max(0, Math.round(width.value)),
    height: Math.max(0, Math.round(height.value)),
  }));

  const rectProps = useAnimatedProps(() => ({
    x: 0,
    y: 0,
    width: Math.max(0, Math.round(width.value)),
    height: Math.max(0, Math.round(height.value)),
  }));

  const minorTicksProps = useAnimatedProps(() => {
    const w = Math.max(0, Math.round(width.value));
    const h = Math.max(0, Math.round(height.value));
    if (w <= 0 || h <= 0) return { d: "" };

    let d = "";
    for (let i = 0; i <= Math.floor(w / 10); i++) {
      const x = i * 10;
      const isMajor = i % 10 === 0;
      const isMid = i % 5 === 0;
      if (isMajor) continue;
      const tickH = isMid ? 25 : 15;
      const y1 = h - tickH;
      const y2 = h;
      d += `M ${x} ${y1} L ${x} ${y2} `;
    }
    return { d };
  });

  const majorTicksProps = useAnimatedProps(() => {
    const w = Math.max(0, Math.round(width.value));
    const h = Math.max(0, Math.round(height.value));
    if (w <= 0 || h <= 0) return { d: "" };
    let d = "";
    for (let i = 0; i <= Math.floor(w / 100); i++) {
      const x = i * 100;
      const tickH = 40;
      const y1 = h - tickH;
      const y2 = h;
      d += `M ${x} ${y1} L ${x} ${y2} `;
    }
    return { d };
  });

  const borderTopProps = useAnimatedProps(() => {
    const w = Math.max(0, Math.round(width.value));
    if (w <= 0) return { d: "" };
    return { d: `M 0 0 L ${w} 0` };
  });

  const borderBottomProps = useAnimatedProps(() => {
    const w = Math.max(0, Math.round(width.value));
    const h = Math.max(0, Math.round(height.value));
    if (w <= 0 || h <= 0) return { d: "" };
    return { d: `M 0 ${h} L ${w} ${h}` };
  });

  // --- Now safe to early-return when not visible (hooks already declared) ---
  if (!visible) return null;

  // --- Render uses the already-declared animated props / styles (NO hooks inside JSX) ---
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.rulerContainer, animatedStyle]}>
          <AnimatedSvg animatedProps={svgSizeProps}>
            <AnimatedRect
              animatedProps={rectProps}
              fill="rgba(255,255,255,0.85)"
              stroke="#94a3b8"
              strokeWidth={1.5}
              rx={4}
            />

            <AnimatedPath
              animatedProps={minorTicksProps}
              stroke="#60a5fa"
              strokeWidth={1}
              strokeOpacity={0.7}
              fill="none"
            />

            <AnimatedPath
              animatedProps={majorTicksProps}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeOpacity={0.95}
              fill="none"
            />

            <AnimatedPath
              animatedProps={borderTopProps}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeOpacity={0.9}
              fill="none"
            />
            <AnimatedPath
              animatedProps={borderBottomProps}
              stroke="#3b82f6"
              strokeWidth={2}
              strokeOpacity={0.9}
              fill="none"
            />
          </AnimatedSvg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  rulerContainer: {
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
