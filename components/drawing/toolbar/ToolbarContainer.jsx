import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ToolGroup from "./ToolGroup";
import ToolButton from "./ToolButton";
import ColorPalette from "./ColorPalette";
import EyeDropperTool from "./EyeDropperTool";
import TableDropdown from "../table/TableDropdown";
import TapeDropdown from "../tape/TapeDropdown";
import ShapeDropdown from "../shape/ShapeDropdown";
import { DEFAULT_COLORS } from "./constants";

const ICON_SIZE = 18;
const ICON_COLOR = "#1e293b";

export default function ToolbarContainer({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onSelectBaseWidth,

  onUndo,
  onRedo,
  onClear,
  onExportPNG,
  onExportJSON,
  onImportJSON,
  onSaveFile,
  onLoadCloudFile,
  onSyncFile, // Added prop for manual sync

  eraserMode,
  setEraserMode,
  eraserSize,
  setEraserSize,
  eraserDropdownVisible,
  setEraserDropdownVisible,
  eraserButtonRef,

  pickedColors = [], // 👈 Nhận từ parent
  onColorPicked, // 👈 Nhận từ parent
  onInsertTable, // 👈 Callback khi insert table

  // Tape Props
  tapeSettings,
  setTapeSettings,
  onSelectTape,
  onClearTapesOnPage,
  onClearTapesOnAllPages,

  // Shape Props
  shapeSettings,
  setShapeSettings,
  onSelectShape,
}) {
  // ===== COLOR STATE =====
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState(color ?? colors[0]);
  const [colorHistory, setColorHistory] = useState([]); // 👈 Color history cho ColorPalette

  // ===== TABLE STATE =====
  const [tableDropdownVisible, setTableDropdownVisible] = useState(false);
  const tableButtonRef = useRef(null);

  // ===== TAPE STATE =====
  const [tapeDropdownVisible, setTapeDropdownVisible] = useState(false);
  const tapeButtonRef = useRef(null);

  // ===== SHAPE STATE =====
  const [shapeDropdownVisible, setShapeDropdownVisible] = useState(false);
  const shapeButtonRef = useRef(null);

  // Remember last selected pen sub-tool
  const PEN_TOOLS = [
    "pen",
    "pencil",
    "brush",
    "calligraphy",
    "highlighter",
    "marker",
    "airbrush",
    "crayon",
  ];
  const [lastPenTool, setLastPenTool] = useState("pen");
  useEffect(() => {
    if (PEN_TOOLS.includes(tool)) setLastPenTool(tool);
  }, [tool]);

  // Remember last selected shape sub-tool
  const SHAPE_TOOLS = [
    "line",
    "arrow",
    "rect",
    "circle",
    "triangle",
    "star",
    "polygon",
  ];
  const [lastShapeTool, setLastShapeTool] = useState("line");
  useEffect(() => {
    if (SHAPE_TOOLS.includes(tool)) setLastShapeTool(tool);
  }, [tool]);

  // Đồng bộ nếu prop color thay đổi từ bên ngoài (tránh setState lặp)
  // Chỉ sync khi color thay đổi từ bên ngoài (không phải từ handleSelectColor)
  useEffect(() => {
    if (typeof color === "string" && color !== selectedColor) {
      // Kiểm tra xem color có trong colors array không
      // Nếu có thì đã được set bởi handleSelectColor, không cần sync
      const isInColors = colors.includes(color);
      if (!isInColors) {
        setSelectedColor(color);
      }
    }
  }, [color]);

  const handleSelectColor = (colorHex, index, forceSet = false) => {
    // Update colors array trước
    setColors((prev) => {
      const updated = [...prev];
      const idx = typeof index === "number" ? index : 0;
      updated[idx] = colorHex;
      return updated;
    });

    // Force set color nếu được yêu cầu, hoặc nếu khác màu hiện tại
    if (typeof setColor === "function" && (forceSet || colorHex !== color)) {
      setColor(colorHex);
    }

    // Force set selectedColor SAU CÙNG để đảm bảo không bị ghi đè
    setSelectedColor(colorHex);

    // 👇 Thêm vào color history (chỉ khi chọn màu thủ công)
    if (colorHex && colorHex !== "#000000" && colorHex !== "#111827") {
      setColorHistory((prev) => {
        const filtered = prev.filter((c) => c !== colorHex);
        return [colorHex, ...filtered].slice(0, 10);
      });
    }
  };

  const handleSelectColorSet = (newColors) => {
    setColors(newColors);
    const first = newColors?.[0];
    if (typeof first === "string" && first !== selectedColor)
      setSelectedColor(first);
    if (
      typeof setColor === "function" &&
      typeof first === "string" &&
      first !== color
    )
      setColor(first);
  };

  // ===== RENDER =====
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══════════════════════════════════════════════════════════════════
            GROUP 1: HISTORY (Undo/Redo/Clear)
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.toolGroup}>
          <ToolButton onPress={onUndo}>
            <MaterialCommunityIcons
              name="undo"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          </ToolButton>
          <ToolButton onPress={onRedo}>
            <MaterialCommunityIcons
              name="redo"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          </ToolButton>
          <ToolButton onPress={onClear}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          </ToolButton>
        </View>

        <View style={styles.divider} />

        {/* ═══════════════════════════════════════════════════════════════════
            GROUP 2: DRAWING TOOLS (Pens, Eraser, Shapes, Fill)
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.toolGroup}>
          {/* Pen Group */}
          <ToolGroup
            label="Pens"
            mainIcon={
              <MaterialCommunityIcons
                name="draw"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            lastSelected={lastPenTool}
            options={[
              {
                name: "pen",
                label: "Pen",
                icon: (
                  <MaterialCommunityIcons
                    name="lead-pencil"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "pencil",
                label: "Pencil",
                icon: (
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "brush",
                label: "Brush",
                icon: (
                  <MaterialCommunityIcons
                    name="brush-variant"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "calligraphy",
                label: "Calligraphy",
                icon: (
                  <MaterialCommunityIcons
                    name="fountain-pen"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "highlighter",
                label: "Highlighter",
                icon: (
                  <MaterialCommunityIcons
                    name="marker"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "marker",
                label: "Marker",
                icon: (
                  <MaterialCommunityIcons
                    name="marker-check"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "airbrush",
                label: "Airbrush",
                icon: (
                  <MaterialCommunityIcons
                    name="spray"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "crayon",
                label: "Crayon",
                icon: (
                  <MaterialCommunityIcons
                    name="pencil"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
            ]}
            tool={tool}
            setTool={setTool}
          />

          {/* Eraser */}
          <View ref={eraserButtonRef}>
            <TouchableOpacity
              style={[
                styles.eraserButton,
                tool.includes("eraser") && styles.eraserButtonActive,
              ]}
              onPress={() => {
                if (tool.includes("eraser")) {
                  setEraserDropdownVisible(true);
                } else {
                  setTool("eraser");
                  setEraserMode?.("pixel");
                }
              }}
              activeOpacity={0.7}
            >
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons
                  name="eraser"
                  size={ICON_SIZE}
                  color={tool.includes("eraser") ? "#fff" : ICON_COLOR}
                />
                {tool.includes("eraser") && (
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                    style={{ position: "absolute", bottom: -10 }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Tape Tool */}
          <View ref={tapeButtonRef}>
            <ToolButton
              isActive={tool === "tape"}
              onPress={() => {
                if (tool === "tape") {
                  setTapeDropdownVisible(true);
                } else {
                  setTool("tape");
                }
              }}
              onLongPress={() => setTapeDropdownVisible(true)}
            >
              <MaterialCommunityIcons
                name="tape-measure"
                size={ICON_SIZE}
                color={tool === "tape" ? "#3B82F6" : ICON_COLOR}
              />
            </ToolButton>
          </View>

          {/* Shapes */}
          {/* Shapes */}
          <View ref={shapeButtonRef}>
            <ToolButton
              isActive={tool === "shape"}
              onPress={() => {
                if (tool === "shape") {
                  setShapeDropdownVisible(true);
                } else {
                  setTool("shape");
                }
              }}
              onLongPress={() => setShapeDropdownVisible(true)}
            >
              <MaterialCommunityIcons
                name="shape-outline"
                size={ICON_SIZE}
                color={tool === "shape" ? "#3B82F6" : ICON_COLOR}
              />
            </ToolButton>
          </View>

          {/* Fill Tool */}
          <ToolButton
            icon={
              <MaterialCommunityIcons
                name="format-color-fill"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            active={tool === "fill"}
            onPress={() => setTool("fill")}
          />

          {/* Eyedropper Tool */}
          <EyeDropperTool
            tool={tool}
            setTool={setTool}
            selectedColor={selectedColor}
            pickedColors={pickedColors}
            onColorSelected={handleSelectColor}
            onColorPicked={onColorPicked}
          />
        </View>

        <View style={styles.divider} />

        {/* ═══════════════════════════════════════════════════════════════════
            GROUP 3: CONTENT TOOLS (Text, Media, Table)
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.toolGroup}>
          {/* Text */}
          <ToolGroup
            label="Text"
            mainIcon={
              <MaterialCommunityIcons
                name="format-text-variant"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            options={[
              {
                name: "text",
                label: "Text",
                icon: (
                  <MaterialCommunityIcons
                    name="format-text-variant"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "sticky",
                label: "Sticky Note",
                icon: (
                  <MaterialCommunityIcons
                    name="note-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "comment",
                label: "Comment",
                icon: (
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
            ]}
            tool={tool}
            setTool={setTool}
          />

          {/* Media */}
          <ToolGroup
            label="Media"
            mainIcon={
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            options={[
              {
                name: "image",
                label: "Insert Image",
                icon: (
                  <MaterialCommunityIcons
                    name="image-multiple-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "camera",
                label: "Camera",
                icon: (
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "sticker",
                label: "Stickers",
                icon: (
                  <MaterialCommunityIcons
                    name="emoticon-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
            ]}
            tool={tool}
            setTool={setTool}
          />

          {/* Table Tool */}
          <View ref={tableButtonRef}>
            <ToolButton
              icon={
                <MaterialCommunityIcons
                  name="table"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              }
              onPress={() => {
                setTimeout(() => {
                  setTool("table");
                  setTableDropdownVisible(true);
                }, 0);
              }}
              active={tool === "table"}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* ═══════════════════════════════════════════════════════════════════
            GROUP 4: SELECTION & NAVIGATION
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.toolGroup}>
          <ToolGroup
            label="Navigation"
            mainIcon={
              <MaterialCommunityIcons
                name="gesture"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            options={[
              {
                name: "lasso",
                label: "Lasso Select",
                icon: (
                  <MaterialCommunityIcons
                    name="selection-drag"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "zoom",
                label: "Zoom",
                icon: (
                  <MaterialCommunityIcons
                    name="magnify-plus-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "scroll",
                label: "Scroll Only",
                icon: (
                  <MaterialCommunityIcons
                    name="gesture-swipe-vertical"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "move",
                label: "Move Page",
                icon: (
                  <MaterialCommunityIcons
                    name="cursor-move"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "move-text",
                label: "Move Text",
                icon: (
                  <MaterialCommunityIcons
                    name="cursor-text"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "rotate",
                label: "Rotate",
                icon: (
                  <MaterialCommunityIcons
                    name="rotate-orbit"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
            ]}
            tool={tool}
            setTool={setTool}
          />

          {/* Pages */}
          <ToolGroup
            label="Pages"
            mainIcon={
              <MaterialCommunityIcons
                name="file-document-outline"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            options={[
              {
                name: "add-page",
                label: "Add Page",
                icon: (
                  <MaterialCommunityIcons
                    name="file-plus-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "duplicate-page",
                label: "Duplicate",
                icon: (
                  <MaterialCommunityIcons
                    name="file-multiple-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
              {
                name: "delete-page",
                label: "Delete",
                icon: (
                  <MaterialCommunityIcons
                    name="file-remove-outline"
                    size={ICON_SIZE}
                    color={ICON_COLOR}
                  />
                ),
              },
            ]}
            tool={tool}
            setTool={setTool}
          />
        </View>

        <View style={styles.divider} />

        {/* ═══════════════════════════════════════════════════════════════════
            GROUP 5: SAVE & CLOUD
        ═══════════════════════════════════════════════════════════════════ */}
        <View style={styles.toolGroup}>
          {/* Save Project */}
          <ToolButton
            icon={
              <MaterialCommunityIcons
                name="content-save-outline"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            }
            onPress={() => onSaveFile?.("json")}
          />
        </View>

        <View style={styles.divider} />

        {/* ═══════════════════════════════════════════════════════════════════
            COLOR PALETTE & SIZE SELECTOR
        ═══════════════════════════════════════════════════════════════════ */}
        {[
          // pens
          "pen",
          "pencil",
          "brush",
          "calligraphy",
          "highlighter",
          "marker",
          "airbrush",
          "crayon",
          // shapes
          "line",
          "arrow",
          "rect",
          "circle",
          "triangle",
          "star",
          "polygon",
          "shape", // ✅ Add shape tool
          // others
          "fill",
        ].includes(tool) && (
            <ColorPalette
              colors={colors}
              selectedColor={selectedColor}
              colorHistory={colorHistory}
              onSelectColor={(c, i) => {
                handleSelectColor(c, i);
                // ✅ Sync color to shape settings if shape tool is active
                if (tool === "shape") {
                  setShapeSettings?.({ ...shapeSettings, color: c });
                }
              }}
              onSelectColorSet={handleSelectColorSet}
            />
          )}

        <View style={styles.divider} />

        {/* Size Selector (Pen or Eraser) */}
        <View style={styles.widthGroup}>
          {tool.includes("eraser")
            ? // Hiển thị 3 kích thước gôm
            [8, 20, 40].map((size) => (
              <ToolButton
                key={size}
                icon={
                  <View
                    style={[
                      styles.widthDot,
                      {
                        width: size / 2,
                        height: size / 2,
                        borderRadius: size / 2,
                        backgroundColor:
                          eraserSize === size ? "#2563EB" : "#475569",
                        opacity: 0.8,
                      },
                    ]}
                  />
                }
                active={eraserSize === size}
                onPress={() => setEraserSize(size)}
              />
            ))
            : // Hiển thị 3 kích thước bút
            [2, 4, 6].map((size) => (
              <ToolButton
                key={size}
                icon={
                  <View
                    style={[
                      styles.widthDot,
                      {
                        width: size * 2,
                        height: size * 2,
                        borderRadius: size,
                        backgroundColor:
                          strokeWidth === size ? "#2563EB" : "#475569",
                      },
                    ]}
                  />
                }
                active={strokeWidth === size}
                onPress={() =>
                  onSelectBaseWidth
                    ? onSelectBaseWidth(size)
                    : setStrokeWidth(size)
                }
              />
            ))}
        </View>
      </ScrollView>

      {/* Tape Dropdown */}
      <TapeDropdown
        visible={tapeDropdownVisible}
        onClose={() => setTapeDropdownVisible(false)}
        tapeSettings={tapeSettings}
        setTapeSettings={setTapeSettings}
        onSelectTape={onSelectTape}
        onClearTapesOnPage={onClearTapesOnPage}
        onClearTapesOnAllPages={onClearTapesOnAllPages}
      />

      {/* Shape Dropdown */}
      <ShapeDropdown
        visible={shapeDropdownVisible}
        onClose={() => setShapeDropdownVisible(false)}
        shapeSettings={shapeSettings}
        setShapeSettings={(newSettings) => {
          onSelectShape?.(newSettings);
          // ✅ Sync color from dropdown to global toolbar
          if (newSettings?.color && newSettings.color !== selectedColor) {
            handleSelectColor(newSettings.color, undefined, true);
          }
        }}
      />

      {/* Table Dropdown */}
      <TableDropdown
        visible={tableDropdownVisible}
        from={tableButtonRef}
        onClose={() => setTableDropdownVisible(false)}
        onInsertTable={(rows, cols) => {
          onInsertTable?.(rows, cols);
          setTableDropdownVisible(false);
        }}
      />
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FAFC",
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
  // ✅ NEW: Tool group container for logically grouped tools
  toolGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(226, 232, 240, 0.4)",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  // ✅ Enhanced divider with better visibility
  divider: {
    width: 2,
    height: 28,
    backgroundColor: "#94A3B8",
    marginHorizontal: 8,
    borderRadius: 1,
    opacity: 0.6,
  },
  eraserButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  eraserButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  widthGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  widthDot: {
    borderRadius: 50,
  },
});
