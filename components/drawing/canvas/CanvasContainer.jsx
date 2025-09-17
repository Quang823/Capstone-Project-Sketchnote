import React, { forwardRef, useImperativeHandle } from "react";
import { View } from "react-native";
import CanvasRenderer from "./CanvasRenderer";
import GestureHandler from "./GestureHandler";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const PAGE_MARGIN_H = 24;
const PAGE_WIDTH = width - PAGE_MARGIN_H * 2;
const PAGE_HEIGHT = Math.round(PAGE_WIDTH * Math.SQRT2);
const PAGE_MARGIN_TOP = 20;
const PAGE_BOTTOM_SPACER = 64;

const CanvasContainer = forwardRef(function CanvasContainer(
  {
    strokes,
    setStrokes,
    currentPoints,
    setCurrentPoints,
    setRedoStack,
    tool,
    color,
    strokeWidth,
    pencilWidth,
    eraserWidth,
    paperStyle = "plain",
    shapeType = "auto",
  },
  ref
) {
  const page = {
    x: PAGE_MARGIN_H,
    y: PAGE_MARGIN_TOP,
    w: PAGE_WIDTH,
    h: PAGE_HEIGHT,
  };

  const canvasHeight = page.y + page.h + PAGE_BOTTOM_SPACER;

  return (
    <View style={{ width, height: canvasHeight }}>
      <GestureHandler
        page={page}
        tool={tool}
        eraserMode="pixel"
        strokes={strokes}
        setStrokes={setStrokes}
        currentPoints={currentPoints}
        setCurrentPoints={setCurrentPoints}
        setRedoStack={setRedoStack}
        color={color}
        strokeWidth={strokeWidth}
        pencilWidth={pencilWidth}
        eraserWidth={eraserWidth}
      >
        <CanvasRenderer
          ref={ref}
          strokes={strokes}
          currentPoints={currentPoints}
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          pencilWidth={pencilWidth}
          eraserWidth={eraserWidth}
          paperStyle={paperStyle}
          page={page}
          canvasHeight={canvasHeight}
        />
      </GestureHandler>
    </View>
  );
});

export default CanvasContainer;
