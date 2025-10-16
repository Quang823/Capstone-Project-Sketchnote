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
} from "react-native-reanimated";

const PAGE_MARGIN_H = 24;
const PAGE_MARGIN_TOP = 20;
const PAGE_BOTTOM_SPACER = 64;

const CanvasContainer = forwardRef(function CanvasContainer(
  {
    tool,
    color,
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
  },
  ref
) {
  const { width, height } = useWindowDimensions();
  const PAGE_WIDTH = width - PAGE_MARGIN_H * 2;
  const PAGE_HEIGHT = Math.round(PAGE_WIDTH * Math.SQRT2);

  const [strokes, setStrokes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [realtimeText, setRealtimeText] = useState(null);

  // ✅ New: use 2 stacks for undo/redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const [showZoomOverlay, setShowZoomOverlay] = useState(false);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const idCounter = useRef(1);
  const rendererRef = useRef(null);

  // ====== Config cho tool hiện tại ======
  const activeConfig = toolConfigs?.[tool] || {
    pressure: 0.5,
    thickness: 1.5,
    stabilization: 0.2,
  };

  const page = {
    x: PAGE_MARGIN_H,
    y: PAGE_MARGIN_TOP,
    w: PAGE_WIDTH,
    h: PAGE_HEIGHT,
  };
  const canvasHeight = page.y + page.h + PAGE_BOTTOM_SPACER;
  const nextId = () => `s_${idCounter.current++}`;

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

  const pinch = Gesture.Pinch()
    .enabled(!zoomLocked)
    .onStart(() => {
      baseScale.value = scale.value;
      runOnJS(() => {
        setShowZoomOverlay((prev) => (prev ? prev : true));
      })();
    })
    .onUpdate((e) => {
      scale.value = baseScale.value * e.scale;
      const isZoomed = scale.value > 1.01;
      if (isZoomed !== lastZoomState.current) {
        lastZoomState.current = isZoomed;
        if (typeof onZoomChange === "function") runOnJS(onZoomChange)(isZoomed);
      }
    })
    .onEnd(() => {
      if (scale.value < 1) scale.value = withTiming(1);
      if (scale.value > 3) scale.value = withTiming(3);
      runOnJS(setShowZoomOverlay)(false);
      if (scale.value <= 1.01 && lastZoomState.current) {
        lastZoomState.current = false;
        if (typeof onZoomChange === "function") runOnJS(onZoomChange)(false);
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      baseTranslateX.value = translateX.value;
      baseTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = baseTranslateX.value + e.translationX;
      translateY.value = baseTranslateY.value + e.translationY;
      clampPan();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      lastZoomState.current = false;
      if (typeof onZoomChange === "function") runOnJS(onZoomChange)(false);
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const derivedZoom = useDerivedValue(() => Math.round(scale.value * 100));
  useEffect(() => {
    const id = setInterval(() => setZoomPercent(derivedZoom.value), 80);
    return () => clearInterval(id);
  }, [derivedZoom]);

  // ====== Helpers for History ======
  const pushUndo = (action) => {
    setUndoStack((u) => [...u, action]);
    setRedoStack([]); // reset redo
  };

  const addStrokeInternal = (stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    pushUndo({ type: "add", stroke });
  };

  const deleteStrokeAt = (index) => {
    setStrokes((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const removed = prev[index];
      const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
      pushUndo({ type: "delete", index, stroke: removed });
      return next;
    });
  };

  const modifyStrokeAt = (index, newProps) => {
    setStrokes((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const old = prev[index];
      const updated = { ...old, ...newProps };
      const next = [...prev.slice(0, index), updated, ...prev.slice(index + 1)];
      pushUndo({ type: "modify", index, before: old, after: updated });
      return next;
    });
  };

  // ====== Expose API ======
  useImperativeHandle(ref, () => ({
    undo: () => {
      setUndoStack((prevUndo) => {
        if (prevUndo.length === 0) return prevUndo;
        const last = prevUndo[prevUndo.length - 1];
        setRedoStack((r) => [...r, last]);
        setStrokes((s) => {
          if (!s) return s;
          if (last.type === "add") {
            const id = last.stroke?.id;
            if (id) {
              const idx = s.findIndex((x) => x.id === id);
              if (idx !== -1) return [...s.slice(0, idx), ...s.slice(idx + 1)];
            }
            return s.slice(0, -1);
          } else if (last.type === "delete") {
            const idx = Math.min(Math.max(0, last.index), s.length);
            const next = [...s];
            next.splice(idx, 0, last.stroke);
            return next;
          } else if (last.type === "modify") {
            const next = [...s];
            next[last.index] = last.before;
            return next;
          }
          return s;
        });
        return prevUndo.slice(0, -1);
      });
    },

    redo: () => {
      setRedoStack((prevRedo) => {
        if (prevRedo.length === 0) return prevRedo;
        const last = prevRedo[prevRedo.length - 1];
        setUndoStack((u) => [...u, last]);
        setStrokes((s) => {
          if (!s) return s;
          if (last.type === "add") {
            return [...s, last.stroke];
          } else if (last.type === "delete") {
            const idx = last.index;
            if (idx < 0 || idx >= s.length) return s;
            return [...s.slice(0, idx), ...s.slice(idx + 1)];
          } else if (last.type === "modify") {
            const next = [...s];
            next[last.index] = last.after;
            return next;
          }
          return s;
        });
        return prevRedo.slice(0, -1);
      });
    },

    clear: () => {
      setStrokes([]);
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },

    getStrokes: () => strokes,

    addStrokeDirect: (stroke) => {
      const s = { ...stroke, id: stroke.id ?? nextId() };
      addStrokeInternal(s);
    },

    // optional: expose modifyStrokeAt to fill
    modifyStrokeAt,
  }));

  // ====== Khi kết thúc stroke từ GestureHandler ======
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

      // ✅ Sửa tại đây:
      // Nếu là sticky, text, hoặc comment, xóa realtimeText sau khi add
      if (["text", "sticky", "comment"].includes(strokeSnapshot.tool)) {
        setRealtimeText(null);
      }
    },
    [tool, color, activeConfig]
  );

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[animatedStyle, { alignSelf: "center" }]}>
          <GestureHandler
            page={page}
            tool={tool}
            color={color}
            eraserMode={eraserMode}
            isPenMode={isPenMode}
            onAddStroke={handleAddStroke}
            onModifyStroke={modifyStrokeAt}
            onDeleteStroke={deleteStrokeAt}
            strokes={strokes}
            setStrokes={setStrokes}
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
          >
            <CanvasRenderer
              ref={rendererRef}
              strokes={
                realtimeText &&
                ["text", "sticky", "comment"].includes(realtimeText.tool)
                  ? strokes.filter((s) => s.id !== realtimeText.id)
                  : strokes
              }
              realtimeText={
                realtimeText && typeof realtimeText === "object"
                  ? realtimeText
                  : null
              }
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
