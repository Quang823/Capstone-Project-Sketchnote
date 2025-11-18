import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useRef,
  memo,
} from "react";
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
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import CanvasImage from "../image/CanvasImage";
import PaperGuides from "./PaperGuidesNew";
import { applyPencilAlpha, makePathFromPoints } from "./utils";
import {
  calculateViewport,
  estimateRenderingComplexity,
  shouldUseVirtualRendering,
  getVisibleStrokes,
} from "./virtualRenderingUtils";

const DESK_BGCOLOR = "#e9ecef";
const PAGE_BGCOLOR = "#ffffff";

function smoothPoints(points = [], stabilization = 0) {
  if (!Array.isArray(points) || points.length === 0 || stabilization <= 0) {
    return points;
  }
  const out = [];
  let prev = { x: points[0].x, y: points[0].y };
  out.push({ ...prev });
  const alpha = 1 - Math.max(0, Math.min(1, stabilization));
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
function computeEffectiveWidth(baseWidth = 1, thickness = 1, pressure = 0.5) {
  const safeThickness = Math.max(0.1, thickness);
  const pressureFactor = 1 + (pressure - 0.5) * 1.2;
  const pf = Math.max(0.35, Math.min(1.6, pressureFactor));
  return baseWidth * safeThickness * pf;
}

const makeRGBA = (input, alpha = 1) => {
  try {
    if (!input) return `rgba(0,0,0,${alpha})`;
    if (input.startsWith("rgba")) {
      return input.replace(
        /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/,
        (_, r, g, b) => `rgba(${r},${g},${b},${alpha})`
      );
    }
    if (input.startsWith("#")) {
      const hex = input.replace("#", "");
      const len = hex.length;
      let r, g, b;
      if (len === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (len === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else {
        throw new Error("Invalid hex length");
      }
      if (isNaN(r) || isNaN(g) || isNaN(b))
        throw new Error("Invalid hex values");
      return `rgba(${r},${g},${b},${alpha})`;
    }
    console.warn("Invalid color format:", input, "Falling back to black");
    return `rgba(0,0,0,${alpha})`;
  } catch (e) {
    console.warn(
      "makeRGBA error:",
      e.message,
      "Input:",
      input,
      "Fallback to black"
    );
    return `rgba(0,0,0,${alpha})`;
  }
};

const CanvasRenderer = forwardRef(function CanvasRenderer(
  {
    layers = [],
    activeLayerId,
    visualOffsets = {},
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
    selectedId,
    toolConfigs = {},
    pressure = 0.5,
    thickness = 1,
    stabilization = 0,
    realtimeText,
    onSelectImage,
    imageRefs,
    hasRuler = false,
    backgroundColor = "#FFFFFF", // 👈 Add backgroundColor prop
    pageTemplate = "blank", // 👈 Add template prop
    backgroundImageUrl = null, // 👈 Add backgroundImageUrl prop
    pageWidth = null, // 👈 Page width from noteConfig
    pageHeight = null, // 👈 Page height from noteConfig
    loadedFonts, // 👈 Receive preloaded fonts
    getNearestFont, // 👈 Receive font helper
    // ⬇️ Virtual rendering inputs
    zoomState,
    zoomSnapshot,
    scrollOffsetY = 0,
  },
  ref
) {
  // Cache Skia.Path objects per stroke to avoid recomputing paths on each render
  const pathCacheRef = useRef(new Map());
  // Clear cache when switching active layer to avoid stale memory growth
  useEffect(() => {
    try {
      pathCacheRef.current.clear();
    } catch {}
  }, [activeLayerId]);
  const canvasRef = useCanvasRef();

  useEffect(() => {
    return () => {
      try {
        pathCacheRef.current.clear();
      } catch {}
    };
  }, []);

  // Safe image loading with error handling
  let backgroundImage = null;
  try {
    // Only attempt to load if URL is valid
    if (
      backgroundImageUrl &&
      typeof backgroundImageUrl === "string" &&
      backgroundImageUrl.trim()
    ) {
      backgroundImage = useImage(backgroundImageUrl);
    }
  } catch (err) {
    console.warn("[CanvasRenderer] Failed to load background image:", err);
    backgroundImage = null;
  }

  // ✨ FIX: Add cleanup effect for Skia Image object
  useEffect(() => {
    return () => {
      if (backgroundImage) {
        // Dispose of the native Skia object to free up GPU memory
        backgroundImage.dispose();
      }
    };
  }, [backgroundImage]);

  // Use provided dimensions or fallback to page dimensions
  const safePage = {
    x: page?.x ?? 0,
    y: page?.y ?? 0,
    w: pageWidth ?? page?.w ?? 0,
    h: pageHeight ?? page?.h ?? 0,
  };

  const safeCanvasHeight = canvasHeight ?? 0;

  useImperativeHandle(ref, () => ({
    getSnapshot: () => canvasRef.current?.makeImageSnapshot(),
  }));

  const approxTextWidth = (text, fontSize) => {
    if (!text) return 0;
    return text.length * (fontSize || 18) * 0.6;
  };

  const lastPt = Array.isArray(currentPoints)
    ? currentPoints[currentPoints.length - 1]
    : null;
  const dynamicPressure = lastPt?.pressure ?? pressure;
  const dynamicThickness = lastPt?.thickness ?? thickness;
  const dynamicStab = lastPt?.stabilization ?? stabilization;
  const visibleLayers = Array.isArray(layers)
    ? layers.filter((l) => l.visible)
    : [];

  // ⬇️ Tính viewport theo zoom/scroll để lọc strokes ngoài màn hình
  const screen = Dimensions.get("window");
  const viewport = useMemo(() => {
    try {
      return calculateViewport(
        safePage,
        {
          scale: zoomSnapshot?.scale ?? 1,
          translateX: zoomSnapshot?.translateX ?? 0,
          translateY: zoomSnapshot?.translateY ?? 0,
        },
        scrollOffsetY,
        { width: screen.width, height: screen.height }
      );
    } catch (e) {
      return {
        x: safePage.x,
        y: safePage.y,
        width: safePage.w,
        height: safePage.h,
      };
    }
  }, [
    safePage.x,
    safePage.y,
    safePage.w,
    safePage.h,
    zoomSnapshot?.scale,
    zoomSnapshot?.translateX,
    zoomSnapshot?.translateY,
    scrollOffsetY,
    screen.width,
    screen.height,
  ]);

  // read tool config with sensible defaults
  const brushSoftness =
    typeof toolConfigs.brushSoftness === "number"
      ? toolConfigs.brushSoftness
      : 0.28;
  const calligraphyAngle =
    typeof toolConfigs.calligraphyAngle === "number"
      ? toolConfigs.calligraphyAngle
      : 0.6;
  const airbrushSpread =
    typeof toolConfigs.airbrushSpread === "number"
      ? toolConfigs.airbrushSpread
      : 1.6;
  const airbrushDensity =
    typeof toolConfigs.airbrushDensity === "number"
      ? toolConfigs.airbrushDensity
      : 0.55;

  // deterministic pseudo-random for spray dots
  function pseudoRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function makeSprayDots(
    smoothedPoints = [],
    density = 0.5,
    spread = 1.0,
    baseSize = 6
  ) {
    const dots = [];
    if (!Array.isArray(smoothedPoints) || smoothedPoints.length === 0)
      return dots;
    const totalRaw = Math.max(
      6,
      Math.round(smoothedPoints.length * (density * 6))
    );
    const total = Math.min(140, totalRaw);
    for (let i = 0; i < total; i++) {
      const t = (i / (total - 1)) * (smoothedPoints.length - 1);
      const idx = Math.floor(t);
      const frac = t - idx;
      const p1 = smoothedPoints[idx];
      const p2 = smoothedPoints[Math.min(idx + 1, smoothedPoints.length - 1)];
      const x = p1.x + (p2.x - p1.x) * frac;
      const y = p1.y + (p2.y - p1.y) * frac;
      const seed = i * 31 + Math.floor(x) * 13 + Math.floor(y) * 7;
      const rx = (pseudoRandom(seed) - 0.5) * baseSize * spread;
      const ry = (pseudoRandom(seed + 1) - 0.5) * baseSize * spread;
      const r = Math.max(
        1,
        Math.round((pseudoRandom(seed + 2) * baseSize) / 2)
      );
      const alpha = Math.max(
        0.06,
        Math.min(0.5, pseudoRandom(seed + 3) * 0.45)
      );
      dots.push({ x: x + rx, y: y + ry, r, a: alpha });
    }
    return dots;
  }

  // Aggregate many dots into just 1-2 Paths for performance
  function makeDotPaths(dots = [], strokeColor = "#000") {
    if (!dots?.length) return null;
    const low = dots.filter((d) => d.a < 0.2);
    const high = dots.filter((d) => d.a >= 0.2);
    const nodes = [];
    if (low.length) {
      const p = Skia.Path.Make();
      for (const d of low) p.addCircle(d.x, d.y, d.r);
      nodes.push(
        <Path
          key={`air-dots-low`}
          path={p}
          color={makeRGBA(strokeColor, 0.14)}
          style="fill"
          blendMode="srcOver"
        />
      );
    }
    if (high.length) {
      const p = Skia.Path.Make();
      for (const d of high) p.addCircle(d.x, d.y, d.r);
      nodes.push(
        <Path
          key={`air-dots-high`}
          path={p}
          color={makeRGBA(strokeColor, 0.28)}
          style="fill"
          blendMode="srcOver"
        />
      );
    }
    return <Group key="air-dots-group">{nodes}</Group>;
  }

  const renderStroke = (s, index) => {
    if (!s) return null;

    // 📊 table
    if (s.tool === "table") {
      const CanvasTable = require("../table/CanvasTable").default;
      return (
        <CanvasTable
          key={s.id}
          ref={(ref) => {
            if (imageRefs && typeof imageRefs === "object") {
              if (ref) imageRefs.current.set(s.id, ref);
              else imageRefs.current.delete(s.id);
            }
          }}
          stroke={s}
          selectedId={selectedId}
        />
      );
    }

    // image / sticker
    if (
      (s.tool === "image" || s.tool === "sticker") &&
      (s.uri || s.imageUri || s.image)
    ) {
      return (
        <CanvasImage
          key={s.id}
          ref={(ref) => {
            if (imageRefs && typeof imageRefs === "object") {
              if (ref) imageRefs.current.set(s.id, ref);
              else imageRefs.current.delete(s.id);
            }
          }}
          stroke={s}
          selectedId={selectedId}
          onSelectImage={onSelectImage}
        />
      );
    }

    // text / sticky / comment / emoji (reuse logic)
    if (["text", "sticky", "comment", "emoji"].includes(s.tool)) {
      const elements = [];
      const fontSize = s.fontSize || 18;
      const { font, nearest } = getNearestFont(
        loadedFonts,
        s.fontFamily,
        s.bold,
        s.italic,
        fontSize
      );
      const fallback = getNearestFont(loadedFonts, "Roboto", false, false, 18);
      const safeFont = font || fallback.font;
      const hasFont = !!safeFont;
      const scaleFactor = nearest ? fontSize / nearest : 1;
      const textWidth =
        approxTextWidth(s.text || "", fontSize) + (s.padding || 0) * 2;
      const textHeight = fontSize + (s.padding || 0) * 2;

      if (s.tool === "sticky" || s.tool === "comment") {
        const pad = s.padding || 6;
        const fs = s.fontSize || (s.tool === "comment" ? 14 : 16);
        const text = typeof s.text === "string" ? s.text : "";
        const tw = Math.max(40, approxTextWidth(text, fs) + pad * 2);
        const th = Math.max(28, fs + pad * 2);
        const x = s.x ?? 0;
        const y = s.y ?? 0;
        const left = x - pad;
        const top = y - fs - pad;

        if (s.tool === "sticky") {
          const foldSize = 10;
          const bgColor = "#FFF8B3";
          elements.push(
            <Rect
              key={`${s.id}-sticky-bg`}
              x={left}
              y={top}
              width={tw}
              height={th}
              color={bgColor}
              rx={6}
              ry={6}
            />
          );
          const fold = Skia.Path.Make();
          fold.moveTo(left + tw - foldSize, top);
          fold.lineTo(left + tw, top);
          fold.lineTo(left + tw, top + foldSize);
          fold.close();
          elements.push(
            <Path key={`${s.id}-sticky-fold`} path={fold} color="#FFED77" />
          );
        } else {
          const tailH = 8;
          const bubble = Skia.Path.Make();
          bubble.moveTo(left + 10, top);
          bubble.lineTo(left + tw - 10, top);
          bubble.quadTo(left + tw, top, left + tw, top + 10);
          bubble.lineTo(left + tw, top + th - 10);
          bubble.quadTo(left + tw, top + th, left + tw - 10, top + th);
          bubble.lineTo(left + 18, top + th);
          bubble.quadTo(left + 10, top + th + tailH, left + 8, top + th);
          bubble.quadTo(left, top + th, left, top + th - 10);
          bubble.lineTo(left, top + 10);
          bubble.quadTo(left, top, left + 10, top);
          bubble.close();
          elements.push(
            <Path key={`${s.id}-comment-bg`} path={bubble} color="#E3F2FD" />
          );
          elements.push(
            <Path
              key={`${s.id}-comment-border`}
              path={bubble}
              color="rgba(0,0,0,0.18)"
              style="stroke"
              strokeWidth={1.2}
            />
          );
        }
      }

      if (s.tool === "emoji") {
        const emojiFont = getNearestFont(
          loadedFonts,
          "NotoColorEmoji",
          false,
          false,
          s.fontSize || 36
        ).font;
        if (emojiFont) {
          elements.push(
            <SkiaText
              key={`${s.id}-emoji`}
              x={s.x || 0}
              y={s.y || 0}
              text={s.text || ""}
              font={emojiFont}
              color={s.color || "#000"}
            />
          );
        }
        return <Group key={`${s.id}-emoji-group`}>{elements}</Group>;
      }

      if (hasFont && safeFont) {
        elements.push(
          <SkiaText
            key={`${s.id}-text`}
            x={(s.x || 0) / scaleFactor}
            y={(s.y || 0) / scaleFactor}
            text={typeof s.text === "string" ? s.text : ""}
            font={safeFont}
            color={s.color || "#000"}
            transform={[{ scale: scaleFactor }]}
          />
        );
      }

      if (s.underline) {
        elements.push(
          <Rect
            key={`${s.id}-underline`}
            x={s.x || 0}
            y={(s.y || 0) + fontSize * 0.15}
            width={textWidth * 0.95}
            height={1.5}
            color={s.color || "#000"}
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
            dashEffect={[6, 4]}
          />
        );
      }

      return <Group key={`${s.id}-text-group`}>{elements}</Group>;
    }

    // shapes (reuse)
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
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0, x3 = 0, y3 = 0 } = s.shape;
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
          key={`${s.id}-main`}
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
          <Group key={`${s.id}-arrow-group`}>
            {main}
            <Path
              key={`${s.id}-arrow-head`}
              path={head}
              color={s.color || "#000000"}
              strokeWidth={s.width || 1}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
            />
          </Group>
        );
      }
      return main;
    }

    // strokes (pen-like)
    if (s.points && s.points.length > 0) {
      // Special-case: single-point stroke should render as a dot
      if (s.points.length === 1) {
        const p0 = s.points[0];
        let strokeColor = s.color || "#000000";
        let baseOpacity = 1;

        if (s.tool === "pencil") {
          strokeColor = applyPencilAlpha(strokeColor);
        } else if (s.tool === "brush") {
          baseOpacity = 0.95;
        } else if (s.tool === "calligraphy") {
          baseOpacity = 1.0;
        } else if (s.tool === "highlighter") {
          baseOpacity = 0.32;
        } else if (s.tool === "marker") {
          baseOpacity = 1.0;
        } else if (s.tool === "airbrush") {
          baseOpacity = 0.18;
        } else if (s.tool === "crayon") {
          baseOpacity = 0.68;
        } else if (s.tool === "eraser") {
          // Render eraser dot via dstOut
          const baseW = s.width || eraserSize || 8;
          const effW = computeEffectiveWidth(
            baseW,
            s.thickness ?? thickness,
            s.pressure ?? pressure
          );
          return (
            <Circle
              key={`${s.id}-dot`}
              cx={p0.x || 0}
              cy={p0.y || 0}
              r={Math.max(1, effW / 2)}
              color={PAGE_BGCOLOR}
              blendMode="dstOut"
            />
          );
        }

        let baseW = s.width;
        if (!baseW) {
          if (s.tool === "pencil") baseW = pencilWidth || 1;
          else if (s.tool === "brush") baseW = brushWidth || 1;
          else if (s.tool === "calligraphy") baseW = calligraphyWidth || 1;
          else if (s.tool === "eraser") baseW = eraserSize || 1;
          else baseW = strokeWidth || 1;
        }
        const effW = computeEffectiveWidth(
          baseW,
          s.thickness ?? thickness,
          s.pressure ?? pressure
        );
        return (
          <Circle
            key={`${s.id}-dot`}
            cx={p0.x || 0}
            cy={p0.y || 0}
            r={Math.max(1, effW / 2)}
            color={makeRGBA(strokeColor, Math.min(1, baseOpacity))}
          />
        );
      }

      // Do NOT smooth stored strokes; smoothing can bridge small gaps from pixel eraser splits
      // Cache path by a lightweight key derived from stroke id, point count, width, and tool
      const first = s.points?.[0];
      const last = s.points?.[s.points.length - 1];
      const ax = Math.round(((first?.x || 0) + (last?.x || 0)) * 10) / 10;
      const ay = Math.round(((first?.y || 0) + (last?.y || 0)) * 10) / 10;
      const cacheKey = `${s.id}:${s.points?.length || 0}:${
        s.width || strokeWidth || 0
      }:${s.tool || "pen"}:${ax}:${ay}`;
      let path = pathCacheRef.current.get(cacheKey);
      if (!path) {
        path = makePathFromPoints(s.points);
        pathCacheRef.current.set(cacheKey, path);
      }
      let strokeColor = s.color || "#000000";
      let blendMode = "srcOver";
      let baseOpacity = 1;

      if (s.tool === "pencil") {
        strokeColor = applyPencilAlpha(strokeColor);
      } else if (s.tool === "brush") {
        baseOpacity = 0.95; // denser core
        blendMode = "srcOver";
      } else if (s.tool === "calligraphy") {
        baseOpacity = 1.0;
        blendMode = "srcOver";
      } else if (s.tool === "highlighter") {
        baseOpacity = 0.32;
        blendMode = "multiply";
      } else if (s.tool === "marker") {
        baseOpacity = 1.0;
        blendMode = "srcOver";
      } else if (s.tool === "airbrush") {
        baseOpacity = 0.18;
        blendMode = "srcOver";
      } else if (s.tool === "crayon") {
        baseOpacity = 0.68;
        blendMode = "overlay";
      } else if (s.tool === "eraser") {
        blendMode = "dstOut";
        strokeColor = PAGE_BGCOLOR;
      }

      let baseW = s.width;
      if (!baseW) {
        if (s.tool === "pencil") baseW = pencilWidth || 1;
        else if (s.tool === "brush") baseW = brushWidth || 1;
        else if (s.tool === "calligraphy") baseW = calligraphyWidth || 1;
        else if (s.tool === "eraser") baseW = eraserSize || 1;
        else baseW = strokeWidth || 1;
      }

      const effWidth = computeEffectiveWidth(
        baseW,
        s.thickness ?? thickness,
        s.pressure ?? pressure
      );

      // === BRUSH (distinct) ===
      if (s.tool === "brush") {
        const core = (
          <Path
            key={`${s.id}-core`}
            path={path}
            color={makeRGBA(strokeColor, Math.min(1, baseOpacity))}
            strokeWidth={effWidth * 0.9}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="srcOver"
          />
        );

        const glaze = (
          <Path
            key={`${s.id}-glaze`}
            path={path}
            color={makeRGBA(strokeColor, Math.max(0.12, brushSoftness))}
            strokeWidth={effWidth * (1.8 + brushSoftness)}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="screen"
          />
        );

        const highlight = (
          <Path
            key={`${s.id}-highlight`}
            path={path}
            color={makeRGBA("#ffffff", 0.06)}
            strokeWidth={Math.max(1, effWidth * 0.25)}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="overlay"
          />
        );

        return (
          <Group key={`${s.id}-brush-group`}>
            {glaze}
            {core}
            {highlight}
          </Group>
        );
      }

      // === AIRBRUSH (distinct) ===
      if (s.tool === "airbrush") {
        const outer = (
          <Path
            key={`${s.id}-air-outer`}
            path={path}
            color={makeRGBA(strokeColor, 0.12)}
            strokeWidth={effWidth * airbrushSpread * 2.2}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="srcOver"
          />
        );

        const inner = (
          <Path
            key={`${s.id}-air-inner`}
            path={path}
            color={makeRGBA(strokeColor, 0.28)}
            strokeWidth={effWidth * 0.9}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
            blendMode="srcOver"
          />
        );

        // build limited dots for finalized stroke (lower density than preview)
        const dots = makeSprayDots(
          s.points,
          Math.max(0.1, (airbrushDensity ?? 0.55) * 0.6),
          airbrushSpread,
          Math.max(3, effWidth * 0.8)
        );
        const dotGroup = makeDotPaths(dots, strokeColor);
        return (
          <Group key={`${s.id}-airbrush-group`}>
            {outer}
            {inner}
            {dotGroup}
          </Group>
        );
      }

      // === CALLIGRAPHY (distinct) ===
      if (s.tool === "calligraphy") {
        const w = effWidth;
        const dx =
          (smoothed[smoothed.length - 1]?.x || 0) - (smoothed[0]?.x || 0);
        const dy =
          (smoothed[smoothed.length - 1]?.y || 0) - (smoothed[0]?.y || 0);
        const dir = Math.sqrt(dx * dx + dy * dy) || 1;
        const tilt = Math.max(
          0.3,
          Math.min(1.6, 1 + (dy / dir - 0.5) * calligraphyAngle)
        );

        const main = (
          <Path
            key={`${s.id}-call-main`}
            path={path}
            color={makeRGBA(strokeColor, 1.0)}
            strokeWidth={w * tilt}
            style="stroke"
            strokeCap="butt"
            strokeJoin="miter"
            blendMode="srcOver"
          />
        );

        const soft = (
          <Path
            key={`${s.id}-call-soft`}
            path={path}
            color={makeRGBA(strokeColor, 0.22)}
            strokeWidth={w * Math.max(1.2, tilt * 1.4)}
            style="stroke"
            strokeCap="butt"
            strokeJoin="miter"
            blendMode="overlay"
            dashEffect={[3, 5]}
          />
        );

        return (
          <Group key={`${s.id}-calligraphy-group`}>
            {soft}
            {main}
          </Group>
        );
      }

      // default stroke
      const cap =
        s.tool === "highlighter" || s.tool === "marker" ? "butt" : "round";
      const join =
        s.tool === "highlighter" || s.tool === "marker" ? "miter" : "round";
      return (
        <Path
          key={s.id}
          path={path}
          color={makeRGBA(strokeColor, baseOpacity)}
          strokeWidth={effWidth}
          style="stroke"
          strokeCap={cap}
          strokeJoin={join}
          blendMode={blendMode}
        />
      );
    }

    return null;
  };

  return (
    <Canvas
      ref={canvasRef}
      style={{
        width: safePage.w + safePage.x * 2,
        height: safeCanvasHeight,
        alignSelf: "center",
      }}
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
          {backgroundImage ? (
            <SkiaImage
              image={backgroundImage}
              x={safePage.x}
              y={safePage.y}
              width={safePage.w}
              height={safePage.h}
              fit="cover" // Use "cover" to fill the page, or "contain" to show full image
            />
          ) : (
            <Rect
              x={safePage.x}
              y={safePage.y}
              width={safePage.w}
              height={safePage.h}
              color={backgroundColor}
            />
          )}
          <Rect
            x={safePage.x}
            y={safePage.y}
            width={safePage.w}
            height={safePage.h}
            color="transparent"
            strokeWidth={1}
            strokeColor="#ced4da"
          />
        </>
      )}

      {/* Paper guides */}
      {safePage.w > 0 && safePage.h > 0 && (
        <PaperGuides
          paperStyle={paperStyle}
          pageTemplate={pageTemplate}
          page={safePage}
        />
      )}

      {/* Per-layer compositing groups so eraser affects only that layer */}
      {visibleLayers.map((layer) => (
        <Group key={`layer-${layer.id}`} layer>
          {/* Combined Fill and Stroke Rendering with virtual filtering */}
          {(() => {
            const strokes = Array.isArray(layer.strokes) ? layer.strokes : [];
            const strokeCount = strokes.length;
            const complexity = estimateRenderingComplexity(strokes);
            const useVR = shouldUseVirtualRendering(strokeCount, complexity);
            const strokesToRender = useVR
              ? getVisibleStrokes(strokes, viewport, { padding: 120 })
              : strokes;

            return strokesToRender.map((s, index) => {
              if (!s) return null;

              // --- Part 1: Get Fill Node ---
              let fillNode = null;
              if (
                s.shape &&
                (s.fill || (typeof s.fillColor === "string" && s.fillColor)) &&
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
                fillNode = (
                  <Path
                    key={`${s.id}-fill`}
                    path={path}
                    color={makeRGBA(s.fillColor || "#ffffff", 1)}
                    style="fill"
                    blendMode="srcOver"
                    opacity={typeof s.opacity === "number" ? s.opacity : 1}
                  />
                );
              } else if (
                (s.fill || (typeof s.fillColor === "string" && s.fillColor)) &&
                s.points?.length > 0
              ) {
                const path = makePathFromPoints(s.points);
                try {
                  path.close();
                } catch {}
                fillNode = (
                  <Path
                    key={`${layer.id}-${s.id}-fill`}
                    path={path}
                    color={makeRGBA(s.fillColor || "#ffffff", 1)}
                    style="fill"
                    blendMode="srcOver"
                    opacity={typeof s.opacity === "number" ? s.opacity : 1}
                  />
                );
              }

              // --- Part 2: Get Stroke Node ---
              const strokeNode =
                realtimeText?.id &&
                s.id === realtimeText.id &&
                ["sticky", "comment", "text"].includes(s.tool)
                  ? null
                  : renderStroke(s, index);

              // --- Part 3: Combine and Apply Transform ---
              if (!fillNode && !strokeNode) {
                return null;
              }

              const vo = visualOffsets?.[s.id];
              const dx = (vo?.dx ?? s?.tempOffset?.dx) || 0;
              const dy = (vo?.dy ?? s?.tempOffset?.dy) || 0;

              return (
                <Group
                  key={s.id}
                  transform={
                    dx || dy
                      ? [{ translateX: dx }, { translateY: dy }]
                      : undefined
                  }
                >
                  {fillNode}
                  {strokeNode}
                </Group>
              );
            });
          })()}

          {/* Realtime pixel eraser preview ONLY for active layer */}
          {tool === "eraser" &&
            eraserMode === "pixel" &&
            activeLayerId === layer.id &&
            Array.isArray(currentPoints) &&
            currentPoints.length > 1 &&
            (() => {
              // chuyển currentPoints (global) -> layer-local nếu layer có offset
              const vo = (visualOffsets && visualOffsets[layer.id]) || {};
              const dx = (vo?.dx ?? layer?.tempOffset?.dx) || 0;
              const dy = (vo?.dy ?? layer?.tempOffset?.dy) || 0;

              // tạo bản localPoints chỉ dùng x/y cho path (giữ pressure nếu cần)
              const localPoints = currentPoints.map((p) => ({
                x: (p.x ?? 0) - dx,
                y: (p.y ?? 0) - dy,
                pressure: p.pressure,
                thickness: p.thickness,
              }));

              // path từ localPoints (không smoothing để preview chính xác)
              const previewPath = makePathFromPoints(localPoints, false);

              return (
                <Path
                  key={`eraser-preview-${layer.id}`}
                  path={previewPath}
                  color={PAGE_BGCOLOR} // color ignored by dstOut, still set for readability
                  strokeWidth={Math.max(1, eraserSize || 8)}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="dstOut"
                />
              );
            })()}
          {/* Optionally, per-layer extras could go here */}
        </Group>
      ))}

      {/* Realtime text preview (reuse original logic) */}
      {realtimeText &&
        typeof realtimeText === "object" &&
        (() => {
          const {
            x = 0,
            y = 0,
            text = "",
            fontFamily,
            bold,
            italic,
            underline,
            color = "#000",
            fontSize = 18,
            tool = "text",
            padding = 6,
          } = realtimeText;
          const { font, nearest } = getNearestFont(
            loadedFonts,
            fontFamily,
            bold,
            italic,
            fontSize
          );
          const safeFont =
            font ||
            getNearestFont(loadedFonts, "Roboto", false, false, 18).font;
          const scaleFactor = nearest ? fontSize / nearest : 1;
          const textWidth = Math.max(
            40,
            (text.length || 1) * (fontSize * 0.6) + padding * 2
          );
          const textHeight = Math.max(28, fontSize + padding * 2);
          const left = x - padding;
          const top = y - fontSize - padding;
          const elements = [];

          if (tool === "sticky") {
            const foldSize = 10;
            const bgColor = "#FFF8B3";
            elements.push(
              <Rect
                key="rt-sticky-bg"
                x={left}
                y={top}
                width={textWidth}
                height={textHeight}
                color={bgColor}
                rx={6}
                ry={6}
              />
            );
            const fold = Skia.Path.Make();
            fold.moveTo(left + textWidth - foldSize, top);
            fold.lineTo(left + textWidth, top);
            fold.lineTo(left + textWidth, top + foldSize);
            fold.close();
            elements.push(<Path key="rt-fold" path={fold} color="#FFED77" />);
          }

          if (tool === "comment") {
            const tailH = 8;
            const bubble = Skia.Path.Make();
            bubble.moveTo(left + 10, top);
            bubble.lineTo(left + textWidth - 10, top);
            bubble.quadTo(left + textWidth, top, left + textWidth, top + 10);
            bubble.lineTo(left + textWidth, top + textHeight - 10);
            bubble.quadTo(
              left + textWidth,
              top + textHeight,
              left + textWidth - 10,
              top + textHeight
            );
            bubble.lineTo(left + 18, top + textHeight);
            bubble.quadTo(
              left + 10,
              top + textHeight + tailH,
              left + 8,
              top + textHeight
            );
            bubble.quadTo(left, top + textHeight, left, top + textHeight - 10);
            bubble.lineTo(left, top + 10);
            bubble.quadTo(left, top, left + 10, top);
            bubble.close();
            elements.push(
              <Path key="rt-comment-bg" path={bubble} color="#E3F2FD" />
            );
            elements.push(
              <Path
                key="rt-comment-border"
                path={bubble}
                color="rgba(0,0,0,0.15)"
                style="stroke"
                strokeWidth={1.2}
              />
            );
          }

          if (safeFont) {
            elements.push(
              <SkiaText
                key="rt-text"
                x={x / scaleFactor}
                y={y / scaleFactor}
                text={typeof text === "string" ? text : ""}
                font={safeFont}
                color={makeRGBA(color, 1)}
                transform={[{ scale: scaleFactor }]}
              />
            );
          }

          if (underline) {
            elements.push(
              <Rect
                key="rt-underline"
                x={x}
                y={y + fontSize * 0.15}
                width={textWidth * 0.95}
                height={1.5}
                color={makeRGBA(color, 1)}
              />
            );
          }

          return <Group key="rt-text-preview">{elements}</Group>;
        })()}

      {/* lasso, previews, eraser previews etc. reuse original logic (kept) */}
      {tool === "lasso" &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 1 &&
        (() => {
          const pts = currentPoints;
          const dashLength = 6;
          const gapLength = 4;
          const paths = [];

          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segLen = Math.sqrt(dx * dx + dy * dy);
            let offset = 0;
            while (offset < segLen) {
              const start = offset;
              const end = Math.min(offset + dashLength, segLen);
              const t1 = start / segLen;
              const t2 = end / segLen;
              const x1 = p1.x + dx * t1;
              const y1 = p1.y + dy * t1;
              const x2 = p1.x + dx * t2;
              const y2 = p1.y + dy * t2;

              const path = Skia.Path.Make();
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
              paths.push(
                <Path
                  key={`lasso-${i}-${offset}`}
                  path={path}
                  color="#00BCD4"
                  strokeWidth={1.4}
                  style="stroke"
                  strokeCap="round"
                />
              );

              offset += dashLength + gapLength;
            }
          }

          const polyPath = Skia.Path.Make();
          if (pts.length > 0) {
            polyPath.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++)
              polyPath.lineTo(pts[i].x, pts[i].y);
            try {
              polyPath.close();
            } catch {}
          }
          paths.push(
            <Path
              key="lasso-fill"
              path={polyPath}
              color="rgba(0,188,212,0.08)"
              style="fill"
            />
          );

          return paths;
        })()}

      {/* Preview drawing logic (kept but adapted for new tools) */}
      {currentPoints?.length > 0 &&
        tool !== "eraser" &&
        eraserMode !== "object" &&
        (() => {
          let previewColor = color;
          let previewBlend = "srcOver";
          let previewOpacity = 1;
          let toolWidth = strokeWidth || 1;

          if (tool === "pencil") {
            previewColor = applyPencilAlpha(color);
            toolWidth = pencilWidth || 1;
          } else if (tool === "brush") {
            previewOpacity = 0.95;
            previewBlend = "srcOver";
            toolWidth = brushWidth || 1;
          } else if (tool === "calligraphy") {
            previewOpacity = 1.0;
            previewBlend = "srcOver";
            toolWidth = calligraphyWidth || 1;
          } else if (tool === "highlighter") {
            previewOpacity = 0.3;
            previewBlend = "multiply";
            toolWidth = (strokeWidth || 1) * 2;
          } else if (tool === "marker") {
            previewOpacity = 0.85;
            previewBlend = "srcOver";
            toolWidth = strokeWidth || 1;
          } else if (tool === "airbrush") {
            previewOpacity = 0.18;
            previewBlend = "srcOver";
            toolWidth = (strokeWidth || 1) * 1.2;
          } else if (tool === "crayon") {
            previewOpacity = 0.75;
            // Use normal compositing while previewing so the stroke is clearly visible
            // on white backgrounds. Final saved strokes still use overlay in renderStroke.
            previewBlend = "srcOver";
            toolWidth = strokeWidth || 1;
          }

          const basePath = makePathFromPoints(
            // Khi có thước, bỏ smoothing để preview bám cạnh thước thẳng tuyệt đối
            hasRuler ? currentPoints : smoothPoints(currentPoints, dynamicStab)
          );
          const effWidth = computeEffectiveWidth(
            toolWidth,
            dynamicThickness,
            dynamicPressure
          );

          if (tool === "brush") {
            return (
              <Group key="current-brush-group">
                <Path
                  key="brush-glaze"
                  path={basePath}
                  color={makeRGBA(previewColor, Math.max(0.12, brushSoftness))}
                  strokeWidth={effWidth * (1.8 + brushSoftness)}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="screen"
                />
                <Path
                  key="brush-core"
                  path={basePath}
                  color={makeRGBA(previewColor, previewOpacity)}
                  strokeWidth={effWidth * 0.9}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="srcOver"
                />
                <Path
                  key="brush-highlight"
                  path={basePath}
                  color={makeRGBA("#ffffff", 0.06)}
                  strokeWidth={Math.max(1, effWidth * 0.25)}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="overlay"
                />
              </Group>
            );
          }

          if (tool === "airbrush") {
            const baseDots = makeSprayDots(
              hasRuler
                ? currentPoints
                : smoothPoints(currentPoints, dynamicStab),
              Math.min(1, airbrushDensity * 1.0),
              airbrushSpread,
              Math.max(4, effWidth)
            );
            const dotGroup = makeDotPaths(baseDots, previewColor);
            return (
              <Group key="current-airbrush-group">
                <Path
                  key="air-outer"
                  path={basePath}
                  color={makeRGBA(previewColor, 0.12)}
                  strokeWidth={effWidth * airbrushSpread * 2.0}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="srcOver"
                />
                <Path
                  key="air-inner"
                  path={basePath}
                  color={makeRGBA(previewColor, 0.28)}
                  strokeWidth={effWidth * 0.95}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode="srcOver"
                />
                {dotGroup}
              </Group>
            );
          }

          if (tool === "calligraphy") {
            return (
              <Group key="current-calligraphy-group">
                <Path
                  key="calligraphy-inner"
                  path={basePath}
                  color={makeRGBA(previewColor, 1.0)}
                  strokeWidth={effWidth}
                  style="stroke"
                  strokeCap="butt"
                  strokeJoin="miter"
                  blendMode="srcOver"
                />
                <Path
                  key="calligraphy-outer"
                  path={basePath}
                  color={makeRGBA(previewColor, 0.22)}
                  strokeWidth={effWidth * 1.4}
                  style="stroke"
                  strokeCap="butt"
                  strokeJoin="miter"
                  blendMode="overlay"
                  dashEffect={[3, 5]}
                />
              </Group>
            );
          }

          const capPrev = ["highlighter", "marker"].includes(tool)
            ? "butt"
            : "round";
          const joinPrev = ["highlighter", "marker"].includes(tool)
            ? "miter"
            : "round";
          return (
            <Path
              key="current"
              path={basePath}
              color={makeRGBA(previewColor, previewOpacity)}
              strokeWidth={effWidth}
              style="stroke"
              strokeCap={capPrev}
              strokeJoin={joinPrev}
              blendMode={previewBlend}
            />
          );
        })()}

      {currentPoints?.length > 0 && tool === "calligraphy" && (
        <Path
          key="current-soft"
          path={makePathFromPoints(smoothPoints(currentPoints, stabilization))}
          color={makeRGBA(color, 0.9)}
          strokeWidth={computeEffectiveWidth(
            calligraphyWidth || 1,
            thickness,
            pressure
          )}
          style="stroke"
          strokeCap="round"
          strokeJoin="round"
        />
      )}

      {/* eraser selection and pixel previews (kept original) */}
      {tool === "eraser" &&
        eraserMode === "object" &&
        Array.isArray(currentPoints) &&
        currentPoints.length > 1 &&
        (() => {
          const pts = currentPoints;
          const dashLength = 6;
          const gapLength = 4;
          const paths = [];

          for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const segLen = Math.sqrt(dx * dx + dy * dy);

            let offset = 0;
            while (offset < segLen) {
              const start = offset;
              const end = Math.min(offset + dashLength, segLen);
              const t1 = start / segLen;
              const t2 = end / segLen;
              const x1 = p1.x + dx * t1;
              const y1 = p1.y + dy * t1;
              const x2 = p1.x + dx * t2;
              const y2 = p1.y + dy * t2;

              const path = Skia.Path.Make();
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
              paths.push(
                <Path
                  key={`dash-${i}-${offset}`}
                  path={path}
                  color="#2563EB"
                  strokeWidth={1.5}
                  style="stroke"
                  strokeCap="round"
                />
              );

              offset += dashLength + gapLength;
            }
          }
          return paths;
        })()}

      {tool === "eraser" &&
        eraserMode === "pixel" &&
        currentPoints?.length > 0 && (
          <Group key="pixel-eraser-preview">
            <Circle
              cx={currentPoints[currentPoints.length - 1]?.x ?? 0}
              cy={currentPoints[currentPoints.length - 1]?.y ?? 0}
              r={eraserSize / 2}
              color="rgba(255,255,255,0.8)"
            />
            <Circle
              cx={currentPoints[currentPoints.length - 1]?.x ?? 0}
              cy={currentPoints[currentPoints.length - 1]?.y ?? 0}
              r={eraserSize / 2}
              color="rgba(0,0,0,0.25)"
              style="stroke"
              strokeWidth={1.2}
            />
          </Group>
        )}
    </Canvas>
  );
});

export default memo(CanvasRenderer);
