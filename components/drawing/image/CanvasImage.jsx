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

  // Track if currently being moved by lasso
  const isLassoMoving = useRef(false);

  // ✅ Track if we're in the middle of a live transform (move/resize/rotate)
  const isLiveTransforming = useRef(false);

  // ✅ FIX: Remove lastSyncedRef - it was causing sync issues with template images
  // Instead, we'll use a simpler approach that always syncs from stroke when not transforming

  useEffect(() => {
    return () => {
      try {
        img?.dispose?.();
      } catch {}
    };
  }, [img]);

  // ✅ FIX: Initialize with stroke values, fallback to image natural size
  const initialWidth = stroke?.width ?? (img ? img.width() : 100);
  const initialHeight = stroke?.height ?? (img ? img.height() : 100);

  const xVal = useSharedValue(stroke?.x ?? 0);
  const yVal = useSharedValue(stroke?.y ?? 0);
  const wVal = useSharedValue(initialWidth);
  const hVal = useSharedValue(initialHeight);
  const rotVal = useSharedValue((stroke?.rotation ?? 0) * (Math.PI / 180));

  // Shared values for lasso visual offset
  const lassoOffsetX = useSharedValue(0);
  const lassoOffsetY = useSharedValue(0);

  // Update lasso offset when visualOffset prop changes
  useEffect(() => {
    const dx = visualOffset?.dx ?? 0;
    const dy = visualOffset?.dy ?? 0;

    if (dx !== 0 || dy !== 0) {
      isLassoMoving.current = true;
      lassoOffsetX.value = dx;
      lassoOffsetY.value = dy;
    }
  }, [visualOffset?.dx, visualOffset?.dy]);

  // Calculate dynamic transform including lasso offset
  const transform = useDerivedValue(() => {
    const baseX = xVal.value ?? 0;
    const baseY = yVal.value ?? 0;
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

  const widthDV = useDerivedValue(() => wVal.value, [wVal]);
  const heightDV = useDerivedValue(() => hVal.value, [hVal]);

  const transformMemo = useMemo(() => transform, [transform]);
  const widthMemo = useMemo(() => widthDV, [widthDV]);
  const heightMemo = useMemo(() => heightDV, [heightDV]);

  // ✅ CRITICAL FIX: Always sync from stroke when not in live transform mode
  // This ensures template images get their correct positions
  useEffect(() => {
    // Skip sync if we're actively transforming or lasso moving
    if (isLiveTransforming.current || isLassoMoving.current) {
      return;
    }

    // Cancel any ongoing animations before updating
    cancelAnimation(xVal);
    cancelAnimation(yVal);
    cancelAnimation(wVal);
    cancelAnimation(hVal);
    cancelAnimation(rotVal);

    // ✅ Always sync from stroke values if they are valid
    if (Number.isFinite(stroke?.x)) {
      xVal.value = stroke.x;
    }
    if (Number.isFinite(stroke?.y)) {
      yVal.value = stroke.y;
    }
    if (Number.isFinite(stroke?.width) && stroke.width > 0) {
      wVal.value = stroke.width;
    }
    if (Number.isFinite(stroke?.height) && stroke.height > 0) {
      hVal.value = stroke.height;
    }
    if (Number.isFinite(stroke?.rotation)) {
      rotVal.value = stroke.rotation * (Math.PI / 180);
    }

    // Reset lasso offsets when stroke position is updated externally
    lassoOffsetX.value = 0;
    lassoOffsetY.value = 0;
  }, [
    stroke?.id,
    stroke?.x,
    stroke?.y,
    stroke?.width,
    stroke?.height,
    stroke?.rotation,
  ]);

  // ✅ FIX: Also sync when image loads (for template images that may load async)
  useEffect(() => {
    if (img && stroke && !isLiveTransforming.current) {
      const needsWidthSync =
        !Number.isFinite(stroke.width) || stroke.width <= 0;
      const needsHeightSync =
        !Number.isFinite(stroke.height) || stroke.height <= 0;

      if (needsWidthSync) {
        wVal.value = img.width() || 100;
      }
      if (needsHeightSync) {
        hVal.value = img.height() || 100;
      }
    }
  }, [img]);

  useImperativeHandle(
    ref,
    () => ({
      setLiveTransform: ({ x, y, width, height, rotation }) => {
        // ✅ Mark as live transforming to prevent sync from overwriting
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

      // ✅ NEW: Call this when transform ends to allow sync again
      endLiveTransform: () => {
        isLiveTransforming.current = false;
      },

      resetToStroke: (s) => {
        if (!s) return;
        isLassoMoving.current = false;
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

      // ✅ Force sync from stroke (useful after resize/move commit)
      forceSync: (s) => {
        if (!s) return;

        isLiveTransforming.current = false;
        isLassoMoving.current = false;

        cancelAnimation(xVal);
        cancelAnimation(yVal);
        cancelAnimation(wVal);
        cancelAnimation(hVal);
        cancelAnimation(rotVal);

        if (Number.isFinite(s.x)) xVal.value = s.x;
        if (Number.isFinite(s.y)) yVal.value = s.y;
        if (Number.isFinite(s.width)) wVal.value = s.width;
        if (Number.isFinite(s.height)) hVal.value = s.height;
        if (Number.isFinite(s.rotation)) {
          rotVal.value = s.rotation * (Math.PI / 180);
        }

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
