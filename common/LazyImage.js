import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

const LazyImage = ({ style, preview, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[style, styles.container]}>
      {/* Placeholder (hiện trước khi ảnh load) */}
      {!loaded && <View style={[styles.placeholder, style]} />}

      {/* Ảnh chính với fade-in + caching */}
      <Image
        {...rest}
        style={[style, loaded ? styles.imageVisible : styles.imageHidden]}
        onLoad={() => setLoaded(true)}
        contentFit="cover"
        transition={300} // fade-in 300ms
        placeholder={preview ? [preview] : null} // blur preview optional
        cachePolicy="disk" // full cache
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  placeholder: {
    backgroundColor: "#E5E7EB",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  imageHidden: {
    opacity: 0,
  },
  imageVisible: {
    opacity: 1,
  },
});

export default React.memo(LazyImage);
