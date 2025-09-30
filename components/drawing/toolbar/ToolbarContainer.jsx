// ToolbarContainer.jsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ToolGroup from "./ToolGroup";
import ToolButton from "./ToolButton";
import ColorPalette from "./ColorPalette";

const ICON_SIZE = 18; // nhỏ gọn, tinh tế
const ICON_COLOR = "#374151"; // xám đậm, giống bút chì

export default function ToolbarContainer({
  tool,
  setTool,
  color,
  setColor,
  onIncSize,
  onDecSize,
  onIncOpacity,
  onDecOpacity,
  onUndo,
  onRedo,
  onClear,
  onExportPNG,
  onExportJSON,
  onImportJSON,
}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        {/* Size controls */}
        <ToolButton onPress={onDecSize}>
          <MaterialCommunityIcons
            name="minus-circle-outline"
            size={ICON_SIZE}
            color={ICON_COLOR}
          />
        </ToolButton>
        <ToolButton onPress={onIncSize}>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={ICON_SIZE}
            color={ICON_COLOR}
          />
        </ToolButton>

        {/* Opacity controls */}
        {["brush", "calligraphy"].includes(tool) && (
          <>
            <ToolButton onPress={onDecOpacity}>
              <MaterialCommunityIcons
                name="opacity"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            </ToolButton>
            <ToolButton onPress={onIncOpacity}>
              <MaterialCommunityIcons
                name="format-color-highlight"
                size={ICON_SIZE}
                color={ICON_COLOR}
              />
            </ToolButton>
          </>
        )}

        {/* 🧽 Eraser Group */}
        <ToolGroup
          label="Eraser"
          mainIcon={
            <MaterialCommunityIcons
              name="eraser"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          options={[
            {
              name: "eraser",
              label: "Stroke Eraser",
              icon: (
                <MaterialCommunityIcons
                  name="eraser"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
            {
              name: "object-eraser",
              label: "Object Eraser",
              icon: (
                <MaterialCommunityIcons
                  name="eraser-variant"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                />
              ),
            },
          ]}
          tool={tool}
          setTool={setTool}
        />

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
          isActive={tool === "fill"}
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

        {/* ↩️ Undo / Redo / Clear */}
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="undo"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onUndo}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="redo"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onRedo}
        />
        <ToolButton
          icon={
            <MaterialCommunityIcons
              name="delete-outline"
              size={ICON_SIZE}
              color={ICON_COLOR}
            />
          }
          onPress={onClear}
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

        {/* 🎨 Color palette */}
        {[
          "pen",
          "pencil",
          "brush",
          "calligraphy",
          "highlighter",
          "fill",
        ].includes(tool) && <ColorPalette color={color} setColor={setColor} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 8,
    paddingHorizontal: 10,
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
});
