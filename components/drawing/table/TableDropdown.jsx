import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Popover from "react-native-popover-view";
import { LinearGradient } from "expo-linear-gradient";

export default function TableDropdown({
  visible,
  from,
  onClose,
  onInsertTable,
}) {
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");

  const handleInsert = () => {
    const r = parseInt(rows) || 3;
    const c = parseInt(cols) || 3;
    if (r > 0 && c > 0 && r <= 20 && c <= 20) {
      onInsertTable?.(r, c);
      onClose?.();
    }
  };

  return (
    <Popover
      isVisible={visible}
      from={from}
      placement="bottom"
      offset={10}
      onRequestClose={onClose}
      arrowStyle={{ backgroundColor: "transparent" }}
      backgroundStyle={{ backgroundColor: "rgba(0,0,0,0.3)" }}
      animationType="fade"
    >
      <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="table-plus"
              size={18}
              color="#3b82f6"
            />
            <Text style={styles.title}>Insert Table</Text>
          </View>

          {/* Grid Preview */}
          <View style={styles.previewContainer}>
            <View style={styles.gridPreview}>
              {Array.from({ length: Math.min(parseInt(rows) || 3, 5) }).map(
                (_, r) => (
                  <View key={r} style={styles.gridRow}>
                    {Array.from({
                      length: Math.min(parseInt(cols) || 3, 5),
                    }).map((_, c) => (
                      <View key={c} style={styles.gridCell} />
                    ))}
                  </View>
                )
              )}
            </View>
            <Text style={styles.previewText}>
              {rows || 0} × {cols || 0}
            </Text>
          </View>

          {/* Inputs */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputGroup}>
              <MaterialCommunityIcons
                name="table-row"
                size={16}
                color="#64748b"
              />
              <Text style={styles.label}>Rows</Text>
              <TextInput
                style={styles.input}
                value={rows}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, "");
                  if (num === "" || (parseInt(num) >= 1 && parseInt(num) <= 20)) {
                    setRows(num);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <MaterialCommunityIcons
                name="table-column"
                size={16}
                color="#64748b"
              />
              <Text style={styles.label}>Columns</Text>
              <TextInput
                style={styles.input}
                value={cols}
                onChangeText={(text) => {
                  const num = text.replace(/[^0-9]/g, "");
                  if (num === "" || (parseInt(num) >= 1 && parseInt(num) <= 20)) {
                    setCols(num);
                  }
                }}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>Quick presets:</Text>
            <View style={styles.presets}>
              {[
                { r: 2, c: 2 },
                { r: 3, c: 3 },
                { r: 4, c: 4 },
                { r: 3, c: 5 },
              ].map((preset, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.preset}
                  onPress={() => {
                    setRows(preset.r.toString());
                    setCols(preset.c.toString());
                  }}
                >
                  <Text style={styles.presetText}>
                    {preset.r}×{preset.c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.insertButton} onPress={handleInsert}>
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.insertGradient}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                <Text style={styles.insertText}>Insert</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Popover>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  gridPreview: {
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
  },
  gridCell: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: "#3b82f6",
    margin: 2,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },
  inputsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    width: 70,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: "#fff",
  },
  presetsContainer: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
  },
  presets: {
    flexDirection: "row",
    gap: 8,
  },
  preset: {
    flex: 1,
    height: 36,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  presetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  insertButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
  },
  insertGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  insertText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
