import React from "react";
import { View } from "react-native";
import ToolButton from "./ToolButton";
import { Ionicons } from "@expo/vector-icons";

export default function ActionButtons({
  onUndo,
  onRedo,
  onClear,
  onExportPNG,
  onExportJSON,
  onImportJSON,
}) {
  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 10, marginTop: 8 }}>
      <ToolButton onPress={onUndo}>
        <Ionicons name="arrow-undo-outline" size={24} color="#f9fafb" />
      </ToolButton>
      <ToolButton onPress={onRedo}>
        <Ionicons name="arrow-redo-outline" size={24} color="#f9fafb" />
      </ToolButton>
      <ToolButton onPress={onClear}>
        <Ionicons name="trash-outline" size={24} color="#f9fafb" />
      </ToolButton>
      <ToolButton onPress={onExportPNG}>
        <Ionicons name="image-outline" size={24} color="#f9fafb" />
      </ToolButton>
      <ToolButton onPress={onExportJSON}>
        <Ionicons name="cloud-upload-outline" size={24} color="#f9fafb" />
      </ToolButton>
      <ToolButton onPress={onImportJSON}>
        <Ionicons name="cloud-download-outline" size={24} color="#f9fafb" />
      </ToolButton>
    </View>
  );
}
