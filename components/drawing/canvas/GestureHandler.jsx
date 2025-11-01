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
import {
  getRulerEdges,
  projectPointOnSegment,
  constrainToRulerBarrier,
  distanceToSegment,
  SNAP_THRESHOLD,
} from "../ruler/rulerUtils.jsx";

export default function GestureHandler(
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
    isPenMode,
    canvasRef,
    setRealtimeText,
    zoomState,
    onSelectStroke,
    activeLayerId,
    onLiveUpdateStroke,
    rulerPosition,
    onRulerMoveStart,
    onRulerMoveEnd,
    scrollOffsetY = 0,
    onColorPicked, // 👈 Thêm prop
  },
  ref
) {
  // Expose resetRulerLock function to parent components
  useImperativeHandle(ref, () => ({
    resetRulerLock: () => {
      rulerLockRef.current = null;
    },
  }));
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

    // Thresh dùng để xác định một chunk "quá ngắn" (sẽ bị loại)
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
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i],
        p2 = pts[i + 1];
      for (let s = 0; s < eSegs.length; s++) {
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
        if (d <= radius + (stroke.width || 6) * 0.5) {
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
      } else {
        // small chunk — likely the "dot" artifact — skip it
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
  // Ruler lock state: store only which edge to lock to ('top'|'bottom') to avoid stale coords
  const rulerLockRef = useRef(null); // { edge: 'top'|'bottom' } or null
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorProps, setEditorProps] = useState({
    x: 0,
    y: 0,
    tool: "text",
    data: {},
  });

  const [draggingText, setDraggingText] = useState(null);
  const [tempStrokeId, setTempStrokeId] = useState(null);
  const getActiveStrokes = useCallback(() => {
    return strokes.filter(
      (s) =>
        (!activeLayerId || s.layerId === activeLayerId) && (s.visible ?? true)
    );
  }, [strokes, activeLayerId]);

  const [lassoPoints, setLassoPoints] = useState([]);

  // Hàm xử lý snap point dựa trên ruler
  const snapPointToRuler = (point) => {
    if (!rulerPosition || !point) return point;

    try {
      // Chuyển đổi tọa độ từ màn hình sang canvas nếu cần
      const canvasPoint = convertOverlayToCanvas
        ? convertOverlayToCanvas(point, zoomState)
        : point;

      // QUAN TRỌNG: Luôn sử dụng vị trí mới nhất của ruler, không sử dụng cache
      // Điều này đảm bảo rằng khi ruler được di chuyển, vị trí mới sẽ được sử dụng ngay lập tức
      const canvasRuler = screenRulerToCanvasRuler(rulerPosition, false);
      if (!canvasRuler) return point;

      // Áp dụng snap to ruler với vị trí ruler đã chuyển đổi
      const snappedPoint = snapToRuler(canvasPoint, canvasRuler);

      // Nếu điểm bị snap
      if (
        snappedPoint.x !== canvasPoint.x ||
        snappedPoint.y !== canvasPoint.y
      ) {
        return {
          x: snappedPoint.x,
          y: snappedPoint.y,
          pressure: point.pressure || 0.5,
        };
      }
    } catch (error) {}

    return point;
  };
  const [lassoSelection, setLassoSelection] = useState([]);
  const [isMovingLasso, setIsMovingLasso] = useState(false);
  const [lassoOrigin, setLassoOrigin] = useState(null);
  const [lassoMoveStart, setLassoMoveStart] = useState(null);
  const lassoMoveRAF = useRef(false);
  const lassoPendingDelta = useRef({ dx: 0, dy: 0 });
  const [lassoBaseBox, setLassoBaseBox] = useState(null);
  const [lassoVisualOffset, setLassoVisualOffset] = useState({ dx: 0, dy: 0 });
  const [visualOffsets, setVisualOffsets] = useState({});
  // --- Batching helpers for visual offsets (cheap, updated via RAF) ---
  const visualOffsetsRef = useRef({}); // single source-of-truth for transient offsets (no rerenders)
  const visualFlushRaf = useRef(false); // ensure one RAF flush at a time

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

  // Store ruler move callbacks in refs to avoid stale closures
  const onRulerMoveStartRef = useRef(onRulerMoveStart);
  const onRulerMoveEndRef = useRef(onRulerMoveEnd);

  useEffect(() => {
    onRulerMoveStartRef.current = onRulerMoveStart;
    onRulerMoveEndRef.current = onRulerMoveEnd;
  }, [onRulerMoveStart, onRulerMoveEnd]);

  // Invalidate cached ruler conversion and clear lock whenever rulerPosition updates
  useEffect(() => {
    try {
      invalidateRulerCache();
      rulerLockRef.current = null;
    } catch {}
  }, [rulerPosition]);

  // Reset ruler lock when ruler position changes significantly (indicating movement)
  const lastRulerPositionForLock = useRef(null);
  useEffect(() => {
    if (rulerPosition && lastRulerPositionForLock.current) {
      const prev = lastRulerPositionForLock.current;
      const curr = rulerPosition;

      // Check if ruler moved significantly (more than 5 pixels)
      const dx = Math.abs(curr.x - prev.x);
      const dy = Math.abs(curr.y - prev.y);
      const dRot = Math.abs((curr.rotation || 0) - (prev.rotation || 0));

      if (dx > 5 || dy > 5 || dRot > 1) {
        // Ruler moved significantly, reset lock
        rulerLockRef.current = null;
      }
    }

    if (rulerPosition) {
      lastRulerPositionForLock.current = { ...rulerPosition };
    }
  }, [rulerPosition]);

  // useEffect(() => {
  //   console.log("📍 GestureHandler received rulerPosition:", rulerPosition);
  //   if (rulerPosition) {
  //     console.log("   -> Has ruler data:", {
  //       x: rulerPosition.x,
  //       y: rulerPosition.y,
  //       rotation: rulerPosition.rotation,
  //       scale: rulerPosition.scale,
  //     });
  //   } else {
  //     console.log("   -> Ruler position is NULL");
  //   }
  // }, [rulerPosition]);

  // Cache canvas ruler to avoid recalculating every frame
  const canvasRulerCache = useRef(null);
  const lastRulerPositionRef = useRef(null);

  // convert ruler coordinates (from overlay / screen) -> canvas coordinates used by e.x/e.y
  const screenRulerToCanvasRuler = (r, useCache = false) => {
    // Mặc định KHÔNG sử dụng cache
    if (!r) {
      canvasRulerCache.current = null;
      lastRulerPositionRef.current = null;
      return null;
    }

    // QUAN TRỌNG: Luôn sử dụng vị trí mới nhất của ruler từ prop, không sử dụng cache
    // Điều này đảm bảo rằng khi ruler được di chuyển, vị trí mới sẽ được sử dụng ngay lập tức
    if (
      useCache === false ||
      !canvasRulerCache.current ||
      !lastRulerPositionRef.current
    ) {
      // Không sử dụng cache khi useCache=false hoặc chưa có cache
    } else {
      // Kiểm tra xem vị trí ruler có thay đổi không
      const positionChanged =
        Math.abs(r.x - lastRulerPositionRef.current.x) > 0.1 ||
        Math.abs(r.y - lastRulerPositionRef.current.y) > 0.1 ||
        r.rotation !== lastRulerPositionRef.current.rotation ||
        r.scale !== lastRulerPositionRef.current.scale;

      // Nếu vị trí không thay đổi, trả về cache
      if (!positionChanged) {
        return canvasRulerCache.current;
      }

      // Log khi phát hiện thay đổi vị trí
    }

    // Log input values for debugging - LUÔN HIỂN THỊ GIÁ TRỊ MỚI NHẤT
    const rawW = Number.isFinite(r.width) ? r.width : undefined;
    const rawH = Number.isFinite(r.height) ? r.height : undefined;

    let useWidth = Number.isFinite(rawW) && rawW > 0 ? rawW : page?.w ?? 600;
    let useHeight = Number.isFinite(rawH) && rawH > 0 ? rawH : 60;

    const s = zoomMirror?.scale || 1;
    const tx = zoomMirror?.x || 0;
    const ty = zoomMirror?.y || 0;

    const canvasX = (r.x - (page?.x ?? 0) - tx) / s;
    const canvasY = (r.y - (page?.y ?? 0) - ty - (scrollOffsetY || 0)) / s;

    const screenW = useWidth * (r.scale ?? 1);
    const screenH = useHeight * (r.scale ?? 1);
    const canvasW = screenW / s;
    const canvasH = screenH / s;

    const result = {
      x: canvasX,
      y: canvasY,
      rotation: r.rotation ?? 0,
      width: canvasW,
      height: canvasH,
      scale: 1,
      strokeWidth: r.strokeWidth ?? 2,
      _originalScreenPosition: { x: r.x, y: r.y }, // Keep original for debugging
    };

    // ✅ cache only the latest result, without blocking updates
    canvasRulerCache.current = result;
    lastRulerPositionRef.current = {
      x: r.x,
      y: r.y,
      rotation: r.rotation ?? 0,
      scale: r.scale ?? 1,
      width: canvasW,
      height: canvasH,
      strokeWidth: r.strokeWidth ?? 2,
    };

    return result;
  };

  // Function to invalidate cache
  const invalidateRulerCache = () => {
    canvasRulerCache.current = null;
    lastRulerPositionRef.current = null;
  };

  useAnimatedReaction(
    () => ({
      s: zoomState?.scale?.value ?? 1,
      x: zoomState?.translateX?.value ?? 0,
      y: zoomState?.translateY?.value ?? 0,
    }),
    (vals) => {
      runOnJS(setZoomMirror)({ scale: vals.s, x: vals.x, y: vals.y });
      runOnJS(invalidateRulerCache)();
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
    () => strokes.find((s) => s.id === selectedId),
    [strokes, selectedId]
  );

  const { handleMoveCommit } = useLassoTransform({
    strokes,
    lassoSelection,
    activeLayerId,
    onModifyStroke,
    onModifyStrokesBulk,
  });

  useEffect(() => {
    if (!selectedStroke) return;
    if (!["image", "sticker"].includes(selectedStroke.tool)) return;

    setSelectedBox({
      x: selectedStroke.x ?? 0,
      y: selectedStroke.y ?? 0,
      width: selectedStroke.width ?? 100,
      height: selectedStroke.height ?? 100,
      rotation: selectedStroke.rotation ?? 0,
    });
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
    .onStart((e) => {
      const validStrokes = getActiveStrokes?.() || [];
      const hit = hitTestText(e.x, e.y, validStrokes);
      if (!hit) return;

      if (hit.tool === "emoji") {
        setSelectedId(hit.id);
        onSelectStroke?.(hit.id);

        setSelectedBox({
          x: hit.x - (hit.padding || 0) - 1,
          y: hit.y - (hit.fontSize || 18) / 2 - (hit.padding || 0) - 1,
          width:
            (hit.text?.length || 1) * (hit.fontSize || 18) * 0.6 +
            (hit.padding || 0) * 2 +
            2,
          height: (hit.fontSize || 18) + (hit.padding || 0) * 2 + 2,
        });
        return;
      }

      if (hit.tool === "text") {
        setSelectedId(hit.id);
        onSelectStroke?.(hit.id);
        setSelectedBox(null);

        if (typeof setRealtimeText === "function") {
          setRealtimeText({ id: hit.id, ...hit });
        }

        setEditorProps({
          x: hit.x,
          y: hit.y,
          tool: hit.tool,
          data: hit,
        });
        setEditorVisible(true);
      }
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart((e) => {
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

          // if (typeof __DEV__ !== "undefined" && __DEV__) {
          //   console.log("🎨 Eyedropper picked color:", hit.color);
          // }
        } else {
          // Check other strokes (shapes, lines, etc.)
          const activeStrokes = visible;
          for (let i = activeStrokes.length - 1; i >= 0; i--) {
            const s = activeStrokes[i];
            if (!s.points) continue;

            // Kiểm tra xem có phải shape với fill không
            const isShape =
              s.tool &&
              ["rectangle", "circle", "triangle", "star", "polygon"].includes(
                s.tool
              );
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
                } else if (s.tool === "rectangle") {
                  // Rectangle luôn trong bbox
                  isInside = true;
                } else if (
                  s.tool === "triangle" ||
                  s.tool === "star" ||
                  s.tool === "polygon"
                ) {
                  // Dùng pointInPolygon
                  isInside = pointInPolygon(e.x, e.y, s.points);
                }

                if (isInside) {
                  // Tap vào bên trong shape có fill → lấy fillColor
                  setColor?.(s.fillColor);
                  onColorPicked?.(s.fillColor);
                  if (typeof __DEV__ !== "undefined" && __DEV__) {
                    // console.log(
                    //   "🎨 Eyedropper picked fill color:",
                    //   s.fillColor
                    // );
                  }
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
                // if (typeof __DEV__ !== "undefined" && __DEV__) {
                //   console.log("🎨 Eyedropper picked stroke color:", s.color);
                // }
                return;
              }
            }
          }
        }
        return;
      }

      // 🧩 Nếu tap ra ngoài và đang có lasso selection → hủy chọn
      if (lassoSelection.length > 0) {
        setLassoSelection([]);
        setLassoPoints([]);
        return;
      }

      const hitImage = hitTestImage(e.x, e.y, strokes);
      if (hitImage) {
        setSelectedId(hitImage.id);
        setSelectedBox({
          x: hitImage.x,
          y: hitImage.y,
          width: hitImage.width,
          height: hitImage.height,
          rotation: hitImage.rotation ?? 0,
        });
        setEditorVisible(false);
        return;
      }

      const hit = hitTestText(e.x, e.y, strokes);
      if (!hit) {
        // If a selection is active, empty tap should only clear it and return
        const hadSelection = !!(selectedId || selectedBox);
        if (selectedId && selectedBox) {
          const stroke = strokes.find((s) => s.id === selectedId);
          if (
            stroke &&
            ["text", "sticky", "comment", "emoji"].includes(stroke.tool)
          ) {
            const padding = stroke.padding || 0;
            const fontSize = stroke.fontSize || 18;
            const origBoxX = stroke.x - padding - 1;
            const origBoxY =
              stroke.tool === "emoji"
                ? stroke.y - fontSize / 2 - padding - 1
                : stroke.y - fontSize - padding - 1;
            const dx = selectedBox.x - origBoxX;
            const dy = selectedBox.y - origBoxY;

            const index = strokes.findIndex((s) => s.id === selectedId);
            if (index !== -1 && typeof onModifyStroke === "function") {
              onModifyStroke(index, {
                x: (stroke.x ?? 0) + dx,
                y: (stroke.y ?? 0) + dy,
              });
            }
          }
        }
        // If there is a pending text resize, finalize it before clearing selection
        if (textResizeRef.current && selectedId && selectedBox) {
          const snap = textResizeRef.current;
          const s = strokes.find((st) => st.id === selectedId);
          if (snap && s) {
            const pad = snap.padding || 0;
            const newFont = Math.max(
              8,
              Math.round((selectedBox.height || 0) - pad * 2)
            );
            const tx = (selectedBox.x || 0) + pad;
            const ty = (selectedBox.y || 0) + newFont + pad;
            const index = strokes.findIndex((st) => st.id === selectedId);
            if (index !== -1 && typeof onModifyStroke === "function") {
              onModifyStroke(index, { x: tx, y: ty, fontSize: newFont });
            }
            textResizeRef.current = null;
          }
        }
        setSelectedId(null);
        setSelectedBox(null);
        setRealtimeText(null);
        // After clearing an active selection, do not open editor in the same tap
        if (hadSelection && ["text", "sticky", "comment"].includes(tool))
          return;

        // If no selection was active, and tool is text/sticky/comment, open editor on empty tap
        if (!hadSelection && ["text", "sticky", "comment"].includes(tool)) {
          const tempId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
          setEditorProps({ x: e.x, y: e.y, tool, data: { id: tempId, tool } });
          setEditorVisible(true);
          return;
        }
        return;
      }

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

      setSelectedId(null);
      setSelectedBox(null);
    });

  const pan = Gesture.Pan()
    .minDistance(1)
    .minPointers(1)
    .maxPointers(1) // Chỉ nhận khi có 1 ngón tay để tránh conflict với zoom
    .runOnJS(true)
    .onStart((e) => {
      // local copy of pointer coords — avoid mutating event directly
      let px = e.x;
      let py = e.y;
      const pressure = e.pressure ?? 0.5;

      // Áp dụng snap to ruler khi bắt đầu vẽ
      if (
        tool === "pen" &&
        isPenMode &&
        rulerPosition &&
        typeof snapPointToRuler === "function"
      ) {
        const p = { x: px, y: py, pressure };
        const snapped = snapPointToRuler(p);
        if (
          snapped &&
          Number.isFinite(snapped.x) &&
          Number.isFinite(snapped.y)
        ) {
          px = snapped.x;
          py = snapped.y;
        }
      }

      // === defensive hit-test + RULER logic: chuyển screen -> canvas, tính cạnh, set lock, apply barrier ===
      try {
        if (rulerPosition && typeof screenRulerToCanvasRuler === "function") {
          const canvasRuler = screenRulerToCanvasRuler(rulerPosition, false);
          // debug (tạm)
          // console.debug('[RULER] canvasRuler', canvasRuler);

          if (canvasRuler) {
            // compute edges once
            const edges = getRulerEdges(canvasRuler);
            if (edges && edges.topEdge && edges.bottomEdge) {
              // distances from initial pointer to both edges
              const dTop = distanceToSegment(
                px,
                py,
                edges.topEdge.x1,
                edges.topEdge.y1,
                edges.topEdge.x2,
                edges.topEdge.y2
              );
              const dBottom = distanceToSegment(
                px,
                py,
                edges.bottomEdge.x1,
                edges.bottomEdge.y1,
                edges.bottomEdge.x2,
                edges.bottomEdge.y2
              );

              const minD = Math.min(dTop, dBottom);
              const snapThreshold =
                typeof SNAP_THRESHOLD !== "undefined" ? SNAP_THRESHOLD : 30;
              const isNearEdge = minD <= snapThreshold;

              // Nếu pointer nằm bên trong vùng ruler bounding box + margin, treat as starting on/near ruler
              const RULER_TOUCH_MARGIN = 8;
              const rx = canvasRuler.x ?? 0;
              const ry = canvasRuler.y ?? 0;
              const rw = canvasRuler.width ?? canvasRuler.w ?? 0;
              const rh = canvasRuler.height ?? canvasRuler.h ?? 0;
              const insideRect =
                px >= rx - RULER_TOUCH_MARGIN &&
                px <= rx + rw + RULER_TOUCH_MARGIN &&
                py >= ry - RULER_TOUCH_MARGIN &&
                py <= ry + rh + RULER_TOUCH_MARGIN;

              // set precise lock if very near an edge
              if (isNearEdge && insideRect) {
                rulerLockRef.current = {
                  edge: dTop <= dBottom ? "top" : "bottom",
                };
              } else {
                rulerLockRef.current = null;
              }

              // apply barrier/snap for first point (prevPoint = null)
              try {
                // Luôn lấy vị trí ruler mới nhất, không sử dụng cache
                const latestCanvasRuler = screenRulerToCanvasRuler(
                  rulerPosition,
                  false
                );
                const constrained = constrainToRulerBarrier(
                  { x: px, y: py },
                  null,
                  latestCanvasRuler || canvasRuler
                );
                if (
                  constrained &&
                  Number.isFinite(constrained.x) &&
                  Number.isFinite(constrained.y)
                ) {
                  px = constrained.x;
                  py = constrained.y;
                }
              } catch (errCon) {
                console.warn("[RULER] constrainToRulerBarrier failed", errCon);
              }

              // debug info
              // console.debug('[RULER] dTop,dBottom,minD,isNearEdge,lock', dTop, dBottom, minD, isNearEdge, rulerLockRef.current);
            }
          }
        }
      } catch (err) {
        console.warn("ruler lock check failed:", err);
      }

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
              const isNear = s.points.some((p) => {
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
          return;
        }
      }

      if (tool === "lasso") {
        setLassoPoints([{ x: px, y: py }]);
        setLassoSelection([]);
        setIsMovingLasso(false);
        return;
      }

      // Các logic text/drag init (giữ nguyên) - nhưng dùng px/py thay vì e.x/e.y
      const validStrokes = strokes.filter(
        (s) => s.layerId === activeLayerId && (s.visible ?? true)
      );
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
      const last = liveRef.current.at(-1) || { x: 0, y: 0 };
      const dx = px - last.x;
      const dy = py - last.y;
      if (dx * dx + dy * dy < 9) return;

      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      // create the point object that will be pushed; later onUpdate you will apply lock/project for subsequent points
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
        requestAnimationFrame(() => {
          rafScheduled.current = false;
          setCurrentPoints([...liveRef.current]);
        });
      }
    })

    .onUpdate((e) => {
      // Early guards
      if (["image", "sticker", "camera", "eyedropper", "table"].includes(tool))
        return;
      if (!isInsidePage(e.x, e.y, page)) return;

      // If moving lasso selection
      if (tool === "lasso" && isMovingLasso && lassoOrigin) {
        const dx = e.x - lassoMoveStart.x;
        const dy = e.y - lassoMoveStart.y;
        setLassoVisualOffset({ dx, dy });
        setVisualOffsets(() => {
          const next = {};
          lassoSelection.forEach((id) => {
            next[id] = { dx, dy };
          });
          return next;
        });
        return;
      }

      // --- Nếu đang vẽ vùng lasso mới ---
      if (tool === "lasso" && !isMovingLasso) {
        setLassoPoints((prev) => [...prev, { x: e.x, y: e.y }]);
        setCurrentPoints((prev) => [...(prev ?? []), { x: e.x, y: e.y }]);
        return;
      }

      // Các xử lý khác giữ nguyên (text dragging, eraser, normal drawing...)
      const validStrokes = strokes.filter(
        (s) => s.layerId === activeLayerId && (s.visible ?? true)
      );

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
            requestAnimationFrame(() => {
              rafScheduled.current = false;
              validStrokes.forEach((s, i) => {
                if (!s.points) return;
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
                    // Reset ruler lock khi xóa nét vẽ
                    if (rulerLockRef.current) {
                      rulerLockRef.current = null;
                    }
                    onDeleteStroke(globalIndex);
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
            setCurrentPoints([...liveRef.current]);
            return;
          }
          const last = liveRef.current.at(-1);
          const dx = e.x - (last?.x ?? e.x);
          const dy = e.y - (last?.y ?? e.y);
          if (dx * dx + dy * dy < 9) return;
          liveRef.current.push({ x: e.x, y: e.y });
          setCurrentPoints([...liveRef.current]);
          return;
        }

        if (eraserMode === "object") {
          const last = liveRef.current.at(-1) || { x: 0, y: 0 };
          const dx = e.x - last.x;
          const dy = e.y - last.y;
          if (dx * dx + dy * dy < 9) return;
          liveRef.current.push({ x: e.x, y: e.y });
          if (!rafScheduled.current) {
            rafScheduled.current = true;
            requestAnimationFrame(() => {
              rafScheduled.current = false;
              setCurrentPoints([...liveRef.current]);
            });
            const livePath = canvasRef?.current?.livePath;
            if (livePath) livePath.lineTo(e.x, e.y);
          }
          return;
        }
      }

      // Normal drawing path (throttle by distance)
      const last = liveRef.current.at(-1) || { x: 0, y: 0 };
      const dx = e.x - last.x;
      const dy = e.y - last.y;
      if (dx * dx + dy * dy < 9) return;

      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      // Apply ruler snapping / barrier
      let point = { x: e.x, y: e.y };
      const prevPoint = liveRef.current.at(-1) || null;

      if (rulerLockRef.current && rulerPosition) {
        try {
          // Luôn lấy vị trí ruler mới nhất, không sử dụng cache
          const canvasRuler = screenRulerToCanvasRuler(rulerPosition, false);
          const edges = canvasRuler ? getRulerEdges(canvasRuler) : null;
          const edgeSeg =
            rulerLockRef.current.edge === "bottom"
              ? edges?.bottomEdge
              : edges?.topEdge;
          if (edgeSeg) {
            point = projectPointOnSegment(
              point.x,
              point.y,
              edgeSeg.x1,
              edgeSeg.y1,
              edgeSeg.x2,
              edgeSeg.y2
            );
          }
        } catch (err) {
          console.warn("[RULER] Error applying ruler lock:", err);
        }
      } else if (rulerPosition && !["lasso", "eraser"].includes(tool)) {
        try {
          // Luôn lấy vị trí ruler mới nhất, không sử dụng cache
          const canvasRuler = screenRulerToCanvasRuler(rulerPosition, false);
          if (canvasRuler) {
            const constrainedPoint = constrainToRulerBarrier(
              point,
              prevPoint,
              canvasRuler
            );
            if (
              constrainedPoint &&
              Number.isFinite(constrainedPoint.x) &&
              Number.isFinite(constrainedPoint.y)
            ) {
              point = constrainedPoint;
            }
          }
        } catch (err) {
          console.warn("[RULER] Error applying ruler barrier:", err);
        }
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
        requestAnimationFrame(() => {
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
      if (["image", "sticker", "camera", "eyedropper", "table"].includes(tool))
        return;
      if (tool === "lasso" && !isMovingLasso && lassoPoints.length > 3) {
        const poly = lassoPoints;
        const insideIds = strokes
          .filter(
            (s) =>
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
          .map((s) => s.id);

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
        if (visualOffsetsRef.current && visualOffsetsRef.current[selectedId]) {
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

        // Clear visual offsets FIRST to prevent jumping
        setLassoVisualOffset({ dx: 0, dy: 0 });
        setVisualOffsets({});

        // Then commit with captured offset
        handleMoveCommit?.(dx, dy);

        // Update base box position
        setLassoBaseBox((box) =>
          box ? { ...box, x: box.x + dx, y: box.y + dy } : box
        );

        // Clean up
        lassoPendingDelta.current = { dx: 0, dy: 0 };
        lassoMoveRAF.current = false;
        setIsMovingLasso(false);
        setLassoMoveStart(null);
        return;
      }

      // Các xử lý cũ cuối cùng (vẽ stroke hoàn tất, eraser pixel / object ... ) - giữ nguyên
      const livePath = canvasRef?.current?.livePath;
      if (livePath) livePath.reset();

      // Clear ruler lock when stroke ends
      rulerLockRef.current = null;

      const finalPoints = liveRef.current;
      liveRef.current = [];
      setCurrentPoints([]);

      const validStrokes = strokes.filter(
        (s) => s.layerId === activeLayerId && (s.visible ?? true)
      );
      if (!activeLayerId) return;

      if (eraserMode === "object" && finalPoints.length > 2) {
        const poly = finalPoints;
        for (let i = validStrokes.length - 1; i >= 0; i--) {
          const s = validStrokes[i];
          const bbox = getBoundingBoxForStroke(s);
          if (!bbox) continue;
          const cx = (bbox.minX + bbox.maxX) / 2;
          const cy = (bbox.minY + bbox.maxY) / 2;
          if (pointInPolygon(poly, cx, cy)) {
            try {
              const globalIndex = strokes.findIndex(
                (s) => s.id === validStrokes[i].id
              );
              if (globalIndex !== -1) onDeleteStroke(globalIndex);
            } catch (err) {
              console.error("⚠️ Error deleting stroke:", err);
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
          if (!s || !Array.isArray(s.points) || s.points.length < 2) continue;
          const pieces = splitStrokeByEraser(s, finalPoints, eraserRadius);
          if (pieces.length === 1 && pieces[0] === s) continue; // unchanged
          const globalIndex = strokes.findIndex((x) => x.id === s.id);
          if (globalIndex !== -1) {
            mutations.push({ globalIndex, pieces, layerId: s.layerId });
          }
        }

        // Apply deletes in descending index order to avoid reindexing issues
        mutations
          .map((m) => m.globalIndex)
          .sort((a, b) => b - a)
          .forEach((idx) => {
            // Reset ruler lock khi xóa nhiều nét vẽ
            if (rulerLockRef.current) {
              rulerLockRef.current = null;
            }
            onDeleteStroke?.(idx);
          });

        // Add new pieces after deletions
        mutations.forEach(({ pieces, layerId }) => {
          pieces.forEach((ns) => onAddStroke?.({ ...ns, layerId }));
        });

        // 2) Always persist a composite eraser stroke to subtract fill areas
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
              onModifyStroke?.(i, { fill: true, fillColor: color });
            } catch (err) {
              console.error("⚠️ Error modifying fill:", err);
            }
            break;
          }
        }
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
        points: finalPoints,
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
        const shape = detectShape(finalPoints);
        if (shape) Object.assign(newStroke, shape);
      }

      if (tool !== "eraser" && typeof onAddStroke === "function") {
        try {
          onAddStroke(newStroke);
        } catch (err) {
          console.error("⚠️ Error adding stroke:", err);
        }
      }
    });

  const lassoBox = useMemo(() => {
    // While moving (either via canvas or box), render box as base + visual offset
    if (
      lassoBaseBox &&
      ((lassoVisualOffset?.dx || 0) !== 0 ||
        (lassoVisualOffset?.dy || 0) !== 0 ||
        isMovingLasso)
    ) {
      return {
        x: lassoBaseBox.x + (lassoVisualOffset.dx || 0),
        y: lassoBaseBox.y + (lassoVisualOffset.dy || 0),
        width: lassoBaseBox.width,
        height: lassoBaseBox.height,
      };
    }
    const sel = strokes.filter((s) => lassoSelection.includes(s.id));
    if (!sel.length) return null;
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
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [isMovingLasso, lassoBaseBox, lassoVisualOffset, lassoSelection, strokes]);

  return (
    <>
      <GestureDetector
        gesture={Gesture.Race(doubleTap, Gesture.Simultaneous(tap, pan))}
      >
        {React.cloneElement(children, {
          strokes: children.props.strokes ?? strokes,
          lassoPoints,
          lassoSelection,
          visualOffsets,
        })}
      </GestureDetector>
      {lassoSelection.length > 0 && lassoBox && (
        <LassoSelectionBox
          box={lassoBox}
          onMove={(dx, dy) => {
            // accumulate visual offset for box and strokes
            setLassoVisualOffset((prev) => {
              const ndx = (prev?.dx || 0) + dx;
              const ndy = (prev?.dy || 0) + dy;
              // update offsets for all selected ids
              setVisualOffsets((prevMap) => {
                const next = { ...prevMap };
                lassoSelection.forEach((id) => {
                  next[id] = { dx: ndx, dy: ndy };
                });
                return next;
              });
              return { dx: ndx, dy: ndy };
            });
          }}
          onMoveEnd={() => {
            const { dx, dy } = lassoVisualOffset || { dx: 0, dy: 0 };

            // Clear visual offsets FIRST (synchronously) to prevent jumping
            setLassoVisualOffset({ dx: 0, dy: 0 });
            setVisualOffsets({});

            // Then commit the move with the captured offset
            handleMoveCommit?.(dx, dy);

            // Update box position to match new stroke positions
            setLassoBaseBox((box) =>
              box ? { ...box, x: box.x + dx, y: box.y + dy } : box
            );
          }}
          onCopy={() => {
            const selStrokes = strokes.filter((s) =>
              lassoSelection.includes(s.id)
            );
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
            const indices = strokes
              .map((s, i) => (lassoSelection.includes(s.id) ? i : -1))
              .filter((i) => i !== -1)
              .sort((a, b) => b - a); // Sort descending để xóa từ cuối lên
            if (indices.length > 0 && rulerLockRef.current) {
              rulerLockRef.current = null;
            }
            indices.forEach((i) => onDeleteStroke?.(i));
            setLassoSelection([]);
          }}
          onDelete={() => {
            const indices = strokes
              .map((s, i) => (lassoSelection.includes(s.id) ? i : -1))
              .filter((i) => i !== -1)
              .sort((a, b) => b - a); // Sort descending để xóa từ cuối lên
            if (indices.length > 0 && rulerLockRef.current) {
              rulerLockRef.current = null;
            }
            indices.forEach((i) => onDeleteStroke?.(i));
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
            x={selectedBox.x}
            y={selectedBox.y}
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
            onMove={(dx, dy) => {
              setSelectedBox((box) =>
                box ? { ...box, x: box.x + dx, y: box.y + dy } : box
              );

              if (typeof setRealtimeText === "function") {
                requestAnimationFrame(() => {
                  setRealtimeText((prev) =>
                    prev && prev.id === selectedId
                      ? { ...prev, x: prev.x + dx, y: prev.y + dy }
                      : prev
                  );
                });
              }
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
                onModifyStroke(index, { x: tx, y: ty, fontSize: newFont });
              }

              textResizeRef.current = null;
              if (typeof setRealtimeText === "function") setRealtimeText(null);
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
              if (index !== -1 && typeof onDeleteStroke === "function")
                onDeleteStroke(index);
              setSelectedId(null);
              setSelectedBox(null);
            }}
            onDelete={() => {
              const index = strokes.findIndex((s) => s.id === selectedId);
              if (index !== -1 && typeof onDeleteStroke === "function")
                onDeleteStroke(index);
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
        x={editorProps.x}
        y={editorProps.y}
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
              {...selectedBox}
              scale={zoomMirror.scale}
              pan={{
                x: zoomMirror.x,
                y: zoomMirror.y,
              }}
              onMoveStart={() => {
                const s = strokes.find((it) => it.id === selectedId);
                if (s) {
                  liveTransformRef.current.origin = {
                    x: s.x ?? 0,
                    y: s.y ?? 0,
                    rotation: s.rotation ?? 0,
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

                // update selection box UI
                setSelectedBox((b) =>
                  b ? { ...b, x: b.x + dx, y: b.y + dy } : b
                );

                // accumulate delta into ref
                liveTransformRef.current.dx =
                  (liveTransformRef.current.dx || 0) + dx;
                liveTransformRef.current.dy =
                  (liveTransformRef.current.dy || 0) + dy;

                // propagate live update (if parent supports it)
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
              // on release / end - commit once
              onMoveEnd={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1) {
                  const s = strokes[index];
                  const final = {
                    ...s,
                    x: (s.x ?? 0) + (liveTransformRef.current.dx || 0),
                    y: (s.y ?? 0) + (liveTransformRef.current.dy || 0),
                    width: (s.width ?? 0) + (liveTransformRef.current.dw || 0),
                    height:
                      (s.height ?? 0) + (liveTransformRef.current.dh || 0),
                    rotation:
                      (s.rotation ?? 0) + (liveTransformRef.current.drot || 0),
                  };
                  if (typeof onModifyStroke === "function")
                    onModifyStroke(index, final);
                }
                // reset accumulators
                liveTransformRef.current.dx = 0;
                liveTransformRef.current.dy = 0;
                liveTransformRef.current.dw = 0;
                liveTransformRef.current.dh = 0;
                liveTransformRef.current.drot = 0;
              }}
              onResizeStart={(corner) => {
                const s = strokes.find((it) => it.id === selectedId);
                const base = s || selectedBox || {};
                // fallback width/height để tránh 0 hoặc undefined
                const baseWidth =
                  base.width && base.width > 0
                    ? base.width
                    : s?.naturalWidth || selectedBox?.width || 100;
                const baseHeight =
                  base.height && base.height > 0
                    ? base.height
                    : s?.naturalHeight || selectedBox?.height || 100;

                liveTransformRef.current.origin = {
                  x: Number.isFinite(base.x) ? base.x : 0,
                  y: Number.isFinite(base.y) ? base.y : 0,
                  width: baseWidth,
                  height: baseHeight,
                  rotation: base.rotation ?? 0,
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

                // Nếu ImageTransformBox truyền deltas đã scale -> dùng trực tiếp.
                // Nếu không chắc, bạn có thể thử chia cho scale: dx/scale (nếu cần).
                // Mình giả định ImageTransformBox đã trả về deltas ở cùng hệ với origin.

                const ratio = (o.width || 1) / (o.height || 1);
                let newWidth = o.width;
                let newHeight = o.height;
                let newX = o.x;
                let newY = o.y;

                // NOTE: convention: dx positive = pointer moved right; dy positive = pointer moved down.
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
                    // left corners: dragging left (dx negative) should increase width
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

                // Update selection box UI immediately
                setSelectedBox((box) =>
                  box
                    ? {
                        ...box,
                        x: newX,
                        y: newY,
                        width: newWidth,
                        height: newHeight,
                      }
                    : box
                );

                // If parent supports fast live update (Skia), call it
                if (typeof onLiveUpdateStroke === "function" && selectedId) {
                  onLiveUpdateStroke(selectedId, {
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                  });
                  // do NOT call onModifyStroke here (we rely on Skia live)
                  return;
                }

                // Fallback: emit a transient onModifyStroke so image updates visually during resize
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onModifyStroke === "function") {
                  onModifyStroke(index, {
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                    __transient: true, // parent can treat transient updates lightweight
                  });
                }
              }}
              onResizeEnd={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1) {
                  const s = strokes[index];
                  const o = liveTransformRef.current.origin || s;
                  const final = {
                    ...s,
                    x: (o.x ?? 0) + (liveTransformRef.current.dx || 0),
                    y: (o.y ?? 0) + (liveTransformRef.current.dy || 0),
                    width: (o.width ?? 0) + (liveTransformRef.current.dw || 0),
                    height:
                      (o.height ?? 0) + (liveTransformRef.current.dh || 0),
                  };
                  if (typeof onModifyStroke === "function")
                    onModifyStroke(index, final); // final commit (no __transient)
                }
                liveTransformRef.current.dx = 0;
                liveTransformRef.current.dy = 0;
                liveTransformRef.current.dw = 0;
                liveTransformRef.current.dh = 0;
              }}
              onRotateStart={() => {
                const s = strokes.find((it) => it.id === selectedId);
                const base = s || selectedBox;
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
                setSelectedBox((b) => (b ? { ...b, rotation: rot } : b));
                // live update rotation for the image
                if (typeof onLiveUpdateStroke === "function" && selectedId) {
                  onLiveUpdateStroke(selectedId, { rotation: rot });
                }
              }}
              onRotateEnd={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1) {
                  const s = strokes[index];
                  const originRot =
                    liveTransformRef.current.origin?.rotation ||
                    s.rotation ||
                    0;
                  const finalRot =
                    originRot + (liveTransformRef.current.drot || 0);
                  if (typeof onModifyStroke === "function")
                    onModifyStroke(index, { rotation: finalRot });
                }
                liveTransformRef.current.drot = 0;
              }}
            />

            <ImageSelectionBox
              {...selectedBox}
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
              }}
              onCut={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onDeleteStroke === "function")
                  onDeleteStroke(index);
                setSelectedId(null);
                setSelectedBox(null);
              }}
              onDelete={() => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onDeleteStroke === "function")
                  onDeleteStroke(index);
                setSelectedId(null);
                setSelectedBox(null);
              }}
            />
          </>
        )}
    </>
  );
}

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
