import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GridSettingsDropdown({ visible, onClose, onApply, currentSettings }) {
  const [gridSize, setGridSize] = useState(currentSettings?.gridSize || 20);
  const [gridColor, setGridColor] = useState(currentSettings?.gridColor || "#cbd5e1");
  const [gridType, setGridType] = useState(currentSettings?.gridType || "square");

  const GRID_SIZES = [10, 20, 30, 40, 50];
  const GRID_COLORS = ["#cbd5e1", "#94a3b8", "#64748b", "#3b82f6", "#10b981"];
  const GRID_TYPES = [
    { value: "square", label: "Square", icon: "grid" },
    { value: "dot", label: "Dots", icon: "dots-grid" },
    { value: "line", label: "Lines", icon: "view-grid-outline" },
  ];

  const handleApply = () => {
    onApply?.({ gridSize, gridColor, gridType });
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={onClose}>
        <View style={styles.dropdown} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Grid Settings</Text>

          <Text style={styles.label}>Grid Type</Text>
          <View style={styles.typeContainer}>
            {GRID_TYPES.map((type) => (
              <TouchableOpacity key={type.value} style={[styles.typeButton, gridType === type.value && styles.typeButtonActive]} onPress={() => setGridType(type.value)}>
                <MaterialCommunityIcons name={type.icon} size={24} color={gridType === type.value ? "#fff" : "#64748b"} />
                <Text style={[styles.typeLabel, gridType === type.value && styles.typeLabelActive]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Grid Size: {gridSize}px</Text>
          <View style={styles.sizeContainer}>
            {GRID_SIZES.map((size) => (
              <TouchableOpacity key={size} style={[styles.sizeButton, gridSize === size && styles.sizeButtonActive]} onPress={() => setGridSize(size)}>
                <Text style={[styles.sizeText, gridSize === size && styles.sizeTextActive]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Grid Color</Text>
          <View style={styles.colorContainer}>
            {GRID_COLORS.map((color) => (
              <TouchableOpacity key={color} style={[styles.colorButton, { backgroundColor: color }, gridColor === color && styles.colorButtonActive]} onPress={() => setGridColor(color)} />
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  dropdown: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: 320, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16, textAlign: "center" },
  label: { fontSize: 14, fontWeight: "600", color: "#475569", marginTop: 12, marginBottom: 8 },
  typeContainer: { flexDirection: "row", gap: 8 },
  typeButton: { flex: 1, alignItems: "center", padding: 12, borderRadius: 8, borderWidth: 2, borderColor: "#e2e8f0" },
  typeButtonActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  typeLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  typeLabelActive: { color: "#fff" },
  sizeContainer: { flexDirection: "row", gap: 8 },
  sizeButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8, borderWidth: 2, borderColor: "#e2e8f0" },
  sizeButtonActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  sizeText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  sizeTextActive: { color: "#fff" },
  colorContainer: { flexDirection: "row", gap: 12 },
  colorButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: "transparent" },
  colorButtonActive: { borderColor: "#1e293b" },
  buttonRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: "#e2e8f0", alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  applyButton: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#3b82f6", alignItems: "center" },
  applyText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
