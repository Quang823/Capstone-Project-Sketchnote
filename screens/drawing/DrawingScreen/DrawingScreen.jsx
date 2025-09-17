import React, { useRef, useState } from "react";
import { View, Alert } from "react-native";
import CanvasContainer from "../../../components/drawing/canvas/CanvasContainer";
import ToolbarContainer from "../../../components/drawing/toolbar/ToolbarContainer";
import HeaderToolbar from "../../../components/drawing/toolbar/HeaderToolbar"; // Assuming this is still in components/
import * as ExportUtils from "../../../utils/ExportUtils";
import styles from "./DrawingScreen.styles";

export default function DrawingScreen() {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [pencilWidth, setPencilWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(20);
  const [paperStyle, setPaperStyle] = useState("plain");
  const [shapeType, setShapeType] = useState("auto");
  const [strokes, setStrokes] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);

  const canvasRef = useRef();

  // Undo / Redo / Clear
  const handleUndo = () => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const popped = copy.pop();
      setRedoStack((r) => [...r, popped]);
      return copy;
    });
  };

  const handleRedo = () => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const popped = copy.pop();
      setStrokes((s) => [...s, popped]);
      return copy;
    });
  };

  const handleClear = () => {
    setStrokes([]);
    setRedoStack([]);
    setCurrentPoints([]);
  };

  // Export / Import
  const handleExportPNG = async () => {
    try {
      const base64 = await canvasRef.current?.snapshotBase64();
      if (!base64) {
        Alert.alert("Export PNG", "Không lấy được snapshot");
        return;
      }
      const uri = await ExportUtils.savePNGBase64ToFile(base64);
      Alert.alert("Export PNG", "Saved: " + uri);
    } catch (err) {
      Alert.alert("Export PNG Error", err.message);
    }
  };

  const handleExportJSON = async () => {
    try {
      const uri = await ExportUtils.saveStrokesToJSON(strokes);
      Alert.alert("Export JSON", "Saved: " + uri);
    } catch (err) {
      Alert.alert("Export JSON Error", err.message);
    }
  };

  const handleImportJSON = async () => {
    try {
      const imported = await ExportUtils.loadStrokesFromJSON();
      if (imported) {
        setStrokes(imported);
        setRedoStack([]);
        setCurrentPoints([]);
        Alert.alert("Import JSON", "Imported strokes");
      } else {
        Alert.alert("Import JSON", "Không tìm file");
      }
    } catch (err) {
      Alert.alert("Import JSON Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* HeaderToolbar with basic tool and color picker */}
      <HeaderToolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Detailed Toolbar */}
      <ToolbarContainer
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        onExportPNG={handleExportPNG}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Canvas */}
      <CanvasContainer
        ref={canvasRef}
        strokes={strokes}
        setStrokes={setStrokes}
        currentPoints={currentPoints}
        setCurrentPoints={setCurrentPoints}
        setRedoStack={setRedoStack}
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        pencilWidth={pencilWidth}
        eraserWidth={eraserWidth}
        paperStyle={paperStyle}
        shapeType={shapeType}
      />
    </View>
  );
}
