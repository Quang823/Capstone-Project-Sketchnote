// CanvasImage.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import {
  Image as SkiaImage,
  Group,
  Rect,
  useImage,
} from "@shopify/react-native-skia";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";

/**
 * CanvasImage (Skia-based, live transform)
 *
 * Props:
 *  - stroke: { id, x, y, width, height, rotation, uri }
 *  - selectedId
 *  - onSelectImage (optional)
 *
 * Exposed methods via ref:
 *  - setLiveTransform({ x, y, width, height, rotation })
 *  - resetToStroke(stroke)
 *  - getLiveTransform()
 */
const CanvasImage = forwardRef(function CanvasImage(
  { stroke, selectedId, onSelectImage },
  ref
) {
  const uri = stroke?.uri ?? stroke?.imageUri ?? null;
  const img = useImage(uri);

  // Dùng useSharedValue để lưu vị trí / kích thước / góc quay
  const xVal = useSharedValue(stroke?.x ?? 0);
  const yVal = useSharedValue(stroke?.y ?? 0);
  const wVal = useSharedValue(stroke?.width ?? (img ? img.width : 100));
  const hVal = useSharedValue(stroke?.height ?? (img ? img.height : 100));
  const rotVal = useSharedValue((stroke?.rotation ?? 0) * (Math.PI / 180));

  // Tính toán transform động
  const transform = useDerivedValue(() => {
    const tx = xVal.value ?? 0;
    const ty = yVal.value ?? 0;
    const w = wVal.value ?? 0;
    const h = hVal.value ?? 0;
    const r = rotVal.value ?? 0;
    const cx = w / 2;
    const cy = h / 2;
    return [
      { translateX: tx },
      { translateY: ty },
      { translateX: cx },
      { translateY: cy },
      { rotate: r },
      { translateX: -cx },
      { translateY: -cy },
    ];
  }, [xVal, yVal, wVal, hVal, rotVal]);

  // Kích thước động
  const widthDV = useDerivedValue(() => wVal.value, [wVal]);
  const heightDV = useDerivedValue(() => hVal.value, [hVal]);

  // 🧩 FIX cảnh báo Reanimated:
  // Dùng useMemo để đảm bảo React không đọc trực tiếp .value trong render
  const transformMemo = useMemo(() => transform, [transform]);
  const widthMemo = useMemo(() => widthDV, [widthDV]);
  const heightMemo = useMemo(() => heightDV, [heightDV]);

  useEffect(() => {
    // reset khi stroke thay đổi
    xVal.value = stroke?.x ?? xVal.value;
    yVal.value = stroke?.y ?? yVal.value;
    wVal.value = stroke?.width ?? wVal.value;
    hVal.value = stroke?.height ?? hVal.value;
    rotVal.value =
      (stroke?.rotation ?? (rotVal.value * 180) / Math.PI) * (Math.PI / 180);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stroke?.x, stroke?.y, stroke?.width, stroke?.height, stroke?.rotation]);

  useImperativeHandle(
    ref,
    () => ({
      setLiveTransform: ({ x, y, width, height, rotation }) => {
        if (typeof x === "number") xVal.value = x;
        if (typeof y === "number") yVal.value = y;
        if (typeof width === "number") wVal.value = width;
        if (typeof height === "number") hVal.value = height;
        if (typeof rotation === "number")
          rotVal.value = rotation * (Math.PI / 180);
      },
      resetToStroke: (s) => {
        if (!s) return;
        xVal.value = s.x ?? xVal.value;
        yVal.value = s.y ?? yVal.value;
        wVal.value = s.width ?? wVal.value;
        hVal.value = s.height ?? hVal.value;
        rotVal.value =
          (s.rotation ?? (rotVal.value * 180) / Math.PI) * (Math.PI / 180);
      },
      getLiveTransform: () => ({
        x: xVal.value,
        y: yVal.value,
        width: wVal.value,
        height: hVal.value,
        rotation: (rotVal.value * 180) / Math.PI,
      }),
    }),
    [xVal, yVal, wVal, hVal, rotVal]
  );

  if (!img) return null;

  // Group + SkiaImage sẽ tự subscribe vào DerivedValue
  return (
    <Group transform={transformMemo}>
      <SkiaImage
        image={img}
        x={0}
        y={0}
        width={widthMemo}
        height={heightMemo}
      />
      {selectedId === stroke.id && (
        <Rect
          x={0}
          y={0}
          width={widthMemo}
          height={heightMemo}
          color="transparent"
          strokeWidth={1.5}
          strokeColor="#2563EB"
          style="stroke"
          dashEffect={[6, 4]}
        />
      )}
    </Group>
  );
});

export default React.memo(CanvasImage);
