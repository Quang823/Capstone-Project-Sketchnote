import React, { useRef, useState } from "react";
import { View, Alert, TextInput } from "react-native";
import HeaderToolbar from "../../../components/drawing/toolbar/HeaderToolbar";
import ToolbarContainer from "../../../components/drawing/toolbar/ToolbarContainer";
import PenSettingsPanel from "../../../components/drawing/toolbar/PenSettingsPanel";
import MultiPageCanvas from "../../../components/drawing/canvas/MultiPageCanvas"; // 👈 thêm
import useOrientation from "../../../hooks/useOrientation";
import * as ExportUtils from "../../../utils/ExportUtils";
import styles from "./DrawingScreen.styles";

export default function DrawingScreen() {
  // 🎨 States
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [pencilWidth, setPencilWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(20);
  const [brushWidth, setBrushWidth] = useState(8);
  const [brushOpacity, setBrushOpacity] = useState(0.6);
  const [calligraphyWidth, setCalligraphyWidth] = useState(6);
  const [calligraphyOpacity, setCalligraphyOpacity] = useState(0.9);
  const [paperStyle, setPaperStyle] = useState("plain");
  const [shapeType, setShapeType] = useState("auto");
  const [editingText, setEditingText] = useState(null);

  const [pressure, setPressure] = useState(0.5);
  const [thickness, setThickness] = useState(0.5);
  const [stabilization, setStabilization] = useState(0.2);

  const orientation = useOrientation();

  // 👉 Quản lý ref từng page
  const pageRefs = useRef({});
  const registerPageRef = (id, ref) => {
    if (ref) pageRefs.current[id] = ref;
  };

  // 👉 Undo/Redo/Clear cho "trang hiện tại"
  const handleUndo = (id) => pageRefs.current[id]?.undo?.();
  const handleRedo = (id) => pageRefs.current[id]?.redo?.();
  const handleClear = (id) => pageRefs.current[id]?.clear?.();

  // 👉 Export toàn bộ project
  const handleExportJSON = async () => {
    try {
      const allPages = Object.values(pageRefs.current).map(
        (ref) => ref?.getStrokes?.() || []
      );
      const uri = await ExportUtils.saveStrokesToJSON(allPages);
      Alert.alert("Export JSON", "Saved: " + uri);
    } catch (err) {
      Alert.alert("Export JSON Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Header */}
      <HeaderToolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
      />

      {/* ✅ Toolbar */}
      <ToolbarContainer
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        onUndo={() => handleUndo(1)} // mặc định thao tác trên page đầu, hoặc chọn page active
        onRedo={() => handleRedo(1)}
        onClear={() => handleClear(1)}
        onExportJSON={handleExportJSON}
      />

      {/* ✅ Panel Pen Settings */}
      {["pen", "pencil", "brush", "calligraphy", "highlighter"].includes(
        tool
      ) && (
        <PenSettingsPanel
          tool={tool}
          setTool={setTool}
          pressure={pressure}
          setPressure={setPressure}
          thickness={thickness}
          setThickness={setThickness}
          stabilization={stabilization}
          setStabilization={setStabilization}
          visible={true}
        />
      )}

      {/* ✅ Multi Page Canvas */}
      <View style={{ flex: 1 }}>
        <MultiPageCanvas
          tool={tool}
          color={color}
          strokeWidth={strokeWidth}
          pencilWidth={pencilWidth}
          eraserWidth={eraserWidth}
          brushWidth={brushWidth}
          brushOpacity={brushOpacity}
          calligraphyWidth={calligraphyWidth}
          calligraphyOpacity={calligraphyOpacity}
          paperStyle={paperStyle}
          shapeType={shapeType}
          registerPageRef={registerPageRef}
          onRequestTextInput={(x, y) => {
            if (tool === "text") {
              setEditingText({ x, y, text: "" });
            }
          }}
        />
      </View>

      {/* Overlay nhập text */}
      {editingText && (
        <TextInput
          style={{
            position: "absolute",
            top: editingText.y,
            left: editingText.x,
            minWidth: 40,
            borderWidth: 1,
            borderColor: "blue",
            padding: 4,
            fontSize: 18,
            color: color,
            backgroundColor: "white",
          }}
          autoFocus
          value={editingText.text}
          onChangeText={(t) => setEditingText({ ...editingText, text: t })}
          onBlur={() => {
            if (editingText.text.trim()) {
              // mặc định add vào page đầu
              pageRefs.current[1]?.addStrokeDirect?.({
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                tool: "text",
                x: editingText.x,
                y: editingText.y + 18,
                text: editingText.text.trim(),
                color,
                fontSize: 18,
              });
            }
            setEditingText(null);
          }}
        />
      )}
    </View>
  );
}
