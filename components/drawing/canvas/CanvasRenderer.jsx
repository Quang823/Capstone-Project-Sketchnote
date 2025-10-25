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
import CanvasImage from "./CanvasImage";
import PaperGuides from "./PaperGuides";
import { applyPencilAlpha, makePathFromPoints } from "./utils";

const DESK_BGCOLOR = "#e9ecef";
const PAGE_BGCOLOR = "#ffffff";

// Font imports (giữ nguyên)
import RobotoRegular from "../../../assets/fonts/Roboto/Roboto_Condensed-Regular.ttf";
import RobotoBold from "../../../assets/fonts/Roboto/Roboto_Condensed-Bold.ttf";
import RobotoItalic from "../../../assets/fonts/Roboto/Roboto_Condensed-Italic.ttf";
import RobotoBoldItalic from "../../../assets/fonts/Roboto/Roboto_Condensed-BoldItalic.ttf";
import LatoRegular from "../../../assets/fonts/Lato/Lato-Regular.ttf";
import LatoBold from "../../../assets/fonts/Lato/Lato-Bold.ttf";
import LatoItalic from "../../../assets/fonts/Lato/Lato-Italic.ttf";
import LatoBoldItalic from "../../../assets/fonts/Lato/Lato-BoldItalic.ttf";
import MontserratRegular from "../../../assets/fonts/Montserrat/Montserrat-Regular.ttf";
import MontserratBold from "../../../assets/fonts/Montserrat/Montserrat-Bold.ttf";
import MontserratItalic from "../../../assets/fonts/Montserrat/Montserrat-Italic.ttf";
import MontserratBoldItalic from "../../../assets/fonts/Montserrat/Montserrat-BoldItalic.ttf";
import OpenSansCondensedRegular from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Regular.ttf";
import OpenSansCondensedBold from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Bold.ttf";
import OpenSansCondensedItalic from "../../../assets/fonts/OpenSans/OpenSans_Condensed-Italic.ttf";
import OpenSansCondensedBoldItalic from "../../../assets/fonts/OpenSans/OpenSans_Condensed-BoldItalic.ttf";
import InterRegular from "../../../assets/fonts/Inter/Inter_18pt-Regular.ttf";
import InterBold from "../../../assets/fonts/Inter/Inter_18pt-Bold.ttf";
import InterItalic from "../../../assets/fonts/Inter/Inter_18pt-Italic.ttf";
import InterBoldItalic from "../../../assets/fonts/Inter/Inter_18pt-BoldItalic.ttf";
import PoppinsRegular from "../../../assets/fonts/Poppins/Poppins-Regular.ttf";
import PoppinsBold from "../../../assets/fonts/Poppins/Poppins-Bold.ttf";
import PoppinsItalic from "../../../assets/fonts/Poppins/Poppins-Italic.ttf";
import PoppinsBoldItalic from "../../../assets/fonts/Poppins/Poppins-BoldItalic.ttf";
import PacificoRegular from "../../../assets/fonts/Pacifico/Pacifico-Regular.ttf";
import NotoColorEmojiRegular from "../../../assets/fonts/NotoColorEmoji/NotoColorEmoji-Regular.ttf";

// Font mapping (giữ nguyên)
const FONT_MAP = {
  Roboto: {
    Regular: RobotoRegular,
    Bold: RobotoBold,
    Italic: RobotoItalic,
    BoldItalic: RobotoBoldItalic,
  },
  Lato: {
    Regular: LatoRegular,
    Bold: LatoBold,
    Italic: LatoItalic,
    BoldItalic: LatoBoldItalic,
  },
  Montserrat: {
    Regular: MontserratRegular,
    Bold: MontserratBold,
    Italic: MontserratItalic,
    BoldItalic: MontserratBoldItalic,
  },
  OpenSans: {
    Regular: OpenSansCondensedRegular,
    Bold: OpenSansCondensedBold,
    Italic: OpenSansCondensedItalic,
    BoldItalic: OpenSansCondensedBoldItalic,
  },
  Inter: {
    Regular: InterRegular,
    Bold: InterBold,
    Italic: InterItalic,
    BoldItalic: InterBoldItalic,
  },
  Poppins: {
    Regular: PoppinsRegular,
    Bold: PoppinsBold,
    Italic: PoppinsItalic,
    BoldItalic: PoppinsBoldItalic,
  },
  Pacifico: {
    Regular: PacificoRegular,
  },
  NotoColorEmoji: {
    Regular: NotoColorEmojiRegular,
  },
};

// Preload fonts (giữ nguyên)
const FONT_SIZES = [12, 16, 20, 24, 32, 40];

function usePreloadedFonts() {
  const loaded = {};
  for (const family in FONT_MAP) {
    loaded[family] = {};
    for (const styleKey of Object.keys(FONT_MAP[family])) {
      loaded[family][styleKey] = {};
      for (const sz of FONT_SIZES) {
        loaded[family][styleKey][sz] = useFont(FONT_MAP[family][styleKey], sz);
      }
    }
  }
  return loaded;
}

function getNearestFont(loadedFonts, family, bold, italic, size = 18) {
  const baseFamily = (family || "Roboto").replace(
    /(-Regular|-Bold|-Italic|-BoldItalic)+$/g,
    ""
  );

  const fontSet = loadedFonts[baseFamily] || loadedFonts["Roboto"];
  const style =
    bold && italic
      ? "BoldItalic"
      : bold
      ? "Bold"
      : italic
      ? "Italic"
      : "Regular";

  const nearest = FONT_SIZES.reduce((a, b) =>
    Math.abs(b - size) < Math.abs(a - size) ? b : a
  );

  return {
    font:
      fontSet?.[style]?.[nearest] ||
      fontSet?.["Regular"]?.[nearest] ||
      loadedFonts["Roboto"]["Regular"][18] ||
      null,
    nearest,
  };
}

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

// Cải thiện makeRGBA với fallback rõ ràng
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
    // strokes,
    layers = [],
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
  },
  ref
) {
  const canvasRef = useCanvasRef();
  const loadedFonts = usePreloadedFonts();

  const safePage = {
    x: page?.x ?? 0,
    y: page?.y ?? 0,
    w: page?.w ?? 0,
    h: page?.h ?? 0,
  };

  const safeCanvasHeight = canvasHeight ?? 0;

  // Trong CanvasRenderer forwardRef
  useImperativeHandle(ref, () => ({
    getSnapshot: () => canvasRef.current?.makeImageSnapshot(), // Trả SkImage
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
  const visibleStrokes = layers
    .filter((l) => l.visible)
    .flatMap((l) => (Array.isArray(l.strokes) ? l.strokes : []))
    .filter(
      (s) =>
        s &&
        s.id &&
        !(
          realtimeText?.id &&
          s.id === realtimeText.id &&
          ["sticky", "comment", "text"].includes(s.tool)
        )
    );

  const renderStroke = (s, index) => {
    if (!s) return null;

    // 🖼️ Ảnh và sticker
    if (
      (s.tool === "image" || s.tool === "sticker") &&
      (s.uri || s.imageUri || s.image)
    ) {
      return (
        <CanvasImage
          key={s.id}
          stroke={s}
          selectedId={selectedId}
          onSelectImage={onSelectImage}
        />
      );
    }

    // 📝 TEXT / STICKY / COMMENT / EMOJI
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

      // 🟨 Sticky note
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

      // 😀 Emoji
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

      // 🔤 Text chính
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

      // Gạch chân
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

      // Viền chọn (dashed)
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

    if (s.points && s.points.length > 0) {
      const smoothed = smoothPoints(s.points, s.stabilization ?? stabilization);
      const path = makePathFromPoints(smoothed);
      let strokeColor = s.color || "#000000";
      let blendMode = "srcOver";
      let baseOpacity = 1;

      if (s.tool === "pencil") {
        strokeColor = applyPencilAlpha(strokeColor);
      } else if (s.tool === "brush") {
        baseOpacity = 0.75;
        blendMode = "overlay";
      } else if (s.tool === "calligraphy") {
        baseOpacity = 0.9;
        blendMode = "srcOver";
      } else if (s.tool === "highlighter") {
        baseOpacity = 0.4;
        blendMode = "multiply";
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

      if (s.tool === "brush") {
        return (
          <Group key={`${s.id}-brush-group`}>
            <Path
              key={`${s.id}-outer`}
              path={path}
              color={makeRGBA(strokeColor, 0.9)}
              strokeWidth={effWidth * 1.4}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
              blendMode="overlay"
            />
            <Path
              key={`${s.id}-inner`}
              path={path}
              color={makeRGBA(strokeColor, 0.4)}
              strokeWidth={effWidth * 0.8}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
              blendMode="srcOver"
            />
          </Group>
        );
      }

      if (s.tool === "calligraphy") {
        return (
          <Group key={`${s.id}-calligraphy-group`}>
            <Path
              key={`${s.id}-inner`}
              path={path}
              color={makeRGBA(strokeColor, 1.0)}
              strokeWidth={effWidth}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
              blendMode="srcOver"
            />
            <Path
              key={`${s.id}-outer`}
              path={path}
              color={makeRGBA(strokeColor, 0.3)}
              strokeWidth={effWidth * 1.6}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
              blendMode="overlay"
            />
          </Group>
        );
      }

      return (
        <Path
          key={s.id}
          path={path}
          color={strokeColor}
          strokeWidth={effWidth}
          style="stroke"
          strokeCap="round"
          strokeJoin="round"
          blendMode={blendMode}
        />
      );
    }

    return null;
  };

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

      {/* Fill layer */}
      {layers.map(
        (layer) =>
          layer.visible &&
          layer.strokes?.map((s) => {
            if (!s) return null;
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
              const fillNode = (
                <Path
                  key={`${s.id}-fill`}
                  path={path}
                  color={makeRGBA(s.fillColor || "#ffffff", 1)}
                  style="fill"
                />
              );
              const vo = visualOffsets?.[s.id];
              const dx = (vo?.dx ?? s?.tempOffset?.dx) || 0;
              const dy = (vo?.dy ?? s?.tempOffset?.dy) || 0;
              return dx || dy ? (
                <Group
                  key={`${s.id}-fill-wrap`}
                  transform={[{ translateX: dx }, { translateY: dy }]}
                >
                  {fillNode}
                </Group>
              ) : (
                fillNode
              );
            }
            if (s.fill && s.points?.length > 0) {
              const path = makePathFromPoints(s.points);
              try {
                path.close();
              } catch {}
              const fillNode = (
                <Path
                  key={`${layer.id}-${s.id}-fill`}
                  path={path}
                  color={makeRGBA(s.fillColor || "#ffffff", 1)}
                  style="fill"
                />
              );
              const dx = s?.tempOffset?.dx || 0;
              const dy = s?.tempOffset?.dy || 0;
              return dx || dy ? (
                <Group
                  key={`${layer.id}-${s.id}-fill-wrap`}
                  transform={[{ translateX: dx }, { translateY: dy }]}
                >
                  {fillNode}
                </Group>
              ) : (
                fillNode
              );
            }
            return null;
          })
      )}

      {/* Stroke + Text + Effect layer */}
      <Group layer>
        {visibleStrokes &&
          visibleStrokes.map((s, index) => {
            const node = renderStroke(s, index);
            if (!node) return null;
            const vo = visualOffsets?.[s.id];
            const dx = (vo?.dx ?? s?.tempOffset?.dx) || 0;
            const dy = (vo?.dy ?? s?.tempOffset?.dy) || 0;
            return dx || dy ? (
              <Group
                key={`${s.id}-wrap`}
                transform={[{ translateX: dx }, { translateY: dy }]}
              >
                {node}
              </Group>
            ) : (
              node
            );
          })}

        {/* Realtime text preview */}
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
              bubble.quadTo(
                left,
                top + textHeight,
                left,
                top + textHeight - 10
              );
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

            // Fill polygon translucent
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

        {/* Preview hiện tại */}
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
              previewOpacity = 0.75;
              previewBlend = "overlay";
              toolWidth = brushWidth || 1;
            } else if (tool === "calligraphy") {
              previewOpacity = 0.9;
              previewBlend = "srcOver";
              toolWidth = calligraphyWidth || 1;
            } else if (tool === "highlighter") {
              previewOpacity = 0.4;
              previewBlend = "multiply";
              toolWidth = (strokeWidth || 1) * 2;
            }

            const basePath = makePathFromPoints(
              smoothPoints(currentPoints, dynamicStab)
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
                    key="brush-outer"
                    path={basePath}
                    color={makeRGBA(color, 0.9)}
                    strokeWidth={effWidth * 1.4}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode="overlay"
                  />
                  <Path
                    key="brush-inner"
                    path={basePath}
                    color={makeRGBA(color, 0.4)}
                    strokeWidth={effWidth * 0.8}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode="srcOver"
                  />
                </Group>
              );
            }

            if (tool === "calligraphy") {
              return (
                <Group key="current-calligraphy-group">
                  <Path
                    key="calligraphy-inner"
                    path={basePath}
                    color={makeRGBA(color, 1.0)}
                    strokeWidth={effWidth}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode="srcOver"
                  />
                  <Path
                    key="calligraphy-outer"
                    path={basePath}
                    color={makeRGBA(color, 0.3)}
                    strokeWidth={effWidth * 1.6}
                    style="stroke"
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode="overlay"
                  />
                </Group>
              );
            }

            return (
              <Path
                key="current"
                path={basePath}
                color={makeRGBA(previewColor, previewOpacity)}
                strokeWidth={effWidth}
                style="stroke"
                strokeCap="round"
                strokeJoin="round"
                blendMode={previewBlend}
              />
            );
          })()}

        {currentPoints?.length > 0 &&
          (tool === "brush" || tool === "calligraphy") && (
            <Path
              key="current-soft"
              path={makePathFromPoints(
                smoothPoints(currentPoints, stabilization)
              )}
              color={makeRGBA(color, tool === "brush" ? 0.6 : 0.9)}
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

export default CanvasRenderer;
