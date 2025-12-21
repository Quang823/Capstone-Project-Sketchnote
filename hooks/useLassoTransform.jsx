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

      // Filter by selection (layer filtering is already handled during selection)
      const sel = strokes.filter((s) => lassoSelection.includes(s.id));
      if (!sel.length) return;

      // Sanity check for dx, dy
      if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
        console.warn("useLassoTransform: Invalid dx or dy", { dx, dy });
        return;
      }

      const updates = sel
        .map((s) => {
          const i = strokes.findIndex((st) => st.id === s.id);
          if (i === -1) return null;

          const safeAdd = (val, delta) => {
            const result = (val ?? 0) + delta;
            return Number.isFinite(result) ? result : val;
          };

          // For strokes with points (pen, pencil, brush, etc.)
          if (Array.isArray(s.points) && s.points.length && !s.shape) {
            const newPoints = s.points.map((p) => ({
              ...p, // Keep other point properties like pressure
              x: safeAdd(p.x, dx),
              y: safeAdd(p.y, dy),
            }));
            return { id: s.id, index: i, changes: { points: newPoints } };
          }

          // For shapes with shape property
          if (s.shape) {
            const sh = s.shape;
            let newShape = { ...sh };

            // Update center coordinates (circle, oval)
            if (typeof sh.cx === "number") newShape.cx = safeAdd(sh.cx, dx);
            if (typeof sh.cy === "number") newShape.cy = safeAdd(sh.cy, dy);

            // Update position coordinates (rect, square)
            if (typeof sh.x === "number") newShape.x = safeAdd(sh.x, dx);
            if (typeof sh.y === "number") newShape.y = safeAdd(sh.y, dy);

            // Update point-based coordinates (triangle, line, arrow)
            if (typeof sh.x1 === "number") newShape.x1 = safeAdd(sh.x1, dx);
            if (typeof sh.y1 === "number") newShape.y1 = safeAdd(sh.y1, dy);
            if (typeof sh.x2 === "number") newShape.x2 = safeAdd(sh.x2, dx);
            if (typeof sh.y2 === "number") newShape.y2 = safeAdd(sh.y2, dy);
            if (typeof sh.x3 === "number") newShape.x3 = safeAdd(sh.x3, dx);
            if (typeof sh.y3 === "number") newShape.y3 = safeAdd(sh.y3, dy);

            // Update array-based points (polygon, star, diamond, etc.)
            if (Array.isArray(sh.points)) {
              newShape.points = sh.points.map((p) => ({
                ...p,
                x: safeAdd(p.x, dx),
                y: safeAdd(p.y, dy),
              }));
            }

            const changes = { shape: newShape };

            // Also update top-level x, y if they exist
            if (typeof s.x === "number") changes.x = safeAdd(s.x, dx);
            if (typeof s.y === "number") changes.y = safeAdd(s.y, dy);

            // Also update points if they exist (important for some rendering/hit-test paths)
            if (Array.isArray(s.points) && s.points.length) {
              changes.points = s.points.map((p) => ({
                ...p,
                x: safeAdd(p.x, dx),
                y: safeAdd(p.y, dy),
              }));
            }

            return { id: s.id, index: i, changes };
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
              changes: { x: safeAdd(s.x, dx), y: safeAdd(s.y, dy) },
            };
          }

          // Fallback: any object with x,y
          if (typeof s.x === "number" && typeof s.y === "number") {
            return {
              id: s.id,
              index: i,
              changes: { x: safeAdd(s.x, dx), y: safeAdd(s.y, dy) },
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
