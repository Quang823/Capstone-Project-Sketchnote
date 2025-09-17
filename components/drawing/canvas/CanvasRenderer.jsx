import React, { forwardRef, useImperativeHandle } from "react";
import {
  Canvas,
  Path,
  Rect,
  Skia,
  Text as SkiaText,
  useCanvasRef,
} from "@shopify/react-native-skia";
import PaperGuides from "./PaperGuides";
import { applyPencilAlpha, makePathFromPoints } from "./utils";

const DESK_BGCOLOR = "#111111";
const PAGE_BGCOLOR = "#FAF9F6";

const CanvasRenderer = forwardRef(function CanvasRenderer(
  {
    strokes,
    currentPoints,
    tool,
    color,
    strokeWidth,
    pencilWidth,
    eraserWidth,
    paperStyle,
    page,
    canvasHeight,
  },
  ref
) {
  const canvasRef = useCanvasRef();

  useImperativeHandle(ref, () => ({
    snapshotBase64: () =>
      canvasRef.current?.makeImageSnapshot()?.encodeToBase64?.(),
  }));

  return (
    <Canvas
      ref={canvasRef}
      style={{ width: page.w + page.x * 2, height: canvasHeight }}
    >
      {/* Desk */}
      <Rect
        x={0}
        y={0}
        width={page.w + page.x * 2}
        height={canvasHeight}
        color={DESK_BGCOLOR}
      />

      {/* Page */}
      <Rect
        x={page.x}
        y={page.y}
        width={page.w}
        height={page.h}
        color={PAGE_BGCOLOR}
      />

      {/* Paper Guides */}
      <PaperGuides paperStyle={paperStyle} page={page} />

      {/* Render strokes */}
      {strokes.map((s) => {
        if (!s) return null;

        if (s.tool === "text") {
          return (
            <SkiaText
              key={s.id}
              x={s.x}
              y={s.y}
              text={s.text}
              font={{ size: s.fontSize || 18 }}
              color={s.color}
            />
          );
        }

        if (
          ["square", "rect", "circle", "triangle", "oval"].includes(s.tool) &&
          s.shape
        ) {
          let path = Skia.Path.Make();
          if (s.tool === "circle") {
            const { cx, cy, r } = s.shape;
            path.addCircle(cx, cy, r);
          } else if (s.tool === "rect" || s.tool === "square") {
            const { x, y, w, h } = s.shape;
            path.addRect({ x, y, width: w, height: h });
          } else if (s.tool === "triangle") {
            const { x1, y1, x2, y2, x3, y3 } = s.shape;
            path.moveTo(x1, y1);
            path.lineTo(x2, y2);
            path.lineTo(x3, y3);
            path.close();
          } else if (s.tool === "oval") {
            const { cx, cy, rx, ry } = s.shape;
            path.addOval({ cx, cy, rx, ry });
          }
          return (
            <Path
              key={s.id}
              path={path}
              color={s.color}
              strokeWidth={s.width}
              style="stroke"
            />
          );
        }

        const strokeColor =
          s.tool === "eraser"
            ? PAGE_BGCOLOR
            : s.tool === "pencil"
            ? applyPencilAlpha(s.color)
            : s.color;

        return (
          <Path
            key={s.id}
            path={makePathFromPoints(s.points)}
            color={strokeColor}
            strokeWidth={s.width}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode={s.tool === "eraser" ? "clear" : "srcOver"}
          />
        );
      })}

      {/* Render current drawing */}
      {currentPoints && currentPoints.length > 0 && tool !== "eraser" && (
        <Path
          key="current"
          path={makePathFromPoints(currentPoints)}
          color={tool === "pencil" ? applyPencilAlpha(color) : color}
          strokeWidth={
            tool === "pen"
              ? strokeWidth
              : tool === "pencil"
              ? pencilWidth
              : tool === "highlighter"
              ? strokeWidth * 2
              : strokeWidth
          }
          style="stroke"
          strokeCap="round"
          strokeJoin="round"
        />
      )}
    </Canvas>
  );
});

export default CanvasRenderer;
