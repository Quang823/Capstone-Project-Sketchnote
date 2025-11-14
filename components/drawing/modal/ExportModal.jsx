import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";

const ExportModal = ({ visible, onClose, onExport }) => {
  const [selected, setSelected] = useState("editable");
  const [fileName, setFileName] = useState("Unnamed note");
  const [includeBg, setIncludeBg] = useState(true);

  const options = [
    {
      key: "editable",
      label: "Editable PDF",
      desc: "Editable PDF can be edited in other apps after being exported",
    },
    { key: "noneditable", label: "Non-editable PDF" },
    { key: "picture", label: "Picture" },
    { key: "sketchnote", label: "SketchNote" },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.cancel} onPress={onClose}>
              Cancel
            </Text>
            <Text style={styles.title}>Export file</Text>
            <Text style={styles.exportOnly}>Export only</Text>
          </View>

          {/* Options */}
          <View style={styles.optionRow}>
            {options.map((opt) => (
              <Pressable
                key={opt.key}
                style={[
                  styles.option,
                  selected === opt.key && styles.optionSelected,
                ]}
                onPress={() => setSelected(opt.key)}
              >
                <View
                  style={[
                    styles.optionIcon,
                    selected === opt.key && styles.optionIconSelected,
                  ]}
                />
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Warning */}
          <Text style={styles.warningText}>
            ⚠️ If the source file is a scanned document/image/non-editable PDF,
            the exported file will remain as a non-editable PDF
          </Text>

          {/* File name */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>File name:</Text>
            <TextInput
              style={styles.input}
              value={fileName}
              onChangeText={setFileName}
              placeholder="Unnamed note"
            />
          </View>

          {/* Checkbox */}
          <View style={styles.checkboxRow}>
            <Switch value={includeBg} onValueChange={setIncludeBg} />
            <Text style={styles.checkboxText}>
              Including page background (horizontal line/grid/image/text etc.)
            </Text>
          </View>

          {/* Export button */}
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={() => onExport({ selected, fileName, includeBg })}
          >
            <Text style={styles.exportText}>Export and share</Text>
          </TouchableOpacity>

          {/* Save path */}
          <Text style={styles.savePath}>
            Save path: storage/documents/starnote/export
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default ExportModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#111",
    width: "50%",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cancel: { color: "#fff", fontSize: 16 },
  title: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  exportOnly: { color: "#4da6ff", fontSize: 16 },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  option: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#2b2b2b",
  },
  optionSelected: {
    backgroundColor: "#3c3c3c",
    borderWidth: 1,
    borderColor: "#4da6ff",
  },
  optionIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#555",
    borderRadius: 8,
    marginBottom: 8,
  },
  optionIconSelected: { backgroundColor: "#4da6ff" },
  optionLabel: { color: "#fff", fontSize: 13 },
  warningText: {
    fontSize: 12,
    color: "#ffb84d",
    marginTop: 8,
  },
  label: { color: "#bbb", fontSize: 13, marginBottom: 4 },
  input: {
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 10,
    color: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  checkboxText: {
    color: "#ccc",
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },
  exportBtn: {
    backgroundColor: "#00aaff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  exportText: { color: "#fff", fontWeight: "bold" },
  savePath: {
    color: "#666",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
