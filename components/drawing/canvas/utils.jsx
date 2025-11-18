import { Skia } from "@shopify/react-native-skia";

/**
 * Vẽ path từ mảng điểm. Nếu smooth=true thì dùng quadratic để mượt hơn. Optimized for GoodNotes-like smooth rendering.
 */
export function makePathFromPoints(points, smooth = true) {
  const path = Skia.Path.Make();
  if (!points || points.length === 0) return path;
  path.moveTo(points[0].x, points[0].y);

  if (smooth) {
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      path.quadTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    path.lineTo(last.x, last.y);
  } else {
    for (let i = 1; i < points.length; i++) {
      path.lineTo(points[i].x, points[i].y);
    }
  }

  return path;
}

/**
 * Giảm opacity khi dùng bút chì.
 */
export function applyPencilAlpha(color) {
  try {
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.45)`;
  } catch {
    return color;
  }
}

export function isInsidePage(x, y, page) {
  return (
    x >= page.x && x <= page.x + page.w && y >= page.y && y <= page.y + page.h
  );
}

/**
 * Kiểm tra stroke có khép kín không (dùng cho shape detection).
 */
export function isStrokeClosed(points) {
  if (!points || points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const distSq = dx * dx + dy * dy;
  return distSq < 4000;
}

/**
 * Heuristic nhận diện shape từ points.
 */
export function detectShapeFromPoints(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;

  if (w < 10 || h < 10) return null;

  if (Math.abs(w - h) < Math.max(15, Math.min(w, h) * 0.2)) {
    return { tool: "square", shape: { x: minX, y: minY, w: h, h: h } };
  }

  if (Math.abs(w - h) > Math.max(20, Math.min(w, h) * 0.3)) {
    return { tool: "rect", shape: { x: minX, y: minY, w, h } };
  }

  if (Math.abs(w - h) < Math.max(30, Math.min(w, h) * 0.4)) {
    return {
      tool: "circle",
      shape: { cx: minX + w / 2, cy: minY + h / 2, r: Math.max(w, h) / 2 },
    };
  }

  if (points.length >= 3) {
    const p1 = points[0];
    const p2 = points[Math.floor(points.length / 2)];
    const p3 = points[points.length - 1];
    return {
      tool: "triangle",
      shape: { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x3: p3.x, y3: p3.y },
    };
  }

  return {
    tool: "oval",
    shape: { cx: minX + w / 2, cy: minY + h / 2, rx: w / 2, ry: h / 2 },
  };
}

/**
 * Build shape data từ points khi tool đã rõ ràng.
 */
export function buildShapeFromPoints(tool, points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = maxX - minX;
  const h = maxY - minY;

  switch (tool) {
    case "square":
      return {
        shape: { x: minX, y: minY, w: Math.min(w, h), h: Math.min(w, h) },
      };
    case "rect":
      return { shape: { x: minX, y: minY, w, h } };
    case "circle":
      return {
        shape: { cx: minX + w / 2, cy: minY + h / 2, r: Math.max(w, h) / 2 },
      };
    case "oval":
      return {
        shape: { cx: minX + w / 2, cy: minY + h / 2, rx: w / 2, ry: h / 2 },
      };
    case "triangle":
      return {
        shape: {
          x1: minX + w / 2,
          y1: minY,
          x2: minX,
          y2: maxY,
          x3: maxX,
          y3: maxY,
        },
      };
    case "line": {
      const start = points[0];
      const end = points[points.length - 1];
      return { shape: { x1: start.x, y1: start.y, x2: end.x, y2: end.y } };
    }
    case "arrow": {
      const start = points[0];
      const end = points[points.length - 1];
      return { shape: { x1: start.x, y1: start.y, x2: end.x, y2: end.y } };
    }
    case "polygon": {
      const sampled = points.filter((_, i) => i % 3 === 0); // Reduce points for polygon
      return { shape: { points: sampled } };
    }
    case "star": {
      // 5-point star based on bbox center and radius
      const cx = minX + w / 2;
      const cy = minY + h / 2;
      const outerR = Math.max(w, h) / 2;
      const innerR = outerR * 0.5;
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5; // start at top
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      }
      return { shape: { points: pts } };
    }
    default:
      return null;
  }
}

/**
 * Tính bounding box cho stroke/shape để tăng tốc kiểm tra hit-test (eraser).
 */
export function getBoundingBoxForStroke(s) {
  // 1) Shapes: prefer shape geometry over points if available
  if (s.shape) {
    const sh = s.shape;
    if (s.tool === "circle") {
      const { cx, cy, r } = sh;
      return { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };
    }
    if (s.tool === "rect" || s.tool === "square") {
      const { x, y, w, h } = sh;
      return { minX: x, minY: y, maxX: x + w, maxY: y + h };
    }
    if (s.tool === "triangle") {
      const { x1, y1, x2, y2, x3, y3 } = sh;
      const minX = Math.min(x1, x2, x3);
      const minY = Math.min(y1, y2, y3);
      const maxX = Math.max(x1, x2, x3);
      const maxY = Math.max(y1, y2, y3);
      return { minX, minY, maxX, maxY };
    }
    if (s.tool === "oval") {
      const { cx, cy, rx, ry } = sh;
      return { minX: cx - rx, minY: cy - ry, maxX: cx + rx, maxY: cy + ry };
    }
    if (s.tool === "line") {
      const { x1, y1, x2, y2 } = sh;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      const pad = (s.width || 10) * 1.5;
      return {
        minX: minX - pad,
        minY: minY - pad,
        maxX: maxX + pad,
        maxY: maxY + pad,
      };
    }
    if (s.tool === "arrow") {
      const { x1, y1, x2, y2 } = sh;
      const minX = Math.min(x1, x2);
      const minY = Math.min(y1, y2);
      const maxX = Math.max(x1, x2);
      const maxY = Math.max(y1, y2);
      const pad = (s.width || 12) * 2;
      return {
        minX: minX - pad,
        minY: minY - pad,
        maxX: maxX + pad,
        maxY: maxY + pad,
      };
    }
    if (s.tool === "polygon" || s.tool === "star") {
      const pts = sh.points || [];
      if (pts.length === 0) return null;
      const xs2 = pts.map((p) => p.x);
      const ys2 = pts.map((p) => p.y);
      const minX2 = Math.min(...xs2);
      const maxX2 = Math.max(...xs2);
      const minY2 = Math.min(...ys2);
      const maxY2 = Math.max(...ys2);
      const pad = (s.width || 10) * 1.2;
      return {
        minX: minX2 - pad,
        minY: minY2 - pad,
        maxX: maxX2 + pad,
        maxY: maxY2 + pad,
      };
    }
  }

  // 2) Text-like objects
  if (["text", "sticky", "comment", "emoji"].includes(s.tool)) {
    const x = s.x ?? 0;
    const y = s.y ?? 0;
    const fontSize = s.fontSize || 18;
    const padding = s.padding || 0;
    const text = typeof s.text === "string" ? s.text : "";
    const approxWidth = text.length * fontSize * 0.6 + padding * 2;
    return {
      minX: x - padding,
      minY: y - fontSize - padding,
      maxX: x + approxWidth,
      maxY: y + padding,
    };
  }

  // 3) Image/Sticker/Table
  if (["image", "sticker", "table"].includes(s.tool)) {
    const x = s.x ?? 0;
    const y = s.y ?? 0;
    const w = s.width || 100;
    const h = s.height || 100;
    return { minX: x, minY: y, maxX: x + w, maxY: y + h };
  }

  // 4) Fallback: strokes defined by points
  if (s.points && s.points.length) {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const pad = (s.width || 10) * 1.5;
    return {
      minX: minX - pad,
      minY: minY - pad,
      maxX: maxX + pad,
      maxY: maxY + pad,
    };
  }

  return null;
}

/**
 * Kiểm tra 1 điểm có nằm bên trong polygon không (ray casting).
 */
export function pointInPolygon(polygonPoints, x, y) {
  if (!polygonPoints || polygonPoints.length < 3) return false;
  let inside = false;
  for (
    let i = 0, j = polygonPoints.length - 1;
    i < polygonPoints.length;
    j = i++
  ) {
    const xi = polygonPoints[i].x,
      yi = polygonPoints[i].y;
    const xj = polygonPoints[j].x,
      yj = polygonPoints[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
