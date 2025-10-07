import React, { forwardRef, useImperativeHandle } from "react";
import {
  Canvas,
  Path,
  Rect,
  Group,
  Skia,
  Text as SkiaText,
  useCanvasRef,
  useFont,
  Circle,
} from "@shopify/react-native-skia";
import PaperGuides from "./PaperGuides";
import { applyPencilAlpha, makePathFromPoints } from "./utils";

const DESK_BGCOLOR = "#e9ecef";
const PAGE_BGCOLOR = "#ffffff";

/**
 * Simple stabilization smoothing:
 * - stabilization in [0..1], where 0 = no smoothing, 1 = max smoothing.
 * - we implement exponential moving average: smoothed = prev + (pt - prev) * (1 - stab)
 *   so larger stab => slower following => smoother.
 */
function smoothPoints(points = [], stabilization = 0) {
  if (!Array.isArray(points) || points.length === 0 || stabilization <= 0) {
    return points;
  }
  const out = [];
  let prev = { x: points[0].x, y: points[0].y };
  out.push({ ...prev });
  const alpha = 1 - Math.max(0, Math.min(1, stabilization)); // alpha = responsiveness
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const nx = prev.x + (p.x - prev.x) * alpha;
    const ny = prev.y + (p.y - prev.y) * alpha;
    const newP = { ...p, x: nx, y: ny };
    out.push(newP);
    prev = newP;
  }
  return out;
}

/**
 * Compute effective stroke width:
 * - baseWidth: stroke's stored width (or tool default)
 * - thickness: user multiplier (recommended range used in UI, e.g. 0.2..5)
 * - pressure: user "pressure sensitivity" factor in [0..1], center 0.5 = neutral
 *
 * We compute a gentle mapping so that:
 * - thickness scales baseWidth
 * - pressure nudges width around neutral (0.5)
 */
function computeEffectiveWidth(baseWidth = 1, thickness = 1, pressure = 0.5) {
  const safeThickness = Math.max(0.1, thickness); // avoid zero
  // pressureFactor: map pressure 0..1 to multiplier around 1: e.g. 0.5 => 1.0
  // keep effect modest so lines don't explode: scale range ~ [0.7, 1.3]
  const pressureFactor = 1 + (pressure - 0.5) * 1.2; // -> 0.4..1.6 (clamp below)
  const pf = Math.max(0.35, Math.min(1.6, pressureFactor));
  return baseWidth * safeThickness * pf;
}

const CanvasRenderer = forwardRef(function CanvasRenderer(
  {
    strokes,
    currentPoints,
    tool,
    eraserMode,
    color,
    strokeWidth,
    pencilWidth,
    eraserSize,
    brushWidth,
    calligraphyWidth,
    paperStyle,
    page,
    canvasHeight,
    selectedId, // kept
    toolConfigs = {},
    pressure = 0.5,
    thickness = 1,
    stabilization = 0,
  },
  ref
) {
  const canvasRef = useCanvasRef();

  // FONT LOADING
  let fontAsset;
  try {
    fontAsset = require("../../../assets/fonts/Roboto-Regular.ttf");
  } catch (err) {
    fontAsset = null;
  }

  const font12 = useFont(fontAsset, 12);
  const font14 = useFont(fontAsset, 14);
  const font16 = useFont(fontAsset, 16);
  const font18 = useFont(fontAsset, 18);
  const font20 = useFont(fontAsset, 20);
  const font24 = useFont(fontAsset, 24);
  const font32 = useFont(fontAsset, 32);

  const fontMap = {
    12: font12,
    14: font14,
    16: font16,
    18: font18,
    20: font20,
    24: font24,
    32: font32,
  };

  const getClosestFont = (size) => {
    if (!size) size = 18;
    if (fontMap[size]) return fontMap[size];
    const sizes = Object.keys(fontMap).map((s) => parseInt(s, 10));
    let closest = sizes[0];
    let bestDiff = Math.abs(size - closest);
    for (let s of sizes) {
      const d = Math.abs(size - s);
      if (d < bestDiff) {
        bestDiff = d;
        closest = s;
      }
    }
    return fontMap[closest] || null;
  };

  const makeFallbackFont = (size) => {
    try {
      const typeface = Skia.Typeface.MakeDefault();
      return Skia.Font ? new Skia.Font(typeface, size) : null;
    } catch (err) {
      return null;
    }
  };

  const safePage = {
    x: page?.x ?? 0,
    y: page?.y ?? 0,
    w: page?.w ?? 0,
    h: page?.h ?? 0,
  };
  const safeCanvasHeight = canvasHeight ?? 0;

  useImperativeHandle(ref, () => ({
    snapshotBase64: () =>
      canvasRef.current?.makeImageSnapshot()?.encodeToBase64?.(),
  }));

  const approxTextWidth = (text, fontSize) => {
    if (!text) return 0;
    return text.length * (fontSize || 18) * 0.6;
  };

  const lastPt = currentPoints.at(-1);
  const dynamicPressure = lastPt?.pressure ?? pressure;
  const dynamicThickness = lastPt?.thickness ?? thickness;
  const dynamicStab = lastPt?.stabilization ?? stabilization;

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

      {/* Page shadow + border */}
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
            strokeColor="#ced4da"
          />
        </>
      )}

      {/* Paper guides */}
      {safePage.w > 0 && safePage.h > 0 && (
        <PaperGuides paperStyle={paperStyle} page={safePage} />
      )}

      {/* Render strokes */}
      {/* 1️⃣ FILL LAYER – vẽ nền fill (shape hoặc vùng kín) trước */}
      {strokes &&
        strokes.map((s) => {
          if (!s) return null;

          // FILL cho SHAPE (rect, circle, triangle, polygon, ...)
          if (
            s.shape &&
            s.fill &&
            !["line", "arrow"].includes(s.tool) &&
            [
              "square",
              "rect",
              "circle",
              "triangle",
              "oval",
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
            } else if (s.tool === "polygon" || s.tool === "star") {
              const pts = s.shape.points || [];
              if (pts.length > 0) {
                path.moveTo(pts[0]?.x ?? 0, pts[0]?.y ?? 0);
                for (let i = 1; i < pts.length; i++)
                  path.lineTo(pts[i]?.x ?? 0, pts[i]?.y ?? 0);
                path.close();
              }
            }

            return (
              <Path
                key={`${s.id}-fill`}
                path={path}
                color={s.fillColor || "#ffffff"}
                style="fill"
              />
            );
          }

          // FILL cho vùng kín (freehand)
          if (s.fill && s.points?.length > 0) {
            const path = makePathFromPoints(s.points);
            try {
              path.close();
            } catch {}
            return (
              <Path
                key={`${s.id}-fill`}
                path={path}
                color={s.fillColor || "#ffffff"}
                style="fill"
              />
            );
          }

          return null;
        })}

      {/* 2️⃣ STROKE + TEXT + EFFECT LAYER */}
      <Group layer>
        {strokes &&
          strokes.map((s) => {
            if (!s) return null;

            // TEXT / STICKY / COMMENT
            if (["text", "sticky", "comment"].includes(s.tool)) {
              const elements = [];

              const fontSize = s.fontSize || 18;
              let font = getClosestFont(fontSize);
              if (!font) font = makeFallbackFont(fontSize);
              const hasFont = !!font;

              const textWidth =
                approxTextWidth(s.text || "", fontSize) + (s.padding || 0) * 2;
              const textHeight = fontSize + (s.padding || 0) * 2;

              if (s.tool === "sticky" || s.tool === "comment") {
                elements.push(
                  <Rect
                    key={`${s.id}-bg`}
                    x={s.x - (s.padding || 0)}
                    y={s.y - fontSize - (s.padding || 0)}
                    width={textWidth}
                    height={textHeight}
                    color={s.backgroundColor || "#FFEB3B"}
                    rx={s.tool === "sticky" ? 4 : 8}
                    ry={s.tool === "sticky" ? 4 : 8}
                  />
                );
              }

              if (hasFont) {
                elements.push(
                  <SkiaText
                    key={s.id}
                    x={s.x || 0}
                    y={s.y || 0}
                    text={s.text || ""}
                    font={font}
                    color={s.color || "#000000"}
                  />
                );
              }

              if (selectedId === s.id) {
                elements.push(
                  <Rect
                    key={`${s.id}-border`}
                    x={s.x - (s.padding || 0)}
                    y={s.y - fontSize - (s.padding || 0)}
                    width={textWidth}
                    height={textHeight}
                    color="transparent"
                    strokeWidth={1}
                    strokeColor="#2563EB"
                    style="stroke"
                    strokeJoin="round"
                    strokeCap="round"
                    dashEffect={[6, 4]}
                  />
                );
              }

              return elements;
            }

            // SHAPES (rect/circle/arrow/...)
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

            // FREEHAND
            if (s.points && s.points.length > 0) {
              const smoothed = smoothPoints(
                s.points,
                s.stabilization ?? stabilization
              );
              const path = makePathFromPoints(smoothed);

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

              let baseW = s.width;
              if (!baseW) {
                if (s.tool === "pencil") baseW = pencilWidth || 1;
                else if (s.tool === "brush") baseW = brushWidth || 1;
                else if (s.tool === "calligraphy")
                  baseW = calligraphyWidth || 1;
                else if (s.tool === "eraser") baseW = eraserSize || 1;
                else baseW = strokeWidth || 1;
              }
              const effWidth = computeEffectiveWidth(
                baseW,
                s.thickness ?? thickness,
                s.pressure ?? pressure
              );

              return (
                <Path
                  key={s.id}
                  path={path}
                  color={strokeColor}
                  strokeWidth={effWidth}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode={
                    s.tool === "eraser"
                      ? "dstOut"
                      : s.tool === "highlighter"
                      ? "multiply"
                      : "srcOver"
                  }
                />
              );
            }

            return null;
          })}

        {/* --- Preview hiện tại --- */}
        {currentPoints?.length > 0 &&
          tool !== "eraser" &&
          eraserMode !== "object" && (
            <Path
              key="current"
              path={makePathFromPoints(
                smoothPoints(currentPoints, dynamicStab)
              )}
              color={tool === "pencil" ? applyPencilAlpha(color) : color}
              strokeWidth={computeEffectiveWidth(
                tool === "pen"
                  ? strokeWidth || 1
                  : tool === "pencil"
                  ? pencilWidth || 1
                  : tool === "highlighter"
                  ? (strokeWidth || 1) * 2
                  : strokeWidth || 1,
                dynamicThickness,
                dynamicPressure
              )}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
            />
          )}

        {/* --- Soft preview cho brush / calligraphy --- */}
        {currentPoints?.length > 0 &&
          (tool === "brush" || tool === "calligraphy") && (
            <Path
              key="current-soft"
              path={makePathFromPoints(
                smoothPoints(currentPoints, stabilization)
              )}
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
              strokeWidth={computeEffectiveWidth(
                tool === "brush" ? brushWidth || 1 : calligraphyWidth || 1,
                thickness,
                pressure
              )}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
            />
          )}

        {/* --- Eraser preview --- */}
        {tool === "eraser" && currentPoints?.length > 0 && (
          <Path
            key="eraser-preview"
            path={makePathFromPoints(currentPoints, false)}
            color={PAGE_BGCOLOR}
            strokeWidth={eraserSize || 1}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="dstOut"
          />
        )}
      </Group>

      {/* --- Object eraser (lasso) preview --- */}
      {tool === "eraser" &&
        eraserMode === "object" &&
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

      {tool === "eraser" &&
        eraserMode === "pixel" &&
        currentPoints?.length > 0 && (
          <Group key="pixel-eraser-preview">
            <Circle
              cx={currentPoints[currentPoints.length - 1]?.x ?? 0}
              cy={currentPoints[currentPoints.length - 1]?.y ?? 0}
              r={eraserSize / 2}
              color="rgba(255,255,255,0.8)" // trong suốt nhẹ, nền trắng
            />
            <Circle
              cx={currentPoints[currentPoints.length - 1]?.x ?? 0}
              cy={currentPoints[currentPoints.length - 1]?.y ?? 0}
              r={eraserSize / 2}
              color="rgba(0,0,0,0.25)" // viền xám nhạt
              style="stroke"
              strokeWidth={1.2}
            />
          </Group>
        )}
    </Canvas>
  );
});

export default CanvasRenderer;
