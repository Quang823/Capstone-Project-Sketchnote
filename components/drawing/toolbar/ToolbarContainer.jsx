import React, { useState, useRef, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ToolGroup from "./ToolGroup";
import ToolButton from "./ToolButton";
import ColorPalette from "./ColorPalette";
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

  onUndo,
  onRedo,
  onClear,
  onExportPNG,
  onExportJSON,
  onImportJSON,

  eraserMode,
  setEraserMode,
  eraserSize,
  setEraserSize,
  eraserDropdownVisible,
  setEraserDropdownVisible,
  eraserButtonRef,
}) {
  // 🎨 ===== COLOR STATE =====
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [selectedColor, setSelectedColor] = useState(color ?? colors[0]);

  // Đồng bộ nếu prop color thay đổi từ bên ngoài
  useEffect(() => {
    if (color) setSelectedColor(color);
  }, [color]);

  const handleSelectColor = (colorHex, index) => {
    setSelectedColor(colorHex);
    setColors((prev) => {
      const updated = [...prev];
      const idx = typeof index === "number" ? index : 0;
      updated[idx] = colorHex;
      return updated;
    });
    if (typeof setColor === "function") setColor(colorHex);
  };

  const handleSelectColorSet = (newColors) => {
    setColors(newColors);
    setSelectedColor(newColors[0]);
    if (typeof setColor === "function") setColor(newColors[0]);
  };

  // 🧱 ===== RENDER =====
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ↩️ Undo / Redo / Clear */}
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

        <View style={styles.divider} />

        {/* ✍️ Pen Group */}
        <ToolGroup
          label="Pens"
          mainIcon={
            <MaterialCommunityIcons
              name="draw"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
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
          ]}
          tool={tool}
          setTool={setTool}
        />

        {/* 🧽 Eraser */}
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

        <View style={styles.divider} />

        {/* 🔷 Shapes */}
        <ToolGroup
          label="Shapes"
          mainIcon={
            <MaterialCommunityIcons
              name="shape-outline"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          options={[
            {
              name: "line",
              label: "Line",
              icon: (
                <MaterialCommunityIcons
                  name="ray-start-end"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "arrow",
              label: "Arrow",
              icon: (
                <MaterialCommunityIcons
                  name="arrow-top-right-thin"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "rect",
              label: "Rectangle",
              icon: (
                <MaterialCommunityIcons
                  name="rectangle-outline"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "circle",
              label: "Circle",
              icon: (
                <MaterialCommunityIcons
                  name="circle-outline"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "triangle",
              label: "Triangle",
              icon: (
                <MaterialCommunityIcons
                  name="triangle-outline"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "star",
              label: "Star",
              icon: (
                <MaterialCommunityIcons
                  name="star-outline"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "polygon",
              label: "Polygon",
              icon: (
                <MaterialCommunityIcons
                  name="hexagon-outline"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
          ]}
          tool={tool}
          setTool={setTool}
        />

        {/* 🪣 Fill Tool */}
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

        {/* 🔤 Text */}
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

        {/* 🖼 Media */}
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

        {/* 📄 Pages */}
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

        {/* 🔍 Navigation */}
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

        {/* ☁️ Import / Export */}
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="export-variant"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onExportPNG}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="file-export-outline"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onExportJSON}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="file-import-outline"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onImportJSON}
        />

        {/* 🧪 Extra Tools */}
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="eyedropper"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={() => setTool("eyedropper")}
          active={tool === "eyedropper"}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="grid"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={() => setTool("grid-toggle")}
          active={tool === "grid-toggle"}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="shape-plus"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={() => setTool("toggle-fill")}
          active={tool === "toggle-fill"}
        />

        <View style={styles.divider} />

        {/* 🎨 Color Palette */}
        {[
          "pen",
          "pencil",
          "brush",
          "calligraphy",
          "highlighter",
          "fill",
        ].includes(tool) && (
          <ColorPalette
            colors={colors}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
            onSelectColorSet={handleSelectColorSet}
          />
        )}

        <View style={styles.divider} />

        {/* ⚫ Size Selector (Pen or Eraser) */}
        <View style={styles.widthGroup}>
          {tool.includes("eraser")
            ? // 🧽 Hiển thị 3 kích thước gôm
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
            : // ✍️ Hiển thị 3 kích thước bút
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
                  onPress={() => setStrokeWidth(size)}
                />
              ))}
        </View>
      </ScrollView>
    </View>
  );
}

// 💅 ===== STYLES =====
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
    paddingHorizontal: 4,
    gap: 6,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
  },
  eraserButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
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
