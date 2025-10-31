// file: hooks/useLassoTransform.js
import { useRef } from "react";

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
  const pendingMove = useRef({ dx: 0, dy: 0 });

  // 🟩 MOVE: Commit final position after drag ends
  const handleMoveCommit = (dx, dy) => {
    // Filter by selection AND layer (important!)
    const sel = strokes.filter(
      (s) =>
        lassoSelection.includes(s.id) &&
        (!activeLayerId || s.layerId === activeLayerId)
    );
    if (!sel.length) return;

    // Use provided dx/dy (from visual offset)
    if (!dx && !dy) return;

    const updates = sel
      .map((s) => {
        const i = strokes.findIndex((st) => st.id === s.id);
        if (i === -1) return null;

        // For strokes with points (pen, pencil, brush, etc.)
        if (Array.isArray(s.points) && s.points.length && !s.shape) {
          const newPoints = s.points.map((p) => ({
            x: (p.x ?? 0) + dx,
            y: (p.y ?? 0) + dy,
          }));
          return { index: i, changes: { points: newPoints } };
        }

        // For shapes with shape property
        if (s.shape) {
          const sh = s.shape;
          let newShape = { ...sh };

          // Circle and oval: update center
          if (s.tool === "circle" || s.tool === "oval") {
            newShape.cx = (sh.cx ?? 0) + dx;
            newShape.cy = (sh.cy ?? 0) + dy;
          } 
          // Rectangle and square: update position
          else if (s.tool === "rect" || s.tool === "square") {
            newShape.x = (sh.x ?? 0) + dx;
            newShape.y = (sh.y ?? 0) + dy;
          } 
          // Triangle: update all three points
          else if (s.tool === "triangle") {
            newShape.x1 = (sh.x1 ?? 0) + dx;
            newShape.y1 = (sh.y1 ?? 0) + dy;
            newShape.x2 = (sh.x2 ?? 0) + dx;
            newShape.y2 = (sh.y2 ?? 0) + dy;
            newShape.x3 = (sh.x3 ?? 0) + dx;
            newShape.y3 = (sh.y3 ?? 0) + dy;
          } 
          // Line and arrow: update endpoints
          else if (s.tool === "line" || s.tool === "arrow") {
            newShape.x1 = (sh.x1 ?? 0) + dx;
            newShape.y1 = (sh.y1 ?? 0) + dy;
            newShape.x2 = (sh.x2 ?? 0) + dx;
            newShape.y2 = (sh.y2 ?? 0) + dy;
          } 
          // Polygon and star: update all points
          else if (s.tool === "polygon" || s.tool === "star") {
            if (Array.isArray(sh.points)) {
              newShape.points = sh.points.map((p) => ({
                x: (p.x ?? 0) + dx,
                y: (p.y ?? 0) + dy,
              }));
            }
          }

          return { index: i, changes: { shape: newShape } };
        }

        // For text, image, sticker, emoji, sticky, comment - update x,y position
        if (
          ["text", "sticky", "comment", "emoji", "image", "sticker"].includes(
            s.tool
          )
        ) {
          return {
            index: i,
            changes: { x: (s.x ?? 0) + dx, y: (s.y ?? 0) + dy },
          };
        }

        // Fallback: any object with x,y
        if (typeof s.x === "number" && typeof s.y === "number") {
          return {
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
  };

  return {
    handleMoveCommit,
  };
}
