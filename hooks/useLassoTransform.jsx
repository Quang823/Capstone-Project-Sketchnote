// file: hooks/useLassoTransform.js
import { useCallback } from "react";

/**
 * Hook xử lý MOVE cho các strokes trong vùng Lasso.
 * - Đơn giản hóa: chỉ hỗ trợ MOVE, không có rotate/resize
 * - Mượt mà và ổn định cho tất cả loại object
 * - Filter theo activeLayerId để tránh lag
 */

export default function useLassoTransform({
  strokes,
  lassoSelection,
  activeLayerId,
  onModifyStroke,
  onModifyStrokesBulk,
}) {
  // 🟩 MOVE: Commit final position after drag ends
  const handleMoveCommit = useCallback(
    (dx, dy) => {
      if (dx === 0 && dy === 0) return;

      // Filter by selection AND layer (important!)
      const sel = strokes.filter(
        (s) =>
          lassoSelection.includes(s.id) &&
          (!activeLayerId || s.layerId === activeLayerId)
      );
      if (!sel.length) return;

      const updates = sel
        .map((s) => {
          const i = strokes.findIndex((st) => st.id === s.id);
          if (i === -1) return null;

          // For strokes with points (pen, pencil, brush, etc.)
          if (Array.isArray(s.points) && s.points.length && !s.shape) {
            const newPoints = s.points.map((p) => ({
              ...p, // Keep other point properties like pressure
              x: (p.x ?? 0) + dx,
              y: (p.y ?? 0) + dy,
            }));
            return { id: s.id, index: i, changes: { points: newPoints } };
          }

          // For shapes with shape property
          if (s.shape) {
            const sh = s.shape;
            let newShape = { ...sh };

            // Circle and oval: update center
            if (s.tool === "circle" || s.tool === "oval") {
              const safe = (n, fb = 0) => (Number.isFinite(n) ? n : fb);
              newShape.cx = safe((sh.cx ?? 0) + dx, sh.cx ?? 0);
              newShape.cy = safe((sh.cy ?? 0) + dy, sh.cy ?? 0);
            }
            // Rectangle and square: update position
            else if (s.tool === "rect" || s.tool === "square") {
              const safe = (n, fb = 0) => (Number.isFinite(n) ? n : fb);
              newShape.x = safe((sh.x ?? 0) + dx, sh.x ?? 0);
              newShape.y = safe((sh.y ?? 0) + dy, sh.y ?? 0);
            }
            // Triangle: update all three points
            else if (s.tool === "triangle") {
              const safe = (n, fb = 0) => (Number.isFinite(n) ? n : fb);
              newShape.x1 = safe((sh.x1 ?? 0) + dx, sh.x1 ?? 0);
              newShape.y1 = safe((sh.y1 ?? 0) + dy, sh.y1 ?? 0);
              newShape.x2 = safe((sh.x2 ?? 0) + dx, sh.x2 ?? 0);
              newShape.y2 = safe((sh.y2 ?? 0) + dy, sh.y2 ?? 0);
              newShape.x3 = safe((sh.x3 ?? 0) + dx, sh.x3 ?? 0);
              newShape.y3 = safe((sh.y3 ?? 0) + dy, sh.y3 ?? 0);
            }
            // Line and arrow: update endpoints
            else if (s.tool === "line" || s.tool === "arrow") {
              const safe = (n, fb = 0) => (Number.isFinite(n) ? n : fb);
              newShape.x1 = safe((sh.x1 ?? 0) + dx, sh.x1 ?? 0);
              newShape.y1 = safe((sh.y1 ?? 0) + dy, sh.y1 ?? 0);
              newShape.x2 = safe((sh.x2 ?? 0) + dx, sh.x2 ?? 0);
              newShape.y2 = safe((sh.y2 ?? 0) + dy, sh.y2 ?? 0);
            }
            // Polygon and star: update all points
            else if (s.tool === "polygon" || s.tool === "star") {
              if (Array.isArray(sh.points)) {
                const safe = (n, fb = 0) => (Number.isFinite(n) ? n : fb);
                newShape.points = sh.points.map((p) => ({
                  ...p,
                  x: safe((p.x ?? 0) + dx, p.x ?? 0),
                  y: safe((p.y ?? 0) + dy, p.y ?? 0),
                }));
              }
            }

            return { id: s.id, index: i, changes: { shape: newShape } };
          }

          // For text, image, sticker, emoji, sticky, comment - update x,y position
          if (
            [
              "text",
              "sticky",
              "comment",
              "emoji",
              "image",
              "sticker",
              "table",
            ].includes(s.tool)
          ) {
            return {
              id: s.id,
              index: i,
              changes: { x: (s.x ?? 0) + dx, y: (s.y ?? 0) + dy },
            };
          }

          // Fallback: any object with x,y
          if (typeof s.x === "number" && typeof s.y === "number") {
            return {
              id: s.id,
              index: i,
              changes: { x: s.x + dx, y: s.y + dy },
            };
          }

          return null;
        })
        .filter(Boolean);

      if (updates.length) {
        if (typeof onModifyStrokesBulk === "function") {
          onModifyStrokesBulk(updates, { transient: false });
        } else {
          updates.forEach((u) => onModifyStroke?.(u.index, u.changes));
        }
      }
    },
    [
      strokes,
      lassoSelection,
      activeLayerId,
      onModifyStrokesBulk,
      onModifyStroke,
    ]
  );

  return {
    handleMoveCommit,
  };
}
