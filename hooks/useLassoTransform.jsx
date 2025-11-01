// file: hooks/useLassoTransform.js
import { useRef } from "react";

/**
 * Hook xử lý transform (move / resize / rotate) cho các strokes trong vùng Lasso.
 * - Gom update bằng requestAnimationFrame để tránh lỗi "setState during render".
 * - Mượt, ổn định, an toàn khi gọi từ GestureHandler hoặc LassoSelectionBox.
 */

export default function useLassoTransform({
  strokes,
  lassoSelection,
  setLassoOrigin,
  onModifyStroke,
  onModifyStrokesBulk,
  getBoundingBoxForStroke,
}) {
  const rafScheduled = useRef(false);
  const pendingMove = useRef({ dx: 0, dy: 0 });
  const pendingResize = useRef(null);
  const pendingRotate = useRef(0);

  const schedule = (callback) => {
    if (rafScheduled.current) return;
    rafScheduled.current = true;
    requestAnimationFrame(() => {
      rafScheduled.current = false;
      callback?.();
    });
  };

  // 🟩 MOVE (visual-only trong khi kéo, commit khi thả)
  const handleMove = (dx, dy) => {
    pendingMove.current.dx += dx;
    pendingMove.current.dy += dy;

    schedule(() => {
      const { dx, dy } = pendingMove.current;
      pendingMove.current = { dx: 0, dy: 0 };
      if (!lassoSelection?.length) return;

      // Chỉ set tempOffset để CanvasRenderer dịch chuyển bằng Group transform
      const updates = lassoSelection
        .map((id) => {
          const i = strokes.findIndex((s) => s.id === id);
          if (i === -1) return null;
          return { index: i, changes: { tempOffset: { dx, dy } } };
        })
        .filter(Boolean);

      if (updates.length) {
        if (typeof onModifyStrokesBulk === "function") {
          onModifyStrokesBulk(updates, { transient: true });
        } else {
          updates.forEach((u) => onModifyStroke?.(u.index, { ...u.changes, __transient: true }));
        }
      }
    });
  };

  // Gọi khi thả tay: áp dụng offset thật vào dữ liệu và xóa tempOffset
  const handleMoveCommit = (dxArg, dyArg) => {
    const sel = strokes.filter((s) => lassoSelection.includes(s.id));
    if (!sel.length) return;
    // Ưu tiên dx,dy truyền vào; nếu không có thì fallback tempOffset (nếu tồn tại)
    let dx = dxArg;
    let dy = dyArg;
    if (typeof dx !== "number" || typeof dy !== "number") {
      const any = sel.find((s) => s?.tempOffset);
      dx = dx ?? any?.tempOffset?.dx ?? 0;
      dy = dy ?? any?.tempOffset?.dy ?? 0;
    }
    if (!dx && !dy) return;

    const updates = sel
      .map((s) => {
        const i = strokes.findIndex((st) => st.id === s.id);
        if (i === -1) return null;
        if (Array.isArray(s.points) && s.points.length) {
          const newPoints = s.points.map((p) => ({ x: (p.x ?? 0) + dx, y: (p.y ?? 0) + dy }));
          return { index: i, changes: { points: newPoints, tempOffset: null } };
        } else {
          return {
            index: i,
            changes: { x: (s.x ?? 0) + dx, y: (s.y ?? 0) + dy, tempOffset: null },
          };
        }
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

  // 🟨 RESIZE (phóng to / thu nhỏ vùng chọn quanh tâm)
  const handleResize = (corner, dx, dy) => {
    pendingResize.current = { corner, dx, dy };

    schedule(() => {
      const resizeData = pendingResize.current;
      pendingResize.current = null;
      if (!resizeData) return;

      const { dx, dy } = resizeData;
      const sel = strokes.filter((s) => lassoSelection.includes(s.id));
      if (!sel.length) return;

      // tính bounding box của vùng chọn
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      sel.forEach((s) => {
        const bbox = getBoundingBoxForStroke(s);
        if (bbox) {
          minX = Math.min(minX, bbox.minX);
          minY = Math.min(minY, bbox.minY);
          maxX = Math.max(maxX, bbox.maxX);
          maxY = Math.max(maxY, bbox.maxY);
        }
      });

      const width = maxX - minX || 1;
      const height = maxY - minY || 1;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const scaleX = 1 + dx / width;
      const scaleY = 1 + dy / height;

      const updates = sel.map((s) => {
        const i = strokes.findIndex((st) => st.id === s.id);
        if (i === -1) return null;
        if (Array.isArray(s.points) && s.points.length) {
          const newPoints = s.points.map((p) => {
            const px = p.x ?? 0;
            const py = p.y ?? 0;
            return { x: cx + (px - cx) * scaleX, y: cy + (py - cy) * scaleY };
          });
          return { index: i, changes: { points: newPoints } };
        } else {
          const ox = s.x ?? 0;
          const oy = s.y ?? 0;
          const nx = cx + (ox - cx) * scaleX;
          const ny = cy + (oy - cy) * scaleY;
          return { index: i, changes: { x: nx, y: ny } };
        }
      }).filter(Boolean);
      if (updates.length) {
        if (typeof onModifyStrokesBulk === "function") {
          onModifyStrokesBulk(updates, { transient: true });
        } else {
          updates.forEach((u) => onModifyStroke?.(u.index, { ...u.changes, __transient: true }));
        }
      }
    });
  };

  // 🌀 ROTATE (xoay quanh tâm vùng chọn)
  const handleRotate = (angle) => {
    pendingRotate.current += angle;

    schedule(() => {
      const angleSum = pendingRotate.current;
      pendingRotate.current = 0;
      if (!angleSum) return;

      const sel = strokes.filter((s) => lassoSelection.includes(s.id));
      if (!sel.length) return;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      sel.forEach((s) => {
        const bbox = getBoundingBoxForStroke(s);
        if (bbox) {
          minX = Math.min(minX, bbox.minX);
          minY = Math.min(minY, bbox.minY);
          maxX = Math.max(maxX, bbox.maxX);
          maxY = Math.max(maxY, bbox.maxY);
        }
      });

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const rad = (angleSum * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const updates = sel.map((s) => {
        const i = strokes.findIndex((st) => st.id === s.id);
        if (i === -1) return null;
        if (Array.isArray(s.points) && s.points.length) {
          const newPoints = s.points.map((p) => {
            const px = p.x ?? 0;
            const py = p.y ?? 0;
            const dx0 = px - cx;
            const dy0 = py - cy;
            return { x: cx + dx0 * cosA - dy0 * sinA, y: cy + dx0 * sinA + dy0 * cosA };
          });
          return { index: i, changes: { points: newPoints } };
        } else {
          const ox = s.x ?? 0;
          const oy = s.y ?? 0;
          const dx0 = ox - cx;
          const dy0 = oy - cy;
          const nx = cx + dx0 * cosA - dy0 * sinA;
          const ny = cy + dx0 * sinA + dy0 * cosA;
          return { index: i, changes: { x: nx, y: ny } };
        }
      }).filter(Boolean);
      if (updates.length) {
        if (typeof onModifyStrokesBulk === "function") {
          onModifyStrokesBulk(updates, { transient: true });
        } else {
          updates.forEach((u) => onModifyStroke?.(u.index, { ...u.changes, __transient: true }));
        }
      }
    });
  };

  return { handleMove, handleMoveCommit, handleResize, handleRotate };
}
