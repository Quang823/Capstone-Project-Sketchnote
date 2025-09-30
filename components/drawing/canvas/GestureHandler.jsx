import React, { useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Alert } from "react-native";
import { Skia } from "@shopify/react-native-skia";
import {
  isInsidePage,
  makePathFromPoints,
  getBoundingBoxForStroke,
  pointInPolygon,
} from "./utils";
import { detectShape, buildShape } from "./ShapeDetector";

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
  eraserWidth,
  brushWidth,
  brushOpacity,
  calligraphyWidth,
  calligraphyOpacity,
  children,
}) {
  const liveRef = useRef([]);
  const rafScheduled = useRef(false);
  const lastEraserPointRef = useRef(null);

  // Function to show text input dialog
  const showTextInputDialog = (x, y, toolType) => {
    let title = "Thêm Text";
    let placeholder = "Nhập text...";

    if (toolType === "sticky") {
      title = "Thêm Sticky Note";
      placeholder = "Nhập nội dung sticky note...";
    } else if (toolType === "comment") {
      title = "Thêm Comment";
      placeholder = "Nhập comment...";
    }

    Alert.prompt(
      title,
      `Nhập nội dung tại vị trí (${Math.round(x)}, ${Math.round(y)})`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: (text) => {
            if (text && text.trim()) {
              const newTextStroke = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                tool: toolType,
                x: x,
                y: y,
                text: text.trim(),
                color: color,
                fontSize:
                  toolType === "sticky" ? 16 : toolType === "comment" ? 14 : 18,
                backgroundColor:
                  toolType === "sticky"
                    ? "#FFEB3B"
                    : toolType === "comment"
                    ? "#E3F2FD"
                    : "transparent",
                padding:
                  toolType === "sticky" || toolType === "comment" ? 8 : 0,
              };

              setStrokes((prev) => [...prev, newTextStroke]);
              setRedoStack([]); // clear redo when adding new element
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  // Heuristic: stroke có đóng không
  const isStrokeClosed = (points) => {
    if (!points || points.length < 4) return false;
    const first = points[0];
    const last = points[points.length - 1];
    const dx = first.x - last.x;
    const dy = first.y - last.y;
    return dx * dx + dy * dy < 4000;
  };

  // Tìm shape hoặc nét vẽ đóng tại điểm
  const findShapeOrClosedStrokeAtPoint = (x, y, allStrokes) => {
    for (let i = allStrokes.length - 1; i >= 0; i--) {
      const s = allStrokes[i];
      let path = null;

      if (s.shape) {
        path = Skia.Path.Make();
        if (s.tool === "circle") {
          const { cx, cy, r } = s.shape;
          path.addCircle(cx, cy, r);
        } else if (s.tool === "rect" || s.tool === "square") {
          const { x: sx, y: sy, w, h } = s.shape;
          path.addRect({ x: sx, y: sy, width: w, height: h });
        } else if (s.tool === "triangle") {
          const { x1, y1, x2, y2, x3, y3 } = s.shape;
          path.moveTo(x1, y1);
          path.lineTo(x2, y2);
          path.lineTo(x3, y3);
          path.close();
        } else if (s.tool === "oval") {
          const { cx, cy, rx, ry } = s.shape;
          path.addOval({ cx, cy, rx, ry });
        } else if (s.tool === "line" || s.tool === "arrow") {
          const { x1, y1, x2, y2 } = s.shape;
          path.moveTo(x1, y1);
          path.lineTo(x2, y2);
        } else if (s.tool === "polygon" || s.tool === "star") {
          const pts = s.shape.points || [];
          if (pts.length > 0) {
            path.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++)
              path.lineTo(pts[i].x, pts[i].y);
            path.close();
          }
        }
      } else if (s.points && isStrokeClosed(s.points)) {
        path = makePathFromPoints(s.points);
        try {
          path.close();
        } catch {}
      }

      if (path && path.contains(x, y)) return s;
    }
    return null;
  };

  // Gesture
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      if (!isInsidePage(e.x, e.y, page)) return;

      // Handle text, sticky note, comment tools
      if (tool === "text" || tool === "sticky" || tool === "comment") {
        showTextInputDialog(e.x, e.y, tool);
        return;
      }

      // reset eraser trackers
      if (tool === "eraser" || eraserMode === "object") {
        lastEraserPointRef.current = { x: e.x, y: e.y };
      }

      // 🧽 Object eraser (tap delete one)
      if (eraserMode === "object") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];

          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            !(
              e.x >= bbox.minX &&
              e.x <= bbox.maxX &&
              e.y >= bbox.minY &&
              e.y <= bbox.maxY
            )
          ) {
            continue;
          }

          let path = null;
          if (s.points) {
            path = makePathFromPoints(s.points);
            try {
              path.close();
            } catch {}
          } else if (s.shape) {
            path = Skia.Path.Make();
            if (s.tool === "circle") {
              const { cx, cy, r } = s.shape;
              path.addCircle(cx, cy, r);
            } else if (s.tool === "rect" || s.tool === "square") {
              const { x, y, w, h } = s.shape;
              path.addRect({ x, y, width: w, height: h });
            } else if (s.tool === "triangle") {
              const { x1, y1, x2, y2, x3, y3 } = s.shape;
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
              path.lineTo(x3, y3);
              path.close();
            } else if (s.tool === "oval") {
              const { cx, cy, rx, ry } = s.shape;
              path.addOval({ cx, cy, rx, ry });
            } else if (s.tool === "line" || s.tool === "arrow") {
              const { x1, y1, x2, y2 } = s.shape;
              path.moveTo(x1, y1);
              path.lineTo(x2, y2);
            } else if (s.tool === "polygon" || s.tool === "star") {
              const pts = s.shape.points || [];
              if (pts.length > 0) {
                path.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++)
                  path.lineTo(pts[i].x, pts[i].y);
                path.close();
              }
            }
          }

          if (path && path.contains(e.x, e.y)) {
            setStrokes((prev) => {
              const idx = prev.findIndex((st) => st.id === s.id);
              if (idx === -1) return prev;
              setRedoStack((redo) => [...redo, { stroke: s, index: idx }]);
              return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
            });
            return;
          }
        }
        // allow drag to create lasso
      }

      // 🪣 Fill
      if (tool === "fill") {
        const target = findShapeOrClosedStrokeAtPoint(e.x, e.y, strokes);
        if (target) {
          target.fill = true;
          target.fillColor = color;
          setStrokes([...strokes]);
        }
        return;
      }

      // Bắt đầu stroke / lasso
      liveRef.current = [{ x: e.x, y: e.y }];
      setCurrentPoints(liveRef.current);
    })
    .onUpdate((e) => {
      if (!isInsidePage(e.x, e.y, page)) return;
      if (
        tool === "fill" ||
        tool === "text" ||
        tool === "sticky" ||
        tool === "comment"
      )
        return;

      // smoother pixel eraser: reduce point density
      if (tool === "eraser" && eraserMode !== "object") {
        const last = lastEraserPointRef.current;
        const minDist = Math.max(eraserWidth * 0.6, 6);
        if (last) {
          const dx = e.x - last.x;
          const dy = e.y - last.y;
          if (dx * dx + dy * dy < minDist * minDist) return;
        }
        lastEraserPointRef.current = { x: e.x, y: e.y };
      }

      if (eraserMode === "object") {
        const last = liveRef.current[liveRef.current.length - 1] || {
          x: 0,
          y: 0,
        };
        const dx = e.x - last.x;
        const dy = e.y - last.y;
        if (dx * dx + dy * dy < 9) return;
        liveRef.current = [...liveRef.current, { x: e.x, y: e.y }];
        if (!rafScheduled.current) {
          rafScheduled.current = true;
          requestAnimationFrame(() => {
            rafScheduled.current = false;
            setCurrentPoints(liveRef.current);
          });
        }
        return;
      }

      if (tool === "eraser" && eraserMode === "object") return;

      const last = liveRef.current[liveRef.current.length - 1] || {
        x: 0,
        y: 0,
      };
      const dx = e.x - last.x;
      const dy = e.y - last.y;
      if (dx * dx + dy * dy < 9) return;

      liveRef.current = [...liveRef.current, { x: e.x, y: e.y }];

      if (!rafScheduled.current) {
        rafScheduled.current = true;
        requestAnimationFrame(() => {
          rafScheduled.current = false;
          setCurrentPoints(liveRef.current);
        });
      }
    })
    .onEnd(() => {
      const finalPoints = liveRef.current;
      if (!finalPoints || finalPoints.length === 0) return;

      // Lasso-based object erase
      if (eraserMode === "object" && finalPoints.length > 2) {
        const poly = finalPoints;
        setStrokes((prev) => {
          const next = [];
          for (let i = 0; i < prev.length; i++) {
            const s = prev[i];
            const bbox = getBoundingBoxForStroke(s);
            const cx = bbox ? (bbox.minX + bbox.maxX) / 2 : 0;
            const cy = bbox ? (bbox.minY + bbox.maxY) / 2 : 0;
            if (bbox && pointInPolygon(poly, cx, cy)) {
              setRedoStack((redo) => [...redo, { stroke: s, index: i }]);
              continue;
            }
            next.push(s);
          }
          return next;
        });
        setCurrentPoints([]);
        liveRef.current = [];
        return;
      }

      const w =
        tool === "pen"
          ? strokeWidth
          : tool === "pencil"
          ? pencilWidth
          : tool === "brush"
          ? brushWidth
          : tool === "calligraphy"
          ? calligraphyWidth
          : tool === "highlighter"
          ? strokeWidth * 2
          : tool === "eraser"
          ? eraserWidth
          : strokeWidth;

      let newStroke = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tool,
        color,
        width: w,
        points: finalPoints,
      };

      if (tool === "brush") {
        newStroke.opacity = brushOpacity;
      } else if (tool === "calligraphy") {
        newStroke.opacity = calligraphyOpacity;
      }

      // Shapes
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
        if (shape) newStroke = { ...newStroke, tool, shape: shape.shape };
      } else if (tool === "shape") {
        const shape = detectShape(finalPoints);
        if (shape) newStroke = { ...newStroke, ...shape };
      }

      if (tool !== "fill" && !(tool === "eraser" && eraserMode === "object")) {
        setStrokes((prev) => [...prev, newStroke]);
        setRedoStack([]); // clear redo khi vẽ mới
      }

      setCurrentPoints([]);
      liveRef.current = [];
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
