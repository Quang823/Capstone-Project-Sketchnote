import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, Easing } from "react-native";

export default function TypeFloatText({ text, style, speed = 60 }) {
  const [displayedText, setDisplayedText] = useState("");
  const floatAnim = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const textRef = useRef(text);

  // ✅ FIX: Use ref to track text changes and prevent multiple intervals
  useEffect(() => {
    textRef.current = text;
    indexRef.current = 0;
  }, [text]);

  // Typewriter effect - only create ONE interval
  useEffect(() => {
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayedText(textRef.current.slice(0, indexRef.current));
      if (indexRef.current > textRef.current.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [speed]); // ✅ Only recreate when speed changes

  // Floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text
      style={[
        style,
        {
          transform: [{ translateY: floatAnim }],
        },
      ]}
    >
      {displayedText}
    </Animated.Text>
  );
}
