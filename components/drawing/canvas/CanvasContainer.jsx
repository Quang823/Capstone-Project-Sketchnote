import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
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
    eraserWidth,
    brushWidth = 8,
    brushOpacity = 0.6,
    calligraphyWidth = 6,
    calligraphyOpacity = 0.9,
    paperStyle = "plain",
    shapeType = "auto",
    onZoomChange, // báo cho MultiPageCanvas khi zoom
  },
  ref
) {
  const { width, height } = useWindowDimensions();
  const PAGE_WIDTH = width - PAGE_MARGIN_H * 2;
  const PAGE_HEIGHT = Math.round(PAGE_WIDTH * Math.SQRT2);

  const [strokes, setStrokes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [showZoomOverlay, setShowZoomOverlay] = useState(false);
  const [zoomLocked, setZoomLocked] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const idCounter = useRef(1);
  const rendererRef = useRef(null);

  const page = {
    x: PAGE_MARGIN_H,
    y: PAGE_MARGIN_TOP,
    w: PAGE_WIDTH,
    h: PAGE_HEIGHT,
  };
  const canvasHeight = page.y + page.h + PAGE_BOTTOM_SPACER;

  const nextId = () => {
    const id = idCounter.current++;
    return `s_${id}`;
  };

  // ===== Zoom / Pan states =====
  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0);
  const baseTranslateY = useSharedValue(0);

  // Clamp pan trong canvas
  const clampPan = () => {
    "worklet";
    const maxX = Math.max(0, (PAGE_WIDTH * scale.value - width) / 2);
    const maxY = Math.max(0, (PAGE_HEIGHT * scale.value - height) / 2);
    translateX.value = Math.min(Math.max(translateX.value, -maxX), maxX);
    translateY.value = Math.min(Math.max(translateY.value, -maxY), maxY);
  };

  const lastZoomState = useRef(false);

  // 👆 Pinch zoom gesture
  const pinch = Gesture.Pinch()
    .enabled(!zoomLocked)
    .onStart(() => {
      baseScale.value = scale.value;
      runOnJS(setShowZoomOverlay)(true);
    })
    .onUpdate((e) => {
      scale.value = baseScale.value * e.scale;

      const isZoomed = scale.value > 1.01;
      if (isZoomed !== lastZoomState.current) {
        lastZoomState.current = isZoomed;
        if (typeof onZoomChange === "function") {
          runOnJS(onZoomChange)(isZoomed);
        }
      }
    })
    .onEnd(() => {
      if (scale.value < 1) scale.value = withTiming(1);
      if (scale.value > 3) scale.value = withTiming(3);

      runOnJS(setShowZoomOverlay)(false);

      if (scale.value <= 1.01 && lastZoomState.current) {
        lastZoomState.current = false;
        if (typeof onZoomChange === "function") {
          runOnJS(onZoomChange)(false);
        }
      }
    });

  // 👆 Pan move gesture
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

  // 👆 Double-tap reset
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withTiming(1);
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
      lastZoomState.current = false;
      if (typeof onZoomChange === "function") {
        runOnJS(onZoomChange)(false);
      }
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Derived zoom percent
  const derivedZoom = useDerivedValue(() => {
    return Math.round(scale.value * 100);
  });
  useEffect(() => {
    const id = setInterval(() => {
      setZoomPercent(derivedZoom.value);
    }, 100);
    return () => clearInterval(id);
  }, [derivedZoom]);

  // ====== Expose API ======
  useImperativeHandle(ref, () => ({
    undo: () => {
      setStrokes((prev) => {
        if (prev.length === 0) return prev;
        const idx = prev.length - 1;
        const popped = prev[idx];
        setRedoStack((redo) => [...redo, { stroke: popped, index: idx }]);
        return prev.slice(0, -1);
      });
    },
    redo: () => {
      setRedoStack((prev) => {
        if (prev.length === 0) return prev;
        const { stroke, index } = prev[prev.length - 1];
        setStrokes((s) => {
          const next = [...s];
          const insertAt = Math.min(Math.max(0, index), next.length);
          next.splice(insertAt, 0, stroke);
          return next;
        });
        return prev.slice(0, -1);
      });
    },
    clear: () => {
      setStrokes([]);
      setRedoStack([]);
      setCurrentPoints([]);
    },
    getStrokes: () => strokes,
    snapshotBase64: () => rendererRef.current?.snapshotBase64?.(),
    addStrokeDirect: (stroke) => {
      setStrokes((prev) => [...prev, { ...stroke, id: stroke.id ?? nextId() }]);
      setRedoStack([]);
    },
  }));

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[animatedStyle, { alignSelf: "center" }]}>
          <GestureHandler
            page={page}
            tool={tool}
            eraserMode={tool === "object-eraser" ? "object" : "pixel"}
            strokes={strokes}
            setStrokes={setStrokes}
            currentPoints={currentPoints}
            setCurrentPoints={setCurrentPoints}
            setRedoStack={setRedoStack}
            color={color}
            strokeWidth={strokeWidth}
            pencilWidth={pencilWidth}
            eraserWidth={eraserWidth}
            brushWidth={brushWidth}
            brushOpacity={brushOpacity}
            calligraphyWidth={calligraphyWidth}
            calligraphyOpacity={calligraphyOpacity}
            containerRef={ref}
          >
            <CanvasRenderer
              ref={rendererRef}
              strokes={strokes}
              currentPoints={currentPoints}
              tool={tool}
              eraserMode={tool === "object-eraser" ? "object" : "pixel"}
              color={color}
              strokeWidth={strokeWidth}
              pencilWidth={pencilWidth}
              eraserWidth={eraserWidth}
              brushWidth={brushWidth}
              brushOpacity={brushOpacity}
              calligraphyWidth={calligraphyWidth}
              calligraphyOpacity={calligraphyOpacity}
              paperStyle={paperStyle}
              page={page}
              canvasHeight={canvasHeight}
            />
          </GestureHandler>
        </Animated.View>
      </GestureDetector>

      {/* Floating Zoom Panel */}
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

export default CanvasContainer;
