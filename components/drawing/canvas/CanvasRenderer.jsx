// CanvasRenderer.jsx
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

const DESK_BGCOLOR = "#e9ecef"; // Light desk background giống GoodNotes
const PAGE_BGCOLOR = "#ffffff"; // Page trắng tinh

const CanvasRenderer = forwardRef(function CanvasRenderer(
  {
    strokes,
    currentPoints,
    tool,
    eraserMode,
    color,
    strokeWidth,
    pencilWidth,
    eraserWidth,
    brushWidth,
    calligraphyWidth,
    paperStyle,
    page,
    canvasHeight,
  },
  ref
) {
  const canvasRef = useCanvasRef();

  // Kiểm tra và fallback cho page
  const safePage = {
    x: page?.x ?? 0,
    y: page?.y ?? 0,
    w: page?.w ?? 0,
    h: page?.h ?? 0,
  };

  // Kiểm tra canvasHeight
  const safeCanvasHeight = canvasHeight ?? 0;

  useImperativeHandle(ref, () => ({
    snapshotBase64: () =>
      canvasRef.current?.makeImageSnapshot()?.encodeToBase64?.(),
  }));

  return (
    <Canvas
      ref={canvasRef}
      style={{ width: safePage.w + safePage.x * 2, height: safeCanvasHeight }}
    >
      {/* Desk background */}
      <Rect
        x={0}
        y={0}
        width={safePage.w + safePage.x * 2}
        height={safeCanvasHeight}
        color={DESK_BGCOLOR}
      />
      {/* Page shadow và border (bỏ gradient/blur nếu không hỗ trợ) */}
      {safePage.w > 0 && safePage.h > 0 && (
        <>
          <Rect
            x={safePage.x + 2}
            y={safePage.y + 2}
            width={safePage.w}
            height={safePage.h}
            color="#000000"
            opacity={0.1}
          />
          <Rect
            x={safePage.x}
            y={safePage.y}
            width={safePage.w}
            height={safePage.h}
            color={PAGE_BGCOLOR}
            strokeWidth={1}
            strokeColor="#ced4da" // Border mỏng giống GoodNotes
          />
        </>
      )}

      {/* Paper Guides */}
      {safePage.w > 0 && safePage.h > 0 && (
        <PaperGuides paperStyle={paperStyle} page={safePage} />
      )}

      {/* Render strokes */}
      {strokes &&
        strokes.map((s) => {
          if (!s) return null;

          // TEXT, STICKY NOTE, COMMENT
          if (
            s.tool === "text" ||
            s.tool === "sticky" ||
            s.tool === "comment"
          ) {
            const elements = [];

            // Add background for sticky note and comment
            if (s.tool === "sticky" || s.tool === "comment") {
              const textWidth =
                (s.text?.length || 0) * (s.fontSize || 16) * 0.6 +
                (s.padding || 0) * 2;
              const textHeight = (s.fontSize || 16) + (s.padding || 0) * 2;

              elements.push(
                <Rect
                  key={`${s.id}-bg`}
                  x={s.x - (s.padding || 0)}
                  y={s.y - (s.fontSize || 16) - (s.padding || 0)}
                  width={textWidth}
                  height={textHeight}
                  color={s.backgroundColor || "#FFEB3B"}
                  rx={s.tool === "sticky" ? 4 : 8}
                  ry={s.tool === "sticky" ? 4 : 8}
                />
              );
            }

            // Add text
            elements.push(
              <SkiaText
                key={s.id}
                x={s.x || 0}
                y={s.y || 0}
                text={s.text || ""}
                font={{ size: s.fontSize || 18 }}
                color={s.color || "#000000"}
              />
            );

            return elements;
          }

          // SHAPES (rect/circle/triangle/oval) -> if filled => draw fill then stroke
          if (
            s.shape &&
            [
              "square",
              "rect",
              "circle",
              "triangle",
              "oval",
              "line",
              "arrow",
              "polygon",
              "star",
            ].includes(s.tool)
          ) {
            const path = Skia.Path.Make();
            if (s.tool === "circle") {
              const { cx = 0, cy = 0, r = 0 } = s.shape;
              path.addCircle(cx, cy, r);
            } else if (s.tool === "rect" || s.tool === "square") {
              const { x = 0, y = 0, w = 0, h = 0 } = s.shape;
              path.addRect({ x, y, width: w, height: h });
            } else if (s.tool === "triangle") {
              const {
                x1 = 0,
                y1 = 0,
                x2 = 0,
                y2 = 0,
                x3 = 0,
                y3 = 0,
              } = s.shape;
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
              path.lineTo(x3, y3);
              path.close();
            } else if (s.tool === "oval") {
              const { cx = 0, cy = 0, rx = 0, ry = 0 } = s.shape;
              path.addOval({ cx, cy, rx, ry });
            } else if (s.tool === "line" || s.tool === "arrow") {
              const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = s.shape;
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
            } else if (s.tool === "polygon" || s.tool === "star") {
              const pts = s.shape.points || [];
              if (pts.length > 0) {
                path.moveTo(pts[0]?.x ?? 0, pts[0]?.y ?? 0);
                for (let i = 1; i < pts.length; i++)
                  path.lineTo(pts[i]?.x ?? 0, pts[i]?.y ?? 0);
                path.close();
              }
            }

            if (s.fill && !["line", "arrow"].includes(s.tool)) {
              return (
                <React.Fragment key={s.id}>
                  <Path
                    path={path}
                    color={s.fillColor || "#ffffff"}
                    style="fill"
                  />
                  <Path
                    path={path}
                    color={s.color || "#000000"}
                    strokeWidth={s.width || 1}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                  />
                </React.Fragment>
              );
            } else {
              const main = (
                <Path
                  key={s.id}
                  path={path}
                  color={s.color || "#000000"}
                  strokeWidth={s.width || 1}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                />
              );
              if (s.tool === "arrow") {
                // draw simple arrow head at end
                const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = s.shape;
                const angle = Math.atan2(y2 - y1, x2 - x1);
                const headLen = Math.max(10, (s.width || 1) * 2);
                const leftX = x2 - headLen * Math.cos(angle - Math.PI / 6);
                const leftY = y2 - headLen * Math.sin(angle - Math.PI / 6);
                const rightX = x2 - headLen * Math.cos(angle + Math.PI / 6);
                const rightY = y2 - headLen * Math.sin(angle + Math.PI / 6);
                const head = Skia.Path.Make();
                head.moveTo(x2, y2);
                head.lineTo(leftX, leftY);
                head.moveTo(x2, y2);
                head.lineTo(rightX, rightY);
                return (
                  <React.Fragment key={s.id}>
                    {main}
                    <Path
                      path={head}
                      color={s.color || "#000000"}
                      strokeWidth={s.width || 1}
                      style="stroke"
                      strokeCap="round"
                      strokeJoin="round"
                    />
                  </React.Fragment>
                );
              }
              return main;
            }
          }

          // FREEHAND STROKES
          if (s.points && s.points.length > 0) {
            const path = makePathFromPoints(s.points);
            // If stroke was marked fillable and filled, ensure path is closed before fill
            if (s.fill) {
              try {
                path.close();
              } catch (err) {
                // ignore
              }
              return (
                <React.Fragment key={s.id}>
                  <Path
                    path={path}
                    color={s.fillColor || "#ffffff"}
                    style="fill"
                  />
                  <Path
                    path={path}
                    color={s.color || "#000000"}
                    strokeWidth={s.width || 1}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode={s.tool === "eraser" ? "clear" : "srcOver"}
                  />
                </React.Fragment>
              );
            }

            let strokeColor = s.color || "#000000";
            if (s.tool === "pencil")
              strokeColor = applyPencilAlpha(strokeColor);
            if (s.tool === "brush" || s.tool === "calligraphy") {
              if (typeof s.opacity === "number") {
                try {
                  const hex = strokeColor.replace("#", "");
                  const r = parseInt(hex.slice(0, 2), 16);
                  const g = parseInt(hex.slice(2, 4), 16);
                  const b = parseInt(hex.slice(4, 6), 16);
                  strokeColor = `rgba(${r}, ${g}, ${b}, ${s.opacity})`;
                } catch {}
              }
            }

            return (
              <Path
                key={s.id}
                path={path}
                color={strokeColor}
                strokeWidth={s.width || 1}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
                blendMode={s.tool === "eraser" ? "clear" : "srcOver"}
              />
            );
          }

          return null;
        })}

      {/* Render current drawing (preview) */}
      {currentPoints &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 0 &&
        tool !== "eraser" &&
        tool !== "object-eraser" && (
          <Path
            key="current"
            path={makePathFromPoints(currentPoints)}
            color={tool === "pencil" ? applyPencilAlpha(color) : color}
            strokeWidth={
              tool === "pen"
                ? strokeWidth || 1
                : tool === "pencil"
                ? pencilWidth || 1
                : tool === "highlighter"
                ? (strokeWidth || 1) * 2
                : strokeWidth || 1
            }
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      {currentPoints &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 0 &&
        (tool === "brush" || tool === "calligraphy") && (
          <Path
            key="current-soft"
            path={makePathFromPoints(currentPoints)}
            color={(() => {
              try {
                const hex = color.replace("#", "");
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const alpha = tool === "brush" ? 0.6 : 0.9;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              } catch {
                return color;
              }
            })()}
            strokeWidth={
              tool === "brush" ? brushWidth || 1 : calligraphyWidth || 1
            }
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        )}

      {/* Pixel eraser live preview */}
      {tool === "eraser" &&
        currentPoints &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 0 && (
          <Path
            key="eraser-preview"
            path={makePathFromPoints(currentPoints, false)}
            color={PAGE_BGCOLOR}
            strokeWidth={eraserWidth || 1}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="clear"
          />
        )}

      {/* Object eraser lasso preview (dashed-like by skipping points) */}
      {tool === "object-eraser" &&
        currentPoints &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 1 &&
        (() => {
          const pts = currentPoints;
          const segments = [];
          for (let i = 0; i < pts.length - 1; i += 3) {
            const sub = [
              pts[i] || { x: 0, y: 0 },
              pts[i + 1] || pts[i] || { x: 0, y: 0 },
              pts[i + 2] || pts[i + 1] || pts[i] || { x: 0, y: 0 },
            ];
            segments.push(
              <Path
                key={`lasso-${i}`}
                path={makePathFromPoints(sub, false)}
                color="#4B5563"
                strokeWidth={2}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
              />
            );
          }
          return segments;
        })()}
    </Canvas>
  );
});

export default CanvasRenderer;
