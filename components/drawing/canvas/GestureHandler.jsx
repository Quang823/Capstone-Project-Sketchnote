import React from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Skia } from "@shopify/react-native-skia";
import { isInsidePage, makePathFromPoints } from "./utils";
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
  children,
}) {
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      if (!isInsidePage(e.x, e.y, page)) return;

      // Object eraser
      if (tool === "eraser" && eraserMode === "object") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          let path = null;

          if (s.points) {
            path = makePathFromPoints(s.points);
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
            }
          }

          if (path && path.contains(e.x, e.y)) {
            setStrokes((prev) => prev.filter((st) => st.id !== s.id));
            setRedoStack([]);
            return;
          }
        }
        return;
      }

      // Fill and Text (keeping as placeholders)
      if (tool === "fill" || tool === "text") {
        return;
      }

      // Normal drawing tools
      setCurrentPoints([{ x: e.x, y: e.y }]);
    })
    .onUpdate((e) => {
      if (!isInsidePage(e.x, e.y, page)) return;
      if (tool === "fill" || tool === "text") return;
      if (tool === "eraser" && eraserMode === "object") return;
      setCurrentPoints((prev) => [...prev, { x: e.x, y: e.y }]);
    })
    .onEnd(() => {
      if (currentPoints.length === 0) return;

      const w =
        tool === "pen"
          ? strokeWidth
          : tool === "pencil"
          ? pencilWidth
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
        points: currentPoints,
      };

      // Manual shapes
      if (["triangle", "rect", "square", "circle", "oval"].includes(tool)) {
        const shape = buildShape(tool, currentPoints);
        if (shape) {
          newStroke = { ...newStroke, tool, shape: shape.shape };
        }
      } else if (tool === "shape") {
        const shape = detectShape(currentPoints);
        if (shape) {
          newStroke = { ...newStroke, ...shape };
        }
      }

      // Don't add new stroke for object eraser
      if (!(tool === "eraser" && eraserMode === "object")) {
        setStrokes((prev) => [...prev, newStroke]);
      }

      setCurrentPoints([]);
      setRedoStack([]);
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
