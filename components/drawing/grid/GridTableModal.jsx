import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function GridTableModal({ visible, onClose, onCreate, position }) {
  const [rows, setRows] = useState("5");
  const [cols, setCols] = useState("5");
  const [cellSize, setCellSize] = useState("40");
  const [strokeWidth, setStrokeWidth] = useState("2");
  const [color, setColor] = useState("#1e293b");
  const [backgroundColor, setBackgroundColor] = useState("transparent");

  const COLORS = [
    "#1e293b",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  const BG_COLORS = [
    { value: "transparent", label: "None" },
    { value: "#f8fafc", label: "Light" },
    { value: "#e0f2fe", label: "Blue" },
    { value: "#fef3c7", label: "Yellow" },
  ];

  const handleCreate = () => {
    const r = parseInt(rows) || 5;
    const c = parseInt(cols) || 5;
    const size = parseInt(cellSize) || 40;

    onCreate?.({
      x: position?.x || 100,
      y: position?.y || 100,
      rows: r,
      cols: c,
      width: c * size,
      height: r * size,
      strokeWidth: parseInt(strokeWidth) || 2,
      color,
      backgroundColor,
    });
    
    // Reset
    setRows("5");
    setCols("5");
    setCellSize("40");
    setStrokeWidth("2");
    setColor("#1e293b");
    setBackgroundColor("transparent");
    
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} style={styles.overlay} onPress={onClose}>
        <View style={styles.modal} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Create Grid Table</Text>

          {/* Rows & Columns */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rows</Text>
              <TextInput
                style={styles.input}
                value={rows}
                onChangeText={setRows}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Columns</Text>
              <TextInput
                style={styles.input}
                value={cols}
                onChangeText={setCols}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>

          {/* Cell Size & Stroke Width */}
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cell Size (px)</Text>
              <TextInput
                style={styles.input}
                value={cellSize}
                onChangeText={setCellSize}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Line Width</Text>
              <TextInput
                style={styles.input}
                value={strokeWidth}
                onChangeText={setStrokeWidth}
                keyboardType="number-pad"
                maxLength={1}
              />
            </View>
          </View>

          {/* Grid Color */}
          <Text style={styles.label}>Grid Color</Text>
          <View style={styles.colorContainer}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  { backgroundColor: c },
                  color === c && styles.colorButtonActive,
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>

          {/* Background Color */}
          <Text style={styles.label}>Background</Text>
          <View style={styles.bgContainer}>
            {BG_COLORS.map((bg) => (
              <TouchableOpacity
                key={bg.value}
                style={[
                  styles.bgButton,
                  backgroundColor === bg.value && styles.bgButtonActive,
                ]}
                onPress={() => setBackgroundColor(bg.value)}
              >
                <View
                  style={[
                    styles.bgPreview,
                    {
                      backgroundColor: bg.value === "transparent" ? "#fff" : bg.value,
                      borderWidth: bg.value === "transparent" ? 1 : 0,
                      borderColor: "#cbd5e1",
                    },
                  ]}
                />
                <Text style={styles.bgLabel}>{bg.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#1e293b",
    textAlign: "center",
  },
  colorContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorButtonActive: {
    borderColor: "#1e293b",
  },
  bgContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  bgButton: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  bgButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  bgPreview: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginBottom: 4,
  },
  bgLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    alignItems: "center",
  },
  createText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
