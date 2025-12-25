import React, { useState, useEffect, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  Switch,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { projectService } from "../../../service/projectService";
import { authService } from "../../../service/authService";
import { creditService } from "../../../service/creditService";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { AuthContext } from "../../../context/AuthContext";

export default function HeaderToolbar({
  onBack,
  onToggleToolbar,
  onPreview,
  onCamera,
  onToggleLayerPanel,
  isLayerPanelVisible = false,
  onExportPress,
  projectId,
  onAIChat,
  onRefreshCredit,
  onHistory,
  collaborators = [],
  isViewOnly = false,
  isOwner = false,
  onCollaboratorsClick,
}) {
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEdit, setInviteEdit] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [creditBalance, setCreditBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const { user } = useContext(AuthContext);

  // Fetch credit balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceData = await creditService.getCreditBalance();
        setCreditBalance(balanceData?.currentBalance ?? null);
      } catch (error) {
        console.warn("Failed to fetch credit balance:", error);
        setCreditBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchBalance();
  }, []);

  // Refresh balance when onRefreshCredit is called
  useEffect(() => {
    if (onRefreshCredit) {
      const fetchBalance = async () => {
        try {
          const balanceData = await creditService.getCreditBalance();
          setCreditBalance(balanceData?.currentBalance ?? null);
        } catch (error) {
          console.warn("Failed to refresh credit balance:", error);
        }
      };

      fetchBalance();
    }
  }, [onRefreshCredit]);

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
          {!isViewOnly && user?.hasActiveSubscription && renderButton("person-add-outline", () => setInviteVisible(true), Ionicons)}

          {/* Collaborators */}


          {!isViewOnly && renderButton("camera-outline", onCamera, Ionicons)}
          {!isViewOnly && onAIChat && creditBalance !== null && creditBalance >= 5 && (
            <TouchableOpacity onPress={onAIChat} style={styles.iconButton}>
              <LottieView
                source={require("../../../assets/AI loading.json")}
                style={{ width: 35, height: 35 }}
                autoPlay
                loop
              />
            </TouchableOpacity>
          )}
          {!isViewOnly && !loadingBalance && creditBalance !== null && creditBalance >= 5 && (
            <View style={styles.creditBadge}>
              <MaterialIcons name="auto-awesome" size={14} color="#3B82F6" />
              <Text style={styles.creditText}>
                You have {creditBalance} token{creditBalance !== 1 ? 's' : ''} left
              </Text>
            </View>
          )}
        </View>

        {/* Center - View Only Badge */}
        {isViewOnly && (
          <View style={styles.viewOnlyBadge}>
            <MaterialIcons name="visibility" size={18} color="#EF4444" />
            <Text style={styles.viewOnlyText}>View Only</Text>
          </View>
        )}
        {/* Right */}
        <View style={[styles.row, { gap: 12 }]}>

          {/* Collaborators & Status */}
          <View style={[styles.row, { gap: 8, marginRight: 4 }]}>
            <View style={styles.activeStatusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeStatusText}>Active</Text>
            </View>

            {collaborators.length > 0 && (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={onCollaboratorsClick}
                disabled={!isOwner}
              >
                {collaborators.slice(0, 3).map((c, index) => (
                  <Image
                    key={c.userId || index}
                    source={{ uri: c.avatarUrl || "https://ui-avatars.com/api/?name=User" }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      marginLeft: index === 0 ? 0 : -10,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  />
                ))}
                {collaborators.length > 3 && (
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: "#F3F4F6",
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: -10,
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#6B7280" }}>
                      +{collaborators.length - 3}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {!isViewOnly && renderButton("share-outline", onExportPress, Ionicons)}
          {!isViewOnly && renderButton("time-outline", onHistory, Ionicons)}
          {renderButton("preview", onPreview, MaterialIcons)}
          {!isViewOnly && renderButton(
            "layers",
            onToggleLayerPanel,
            MaterialIcons,
            isLayerPanelVisible,
          )}
          {!isViewOnly && renderButton("circle-with-cross", onToggleToolbar, Entypo)}
        </View>
      </View >
      <Modal
        visible={inviteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite member</Text>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Email</Text>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={{ paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#1E40AF", borderRadius: 10 }}
                  disabled={searching || !inviteEmail.trim()}
                  onPress={async () => {
                    if (!inviteEmail.trim()) return;
                    try {
                      setSearching(true);
                      const user = await authService.getUserByEmail(inviteEmail.trim());
                      setFoundUser(user);
                      setSelectedUserId(null);
                    } catch (err) {
                      setFoundUser(null);
                      setSelectedUserId(null);
                      Toast.show({ type: "error", text1: "Cannot find user", text2: err.message });
                    } finally {
                      setSearching(false);
                    }
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Find</Text>
                </TouchableOpacity>
              </View>
            </View>
            {searching ? (
              <View style={{ marginBottom: 12 }}>
                <ActivityIndicator size="small" color="#1E40AF" />
              </View>
            ) : null}
            {foundUser ? (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => setSelectedUserId(foundUser.id)}
              >
                <Image
                  source={{ uri: foundUser.avatarUrl || undefined }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>
                    {`${foundUser.firstName || ""} ${foundUser.lastName || ""}`.trim() || foundUser.email}
                  </Text>
                  <Text style={styles.userEmail}>{foundUser.email}</Text>
                </View>
                <Ionicons
                  name={selectedUserId === foundUser.id ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color="#1E40AF"
                />
              </TouchableOpacity>
            ) : null}
            <View style={[styles.inputRow, { justifyContent: "space-between" }]}>
              <Text style={styles.label}>Edit permission</Text>
              <Switch value={inviteEdit} onValueChange={setInviteEdit} />
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
                disabled={inviteLoading || !selectedUserId}
                onPress={async () => {
                  if (!projectId || !selectedUserId) return;
                  try {
                    setInviteLoading(true);
                    await projectService.inviteCollaborator(projectId, selectedUserId, inviteEdit);
                    setInviteVisible(false);
                    setInviteEmail("");
                    setFoundUser(null);
                    setSelectedUserId(null);
                    Toast.show({ type: "success", text1: "Invite successful" });
                  } catch { } finally {
                    setInviteLoading(false);
                  }
                }}
              >
                <Text style={styles.actionText}>Send invite</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#E5E7EB" }]}
                onPress={() => setInviteVisible(false)}
              >
                <Text style={[styles.actionText, { color: "#111827" }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View >
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
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  userEmail: {
    fontSize: 12,
    color: "#6B7280",
  },
  creditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  creditText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  viewOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  viewOnlyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  activeStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
    textTransform: "uppercase",
  },
});
