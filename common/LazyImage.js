import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LazyImage = (props) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to delay rendering until the next paint cycle.
    // This helps prevent blocking the UI thread during initial render.
    const frameId = requestAnimationFrame(() => {
      setShouldRender(true);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  const { style, ...rest } = props;

  if (!shouldRender) {
    // Render a placeholder with the same dimensions as the image
    return <View style={[styles.placeholder, style]} />;
  }

  return <Image style={style} {...rest} />;
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#F3F4F6', // A light gray color similar to the empty thumbnail
  },
});

export default React.memo(LazyImage);
