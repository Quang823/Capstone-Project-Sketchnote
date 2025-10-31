import { PixelRatio } from "react-native";

/**
 * Utility functions for ruler: geometry, snapping, and barrier constraints.
 */

export const SNAP_THRESHOLD = 30; // px (tune if needed)
export const BARRIER_THRESHOLD = 50; // px (tune if needed)

function rotatePointLocal(dx, dy, cos, sin) {
  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function rotatePoint(offsetX, offsetY, cos, sin, cx, cy) {
  const r = rotatePointLocal(offsetX, offsetY, cos, sin);
  return { x: cx + r.x, y: cy + r.y };
}

export function distanceToLine(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const lenSq = C * C + D * D;
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  const dot = A * C + B * D;
  const param = dot / lenSq;
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const wx = px - x1;
  const wy = py - y1;
  const c1 = vx * wx + vy * wy;
  if (c1 <= 0) return Math.hypot(px - x1, py - y1);
  const c2 = vx * vx + vy * vy;
  if (c2 <= c1) return Math.hypot(px - x2, py - y2);
  const t = c1 / c2;
  const bx = x1 + t * vx;
  const by = y1 + t * vy;
  return Math.hypot(px - bx, py - by);
}

export function projectPointOnSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const lenSq = C * C + D * D;
  if (lenSq === 0) return { x: x1, y: y1 };
  const dot = A * C + B * D;
  let t = dot / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return { x: x1 + t * C, y: y1 + t * D };
}

export function getRulerEdges(ruler) {
  if (!ruler) return null;

  // LUÔN log dữ liệu ruler để theo dõi vị trí mới nhất
  // console.log(
  //   "[rulerUtils.getRulerEdges] input=",
  //   JSON.stringify({
  //     x: ruler.x,
  //     y: ruler.y,
  //     rotation: ruler.rotation,
  //     width: ruler.width,
  //     height: ruler.height,
  //     scale: ruler.scale,
  //     _originalScreenPosition: ruler._originalScreenPosition,
  //     timestamp: Date.now(),
  //   })
  // );
  // Đảm bảo sử dụng vị trí mới nhất của ruler, KHÔNG sử dụng _originalScreenPosition
  // Nếu ruler có _originalScreenPosition, đó có thể là vị trí cũ
  const {
    x = 0,
    y = 0,
    rotation = 0,
    width = 0,
    height = 0,
    scale = 1,
    strokeWidth = 2,
  } = ruler;

  const w = width * (scale || 1);
  const h = height * (scale || 1);

  const cx = x + w / 2;
  const cy = y + h / 2;

  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const topLeft = rotatePoint(-w / 2, -h / 2, cos, sin, cx, cy);
  const topRight = rotatePoint(w / 2, -h / 2, cos, sin, cx, cy);
  const bottomLeft = rotatePoint(-w / 2, h / 2, cos, sin, cx, cy);
  const bottomRight = rotatePoint(w / 2, h / 2, cos, sin, cx, cy);

  const centerLeft = rotatePoint(-w / 2, 0, cos, sin, cx, cy);
  const centerRight = rotatePoint(w / 2, 0, cos, sin, cx, cy);

  const halfStroke = (strokeWidth || 0) / 2;
  const deviceNudge = 0;

  const drawingTopLeft = rotatePoint(
    -w / 2,
    -h / 2 + halfStroke + deviceNudge,
    cos,
    sin,
    cx,
    cy
  );
  const drawingTopRight = rotatePoint(
    w / 2,
    -h / 2 + halfStroke + deviceNudge,
    cos,
    sin,
    cx,
    cy
  );
  const drawingBottomLeft = rotatePoint(
    -w / 2,
    h / 2 - halfStroke - deviceNudge,
    cos,
    sin,
    cx,
    cy
  );
  const drawingBottomRight = rotatePoint(
    w / 2,
    h / 2 - halfStroke - deviceNudge,
    cos,
    sin,
    cx,
    cy
  );

  return {
    topEdge: {
      x1: drawingTopLeft.x,
      y1: drawingTopLeft.y,
      x2: drawingTopRight.x,
      y2: drawingTopRight.y,
    },
    bottomEdge: {
      x1: drawingBottomLeft.x,
      y1: drawingBottomLeft.y,
      x2: drawingBottomRight.x,
      y2: drawingBottomRight.y,
    },
    centerEdge: {
      x1: centerLeft.x,
      y1: centerLeft.y,
      x2: centerRight.x,
      y2: centerRight.y,
    },
    corners: { topLeft, topRight, bottomLeft, bottomRight },
    center: { x: cx, y: cy },
  };
}

export function snapToRuler(point, ruler) {
  if (!ruler || !point) return point;
  const edges = getRulerEdges(ruler);
  if (!edges) return point;
  const candidates = [edges.topEdge, edges.bottomEdge].filter(Boolean);

  // start with input point
  let best = { ...point };
  let bestDist = Infinity;

  for (let i = 0; i < candidates.length; i++) {
    const e = candidates[i];
    const dist = distanceToSegment(point.x, point.y, e.x1, e.y1, e.x2, e.y2);
    if (dist < bestDist) {
      bestDist = dist;
      best = projectPointOnSegment(point.x, point.y, e.x1, e.y1, e.x2, e.y2);
    }
  }

  const dpr = PixelRatio.get ? PixelRatio.get() : 1;
  const effectiveThreshold = Math.max(8, Math.round(12 * dpr));

  if (bestDist <= effectiveThreshold) return best;
  return point;
}

function segmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-9) return null;
  const pre = x1 * y2 - y1 * x2;
  const post = x3 * y4 - y3 * x4;
  const x = (pre * (x3 - x4) - (x1 - x2) * post) / denom;
  const y = (pre * (y3 - y4) - (y1 - y2) * post) / denom;
  const within = (v, a, b) =>
    v >= Math.min(a, b) - 1e-6 && v <= Math.max(a, b) + 1e-6;
  if (!within(x, x1, x2) || !within(x, x3, x4)) return null;
  if (!within(y, y1, y2) || !within(y, y3, y4)) return null;
  return { x, y };
}

function sideOfLine(px, py, x1, y1, x2, y2) {
  return (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
}

export function constrainToRulerBarrier(point, prevPoint, ruler) {
  if (!ruler || !point) return point;
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return point;

  const edges = getRulerEdges(ruler);
  if (!edges || !edges.topEdge || !edges.bottomEdge) return point;

  const top = edges.topEdge;
  const bottom = edges.bottomEdge;

  const distTop = distanceToSegment(
    point.x,
    point.y,
    top.x1,
    top.y1,
    top.x2,
    top.y2
  );
  const distBottom = distanceToSegment(
    point.x,
    point.y,
    bottom.x1,
    bottom.y1,
    bottom.x2,
    bottom.y2
  );

  const minDist = Math.min(distTop, distBottom);
  if (minDist > BARRIER_THRESHOLD * 3) return point;

  if (
    !prevPoint ||
    !Number.isFinite(prevPoint.x) ||
    !Number.isFinite(prevPoint.y)
  ) {
    if (distTop < BARRIER_THRESHOLD && distTop <= distBottom)
      return projectPointOnSegment(
        point.x,
        point.y,
        top.x1,
        top.y1,
        top.x2,
        top.y2
      );
    if (distBottom < BARRIER_THRESHOLD)
      return projectPointOnSegment(
        point.x,
        point.y,
        bottom.x1,
        bottom.y1,
        bottom.x2,
        bottom.y2
      );
    return point;
  }

  const prevDistTop = distanceToSegment(
    prevPoint.x,
    prevPoint.y,
    top.x1,
    top.y1,
    top.x2,
    top.y2
  );
  const prevDistBottom = distanceToSegment(
    prevPoint.x,
    prevPoint.y,
    bottom.x1,
    bottom.y1,
    bottom.x2,
    bottom.y2
  );

  const currSideTop = sideOfLine(
    point.x,
    point.y,
    top.x1,
    top.y1,
    top.x2,
    top.y2
  );
  const currSideBottom = sideOfLine(
    point.x,
    point.y,
    bottom.x1,
    bottom.y1,
    bottom.x2,
    bottom.y2
  );
  const prevSideTop = sideOfLine(
    prevPoint.x,
    prevPoint.y,
    top.x1,
    top.y1,
    top.x2,
    top.y2
  );
  const prevSideBottom = sideOfLine(
    prevPoint.x,
    prevPoint.y,
    bottom.x1,
    bottom.y1,
    bottom.x2,
    bottom.y2
  );

  if (currSideTop * currSideBottom < 0) {
    return distTop <= distBottom
      ? projectPointOnSegment(point.x, point.y, top.x1, top.y1, top.x2, top.y2)
      : projectPointOnSegment(
          point.x,
          point.y,
          bottom.x1,
          bottom.y1,
          bottom.x2,
          bottom.y2
        );
  }

  if (prevDistTop < BARRIER_THRESHOLD) {
    if (distTop < BARRIER_THRESHOLD * 2.5)
      return projectPointOnSegment(
        point.x,
        point.y,
        top.x1,
        top.y1,
        top.x2,
        top.y2
      );
  }
  if (prevDistBottom < BARRIER_THRESHOLD) {
    if (distBottom < BARRIER_THRESHOLD * 2.5)
      return projectPointOnSegment(
        point.x,
        point.y,
        bottom.x1,
        bottom.y1,
        bottom.x2,
        bottom.y2
      );
  }

  if (prevSideTop * currSideTop < 0 && distTop < BARRIER_THRESHOLD * 2)
    return projectPointOnSegment(
      point.x,
      point.y,
      top.x1,
      top.y1,
      top.x2,
      top.y2
    );
  if (prevSideBottom * currSideBottom < 0 && distBottom < BARRIER_THRESHOLD * 2)
    return projectPointOnSegment(
      point.x,
      point.y,
      bottom.x1,
      bottom.y1,
      bottom.x2,
      bottom.y2
    );

  if (distTop < BARRIER_THRESHOLD && distTop <= distBottom)
    return projectPointOnSegment(
      point.x,
      point.y,
      top.x1,
      top.y1,
      top.x2,
      top.y2
    );
  if (distBottom < BARRIER_THRESHOLD)
    return projectPointOnSegment(
      point.x,
      point.y,
      bottom.x1,
      bottom.y1,
      bottom.x2,
      bottom.y2
    );

  return point;
}

export function convertOverlayToCanvas(
  point,
  canvasTransform = { panX: 0, panY: 0, scale: 1 }
) {
  if (!point) return point;
  const { panX = 0, panY = 0, scale = 1 } = canvasTransform;
  return {
    x: (point.x - panX) / (scale || 1),
    y: (point.y - panY) / (scale || 1),
  };
}

export default {
  getRulerEdges,
  snapToRuler,
  constrainToRulerBarrier,
  distanceToLine,
  projectPointOnSegment,
  distanceToSegment,
  SNAP_THRESHOLD,
  BARRIER_THRESHOLD,
  rotatePoint,
  convertOverlayToCanvas,
};
