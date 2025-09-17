import { Skia } from "@shopify/react-native-skia";

export function makePathFromPoints(points) {
  const path = Skia.Path.Make();
  if (!points || points.length === 0) return path;
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    path.lineTo(p.x, p.y);
  }
  return path;
}

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

export function isStrokeClosed(points) {
  if (!points || points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const distSq = dx * dx + dy * dy;
  return distSq < 4000;
}

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

  // Square
  if (Math.abs(w - h) < Math.max(15, Math.min(w, h) * 0.2)) {
    return { tool: "square", shape: { x: minX, y: minY, w: h, h: h } };
  }

  // Rectangle
  if (Math.abs(w - h) > Math.max(20, Math.min(w, h) * 0.3)) {
    return { tool: "rect", shape: { x: minX, y: minY, w, h } };
  }

  // Circle
  if (Math.abs(w - h) < Math.max(30, Math.min(w, h) * 0.4)) {
    return {
      tool: "circle",
      shape: { cx: minX + w / 2, cy: minY + h / 2, r: Math.max(w, h) / 2 },
    };
  }

  // Triangle heuristic
  if (points.length >= 3) {
    const p1 = points[0];
    const p2 = points[Math.floor(points.length / 2)];
    const p3 = points[points.length - 1];
    return {
      tool: "triangle",
      shape: { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, x3: p3.x, y3: p3.y },
    };
  }

  // Oval fallback
  return {
    tool: "oval",
    shape: { cx: minX + w / 2, cy: minY + h / 2, rx: w / 2, ry: h / 2 },
  };
}

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
    default:
      return null;
  }
}
