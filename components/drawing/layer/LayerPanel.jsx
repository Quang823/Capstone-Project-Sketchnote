import React, { useState, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function LayerPanel({
  layers,
  activeLayerId,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onAdd,
  onDelete,
  onRename, // thêm callback rename
  onClearLayer, // thêm callback clear layer
  onClose,
}) {
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameTargetId, setRenameTargetId] = useState(null);

  // ✅ Safety check: Ensure layers is always an array
  const safeLayers = Array.isArray(layers) ? layers : [];

  // Use immutable id 'layer1' when present; fallback to first layer id
  const baseLayerId = (() => {
    if (safeLayers.length > 0) {
      const found = safeLayers.find((l) => l?.id === "layer1");
      return found ? found.id : safeLayers[0]?.id || null;
    }
    return null;
  })();

  const handleDropdownSelect = (layerId, action) => {
    if (!layerId) return;
    setDropdownVisible(null);
    if (action === "rename") {
      setRenameTargetId(layerId);
      const currentName =
        safeLayers.find((l) => l?.id === layerId)?.name || `Layer ${layerId}`;
      setRenameValue(currentName);
      setRenameVisible(true);
    }
    if (action === "clear") {
      // Clear all strokes on this layer
      onClearLayer?.(layerId);
    }
    if (action === "delete") {
      // Block deletion for base layer (Layer 1)
      if (layerId === baseLayerId) return;
      onDelete?.(layerId);
    }
  };

  const handleRenameConfirm = () => {
    if (renameTargetId && renameValue.trim()) {
      onRename?.(renameTargetId, renameValue.trim());
    }
    setRenameVisible(false);
    setRenameValue("");
    setRenameTargetId(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>LAYER</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => onClose?.()}
        >
          <Ionicons name="close" size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Add Layer */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          onAdd?.();
        }}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.addButtonText}>Add layer</Text>
      </TouchableOpacity>

      {/* Layer list */}
      <ScrollView style={styles.scrollView}>
        {safeLayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No layers available</Text>
          </View>
        ) : (
          safeLayers.map((layer) => {
            if (!layer || !layer.id) return null;
            return (
              <View key={layer.id} style={styles.layerWrapper}>
                <TouchableOpacity
                  style={[
                    styles.layerItem,
                    activeLayerId === layer.id && styles.activeLayer,
                  ]}
                  onPress={() => onSelect?.(layer.id)}
                >
                  <View style={styles.layerPreview}>
                    <View style={styles.previewThumbnail} />
                    <Text style={styles.layerId}>
                      {typeof layer.name === "string" && layer.name.trim()
                        ? layer.name
                        : `Layer ${layer.id || "Unknown"}`}
                    </Text>
                  </View>

                  <View style={styles.layerControls}>
                    <TouchableOpacity
                      onPress={() => onToggleVisibility?.(layer.id)}
                    >
                      <Ionicons
                        name={
                          layer.visible !== false
                            ? "eye-outline"
                            : "eye-off-outline"
                        }
                        size={18}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onToggleLock?.(layer.id)}>
                      <Ionicons
                        name={layer.locked ? "lock-closed" : "lock-open"}
                        size={18}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() =>
                        setDropdownVisible(
                          dropdownVisible === layer.id ? null : layer.id
                        )
                      }
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={18}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Dropdown nổi ngoài cùng */}
      {dropdownVisible && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setDropdownVisible(null)}
          />
          <View
            style={[
              styles.dropdown,
              {
                top:
                  150 +
                  (safeLayers.findIndex((l) => l?.id === dropdownVisible) *
                    64 || 0),
                right: 24,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDropdownSelect(dropdownVisible, "rename")}
            >
              <Ionicons name="pencil" size={16} color="#fff" />
              <Text style={styles.dropdownText}>Rename</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleDropdownSelect(dropdownVisible, "clear")}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.dropdownText}>Clear</Text>
            </TouchableOpacity>

            {dropdownVisible !== baseLayerId && (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleDropdownSelect(dropdownVisible, "delete")}
              >
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.dropdownText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Modal rename layer */}
      <Modal transparent visible={renameVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rename Layer</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={styles.textInput}
              placeholder="Enter new name"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRenameVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRenameConfirm}
              >
                <Text style={styles.confirmText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 16,
    top: 150,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    width: 280,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1E40AF",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#3B82F6",
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    maxHeight: 240,
  },
  layerWrapper: {
    position: "relative",
  },
  layerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    marginBottom: 8,
  },
  activeLayer: {
    backgroundColor: "#BFDBFE",
  },
  layerPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewThumbnail: {
    width: 30,
    height: 30,
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
  },
  layerId: {
    fontSize: 15,
    color: "#1E40AF",
  },
  layerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuButton: {
    padding: 6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    zIndex: 1999,
  },
  dropdown: {
    position: "absolute",
    width: 140,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  // Rename modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 260,
    padding: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 12,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: "#1E293B",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
  },
  cancelText: {
    color: "#334155",
    fontWeight: "600",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});

export default memo(LayerPanel);
