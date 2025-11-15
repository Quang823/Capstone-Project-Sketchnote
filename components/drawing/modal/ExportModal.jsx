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
import { Image } from "expo-image";

const ExportModal = ({ visible, onClose, onExport }) => {
  const [selected, setSelected] = useState("editable");
  const [fileName, setFileName] = useState("Unnamed note");
  const [includeBg, setIncludeBg] = useState(true);

  const options = [
    {
      key: "editable",
      label: "Editable PDF",
      icon: "https://cdn-icons-png.flaticon.com/512/1827/1827933.png",
    },
    {
      key: "noneditable",
      label: "Non-editable PDF",
      icon: "https://cdn-icons-png.flaticon.com/512/565/565655.png",
    },
    {
      key: "picture",
      label: "Picture",
      icon: "https://cdn-icons-png.flaticon.com/512/747/747968.png",
    },
    {
      key: "sketchnote",
      label: "SketchNote",
      icon: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763174915/ctsrrmlfcxxmsmvb9yhm.png",
    },
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
                <Image
                  source={{ uri: opt.icon }}
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#ffffff",
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
  cancel: { color: "#007AFF", fontSize: 16 },
  title: { color: "#000", fontSize: 16, fontWeight: "bold" },
  exportOnly: { color: "#007AFF", fontSize: 16 },

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
    backgroundColor: "#F4F6F8",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionSelected: {
    backgroundColor: "#EAF4FF",
    borderColor: "#007AFF",
    borderWidth: 1.5,
  },

  optionIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    marginBottom: 8,
    contentFit: "contain",
    backgroundColor: "transparent",
  },
  optionIconSelected: {
    tintColor: "#007AFF", // chỉ đổi màu khi selected
  },

  optionLabel: { color: "#000", fontSize: 13 },

  warningText: {
    fontSize: 12,
    color: "#FFC107",
    marginTop: 8,
  },

  label: { color: "#333", fontSize: 13, marginBottom: 4 },

  input: {
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
    padding: 10,
    color: "#000",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  checkboxText: {
    color: "#333",
    fontSize: 13,
    flex: 1,
    marginLeft: 8,
  },

  exportBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  exportText: { color: "#fff", fontWeight: "bold" },

  savePath: {
    color: "#999",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});
