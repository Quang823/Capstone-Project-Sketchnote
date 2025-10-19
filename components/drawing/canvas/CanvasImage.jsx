import React from "react";
import {
  Image as SkiaImage,
  Rect,
  Group,
  useImage,
} from "@shopify/react-native-skia";

export default function CanvasImage({ stroke, selectedId }) {
  const uri =
    typeof stroke.uri === "string"
      ? stroke.uri
      : stroke?.imageUri ||
        (typeof stroke.image === "string" ? stroke.image : null);

  if (!uri) {
    console.warn("⚠️ CanvasImage missing valid uri for stroke:", stroke);
    return null;
  }

  const img = useImage(uri);
  if (!img) return null;

  const maxWidth = 400;
  const scale = Math.min(1, maxWidth / img.width());
  const width = stroke.width ?? img.width() * scale;
  const height = stroke.height ?? img.height() * scale;
  const { x = 0, y = 0, rotation = 0 } = stroke;

  return (
    <Group
      transform={[
        { translateX: x + width / 2 },
        { translateY: y + height / 2 },
        { rotate: (rotation * Math.PI) / 180 },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
      ]}
    >
      <SkiaImage image={img} x={0} y={0} width={width} height={height} />
      {selectedId === stroke.id && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          color="transparent"
          strokeWidth={1.5}
          strokeColor="#2563EB"
          style="stroke"
          dashEffect={[6, 4]}
        />
      )}
    </Group>
  );
}
