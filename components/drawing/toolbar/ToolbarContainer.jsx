// components/ToolbarContainer.jsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import ToolGroup from "./ToolGroup";
import ToolButton from "./ToolButton";
import ColorPalette from "./ColorPalette";

const ICON_SIZE = 20;

export default function ToolbarContainer({
  tool,
  setTool,
  color,
  setColor,
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
            <MaterialCommunityIcons name="pen" size={ICON_SIZE} color="#fff" />
          }
          options={[
            {
              name: "pen",
              label: "Pen",
              icon: (
                <MaterialCommunityIcons
                  name="pen"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "pencil",
              label: "Pencil",
              icon: (
                <FontAwesome5 name="pencil-alt" size={ICON_SIZE} color="#fff" />
              ),
            },
            {
              name: "brush",
              label: "Brush",
              icon: (
                <MaterialCommunityIcons
                  name="brush-variant"
                  size={ICON_SIZE}
                  color="#fff"
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
                  color="#fff"
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
                  color="#fff"
                />
              ),
            },
          ]}
          tool={tool}
          setTool={setTool}
        />

        {/* 🧽 Eraser Group */}
        <ToolGroup
          label="Eraser"
          mainIcon={
            <MaterialCommunityIcons
              name="eraser"
              size={ICON_SIZE}
              color="#fff"
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
                  color="#fff"
                />
              ),
            },
            {
              name: "object-eraser",
              label: "Object Eraser",
              icon: (
                <MaterialCommunityIcons
                  name="selection-ellipse-remove"
                  size={ICON_SIZE}
                  color="#fff"
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
              name="shape"
              size={ICON_SIZE}
              color="#fff"
            />
          }
          options={[
            {
              name: "line",
              label: "Line",
              icon: (
                <MaterialCommunityIcons
                  name="vector-line"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "arrow",
              label: "Arrow",
              icon: (
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={ICON_SIZE}
                  color="#fff"
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
                  color="#fff"
                />
              ),
            },
            {
              name: "circle",
              label: "Circle",
              icon: (
                <Ionicons
                  name="ellipse-outline"
                  size={ICON_SIZE}
                  color="#fff"
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
                  color="#fff"
                />
              ),
            },
            {
              name: "polygon",
              label: "Polygon",
              icon: (
                <MaterialCommunityIcons
                  name="pentagon-outline"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
          ]}
          tool={tool}
          setTool={setTool}
        />

        {/* 🔤 Text & Notes */}
        <ToolGroup
          label="Text"
          mainIcon={
            <Ionicons name="text-outline" size={ICON_SIZE} color="#fff" />
          }
          options={[
            {
              name: "text",
              label: "Text",
              icon: (
                <Ionicons name="text-outline" size={ICON_SIZE} color="#fff" />
              ),
            },
            {
              name: "sticky",
              label: "Sticky Note",
              icon: (
                <MaterialCommunityIcons
                  name="note-text-outline"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "comment",
              label: "Comment",
              icon: (
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={ICON_SIZE}
                  color="#fff"
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
            <Ionicons name="image-outline" size={ICON_SIZE} color="#fff" />
          }
          options={[
            {
              name: "image",
              label: "Insert Image",
              icon: (
                <Ionicons name="image-outline" size={ICON_SIZE} color="#fff" />
              ),
            },
            {
              name: "camera",
              label: "Camera",
              icon: (
                <Ionicons name="camera-outline" size={ICON_SIZE} color="#fff" />
              ),
            },
            {
              name: "sticker",
              label: "Stickers",
              icon: (
                <MaterialCommunityIcons
                  name="sticker"
                  size={ICON_SIZE}
                  color="#fff"
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
            <Ionicons name="documents-outline" size={ICON_SIZE} color="#fff" />
          }
          options={[
            {
              name: "add-page",
              label: "Add Page",
              icon: (
                <Ionicons
                  name="add-circle-outline"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "duplicate-page",
              label: "Duplicate",
              icon: (
                <MaterialCommunityIcons
                  name="content-copy"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "delete-page",
              label: "Delete",
              icon: (
                <Ionicons name="trash-outline" size={ICON_SIZE} color="#fff" />
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
              name="cursor-default-gesture-outline"
              size={ICON_SIZE}
              color="#fff"
            />
          }
          options={[
            {
              name: "lasso",
              label: "Lasso Select",
              icon: (
                <MaterialCommunityIcons
                  name="lasso"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "zoom",
              label: "Zoom",
              icon: (
                <Ionicons name="search-outline" size={ICON_SIZE} color="#fff" />
              ),
            },
            {
              name: "move",
              label: "Move Page",
              icon: (
                <MaterialCommunityIcons
                  name="cursor-move"
                  size={ICON_SIZE}
                  color="#fff"
                />
              ),
            },
            {
              name: "rotate",
              label: "Rotate",
              icon: (
                <Ionicons
                  name="refresh-circle-outline"
                  size={ICON_SIZE}
                  color="#fff"
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
            <Ionicons name="arrow-undo-outline" size={ICON_SIZE} color="#fff" />
          }
          onPress={onUndo}
        />
        <ToolButton
          icon={
            <Ionicons name="arrow-redo-outline" size={ICON_SIZE} color="#fff" />
          }
          onPress={onRedo}
        />
        <ToolButton
          icon={<Ionicons name="trash-outline" size={ICON_SIZE} color="#fff" />}
          onPress={onClear}
        />

        {/* ☁️ Import / Export */}
        <ToolButton
          icon={<Ionicons name="image-outline" size={ICON_SIZE} color="#fff" />}
          onPress={onExportPNG}
        />
        <ToolButton
          icon={
            <Ionicons
              name="cloud-upload-outline"
              size={ICON_SIZE}
              color="#fff"
            />
          }
          onPress={onExportJSON}
        />
        <ToolButton
          icon={
            <Ionicons
              name="cloud-download-outline"
              size={ICON_SIZE}
              color="#fff"
            />
          }
          onPress={onImportJSON}
        />
        {/* 🎨 Color palette only for drawing tools */}
        {["pen", "pencil", "brush", "calligraphy", "highlighter"].includes(
          tool
        ) && <ColorPalette color={color} setColor={setColor} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingVertical: 6,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
});
