import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useDerivedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const CustomScrollbar = ({
  contentHeight,
  containerHeight,
  scrollYShared, // ✅ Changed from scrollY to scrollYShared
  onScroll,
  isZooming = false,
}) => {
  // State for hover effect
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate scrollbar dimensions
  const scrollRatio = Math.min(containerHeight / contentHeight, 1);
  const thumbHeight = Math.max(containerHeight * scrollRatio, 40);

  // Animated values
  const opacity = useSharedValue(0.2);

  // ✅ Derive thumb position from scrollYShared (runs on UI thread)
  const thumbPosition = useDerivedValue(() => {
    if (!contentHeight || !containerHeight || contentHeight <= containerHeight) {
      return 0;
    }
    const scrollProgress = scrollYShared.value / (contentHeight - containerHeight);
    return Math.max(0, Math.min(scrollProgress * (containerHeight - thumbHeight), containerHeight - thumbHeight));
  }, [contentHeight, containerHeight, thumbHeight]);

  // Handle drag gesture
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setIsDragging)(true);
      opacity.value = withTiming(0.6, { duration: 150 });
    })
    .onUpdate((e) => {
      let newPosition = thumbPosition.value + e.changeY;

      // Constrain within bounds
      if (newPosition < 0) newPosition = 0;
      if (newPosition > containerHeight - thumbHeight) {
        newPosition = containerHeight - thumbHeight;
      }

      thumbPosition.value = newPosition;

      // Calculate and propagate scroll position
      const scrollProgress = newPosition / (containerHeight - thumbHeight);
      const newScrollY = scrollProgress * (contentHeight - containerHeight);
      runOnJS(onScroll)(newScrollY);
    })
    .onEnd(() => {
      runOnJS(setIsDragging)(false);
      opacity.value = withTiming(isHovered ? 0.4 : 0.2, { duration: 150 });
    });

  // Handle tap gesture (jump to position)
  const tapGesture = Gesture.Tap().onStart((e) => {
    let newPosition = e.y - thumbHeight / 2;

    // Constrain within bounds
    if (newPosition < 0) newPosition = 0;
    if (newPosition > containerHeight - thumbHeight) {
      newPosition = containerHeight - thumbHeight;
    }

    thumbPosition.value = withTiming(newPosition, { duration: 150 });

    // Calculate and propagate scroll position
    const scrollProgress = newPosition / (containerHeight - thumbHeight);
    const newScrollY = scrollProgress * (contentHeight - containerHeight);
    runOnJS(onScroll)(newScrollY);
  });

  // Combine gestures
  const gesture = Gesture.Race(dragGesture, tapGesture);

  // Animated styles
  const thumbStyle = useAnimatedStyle(() => ({
    height: thumbHeight,
    top: thumbPosition.value,
    opacity: isZooming ? 0 : opacity.value,
  }));

  return (
    <View
      style={[styles.scrollbarTrack, { height: containerHeight }]}
      onMouseEnter={() => {
        setIsHovered(true);
        opacity.value = withTiming(0.4, { duration: 150 });
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (!isDragging) {
          opacity.value = withTiming(0.2, { duration: 150 });
        }
      }}
    >
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.scrollbarThumb,
            thumbStyle,
            isDragging && styles.scrollbarThumbActive,
          ]}
        />
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollbarTrack: {
    position: "absolute",
    right: 4,
    top: 0,
    width: 12,
    backgroundColor: "transparent",
    borderRadius: 6,
    zIndex: 100,
  },
  scrollbarThumb: {
    position: "absolute",
    right: 0,
    width: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 4,
    cursor: "pointer",
  },
  scrollbarThumbActive: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 10,
  },
});

export default CustomScrollbar;
