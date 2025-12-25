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
import { File } from "expo-file-system";
import { projectService } from "../../../service/projectService";
import { ImageFormat } from "@shopify/react-native-skia";
import { Dimensions, Image } from "react-native";

const PAGE_MARGIN_H = 24;
const PAGE_MARGIN_TOP = 20;
const PAGE_BOTTOM_SPACER = 64;

const CanvasContainer = forwardRef(function CanvasContainer(
  {
    tool,
    layers,
    pageId,
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
    scrollOffsetY = 0,
    scrollYShared, // ✅ Animated scroll value
    pageOffsetY = 0, // ✅ Page offset trong project
    onColorPicked,
    backgroundColor = "#FFFFFF", // 👈 Add backgroundColor prop
    pageTemplate = "blank", // 👈 Add template prop
    backgroundImageUrl = null, // 👈 Add backgroundImageUrl prop
    pageWidth = null, // 👈 Page width from noteConfig
    pageHeight = null, // 👈 Page height from noteConfig
    loadedFonts, // 👈 Pass down preloaded fonts
    getNearestFont, // 👈 Pass down font helper
    projectId,
    userId,
    isCover = false,
    shapeSettings,
    tapeSettings,
    scrollRef, // 👈 Receive scrollRef
    collabEnabled,
    collabConnected,
    onCollabElementUpdate,
    onCollabElementCreate,
    onCollabElementDelete,
    onCollabRequestLock,
    onCollabReleaseLock,
    onCollabIsElementLocked,
    onCollabPageCreate,
  },
  ref
) {
  const imageRefs = useRef(new Map());
  const lastParentLayersRef = useRef(null);
  const [internalLayers, setInternalLayers] = useState(() => {
    lastParentLayersRef.current = layers;
    return Array.isArray(layers) ? layers : [];
  });

  useEffect(() => {
    if (!Array.isArray(layers)) return;

    // ✅ OPTIMIZATION: If the parent layers haven't changed since our last sync,
    // don't trigger a merge. This prevents "old" parent state from overwriting
    // "new" internal state during active local interactions (like dragging).
    if (lastParentLayersRef.current === layers) return;
    lastParentLayersRef.current = layers;

    setInternalLayers((prev) => {
      // If parent layers are empty but we have internal layers, only sync if parent is explicitly empty
      if (layers.length === 0 && prev.length > 0) return [];

      // ✅ FIX: Detect if number of layers changed (deletion/addition)
      if (layers.length !== prev.length) {
        return layers.map((l) => ({ ...l }));
      }

      const prevMap = new Map(
        (Array.isArray(prev) ? prev : []).map((l) => [l.id, l])
      );

      let hasChanges = false;
      const next = layers.map((inLayer) => {
        const ex = prevMap.get(inLayer.id);
        if (ex) {
          // Check if anything actually changed
          const strokesChanged = inLayer.strokes !== ex.strokes;
          const nameChanged = inLayer.name !== ex.name;
          const visibleChanged = inLayer.visible !== ex.visible;
          const lockedChanged = inLayer.locked !== ex.locked;

          if (!strokesChanged && !nameChanged && !visibleChanged && !lockedChanged) {
            return ex;
          }

          hasChanges = true;
          return {
            ...ex,
            name: inLayer.name ?? ex.name,
            visible: inLayer.visible ?? ex.visible,
            locked: inLayer.locked ?? ex.locked,
            strokes: strokesChanged && Array.isArray(inLayer.strokes)
              ? inLayer.strokes
              : ex.strokes || [],
          };
        }
        hasChanges = true;
        return { ...inLayer };
      });

      return hasChanges ? next : prev;
    });
  }, [layers]);

  // Cleanup imageRefs to avoid retaining component references
  useEffect(() => {
    return () => {
      try {
        imageRefs.current.clear();
      } catch { }
    };
  }, []);

  // ✅ FIX: Sync imageRefs with current strokes to remove stale references
  useEffect(() => {
    if (!Array.isArray(internalLayers)) return;

    // Collect all current stroke IDs
    const currentStrokeIds = new Set();
    internalLayers.forEach((layer) => {
      if (Array.isArray(layer?.strokes)) {
        layer.strokes.forEach((s) => {
          if (s?.id) currentStrokeIds.add(s.id);
        });
      }
    });

    // Remove refs for strokes that no longer exist
    const refsToDelete = [];
    imageRefs.current.forEach((_, id) => {
      if (!currentStrokeIds.has(id)) {
        refsToDelete.push(id);
      }
    });

    refsToDelete.forEach((id) => {
      try {
        imageRefs.current.delete(id);
      } catch { }
    });
  }, [internalLayers]);

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
  // JS snapshot của các giá trị zoom để tránh đọc .value trong render
  const [zoomSnapshot, setZoomSnapshot] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  // 🔒 Gate updates to React state at most once per frame
  const zoomUpdateLockRef = useRef(false);
  const snapshotUpdateLockRef = useRef(false);
  const updateZoomPercentJS = useCallback((val) => {
    if (zoomUpdateLockRef.current) return;
    zoomUpdateLockRef.current = true;
    setZoomPercent(val);
    // Track RAF to cancel if unmounts quickly
    const id = requestAnimationFrame(() => {
      zoomUpdateLockRef.current = false;
    });
    zoomUpdateLockRef.rafId = id;
  }, []);
  const updateZoomSnapshotJS = useCallback((vals) => {
    if (snapshotUpdateLockRef.current) return;
    snapshotUpdateLockRef.current = true;
    setZoomSnapshot({
      scale: vals.s,
      translateX: vals.tx,
      translateY: vals.ty,
    });
    const id = requestAnimationFrame(() => {
      snapshotUpdateLockRef.current = false;
    });
    snapshotUpdateLockRef.rafId = id;
  }, []);

  const idCounter = useRef(1);
  const rendererRef = useRef(null);

  // Track pinch state to distinguish zoom from scroll
  const pinchStartDistance = useRef(0);
  const isPinchZoom = useRef(false);

  // Cancel any pending RAF on unmount for lock releases
  useEffect(() => {
    return () => {
      try {
        if (typeof zoomUpdateLockRef.rafId === "number") {
          cancelAnimationFrame(zoomUpdateLockRef.rafId);
          zoomUpdateLockRef.rafId = null;
        }
        if (typeof snapshotUpdateLockRef.rafId === "number") {
          cancelAnimationFrame(snapshotUpdateLockRef.rafId);
          snapshotUpdateLockRef.rafId = null;
        }
      } catch { }
    };
  }, []);

  const activeConfig = toolConfigs?.[tool] || {
    pressure: 0.5,
    thickness: 1.5,
    stabilization: 0.2,
  };

  useEffect(() => {
    let maxIdNum = 0;
    const layersArray = Array.isArray(layers) ? layers : [];
    for (let i = 0; i < layersArray.length; i++) {
      const strokes = Array.isArray(layersArray[i]?.strokes)
        ? layersArray[i].strokes
        : [];
      for (let j = 0; j < strokes.length; j++) {
        const s = strokes[j];
        if (s && typeof s.id === "string" && s.id.startsWith("s_")) {
          const num = parseInt(s.id.slice(2), 10);
          if (!isNaN(num) && num > maxIdNum) {
            maxIdNum = num;
          }
        }
      }
    }
    const next = maxIdNum + 1;
    if (next > idCounter.current) {
      idCounter.current = next;
    }
  }, [layers]);

  const allStrokes = React.useMemo(
    () =>
      Array.isArray(internalLayers)
        ? internalLayers.flatMap((l) => (l && l.strokes ? l.strokes : []))
        : [],
    [internalLayers]
  );

  const modifyStrokesBulk = (updates = [], options = {}) => {
    if (!updates || updates.length === 0) {
      return;
    }

    const updater = (prevLayers) => {
      if (!Array.isArray(prevLayers)) return prevLayers;

      // ✅ FIX: Deep clone layers to ensure React detects changes
      const newLayers = prevLayers.map((l) => ({
        ...l,
        strokes: [...(l.strokes || [])],
      }));

      let hasChanges = false;

      updates.forEach((u) => {
        const { id, index, changes } = u;
        if (!changes) return;

        if (id) {
          // Find stroke by ID across all layers
          for (const layer of newLayers) {
            const strokeIndex = layer.strokes.findIndex(
              (s) => s && s.id === id
            );
            if (strokeIndex !== -1) {
              const base = layer.strokes[strokeIndex] || {};
              const merged = { ...base };

              Object.keys(changes).forEach((k) => {
                if (k === "shape") {
                  const sh = changes.shape;
                  if (sh && typeof sh === "object") {
                    // ✅ FIX: Deep clone shape object to ensure React detects changes
                    const newShape = { ...sh };
                    // Also clone points array if present
                    if (Array.isArray(sh.points)) {
                      newShape.points = sh.points.map((p) => ({ ...p }));
                    }
                    const finite = Object.entries(newShape).every(
                      ([key, v]) =>
                        key === "points" ||
                        typeof v !== "number" ||
                        Number.isFinite(v)
                    );
                    merged.shape = finite ? newShape : base.shape;
                  } else if (changes.shape == null) {
                    merged.shape = base.shape;
                  }
                } else if (k === "points" && Array.isArray(changes.points)) {
                  // ✅ FIX: Deep clone points array
                  merged.points = changes.points.map((p) => ({ ...p }));
                } else if (changes[k] !== undefined) {
                  merged[k] = changes[k];
                }
              });

              layer.strokes[strokeIndex] = merged;
              hasChanges = true;
              break;
            }
          }
        } else if (typeof index === "number" && activeLayerId) {
          const layer = newLayers.find((l) => l.id === activeLayerId);
          if (layer && index >= 0 && index < layer.strokes.length) {
            const base = layer.strokes[index] || {};
            const merged = { ...base };

            Object.keys(changes).forEach((k) => {
              if (k === "shape") {
                const sh = changes.shape;
                if (sh && typeof sh === "object") {
                  const newShape = { ...sh };
                  if (Array.isArray(sh.points)) {
                    newShape.points = sh.points.map((p) => ({ ...p }));
                  }
                  merged.shape = newShape;
                }
              } else if (k === "points" && Array.isArray(changes.points)) {
                merged.points = changes.points.map((p) => ({ ...p }));
              } else if (changes[k] !== undefined) {
                merged[k] = changes[k];
              }
            });

            layer.strokes[index] = merged;
            hasChanges = true;
          }
        }
      });

      if (!hasChanges) {
        return prevLayers;
      }

      return newLayers;
    };

    // ✅ FIX: Update both states asynchronously to prevent "update while rendering" error
    queueMicrotask(() => {
      setInternalLayers(updater);
    });

    if (typeof setLayers === "function") {
      // ✅ FIX: Defer parent update
      requestAnimationFrame(() => {
        setLayers(updater);
      });
    }
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
    if (!Array.isArray(internalLayers) || internalLayers.length === 0)
      return null;
    const validLayers = internalLayers.filter(
      (l) => l && typeof l === "object" && l.id
    );
    if (validLayers.length === 0) return null;
    let layer = validLayers.find((l) => l.id === activeLayerId);
    if (!layer && validLayers.length > 0) {
      layer = validLayers[0];
    }
    return layer || null;
  }, [internalLayers, activeLayerId]);

  const updateActiveLayer = useCallback(
    (updateFn) => {
      if (!activeLayerId) {
        console.warn("[CanvasContainer] updateActiveLayer: No activeLayerId");
        return;
      }

      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((layer) => {
          if (!layer || typeof layer !== "object" || layer.id !== activeLayerId)
            return layer;
          const safeStrokes = Array.isArray(layer.strokes) ? layer.strokes : [];
          return { ...layer, strokes: updateFn(safeStrokes) };
        });
      };

      // ✅ CRITICAL FIX: Sync to both internal AND parent state
      // Defer internal update to microtask to avoid React warning
      queueMicrotask(() => {
        setInternalLayers(updater);
      });

      if (typeof setLayers === "function") {
        // ✅ FIX: Defer parent update to avoid "update while rendering" error
        requestAnimationFrame(() => {
          setLayers(updater);
        });
      }
    },
    [activeLayerId, setLayers]
  );

  const updateLayerById = (layerId, updateFn) => {
    if (!layerId || typeof updateFn !== "function") return;

    const updater = (prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((l) => {
        if (!l || typeof l !== "object" || l?.id !== layerId) return l;
        const safeStrokes = Array.isArray(l.strokes) ? l.strokes : [];
        return { ...l, strokes: updateFn(safeStrokes) };
      });
    };

    // ✅ CRITICAL FIX: Sync to both internal AND parent state
    // Defer internal update to microtask to avoid React warning
    queueMicrotask(() => {
      setInternalLayers(updater);
    });

    if (typeof setLayers === "function") {
      // ✅ FIX: Defer parent update to avoid "update while rendering" error
      requestAnimationFrame(() => {
        setLayers(updater);
      });
    }
  };

  const visibleLayers = React.useMemo(
    () =>
      Array.isArray(internalLayers)
        ? internalLayers.filter((l) => l?.visible)
        : [],
    [internalLayers]
  );

  // ====== ZOOM / PAN ======
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  // Stable zoom state object to pass to children without causing re-renders
  const zoomStateMemo = React.useMemo(
    () => ({ scale, translateX, translateY }),
    []
  );

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
    //.maxPointers(1) // Chỉ nhận pan khi có 1 ngón tay (để tránh conflict with pinch)
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
      if (val !== prev) runOnJS(updateZoomPercentJS)(val);
    }
  );

  // Cập nhật zoomSnapshot (JS numbers) mỗi khi shared values thay đổi
  useAnimatedReaction(
    () => ({ s: scale.value, tx: translateX.value, ty: translateY.value }),
    (vals, prev) => {
      if (
        !prev ||
        vals.s !== prev.s ||
        vals.tx !== prev.tx ||
        vals.ty !== prev.ty
      ) {
        runOnJS(updateZoomSnapshotJS)({ s: vals.s, tx: vals.tx, ty: vals.ty });
      }
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

    // 🔒 Check if active layer is locked - prevent adding strokes to locked layers
    const activeLayer = internalLayers.find((l) => l?.id === activeLayerId);
    if (activeLayer?.locked) {
      console.warn("[CanvasContainer] Cannot add stroke to locked layer:", activeLayerId);
      return;
    }

    try {
      updateActiveLayer((strokes) => [...strokes, stroke]);
      pushUndo({ type: "add", stroke, layerId: activeLayerId });

      // [FIX] Automatically select the new stroke if it's a selectable object
      if (
        ["image", "sticker", "table", "text", "emoji"].includes(stroke.tool)
      ) {
        setSelectedId(stroke.id);
      }

      try {
        if (projectId && userId) {
          // Send minimal page info for collaboration (no strokes - they're in stroke param)
          const pageInfo = {
            id: pageId,
            type: isCover ? "cover" : "paper",
            backgroundColor: backgroundColor,
            template: pageTemplate,
          };

          projectService.realtime.sendStroke(
            projectId,
            userId,
            pageId,
            stroke,
            pageInfo
          );
        }
      } catch { }
    } catch (e) {
      console.warn("[CanvasContainer] addStrokeInternal error:", e);
    }
  };

  // 🔥 REALTIME: Modify a stroke by its ID (for collaboration & local tools)
  const modifyStrokeById = useCallback(
    (strokeId, newProps) => {
      if (!strokeId) return;

      let oldStroke = null;
      let updatedStroke = null;
      let layerIdFound = null;
      let strokeIndex = -1;

      const { __transient, ...cleanProps } = newProps || {};

      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((layer) => {
          // 🔒 Skip locked layers - don't allow modification on locked layers
          if (layer.locked) return layer;

          const idx = (layer.strokes || []).findIndex((s) => s.id === strokeId);
          if (idx !== -1) {
            oldStroke = layer.strokes[idx];
            layerIdFound = layer.id;
            strokeIndex = idx;
            updatedStroke = { ...oldStroke, ...cleanProps };
            const nextStrokes = [...layer.strokes];
            nextStrokes[idx] = updatedStroke;
            return { ...layer, strokes: nextStrokes };
          }
          return layer;
        });
      };

      setInternalLayers(updater);

      // ✅ OPTIMIZATION: Skip parent sync and undo for transient updates (dragging/resizing)
      // to ensure 60fps local performance and avoid jitter from parent state loops.
      if (__transient) return;

      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
          if (oldStroke && updatedStroke) {
            pushUndo({
              type: "modify",
              index: strokeIndex,
              before: oldStroke,
              after: updatedStroke,
              layerId: layerIdFound,
            });
          }
        });
      }
    },
    [setLayers, pushUndo]
  );

  // 🔥 REALTIME: Delete a stroke by its ID (for collaboration & local tools)
  const deleteStrokeById = useCallback(
    (strokeId) => {
      if (!strokeId) return;

      let removed = null;
      let removedLayerId = null;
      let removedIndex = -1;

      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((layer) => {
          // 🔒 Skip locked layers - don't allow deletion from locked layers
          if (layer.locked) return layer;

          const idx = (layer.strokes || []).findIndex((s) => s.id === strokeId);
          if (idx !== -1) {
            removed = layer.strokes[idx];
            removedLayerId = layer.id;
            removedIndex = idx;
            const nextStrokes = [...layer.strokes];
            nextStrokes.splice(idx, 1);
            return { ...layer, strokes: nextStrokes };
          }
          return layer;
        });
      };

      setInternalLayers(updater);
      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
          if (removed) {
            pushUndo({
              type: "delete",
              index: removedIndex,
              stroke: removed,
              layerId: removedLayerId,
            });
          }
        });
      }
    },
    [setLayers, pushUndo]
  );

  const deleteStrokeAt = (index) => {
    // ⚠️ Deprecated: Use deleteStrokeById for better multi-layer support.
    // Keeping for backward compatibility but redirecting to ID-based logic if possible.
    if (!activeLayerId) return;
    const layer = internalLayers.find((l) => l.id === activeLayerId);
    const stroke = layer?.strokes?.[index];
    if (stroke?.id) {
      deleteStrokeById(stroke.id);
    }
  };

  const modifyStrokeAt = (index, newProps) => {
    // ⚠️ Deprecated: Use modifyStrokeById for better multi-layer support.
    if (!activeLayerId) return;
    const layer = internalLayers.find((l) => l.id === activeLayerId);
    const stroke = layer?.strokes?.[index];
    if (stroke?.id) {
      modifyStrokeById(stroke.id, newProps);
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
        const base64 = await File.readAsStringAsync(uri, {
          encoding: File.EncodingType.Base64,
        });
        safeUri = `data:image/png;base64,${base64}`;
      } else if (!uri.startsWith("file://") && !uri.startsWith("data:image")) {
        safeUri = `file://${uri}`;
      }
      let naturalW = null;
      let naturalH = null;
      try {
        const size = await new Promise((resolve) => {
          Image.getSize(
            safeUri,
            (w, h) => resolve({ w, h }),
            () => resolve(null)
          );
        });
        if (size) {
          naturalW = size.w;
          naturalH = size.h;
        }
      } catch { }

      let width = typeof opts.width === "number" ? opts.width : naturalW ?? 400;
      let height =
        typeof opts.height === "number" ? opts.height : naturalH ?? 400;

      if (
        naturalW &&
        naturalH &&
        (typeof opts.width !== "number" || typeof opts.height !== "number")
      ) {
        const ratio = naturalW / naturalH;
        const maxW = Math.max(40, page.w * 0.8);
        const maxH = Math.max(40, page.h * 0.8);
        width = Math.min(width, maxW);
        height = Math.min(width / ratio, maxH);
      }

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
        layerId: opts.layerId ?? activeLayerId ?? "layer1",
        naturalWidth: naturalW ?? undefined,
        naturalHeight: naturalH ?? undefined,
      };

      addStrokeInternal(newStroke);
    } catch (err) {
      console.warn("Failed to add image:", err);
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

    addStrokeInternal(newStroke);
  };

  const addTextStroke = (strokeData = {}) => {
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
    addStrokeInternal(newStroke);
  };

  // ====== API EXPOSED ======
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (rendererRef.current) {
        return rendererRef.current.getSnapshot();
      }
      return null;
    },
    getSnapshotBase64: (quality = 90) => {
      try {
        const img = rendererRef.current?.getSnapshot();
        if (!img) return null;
        return img.encodeToBase64(ImageFormat.PNG, quality);
      } catch {
        return null;
      }
    },
    // Hoàn tác
    undo: () => {
      setUndoStack((prevUndo) => {
        if (prevUndo.length === 0) return prevUndo;
        const last = prevUndo[prevUndo.length - 1];
        const { type, stroke, index, before, after, layerId } = last;

        setRedoStack((r) => {
          const next = [...r, last];
          return next.length > MAX_UNDO_STACK
            ? next.slice(next.length - MAX_UNDO_STACK)
            : next;
        });

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

        const trimmed = prevRedo.slice(0, -1);
        return trimmed.length > MAX_UNDO_STACK
          ? trimmed.slice(trimmed.length - MAX_UNDO_STACK)
          : trimmed;
      });
    },

    // Xóa layer hiện tại
    clear: () => {
      if (!activeLayerId) return;

      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((l) => {
          if (l.id === activeLayerId) {
            return { ...l, strokes: [] };
          }
          return l;
        });
      };

      // ✅ Direct update for immediate effect
      setInternalLayers(updater);
      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
        });
      }
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },

    // [NEW] Clears all strokes from all layers on this canvas.
    clearAllStrokes: () => {
      const updater = (prev) => {
        if (!Array.isArray(prev)) return [];
        return prev.map((l) => ({ ...l, strokes: [] }));
      };
      setInternalLayers(updater);
      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
        });
      }
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },

    // Lấy tất cả strokes từ tất cả layers (để lưu đầy đủ)
    getStrokes: () => {
      if (!Array.isArray(internalLayers) || internalLayers.length === 0)
        return [];

      // ✅ Lấy tất cả strokes từ tất cả layers (không chỉ active layer)
      const allStrokes = internalLayers
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
      if (!Array.isArray(internalLayers) || internalLayers.length === 0)
        return [];

      return internalLayers
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
        console.warn("[CanvasContainer] addStrokeDirect error:", e);
      }
    },

    removeStrokesByIds: (ids = []) => {
      const idSet = new Set(Array.isArray(ids) ? ids : []);
      if (idSet.size === 0) return;
      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((l) => ({
          ...l,
          strokes: Array.isArray(l.strokes)
            ? l.strokes.filter((s) => !idSet.has(s?.id))
            : [],
        }));
      };
      setInternalLayers(updater);
      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
        });
      }
      setUndoStack([]);
      setRedoStack([]);
    },

    removeStrokesByTemplateSource: (source) => {
      const key = typeof source === "string" ? source : null;
      if (!key) return;
      const updater = (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((l) => ({
          ...l,
          strokes: Array.isArray(l.strokes)
            ? l.strokes.filter((s) => s?.__templateSource !== key)
            : [],
        }));
      };
      setInternalLayers(updater);
      if (typeof setLayers === "function") {
        requestAnimationFrame(() => {
          setLayers(updater);
        });
      }
      setUndoStack([]);
      setRedoStack([]);
    },

    modifyStrokeAt,

    // Thêm ảnh / sticker / text (giữ logic layer)
    addImageStroke: (stroke) => {
      const s = {
        ...stroke,
        x: stroke.x ?? 100,
        y: stroke.y ?? 100,
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
      const adjustedY = (stroke.y ?? 100) + (stroke.scrollOffsetY ?? 0);
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
    loadStrokes: (strokesArray = [], layersMetadata = []) => {
      if (!Array.isArray(strokesArray)) {
        console.warn("[CanvasContainer] loadStrokes: invalid strokesArray");
        return;
      }

      try {
        let maxIdNum = 0;
        strokesArray.forEach((s) => {
          if (s && s.id && typeof s.id === "string" && s.id.startsWith("s_")) {
            const num = parseInt(s.id.substring(2), 10);
            if (!isNaN(num) && num > maxIdNum) {
              maxIdNum = num;
            }
          }
        });
        idCounter.current = maxIdNum + 1;

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

        const validStrokes = strokesArray
          .filter((s) => s && typeof s === "object")
          .map((s) => ({
            ...s,
            layerId: s.layerId || "layer1",
          }));

        const safeStrokes = validStrokes.slice(0, 1000);

        const strokesByLayer = {};
        safeStrokes.forEach((stroke) => {
          const layerId = stroke.layerId || "layer1";
          if (!strokesByLayer[layerId]) {
            strokesByLayer[layerId] = [];
          }
          strokesByLayer[layerId].push(stroke);
        });

        setInternalLayers((prev) => {
          if (!Array.isArray(prev)) {
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

          const layerMap = new Map(prev.map((l) => [l.id, { ...l }]));

          Object.keys(strokesByLayer).forEach((layerId) => {
            const meta = layerMetadataMap.get(layerId);
            if (layerMap.has(layerId)) {
              const layer = layerMap.get(layerId);
              layerMap.set(layerId, {
                ...layer,
                strokes: strokesByLayer[layerId],
                name: meta?.name || layer.name,
                visible:
                  meta !== undefined ? meta.visible !== false : layer.visible,
                locked:
                  meta !== undefined ? meta.locked === true : layer.locked,
              });
            } else {
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

          return Array.from(layerMap.values());
        });

        setUndoStack([]);
        setRedoStack([]);
      } catch (e) {
        console.warn("[CanvasContainer] loadStrokes error:", e);
      }
    },

    // [NEW] Append strokes incrementally without clearing existing ones
    appendStrokes: (strokesToAppend = [], options = {}) => {
      if (!Array.isArray(strokesToAppend) || strokesToAppend.length === 0) {
        return;
      }

      try {
        const newStrokesByLayer = {};
        strokesToAppend.forEach((stroke) => {
          if (!stroke || typeof stroke !== "object") return;
          const layerId = stroke.layerId || "layer1";
          if (!newStrokesByLayer[layerId]) {
            newStrokesByLayer[layerId] = [];
          }
          newStrokesByLayer[layerId].push(stroke);
        });

        const updater = (prevLayers) => {
          const layerMap = new Map(
            (Array.isArray(prevLayers) ? prevLayers : []).map((l) => [
              l.id,
              { ...l, strokes: [...(l.strokes || [])] },
            ])
          );

          const existingIds = new Set();
          layerMap.forEach((ly) => {
            (ly.strokes || []).forEach((s) => {
              if (s?.id) existingIds.add(s.id);
            });
          });

          Object.keys(newStrokesByLayer).forEach((layerId) => {
            const newStrokes = newStrokesByLayer[layerId];

            const processedStrokes = [];
            newStrokes.forEach((s) => {
              if (!s) return;
              let id = s.id;
              const isRemote = options.fromRemote === true;

              if (id && existingIds.has(id)) {
                if (isRemote) {
                  console.log(
                    "[CanvasContainer] Skipping duplicate remote stroke:",
                    id
                  );
                  return;
                } else {
                  id = nextId();
                }
              }

              if (!id) id = nextId();
              existingIds.add(id);
              processedStrokes.push({ ...s, id, layerId });
            });

            if (processedStrokes.length === 0) return;

            const hasTemplate = processedStrokes.some(
              (s) => s?.__templateSource
            );

            if (layerMap.has(layerId)) {
              const existingLayer = layerMap.get(layerId);
              if (hasTemplate) {
                existingLayer.strokes = [
                  ...processedStrokes,
                  ...(existingLayer.strokes || []),
                ];
              } else {
                existingLayer.strokes.push(...processedStrokes);
              }
            } else {
              layerMap.set(layerId, {
                id: layerId,
                name: layerId === "template" ? "Template" : `Layer ${layerId}`,
                visible: true,
                locked: false,
                strokes: processedStrokes,
              });
            }
          });
          return Array.from(layerMap.values());
        };
        setInternalLayers(updater);
        if (typeof setLayers === "function") {
          requestAnimationFrame(() => {
            setLayers(updater);
          });
        }
      } catch (e) {
        console.warn("[CanvasContainer] appendStrokes error:", e);
      }
    },
    updateStrokeById: modifyStrokeById,
    deleteStrokeById,
  }));

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
          style={[
            animatedStyle,
            { width: page.w, height: page.h, position: "relative" },
          ]}
        >
          <GestureHandler
            key={activeLayerId}
            page={page}
            tool={tool}
            color={color}
            setColor={setColor}
            setTool={setTool}
            eraserMode={eraserMode}
            activeLayerId={activeLayerId}
            onAddStroke={addStrokeInternal}
            onModifyStroke={modifyStrokeAt}
            onModifyStrokeById={modifyStrokeById}
            onLiveUpdateStroke={liveUpdateStroke}
            onModifyStrokesBulk={modifyStrokesBulk}
            onDeleteStroke={deleteStrokeAt}
            onDeleteStrokeById={deleteStrokeById}
            onSelectStroke={(id) => setSelectedId(id)}
            selectedId={selectedId}
            strokes={allStrokes}
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
            scrollOffsetY={scrollOffsetY}
            scrollYShared={scrollYShared}
            pageOffsetY={pageOffsetY}
            onColorPicked={onColorPicked}
            zoomState={zoomStateMemo}
            scrollRef={scrollRef}
            canvasRef={rendererRef}
            getNearestFont={getNearestFont}
            shapeSettings={shapeSettings}
            tapeSettings={tapeSettings}
            imageRefs={imageRefs}
            pageId={pageId}
            collabEnabled={collabEnabled}
            collabConnected={collabConnected}
            onCollabElementUpdate={onCollabElementUpdate}
            onCollabElementCreate={onCollabElementCreate}
            onCollabElementDelete={onCollabElementDelete}
            onCollabRequestLock={onCollabRequestLock}
            onCollabReleaseLock={onCollabReleaseLock}
            onCollabIsElementLocked={onCollabIsElementLocked}
          >
            <CanvasRenderer
              ref={rendererRef}
              layers={visibleLayers}
              loadedFonts={loadedFonts}
              getNearestFont={getNearestFont}
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
              shapeSettings={shapeSettings}
              tapeSettings={tapeSettings}
              canvasHeight={canvasHeight}
              shapeType={shapeType}
              backgroundColor={backgroundColor}
              pageTemplate={pageTemplate}
              backgroundImageUrl={backgroundImageUrl}
              pageWidth={PAGE_WIDTH}
              pageHeight={PAGE_HEIGHT}
              isCover={isCover}
              zoomState={zoomStateMemo}
              zoomSnapshot={zoomSnapshot}
              scrollOffsetY={scrollOffsetY}
            />
          </GestureHandler>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

export default memo(CanvasContainer);
