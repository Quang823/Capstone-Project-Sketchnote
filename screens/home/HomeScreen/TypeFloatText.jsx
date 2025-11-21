import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, Easing } from "react-native";

export default function TypeFloatText({ text, style, speed = 60 }) {
  const [displayedText, setDisplayedText] = useState("");
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index));
      index++;
      if (index > text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

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
