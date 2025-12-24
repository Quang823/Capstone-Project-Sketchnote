import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  isInsidePage,
  makePathFromPoints,
  getBoundingBoxForStroke,
  pointInPolygon,
} from "./utils";
import { detectShape, buildShape } from "./ShapeDetector";
import InlineTextEditor from "../text/InlineTextEditor";
import TextSelectionBox from "../text/TextSelectionBox";
import ImageTransformBox from "../image/ImageTransformBox";
import ImageSelectionBox from "../image/ImageSelectionBox";
import LassoSelectionBox from "../lasso/LassoSelectionBox";
import useLassoTransform from "../../../hooks/useLassoTransform";

import debounce from "lodash/debounce";

const GestureHandler = forwardRef(
  (
    {
      page,
      tool,
      eraserMode,
      strokes,
      allVisibleStrokes,
      currentPoints,
      setCurrentPoints,
      color,
      setColor,
      setTool,
      strokeWidth,
      pencilWidth,
      eraserSize,
      brushWidth,
      brushOpacity,
      calligraphyWidth,
      calligraphyOpacity,
      configByTool = {},
      onAddStroke,
      onModifyStroke,
      onModifyStrokesBulk,
      onDeleteStroke,
      children,
      canvasRef,
      setRealtimeText,
      zoomState,
      onSelectStroke,
      activeLayerId,
      onLiveUpdateStroke,
      scrollRef,
      scrollOffsetY = 0,
      scrollYShared,
      pageOffsetY = 0,
      onColorPicked,
      shapeSettings,
      tapeSettings,
      imageRefs,
      selectedId: selectedIdProp,
      selectedBox: selectedBoxProp,
      onSelectionChange,
      // 🔄 REALTIME COLLABORATION props
      pageId,
      collabEnabled,
      collabConnected,
      onCollabElementUpdate,
      onCollabElementCreate,
      onCollabElementDelete,
      onCollabRequestLock,
      onCollabReleaseLock,
      onCollabIsElementLocked,
    },
    ref
  ) => {
    // Track last scheduled requestAnimationFrame ID to cancel on unmount
    const rafIdRef = useRef(null);
    const shapeSettingsRef = useRef(shapeSettings);
    shapeSettingsRef.current = shapeSettings;
    const tapeSettingsRef = useRef(tapeSettings);
    tapeSettingsRef.current = tapeSettings;
    const rafIdsRef = useRef(new Set());
    const timeoutIdsRef = useRef(new Set());
    const safeRAF = useCallback((callback) => {
      const id = requestAnimationFrame(() => {
        rafIdsRef.current.delete(id);
        callback();
      });
      rafIdsRef.current.add(id);
      return id;
    }, []);
    // ✅ Helper: Safe timeout that tracks IDs
    const safeTimeout = useCallback((callback, delay) => {
      const id = setTimeout(() => {
        timeoutIdsRef.current.delete(id);
        callback();
      }, delay);
      timeoutIdsRef.current.add(id);
      return id;
    }, []);
    // Cleanup: cancel any pending RAF to prevent leaks when unmounting
    useEffect(() => {
      return () => {
        try {
          // Clear all tracked RAF IDs
          if (rafIdsRef.current) {
            rafIdsRef.current.forEach((id) => {
              try {
                cancelAnimationFrame(id);
              } catch { }
            });
            rafIdsRef.current.clear();
          }

          // Clear all tracked timeout IDs
          if (timeoutIdsRef.current) {
            timeoutIdsRef.current.forEach((id) => {
              try {
                clearTimeout(id);
              } catch { }
            });
            timeoutIdsRef.current.clear();
          }

          if (typeof rafIdRef.current === "number") {
            cancelAnimationFrame(rafIdRef.current);
          }
        } catch { }
        rafIdRef.current = null;
        // Reset transient refs to release memory
        rafScheduled.current = false;
        visualFlushRaf.current = false;
        lassoMoveRAF.current = false;
        selectionBoxRaf.current = false;
        liveRef.current = [];
      };
    }, []);

    const MAX_STROKE_POINTS = 2000;
    const MAX_LASSO_POINTS = 1000;

    const commitCurrentStroke = useCallback(() => {
      if (liveRef.current.length < 2) {
        liveRef.current = [];
        setCurrentPoints([]);
        return;
      }

      const w =
        {
          pen: strokeWidth,
          pencil: pencilWidth,
          brush: brushWidth,
          calligraphy: calligraphyWidth,
          highlighter: strokeWidth * 2,
          eraser: eraserSize,
        }[tool] ?? strokeWidth;

      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      const newStroke = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tool,
        color,
        width: w,
        points: [...liveRef.current],
        opacity:
          tool === "brush"
            ? brushOpacity
            : tool === "calligraphy"
              ? calligraphyOpacity
              : 1,
        ...toolConfig,
        layerId: activeLayerId,
        rotation: 0,
      };

      if (typeof onAddStroke === "function") {
        try {
          onAddStroke(newStroke);
        } catch (err) {
          console.warn("Error auto-committing stroke:", err);
        }
      }

      liveRef.current = [];
      setCurrentPoints([]);
    }, [
      tool,
      strokeWidth,
      pencilWidth,
      brushWidth,
      eraserSize,
      calligraphyWidth,
      color,
      brushOpacity,
      calligraphyOpacity,
      activeLayerId,
      configByTool,
      onAddStroke,
      setCurrentPoints,
    ]);

    // Helper: dynamic minimum distance squared for point sampling
    const getMinDistSq = useCallback(() => {
      try {
        const scale = zoomState?.scale?.value ?? 1;
        const basePx = 3; // base minimum step in pixels
        const effWidth =
          tool === "pencil"
            ? pencilWidth ?? strokeWidth ?? 1
            : tool === "brush"
              ? brushWidth ?? strokeWidth ?? 1
              : tool === "calligraphy"
                ? calligraphyWidth ?? strokeWidth ?? 1
                : tool === "eraser"
                  ? eraserSize ?? strokeWidth ?? 1
                  : strokeWidth ?? 1;
        // When zoomed out (scale < 1), increase min distance; when zoomed in, allow denser points
        const minDist = Math.max(
          2,
          basePx / Math.max(0.6, scale) + Math.min(6, effWidth * 0.15)
        );
        return minDist * minDist;
      } catch {
        return 9; // fallback
      }
    }, [
      zoomState,
      tool,
      pencilWidth,
      brushWidth,
      calligraphyWidth,
      eraserSize,
      strokeWidth,
    ]);
    const distPointToSegment = (px, py, x1, y1, x2, y2) => {
      const vx = x2 - x1;
      const vy = y2 - y1;
      const wx = px - x1;
      const wy = py - y1;
      const c1 = vx * wx + vy * wy;
      if (c1 <= 0) return Math.hypot(px - x1, py - y1);
      const c2 = vx * vx + vy * vy;
      if (c2 <= c1) return Math.hypot(px - x2, py - y2);
      const b = c1 / c2;
      const bx = x1 + b * vx;
      const by = y1 + b * vy;
      return Math.hypot(px - bx, py - by);
    };

    const distSegmentToSegment = (ax, ay, bx, by, cx, cy, dx, dy) => {
      // Compute closest distance between two segments AB and CD
      const EPS = 1e-6;
      const u = { x: bx - ax, y: by - ay };
      const v = { x: dx - cx, y: dy - cy };
      const w0 = { x: ax - cx, y: ay - cy };
      const a = u.x * u.x + u.y * u.y;
      const b = u.x * v.x + u.y * v.y;
      const c = v.x * v.x + v.y * v.y;
      const d = u.x * w0.x + u.y * w0.y;
      const e = v.x * w0.x + v.y * w0.y;
      let sc,
        sN,
        sD = a * c - b * b;
      let tc,
        tN,
        tD = sD;
      if (sD < EPS) {
        // lines almost parallel
        sN = 0.0;
        sD = 1.0;
        tN = e;
        tD = c;
      } else {
        sN = b * e - c * d;
        tN = a * e - b * d;
        if (sN < 0) {
          sN = 0;
          tN = e;
          tD = c;
        } else if (sN > sD) {
          sN = sD;
          tN = e + b;
          tD = c;
        }
      }
      if (tN < 0) {
        tN = 0;
        if (-d < 0) sN = 0;
        else if (-d > a) sN = sD;
        else {
          sN = -d;
          sD = a;
        }
      } else if (tN > tD) {
        tN = tD;
        if (-d + b < 0) sN = 0;
        else if (-d + b > a) sN = sD;
        else {
          sN = -d + b;
          sD = a;
        }
      }

      sc = Math.abs(sN) < EPS ? 0 : sN / sD;
      tc = Math.abs(tN) < EPS ? 0 : tN / tD;
      const dxp = w0.x + sc * u.x - tc * v.x;
      const dyp = w0.y + sc * u.y - tc * v.y;
      return Math.hypot(dxp, dyp);
    };

    const splitStrokeByEraser = (stroke, eraserPts, radius) => {
      const pts = Array.isArray(stroke.points) ? stroke.points : [];
      if (pts.length < 2 || !Array.isArray(eraserPts) || eraserPts.length < 2)
        return [stroke];

      // Thresh d�ng d? x�c d?nh m?t chunk "qu� ng?n" (s? b? lo?i)
      const minChunkLen = Math.max(6, (stroke.width || 6) * 0.6, radius * 0.6);

      // build eraser segments
      const eSegs = [];
      for (let j = 0; j < eraserPts.length - 1; j++) {
        const a = eraserPts[j],
          b = eraserPts[j + 1];
        eSegs.push([a.x, a.y, b.x, b.y]);
      }

      // helper: distance between two segments (already present in your file)
      const distSegmentToSegmentLocal = (ax, ay, bx, by, cx, cy, dx, dy) => {
        // same logic as your distSegmentToSegment in file (copying to keep scope local)
        const EPS = 1e-6;
        const u = { x: bx - ax, y: by - ay };
        const v = { x: dx - cx, y: dy - cy };
        const w0 = { x: ax - cx, y: ay - cy };
        const a = u.x * u.x + u.y * u.y;
        const b = u.x * v.x + u.y * v.y;
        const c = v.x * v.x + v.y * v.y;
        const d = u.x * w0.x + u.y * w0.y;
        const e = v.x * w0.x + v.y * w0.y;
        let sc,
          sN,
          sD = a * c - b * b;
        let tc,
          tN,
          tD = sD;
        if (sD < EPS) {
          // lines almost parallel
          sN = 0.0;
          sD = 1.0;
          tN = e;
          tD = c;
        } else {
          sN = b * e - c * d;
          tN = a * e - b * d;
          if (sN < 0) {
            sN = 0;
            tN = e;
            tD = c;
          } else if (sN > sD) {
            sN = sD;
            tN = e + b;
            tD = c;
          }
        }
        if (tN < 0) {
          tN = 0;
          if (-d < 0) sN = 0;
          else if (-d > a) sN = sD;
          else {
            sN = -d;
            sD = a;
          }
        } else if (tN > tD) {
          tN = tD;
          if (-d + b < 0) sN = 0;
          else if (-d + b > a) sN = sD;
          else {
            sN = -d + b;
            sD = a;
          }
        }

        sc = Math.abs(sN) < EPS ? 0 : sN / sD;
        tc = Math.abs(tN) < EPS ? 0 : tN / tD;
        const dxp = w0.x + sc * u.x - tc * v.x;
        const dyp = w0.y + sc * u.y - tc * v.y;
        return Math.hypot(dxp, dyp);
      };

      // determine which segment edges are "cut"
      const cutEdge = new Array(pts.length - 1).fill(false);

      // Pre-calculate eraser segment bounding boxes for faster intersection tests
      const eSegBounds = eSegs.map((seg) => ({
        minX: Math.min(seg[0], seg[2]) - radius,
        maxX: Math.max(seg[0], seg[2]) + radius,
        minY: Math.min(seg[1], seg[3]) - radius,
        maxY: Math.max(seg[1], seg[3]) + radius,
      }));

      const strokeHalfWidth = (stroke.width || 6) * 0.5;

      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i],
          p2 = pts[i + 1];
        const sMinX = Math.min(p1.x, p2.x) - strokeHalfWidth;
        const sMaxX = Math.max(p1.x, p2.x) + strokeHalfWidth;
        const sMinY = Math.min(p1.y, p2.y) - strokeHalfWidth;
        const sMaxY = Math.max(p1.y, p2.y) + strokeHalfWidth;

        for (let s = 0; s < eSegs.length; s++) {
          const eb = eSegBounds[s];
          // Quick bounding box overlap check
          if (
            sMaxX < eb.minX ||
            sMinX > eb.maxX ||
            sMaxY < eb.minY ||
            sMinY > eb.maxY
          ) {
            continue;
          }

          const d = distSegmentToSegmentLocal(
            p1.x,
            p1.y,
            p2.x,
            p2.y,
            eSegs[s][0],
            eSegs[s][1],
            eSegs[s][2],
            eSegs[s][3]
          );
          if (d <= radius + strokeHalfWidth) {
            cutEdge[i] = true;
            break;
          }
        }
      }

      if (!cutEdge.some(Boolean)) return [stroke];

      // build split indices (positions in pts array where we cut)
      const splits = [0];
      for (let i = 0; i < cutEdge.length; i++) {
        if (cutEdge[i]) splits.push(i + 1);
      }
      splits.push(pts.length);

      // generate chunks; filter out tiny chunks by total polyline length
      const chunks = [];
      for (let k = 0; k < splits.length - 1; k++) {
        const start = splits[k];
        const end = splits[k + 1]; // exclusive
        const chunk = pts.slice(start, end);
        if (chunk.length < 2) continue;

        // compute polyline length
        let len = 0;
        for (let m = 0; m < chunk.length - 1; m++) {
          const a = chunk[m],
            b = chunk[m + 1];
          len += Math.hypot(b.x - a.x, b.y - a.y);
        }
        if (len >= minChunkLen) {
          chunks.push(chunk);
        }
      }

      // If no significant chunk left, treat as fully erased
      if (chunks.length === 0) return [];

      // Map chunks to new stroke objects (preserve important props)
      const out = chunks.map((chunk) => ({
        ...stroke,
        id: `${stroke.id}_part_${Math.random().toString(36).slice(2)}`,
        points: chunk,
      }));

      return out;
    };

    const liveRef = useRef([]);
    const rafScheduled = useRef(false);
    const lastEraserPointRef = useRef(null);
    const [selectedBox, setSelectedBox] = useState(selectedBoxProp);
    const [selectedId, setSelectedId] = useState(selectedIdProp);
    const [editorVisible, setEditorVisible] = useState(false);

    // Sync with props from parent
    useEffect(() => {
      setSelectedId(selectedIdProp);
    }, [selectedIdProp]);

    useEffect(() => {
      setSelectedBox(selectedBoxProp);
    }, [selectedBoxProp]);

    const [editorProps, setEditorProps] = useState({
      x: 0,
      y: 0,
      tool: "text",
      data: {},
    });

    const [draggingText, setDraggingText] = useState(null);
    const [tempStrokeId, setTempStrokeId] = useState(null);

    useEffect(() => {
      if (typeof selectedIdProp === "string" && selectedIdProp !== selectedId) {
        setSelectedId(selectedIdProp);
      }
    }, [selectedIdProp]);
    const getActiveStrokes = useCallback(() => {
      // Validate strokes is array before filtering
      if (!Array.isArray(strokes)) return [];
      return strokes.filter(
        (s) =>
          s &&
          (!activeLayerId || s.layerId === activeLayerId) &&
          (s.visible ?? true)
      );
    }, [strokes, activeLayerId]);

    const [lassoPoints, setLassoPoints] = useState([]);
    const [lassoSelection, setLassoSelection] = useState([]);
    const [isMovingLasso, setIsMovingLasso] = useState(false);
    const [isCommittingMove, setIsCommittingMove] = useState(false);
    const [lassoOrigin, setLassoOrigin] = useState(null);
    const [lassoMoveStart, setLassoMoveStart] = useState(null);
    const [lassoCumulativeOffset, setLassoCumulativeOffset] = useState({
      dx: 0,
      dy: 0,
    });
    const lassoMoveRAF = useRef(false);
    const lassoPendingDelta = useRef({ dx: 0, dy: 0 });
    const [lassoBaseBox, setLassoBaseBox] = useState(null);
    const [lassoVisualOffset, setLassoVisualOffset] = useState({
      dx: 0,
      dy: 0,
    });
    const [visualOffsets, setVisualOffsets] = useState({});
    // --- Batching helpers for visual offsets (cheap, updated via RAF) ---
    const visualOffsetsRef = useRef({}); // single source-of-truth for transient offsets (no rerenders)
    const visualFlushRaf = useRef(false); // ensure one RAF flush at a time
    const lassoDragDelta = useRef({ dx: 0, dy: 0 });
    const lassoBaseAtReleaseRef = useRef(null);

    const dragOriginRef = useRef(null); // base x/y when starting to drag a text-like stroke
    const selectionBoxRaf = useRef(false);
    const lastDragPosRef = useRef({ x: 0, y: 0 });
    const boxOriginRef = useRef(null); // snapshot of selection box at drag start
    const textPaddingRef = useRef(0);
    const textFontSizeRef = useRef(18);
    const textResizeRef = useRef(null);

    const approxTextWidthLocal = (t = "", fs = 18) =>
      (t?.length || 0) * (fs || 18) * 0.6;

    // Mirror zoom shared values into React state to avoid reading .value in render
    const [zoomMirror, setZoomMirror] = useState({ scale: 1, x: 0, y: 0 });
    useAnimatedReaction(
      () => ({
        s: zoomState?.scale?.value ?? 1,
        x: zoomState?.translateX?.value ?? 0,
        y: zoomState?.translateY?.value ?? 0,
      }),
      (vals) => {
        runOnJS(setZoomMirror)({ scale: vals.s, x: vals.x, y: vals.y });
      }
    );

    useEffect(() => {
      if (
        !editorVisible &&
        !selectedId &&
        typeof setRealtimeText === "function"
      ) {
        requestAnimationFrame(() => setRealtimeText(null));
      }
    }, [editorVisible, selectedId]);

    const selectedStroke = useMemo(
      () =>
        Array.isArray(strokes)
          ? strokes.find((s) => s?.id === selectedId)
          : null,
      [strokes, selectedId]
    );

    const handleMoveCommit = useCallback(
      (dx, dy) => {
        if (dx === 0 && dy === 0) return;

        const sel = strokes.filter(
          (s) =>
            lassoSelection.includes(s.id) &&
            (!activeLayerId || s.layerId === activeLayerId)
        );

        if (!sel.length) return;

        const updates = sel
          .map((s) => {
            if (!s || !s.id) return null;

            // For image/sticker/table, update x/y directly
            if (
              s.tool === "image" ||
              s.tool === "sticker" ||
              s.tool === "table"
            ) {
              return {
                id: s.id,
                changes: {
                  x: (s.x ?? 0) + dx,
                  y: (s.y ?? 0) + dy,
                },
              };
            }

            // For shapes with shape property
            if (s.shape) {
              const newShape = { ...s.shape };

              // Update shape coordinates based on shape type
              if (newShape.x !== undefined) newShape.x += dx;
              if (newShape.y !== undefined) newShape.y += dy;
              if (newShape.x1 !== undefined) newShape.x1 += dx;
              if (newShape.y1 !== undefined) newShape.y1 += dy;
              if (newShape.x2 !== undefined) newShape.x2 += dx;
              if (newShape.y2 !== undefined) newShape.y2 += dy;
              if (newShape.x3 !== undefined) newShape.x3 += dx;
              if (newShape.y3 !== undefined) newShape.y3 += dy;
              if (newShape.cx !== undefined) newShape.cx += dx;
              if (newShape.cy !== undefined) newShape.cy += dy;
              if (newShape.points) {
                newShape.points = newShape.points.map((p) => ({
                  ...p,
                  x: (p.x ?? 0) + dx,
                  y: (p.y ?? 0) + dy,
                }));
              }

              return {
                id: s.id,
                changes: { shape: newShape },
              };
            }

            // For strokes with points
            if (s.points && Array.isArray(s.points)) {
              const newPoints = s.points.map((p) => ({
                ...p,
                x: (p.x ?? 0) + dx,
                y: (p.y ?? 0) + dy,
              }));
              return {
                id: s.id,
                changes: { points: newPoints },
              };
            }

            // For text/sticky/comment with x/y
            if (typeof s.x === "number" || typeof s.y === "number") {
              return {
                id: s.id,
                changes: {
                  x: (s.x ?? 0) + dx,
                  y: (s.y ?? 0) + dy,
                },
              };
            }

            return null;
          })
          .filter(Boolean);

        if (updates.length) {
          // ✅ Apply updates synchronously
          onModifyStrokesBulk?.(updates);

          // 🔄 REALTIME COLLABORATION: Send updates to other users
          if (
            collabEnabled &&
            collabConnected &&
            typeof onCollabElementUpdate === "function"
          ) {
            updates.forEach((update) => {
              onCollabElementUpdate(pageId, update.id, update.changes, {
                transient: false,
              });
            });
          }
        }
      },
      [
        strokes,
        lassoSelection,
        activeLayerId,
        onModifyStrokesBulk,
        collabEnabled,
        collabConnected,
        onCollabElementUpdate,
        pageId,
      ]
    );

    // Ref to hold the latest handleMoveCommit function to avoid stale closures in gesture handlers.
    const handleMoveCommitRef = useRef(handleMoveCommit);
    useEffect(() => {
      handleMoveCommitRef.current = handleMoveCommit;
    }, [handleMoveCommit]);

    useEffect(() => {
      if (isCommittingMove) {
        // Use a small delay to ensure strokes state has updated
        const timeoutId = setTimeout(() => {
          setLassoVisualOffset({ dx: 0, dy: 0 });
          setVisualOffsets({});
          lassoDragDelta.current = { dx: 0, dy: 0 };

          // ✅ FIX: Clear lasso state in table/image refs to prevent snap-back
          if (Array.isArray(lassoSelection)) {
            lassoSelection.forEach((id) => {
              const ref = imageRefs?.current?.get(id);
              if (ref && typeof ref.clearLassoState === "function") {
                ref.clearLassoState();
              }
            });
          }

          setIsCommittingMove(false);
        }, 50); // Small delay to allow React state to settle

        return () => clearTimeout(timeoutId);
      }
    }, [isCommittingMove, lassoSelection, imageRefs]);

    useEffect(() => {
      if (
        selectedStroke &&
        ["image", "sticker", "table"].includes(selectedStroke.tool)
      ) {
        setSelectedBox({
          x: selectedStroke.x ?? 0,
          y: selectedStroke.y ?? 0,
          width: selectedStroke.width ?? 100,
          height: selectedStroke.height ?? 100,
          rotation: selectedStroke.rotation ?? 0,
        });
      } else {
        // If no stroke is selected, or it's not a selectable object, clear the box.
        setSelectedBox(null);
      }
    }, [selectedStroke]);
    const liveTransformRef = useRef({
      dx: 0,
      dy: 0,
      dw: 0,
      dh: 0,
      drot: 0,
      origin: null,
    });

    // Nếu bạn có prop onLiveUpdateStroke (từ CanvasContainer), nó sẽ được gọi nhiều lần để update live (Skia).
    // Nếu không có, chúng ta vẫn dùng liveTransformRef để accumulate và commit on end.
    // Khi selectedStroke thay đổi (chọn 1 image mới) -> reset origin
    useEffect(() => {
      if (
        selectedStroke &&
        (selectedStroke.tool === "image" || selectedStroke.tool === "sticker")
      ) {
        liveTransformRef.current.origin = {
          x: selectedStroke.x ?? 0,
          y: selectedStroke.y ?? 0,
          width: selectedStroke.width ?? 0,
          height: selectedStroke.height ?? 0,
          rotation: selectedStroke.rotation ?? 0,
        };
        liveTransformRef.current.dx = 0;
        liveTransformRef.current.dy = 0;
        liveTransformRef.current.dw = 0;
        liveTransformRef.current.dh = 0;
        liveTransformRef.current.drot = 0;
      } else {
        liveTransformRef.current.origin = null;
      }
    }, [selectedStroke?.id]);
    const handleTextChange = useCallback(
      (data) => {
        if (!selectedId || !Array.isArray(strokes)) return;

        const index = strokes.findIndex((s) => s.id === selectedId);
        if (index === -1) return;

        const currentStroke = strokes[index];
        if (!currentStroke) return;

        const hasChanged =
          currentStroke.text !== data.text ||
          currentStroke.bold !== data.bold ||
          currentStroke.italic !== data.italic ||
          currentStroke.underline !== data.underline ||
          currentStroke.align !== data.align ||
          currentStroke.color !== data.color ||
          currentStroke.fontSize !== data.fontSize ||
          currentStroke.fontFamily !== data.fontFamily;

        if (hasChanged && typeof onModifyStroke === "function") {
          onModifyStroke(index, {
            text: data.text,
            bold: data.bold,
            italic: data.italic,
            underline: data.underline,
            align: data.align,
            color: data.color,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily,
          });
        }

        if (
          typeof setRealtimeText === "function" &&
          typeof data.text === "string"
        ) {
          setRealtimeText({
            id: selectedId,
            ...data,
            x: Number.isFinite(editorProps.x) ? editorProps.x : 0,
            y: Number.isFinite(editorProps.y) ? editorProps.y : 0,
          });
        }
      },
      [
        selectedId,
        strokes,
        onModifyStroke,
        setRealtimeText,
        editorProps.x,
        editorProps.y,
      ]
    );

    const hitTestText = (x, y, strokesOrLayers) => {
      let strokes = [];

      if (Array.isArray(strokesOrLayers)) {
        if (strokesOrLayers.length && strokesOrLayers[0]?.strokes) {
          strokes = strokesOrLayers
            .filter((l) => l.visible !== false)
            .flatMap((l) => l.strokes || []);
        } else {
          strokes = strokesOrLayers;
        }
      }

      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i];
        if (!s) continue;

        if (["text", "sticky", "comment", "emoji"].includes(s.tool)) {
          const fontSize = s.fontSize || 18;
          const padding = s.padding || 4;
          const margin = 2;
          const w = (s.text?.length || 1) * fontSize * 0.6 + padding * 2;
          const h = fontSize + padding * 2;

          let left = s.x - padding - margin;
          let right = s.x - padding + w + margin;
          let top, bottom;

          if (s.tool === "emoji") {
            top = s.y - h / 2 - margin;
            bottom = s.y + h / 2 + margin;
          } else {
            top = s.y - h - margin;
            bottom = s.y + margin;
          }

          if (x >= left && x <= right && y >= top && y <= bottom) {
            return s;
          }
        }
      }

      return null;
    };

    const rotatePoint = (px, py, cx, cy, angleDeg) => {
      const a = (angleDeg * Math.PI) / 180;
      const s = Math.sin(-a);
      const c = Math.cos(-a);
      const dx = px - cx;
      const dy = py - cy;
      const rx = dx * c - dy * s;
      const ry = dx * s + dy * c;
      return { x: rx + cx, y: ry + cy };
    };

    const hitTestImage = (x, y, strokesOrLayers) => {
      let strokes = [];

      if (Array.isArray(strokesOrLayers)) {
        if (strokesOrLayers.length && strokesOrLayers[0]?.strokes) {
          strokes = strokesOrLayers
            .filter((l) => l.visible !== false)
            .flatMap((l) => l.strokes || []);
        } else {
          strokes = strokesOrLayers;
        }
      }

      const margin = 5;

      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i];
        if (!s) continue;

        // Check table
        if (s.tool === "table") {
          const sx = s.x ?? 0;
          const sy = s.y ?? 0;
          const w = s.width ?? 0;
          const h = s.height ?? 0;
          const rot = s.rotation ?? 0;

          if (!rot || Math.abs(rot) < 0.01) {
            if (
              x >= sx - margin &&
              x <= sx + w + margin &&
              y >= sy - margin &&
              y <= sy + h + margin
            ) {
              return s;
            }
          } else {
            const cx = sx + w / 2;
            const cy = sy + h / 2;
            const rel = rotatePoint(x, y, cx, cy, -rot);
            if (
              rel.x >= sx - margin &&
              rel.x <= sx + w + margin &&
              rel.y >= sy - margin &&
              rel.y <= sy + h + margin
            ) {
              return s;
            }
          }
        }

        // Check image/sticker
        if (["image", "sticker"].includes(s.tool)) {
          const sx = s.x ?? 0;
          const sy = s.y ?? 0;
          const w = s.width ?? 0;
          const h = s.height ?? 0;
          const rot = s.rotation ?? 0;

          if (!rot || Math.abs(rot) < 0.01) {
            if (
              x >= sx - margin &&
              x <= sx + w + margin &&
              y >= sy - margin &&
              y <= sy + h + margin
            ) {
              return s;
            }
          } else {
            const cx = sx + w / 2;
            const cy = sy + h / 2;
            const rel = rotatePoint(x, y, cx, cy, -rot);
            if (
              rel.x >= sx - margin &&
              rel.x <= sx + w + margin &&
              rel.y >= sy - margin &&
              rel.y <= sy + h + margin
            ) {
              return s;
            }
          }
        }
      }

      return null;
    };

    const getPointerType = (e) => e?.nativeEvent?.pointerType || "touch";
    const isPenEvent = (e) => ["pen", "stylus"].includes(getPointerType(e));
    const isTouchEvent = (e) => getPointerType(e) === "touch";
    const modifyStroke = (index, changes) => {
      if (typeof onModifyStroke === "function") onModifyStroke(index, changes);
    };

    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(300)
      .maxDistance(15)
      .runOnJS(true)
      .onStart((e) => {
        if (tool === "scroll" || tool === "zoom") return;
        const validStrokes = getActiveStrokes?.() || [];
        const hit = hitTestText(e.x, e.y, validStrokes);
        if (!hit) return;

        if (hit.tool === "emoji") {
          runOnJS(setSelectedId)(hit.id);
          if (typeof onSelectStroke === "function")
            runOnJS(onSelectStroke)(hit.id);

          const box = {
            x: hit.x - (hit.padding || 0) - 1,
            y: hit.y - (hit.fontSize || 18) / 2 - (hit.padding || 0) - 1,
            width:
              (hit.text?.length || 1) * (hit.fontSize || 18) * 0.6 +
              (hit.padding || 0) * 2 +
              2,
            height: (hit.fontSize || 18) + (hit.padding || 0) * 2 + 2,
          };
          runOnJS(setSelectedBox)(box);
          return;
        }

        if (hit.tool === "text") {
          runOnJS(setSelectedId)(hit.id);
          if (typeof onSelectStroke === "function")
            runOnJS(onSelectStroke)(hit.id);
          runOnJS(setSelectedBox)(null);

          if (typeof setRealtimeText === "function") {
            runOnJS(setRealtimeText)({ id: hit.id, ...hit });
          }

          runOnJS(setEditorProps)({
            x: hit.x,
            y: hit.y,
            tool: hit.tool,
            data: hit,
          });
          runOnJS(setEditorVisible)(true);
        }

        if (tool === "lasso") {
          let px = e.x;
          let py = e.y;

          // Nếu đang có selection và touch trong box -> chuẩn bị move
          if (lassoSelection.length > 0 && lassoBox) {
            const boxX = (lassoBox.x || 0) - (page?.x || 0);
            const boxY = (lassoBox.y || 0) - (page?.y || 0);
            const isInsideBox =
              px >= boxX &&
              px <= boxX + lassoBox.width &&
              py >= boxY &&
              py <= boxY + lassoBox.height;

            if (isInsideBox) {
              // Touch inside selection box - sẽ được handle bởi LassoSelectionBox
              return;
            } else {
              // Touch ngoài box -> clear selection và bắt đầu lasso mới
              setLassoSelection([]);
              setLassoBaseBox(null);
              setLassoVisualOffset({ dx: 0, dy: 0 });
            }
          }

          // Bắt đầu vẽ lasso path mới
          if (isInsidePage(px, py, page)) {
            setLassoPoints([{ x: px, y: py }]);
          }
          return; // ← QUAN TRỌNG: return sớm, không chạy code vẽ stroke bên dưới
        }
      });

    const tap = Gesture.Tap()
      .runOnJS(true)
      .onStart((e) => {
        if (tool === "scroll" || tool === "zoom") return;
        // Nếu đang dùng các tool vẽ tự do, tạo chấm ngay tại vị trí tap
        const isFreehandTool = [
          "pen",
          "pencil",
          "brush",
          "calligraphy",
          "highlighter",
          "marker",
          "airbrush",
          "crayon",
        ].includes(tool);
        if (isFreehandTool && isInsidePage(e.x, e.y, page)) {
          const w =
            {
              pen: strokeWidth,
              pencil: pencilWidth,
              brush: brushWidth,
              calligraphy: calligraphyWidth,
              highlighter: strokeWidth * 2,
              eraser: eraserSize,
            }[tool] ?? strokeWidth;

          const toolConfig = configByTool[tool] || {
            pressure: 0.5,
            thickness: 1,
            stabilization: 0.2,
          };

          const newStroke = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            tool,
            color,
            width: w,
            points: [{ x: e.x, y: e.y }],
            opacity:
              tool === "brush"
                ? brushOpacity
                : tool === "calligraphy"
                  ? calligraphyOpacity
                  : 1,
            ...toolConfig,
            layerId: activeLayerId,
            rotation: 0,
          };

          try {
            onAddStroke?.(newStroke);
          } catch (err) {
            console.warn("Error adding dot stroke:", err);
          }
          return;
        }

        // 🎨 Eyedropper tool - pick color from stroke
        if (tool === "eyedropper") {
          // Try to find a stroke at tap position across ALL visible strokes
          const visible = Array.isArray(allVisibleStrokes)
            ? allVisibleStrokes.filter((s) => s?.visible !== false)
            : strokes;
          const hit =
            hitTestText(e.x, e.y, visible) || hitTestImage(e.x, e.y, visible);
          if (hit && hit.color) {
            // Set màu và lưu vào picked colors
            setColor?.(hit.color);
            onColorPicked?.(hit.color);
          } else {
            // Check other strokes (shapes, lines, etc.)
            const activeStrokes = visible;
            for (let i = activeStrokes.length - 1; i >= 0; i--) {
              const s = activeStrokes[i];
              if (!s.points) continue;

              // Kiểm tra xem có phải shape với fill không
              const isShape =
                s.tool &&
                [
                  "rect",
                  "rectangle",
                  "circle",
                  "triangle",
                  "star",
                  "polygon",
                ].includes(s.tool);
              const hasFill = s.fill && s.fillColor;

              if (isShape && hasFill) {
                // Kiểm tra xem tap có nằm trong shape không
                const bbox = getBoundingBoxForStroke(s);
                if (
                  bbox &&
                  e.x >= bbox.minX &&
                  e.x <= bbox.maxX &&
                  e.y >= bbox.minY &&
                  e.y <= bbox.maxY
                ) {
                  // Nằm trong bounding box, kiểm tra chi tiết hơn
                  let isInside = false;

                  if (s.tool === "circle") {
                    // Kiểm tra trong hình tròn
                    const centerX = (bbox.minX + bbox.maxX) / 2;
                    const centerY = (bbox.minY + bbox.maxY) / 2;
                    const radiusX = (bbox.maxX - bbox.minX) / 2;
                    const radiusY = (bbox.maxY - bbox.minY) / 2;
                    const dx = (e.x - centerX) / radiusX;
                    const dy = (e.y - centerY) / radiusY;
                    isInside = dx * dx + dy * dy <= 1;
                  } else if (s.tool === "rect" || s.tool === "rectangle") {
                    // Rectangle luôn trong bbox
                    isInside = true;
                  } else if (
                    s.tool === "triangle" ||
                    s.tool === "star" ||
                    s.tool === "polygon"
                  ) {
                    // Dùng pointInPolygon
                    const pts = s.points || s.shape?.points;
                    isInside = pointInPolygon(pts, e.x, e.y);
                  }

                  if (isInside) {
                    // Tap vào bên trong shape có fill → lấy fillColor
                    setColor?.(s.fillColor);
                    onColorPicked?.(s.fillColor);
                    return;
                  }
                }
              }

              // Kiểm tra gần viền (cho cả shape và stroke thường)
              if (s.color) {
                const isNear = s.points.some((p) => {
                  const dx = p.x - e.x;
                  const dy = p.y - e.y;
                  return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 10;
                });
                if (isNear) {
                  // Gần viền → lấy màu viền
                  setColor?.(s.color);
                  onColorPicked?.(s.color);
                  return;
                }
              }
            }
          }
          return;
        }

        // 🧩 Nếu tap ra ngoài và đang có lasso selection → hủy chọn
        if (lassoSelection.length > 0) {
          // Commit pending moves before deselecting
          if (
            (lassoCumulativeOffset.dx !== 0 ||
              lassoCumulativeOffset.dy !== 0) &&
            !isMovingLasso
          ) {
            handleMoveCommitRef.current(
              lassoCumulativeOffset.dx,
              lassoCumulativeOffset.dy
            );
          }
          setLassoSelection([]);
          setLassoPoints([]);
          setLassoCumulativeOffset({ dx: 0, dy: 0 });
          setLassoVisualOffset({ dx: 0, dy: 0 });
          return;
        }

        // 🖼️ Check if tapping on an image/table - should always show transform box
        const hitImage = hitTestImage(e.x, e.y, strokes);
        if (hitImage) {
          const newBox = {
            x: hitImage.x ?? 0,
            y: hitImage.y ?? 0,
            width: hitImage.width ?? 100,
            height: hitImage.height ?? 100,
            rotation: hitImage.rotation ?? 0,
          };
          setSelectedId(hitImage.id);
          setSelectedBox(newBox);
          onSelectStroke?.(hitImage.id);
          setEditorVisible(false);
          return;
        }

        // 📝 Check if tapping on text
        const hit = hitTestText(e.x, e.y, strokes);
        if (!hit) {
          // ✅ Tap on empty canvas: immediately clear selection
          setSelectedId(null);
          setSelectedBox(null);
          onSelectStroke?.(null);
          setRealtimeText(null);
          setEditorVisible(false);

          // If tool is text/sticky/comment, open editor on empty tap
          if (["text", "sticky", "comment"].includes(tool)) {
            const tempId = `${Date.now()}_${Math.random()
              .toString(36)
              .slice(2)}`;
            setTempStrokeId(tempId);
            if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
            if (typeof setRealtimeText === "function") {
              setRealtimeText({
                id: tempId,
                tool,
                x: e.x,
                y: e.y,
                text: "",
                fontSize: tool === "sticky" ? 16 : tool === "comment" ? 14 : 18,
                color,
                backgroundColor:
                  tool === "sticky"
                    ? "#FFEB3B"
                    : tool === "comment"
                      ? "#E3F2FD"
                      : "transparent",
                padding: tool === "sticky" || tool === "comment" ? 8 : 0,
                layerId: activeLayerId,
              });
            }
            setEditorProps({
              x: e.x,
              y: e.y,
              tool,
              data: { id: tempId, tool },
            });
            setEditorVisible(true);
          }
          return;
        }

        // Hit text: handle text selection
        if (hit.tool === "emoji") {
          setSelectedId(hit.id);
          setSelectedBox({
            x: hit.x - (hit.padding || 0) - 1,
            y: hit.y - (hit.fontSize || 18) / 2 - (hit.padding || 0) - 1,
            width:
              (hit.text?.length || 1) * (hit.fontSize || 18) * 0.6 +
              (hit.padding || 0) * 2 +
              2,
            height: (hit.fontSize || 18) + (hit.padding || 0) * 2 + 2,
          });
          setEditorVisible(false);
          return;
        }

        if (["text", "sticky", "comment"].includes(tool)) {
          if (hit) {
            if (typeof setRealtimeText === "function")
              setRealtimeText({ id: hit.id, ...hit });

            const w =
              (hit.text?.length || 1) * (hit.fontSize || 18) * 0.6 +
              (hit.padding || 0) * 2;
            const h = (hit.fontSize || 18) + (hit.padding || 0) * 2;
            setSelectedBox({
              x: hit.x - (hit.padding || 0) - 1,
              y: hit.y - (hit.fontSize || 18) - (hit.padding || 0) - 1,
              width: w + 2,
              height: h + 2,
            });
            setSelectedId(hit.id);
            setDraggingText({
              id: hit.id,
              offsetX: e.x - hit.x,
              offsetY: e.y - hit.y,
              startX: e.x,
              startY: e.y,
            });
            return;
          }
        }

        // No match: clear selection
        setSelectedId(null);
        setSelectedBox(null);
      });

    const pan = Gesture.Pan()
      .averageTouches(false) // ✅ Disable averaging for precision
      .minDistance(1)
      .minPointers(1)
      .maxPointers(1) // ✅ Only accept single finger - two-finger gestures handled by MultiPageCanvas
      .shouldCancelWhenOutside(false) // ✅ Prevent accidental cancellation
      .runOnJS(true)
      .onStart((e) => {
        // ✅ Early return cho scroll và zoom tools - không vẽ gì cả
        if (tool === "scroll" || tool === "zoom") {
          return;
        }

        // local copy of pointer coords — avoid mutating event directly
        let px = e.x;
        let py = e.y;
        const pressure = e.pressure ?? 0.5;

        // 🎨 Eyedropper tool - pick color from stroke (trong pan gesture)
        if (tool === "eyedropper") {
          const visible = Array.isArray(allVisibleStrokes)
            ? allVisibleStrokes.filter((s) => s?.visible !== false)
            : strokes;
          const hit =
            hitTestText(px, py, visible) || hitTestImage(px, py, visible);
          if (hit && hit.color) {
            setColor?.(hit.color);
            onColorPicked?.(hit.color);
          } else {
            const activeStrokes = visible;
            for (let i = activeStrokes.length - 1; i >= 0; i--) {
              const s = activeStrokes[i];
              if (!s.points) continue;

              const isShape =
                s.tool &&
                ["rectangle", "circle", "triangle", "star", "polygon"].includes(
                  s.tool
                );
              const hasFill = s.fill && s.fillColor;

              if (isShape && hasFill) {
                const bbox = getBoundingBoxForStroke(s);
                if (
                  bbox &&
                  px >= bbox.minX &&
                  px <= bbox.maxX &&
                  py >= bbox.minY &&
                  py <= bbox.maxY
                ) {
                  let isInside = false;

                  if (s.tool === "circle") {
                    const centerX = (bbox.minX + bbox.maxX) / 2;
                    const centerY = (bbox.minY + bbox.maxY) / 2;
                    const radiusX = (bbox.maxX - bbox.minX) / 2;
                    const radiusY = (bbox.maxY - bbox.minY) / 2;
                    const dx = (px - centerX) / radiusX;
                    const dy = (py - centerY) / radiusY;
                    isInside = dx * dx + dy * dy <= 1;
                  } else if (s.tool === "rectangle") {
                    isInside = true;
                  } else if (
                    s.tool === "triangle" ||
                    s.tool === "star" ||
                    s.tool === "polygon"
                  ) {
                    isInside = pointInPolygon(px, py, s.points);
                  }

                  if (isInside) {
                    setColor?.(s.fillColor);
                    onColorPicked?.(s.fillColor);
                    return;
                  }
                }
              }

              if (s.color) {
                const isNear =
                  Array.isArray(s.points) &&
                  s.points.some((p) => {
                    const dx = p.x - px;
                    const dy = p.y - py;
                    return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 10;
                  });
                if (isNear) {
                  setColor?.(s.color);
                  onColorPicked?.(s.color);
                  return;
                }
              }
            }
          }
          return;
        }

        // tiếp tục các kiểm tra ban đầu khác (tool loại trừ, page bounds, lasso start...)
        if (["image", "sticker", "camera", "table"].includes(tool)) return;
        if (!isInsidePage(px, py, page)) return;

        // LASSO logic (giữ như cũ)...
        if (tool === "lasso" && lassoSelection.length > 0) {
          const hit = lassoOrigin?.some((stInfo) => {
            const s = strokes.find((st) => st.id === stInfo.id);
            if (!s) return false;
            const bbox = getBoundingBoxForStroke(s);
            if (!bbox) return false;
            return (
              px >= bbox.minX - 10 &&
              px <= bbox.maxX + 10 &&
              py >= bbox.minY - 10 &&
              py <= bbox.maxY + 10
            );
          });
          if (hit) {
            setIsMovingLasso(true);
            setLassoMoveStart({ x: px, y: py });
            return;
          } else {
            setLassoSelection([]);
            setLassoPoints([{ x: px, y: py }]);
            setIsMovingLasso(false);
            setCurrentPoints([]);
            return;
          }
        }

        if (tool === "lasso") {
          setLassoPoints([{ x: px, y: py }]);
          setLassoSelection([]);
          setIsMovingLasso(false);
          setCurrentPoints([]);
          return;
        }

        // Các logic text/drag init (giữ nguyên) - nhưng dùng px/py thay vì e.x/e.y
        const validStrokes = Array.isArray(strokes)
          ? strokes.filter(
            (s) => s && s.layerId === activeLayerId && (s.visible ?? true)
          )
          : [];
        if (selectedId && draggingText) {
          const base = strokes.find((s) => s.id === selectedId);
          if (base) dragOriginRef.current = { x: base.x ?? 0, y: base.y ?? 0 };
          setDraggingText((d) => (d ? { ...d, startX: px, startY: py } : d));
          boxOriginRef.current = selectedBox
            ? {
              x: selectedBox.x,
              y: selectedBox.y,
              width: selectedBox.width,
              height: selectedBox.height,
            }
            : null;
          textPaddingRef.current = base?.padding || 0;
          textFontSizeRef.current = base?.fontSize || 18;
        }

        // finally compute push condition and push initial live point if appropriate
        if (
          ![
            "pen",
            "pencil",
            "brush",
            "calligraphy",
            "highlighter",
            "marker",
            "airbrush",
            "crayon",
            "eraser",
            "line",
            "arrow",
            "rect",
            "circle",
            "triangle",
            "star",
            "polygon",
            "fill",
            "shape",
            "tape",
          ].includes(tool)
        )
          return;

        const last = liveRef.current.at(-1) || { x: 0, y: 0 };
        const dx = px - last.x;
        const dy = py - last.y;
        if (dx * dx + dy * dy < getMinDistSq()) return;

        const toolConfig = configByTool[tool] || {
          pressure: 0.5,
          thickness: 1,
          stabilization: 0.2,
        };

        const initialPoint = {
          x: px,
          y: py,
          pressure: toolConfig.pressure,
          thickness: toolConfig.thickness,
          stabilization: toolConfig.stabilization,
        };
        liveRef.current.push(initialPoint);

        if (!rafScheduled.current) {
          rafScheduled.current = true;
          safeRAF(() => {
            rafScheduled.current = false;
            setCurrentPoints([...liveRef.current]);
          });
        }
      })

      .onUpdate((e) => {
        // Early guards
        if (
          [
            "image",
            "sticker",
            "camera",
            "eyedropper",
            "table",
            "scroll",
            "zoom",
          ].includes(tool)
        )
          return;
        if (!isInsidePage(e.x, e.y, page)) return;

        // If moving lasso selection
        if (tool === "lasso" && isMovingLasso && lassoOrigin) {
          const dx = e.x - lassoMoveStart.x;
          const dy = e.y - lassoMoveStart.y;
          const totalDx = lassoCumulativeOffset.dx + dx;
          const totalDy = lassoCumulativeOffset.dy + dy;

          setLassoVisualOffset({ dx: totalDx, dy: totalDy });
          setVisualOffsets(() => {
            const next = {};
            lassoSelection.forEach((id) => {
              next[id] = { dx: totalDx, dy: totalDy };
            });
            return next;
          });
          return;
        }

        // --- Nếu đang vẽ vùng lasso mới ---
        if (tool === "lasso" && !isMovingLasso) {
          setLassoPoints((prev) => {
            if (prev.length >= MAX_LASSO_POINTS) return prev;
            return [...prev, { x: e.x, y: e.y }];
          });
          return;
        }

        // Các xử lý khác giữ nguyên (text dragging, eraser, normal drawing...)
        const validStrokes = Array.isArray(strokes)
          ? strokes.filter(
            (s) => s && s.layerId === activeLayerId && (s.visible ?? true)
          )
          : [];

        // Text dragging (live visual + commit updates)
        if (selectedId && draggingText) {
          const newX = e.x - draggingText.offsetX;
          const newY = e.y - draggingText.offsetY;
          const globalIndex = strokes.findIndex((s) => s.id === selectedId);

          if (globalIndex !== -1 && typeof onModifyStroke === "function")
            modifyStroke(globalIndex, { x: newX, y: newY });

          setSelectedBox((box) =>
            box
              ? {
                ...box,
                x:
                  newX -
                  (validStrokes.find((s) => s.id === selectedId)?.padding ||
                    0) -
                  1,
                y:
                  newY -
                  (validStrokes.find((s) => s.id === selectedId)?.fontSize ||
                    18) -
                  (validStrokes.find((s) => s.id === selectedId)?.padding ||
                    0) -
                  1,
              }
              : box
          );

          setEditorProps((prev) => ({ ...prev, x: newX, y: newY }));

          if (typeof setRealtimeText === "function") {
            const s = validStrokes.find((st) => st.id === selectedId);
            if (s) {
              setRealtimeText({
                id: s.id,
                tool: s.tool,
                text: s.text || "",
                color: s.color || "#000",
                x: newX,
                y: newY,
                fontSize: s.fontSize || 16,
                fontFamily: s.fontFamily || "Roboto-Regular",
                padding: s.padding ?? 6,
                backgroundColor: s.backgroundColor ?? "transparent",
                rotation: s.rotation ?? 0,
                layerId: s.layerId,
              });
            }
          }
          return;
        }

        // Eraser modes
        if (tool === "eraser") {
          if (eraserMode === "stroke") {
            if (!rafScheduled.current) {
              rafScheduled.current = true;
              safeRAF(() => {
                rafScheduled.current = false;
                validStrokes.forEach((s, i) => {
                  // ✅ RESTRICT ERASER: Skip images, text, stickers, tables
                  if (
                    ["image", "text", "sticker", "table", "emoji"].includes(
                      s.tool
                    )
                  ) {
                    return;
                  }

                  if (!Array.isArray(s.points)) return;
                  const hit = s.points.some((p) => {
                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 4;
                  });

                  if (hit && typeof onDeleteStroke === "function") {
                    const globalIndex = strokes.findIndex(
                      (s) => s.id === validStrokes[i].id
                    );
                    if (globalIndex !== -1) {
                      const deletedId = validStrokes[i].id;
                      onDeleteStroke(globalIndex);

                      // 🔄 REALTIME COLLABORATION: Send delete event
                      if (
                        collabEnabled &&
                        collabConnected &&
                        typeof onCollabElementDelete === "function" &&
                        deletedId
                      ) {
                        onCollabElementDelete(pageId, deletedId);
                      }
                    }
                  }
                });
              });
            }
            return;
          }

          if (eraserMode === "pixel") {
            // Always record the first point so preview appears immediately
            if (liveRef.current.length === 0) {
              liveRef.current.push({ x: e.x, y: e.y });
              if (!rafScheduled.current) {
                rafScheduled.current = true;
                safeRAF(() => {
                  rafScheduled.current = false;
                  setCurrentPoints([...liveRef.current]);
                });
              }
              return;
            }
            const last = liveRef.current.at(-1);
            const dx = e.x - (last?.x ?? e.x);
            const dy = e.y - (last?.y ?? e.y);
            if (dx * dx + dy * dy < getMinDistSq()) return;
            liveRef.current.push({ x: e.x, y: e.y });
            if (!rafScheduled.current) {
              rafScheduled.current = true;
              safeRAF(() => {
                rafScheduled.current = false;
                setCurrentPoints([...liveRef.current]);
              });
            }
            return;
          }

          if (eraserMode === "object") {
            const last = liveRef.current.at(-1) || { x: 0, y: 0 };
            const dx = e.x - last.x;
            const dy = e.y - last.y;
            if (dx * dx + dy * dy < getMinDistSq()) return;
            liveRef.current.push({ x: e.x, y: e.y });
            if (!rafScheduled.current) {
              rafScheduled.current = true;
              safeRAF(() => {
                rafScheduled.current = false;
                setCurrentPoints([...liveRef.current]);
                const livePath = canvasRef?.current?.livePath;
                if (livePath) livePath.lineTo(e.x, e.y);
              });
            }
            return;
          }
        }

        if (
          ![
            "pen",
            "pencil",
            "brush",
            "calligraphy",
            "highlighter",
            "marker",
            "airbrush",
            "crayon",
            "eraser",
            "line",
            "arrow",
            "rect",
            "circle",
            "triangle",
            "star",
            "polygon",
            "fill",
            "shape",
            "tape",
          ].includes(tool)
        )
          return;
        const last = liveRef.current.at(-1) || { x: 0, y: 0 };
        const dx = e.x - last.x;
        const dy = e.y - last.y;
        if (dx * dx + dy * dy < getMinDistSq()) return;

        const toolConfig = configByTool[tool] || {
          pressure: 0.5,
          thickness: 1,
          stabilization: 0.2,
        };

        let point = { x: e.x, y: e.y };
        const prevPoint = liveRef.current.at(-1) || null;

        if (liveRef.current.length >= MAX_STROKE_POINTS) {
          commitCurrentStroke();
        }

        liveRef.current.push({
          x: point.x,
          y: point.y,
          pressure: toolConfig.pressure,
          thickness: toolConfig.thickness,
          stabilization: toolConfig.stabilization,
        });

        if (!rafScheduled.current) {
          rafScheduled.current = true;
          safeRAF(() => {
            rafScheduled.current = false;
            setCurrentPoints([...liveRef.current]);
          });
        }
      })
      .onFinalize(() => {
        // Ensure we clear origin/offsets if gesture cancelled
        dragOriginRef.current = null;
        setDraggingText(null);
      })
      .onEnd((e) => {
        if (
          [
            "image",
            "sticker",
            "camera",
            "eyedropper",
            "table",
            "scroll",
            "zoom",
          ].includes(tool)
        ) {
          try {
            if (typeof rafIdRef.current === "number") {
              cancelAnimationFrame(rafIdRef.current);
            }
          } catch { }
          rafIdRef.current = null;
          rafScheduled.current = false;
          liveRef.current = [];
          setCurrentPoints([]);
          return;
        }
        if (tool === "lasso" && !isMovingLasso && lassoPoints.length > 3) {
          const poly = lassoPoints;
          const insideIds = Array.isArray(strokes)
            ? strokes
              .filter(
                (s) =>
                  s &&
                  (!activeLayerId || s.layerId === activeLayerId) &&
                  (s.points || s.x)
              )
              .filter((s) => {
                const bbox = getBoundingBoxForStroke(s);
                if (!bbox) return false;
                const cx = (bbox.minX + bbox.maxX) / 2;
                const cy = (bbox.minY + bbox.maxY) / 2;
                return pointInPolygon(poly, cx, cy);
              })
              .map((s) => s.id)
            : [];

          if (insideIds.length > 0) {
            setLassoOrigin(
              insideIds.map((id) => {
                const s = strokes.find((st) => st.id === id);
                return { id, x: s?.x ?? 0, y: s?.y ?? 0 };
              })
            );
            setLassoSelection(insideIds);
            // set base box once when selection is created
            (() => {
              let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
              strokes
                .filter((s) => insideIds.includes(s.id))
                .forEach((s) => {
                  const bbox = getBoundingBoxForStroke(s);
                  if (bbox) {
                    minX = Math.min(minX, bbox.minX);
                    minY = Math.min(minY, bbox.minY);
                    maxX = Math.max(maxX, bbox.maxX);
                    maxY = Math.max(maxY, bbox.maxY);
                  }
                });
              if (minX < Infinity && minY < Infinity) {
                setLassoBaseBox({
                  x: minX,
                  y: minY,
                  width: maxX - minX,
                  height: maxY - minY,
                });
                setLassoVisualOffset({ dx: 0, dy: 0 });
              }
            })();
          }

          setLassoPoints([]);
          setCurrentPoints([]);
          return;
        }

        // Commit text dragging: apply final x/y and clear visual offset
        if (selectedId && draggingText) {
          const newX = e.x - draggingText.offsetX;
          const newY = e.y - draggingText.offsetY;
          const index = strokes.findIndex((s) => s.id === selectedId);
          if (index !== -1 && typeof onModifyStroke === "function") {
            onModifyStroke(index, { x: newX, y: newY });
          }
          setDraggingText(null);
          // remove transient visual offset both from state and from ref
          setVisualOffsets((prev) => {
            const next = { ...prev };
            delete next[selectedId];
            return next;
          });
          if (
            visualOffsetsRef.current &&
            visualOffsetsRef.current[selectedId]
          ) {
            const copy = { ...visualOffsetsRef.current };
            delete copy[selectedId];
            visualOffsetsRef.current = copy;
          }

          dragOriginRef.current = null;
          selectionBoxRaf.current = false;
          lastDragPosRef.current = { x: 0, y: 0 };
          boxOriginRef.current = null;
          return;
        }

        // --- Khi thả tay sau khi move vùng chọn ---
        if (tool === "lasso" && isMovingLasso && lassoOrigin) {
          const dx = e.x - lassoMoveStart.x;
          const dy = e.y - lassoMoveStart.y;

          const newCumulativeDx = lassoCumulativeOffset.dx + dx;
          const newCumulativeDy = lassoCumulativeOffset.dy + dy;

          // ✅ FIX: Store the ORIGINAL base box before any updates
          lassoBaseAtReleaseRef.current = lassoBaseBox;
          lassoPendingDelta.current = {
            dx: newCumulativeDx,
            dy: newCumulativeDy,
          };

          // ✅ FIX: Keep visual offset during commit - DON'T update lassoBaseBox yet
          // The reconciliation effect will update it after strokes are confirmed moved
          setVisualOffsets(() => {
            const next = {};
            lassoSelection.forEach((id) => {
              next[id] = { dx: newCumulativeDx, dy: newCumulativeDy };
            });
            return next;
          });

          // Commit the move to strokes
          setIsCommittingMove(true);
          if (typeof setRealtimeText === "function") setRealtimeText(null);
          handleMoveCommitRef.current?.(newCumulativeDx, newCumulativeDy);

          // Reset per-drag state
          setIsMovingLasso(false);
          setLassoMoveStart(null);

          return;
        }

        const livePath = canvasRef?.current?.livePath;
        if (livePath) livePath.reset();

        const finalPoints = liveRef.current;
        liveRef.current = [];
        setCurrentPoints([]);

        const validStrokes = Array.isArray(strokes)
          ? strokes.filter(
            (s) => s && s.layerId === activeLayerId && (s.visible ?? true)
          )
          : [];
        if (!activeLayerId) return;

        if (eraserMode === "object" && finalPoints.length > 2) {
          const poly = finalPoints;
          for (let i = validStrokes.length - 1; i >= 0; i--) {
            const s = validStrokes[i];
            // ✅ RESTRICT ERASER: Skip images, text, stickers, tables
            if (
              ["image", "text", "sticker", "table", "emoji"].includes(s.tool)
            ) {
              continue;
            }

            const bbox = getBoundingBoxForStroke(s);
            if (!bbox) continue;
            const cx = (bbox.minX + bbox.maxX) / 2;
            const cy = (bbox.minY + bbox.maxY) / 2;
            if (pointInPolygon(poly, cx, cy)) {
              try {
                const globalIndex = strokes.findIndex(
                  (st) => st.id === s.id
                );
                if (globalIndex !== -1) {
                  onDeleteStroke(globalIndex);

                  // 🔄 REALTIME COLLABORATION: Send delete event
                  if (
                    collabEnabled &&
                    collabConnected &&
                    typeof onCollabElementDelete === "function" &&
                    s.id
                  ) {
                    onCollabElementDelete(pageId, s.id);
                  }
                }
              } catch (err) {
                console.warn("Error deleting stroke:", err);
              }
            }
          }
          return;
        }

        if (
          tool === "eraser" &&
          eraserMode === "pixel" &&
          finalPoints.length > 0
        ) {
          // 1) Split line-based strokes for crisp erasing
          const eraserRadius = (eraserSize || 1) * 0.5;
          const mutations = [];
          for (let i = 0; i < validStrokes.length; i++) {
            const s = validStrokes[i];
            // ✅ RESTRICT ERASER: Skip images, text, stickers, tables
            if (
              ["image", "text", "sticker", "table", "emoji"].includes(s.tool)
            ) {
              continue;
            }

            if (!s || !Array.isArray(s.points) || s.points.length < 2) continue;
            const pieces = splitStrokeByEraser(s, finalPoints, eraserRadius);
            if (pieces.length === 1 && pieces[0] === s) continue; // unchanged
            const globalIndex = strokes.findIndex((x) => x.id === s.id);
            if (globalIndex !== -1) {
              mutations.push({
                globalIndex,
                pieces,
                layerId: s.layerId,
                id: s.id,
              });
            }
          }

          // Apply deletes in descending index order to avoid reindexing issues
          mutations
            .sort((a, b) => b.globalIndex - a.globalIndex)
            .forEach((m) => {
              onDeleteStroke?.(m.globalIndex);

              // 🔄 REALTIME COLLABORATION: Send delete event
              if (
                collabEnabled &&
                collabConnected &&
                typeof onCollabElementDelete === "function" &&
                m.id
              ) {
                onCollabElementDelete(pageId, m.id);
              }
            });

          // Add new pieces after deletions
          mutations.forEach(({ pieces, layerId }) => {
            pieces.forEach((ns) => onAddStroke?.({ ...ns, layerId }));
          });

          // 2) ❌ DISABLE composite eraser stroke to prevent erasing images/text visually
          // The user requested that images and text should NOT be erased.
          // The composite eraser stroke uses destination-out which erases everything.
          // By removing this, we convert "Pixel Eraser" into a "Vector Split Eraser"
          // which only affects line-based strokes via the split logic above.

          /*
          const toolConfig = configByTool["eraser"] || {
            pressure: 0.5,
            thickness: 1,
            stabilization: 0.2,
          };
          const eraserStroke = {
            id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
            tool: "eraser",
            color: "#000000",
            width: eraserSize,
            points: finalPoints,
            ...toolConfig,
            layerId: activeLayerId,
          };
          onAddStroke?.(eraserStroke);
          */
          return;
        }

        if (tool === "fill") {
          const tapX = finalPoints[0]?.x;
          const tapY = finalPoints[0]?.y;
          for (let i = 0; i < validStrokes.length; i++) {
            const s = validStrokes[i];
            const bbox = getBoundingBoxForStroke(s);
            if (
              bbox &&
              tapX >= bbox.minX &&
              tapX <= bbox.maxX &&
              tapY >= bbox.minY &&
              tapY <= bbox.maxY
            ) {
              try {
                const fillChanges = { fill: true, fillColor: color };
                onModifyStroke?.(i, fillChanges);

                // 🔄 REALTIME COLLABORATION: Send fill update to other users
                if (
                  collabEnabled &&
                  collabConnected &&
                  typeof onCollabElementUpdate === "function" &&
                  s?.id
                ) {
                  onCollabElementUpdate(pageId, s.id, fillChanges);
                }
              } catch (err) {
                console.warn("Error modifying fill:", err);
              }
              break;
            }
          }
          return;
        }

        if (
          ![
            "pen",
            "pencil",
            "brush",
            "calligraphy",
            "highlighter",
            "marker",
            "airbrush",
            "crayon",
            "line",
            "arrow",
            "rect",
            "circle",
            "triangle",
            "star",
            "polygon",
            "shape",
            "fill",
            "eraser",
            "tape",
          ].includes(tool)
        )
          return;
        const w =
          {
            pen: strokeWidth,
            pencil: pencilWidth,
            brush: brushWidth,
            calligraphy: calligraphyWidth,
            highlighter: strokeWidth * 2,
            eraser: eraserSize,
          }[tool] ?? strokeWidth;

        const toolConfig = configByTool[tool] || {
          pressure: 0.5,
          thickness: 1,
          stabilization: 0.2,
        };

        // 🛠️ Giảm số điểm để tránh lag khi stroke quá dài
        const shouldDecimate = [
          "pen",
          "pencil",
          "brush",
          "calligraphy",
          "highlighter",
          "marker",
          "airbrush",
          "crayon",
        ].includes(tool);

        const decimatePoints = (pts, minDist) => {
          if (!Array.isArray(pts) || pts.length < 3) return pts;
          const out = [pts[0]];
          const minDistSq = Math.max(0.25, (minDist || 0.5) * (minDist || 0.5));
          for (let i = 1; i < pts.length; i++) {
            const prev = out[out.length - 1];
            const p = pts[i];
            const dx = (p.x || 0) - (prev.x || 0);
            const dy = (p.y || 0) - (prev.y || 0);
            if (dx * dx + dy * dy >= minDistSq) out.push(p);
          }
          const last = pts[pts.length - 1];
          const tail = out[out.length - 1];
          if (last && (last.x !== tail.x || last.y !== tail.y)) out.push(last);
          return out;
        };

        const simplifiedPoints = shouldDecimate
          ? decimatePoints(finalPoints, Math.max(0.5, (w || 2) * 0.15))
          : finalPoints;

        const newStroke = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          tool,
          color,
          width: w,
          points: simplifiedPoints,
          opacity:
            tool === "brush"
              ? brushOpacity
              : tool === "calligraphy"
                ? calligraphyOpacity
                : 1,
          ...toolConfig,
          layerId: activeLayerId,
          rotation: 0,
        };

        if (
          [
            "triangle",
            "rect",
            "square",
            "circle",
            "oval",
            "line",
            "arrow",
            "polygon",
            "star",
          ].includes(tool)
        ) {
          const shape = buildShape(tool, finalPoints);
          if (shape) newStroke.shape = shape.shape;
        } else if (tool === "shape") {
          const currentShapeSettings = shapeSettingsRef.current;
          const shapeType = currentShapeSettings?.shape || "rect";
          const shape = buildShape(shapeType, finalPoints);
          if (shape) {
            newStroke.shape = shape.shape;
            newStroke.color = currentShapeSettings?.color || "#000000";
            newStroke.width = currentShapeSettings?.thickness || 2;
            newStroke.shapeSettings = { ...currentShapeSettings };

            if (currentShapeSettings?.fill) {
              newStroke.fill = true;
              newStroke.fillColor = currentShapeSettings.color;
            }

            if (shapeType === "pentagon") newStroke.sides = 5;
            if (shapeType === "hexagon") newStroke.sides = 6;
            if (shapeType === "octagon") newStroke.sides = 8;
          }
        } else if (tool === "tape") {
          const currentTapeSettings = tapeSettingsRef.current || {};
          const mode = currentTapeSettings.mode || "line";

          if (mode === "rectangle") {
            const shape = buildShape("rect", finalPoints);
            if (shape) {
              newStroke.shape = shape.shape;
            }
          }
          // For line mode, we use points directly (already in newStroke)

          newStroke.tapeSettings = { ...currentTapeSettings };
          newStroke.width = (currentTapeSettings.thickness || 4) * 5; // Approximate width for hit testing
          newStroke.color = currentTapeSettings.color || "#FDA4AF";
        }

        if (tool !== "eraser" && typeof onAddStroke === "function") {
          try {
            onAddStroke(newStroke);

            // 🔄 REALTIME COLLABORATION:
            // ❌ REMOVED duplicate onCollabElementCreate call here.
            // CanvasContainer.jsx's addStrokeInternal ALREADY calls projectService.realtime.sendStroke.
            // Calling it here caused double-strokes (ghosts) on other clients.
          } catch (err) {
            console.warn("Error adding stroke:", err);
          }
        }
      });

    // Cleanup on unmount: clear live points and reset currentPoints to avoid leaks
    useEffect(() => {
      return () => {
        try {
          rafScheduled.current = false;
          if (typeof rafIdRef.current === "number") {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
          }
          liveRef.current = [];
          setCurrentPoints([]);
        } catch { }
      };
    }, []);

    useEffect(() => {
      const pdx = lassoPendingDelta.current?.dx || 0;
      const pdy = lassoPendingDelta.current?.dy || 0;
      const baseAtRelease = lassoBaseAtReleaseRef.current;

      // Skip if no pending move or no selection
      if (
        !baseAtRelease ||
        (pdx === 0 && pdy === 0) ||
        lassoSelection.length === 0
      ) {
        return;
      }

      const sel = Array.isArray(strokes)
        ? strokes.filter((s) => s && lassoSelection.includes(s.id))
        : [];
      if (!sel.length) return;

      // Calculate current bounding box from strokes (including shapes)
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      sel.forEach((s) => {
        // Check points-based strokes
        if (Array.isArray(s.points) && s.points.length > 0) {
          s.points.forEach((p) => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          });
        }

        // Check x, y based strokes (text, image, etc.)
        if (typeof s.x === "number" && typeof s.y === "number") {
          const w = s.width || 100;
          const h = s.height || 100;
          if (s.x < minX) minX = s.x;
          if (s.y < minY) minY = s.y;
          if (s.x + w > maxX) maxX = s.x + w;
          if (s.y + h > maxY) maxY = s.y + h;
        }

        // ✅ Check shape-based strokes
        if (s.shape) {
          const sh = s.shape;

          // Rectangle/Square
          if (typeof sh.x === "number" && typeof sh.w === "number") {
            if (sh.x < minX) minX = sh.x;
            if (sh.y < minY) minY = sh.y;
            if (sh.x + sh.w > maxX) maxX = sh.x + sh.w;
            if (sh.y + sh.h > maxY) maxY = sh.y + sh.h;
          }

          // Circle
          if (typeof sh.cx === "number" && typeof sh.r === "number") {
            if (sh.cx - sh.r < minX) minX = sh.cx - sh.r;
            if (sh.cy - sh.r < minY) minY = sh.cy - sh.r;
            if (sh.cx + sh.r > maxX) maxX = sh.cx + sh.r;
            if (sh.cy + sh.r > maxY) maxY = sh.cy + sh.r;
          }

          // Oval
          if (typeof sh.cx === "number" && typeof sh.rx === "number") {
            if (sh.cx - sh.rx < minX) minX = sh.cx - sh.rx;
            if (sh.cy - sh.ry < minY) minY = sh.cy - sh.ry;
            if (sh.cx + sh.rx > maxX) maxX = sh.cx + sh.rx;
            if (sh.cy + sh.ry > maxY) maxY = sh.cy + sh.ry;
          }

          // Line/Arrow/Triangle
          if (typeof sh.x1 === "number") {
            const xs = [sh.x1, sh.x2];
            const ys = [sh.y1, sh.y2];
            if (typeof sh.x3 === "number") {
              xs.push(sh.x3);
              ys.push(sh.y3);
            }
            xs.forEach((x) => {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
            });
            ys.forEach((y) => {
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            });
          }

          // Polygon/Star
          if (Array.isArray(sh.points)) {
            sh.points.forEach((p) => {
              if (p.x < minX) minX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.x > maxX) maxX = p.x;
              if (p.y > maxY) maxY = p.y;
            });
          }
        }
      });

      if (!isFinite(minX)) return;

      const movedBox = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };

      const expectX = (baseAtRelease.x || 0) + pdx;
      const expectY = (baseAtRelease.y || 0) + pdy;
      const eps = 3.0; // ✅ Tăng tolerance một chút

      // Check if strokes have moved to expected position
      if (
        Math.abs(movedBox.x - expectX) <= eps &&
        Math.abs(movedBox.y - expectY) <= eps
      ) {
        // ✅ Strokes đã move xong - clear visual offsets và pending delta
        lassoPendingDelta.current = { dx: 0, dy: 0 };
        lassoBaseAtReleaseRef.current = null;
        lassoDragDelta.current = { dx: 0, dy: 0 };

        // Clear visual offsets
        setVisualOffsets({});
        visualOffsetsRef.current = {};

        // Update base box to new position
        setLassoBaseBox(movedBox);

        // Clear committing state
        setIsCommittingMove(false);
      }
    }, [strokes, lassoSelection]);

    // Tìm và thay thế useMemo lassoBox:

    const lassoBox = useMemo(() => {
      if (!lassoSelection || lassoSelection.length === 0) return null;

      // ✅ Nếu có lassoBaseBox, dùng nó + visual offset
      if (lassoBaseBox) {
        const offsetDx = lassoVisualOffset?.dx || 0;
        const offsetDy = lassoVisualOffset?.dy || 0;

        return {
          x: lassoBaseBox.x + offsetDx,
          y: lassoBaseBox.y + offsetDy,
          width: lassoBaseBox.width,
          height: lassoBaseBox.height,
        };
      }

      // Fallback: tính từ strokes khi chưa có baseBox
      const sel = Array.isArray(strokes)
        ? strokes.filter((s) => s && lassoSelection.includes(s.id))
        : [];
      if (!sel.length) return null;

      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      sel.forEach((s) => {
        // Points-based strokes
        if (Array.isArray(s.points) && s.points.length > 0) {
          s.points.forEach((p) => {
            if (p.x < minX) minX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.x > maxX) maxX = p.x;
            if (p.y > maxY) maxY = p.y;
          });
        }

        // x, y based strokes
        if (typeof s.x === "number" && typeof s.y === "number") {
          const w = s.width || 100;
          const h = s.height || 100;
          if (s.x < minX) minX = s.x;
          if (s.y < minY) minY = s.y;
          if (s.x + w > maxX) maxX = s.x + w;
          if (s.y + h > maxY) maxY = s.y + h;
        }

        // Shape-based strokes
        if (s.shape) {
          const sh = s.shape;
          if (typeof sh.x === "number" && typeof sh.w === "number") {
            if (sh.x < minX) minX = sh.x;
            if (sh.y < minY) minY = sh.y;
            if (sh.x + sh.w > maxX) maxX = sh.x + sh.w;
            if (sh.y + sh.h > maxY) maxY = sh.y + sh.h;
          }
          if (typeof sh.cx === "number" && typeof sh.r === "number") {
            if (sh.cx - sh.r < minX) minX = sh.cx - sh.r;
            if (sh.cy - sh.r < minY) minY = sh.cy - sh.r;
            if (sh.cx + sh.r > maxX) maxX = sh.cx + sh.r;
            if (sh.cy + sh.r > maxY) maxY = sh.cy + sh.r;
          }
          if (typeof sh.cx === "number" && typeof sh.rx === "number") {
            if (sh.cx - sh.rx < minX) minX = sh.cx - sh.rx;
            if (sh.cy - sh.ry < minY) minY = sh.cy - sh.ry;
            if (sh.cx + sh.rx > maxX) maxX = sh.cx + sh.rx;
            if (sh.cy + sh.ry > maxY) maxY = sh.cy + sh.ry;
          }
          if (typeof sh.x1 === "number") {
            [sh.x1, sh.x2, sh.x3]
              .filter((v) => typeof v === "number")
              .forEach((x) => {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
              });
            [sh.y1, sh.y2, sh.y3]
              .filter((v) => typeof v === "number")
              .forEach((y) => {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              });
          }
          if (Array.isArray(sh.points)) {
            sh.points.forEach((p) => {
              if (p.x < minX) minX = p.x;
              if (p.y < minY) minY = p.y;
              if (p.x > maxX) maxX = p.x;
              if (p.y > maxY) maxY = p.y;
            });
          }
        }
      });

      if (!isFinite(minX)) return null;

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }, [lassoBaseBox, lassoVisualOffset, lassoSelection, strokes]);

    // ✅ Only enable GestureHandler's gestures when in drawing mode
    // This prevents conflicts with navigation gestures (scroll/zoom)
    // Note: image/sticker tools need tap gestures enabled to select/deselect images
    const isDrawingMode = useMemo(() => {
      return !["scroll", "zoom", "camera", "table"].includes(tool);
    }, [tool]);

    // Compose gestures and apply enabled check
    const composedGesture = useMemo(() => {
      // Apply enabled check to individual gestures since Race/Simultaneous don't support it directly
      const activeTap = tap.enabled(isDrawingMode);
      const activePan = pan.enabled(isDrawingMode);

      if (isDrawingMode) {
        // ✅ Simplify gesture when drawing to avoid conflicts/crashes
        // Remove doubleTap and Race overhead when drawing
        return Gesture.Simultaneous(activeTap, activePan);
      }

      const activeDoubleTap = doubleTap.enabled(isDrawingMode);
      return Gesture.Race(
        activeDoubleTap,
        Gesture.Simultaneous(activeTap, activePan)
      );
    }, [doubleTap, tap, pan, isDrawingMode]);

    return (
      <>
        <GestureDetector gesture={composedGesture}>
          {React.cloneElement(children, {
            strokes: children.props.strokes ?? strokes,
            lassoPoints,
            lassoSelection,
            visualOffsets,
            tool,
          })}
        </GestureDetector>
        {lassoSelection.length > 0 && lassoBox && (
          <LassoSelectionBox
            box={{
              x: (lassoBox.x || 0) - (page?.x || 0),
              y: (lassoBox.y || 0) - (page?.y || 0) + 20,
              width: lassoBox.width,
              height: lassoBox.height,
            }}
            onMove={(dx, dy) => {
              // Lưu delta vào ref
              lassoDragDelta.current = { dx, dy };

              // Update visual offsets trong RAF
              if (!visualFlushRaf.current) {
                visualFlushRaf.current = true;
                safeRAF(() => {
                  visualFlushRaf.current = false;

                  const newOffsets = {};
                  lassoSelection.forEach((id) => {
                    newOffsets[id] = { ...lassoDragDelta.current };
                  });

                  visualOffsetsRef.current = newOffsets;
                  setVisualOffsets(newOffsets);
                  setLassoVisualOffset({ ...lassoDragDelta.current });
                });
              }
            }}
            onMoveEnd={(dx, dy) => {
              const finalDx = dx ?? (lassoDragDelta.current?.dx || 0);
              const finalDy = dy ?? (lassoDragDelta.current?.dy || 0);

              // Cancel any pending RAF
              if (visualFlushRaf.current) {
                visualFlushRaf.current = false;
              }

              if (finalDx === 0 && finalDy === 0) {
                setLassoVisualOffset({ dx: 0, dy: 0 });
                setVisualOffsets({});
                visualOffsetsRef.current = {};
                lassoDragDelta.current = { dx: 0, dy: 0 };
                return;
              }

              // ✅ CRITICAL FIX: Lưu lại expected final position của lassoBox
              const expectedFinalBox = lassoBaseBox
                ? {
                  ...lassoBaseBox,
                  x: lassoBaseBox.x + finalDx,
                  y: lassoBaseBox.y + finalDy,
                }
                : null;

              // ✅ STEP 1: Update lassoBaseBox NGAY LẬP TỨC với vị trí cuối cùng
              // Điều này giữ cho lassoBox không bị nhảy
              setLassoBaseBox(expectedFinalBox);

              // ✅ STEP 2: Clear visual offset NGAY LẬP TỨC vì lassoBaseBox đã có vị trí mới
              // Khi lassoBaseBox đã được update, lassoVisualOffset = 0 sẽ không gây nhảy
              setLassoVisualOffset({ dx: 0, dy: 0 });
              lassoDragDelta.current = { dx: 0, dy: 0 };

              // ✅ STEP 3: Commit strokes (update stroke.x/y)
              handleMoveCommitRef.current?.(finalDx, finalDy);

              // ✅ STEP 4: Clear visualOffsets cho individual strokes SAU khi strokes đã update
              // Dùng RAF để đợi React batch update xong
              requestAnimationFrame(() => {
                // Clear visual offsets cho các strokes
                setVisualOffsets({});
                visualOffsetsRef.current = {};

                // Force sync các image refs
                lassoSelection.forEach((id) => {
                  const imgRef = imageRefs?.current?.get(id);
                  if (imgRef?.forceSync) {
                    const stroke = strokes.find((s) => s.id === id);
                    if (stroke) {
                      imgRef.forceSync({
                        ...stroke,
                        x: (stroke.x ?? 0) + finalDx,
                        y: (stroke.y ?? 0) + finalDy,
                      });
                    }
                  }
                });
              });
            }}
            onCopy={() => {
              const selStrokes = Array.isArray(strokes)
                ? strokes.filter((s) => s && lassoSelection.includes(s.id))
                : [];
              selStrokes.forEach((s) => {
                const clone = {
                  ...s,
                  id: `${s.id}_copy_${Date.now()}_${Math.random()
                    .toString(36)
                    .slice(2)}`,
                  x: (s.x ?? 0) + 20,
                  y: (s.y ?? 0) + 20,
                  // Offset points nếu có (cho pen, pencil, shapes, etc.)
                  points: s.points
                    ? s.points.map((p) => ({
                      ...p,
                      x: p.x + 20,
                      y: p.y + 20,
                    }))
                    : undefined,
                };
                onAddStroke?.(clone);
              });
              setLassoSelection([]);
            }}
            onCut={() => {
              // Capture IDs before deleting
              const toDelete = strokes
                .filter((s) => lassoSelection.includes(s.id))
                .map((s) => ({
                  id: s.id,
                  index: strokes.findIndex((st) => st.id === s.id),
                }))
                .filter((item) => item.index !== -1)
                .sort((a, b) => b.index - a.index); // Sort descending để xóa từ cuối lên

              toDelete.forEach((item) => onDeleteStroke?.(item.index));

              // 🔄 REALTIME COLLABORATION: Send delete events for all lasso selected items
              if (
                collabEnabled &&
                collabConnected &&
                typeof onCollabElementDelete === "function"
              ) {
                toDelete.forEach((item) => {
                  onCollabElementDelete(pageId, item.id);
                });
              }

              setLassoSelection([]);
            }}
            onDelete={() => {
              // Capture IDs before deleting
              const toDelete = strokes
                .filter((s) => lassoSelection.includes(s.id))
                .map((s) => ({
                  id: s.id,
                  index: strokes.findIndex((st) => st.id === s.id),
                }))
                .filter((item) => item.index !== -1)
                .sort((a, b) => b.index - a.index); // Sort descending để xóa từ cuối lên

              toDelete.forEach((item) => onDeleteStroke?.(item.index));

              // 🔄 REALTIME COLLABORATION: Send delete events for all lasso selected items
              if (
                collabEnabled &&
                collabConnected &&
                typeof onCollabElementDelete === "function"
              ) {
                toDelete.forEach((item) => {
                  onCollabElementDelete(pageId, item.id);
                });
              }

              setLassoSelection([]);
            }}
            onClear={() => {
              setLassoSelection([]);
              setLassoPoints([]);
            }}
          />
        )}

        {selectedBox &&
          selectedId &&
          !editorVisible &&
          ["text", "sticky", "comment", "emoji"].includes(
            selectedStroke?.tool
          ) && (
            <TextSelectionBox
              x={(selectedBox.x || 0) - (page?.x || 0)}
              y={(selectedBox.y || 0) - (page?.y || 0) + 20}
              width={selectedBox.width}
              height={selectedBox.height}
              onResizeStart={(corner) => {
                const s = strokes.find((st) => st.id === selectedId);
                if (!s) return;
                textResizeRef.current = {
                  corner,
                  baseStroke: s,
                  baseBox: { ...selectedBox },
                  padding: s.padding || 0,
                  fontSize: s.fontSize || 18,
                  text: typeof s.text === "string" ? s.text : "",
                };
              }}
              onMoveStart={() => {
                // ✅ FIX: Capture origin position when move starts
                const s = strokes.find((st) => st.id === selectedId);
                if (s) {
                  dragOriginRef.current = {
                    x: s.x ?? 0,
                    y: s.y ?? 0,
                  };
                }
              }}
              onMove={(dx, dy) => {
                setSelectedBox((box) =>
                  box ? { ...box, x: box.x + dx, y: box.y + dy } : box
                );

                if (typeof setRealtimeText === "function") {
                  safeRAF(() => {
                    setRealtimeText((prev) =>
                      prev && prev.id === selectedId
                        ? { ...prev, x: prev.x + dx, y: prev.y + dy }
                        : prev
                    );
                  });
                }
              }}
              onMoveEnd={(totalDx, totalDy) => {
                // ✅ FIX: Commit final position to stroke when move ends
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onModifyStroke === "function") {
                  const origin = dragOriginRef.current;
                  if (origin) {
                    const newX = origin.x + totalDx;
                    const newY = origin.y + totalDy;
                    onModifyStroke(index, { x: newX, y: newY });

                    // 🔄 REALTIME COLLABORATION: Send text/sticky move update
                    if (
                      collabEnabled &&
                      collabConnected &&
                      typeof onCollabElementUpdate === "function"
                    ) {
                      onCollabElementUpdate(
                        pageId,
                        selectedId,
                        { x: newX, y: newY },
                        { transient: false }
                      );
                    }
                  }
                }
                dragOriginRef.current = null;
                if (typeof setRealtimeText === "function")
                  setRealtimeText(null);
              }}
              onResize={(corner, dx, dy) => {
                const snap = textResizeRef.current;
                const s = strokes.find((st) => st.id === selectedId);
                if (!snap || !s) return;

                const baseBox = snap.baseBox;
                let left = baseBox.x;
                let top = baseBox.y;
                let w = baseBox.width;
                let h = baseBox.height;
                if (corner.includes("l")) {
                  left = baseBox.x + dx;
                  w = baseBox.width - dx;
                } else if (corner.includes("r")) {
                  w = baseBox.width + dx;
                }
                if (corner.includes("t")) {
                  top = baseBox.y + dy;
                  h = baseBox.height - dy;
                } else if (corner.includes("b")) {
                  h = baseBox.height + dy;
                }
                w = Math.max(20, w);
                h = Math.max(20, h);

                const baseW = baseBox.width || 1;
                const baseH = baseBox.height || 1;
                const scaleX = w / baseW;
                const scaleY = h / baseH;
                const scale = Math.max(
                  0.3,
                  Math.min(6, Math.min(scaleX, scaleY))
                );
                const pad = snap.padding;
                const newFont = Math.max(
                  8,
                  Math.round((snap.fontSize || 18) * scale)
                );
                textResizeRef.current.lastNewFont = newFont;
                // Derive new text position from box: left/top -> x,y
                const tx = left + pad;
                const ty = top + newFont + pad;

                // Recompute box from text metrics to stay consistent with renderer
                const tw = Math.max(
                  20,
                  approxTextWidthLocal(snap.text, newFont) + pad * 2
                );
                const th = Math.max(20, newFont + pad * 2);

                if (typeof setRealtimeText === "function") {
                  setRealtimeText({
                    id: selectedId,
                    ...s,
                    x: tx,
                    y: ty,
                    fontSize: newFont,
                  });
                }

                setSelectedBox({ x: left, y: top, width: tw, height: th });
              }}
              onResizeEnd={() => {
                const snap = textResizeRef.current;
                if (!snap) return;
                const s = strokes.find((st) => st.id === selectedId);
                if (!s) return;

                const pad = snap.padding;
                // prefer lastNewFont computed during onResize (keeps preview & commit identical)
                const preferredFont =
                  typeof snap.lastNewFont === "number"
                    ? snap.lastNewFont
                    : Math.max(
                      8,
                      Math.round(
                        selectedBox?.height - pad * 2 || snap.fontSize || 18
                      )
                    );

                const newFont = Math.max(8, Math.round(preferredFont));
                const tx = (selectedBox?.x ?? snap.baseBox?.x ?? 0) + pad;
                const ty =
                  (selectedBox?.y ?? snap.baseBox?.y ?? 0) + newFont + pad;

                const index = strokes.findIndex((st) => st.id === selectedId);
                if (index !== -1 && typeof onModifyStroke === "function") {
                  const changes = { x: tx, y: ty, fontSize: newFont };
                  onModifyStroke(index, changes);

                  // 🔄 REALTIME COLLABORATION: Send text resize update
                  if (
                    collabEnabled &&
                    collabConnected &&
                    typeof onCollabElementUpdate === "function"
                  ) {
                    onCollabElementUpdate(pageId, selectedId, changes, {
                      transient: false,
                    });
                  }
                }

                textResizeRef.current = null;
                if (typeof setRealtimeText === "function")
                  setRealtimeText(null);
              }}
              onCopy={() => {
                const target = strokes.find((s) => s.id === selectedId);
                if (!target) return;
                const newStroke = {
                  ...target,
                  id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  x: target.x + 20,
                  y: target.y + 20,
                };
                if (typeof onAddStroke === "function") onAddStroke(newStroke);
                setSelectedId(null);
                setSelectedBox(null);
              }}
              onCut={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                const deletedId = selectedId; // Capture before clearing
                if (index !== -1 && typeof onDeleteStroke === "function")
                  onDeleteStroke(index);

                // 🔄 REALTIME COLLABORATION: Send delete event
                if (
                  collabEnabled &&
                  collabConnected &&
                  typeof onCollabElementDelete === "function" &&
                  deletedId
                ) {
                  onCollabElementDelete(pageId, deletedId);
                }

                setSelectedId(null);
                setSelectedBox(null);
              }}
              onDelete={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                const deletedId = selectedId; // Capture before clearing
                if (index !== -1 && typeof onDeleteStroke === "function")
                  onDeleteStroke(index);

                // 🔄 REALTIME COLLABORATION: Send delete event
                if (
                  collabEnabled &&
                  collabConnected &&
                  typeof onCollabElementDelete === "function" &&
                  deletedId
                ) {
                  onCollabElementDelete(pageId, deletedId);
                }

                setSelectedId(null);
                setSelectedBox(null);
              }}
              onEdit={() => {
                const hit = strokes.find((s) => s.id === selectedId);
                if (!hit) return;

                if (typeof setRealtimeText === "function")
                  setRealtimeText({ id: hit.id, ...hit });

                setEditorProps({
                  x: hit.x,
                  y: hit.y,
                  tool: hit.tool,
                  data: hit,
                });
                setEditorVisible(true);
              }}
            />
          )}

        <InlineTextEditor
          visible={editorVisible}
          x={(editorProps.x || 0) - (page?.x || 0)}
          y={(editorProps.y || 0) - (page?.y || 0) + 2}
          initialText={editorProps.data?.text || ""}
          initialData={editorProps.data}
          isEditingExisting={!!selectedId}
          onCancel={() => {
            setEditorVisible(false);
            setSelectedId(null);
            setSelectedBox(null);
            setRealtimeText?.(null);
          }}
          onSubmit={(data) => {
            if (tempStrokeId) {
              // First commit of new sticky/comment/text: actually add the stroke now
              if (typeof onAddStroke === "function") {
                const newStroke = {
                  id: tempStrokeId,
                  tool: editorProps.tool,
                  x: editorProps.x,
                  y: editorProps.y,
                  ...data,
                  layerId: activeLayerId,
                };
                onAddStroke(newStroke);
              }
              setTempStrokeId(null);
            } else if (selectedId) {
              // Update existing stroke
              const index = strokes.findIndex((s) => s.id === selectedId);
              if (index !== -1 && typeof onModifyStroke === "function") {
                onModifyStroke(index, {
                  ...data,
                  x: editorProps.x,
                  y: editorProps.y,
                });
              }
            } else {
              // Add new stroke
              if (typeof onAddStroke === "function") {
                const newStroke = {
                  id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  tool: editorProps.tool,
                  x: editorProps.x,
                  y: editorProps.y,
                  ...data,
                  layerId: activeLayerId,
                };
                onAddStroke(newStroke);
              }
            }

            setRealtimeText?.(null);
            setEditorVisible(false);
            setSelectedId(null);
            setSelectedBox(null);
          }}
          onChange={handleTextChange}
        />
        {selectedId &&
          selectedBox &&
          ["image", "sticker", "table"].includes(selectedStroke?.tool) && (
            <>
              <ImageTransformBox
                x={selectedBox.x}
                y={selectedBox.y}
                width={selectedBox.width}
                height={selectedBox.height}
                rotation={selectedBox.rotation ?? 0}
                scale={zoomMirror.scale}
                pan={{ x: -(page?.x || 0), y: -(page?.y || 0) + 20 }}
                onMoveStart={() => {
                  const sItem = strokes.find((it) => it.id === selectedId);

                  // ✅ CRITICAL FIX: Always use selectedBox as fallback for template images
                  // Template images may not have x/y in initial state
                  if (sItem) {
                    liveTransformRef.current.origin = {
                      x: Number.isFinite(sItem.x)
                        ? sItem.x
                        : selectedBox?.x ?? 0,
                      y: Number.isFinite(sItem.y)
                        ? sItem.y
                        : selectedBox?.y ?? 0,
                      rotation: sItem.rotation ?? selectedBox?.rotation ?? 0,
                    };
                  } else if (selectedBox) {
                    liveTransformRef.current.origin = {
                      x: selectedBox.x ?? 0,
                      y: selectedBox.y ?? 0,
                      rotation: selectedBox.rotation ?? 0,
                    };
                  }
                  liveTransformRef.current.dx = 0;
                  liveTransformRef.current.dy = 0;
                  liveTransformRef.current.dw = 0;
                  liveTransformRef.current.dh = 0;
                  liveTransformRef.current.drot = 0;
                }}
                onMove={(dx, dy) => {
                  if (!selectedId) return;
                  const newBox = {
                    ...selectedBox,
                    x: selectedBox.x + dx,
                    y: selectedBox.y + dy,
                  };
                  setSelectedBox(newBox);
                  onSelectionChange?.(selectedId, newBox);

                  liveTransformRef.current.dx =
                    (liveTransformRef.current.dx || 0) + dx;
                  liveTransformRef.current.dy =
                    (liveTransformRef.current.dy || 0) + dy;
                  if (
                    typeof onLiveUpdateStroke === "function" &&
                    liveTransformRef.current.origin
                  ) {
                    const origin = liveTransformRef.current.origin;
                    onLiveUpdateStroke(selectedId, {
                      x: (origin.x ?? 0) + (liveTransformRef.current.dx || 0),
                      y: (origin.y ?? 0) + (liveTransformRef.current.dy || 0),
                    });
                  }
                }}
                onMoveEnd={() => {
                  const index = strokes.findIndex((s) => s.id === selectedId);
                  if (index !== -1) {
                    const sItem = strokes[index];
                    const origin = liveTransformRef.current.origin;
                    const final = {
                      ...sItem,
                      x:
                        (origin?.x ?? sItem.x ?? 0) +
                        (liveTransformRef.current.dx || 0),
                      y:
                        (origin?.y ?? sItem.y ?? 0) +
                        (liveTransformRef.current.dy || 0),
                      width:
                        (origin?.width ?? sItem.width ?? 0) +
                        (liveTransformRef.current.dw || 0),
                      height:
                        (origin?.height ?? sItem.height ?? 0) +
                        (liveTransformRef.current.dh || 0),
                      rotation:
                        (origin?.rotation ?? sItem.rotation ?? 0) +
                        (liveTransformRef.current.drot || 0),
                    };
                    if (typeof onModifyStroke === "function")
                      onModifyStroke(index, final);

                    // 🔄 REALTIME COLLABORATION: Send position update to other users
                    if (
                      collabEnabled &&
                      collabConnected &&
                      typeof onCollabElementUpdate === "function"
                    ) {
                      const changes = {
                        x: final.x,
                        y: final.y,
                      };
                      // Only send width/height if they changed (resize, not just move)
                      if (
                        liveTransformRef.current.dw !== 0 ||
                        liveTransformRef.current.dh !== 0
                      ) {
                        changes.width = final.width;
                        changes.height = final.height;
                      }
                      // Only send rotation if it changed
                      if (liveTransformRef.current.drot !== 0) {
                        changes.rotation = final.rotation;
                      }
                      onCollabElementUpdate(pageId, selectedId, changes, {
                        transient: false,
                      });
                    }
                  }
                  liveTransformRef.current.dx = 0;
                  liveTransformRef.current.dy = 0;
                  liveTransformRef.current.dw = 0;
                  liveTransformRef.current.dh = 0;
                  liveTransformRef.current.drot = 0;
                }}
                onResizeStart={(corner) => {
                  const sItem = strokes.find((it) => it.id === selectedId);
                  const base = sItem || selectedBox || {};

                  // ✅ CRITICAL FIX: For template images, prioritize selectedBox dimensions
                  // selectedBox is always updated and reflects current visual state
                  const baseWidth =
                    selectedBox?.width && selectedBox.width > 0
                      ? selectedBox.width
                      : base.width && base.width > 0
                        ? base.width
                        : sItem?.naturalWidth || 100;
                  const baseHeight =
                    selectedBox?.height && selectedBox.height > 0
                      ? selectedBox.height
                      : base.height && base.height > 0
                        ? base.height
                        : sItem?.naturalHeight || 100;

                  liveTransformRef.current.origin = {
                    x: Number.isFinite(base.x) ? base.x : selectedBox?.x ?? 0,
                    y: Number.isFinite(base.y) ? base.y : selectedBox?.y ?? 0,
                    width: baseWidth,
                    height: baseHeight,
                    rotation: base.rotation ?? selectedBox?.rotation ?? 0,
                  };
                  liveTransformRef.current.corner = corner;
                  liveTransformRef.current.dw = 0;
                  liveTransformRef.current.dh = 0;
                  liveTransformRef.current.dx = 0;
                  liveTransformRef.current.dy = 0;
                }}
                onResize={(corner, dx, dy) => {
                  const o = liveTransformRef.current.origin;
                  if (!o) return;
                  const ratio = (o.width || 1) / (o.height || 1);
                  let newWidth = o.width;
                  let newHeight = o.height;
                  let newX = o.x;
                  let newY = o.y;

                  switch (corner) {
                    case "br":
                      newWidth = Math.max(20, o.width + dx);
                      newHeight = Math.max(20, newWidth / ratio);
                      break;
                    case "tr":
                      newWidth = Math.max(20, o.width + dx);
                      newHeight = Math.max(20, newWidth / ratio);
                      newY = o.y - (newHeight - o.height);
                      break;
                    case "bl":
                      newWidth = Math.max(20, o.width - dx);
                      newHeight = Math.max(20, newWidth / ratio);
                      newX = o.x + dx;
                      break;
                    case "tl":
                      newWidth = Math.max(20, o.width - dx);
                      newHeight = Math.max(20, newWidth / ratio);
                      newX = o.x + dx;
                      newY = o.y - (newHeight - o.height);
                      break;
                  }
                  liveTransformRef.current.dw = newWidth - o.width;
                  liveTransformRef.current.dh = newHeight - o.height;
                  liveTransformRef.current.dx = newX - o.x;
                  liveTransformRef.current.dy = newY - o.y;

                  const newBox = {
                    ...selectedBox,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                  };
                  setSelectedBox(newBox);
                  onSelectionChange?.(selectedId, newBox);

                  if (typeof onLiveUpdateStroke === "function" && selectedId) {
                    onLiveUpdateStroke(selectedId, {
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight,
                    });
                    return;
                  }

                  const index = strokes.findIndex((s) => s.id === selectedId);
                  if (index !== -1 && typeof onModifyStroke === "function") {
                    onModifyStroke(index, {
                      x: newX,
                      y: newY,
                      width: newWidth,
                      height: newHeight,
                      __transient: true,
                    });
                  }
                }}
                onResizeEnd={() => {
                  const index = strokes.findIndex((s) => s.id === selectedId);
                  if (index !== -1) {
                    const sItem = strokes[index];
                    const o = liveTransformRef.current.origin || sItem;
                    const final = {
                      ...sItem,
                      x: (o.x ?? 0) + (liveTransformRef.current.dx || 0),
                      y: (o.y ?? 0) + (liveTransformRef.current.dy || 0),
                      width:
                        (o.width ?? 0) + (liveTransformRef.current.dw || 0),
                      height:
                        (o.height ?? 0) + (liveTransformRef.current.dh || 0),
                    };
                    if (typeof onModifyStroke === "function")
                      onModifyStroke(index, final);

                    // 🔄 REALTIME COLLABORATION: Send resize update to other users
                    if (
                      collabEnabled &&
                      collabConnected &&
                      typeof onCollabElementUpdate === "function"
                    ) {
                      const changes = {
                        x: final.x,
                        y: final.y,
                        width: final.width,
                        height: final.height,
                      };
                      onCollabElementUpdate(pageId, selectedId, changes, {
                        transient: false,
                      });
                    }
                  }
                  liveTransformRef.current.dx = 0;
                  liveTransformRef.current.dy = 0;
                  liveTransformRef.current.dw = 0;
                  liveTransformRef.current.dh = 0;
                }}
                onRotateStart={() => {
                  const sItem = strokes.find((it) => it.id === selectedId);
                  const base = sItem || selectedBox;
                  liveTransformRef.current.origin = {
                    ...(liveTransformRef.current.origin || {}),
                    rotation: base?.rotation ?? 0,
                  };
                  liveTransformRef.current.drot = 0;
                }}
                onRotate={(rot) => {
                  const originRot =
                    liveTransformRef.current.origin?.rotation || 0;
                  liveTransformRef.current.drot = rot - originRot;
                  const newBox = { ...selectedBox, rotation: rot };
                  setSelectedBox(newBox);
                  onSelectionChange?.(selectedId, newBox);
                  if (typeof onLiveUpdateStroke === "function" && selectedId) {
                    onLiveUpdateStroke(selectedId, { rotation: rot });
                  }
                }}
                onRotateEnd={() => {
                  const index = strokes.findIndex((s) => s.id === selectedId);
                  if (index !== -1) {
                    const sItem = strokes[index];
                    const originRot =
                      liveTransformRef.current.origin?.rotation ||
                      sItem.rotation ||
                      0;
                    const finalRot =
                      originRot + (liveTransformRef.current.drot || 0);
                    if (typeof onModifyStroke === "function")
                      onModifyStroke(index, { rotation: finalRot });

                    // 🔄 REALTIME COLLABORATION: Send rotation update to other users
                    if (
                      collabEnabled &&
                      collabConnected &&
                      typeof onCollabElementUpdate === "function"
                    ) {
                      const changes = { rotation: finalRot };
                      onCollabElementUpdate(pageId, selectedId, changes, {
                        transient: false,
                      });
                    }
                  }
                  liveTransformRef.current.drot = 0;
                }}
              />

              <ImageSelectionBox
                x={(selectedBox.x || 0) - (page?.x || 0)}
                y={(selectedBox.y || 0) - (page?.y || 0)}
                width={selectedBox.width}
                height={selectedBox.height}
                onCopy={() => {
                  const target = strokes.find((s) => s.id === selectedId);
                  if (!target) return;
                  const newStroke = {
                    ...target,
                    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                    x: target.x + 20,
                    y: target.y + 20,
                  };
                  onAddStroke?.(newStroke);
                  setSelectedId(null);
                  setSelectedBox(null);
                  onSelectionChange?.(null, null);
                }}
                onCut={() => {
                  const index = strokes.findIndex((s) => s.id === selectedId);
                  const deletedId = selectedId; // Capture before clearing
                  if (index !== -1 && typeof onDeleteStroke === "function")
                    onDeleteStroke(index);

                  // 🔄 REALTIME COLLABORATION: Send delete event
                  if (
                    collabEnabled &&
                    collabConnected &&
                    typeof onCollabElementDelete === "function" &&
                    deletedId
                  ) {
                    onCollabElementDelete(pageId, deletedId);
                  }

                  setSelectedId(null);
                  setSelectedBox(null);
                  onSelectionChange?.(null, null);
                }}
                onDelete={() => {
                  const index = strokes.findIndex((s) => s.id === selectedId);
                  const deletedId = selectedId; // Capture before clearing
                  if (index !== -1 && typeof onDeleteStroke === "function")
                    onDeleteStroke(index);

                  // 🔄 REALTIME COLLABORATION: Send delete event
                  if (
                    collabEnabled &&
                    collabConnected &&
                    typeof onCollabElementDelete === "function" &&
                    deletedId
                  ) {
                    onCollabElementDelete(pageId, deletedId);
                  }

                  setSelectedId(null);
                  setSelectedBox(null);
                  onSelectionChange?.(null, null);
                }}
              />
            </>
          )}
      </>
    );
  }
);

export default GestureHandler;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  hint: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  input: {
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  cancel: { backgroundColor: "#F3F4F6" },
  ok: { backgroundColor: "#2563EB" },
  btnText: { fontSize: 14, color: "#111827" },
});
