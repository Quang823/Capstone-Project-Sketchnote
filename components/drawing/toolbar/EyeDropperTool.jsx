import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ICON_SIZE = 18;
const ICON_COLOR = "#1e293b";

export default function EyeDropperTool({
  tool,
  setTool,
  selectedColor,
  onColorSelected,
  pickedColors = [], // 👈 Nhận danh sách màu đã pick từ parent
  onColorPicked, // 👈 Callback khi pick màu mới
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const isActive = tool === "eyedropper";

  const handleButtonPress = () => {
    if (isActive) {
      // Nếu đang active, toggle dropdown
      if (dropdownVisible) {
        setDropdownVisible(false);
      } else {
        // Đo vị trí button để hiển thị dropdown
        buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setDropdownPosition({
            top: pageY + height + 5,
            left: pageX,
          });
          setDropdownVisible(true);
        });
      }
    } else {
      // Nếu chưa active, activate tool
      setTool("eyedropper");
    }
  };

  const handleSelectHistoryColor = (color) => {
    // Set màu vào palette (index 0, forceSet = true)
    if (onColorSelected) {
      onColorSelected(color, 0, true);
    }

    // Đóng dropdown
    setDropdownVisible(false);

    // Tự động chuyển sang pen (nếu muốn)
    // Bỏ comment dòng dưới nếu muốn tự động chuyển tool
    setTimeout(() => setTool?.("pen"), 100);
  };

  return (
    <>
      <View ref={buttonRef}>
        <TouchableOpacity
          style={[styles.button, isActive && styles.buttonActive]}
          onPress={handleButtonPress}
          activeOpacity={0.7}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <MaterialCommunityIcons
              name="eyedropper"
              size={ICON_SIZE}
              color={isActive ? "#fff" : ICON_COLOR}
            />
            {isActive && (
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

      {/* Dropdown History */}
      {dropdownVisible && (
        <Modal
          transparent
          visible={dropdownVisible}
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View
              style={[
                styles.dropdown,
                {
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                },
              ]}
            >
              <View style={styles.header}>
                <MaterialCommunityIcons
                  name="eyedropper"
                  size={16}
                  color="#3b82f6"
                  style={{ marginRight: 6 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownTitle}>Picked Colors</Text>
                  <Text style={styles.dropdownSubtitle}>Tap to use color</Text>
                </View>
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {pickedColors.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="palette-outline"
                      size={32}
                      color="#cbd5e1"
                    />
                    <Text style={styles.emptyText}>No colors picked yet</Text>
                    <Text style={styles.emptyHint}>
                      Use eyedropper to pick colors from canvas
                    </Text>
                  </View>
                ) : (
                  pickedColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.historyItem}
                      onPress={() => handleSelectHistoryColor(color)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.colorPreview,
                          { backgroundColor: color },
                        ]}
                      />
                      <Text style={styles.colorText}>
                        {color.toUpperCase()}
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
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
  buttonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 16,
    minWidth: 240,
    maxHeight: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 0.3,
  },
  dropdownSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  scrollView: {
    maxHeight: 320,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  colorPreview: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    letterSpacing: 0.5,
  },
});
