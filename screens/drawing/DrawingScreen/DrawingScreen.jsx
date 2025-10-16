import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { View, Alert, TextInput } from "react-native";
import HeaderToolbar from "../../../components/drawing/toolbar/HeaderToolbar";
import ToolbarContainer from "../../../components/drawing/toolbar/ToolbarContainer";
import PenSettingsPanel from "../../../components/drawing/toolbar/PenSettingsPanel";
import MultiPageCanvas from "../../../components/drawing/canvas/MultiPageCanvas";
import EraserDropdown from "../../../components/drawing/toolbar/EraserDropdown";
import useOrientation from "../../../hooks/useOrientation";
import { useNavigation } from "@react-navigation/native";
import * as ExportUtils from "../../../utils/ExportUtils";
import styles from "./DrawingScreen.styles";
import useLoadFonts from "../../../hooks/useLoadFonts";
import AppLoading from "expo-app-loading";

export default function DrawingScreen() {
  const navigation = useNavigation();

  // HAND/PEN MODE
  const [isPenMode, setIsPenMode] = useState(false);

  // TOOL VISIBILITY
  const [toolbarVisible, setToolbarVisible] = useState(true);

  // 🎨 ===== TOOL & COLOR =====
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");

  // ✏️ ===== WIDTH & OPACITY =====
  const [strokeWidth, setStrokeWidth] = useState(2); // pen — mảnh, vừa đủ
  const [pencilWidth] = useState(1.5); // pencil — mềm, chi tiết
  const [brushWidth] = useState(4); // brush — mềm hơn, nhẹ
  const [brushOpacity] = useState(0.45); // brush trong suốt hơn
  const [calligraphyWidth] = useState(3); // calligraphy — nét thanh
  const [calligraphyOpacity] = useState(0.8); // vẫn rõ mà không dày

  // 🧾 ===== PAGE & STYLE =====
  const [paperStyle] = useState("plain");
  const [shapeType] = useState("auto");
  const [editingText, setEditingText] = useState(null);
  const [activePageId, setActivePageId] = useState(1);

  // ⚙️ ===== TOOL CONFIGS =====
  const [toolConfigs, setToolConfigs] = useState({
    pen: { pressure: 0.5, thickness: 1.5, stabilization: 0.2 },
    pencil: { pressure: 0.4, thickness: 1.0, stabilization: 0.15 },
    brush: { pressure: 0.6, thickness: 3.0, stabilization: 0.25 },
    calligraphy: { pressure: 0.7, thickness: 2.5, stabilization: 0.3 },
    highlighter: { pressure: 0.5, thickness: 4.0, stabilization: 0.1 },
  });

  const activeConfig = useMemo(
    () =>
      toolConfigs[tool] || {
        pressure: 0.5,
        thickness: 1.0,
        stabilization: 0.2,
      },
    [tool, toolConfigs]
  );

  const handleSettingChange = useCallback((toolName, key, value) => {
    if (!toolName) return;
    setToolConfigs((prev) => ({
      ...prev,
      [toolName]: {
        ...(prev[toolName] ?? {}),
        [key]: value,
      },
    }));
  }, []);

  // 📱 ===== ORIENTATION =====
  const orientation = useOrientation();

  // 🗒 ===== PAGE REFS (undo / redo / clear) =====
  const pageRefs = useRef({});
  const registerPageRef = useCallback((id, ref) => {
    if (ref) pageRefs.current[id] = ref;
  }, []);

  const handleUndo = useCallback((id) => pageRefs.current[id]?.undo?.(), []);
  const handleRedo = useCallback((id) => pageRefs.current[id]?.redo?.(), []);
  const handleClear = useCallback((id) => pageRefs.current[id]?.clear?.(), []);

  // 🧽 ===== ERASER STATES =====
  const [eraserMode, setEraserMode] = useState("pixel");
  const [eraserSize, setEraserSize] = useState(20);
  const [eraserDropdownVisible, setEraserDropdownVisible] = useState(false);
  const eraserButtonRef = useRef(null);

  const activeStrokeWidth = tool.includes("eraser") ? eraserSize : strokeWidth;
  useEffect(() => {
    // Nếu không phải đang chọn eraser thì tạm tắt eraserMode
    if (tool !== "eraser") {
      setEraserMode(null);
    }
  }, [tool]);

  // 💾 ===== EXPORT JSON =====
  const handleExportJSON = useCallback(async () => {
    try {
      const allPages = Object.values(pageRefs.current).map(
        (ref) => ref?.getStrokes?.() || []
      );
      const uri = await ExportUtils.saveStrokesToJSON(allPages);
      Alert.alert("Export JSON", "Saved: " + uri);
    } catch (err) {
      Alert.alert("Export JSON Error", err.message);
    }
  }, []);

  // 🧱 ===== RENDER =====
  return (
    <View style={styles.container}>
      {/* 🧰 Header Toolbar */}
      <HeaderToolbar
        onBack={() => navigation.navigate("Home")}
        onToggleToolbar={() => setToolbarVisible((v) => !v)}
        onTogglePenType={() => setIsPenMode((prev) => !prev)}
        onLayers={() => console.log("Open layers")}
        onAddPage={() => console.log("Add page")}
        onPreview={() => console.log("Document preview")}
        onSettings={() => console.log("Open settings")}
        onMore={() => console.log("More options")}
      />
      {/* 🎨 Main Toolbar */}
      {toolbarVisible && (
        <ToolbarContainer
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          onUndo={() => handleUndo(activePageId)}
          onRedo={() => handleRedo(activePageId)}
          onClear={() => handleClear(activePageId)}
          onExportJSON={handleExportJSON}
          eraserMode={eraserMode}
          setEraserMode={setEraserMode}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          eraserDropdownVisible={eraserDropdownVisible}
          setEraserDropdownVisible={setEraserDropdownVisible}
          eraserButtonRef={eraserButtonRef}
        />
      )}
      {/* 🧽 Eraser Dropdown */}
      {eraserDropdownVisible && (
        <EraserDropdown
          visible={eraserDropdownVisible}
          from={eraserButtonRef}
          eraserMode={eraserMode}
          setEraserMode={(mode) => {
            setEraserMode(mode);
            setTool("eraser");
          }}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          onClose={() => setEraserDropdownVisible(false)}
        />
      )}

      {/* 🖋 Pen Settings */}
      {["pen", "pencil", "brush", "calligraphy", "highlighter"].includes(
        tool
      ) && (
        <PenSettingsPanel
          tool={tool}
          setTool={setTool}
          config={activeConfig}
          onSettingChange={handleSettingChange}
          visible={true}
        />
      )}

      {/* 🧾 Canvas */}
      <View style={{ flex: 1 }}>
        <MultiPageCanvas
          tool={tool}
          color={color}
          isPenMode={isPenMode}
          strokeWidth={activeStrokeWidth}
          pencilWidth={pencilWidth}
          eraserSize={eraserSize}
          eraserMode={eraserMode}
          brushWidth={brushWidth}
          brushOpacity={brushOpacity}
          calligraphyWidth={calligraphyWidth}
          calligraphyOpacity={calligraphyOpacity}
          paperStyle={paperStyle}
          shapeType={shapeType}
          pressure={activeConfig.pressure}
          thickness={activeConfig.thickness}
          stabilization={activeConfig.stabilization}
          toolConfigs={toolConfigs}
          registerPageRef={registerPageRef}
          onActivePageChange={setActivePageId}
          onRequestTextInput={(x, y) => {
            if (tool === "text") setEditingText({ x, y, text: "" });
          }}
        />
      </View>

      {/* 📝 Text Input Overlay */}
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
            color,
            backgroundColor: "white",
          }}
          autoFocus
          value={editingText.text}
          onChangeText={(t) => setEditingText({ ...editingText, text: t })}
          onBlur={() => {
            if (editingText.text.trim()) {
              const newStroke = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                tool: tool,
                x: editingText.x,
                y: editingText.y + 18,
                text: editingText.text.trim(),
                color,
                fontSize: 18,
                padding: 6,
              };
              pageRefs.current[1]?.addStrokeDirect?.(newStroke);
            }
            setEditingText(null);
          }}
        />
      )}
    </View>
  );
}
