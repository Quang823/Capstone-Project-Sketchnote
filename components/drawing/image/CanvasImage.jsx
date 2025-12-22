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
  { stroke, selectedId, onSelectImage, visualOffset }, // ✅ Add visualOffset prop
  ref
) {
  const uri = stroke?.uri ?? stroke?.imageUri ?? null;
  const img = useImage(uri);

  // ✅ Track if currently being moved by lasso
  const isLassoMoving = useRef(false);

  useEffect(() => {
    return () => {
      try {
        img?.dispose?.();
      } catch { }
    };
  }, [img]);

  // Use useSharedValue to store position / size / rotation
  const xVal = useSharedValue(stroke?.x ?? 0);
  const yVal = useSharedValue(stroke?.y ?? 0);
  const wVal = useSharedValue(stroke?.width ?? (img ? img.width : 100));
  const hVal = useSharedValue(stroke?.height ?? (img ? img.height : 100));
  const rotVal = useSharedValue((stroke?.rotation ?? 0) * (Math.PI / 180));

  // ✅ Shared values for lasso visual offset (realtime, no re-render)
  const lassoOffsetX = useSharedValue(0);
  const lassoOffsetY = useSharedValue(0);

  // ✅ Update lasso offset when visualOffset prop changes
  useEffect(() => {
    const dx = visualOffset?.dx ?? 0;
    const dy = visualOffset?.dy ?? 0;

    if (dx !== 0 || dy !== 0) {
      isLassoMoving.current = true;
      lassoOffsetX.value = dx;
      lassoOffsetY.value = dy;
    }
    // Note: We don't set isLassoMoving.current = false here
    // It will be cleared by the clearLassoState() call from GestureHandler
  }, [visualOffset?.dx, visualOffset?.dy]);

  // ✅ Calculate dynamic transform including lasso offset
  const transform = useDerivedValue(() => {
    // Base position from stroke
    const baseX = xVal.value ?? 0;
    const baseY = yVal.value ?? 0;

    // Add lasso offset for realtime movement
    const tx = baseX + lassoOffsetX.value;
    const ty = baseY + lassoOffsetY.value;

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
  }, [xVal, yVal, wVal, hVal, rotVal, lassoOffsetX, lassoOffsetY]);

  // Kích thước động
  const widthDV = useDerivedValue(() => wVal.value, [wVal]);
  const heightDV = useDerivedValue(() => hVal.value, [hVal]);

  // FIX Reanimated warning:
  const transformMemo = useMemo(() => transform, [transform]);
  const widthMemo = useMemo(() => widthDV, [widthDV]);
  const heightMemo = useMemo(() => heightDV, [heightDV]);

  // ✅ FIX: Sync stroke position IMMEDIATELY without animation
  // Only update when NOT being moved by lasso to prevent jitter
  useEffect(() => {
    // ✅ Skip sync if lasso is currently moving this image
    if (isLassoMoving.current) {
      return;
    }

    const newX = stroke?.x ?? 0;
    const newY = stroke?.y ?? 0;
    const newW = stroke?.width ?? wVal.value;
    const newH = stroke?.height ?? hVal.value;
    const newRot = (stroke?.rotation ?? 0) * (Math.PI / 180);

    // Cancel any ongoing animations before updating
    cancelAnimation(xVal);
    cancelAnimation(yVal);
    cancelAnimation(wVal);
    cancelAnimation(hVal);
    cancelAnimation(rotVal);

    // Update values IMMEDIATELY (no animation)
    xVal.value = newX;
    yVal.value = newY;
    wVal.value = newW;
    hVal.value = newH;
    rotVal.value = newRot;

    // ✅ Also reset lasso offsets when stroke position is updated
    lassoOffsetX.value = 0;
    lassoOffsetY.value = 0;
  }, [stroke?.x, stroke?.y, stroke?.width, stroke?.height, stroke?.rotation]);

  useImperativeHandle(
    ref,
    () => ({
      setLiveTransform: ({ x, y, width, height, rotation }) => {
        // ✅ For non-lasso transforms (e.g., ImageTransformBox)
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
      resetToStroke: (s) => {
        if (!s) return;
        isLassoMoving.current = false;

        cancelAnimation(xVal);
        cancelAnimation(yVal);
        cancelAnimation(wVal);
        cancelAnimation(hVal);
        cancelAnimation(rotVal);

        xVal.value = s.x ?? xVal.value;
        yVal.value = s.y ?? yVal.value;
        wVal.value = s.width ?? wVal.value;
        hVal.value = s.height ?? hVal.value;
        rotVal.value = (s.rotation ?? 0) * (Math.PI / 180);

        // Reset lasso offsets
        lassoOffsetX.value = 0;
        lassoOffsetY.value = 0;
      },
      getLiveTransform: () => ({
        x: xVal.value,
        y: yVal.value,
        width: wVal.value,
        height: hVal.value,
        rotation: (rotVal.value * 180) / Math.PI,
      }),
      clearLassoState: () => {
        isLassoMoving.current = false;
        lassoOffsetX.value = 0;
        lassoOffsetY.value = 0;
      },
    }),
    [xVal, yVal, wVal, hVal, rotVal, lassoOffsetX, lassoOffsetY]
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
          dashEffect={[6, 4]}
        />
      )}
    </Group>
  );
});

export default React.memo(CanvasImage);
