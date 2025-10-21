import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

export default function ImageSelectionBox({
  x,
  y,
  width,
  height,
  onCopy,
  onCut,
  onDelete,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, []);

  const menuWidth = Math.max(180, width); // Giữ tối thiểu 180 cho cân đối

  return (
    <Animated.View
      style={[
        styles.toolbar,
        {
          left: x + (width - menuWidth) / 2,
          top: y - 58,
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
  );
}

const styles = StyleSheet.create({
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
