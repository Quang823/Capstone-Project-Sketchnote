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
    isPenMode,
    rulerPosition,
    scrollOffsetY = 0,
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

  const [showZoomOverlay, setShowZoomOverlay] = useState(false);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const idCounter = useRef(1);
  const rendererRef = useRef(null);

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
  useEffect(() => {
    if (activeLayerId) {
      console.log(`🟢 Active Layer: ${activeLayerId}`);
    } else {
      console.log("⚪ Chưa chọn layer nào!");
    }
  }, [activeLayerId]);

  const getActiveLayer = () =>
    layers.find((layer) => layer.id === activeLayerId);

  const updateActiveLayer = (updateFn) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== activeLayerId) return layer;
        const safeStrokes = Array.isArray(layer.strokes) ? layer.strokes : [];
        return { ...layer, strokes: updateFn(safeStrokes) };
      })
    );
  };

  const updateLayerById = (layerId, updateFn) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === layerId ? { ...l, strokes: updateFn(l.strokes) } : l
      )
    );
  };
  const visibleLayers = layers.filter((l) => l.visible);

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

  const pinch = Gesture.Pinch()
    .enabled(!zoomLocked)
    .onStart((e) => {
      "worklet";
      // ignore nếu <2 ngón (bảo vệ cho trường hợp library không hỗ trợ minPointers)
      if (!e || !e.numberOfPointers || e.numberOfPointers < 2) return;
      isZooming.value = true;
      isZoomingRef.current = true;
      baseScale.value = scale.value;
      runOnJS(() => {
        try {
          setShowZoomOverlay((prev) => (prev ? prev : true));
          // Notify parent to disable scroll when zoom starts
          if (typeof onZoomChange === "function") {
            onZoomChange(true); // true = zoom is active
          }
        } catch (err) {
          console.error("[CanvasContainer] Error in zoom onStart:", err);
        }
      })();
    })
    .onUpdate((e) => {
      "worklet";
      if (!e || !e.numberOfPointers || e.numberOfPointers < 2) return; // guard
      if (typeof e.scale !== "number" || !isFinite(e.scale)) return; // safety check
      scale.value = baseScale.value * e.scale;
      // Clamp scale to prevent extreme values
      if (scale.value < 0.5) scale.value = 0.5;
      if (scale.value > 5) scale.value = 5;
      const isZoomed = scale.value > 1.01;
      if (isZoomed !== lastZoomState.current) {
        lastZoomState.current = isZoomed;
      }
    })
    .onEnd(() => {
      "worklet";
      if (scale.value < 1) scale.value = withTiming(1);
      if (scale.value > 3) scale.value = withTiming(3);
      isZooming.value = false;
      // Capture scale value before runOnJS
      const finalScale = scale.value;
      const wasZoomed = finalScale > 1.01;
      runOnJS((stillZoomed) => {
        isZoomingRef.current = false;
        setShowZoomOverlay(false);
        if (!stillZoomed && lastZoomState.current) {
          lastZoomState.current = false;
        }
        // Notify parent: always false when pinch ends (re-enable scroll)
        if (typeof onZoomChange === "function") {
          onZoomChange(false); // Pinch ended, re-enable scroll
        }
      })(wasZoomed);
    });

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
    //.maxPointers(1) // Chỉ nhận khi 1 ngón tay
    .onEnd(() => {
      "worklet";
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      runOnJS(() => {
        lastZoomState.current = false;
        if (typeof onZoomChange === "function") {
          onZoomChange(false);
        }
      })();
    });

  // Compose gestures: pinch riêng, pan và doubleTap có thể cùng lúc
  const composedGesture = Gesture.Race(
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
    setUndoStack((u) => [
      ...u,
      { ...action, layerId: action.layerId || activeLayerId },
    ]);
    setRedoStack([]);
  };

  const addStrokeInternal = (stroke) => {
    updateActiveLayer((strokes) => [...strokes, stroke]);
    pushUndo({ type: "add", stroke, layerId: activeLayerId });
  };

  const deleteStrokeAt = (index) => {
    let removed = null;
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
  };

  const modifyStrokeAt = (index, newProps) => {
    updateActiveLayer((strokes) => {
      if (index < 0 || index >= strokes.length) return strokes;
      const old = strokes[index];
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
        layerId: opts.layerId ?? activeLayerId ?? "default", // ✅ fix chính
      };

      addStrokeInternal(newStroke);
      console.log("🖼️ Image added:", newStroke);
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
    // 🔙 Hoàn tác
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

    // 🔁 Làm lại
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

    // 🧹 Xóa layer hiện tại
    clear: () => {
      if (!activeLayerId) return;
      updateLayerById(activeLayerId, () => []);
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },

    // 🧾 Lấy strokes của layer đang active
    getStrokes: () => {
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      return activeLayer?.strokes || [];
    },

    // ➕ Thêm stroke trực tiếp vào layer đang active
    addStrokeDirect: (stroke) => {
      if (!activeLayerId) return;
      const s = { ...stroke, id: stroke.id ?? nextId() };
      addStrokeInternal(s);
    },

    modifyStrokeAt,

    // 🖼️ Thêm ảnh / sticker / text (giữ logic layer)
    // CanvasContainer.jsx (thêm vào ref exposes)
    addImageStroke: (stroke) => {
      const adjustedY = (stroke.y ?? 100) + (stroke.scrollOffsetY ?? 0); // ✅ Adjust y để visible
      const s = {
        ...stroke,
        y: adjustedY,
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

    // 📦 Load lại toàn bộ strokes cho layer hiện tại
    loadStrokes: (strokesArray = []) => {
      if (!Array.isArray(strokesArray) || !activeLayerId) return;
      updateLayerById(activeLayerId, () => strokesArray);
      setUndoStack([]);
      setRedoStack([]);
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
    <View style={{ flex: 1 }}>
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
            isPenMode={isPenMode}
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

      {showZoomOverlay && (
        <View
          style={{
            position: "absolute",
            top: 40,
            alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
            padding: 10,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: "white" }}>
            {zoomPercent}%
          </Text>
          <TouchableOpacity
            onPress={() => {
              setZoomLocked((prev) => !prev);
              if (!zoomLocked) setShowZoomOverlay(false);
            }}
            style={{
              marginLeft: 12,
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: zoomLocked ? "#007AFF" : "#E5E5EA",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: zoomLocked ? "white" : "black" }}>
              {zoomLocked ? "🔒" : "Lock"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default memo(CanvasContainer);
