import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  Switch,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { projectService } from "../../../service/projectService";

export default function HeaderToolbar({
  onBack,
  onToggleToolbar,
  onPreview,
  onCamera,
  onToggleLayerPanel,
  isLayerPanelVisible = false,
  onExportPress,
  projectId,
}) {
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEdit, setInviteEdit] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);

  const renderButton = (
    icon,
    onPress,
    IconComponent = Ionicons,
    active = false,
  ) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    };
    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
          borderRadius: 12,
          backgroundColor: active ? "#E0F2FE" : "transparent", // highlight when active
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.iconButton}
        >
          <IconComponent name={icon} size={22} color="#111827" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        {/* Left */}
        <View style={[styles.row, { gap: 12 }]}>
          {renderButton("arrow-back", onBack, Ionicons)}
          {renderButton("person-add-outline", () => setInviteVisible(true), Ionicons)}
          {renderButton("camera-outline", onCamera, Ionicons)}
        </View>

        {/* Right */}
        <View style={[styles.row, { gap: 12 }]}>
          {renderButton("share-outline", onExportPress, Ionicons)}
          {renderButton("preview", onPreview, MaterialIcons)}
          {renderButton(
            "layers",
            onToggleLayerPanel,
            MaterialIcons,
            isLayerPanelVisible,
          )}
          {renderButton("circle-with-cross", onToggleToolbar, Entypo)}
        </View>
      </View>
      <Modal
        visible={inviteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mời thành viên</Text>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="user@example.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={[styles.inputRow, { justifyContent: "space-between" }]}>
              <Text style={styles.label}>Quyền chỉnh sửa</Text>
              <Switch value={inviteEdit} onValueChange={setInviteEdit} />
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
                disabled={inviteLoading}
                onPress={async () => {
                  if (!projectId || !inviteEmail.trim()) return;
                  try {
                    setInviteLoading(true);
                    await projectService.inviteCollaborator(
                      projectId,
                      inviteEmail.trim(),
                      inviteEdit
                    );
                    setInviteVisible(false);
                    setInviteEmail("");
                  } catch {} finally {
                    setInviteLoading(false);
                  }
                }}
              >
                <Text style={styles.actionText}>Gửi lời mời</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#E5E7EB" }]}
                onPress={() => setInviteVisible(false)}
              >
                <Text style={[styles.actionText, { color: "#111827" }]}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    borderRadius: 12,
    padding: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: 360,
    maxWidth: "95%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
