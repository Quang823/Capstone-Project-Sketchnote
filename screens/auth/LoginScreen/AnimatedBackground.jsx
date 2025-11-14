// components/AnimatedBackground.jsx
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { loginStyles } from "./LoginScreen.styles";

const AnimatedBackground = React.memo(() => {
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);
  const orb3 = useSharedValue(0);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const sketch1 = useSharedValue(0);
  const sketch2 = useSharedValue(0);

  useEffect(() => {
    // Vòng xoay orbs
    orb1.value = withRepeat(withTiming(360, { duration: 12000 }), -1);
    orb2.value = withRepeat(withTiming(-360, { duration: 10000 }), -1);
    orb3.value = withRepeat(withTiming(360, { duration: 8000 }), -1);

    // Chuyển động nổi
    float1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(-1, { duration: 4000 })
      ),
      -1
    );
    float2.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5000 }),
          withTiming(-1, { duration: 5000 })
        ),
        -1
      )
    );
    float3.value = withDelay(
      3000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 6000 }),
          withTiming(-1, { duration: 6000 })
        ),
        -1
      )
    );

    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 3000 })
      ),
      -1
    );

    // 👇 Nét vẽ di chuyển qua lại (dạng sketch)
    sketch1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000 }),
        withTiming(-1, { duration: 5000 })
      ),
      -1
    );
    sketch2.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 4000 }),
          withTiming(-1, { duration: 4000 })
        ),
        -1
      )
    );
  }, []);

  const orbStyle1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orb1.value}deg` }],
    opacity: 0.1 + 0.05 * Math.sin((orb1.value * Math.PI) / 180),
  }));
  const orbStyle2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orb2.value}deg` }],
    opacity: 0.1 + 0.05 * Math.cos((orb2.value * Math.PI) / 180),
  }));
  const orbStyle3 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orb3.value}deg` }],
    opacity: 0.1 + 0.05 * Math.sin((orb3.value * Math.PI) / 180),
  }));

  const floatStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float1.value * 10 },
      { translateX: float1.value * 5 },
    ],
  }));
  const floatStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float2.value * 15 },
      { translateX: float2.value * -10 },
    ],
  }));
  const floatStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float3.value * 8 },
      { translateX: float3.value * 6 },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.02 + shimmer.value * 0.05,
  }));

  // 🎨 Hai “nét vẽ” di chuyển qua lại
  const sketchLine1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: sketch1.value * 60 },
      { rotate: `${sketch1.value * 2}deg` },
    ],
    opacity: 0.05 + 0.05 * (1 - Math.abs(sketch1.value)),
  }));
  const sketchLine2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: -sketch2.value * 40 },
      { rotate: `${-sketch2.value * 3}deg` },
    ],
    opacity: 0.04 + 0.06 * Math.abs(sketch2.value),
  }));

  return (
    <View pointerEvents="none" style={loginStyles.backgroundContainer}>
      <Animated.View
        style={[loginStyles.gradientOrb, loginStyles.orbTop, orbStyle1]}
      />
      <Animated.View
        style={[loginStyles.gradientOrb, loginStyles.orbBottom, orbStyle2]}
      />
      <Animated.View
        style={[loginStyles.gradientOrb, loginStyles.orbRight, orbStyle3]}
      />

      <Animated.View
        style={[loginStyles.floatingElement, loginStyles.float1, floatStyle1]}
      />
      <Animated.View
        style={[loginStyles.floatingElement, loginStyles.float2, floatStyle2]}
      />
      <Animated.View
        style={[loginStyles.floatingElement, loginStyles.float3, floatStyle3]}
      />

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: "#3B82F6", borderRadius: 9999 },
          shimmerStyle,
        ]}
      />

      {/* ✏️ Nét vẽ sketch di chuyển */}
      <Animated.View
        style={[
          styles.sketchLine,
          { top: "30%", left: "15%", backgroundColor: "#3B82F6" },
          sketchLine1,
        ]}
      />
      <Animated.View
        style={[
          styles.sketchLine,
          { top: "70%", left: "40%", backgroundColor: "#6366F1" },
          sketchLine2,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  sketchLine: {
    position: "absolute",
    width: 100,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#94A3B8",
    opacity: 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});

export default AnimatedBackground;
