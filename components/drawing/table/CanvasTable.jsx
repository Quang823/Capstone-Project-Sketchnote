import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Group } from "@shopify/react-native-skia";
import TableRenderer from "./TableRenderer";

const CanvasTable = forwardRef(({ stroke, selectedId }, ref) => {
  const [liveTransform, setLiveTransform] = useState(null);

  useImperativeHandle(ref, () => ({
    setLiveTransform: (transform) => {
      setLiveTransform(transform);
    },
  }));

  // Merge stroke with live transform
  const displayTable = liveTransform
    ? {
        ...stroke,
        x: liveTransform.x ?? stroke.x,
        y: liveTransform.y ?? stroke.y,
        width: liveTransform.width ?? stroke.width,
        height: liveTransform.height ?? stroke.height,
        rotation: liveTransform.rotation ?? stroke.rotation,
      }
    : stroke;

  const isSelected = stroke.id === selectedId;

  return (
    <Group>
      <TableRenderer table={displayTable} isSelected={isSelected} />
    </Group>
  );
});

export default CanvasTable;
