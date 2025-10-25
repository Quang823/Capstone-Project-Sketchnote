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
import ImageTransformBox from "../image/ImageTransformBox";
import ImageSelectionBox from "../image/ImageSelectionBox";
import LassoSelectionBox from "../lasso/LassoSelectionBox";
import useLassoTransform from "../../../hooks/useLassoTransform";

import debounce from "lodash/debounce";
import { useMemo } from "react";

export default function GestureHandler({
  page,
  tool,
  eraserMode,
  strokes,
  currentPoints,
  setCurrentPoints,
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
  onModifyStrokesBulk,
  onDeleteStroke,
  children,
  isPenMode,
  canvasRef,
  setRealtimeText,
  zoomState,
  onSelectStroke,
  activeLayerId,
}) {
  const liveRef = useRef([]);
  const rafScheduled = useRef(false);
  const lastEraserPointRef = useRef(null);
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
  const [lassoSelection, setLassoSelection] = useState([]);
  const [isMovingLasso, setIsMovingLasso] = useState(false);
  const [lassoOrigin, setLassoOrigin] = useState(null);
  const [lassoMoveStart, setLassoMoveStart] = useState(null);
  const lassoMoveRAF = useRef(false);
  const lassoPendingDelta = useRef({ dx: 0, dy: 0 });
  const [lassoBaseBox, setLassoBaseBox] = useState(null);
  const [lassoVisualOffset, setLassoVisualOffset] = useState({ dx: 0, dy: 0 });
  const [visualOffsets, setVisualOffsets] = useState({});

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

  const { handleMove, handleMoveCommit, handleResize, handleRotate } =
    useLassoTransform({
      strokes,
      lassoSelection,
      setLassoOrigin,
      onModifyStroke,
      onModifyStrokesBulk,
      getBoundingBoxForStroke,
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
        setSelectedId(null);
        setSelectedBox(null);
        setRealtimeText(null);
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
        }
        return;
      }

      setSelectedId(null);
      setSelectedBox(null);
    });

  const pan = Gesture.Pan()
    .minDistance(1)
    .runOnJS(true)
    .onStart((e) => {
      if (["image", "sticker", "camera"].includes(tool)) return;

      if (tool === "lasso" && lassoSelection.length > 0) {
        // Bấm vào trong selection để bắt đầu move
        const hit = lassoOrigin?.some((stInfo) => {
          const s = strokes.find((st) => st.id === stInfo.id);
          if (!s) return false;
          const bbox = getBoundingBoxForStroke(s);
          if (!bbox) return false;
          return (
            e.x >= bbox.minX - 10 &&
            e.x <= bbox.maxX + 10 &&
            e.y >= bbox.minY - 10 &&
            e.y <= bbox.maxY + 10
          );
        });

        if (hit) {
          setIsMovingLasso(true);
          setLassoMoveStart({ x: e.x, y: e.y });
          return;
        } else {
          // Nếu click ra ngoài, reset để vẽ vùng chọn mới
          setLassoSelection([]);
          setLassoPoints([{ x: e.x, y: e.y }]);
          setIsMovingLasso(false);
          return;
        }
      }

      // --- Nếu chưa có vùng chọn nào, bắt đầu vẽ vùng lasso mới ---
      if (tool === "lasso") {
        setLassoPoints([{ x: e.x, y: e.y }]);
        setLassoSelection([]);
        setIsMovingLasso(false);
        return;
      }

      // Các logic cũ cho text/eraser/pen...
      const validStrokes = strokes.filter(
        (s) => s.layerId === activeLayerId && (s.visible ?? true)
      );
      if (!activeLayerId) return;

      const hit = hitTestText(e.x, e.y, validStrokes);

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
            layerId: activeLayerId,
          };
          if (typeof onAddStroke === "function") {
            try {
              onAddStroke(newTextStroke);
            } catch (err) {
              console.error("⚠️ onAddStroke error:", err);
            }
          }

          setSelectedId(tempId);
          if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
          if (typeof setRealtimeText === "function") {
            setRealtimeText({
              ...newTextStroke,
              text: "",
              fontSize: newTextStroke.fontSize ?? 16,
              color: newTextStroke.color ?? "#000",
              backgroundColor: newTextStroke.backgroundColor ?? "transparent",
            });
          }
          setEditorProps({ x: e.x, y: e.y, tool, data: newTextStroke });
          setEditorVisible(true);
          return;
        }
      }

      if (
        tool === "eraser" &&
        ["pixel", "stroke", "object"].includes(eraserMode)
      ) {
        lastEraserPointRef.current = { x: e.x, y: e.y };
      }

      if (eraserMode === "object") {
        for (let i = validStrokes.length - 1; i >= 0; i--) {
          const s = validStrokes[i];
          if (["text", "sticky", "comment"].includes(s.tool)) continue;
          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            e.x >= bbox.minX &&
            e.x <= bbox.maxX &&
            e.y >= bbox.minY &&
            e.y <= bbox.maxY
          ) {
            const globalIndex = strokes.findIndex(
              (s) => s.id === validStrokes[i].id
            );
            if (globalIndex !== -1) onDeleteStroke(globalIndex);

            return;
          }
        }
      }

      if (eraserMode === "stroke") {
        for (let i = validStrokes.length - 1; i >= 0; i--) {
          const s = validStrokes[i];
          if (!s.points) continue;
          const near = s.points.some((p) => {
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 4;
          });
          if (near) {
            const globalIndex = strokes.findIndex(
              (s) => s.id === validStrokes[i].id
            );
            if (globalIndex !== -1) onDeleteStroke(globalIndex);

            return;
          }
        }
      }

      if (tool === "sticky" || tool === "comment") {
        const newId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setTempStrokeId(newId);

        // Tạo temporary stroke
        const tempStroke = {
          id: newId,
          tool,
          x: e.x,
          y: e.y,
          text: "",
          layerId: activeLayerId,
        };

        onAddStroke?.(tempStroke);

        // Mở editor ngay
        setEditorProps({
          x: e.x,
          y: e.y,
          tool,
          data: tempStroke,
        });
        setEditorVisible(true);
        return;
      }

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
      if (["image", "sticker", "camera"].includes(tool)) return;
      if (!isInsidePage(e.x, e.y, page)) return;

      if (tool === "lasso" && isMovingLasso && lassoOrigin) {
        // accumulate delta since gesture start
        const dx = e.x - lassoMoveStart.x;
        const dy = e.y - lassoMoveStart.y;
        // update visual offset immediately so box and strokes follow finger, no state mutation on strokes
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
                  if (globalIndex !== -1) onDeleteStroke(globalIndex);
                }
              });
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

    .onEnd((e) => {
      if (["image", "sticker", "camera"].includes(tool)) return;
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

      // --- Khi thả tay sau khi move vùng chọn ---
      if (tool === "lasso" && isMovingLasso && lassoOrigin) {
        const dx = e.x - lassoMoveStart.x;
        const dy = e.y - lassoMoveStart.y;

        // final commit using tempOffset accumulated
        handleMoveCommit?.();

        lassoPendingDelta.current = { dx: 0, dy: 0 };
        lassoMoveRAF.current = false;
        // update base box position to new location
        setLassoBaseBox((box) =>
          box ? { ...box, x: box.x + dx, y: box.y + dy } : box
        );
        setLassoVisualOffset({ dx: 0, dy: 0 });
        // Dừng move
        setIsMovingLasso(false);
        setLassoMoveStart(null);
        return;
      }

      // Các xử lý cũ cuối cùng (vẽ stroke hoàn tất, eraser pixel / object ... ) - giữ nguyên
      const livePath = canvasRef?.current?.livePath;
      if (livePath) livePath.reset();

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
        const erasePoints = finalPoints;

        for (let i = 0; i < validStrokes.length; i++) {
          const s = validStrokes[i];
          if (
            !s.points ||
            ["eraser", "text", "sticky", "comment"].includes(s.tool)
          )
            continue;

          const margin = 0.5 * (eraserSize || 6);
          const hitIndexes = s.points
            .map((p, idx) => ({
              idx,
              hit: erasePoints.some(
                (ep) => Math.hypot(p.x - ep.x, p.y - ep.y) <= margin
              ),
            }))
            .filter((r) => r.hit)
            .map((r) => r.idx);

          if (hitIndexes.length === 0) continue;

          const segments = [];
          let segment = [];

          for (let j = 0; j < s.points.length; j++) {
            const isHit = hitIndexes.includes(j);
            if (isHit) {
              if (segment.length > 1) segments.push(segment);
              segment = [];
            } else {
              segment.push(s.points[j]);
            }
          }

          if (segment.length > 1) segments.push(segment);

          try {
            const globalIndex = strokes.findIndex(
              (s) => s.id === validStrokes[i].id
            );
            if (globalIndex !== -1) onDeleteStroke(globalIndex);
          } catch (err) {
            console.error("⚠️ Error deleting stroke (pixel):", err);
          }

          if (segments.length > 0 && typeof onAddStroke === "function") {
            try {
              segments.forEach((pts, segIdx) => {
                if (!pts || pts.length < 2) return;
                const newStroke = {
                  ...s,
                  id: `${s.id}_part${segIdx + 1}_${Date.now()}`,
                  points: pts,
                  layerId: s.layerId ?? activeLayerId,
                };
                onAddStroke(newStroke);
              });
            } catch (err) {
              console.error("⚠️ Error adding stroke segment:", err);
            }
          }
        }
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
            handleMoveCommit?.(dx, dy);
            setLassoBaseBox((box) =>
              box ? { ...box, x: box.x + dx, y: box.y + dy } : box
            );
            setLassoVisualOffset({ dx: 0, dy: 0 });
            setVisualOffsets({});
          }}
          onResize={handleResize}
          onRotate={handleRotate}
          onCopy={() => {
            const selStrokes = strokes.filter((s) =>
              lassoSelection.includes(s.id)
            );
            selStrokes.forEach((s) => {
              const clone = {
                ...s,
                id: `${s.id}_copy_${Date.now()}`,
                x: s.x + 20,
                y: s.y + 20,
              };
              onAddStroke?.(clone);
            });
            setLassoSelection([]);
          }}
          onCut={() => {
            const indices = strokes
              .map((s, i) => (lassoSelection.includes(s.id) ? i : -1))
              .filter((i) => i !== -1);
            indices.forEach((i) => onDeleteStroke?.(i));
            setLassoSelection([]);
          }}
          onDelete={() => {
            const indices = strokes
              .map((s, i) => (lassoSelection.includes(s.id) ? i : -1))
              .filter((i) => i !== -1);
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
              const s = strokes.find((s) => s.id === selectedId);
              if (!s) return;

              const newW = Math.max(20, s.width + dx);
              const newH = Math.max(20, s.height + dy);
              const newX = s.x + (corner.includes("l") ? dx : 0);
              const newY = s.y + (corner.includes("t") ? dy : 0);

              const index = strokes.findIndex((s) => s.id === selectedId);
              if (index !== -1 && typeof onModifyStroke === "function") {
                onModifyStroke(index, {
                  x: newX,
                  y: newY,
                  width: newW,
                  height: newH,
                });
              }

              setSelectedBox({
                ...selectedBox,
                x: newX,
                y: newY,
                width: newW,
                height: newH,
              });
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
            // Update temporary stroke thay vì tạo mới
            const index = strokes.findIndex((s) => s.id === tempStrokeId);
            if (index !== -1 && typeof onModifyStroke === "function") {
              onModifyStroke(index, {
                ...data,
                x: editorProps.x,
                y: editorProps.y,
              });
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
        ["image", "sticker"].includes(selectedStroke?.tool) && (
          <>
            <ImageTransformBox
              {...selectedBox}
              x={selectedStroke.x}
              y={selectedStroke.y}
              width={selectedStroke.width}
              height={selectedStroke.height}
              rotation={selectedStroke?.rotation ?? 0}
              onMove={(dx, dy) => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1)
                  modifyStroke(index, {
                    x: (strokes[index].x ?? 0) + dx,
                    y: (strokes[index].y ?? 0) + dy,
                  });

                setSelectedBox((b) => ({ ...b, x: b.x + dx, y: b.y + dy }));
              }}
              onResize={(corner, dx, dy) => {
                const s = strokes.find((s) => s.id === selectedId);
                if (!s) return;
                const ratio = s.width / s.height;
                let newWidth = s.width;
                let newHeight = s.height;
                let newX = s.x;
                let newY = s.y;

                switch (corner) {
                  case "br":
                    newWidth = Math.max(20, s.width + dx);
                    newHeight = newWidth / ratio;
                    break;
                  case "tr":
                    newWidth = Math.max(20, s.width + dx);
                    newHeight = newWidth / ratio;
                    newY -= newHeight - s.height;
                    break;
                  case "bl":
                    newWidth = Math.max(20, s.width - dx);
                    newHeight = newWidth / ratio;
                    newX += dx;
                    break;
                  case "tl":
                    newWidth = Math.max(20, s.width - dx);
                    newHeight = newWidth / ratio;
                    newX += dx;
                    newY -= newHeight - s.height;
                    break;
                }

                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onModifyStroke === "function") {
                  onModifyStroke(index, {
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                  });
                }

                setSelectedBox({
                  ...selectedBox,
                  x: newX,
                  y: newY,
                  width: newWidth,
                  height: newHeight,
                });
              }}
              onRotate={(rot) => {
                const index = strokes.findIndex((s) => s.id === selectedId);
                if (index !== -1 && typeof onModifyStroke === "function")
                  onModifyStroke(index, { rotation: rot });
                setSelectedBox((b) => ({ ...b, rotation: rot }));
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
