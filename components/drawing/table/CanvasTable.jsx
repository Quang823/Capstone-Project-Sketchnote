import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Group } from "@shopify/react-native-skia";
import TableRenderer from "./TableRenderer";

const CanvasTable = forwardRef(({ stroke, selectedId, visualOffset }, ref) => {
  const [liveTransform, setLiveTransform] = useState(null);

  // ✅ Track if currently being moved by lasso
  const isLassoMoving = useRef(false);

  // ✅ Track previous stroke position to detect changes
  const prevStrokeRef = useRef({
    x: stroke?.x,
    y: stroke?.y,
    width: stroke?.width,
    height: stroke?.height,
    rotation: stroke?.rotation,
  });

  // ✅ Sync liveTransform when stroke props change (after lasso commit)
  useEffect(() => {
    // Skip if lasso is currently moving
    if (isLassoMoving.current) {
      return;
    }

    const prev = prevStrokeRef.current;
    const hasChanged =
      prev.x !== stroke?.x ||
      prev.y !== stroke?.y ||
      prev.width !== stroke?.width ||
      prev.height !== stroke?.height ||
      prev.rotation !== stroke?.rotation;

    if (hasChanged) {
      // ✅ Reset liveTransform to null so displayTable uses stroke directly
      setLiveTransform(null);

      // Update ref
      prevStrokeRef.current = {
        x: stroke?.x,
        y: stroke?.y,
        width: stroke?.width,
        height: stroke?.height,
        rotation: stroke?.rotation,
      };
    }
  }, [stroke?.x, stroke?.y, stroke?.width, stroke?.height, stroke?.rotation]);

  // ✅ Handle visualOffset from lasso
  useEffect(() => {
    const dx = visualOffset?.dx ?? 0;
    const dy = visualOffset?.dy ?? 0;

    if (dx !== 0 || dy !== 0) {
      // Lasso is actively moving
      isLassoMoving.current = true;
    }
    // Note: We don't set isLassoMoving.current = false here
    // It will be cleared by the clearLassoState() call from GestureHandler
  }, [visualOffset?.dx, visualOffset?.dy]);

  useImperativeHandle(ref, () => ({
    setLiveTransform: (transform) => {
      // ✅ Don't set live transform if lasso is moving (it handles offset separately)
      if (isLassoMoving.current && visualOffset?.dx !== undefined) {
        return;
      }
      setLiveTransform(transform);
    },
    resetToStroke: (s) => {
      if (!s) return;
      isLassoMoving.current = false;
      setLiveTransform(null);
      prevStrokeRef.current = {
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        rotation: s.rotation,
      };
    },
    getLiveTransform: () => {
      if (liveTransform) {
        return {
          x: liveTransform.x ?? stroke?.x ?? 0,
          y: liveTransform.y ?? stroke?.y ?? 0,
          width: liveTransform.width ?? stroke?.width ?? 300,
          height: liveTransform.height ?? stroke?.height ?? 200,
          rotation: liveTransform.rotation ?? stroke?.rotation ?? 0,
        };
      }
      return {
        x: stroke?.x ?? 0,
        y: stroke?.y ?? 0,
        width: stroke?.width ?? 300,
        height: stroke?.height ?? 200,
        rotation: stroke?.rotation ?? 0,
      };
    },
    clearLassoState: () => {
      isLassoMoving.current = false;
    },
  }));

  // ✅ Calculate display position including visualOffset
  const displayTable = useMemo(() => {
    const baseX = liveTransform?.x ?? stroke?.x ?? 0;
    const baseY = liveTransform?.y ?? stroke?.y ?? 0;

    // Add lasso visual offset
    const offsetX = visualOffset?.dx ?? 0;
    const offsetY = visualOffset?.dy ?? 0;

    return {
      ...stroke,
      x: baseX + offsetX,
      y: baseY + offsetY,
      width: liveTransform?.width ?? stroke?.width,
      height: liveTransform?.height ?? stroke?.height,
      rotation: liveTransform?.rotation ?? stroke?.rotation,
    };
  }, [stroke, liveTransform, visualOffset?.dx, visualOffset?.dy]);

  const isSelected = stroke?.id === selectedId;

  return (
    <Group>
      <TableRenderer table={displayTable} isSelected={isSelected} />
    </Group>
  );
});

export default CanvasTable;
