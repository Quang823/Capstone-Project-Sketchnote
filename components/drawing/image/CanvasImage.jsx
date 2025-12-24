import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Image as SkiaImage,
  Group,
  Rect,
  useImage,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  cancelAnimation,
} from "react-native-reanimated";

const CanvasImage = forwardRef(function CanvasImage(
  { stroke, selectedId, onSelectImage, visualOffset },
  ref
) {
  const uri = stroke?.uri ?? stroke?.imageUri ?? null;
  const img = useImage(uri);

  const isLiveTransforming = useRef(false);

  useEffect(() => {
    return () => {
      try {
        img?.dispose?.();
      } catch {}
    };
  }, [img]);

  const initialWidth = stroke?.width ?? (img ? img.width() : 100);
  const initialHeight = stroke?.height ?? (img ? img.height() : 100);

  const xVal = useSharedValue(stroke?.x ?? 0);
  const yVal = useSharedValue(stroke?.y ?? 0);
  const wVal = useSharedValue(initialWidth);
  const hVal = useSharedValue(initialHeight);
  const rotVal = useSharedValue((stroke?.rotation ?? 0) * (Math.PI / 180));

  // ✅ Get offset directly from props - NO internal lasso state
  const offsetX = visualOffset?.dx ?? 0;
  const offsetY = visualOffset?.dy ?? 0;

  // ✅ Calculate transform with offset applied directly from props
  const transform = useDerivedValue(() => {
    const baseX = xVal.value ?? 0;
    const baseY = yVal.value ?? 0;
    // Apply offset from props
    const tx = baseX + offsetX;
    const ty = baseY + offsetY;
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
  }, [xVal, yVal, wVal, hVal, rotVal, offsetX, offsetY]);

  const widthDV = useDerivedValue(() => wVal.value, [wVal]);
  const heightDV = useDerivedValue(() => hVal.value, [hVal]);

  const transformMemo = useMemo(() => transform, [transform]);
  const widthMemo = useMemo(() => widthDV, [widthDV]);
  const heightMemo = useMemo(() => heightDV, [heightDV]);

  // ✅ Sync from stroke when:
  // 1. Not live transforming
  // 2. No active visual offset (not being dragged by lasso)
  useEffect(() => {
    if (isLiveTransforming.current) return;

    // ✅ IMPORTANT: Only sync when there's NO offset
    // This prevents jumping when offset is cleared but stroke hasn't updated yet
    if (offsetX !== 0 || offsetY !== 0) return;

    cancelAnimation(xVal);
    cancelAnimation(yVal);
    cancelAnimation(wVal);
    cancelAnimation(hVal);
    cancelAnimation(rotVal);

    if (Number.isFinite(stroke?.x)) xVal.value = stroke.x;
    if (Number.isFinite(stroke?.y)) yVal.value = stroke.y;
    if (Number.isFinite(stroke?.width) && stroke.width > 0)
      wVal.value = stroke.width;
    if (Number.isFinite(stroke?.height) && stroke.height > 0)
      hVal.value = stroke.height;
    if (Number.isFinite(stroke?.rotation))
      rotVal.value = stroke.rotation * (Math.PI / 180);
  }, [
    stroke?.id,
    stroke?.x,
    stroke?.y,
    stroke?.width,
    stroke?.height,
    stroke?.rotation,
    offsetX,
    offsetY,
  ]);

  // Sync when image loads
  useEffect(() => {
    if (img && stroke && !isLiveTransforming.current) {
      const needsWidthSync =
        !Number.isFinite(stroke.width) || stroke.width <= 0;
      const needsHeightSync =
        !Number.isFinite(stroke.height) || stroke.height <= 0;

      if (needsWidthSync) wVal.value = img.width() || 100;
      if (needsHeightSync) hVal.value = img.height() || 100;
    }
  }, [img]);

  useImperativeHandle(
    ref,
    () => ({
      setLiveTransform: ({ x, y, width, height, rotation }) => {
        isLiveTransforming.current = true;

        if (typeof x === "number") {
          cancelAnimation(xVal);
          xVal.value = x;
        }
        if (typeof y === "number") {
          cancelAnimation(yVal);
          yVal.value = y;
        }
        if (typeof width === "number") {
          cancelAnimation(wVal);
          wVal.value = width;
        }
        if (typeof height === "number") {
          cancelAnimation(hVal);
          hVal.value = height;
        }
        if (typeof rotation === "number") {
          cancelAnimation(rotVal);
          rotVal.value = rotation * (Math.PI / 180);
        }
      },

      endLiveTransform: () => {
        isLiveTransforming.current = false;
      },

      resetToStroke: (s) => {
        if (!s) return;
        isLiveTransforming.current = false;

        cancelAnimation(xVal);
        cancelAnimation(yVal);
        cancelAnimation(wVal);
        cancelAnimation(hVal);
        cancelAnimation(rotVal);

        if (Number.isFinite(s.x)) xVal.value = s.x;
        if (Number.isFinite(s.y)) yVal.value = s.y;
        if (Number.isFinite(s.width)) wVal.value = s.width;
        if (Number.isFinite(s.height)) hVal.value = s.height;
        rotVal.value = (s.rotation ?? 0) * (Math.PI / 180);
      },

      getLiveTransform: () => ({
        x: xVal.value,
        y: yVal.value,
        width: wVal.value,
        height: hVal.value,
        rotation: (rotVal.value * 180) / Math.PI,
      }),

      forceSync: (s) => {
        if (!s) return;
        isLiveTransforming.current = false;

        cancelAnimation(xVal);
        cancelAnimation(yVal);
        cancelAnimation(wVal);
        cancelAnimation(hVal);
        cancelAnimation(rotVal);

        if (Number.isFinite(s.x)) xVal.value = s.x;
        if (Number.isFinite(s.y)) yVal.value = s.y;
        if (Number.isFinite(s.width)) wVal.value = s.width;
        if (Number.isFinite(s.height)) hVal.value = s.height;
        if (Number.isFinite(s.rotation))
          rotVal.value = s.rotation * (Math.PI / 180);
      },

      clearLassoState: () => {
        isLiveTransforming.current = false;
      },
    }),
    [xVal, yVal, wVal, hVal, rotVal]
  );

  if (!img) return null;

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
        />
      )}
    </Group>
  );
});

export default React.memo(CanvasImage);
