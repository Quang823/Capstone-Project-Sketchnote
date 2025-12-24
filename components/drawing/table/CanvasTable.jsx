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
  const isLiveTransforming = useRef(false);

  // ✅ Get offset directly from props
  const offsetX = visualOffset?.dx ?? 0;
  const offsetY = visualOffset?.dy ?? 0;

  // ✅ Sync when stroke changes and no offset active
  useEffect(() => {
    if (isLiveTransforming.current) return;
    if (offsetX !== 0 || offsetY !== 0) return;

    // Reset liveTransform to use stroke values
    setLiveTransform(null);
  }, [
    stroke?.x,
    stroke?.y,
    stroke?.width,
    stroke?.height,
    stroke?.rotation,
    offsetX,
    offsetY,
  ]);

  useImperativeHandle(ref, () => ({
    setLiveTransform: (transform) => {
      isLiveTransforming.current = true;
      setLiveTransform(transform);
    },
    resetToStroke: (s) => {
      if (!s) return;
      isLiveTransforming.current = false;
      setLiveTransform(null);
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
    forceSync: (s) => {
      if (!s) return;
      isLiveTransforming.current = false;
      setLiveTransform(null);
    },
    clearLassoState: () => {
      isLiveTransforming.current = false;
    },
  }));

  // ✅ Calculate display position with offset applied
  const displayTable = useMemo(() => {
    const baseX = liveTransform?.x ?? stroke?.x ?? 0;
    const baseY = liveTransform?.y ?? stroke?.y ?? 0;

    return {
      ...stroke,
      x: baseX + offsetX,
      y: baseY + offsetY,
      width: liveTransform?.width ?? stroke?.width,
      height: liveTransform?.height ?? stroke?.height,
      rotation: liveTransform?.rotation ?? stroke?.rotation,
    };
  }, [stroke, liveTransform, offsetX, offsetY]);

  const isSelected = stroke?.id === selectedId;

  return (
    <Group>
      <TableRenderer table={displayTable} isSelected={isSelected} />
    </Group>
  );
});

export default CanvasTable;
