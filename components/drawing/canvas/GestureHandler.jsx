import React, { useRef, useState, useEffect, useCallback } from "react";
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
import debounce from "lodash/debounce";

export default function GestureHandler({
  page,
  tool,
  eraserMode,
  strokes,
  setStrokes,
  currentPoints,
  setCurrentPoints,
  setRedoStack,
  color,
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
  onDeleteStroke,
  children,
  isPenMode,
  canvasRef,
  setRealtimeText,
}) {
  const liveRef = useRef([]);
  const rafScheduled = useRef(false);
  const lastEraserPointRef = useRef(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
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
  const tapTimeout = useRef(null);
  const lastTapTime = useRef(0);
  useEffect(() => {
    if (
      !editorVisible &&
      !selectedId &&
      typeof setRealtimeText === "function"
    ) {
      requestAnimationFrame(() => setRealtimeText(null));
    }
  }, [editorVisible, selectedId]);

  const handleTextChange = useCallback(
    (data) => {
      if (selectedId) {
        setStrokes((prev) => {
          const currentStroke = prev.find((s) => s.id === selectedId);
          if (
            currentStroke &&
            (currentStroke.text !== data.text ||
              currentStroke.bold !== data.bold ||
              currentStroke.italic !== data.italic ||
              currentStroke.underline !== data.underline ||
              currentStroke.align !== data.align ||
              currentStroke.color !== data.color ||
              currentStroke.fontSize !== data.fontSize ||
              currentStroke.fontFamily !== data.fontFamily)
          ) {
            return prev.map((s) =>
              s.id === selectedId
                ? {
                    ...s,
                    text: data.text,
                    bold: data.bold,
                    italic: data.italic,
                    underline: data.underline,
                    align: data.align,
                    color: data.color,
                    fontSize: data.fontSize,
                    fontFamily: data.fontFamily,
                  }
                : s
            );
          }
          return prev; // Không cập nhật nếu không có thay đổi
        });
        // 🔑 Sau phần setStrokes(...), thêm đoạn này:
        if (typeof setRealtimeText === "function") {
          if (data && typeof data.text === "string") {
            setRealtimeText({
              id: selectedId,
              ...data,
              x: Number.isFinite(editorProps.x) ? editorProps.x : 0,
              y: Number.isFinite(editorProps.y) ? editorProps.y : 0,
            });
          }
        }

        // 🔑 Chỉ cập nhật selectedBox nếu cần
        const currentStroke = strokes.find((s) => s.id === selectedId);
        const avgCharWidth = (data.fontSize || 18) * 0.55;
        const textWidth = (data.text?.length || 1) * avgCharWidth;
        const padding = currentStroke?.padding || 0;

        // setSelectedBox((prev) => {
        //   const newBox = {
        //     x: editorProps.x - padding - 1,
        //     y: editorProps.y - (data.fontSize || 18) - padding - 1,
        //     width: textWidth + padding * 2 + 2,
        //     height: (data.fontSize || 18) + padding * 2 + 2,
        //   };
        //   // Chỉ cập nhật nếu box thay đổi
        //   if (
        //     !prev ||
        //     prev.x !== newBox.x ||
        //     prev.y !== newBox.y ||
        //     prev.width !== newBox.width ||
        //     prev.height !== newBox.height
        //   ) {
        //     return newBox;
        //   }
        //   return prev;
        // });
      }
    },
    [
      selectedId,
      editorProps.x,
      editorProps.y,
      strokes,
      setStrokes,
      setSelectedBox,
    ]
  );

  // ========= TEXT HANDLING =========
  const addTextStroke = (x, y, toolType, text) => {
    const basePadding = ["sticky", "comment"].includes(tool) ? 8 : 0;
    const baseBg =
      tool === "sticky"
        ? "#FFEB3B"
        : tool === "comment"
        ? "#E3F2FD"
        : "transparent";

    const newTextStroke = {
      id: tempId,
      tool,
      x: e.x,
      y: e.y,
      text: "",
      color: color || "#000",
      fontSize: tool === "sticky" ? 16 : tool === "comment" ? 14 : 18,
      fontFamily: "Roboto-Regular",
      bold: false,
      italic: false,
      underline: false,
      align: "left",
      backgroundColor: baseBg,
      padding: basePadding,
    };

    setStrokes((prev) => [...prev, newTextStroke]);
    setRedoStack([]);
  };

  const showTextInputDialog = (x, y, toolType) => {
    setEditorProps({ x, y, tool: toolType, data: {} });
    setEditorVisible(true);
  };

  // ========= HIT TEST =========
  const hitTestText = (x, y, strokes) => {
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (["text", "sticky", "comment"].includes(s.tool)) {
        const w =
          (s.text?.length || 1) * (s.fontSize || 18) * 0.6 +
          (s.padding || 0) * 2;
        const h = (s.fontSize || 18) + (s.padding || 0) * 2;
        if (
          x >= s.x - (s.padding || 0) &&
          x <= s.x - (s.padding || 0) + w &&
          y <= s.y &&
          y >= s.y - h
        ) {
          return s;
        }
      }
    }
    return null;
  };

  const getPointerType = (e) => e?.nativeEvent?.pointerType || "touch";
  const isPenEvent = (e) => ["pen", "stylus"].includes(getPointerType(e));
  const isTouchEvent = (e) => getPointerType(e) === "touch";

  // 🟢 Double-tap gesture
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .maxDistance(15)
    .runOnJS(true)
    .onStart((e) => {
      const hit = hitTestText(e.x, e.y, strokes);
      if (hit) {
        setSelectedId(hit.id);
        setSelectedBox(null);
        // ✨ thêm dòng này:
        if (typeof setRealtimeText === "function")
          setRealtimeText({ id: hit.id, ...hit });

        setEditorProps({
          x: hit.x,
          y: hit.y,
          tool: hit.tool,
          data: hit,
        });
        setEditorVisible(true);
      }
    });

  // ====== TAP GESTURE ======
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart((e) => {
      const hit = hitTestText(e.x, e.y, strokes);
      if (["text", "sticky", "comment"].includes(tool)) {
        if (hit) {
          if (typeof setRealtimeText === "function")
            setRealtimeText({ id: hit.id, ...hit });

          const w =
            (hit.text?.length || 1) * (hit.fontSize || 18) * 0.6 +
            (hit.padding || 0) * 2;
          const h = (hit.fontSize || 18) + (hit.padding || 0) * 2;
          if (selectedId && hit.id === selectedId) {
            setSelectedId(hit.id);
            setSelectedBox(null);
            setEditorProps({
              x: hit.x,
              y: hit.y,
              tool: hit.tool,
              data: hit,
            });
            setEditorVisible(true);
          } else {
            setSelectedId(hit.id);
            setSelectedBox({
              x: hit.x - (hit.padding || 0) - 1,
              y: hit.y - (hit.fontSize || 18) - (hit.padding || 0) - 1,
              width: w + 2,
              height: h + 2,
            });
          }
        } else {
          if (!hitTestText(e.x, e.y, strokes)) {
            setSelectedId(null);
            setSelectedBox(null);
          }
        }
      } else if (selectedId) {
        if (hit && hit.id === selectedId) {
          setSelectedId(hit.id);
          setSelectedBox(null);
          setEditorProps({
            x: hit.x,
            y: hit.y,
            tool: hit.tool,
            data: hit,
          });
          setEditorVisible(true);
        } else {
          setSelectedId(null);
          setSelectedBox(null);
        }
      }
    });

  // ========= GESTURE =========
  const pan = Gesture.Pan()
    .minDistance(1)
    .runOnJS(true)
    .onStart((e) => {
      /** 🟨 TEXT ADD / EDIT **/
      const hit = hitTestText(e.x, e.y, strokes);
      if (["text", "sticky", "comment"].includes(tool)) {
        if (hit) {
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
          });
          return;
        } else {
          // 🟢 Tap trống => thêm text mới với stroke tạm để realtime render
          const tempId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
          const newTextStroke = {
            id: tempId,
            tool,
            x: e.x,
            y: e.y,
            text: "",
            color,
            fontSize: tool === "sticky" ? 16 : tool === "comment" ? 14 : 18,
            fontFamily: "Roboto-Regular",
            bold: false,
            italic: false,
            underline: false,
            align: "left",
            backgroundColor:
              tool === "sticky"
                ? "#FFEB3B"
                : tool === "comment"
                ? "#E3F2FD"
                : "transparent",
            padding: tool === "sticky" || tool === "comment" ? 8 : 0,
          };

          // 🟢 Add stroke tạm để CanvasRenderer vẽ realtime
          // setStrokes((prev) => [...prev, newTextStroke]);
          // setRedoStack([]);

          setSelectedId(tempId);
          if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;

          // 🟢 Đặt realtimeText để hiện chữ realtime
          if (typeof setRealtimeText === "function") {
            setRealtimeText({
              ...newTextStroke,
              text: "",
              fontSize: newTextStroke.fontSize ?? 16,
              color: newTextStroke.color ?? "#000",
              backgroundColor: newTextStroke.backgroundColor ?? "transparent",
            });
          }

          // 🟢 Mở editor
          setEditorProps({ x: e.x, y: e.y, tool, data: newTextStroke });
          setEditorVisible(true);
          return;
        }
      }

      // ✅ Nếu người dùng đang chọn text mà bấm ra vùng trống => ẩn khung
      if (selectedId && !hitTestText(e.x, e.y, strokes)) {
        setSelectedId(null);
        setSelectedBox(null);
        return;
      }

      /** 🧽 ERASER SETUP **/
      if (
        tool === "eraser" &&
        ["pixel", "stroke", "object"].includes(eraserMode)
      ) {
        lastEraserPointRef.current = { x: e.x, y: e.y };
      }

      /** 🧾 OBJECT ERASER TAP **/
      if (eraserMode === "object") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          if (["text", "sticky", "comment"].includes(s.tool)) continue;
          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            e.x >= bbox.minX &&
            e.x <= bbox.maxX &&
            e.y >= bbox.minY &&
            e.y <= bbox.maxY
          ) {
            onDeleteStroke?.(i);
            return;
          }
        }
      }

      /** 🩶 STROKE ERASER **/
      if (eraserMode === "stroke") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          if (!s.points) continue;
          const near = s.points.some((p) => {
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 4;
          });
          if (near) {
            onDeleteStroke?.(i);
            return;
          }
        }
      }

      // Otherwise start drawing
      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      liveRef.current = [
        {
          x: e.x,
          y: e.y,
          pressure: toolConfig.pressure,
          thickness: toolConfig.thickness,
          stabilization: toolConfig.stabilization,
        },
      ];

      setCurrentPoints(liveRef.current);
      const livePath = canvasRef?.current?.livePath;
      if (livePath) {
        livePath.reset();
        livePath.moveTo(e.x, e.y);
      }
    })

    .onUpdate((e) => {
      if (!isInsidePage(e.x, e.y, page)) return;
      if (selectedId && draggingText) {
        const newX = e.x - draggingText.offsetX;
        const newY = e.y - draggingText.offsetY;

        setStrokes((prev) =>
          prev.map((s) =>
            s.id === selectedId ? { ...s, x: newX, y: newY } : s
          )
        );

        setSelectedBox((box) =>
          box
            ? {
                ...box,
                x:
                  newX -
                  (strokes.find((s) => s.id === selectedId)?.padding || 0) -
                  1,
                y:
                  newY -
                  (strokes.find((s) => s.id === selectedId)?.fontSize || 18) -
                  (strokes.find((s) => s.id === selectedId)?.padding || 0) -
                  1,
              }
            : box
        );

        setEditorProps((prev) => ({ ...prev, x: newX, y: newY }));

        // 🔥 FIX: cập nhật realtimeText để CanvasRenderer render đúng vị trí mới
        if (typeof setRealtimeText === "function") {
          const s = strokes.find((st) => st.id === selectedId);
          if (s) {
            setRealtimeText({
              id: s.id,
              tool: s.tool, // 🟡 cần để CanvasRenderer biết là sticky/comment
              text: s.text || "",
              color: s.color || "#000",
              x: newX,
              y: newY,
              fontSize: s.fontSize || 16,
              fontFamily: s.fontFamily || "Roboto-Regular",
              padding: s.padding ?? 6,
              backgroundColor: s.backgroundColor ?? "transparent",
            });
          }
        }

        return;
      }

      if (tool === "eraser") {
        if (eraserMode === "stroke") {
          if (!rafScheduled.current) {
            rafScheduled.current = true;
            requestAnimationFrame(() => {
              rafScheduled.current = false;
              setStrokes((prev) =>
                prev.filter((s, i) => {
                  if (!s.points) return true;
                  const hit = s.points.some((p) => {
                    const dx = p.x - e.x;
                    const dy = p.y - e.y;
                    return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 4;
                  });
                  if (hit) {
                    setRedoStack((redo) => [...redo, { stroke: s, index: i }]);
                    return false;
                  }
                  return true;
                })
              );
            });
          }
          return;
        }

        if (eraserMode === "pixel") {
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

      const last = liveRef.current.at(-1) || { x: 0, y: 0 };
      const dx = e.x - last.x;
      const dy = e.y - last.y;
      if (dx * dx + dy * dy < 9) return;
      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      liveRef.current.push({
        x: e.x,
        y: e.y,
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

    .onEnd(() => {
      const livePath = canvasRef?.current?.livePath;
      if (livePath) livePath.reset();
      const finalPoints = liveRef.current;
      liveRef.current = [];
      setCurrentPoints([]);

      if (eraserMode === "object" && finalPoints.length > 2) {
        const poly = finalPoints;
        setStrokes((prev) => {
          const next = [];
          for (let i = 0; i < prev.length; i++) {
            const s = prev[i];
            const bbox = getBoundingBoxForStroke(s);
            if (!bbox) continue;
            const cx = (bbox.minX + bbox.maxX) / 2;
            const cy = (bbox.minY + bbox.maxY) / 2;
            if (pointInPolygon(poly, cx, cy)) {
              setRedoStack((redo) => [...redo, { stroke: s, index: i }]);
              continue;
            }
            next.push(s);
          }
          return next;
        });
        return;
      }

      if (
        tool === "eraser" &&
        eraserMode === "pixel" &&
        finalPoints.length > 0
      ) {
        const erasePoints = finalPoints;

        setStrokes((prev) => {
          const next = [];

          for (let s of prev) {
            if (
              !s.points ||
              ["eraser", "text", "sticky", "comment"].includes(s.tool)
            ) {
              next.push(s);
              continue;
            }

            const margin = 0.5 * (eraserSize || 6);
            const hitIndexes = s.points
              .map((p, i) => ({
                i,
                hit: erasePoints.some(
                  (ep) => Math.hypot(p.x - ep.x, p.y - ep.y) <= margin
                ),
              }))
              .filter((r) => r.hit)
              .map((r) => r.i);

            if (hitIndexes.length === 0) {
              next.push(s);
              continue;
            }

            const segments = [];
            let segment = [];

            for (let i = 0; i < s.points.length; i++) {
              const isHit = hitIndexes.includes(i);
              if (isHit) {
                if (segment.length > 1) {
                  segments.push(segment);
                }
                segment = [];
              } else {
                segment.push(s.points[i]);
              }
            }
            if (segment.length > 1) segments.push(segment);

            for (let idx = 0; idx < segments.length; idx++) {
              const pts = segments[idx];
              if (pts.length < 2) continue;
              next.push({
                ...s,
                id: `${s.id}_part${idx + 1}_${Date.now()}`,
                points: pts,
              });
            }
          }

          return next;
        });

        setRedoStack([]);
        setCurrentPoints([]);
        return;
      }

      if (tool === "fill") {
        const tapX = finalPoints[0]?.x;
        const tapY = finalPoints[0]?.y;
        for (let i = 0; i < strokes.length; i++) {
          const s = strokes[i];
          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            tapX >= bbox.minX &&
            tapX <= bbox.maxX &&
            tapY >= bbox.minY &&
            tapY <= bbox.maxY
          ) {
            onModifyStroke?.(i, { fill: true, fillColor: color });
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

      if (tool !== "eraser") {
        if (typeof onAddStroke === "function") onAddStroke(newStroke);
        else {
          setStrokes((prev) => [...prev, newStroke]);
          setRedoStack([]);
        }
      }
    });

  const debouncedUpdate = debounce((updateFn) => updateFn(), 16);

  // ========= RENDER =========
  return (
    <>
      <GestureDetector
        gesture={Gesture.Race(doubleTap, Gesture.Simultaneous(tap, pan))}
      >
        {React.cloneElement(children, {
          strokes: children.props.strokes ?? strokes,
        })}
      </GestureDetector>
      {selectedBox && selectedId && !editorVisible && (
        <TextSelectionBox
          x={selectedBox.x}
          y={selectedBox.y}
          width={selectedBox.width}
          height={selectedBox.height}
          onMove={(dx, dy) => {
            setSelectedBox((box) =>
              box ? { ...box, x: box.x + dx, y: box.y + dy } : box
            );

            setStrokes((prev) =>
              prev.map((s) =>
                s.id === selectedId ? { ...s, x: s.x + dx, y: s.y + dy } : s
              )
            );

            setEditorProps((prev) => ({
              ...prev,
              x: prev.x + dx,
              y: prev.y + dy,
            }));

            if (typeof setRealtimeText === "function") {
              setRealtimeText((prev) =>
                prev && prev.id === selectedId
                  ? { ...prev, x: prev.x + dx, y: prev.y + dy }
                  : prev
              );
            }
          }}
          onResize={(corner, dx, dy) => {
            const s = strokes.find((str) => str.id === selectedId);
            if (!s) return;

            const delta = corner === "tl" || corner === "bl" ? -dy : dy;
            const newFontSize = Math.max(8, (s.fontSize || 18) + delta * 0.2);
            const avgCharWidth = newFontSize * 0.55;
            const textWidth = (s.text?.length || 1) * avgCharWidth;
            const padding = s.padding || 0;

            debouncedUpdate(() => {
              setStrokes((prev) =>
                prev.map((str) =>
                  str.id === selectedId
                    ? { ...str, fontSize: newFontSize }
                    : str
                )
              );
              setSelectedBox({
                x: s.x - padding - 1,
                y: s.y - newFontSize - padding - 1,
                width: textWidth + padding * 2 + 2,
                height: newFontSize + padding * 2 + 2,
              });
            });
          }}
          onCopy={() => {
            const target = strokes.find((s) => s.id === selectedId);
            if (target) {
              setStrokes((prev) => [
                ...prev,
                {
                  ...target,
                  id: Date.now().toString(),
                  x: target.x + 20,
                  y: target.y + 20,
                },
              ]);
              setSelectedId(null);
              setSelectedBox(null);
            }
          }}
          onCut={() => {
            setStrokes((prev) => prev.filter((s) => s.id !== selectedId));
            setSelectedId(null);
            setSelectedBox(null);
          }}
          onDelete={() => {
            setStrokes((prev) => prev.filter((s) => s.id !== selectedId));
            setSelectedId(null);
            setSelectedBox(null);
          }}
          onEdit={() => {
            const hit = strokes.find((s) => s.id === selectedId);
            if (hit) {
              if (typeof setRealtimeText === "function")
                setRealtimeText({ id: hit.id, ...hit });

              setEditorProps({
                x: hit.x,
                y: hit.y,
                tool: hit.tool,
                data: hit,
              });
              setEditorVisible(true);
            }
          }}
        />
      )}

      <InlineTextEditor
        visible={editorVisible}
        x={editorProps.x}
        y={editorProps.y}
        initialText={editorProps.data.text || ""}
        initialData={editorProps.data}
        isEditingExisting={!!selectedId}
        onCancel={() => {
          setEditorVisible(false);
          setSelectedId(null);
          setSelectedBox(null);
          if (setRealtimeText) setRealtimeText(null);
        }}
        onSubmit={(data) => {
          if (selectedId) {
            // Edit existing
            setStrokes((prev) =>
              prev.map((s) =>
                s.id === selectedId
                  ? {
                      ...s,
                      ...data,
                      x: editorProps.x,
                      y: editorProps.y,
                      padding: s.padding ?? 0,
                      backgroundColor: s.backgroundColor ?? "transparent",
                    }
                  : s
              )
            );
          } else {
            // Add new
            const basePadding =
              editorProps.tool === "sticky" || editorProps.tool === "comment"
                ? 8
                : 0;
            const baseBg =
              editorProps.tool === "sticky"
                ? "#FFEB3B"
                : editorProps.tool === "comment"
                ? "#E3F2FD"
                : "transparent";

            const newStroke = {
              id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
              tool: editorProps.tool,
              x: editorProps.x,
              y: editorProps.y,
              text: data.text || "",
              bold: !!data.bold,
              italic: !!data.italic,
              underline: !!data.underline,
              align: data.align || "left",
              color: data.color || color,
              fontSize: data.fontSize || 18,
              fontFamily: data.fontFamily || "Roboto-Regular",
              padding: basePadding,
              backgroundColor: baseBg,
            };

            setStrokes((prev) => [...prev, newStroke]);
            setRedoStack([]);
          }

          if (typeof setRealtimeText === "function") {
            setRealtimeText(null);
            setStrokes((prev) =>
              prev.filter((s) => s.text && s.text.trim() !== "")
            );
          }

          setEditorVisible(false);
          setSelectedId(null);
          setSelectedBox(null);
        }}
        onChange={handleTextChange}
      />
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
