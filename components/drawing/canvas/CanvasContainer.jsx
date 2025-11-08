// CanvasContainer.jsx
import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import CanvasRenderer from "./CanvasRenderer";
import GestureHandler from "./GestureHandler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  useDerivedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import { Dimensions } from "react-native";

const PAGE_MARGIN_H = 24;
const PAGE_MARGIN_TOP = 20;
const PAGE_BOTTOM_SPACER = 64;

const CanvasContainer = forwardRef(function CanvasContainer(
  {
    tool,
    layers,
    activeLayerId,
    setLayers,
    color,
    setColor,
    setTool,
    strokeWidth,
    pencilWidth,
    eraserSize,
    brushWidth = 8,
    brushOpacity = 0.6,
    calligraphyWidth = 6,
    calligraphyOpacity = 0.9,
    paperStyle = "plain",
    shapeType = "auto",
    onZoomChange,
    toolConfigs = {},
    eraserMode,
    rulerPosition,
    scrollOffsetY = 0,
    scrollYShared, // ✅ Animated scroll value
    pageOffsetY = 0, // ✅ Page offset trong project
    onColorPicked,
    backgroundColor = "#FFFFFF", // 👈 Add backgroundColor prop
    pageTemplate = "blank", // 👈 Add template prop
    backgroundImageUrl = null, // 👈 Add backgroundImageUrl prop
    pageWidth = null, // 👈 Page width from noteConfig
    pageHeight = null, // 👈 Page height from noteConfig
  },
  ref
) {
  const imageRefs = useRef(new Map());
  const liveUpdateStroke = (strokeId, partial) => {
    const ref = imageRefs.current.get(strokeId);
    if (ref && typeof ref.setLiveTransform === "function") {
      ref.setLiveTransform(partial);
    }
  };
  const { width, height } = useWindowDimensions();
  // Use provided dimensions from noteConfig, or fallback to default
  const PAGE_WIDTH = pageWidth ?? width - PAGE_MARGIN_H * 2;
  const PAGE_HEIGHT = pageHeight ?? Math.round(PAGE_WIDTH * Math.SQRT2);

  const [strokes, setStrokes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [realtimeText, setRealtimeText] = useState(null);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Limit undo/redo stack size to prevent memory leak
  const MAX_UNDO_STACK = 20;

  const [showZoomOverlay, setShowZoomOverlay] = useState(false);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const idCounter = useRef(1);
  const rendererRef = useRef(null);

  // Track pinch state to distinguish zoom from scroll
  const pinchStartDistance = useRef(0);
  const isPinchZoom = useRef(false);

  const activeConfig = toolConfigs?.[tool] || {
    pressure: 0.5,
    thickness: 1.5,
    stabilization: 0.2,
  };

  const modifyStrokesBulk = (updates = [], options = {}) => {
    const isTransient = !!options.transient;
    updateActiveLayer((strokes = []) => {
      if (!Array.isArray(strokes) || strokes.length === 0) return strokes;
      if (!Array.isArray(updates) || updates.length === 0) return strokes;
      const next = [...strokes];
      updates.forEach((u) => {
        const idx = u?.index;
        const changes = u?.changes || {};
        if (typeof idx !== "number" || idx < 0 || idx >= next.length) return;
        const old = next[idx];
        const { __transient, ...clean } = changes;
        next[idx] = { ...old, ...clean };
      });
      // For transient bulk updates, skip undo push
      if (!isTransient) {
        // Optional: push a single combined action; omitted to keep undo simple per-item via modifyStrokeAt
      }
      return next;
    });
  };

  const page = {
    x: PAGE_MARGIN_H,
    y: PAGE_MARGIN_TOP,
    w: PAGE_WIDTH,
    h: PAGE_HEIGHT,
  };
  const canvasHeight = page.y + page.h + PAGE_BOTTOM_SPACER;
  const nextId = () => `s_${idCounter.current++}`;

  //LAYERS MANAGEMENT
  const [selectedId, setSelectedId] = useState(null);

  const getActiveLayer = useCallback(() => {
    if (!Array.isArray(layers) || layers.length === 0) return null;

    // ✅ Validate layers trước khi tìm
    const validLayers = layers.filter(
      (l) => l && typeof l === "object" && l.id
    );

    if (validLayers.length === 0) return null;

    // Try to find layer by activeLayerId
    let layer = validLayers.find((l) => l.id === activeLayerId);

    // If not found, fallback to first layer
    if (!layer && validLayers.length > 0) {
      layer = validLayers[0];
    }

    return layer || null;
  }, [layers, activeLayerId]);

  const updateActiveLayer = useCallback(
    (updateFn) => {
      // ✅ Kiểm tra activeLayerId trước khi update
      if (!activeLayerId) {
        console.warn("[CanvasContainer] updateActiveLayer: No activeLayerId");
        return;
      }

      setLayers((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((layer) => {
          if (!layer || typeof layer !== "object") return layer;
          if (layer.id !== activeLayerId) return layer;
          const safeStrokes = Array.isArray(layer.strokes) ? layer.strokes : [];
          return { ...layer, strokes: updateFn(safeStrokes) };
        });
      });
    },
    [activeLayerId]
  );

  const updateLayerById = (layerId, updateFn) => {
    // ✅ Kiểm tra layerId trước khi update
    if (!layerId) {
      console.warn("[CanvasContainer] updateLayerById: No layerId provided");
      return;
    }

    if (typeof updateFn !== "function") {
      console.warn(
        "[CanvasContainer] updateLayerById: updateFn is not a function"
      );
      return;
    }

    setLayers((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((l) => {
        if (!l || typeof l !== "object") return l;
        if (l?.id === layerId) {
          const safeStrokes = Array.isArray(l.strokes) ? l.strokes : [];
          return { ...l, strokes: updateFn(safeStrokes) };
        }
        return l;
      });
    });
  };
  // ✅ Safe filter with validation
  const visibleLayers = Array.isArray(layers)
    ? layers.filter((l) => l?.visible)
    : [];

  // ====== ZOOM / PAN ======
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  const clampPan = () => {
    "worklet";
    const maxX = Math.max(0, (PAGE_WIDTH * scale.value - width) / 2);
    const maxY = Math.max(0, (PAGE_HEIGHT * scale.value - height) / 2);
    translateX.value = Math.min(Math.max(translateX.value, -maxX), maxX);
    translateY.value = Math.min(Math.max(translateY.value, -maxY), maxY);
  };

  const lastZoomState = useRef(false);
  const isZooming = useSharedValue(false);
  const isZoomingRef = useRef(false); // For JS thread access

  // ⚠️ Pinch zoom được xử lý ở MultiPageCanvas (project-wide)
  // CanvasContainer chỉ xử lý pan và drawing
  const pinch = Gesture.Pinch().enabled(false); // Disable - zoom được handle ở MultiPageCanvas

  const pan = Gesture.Pan()
    .minPointers(1)
    //.maxPointers(1) // Chỉ nhận pan khi có 1 ngón tay (để tránh conflict với pinch)
    .onStart(() => {
      "worklet";
      // Chỉ cho phép pan nếu không đang zoom
      if (isZooming.value) return;
      baseTranslateX.value = translateX.value;
      baseTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      "worklet";
      // Chỉ pan nếu không đang zoom
      if (isZooming.value) return;
      if (
        !e ||
        typeof e.translationX !== "number" ||
        typeof e.translationY !== "number"
      )
        return;
      translateX.value = baseTranslateX.value + e.translationX;
      translateY.value = baseTranslateY.value + e.translationY;
      clampPan();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      "worklet";
      try {
        scale.value = withTiming(1, { duration: 300 });
        translateX.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(0, { duration: 300 });
        runOnJS(() => {
          lastZoomState.current = false;
          if (typeof onZoomChange === "function") {
            onZoomChange(false);
          }
        })();
      } catch (err) {
        console.warn("[CanvasContainer] Double tap error:", err);
      }
    });

  // Compose gestures: pinch riêng, pan và doubleTap có thể cùng lúc
  const composedGesture = Gesture.Exclusive(
    pinch,
    Gesture.Simultaneous(pan, doubleTap)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const derivedZoom = useDerivedValue(() => Math.round(scale.value * 100));
  // Update zoomPercent react state from UI thread without reading .value in JS
  useAnimatedReaction(
    () => derivedZoom.value,
    (val, prev) => {
      if (val !== prev) runOnJS(setZoomPercent)(val);
    }
  );

  // ====== Helpers ======
  const pushUndo = (action) => {
    setUndoStack((u) => {
      const newStack = [
        ...u,
        { ...action, layerId: action.layerId || activeLayerId },
      ];
      // Keep only last MAX_UNDO_STACK items to prevent memory leak
      if (newStack.length > MAX_UNDO_STACK) {
        return newStack.slice(-MAX_UNDO_STACK);
      }
      return newStack;
    });
    setRedoStack([]);
  };

  const addStrokeInternal = (stroke) => {
    // ✅ Kiểm tra stroke và activeLayerId trước khi thêm
    if (!stroke || typeof stroke !== "object") {
      console.warn("[CanvasContainer] addStrokeInternal: Invalid stroke");
      return;
    }

    if (!activeLayerId) {
      console.warn(
        "[CanvasContainer] addStrokeInternal: No activeLayerId, cannot add stroke"
      );
      return;
    }

    try {
      updateActiveLayer((strokes) => [...strokes, stroke]);
      pushUndo({ type: "add", stroke, layerId: activeLayerId });
    } catch (e) {
      console.error("[CanvasContainer] addStrokeInternal error:", e);
    }
  };

  const deleteStrokeAt = (index) => {
    // ✅ Kiểm tra activeLayerId và index trước khi xóa
    if (!activeLayerId) {
      console.warn("[CanvasContainer] deleteStrokeAt: No activeLayerId");
      return;
    }

    if (typeof index !== "number" || index < 0) {
      console.warn("[CanvasContainer] deleteStrokeAt: Invalid index");
      return;
    }

    let removed = null;
    try {
      updateActiveLayer((strokes) => {
        if (index < 0 || index >= strokes.length) return strokes;
        removed = strokes[index];
        return [...strokes.slice(0, index), ...strokes.slice(index + 1)];
      });
      // Push undo AFTER update để tránh setState cascade
      if (removed) {
        pushUndo({
          type: "delete",
          index,
          stroke: removed,
          layerId: activeLayerId,
        });
      }
    } catch (e) {
      console.error("[CanvasContainer] deleteStrokeAt error:", e);
    }
  };

  const modifyStrokeAt = (index, newProps) => {
    // ✅ Kiểm tra activeLayerId và index trước khi sửa
    if (!activeLayerId) {
      console.warn("[CanvasContainer] modifyStrokeAt: No activeLayerId");
      return;
    }

    if (typeof index !== "number" || index < 0) {
      console.warn("[CanvasContainer] modifyStrokeAt: Invalid index");
      return;
    }

    try {
      updateActiveLayer((strokes) => {
        if (index < 0 || index >= strokes.length) return strokes;
        const old = strokes[index];
        if (!old || typeof old !== "object") return strokes;

        const { __transient, ...cleanProps } = newProps || {};
        const updated = { ...old, ...cleanProps };
        if (!__transient) {
          pushUndo({
            type: "modify",
            index,
            before: old,
            after: updated,
            layerId: activeLayerId,
          });
        }
        // avoid creating new array if not changing
        if (updated === old) return strokes;
        const next = [...strokes];
        next[index] = updated;
        return next;
      });
    } catch (e) {
      console.error("[CanvasContainer] modifyStrokeAt error:", e);
    }
  };

  // Thêm scrollOffsetX, scrollOffsetY làm tham số
  const centerFor = (
    w = 100,
    h = 100,
    scrollOffsetX = 0,
    scrollOffsetY = 0
  ) => {
    "worklet";
    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    const scaleVal = scale.value ?? 1;
    const tx = translateX.value ?? 0;
    const ty = translateY.value ?? 0;

    // Tính trung tâm canvas dựa trên màn hình + pan/zoom + scroll offset
    const canvasCenterX =
      (screenCenterX - tx) / scaleVal - w / 2 + scrollOffsetX;
    const canvasCenterY =
      (screenCenterY - ty) / scaleVal - h / 2 + scrollOffsetY;

    const finalX = Math.max(
      page.x,
      Math.min(canvasCenterX, page.x + page.w - w)
    );
    const finalY = Math.max(
      page.y,
      Math.min(canvasCenterY, page.y + page.h - h)
    );

    return { x: finalX, y: finalY };
  };

  // Non-worklet version for JS thread
  const getCenterPosition = (w = 100, h = 100) => {
    const screenCenterX = width / 2;
    const screenCenterY = height / 2;

    const scaleVal = scale.value ?? 1;
    const tx = translateX.value ?? 0;
    const ty = translateY.value ?? 0;

    // Tính vị trí center trong canvas coordinates
    const canvasCenterX = (screenCenterX - tx) / scaleVal - w / 2;
    const canvasCenterY = (screenCenterY - ty) / scaleVal - h / 2;

    // Clamp trong page bounds
    const finalX = Math.max(
      page.x,
      Math.min(canvasCenterX, page.x + page.w - w)
    );
    const finalY = Math.max(
      page.y,
      Math.min(canvasCenterY, page.y + page.h - h)
    );

    return { x: finalX, y: finalY };
  };

  const addImageStrokeInternal = async (uri, opts = {}) => {
    if (!uri) return;

    let safeUri = uri;
    try {
      if (uri.startsWith("content://")) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        safeUri = `data:image/png;base64,${base64}`;
      } else if (!uri.startsWith("file://") && !uri.startsWith("data:image")) {
        safeUri = `file://${uri}`;
      }

      const width = opts.width ?? 400;
      const height = opts.height ?? 400;

      const { x: cx, y: cy } = getCenterPosition(width, height);

      const newStroke = {
        id: nextId(),
        tool: "image",
        uri: safeUri,
        x: opts.x ?? cx,
        y: opts.y ?? cy,
        width,
        height,
        rotation: opts.rotation ?? 0,
        layerId: opts.layerId ?? activeLayerId ?? "default", // fix chính
      };

      addStrokeInternal(newStroke);
      // console.log("Image added:", newStroke);
    } catch (err) {
      console.error("Failed to add image:", err);
      Alert.alert("Lỗi ảnh", "Không thể đọc hoặc hiển thị ảnh này.");
    }
  };

  const addStickerStroke = (strokeData = {}) => {
    const { uri, x, y, width = 120, height = 120, rotation = 0 } = strokeData;

    if (!uri || typeof uri !== "string") {
      console.warn("[CanvasContainer] Invalid sticker URI:", uri);
      return;
    }

    const { x: cx, y: cy } = centerFor(
      strokeData.width ?? 120,
      strokeData.height ?? 120,
      strokeData.scrollOffsetX ?? 0,
      strokeData.scrollOffsetY ?? 0
    );

    const newStroke = {
      id: nextId(),
      tool: "sticker",
      uri,
      x: x ?? cx,
      y: y ?? cy,
      width,
      height,
      rotation,
      ...strokeData,
    };

    // setStrokes((prev) => [...prev, newStroke]);
    // onAddStroke?.(newStroke);
    addStrokeInternal(newStroke);

    // pushUndo({ type: "add", stroke: newStroke });
  };

  const addTextStroke = (strokeData = {}) => {
    const widthEstimate = 0; // not needed here
    const { x: cx, y: cy } = centerFor(
      0,
      0,
      strokeData.scrollOffsetX ?? 0,
      strokeData.scrollOffsetY ?? 0
    );
    const newStroke = {
      id: nextId(),
      tool: "text",
      x: strokeData.x ?? cx,
      y: strokeData.y ?? cy,
      text: strokeData.text ?? "",
      fontSize: strokeData.fontSize ?? 18,
      fontFamily: strokeData.fontFamily ?? "Roboto-Regular",
      color: strokeData.color ?? "#000",
      padding: strokeData.padding ?? 6,
      ...strokeData,
    };
    // setStrokes((prev) => [...prev, newStroke]);
    // onAddStroke?.(newStroke);
    addStrokeInternal(newStroke);

    // pushUndo({ type: "add", stroke: newStroke });
  };

  // ====== API EXPOSED ======
  useImperativeHandle(ref, () => ({
    // Hoàn tác
    undo: () => {
      setUndoStack((prevUndo) => {
        if (prevUndo.length === 0) return prevUndo;
        const last = prevUndo[prevUndo.length - 1];
        const { type, stroke, index, before, after, layerId } = last;

        setRedoStack((r) => [...r, last]);

        updateLayerById(layerId || activeLayerId, (strokes = []) => {
          if (!Array.isArray(strokes)) return [];
          switch (type) {
            case "add": {
              const idx = strokes.findIndex((x) => x.id === stroke?.id);
              return idx !== -1
                ? [...strokes.slice(0, idx), ...strokes.slice(idx + 1)]
                : strokes.slice(0, -1);
            }
            case "delete": {
              const idx = Math.min(Math.max(0, index), strokes.length);
              const next = [...strokes];
              next.splice(idx, 0, stroke);
              return next;
            }
            case "modify": {
              const next = [...strokes];
              if (index >= 0 && index < next.length) next[index] = before;
              return next;
            }
            default:
              return strokes;
          }
        });

        return prevUndo.slice(0, -1);
      });
    },

    // Làm lại
    redo: () => {
      setRedoStack((prevRedo) => {
        if (prevRedo.length === 0) return prevRedo;
        const last = prevRedo[prevRedo.length - 1];
        const { type, stroke, index, before, after, layerId } = last;

        setUndoStack((u) => [...u, last]);

        updateLayerById(layerId || activeLayerId, (strokes = []) => {
          if (!Array.isArray(strokes)) return [];
          switch (type) {
            case "add":
              return [...strokes, stroke];
            case "delete": {
              if (index < 0 || index >= strokes.length) return strokes;
              return [...strokes.slice(0, index), ...strokes.slice(index + 1)];
            }
            case "modify": {
              const next = [...strokes];
              if (index >= 0 && index < next.length) next[index] = after;
              return next;
            }
            default:
              return strokes;
          }
        });

        return prevRedo.slice(0, -1);
      });
    },

    // Xóa layer hiện tại
    clear: () => {
      if (!activeLayerId) return;
      updateLayerById(activeLayerId, () => []);
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },

    // Lấy tất cả strokes từ tất cả layers (để lưu đầy đủ)
    getStrokes: () => {
      if (!Array.isArray(layers) || layers.length === 0) return [];

      // ✅ Lấy tất cả strokes từ tất cả layers (không chỉ active layer)
      const allStrokes = layers
        .filter((layer) => layer && typeof layer === "object")
        .flatMap((layer) => {
          const layerStrokes = Array.isArray(layer.strokes)
            ? layer.strokes
            : [];
          // Đảm bảo mỗi stroke có layerId
          return layerStrokes.map((stroke) => ({
            ...stroke,
            layerId: stroke.layerId || layer.id || "layer1",
          }));
        });

      return allStrokes;
    },

    // ✅ Lấy layer metadata (name, visible, locked) để lưu
    getLayersMetadata: () => {
      if (!Array.isArray(layers) || layers.length === 0) return [];

      return layers
        .filter((layer) => layer && typeof layer === "object" && layer.id)
        .map((layer) => ({
          id: layer.id,
          name: layer.name || `Layer ${layer.id}`,
          visible: layer.visible !== false, // Default true
          locked: layer.locked === true, // Default false
        }));
    },

    // Thêm stroke trực tiếp vào layer đang active
    addStrokeDirect: (stroke) => {
      if (!activeLayerId) {
        console.warn("[CanvasContainer] addStrokeDirect: No activeLayerId");
        return;
      }
      if (!stroke || typeof stroke !== "object") {
        console.warn("[CanvasContainer] addStrokeDirect: Invalid stroke");
        return;
      }
      try {
        const s = { ...stroke, id: stroke.id ?? nextId() };
        addStrokeInternal(s);
      } catch (e) {
        console.error("[CanvasContainer] addStrokeDirect error:", e);
      }
    },

    modifyStrokeAt,

    // Thêm ảnh / sticker / text (giữ logic layer)
    // CanvasContainer.jsx (thêm vào ref exposes)
    addImageStroke: (stroke) => {
      // ✅ Không thêm scrollOffsetY vào y vì image position là absolute trong canvas
      // scrollOffsetY chỉ dùng để tính toán vị trí ban đầu, không lưu vào stroke
      const s = {
        ...stroke,
        x: stroke.x ?? 100,
        y: stroke.y ?? 100, // ✅ Dùng y trực tiếp, không adjust với scrollOffsetY
        id: stroke.id ?? nextId(),
        tool: "image",
        layerId: stroke.layerId ?? activeLayerId,
      };
      addStrokeInternal(s);
    },

    // Insert table
    insertTable: (rows, cols) => {
      const tableWidth = 300;
      const tableHeight = 200;
      const { x: cx, y: cy } = getCenterPosition(tableWidth, tableHeight);

      const tableStroke = {
        id: nextId(),
        tool: "table",
        x: cx,
        y: cy,
        width: tableWidth,
        height: tableHeight,
        rows,
        cols,
        rotation: 0,
        strokeColor: "#1e293b",
        strokeWidth: 2,
        layerId: activeLayerId,
      };
      addStrokeInternal(tableStroke);
    },

    addStickerStroke: (stroke) => {
      // Use getCenterPosition if x/y not provided
      const stickerWidth = stroke.width ?? 120;
      const stickerHeight = stroke.height ?? 120;
      const { x: cx, y: cy } = getCenterPosition(stickerWidth, stickerHeight);

      const s = {
        ...stroke,
        x: stroke.x ?? cx,
        y: stroke.y ?? cy,
        id: stroke.id ?? nextId(),
        tool: "sticker",
        layerId: stroke.layerId ?? activeLayerId,
      };
      addStrokeInternal(s);
    },

    addTextStroke: (stroke) => {
      const adjustedY = (stroke.y ?? 100) + (stroke.scrollOffsetY ?? 0); // ✅ Tương tự
      const s = {
        ...stroke,
        y: adjustedY,
        id: stroke.id ?? nextId(),
        tool: "text",
        layerId: stroke.layerId ?? activeLayerId,
      };
      addStrokeInternal(s);
    },

    // 📦 Load lại toàn bộ strokes, phân loại theo layerId
    // ✅ Có thể nhận thêm layersMetadata để restore layer names
    loadStrokes: (strokesArray = [], layersMetadata = []) => {
      if (!Array.isArray(strokesArray)) {
        console.warn("[CanvasContainer] loadStrokes: invalid strokesArray");
        return;
      }

      try {
        // ✅ Tạo map của layer metadata để lookup nhanh
        const layerMetadataMap = new Map();
        if (Array.isArray(layersMetadata)) {
          layersMetadata.forEach((meta) => {
            if (meta && meta.id) {
              layerMetadataMap.set(meta.id, {
                name: meta.name || `Layer ${meta.id}`,
                visible: meta.visible !== false,
                locked: meta.locked === true,
              });
            }
          });
        }

        // Validate và filter strokes
        const validStrokes = strokesArray
          .filter((s) => s && typeof s === "object")
          .map((s) => ({
            ...s,
            // Đảm bảo mỗi stroke có layerId, fallback về layer1 nếu không có
            layerId: s.layerId || "layer1",
          }));

        // Limit số lượng để tránh crash
        const safeStrokes = validStrokes.slice(0, 1000);

        // ✅ Phân loại strokes theo layerId
        const strokesByLayer = {};
        safeStrokes.forEach((stroke) => {
          const layerId = stroke.layerId || "layer1";
          if (!strokesByLayer[layerId]) {
            strokesByLayer[layerId] = [];
          }
          strokesByLayer[layerId].push(stroke);
        });

        // ✅ Load strokes vào đúng layer với metadata
        setLayers((prev) => {
          if (!Array.isArray(prev)) {
            // Nếu không có layers, tạo mới từ strokes và metadata
            return Object.keys(strokesByLayer).map((layerId) => {
              const meta = layerMetadataMap.get(layerId);
              return {
                id: layerId,
                name:
                  meta?.name ||
                  (layerId === "layer1" ? "Layer 1" : `Layer ${layerId}`),
                visible: meta?.visible !== false,
                locked: meta?.locked === true,
                strokes: strokesByLayer[layerId],
              };
            });
          }

          // Tạo map của layers hiện tại
          const layerMap = new Map(prev.map((l) => [l.id, { ...l }]));

          // Cập nhật hoặc tạo layers cho mỗi layerId có strokes
          Object.keys(strokesByLayer).forEach((layerId) => {
            const meta = layerMetadataMap.get(layerId);
            if (layerMap.has(layerId)) {
              // Layer đã tồn tại, thay thế strokes và update metadata nếu có
              const layer = layerMap.get(layerId);
              layerMap.set(layerId, {
                ...layer,
                strokes: strokesByLayer[layerId],
                // ✅ Update metadata từ saved nếu có
                name: meta?.name || layer.name,
                visible:
                  meta !== undefined ? meta.visible !== false : layer.visible,
                locked:
                  meta !== undefined ? meta.locked === true : layer.locked,
              });
            } else {
              // Layer chưa tồn tại, tạo layer mới với metadata
              layerMap.set(layerId, {
                id: layerId,
                name:
                  meta?.name ||
                  (layerId === "layer1" ? "Layer 1" : `Layer ${layerId}`),
                visible: meta?.visible !== false,
                locked: meta?.locked === true,
                strokes: strokesByLayer[layerId],
              });
            }
          });

          // ✅ Giữ lại tất cả layers (cả layers không có strokes mới)
          return Array.from(layerMap.values());
        });

        setUndoStack([]);
        setRedoStack([]);

        // console.log(
        //   `[CanvasContainer] Loaded ${safeStrokes.length} strokes into ${
        //     Object.keys(strokesByLayer).length
        //   } layer(s)`
        // );
      } catch (e) {
        console.error("[CanvasContainer] loadStrokes error:", e);
      }
    },
  }));

  // useEffect(() => {
  //   if (__DEV__) {
  //     console.log(
  //       "[CanvasContainer] rulerPosition=",
  //       rulerPosition,
  //       "page=",
  //       page
  //     );
  //   }
  // }, [rulerPosition, page.x, page.y, page.w, page.h]);

  // ====== Khi kết thúc stroke ======
  const handleAddStroke = useCallback(
    (strokeData) => {
      const strokeSnapshot = {
        ...strokeData,
        id: nextId(),
        tool,
        color,
        pressure: activeConfig.pressure,
        thickness: activeConfig.thickness,
        stabilization: activeConfig.stabilization,
      };
      addStrokeInternal(strokeSnapshot);
      if (["text", "sticky", "comment"].includes(strokeSnapshot.tool))
        setRealtimeText(null);
    },
    [tool, color, activeConfig]
  );

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          key={activeLayerId}
          style={[animatedStyle, { width: page.w, height: page.h }]}
        >
          <GestureHandler
            key={activeLayerId}
            page={page}
            tool={tool}
            color={color}
            setColor={setColor}
            setTool={setTool}
            eraserMode={eraserMode}
            // ⬇️ giữ nguyên các callback xử lý stroke nhưng không truyền setStrokes trực tiếp
            activeLayerId={activeLayerId}
            onAddStroke={addStrokeInternal}
            onModifyStroke={modifyStrokeAt}
            onLiveUpdateStroke={liveUpdateStroke}
            onModifyStrokesBulk={modifyStrokesBulk}
            onDeleteStroke={deleteStrokeAt}
            onSelectStroke={(id) => setSelectedId(id)}
            // ⬇️ chỉ truyền strokes của layer đang active
            strokes={getActiveLayer()?.strokes || []}
            // ⬇️ truyền tất cả strokes của các layer đang visible để eyedropper có thể lấy màu bất kể layer đang active
            allVisibleStrokes={visibleLayers.flatMap((l) => l.strokes || [])}
            setRedoStack={setRedoStack}
            currentPoints={currentPoints}
            setCurrentPoints={setCurrentPoints}
            strokeWidth={strokeWidth}
            pencilWidth={pencilWidth}
            eraserSize={eraserSize}
            brushWidth={brushWidth}
            brushOpacity={brushOpacity}
            calligraphyWidth={calligraphyWidth}
            calligraphyOpacity={calligraphyOpacity}
            pressure={activeConfig.pressure}
            thickness={activeConfig.thickness}
            stabilization={activeConfig.stabilization}
            configByTool={toolConfigs}
            setRealtimeText={setRealtimeText}
            rulerPosition={rulerPosition}
            scrollOffsetY={scrollOffsetY}
            scrollYShared={scrollYShared}
            pageOffsetY={pageOffsetY}
            onColorPicked={onColorPicked}
            zoomState={{
              scale,
              translateX,
              translateY,
            }}
            // ⬇️ truyền ref renderer để có thể nâng cấp eyedropper lấy pixel snapshot sau này
            canvasRef={rendererRef}
          >
            <CanvasRenderer
              ref={rendererRef}
              // ✅ Render tất cả layer visible thay vì 1 mảng strokes
              layers={visibleLayers}
              activeLayerId={activeLayerId}
              selectedId={selectedId}
              imageRefs={imageRefs}
              realtimeText={realtimeText}
              currentPoints={currentPoints}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              pencilWidth={pencilWidth}
              eraserSize={eraserSize}
              eraserMode={eraserMode}
              brushWidth={brushWidth}
              brushOpacity={brushOpacity}
              calligraphyWidth={calligraphyWidth}
              calligraphyOpacity={calligraphyOpacity}
              paperStyle={paperStyle}
              page={page}
              canvasHeight={canvasHeight}
              shapeType={shapeType}
              hasRuler={!!rulerPosition}
              backgroundColor={backgroundColor}
              pageTemplate={pageTemplate}
              backgroundImageUrl={backgroundImageUrl}
              pageWidth={PAGE_WIDTH}
              pageHeight={PAGE_HEIGHT}
            />
          </GestureHandler>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

export default memo(CanvasContainer);
