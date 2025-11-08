import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import { projectService } from "../../../service/projectService";

const { width } = Dimensions.get("window");

// --- CONFIG / RESPONSIVE ---
const SIDEBAR_WIDTH = 220; // giữ nếu bạn dùng sidebar
const CONTENT_PADDING = 28; // styles.content paddingHorizontal
const CARD_GAP = 12;

// responsive columns: màn lớn -> 3 cột, tablet/desktop trung -> 3, mobile -> 2
const columns = width >= 1000 ? 3 : width >= 700 ? 3 : 2;

// Tính CARD_WIDTH chính xác (floor để tránh sub-pixel rounding)
const CARD_WIDTH = Math.floor(
  (width - SIDEBAR_WIDTH - CONTENT_PADDING * 2 - CARD_GAP * (columns - 1)) /
    columns
);

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// --- Popover Component ---
function CreatePopover({ visible, onClose, onSelect }) {
  const anim = useSharedValue(0);
  useEffect(() => {
    anim.value = withTiming(visible ? 1 : 0, { duration: 180 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ scale: 0.94 + 0.06 * anim.value }],
    pointerEvents: visible ? "auto" : "none",
  }));

  if (!visible) return null;

  const options = [
    { id: "sketchnote", label: "SketchNote", icon: "description" },
    {
      id: "whiteboard",
      label: "Whiteboard",
      icon: "photo",
      badge: "NEW",
    },
    { id: "folder", label: "Folder", icon: "folder" },
    { id: "import", label: "Import", icon: "cloud-download" },
    { id: "image", label: "Image", icon: "image" },
    { id: "quick_note", label: "Quick note", icon: "flash-on" },
  ];

  return (
    <Reanimated.View style={[styles.popoverContainer, animatedStyle]}>
      <View style={styles.popover}>
        {options.map((opt, idx) => (
          <Pressable
            key={opt.id}
            style={({ pressed }) => [
              styles.popoverItem,
              pressed && { backgroundColor: "#F1F5F9" },
              idx === 0 && {
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
              },
              idx === options.length - 1 && {
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
              },
            ]}
            onPress={() => {
              onSelect(opt.id);
              onClose();
            }}
          >
            <View style={styles.popoverRow}>
              <Icon name={opt.icon} size={19} color="#64748B" />
              <Text style={styles.popoverLabel}>{opt.label}</Text>
              {opt.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{opt.badge}</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
        <View style={styles.popoverTip}>
          <Text style={styles.popoverTipText}>
            Tip: Double tap “+ New” button to create a Quick note
          </Text>
        </View>
      </View>
    </Reanimated.View>
  );
}

// --- Navigation Drawer Component ---
function NavigationDrawer({
  drawerOpen,
  drawerAnimation,
  overlayAnimation,
  activeNavItem,
  onToggleDrawer,
  onNavPress,
}) {
  const navigation = useNavigation();
  const [user] = useState({ name: "Nguyễn Văn A", email: "user@example.com" });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerAnimation.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  return (
    <>
      {drawerOpen && (
        <Reanimated.View
          style={[drawerStyles.overlay, overlayStyle]}
          onTouchStart={onToggleDrawer}
        />
      )}
      <Reanimated.View style={[drawerStyles.drawer, drawerStyle]}>
        <View style={drawerStyles.drawerHeader}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
              }}
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
            <Text style={styles.logo}>SketchNote</Text>
          </View>
          <Pressable onPress={onToggleDrawer}>
            <Icon name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        <View style={drawerStyles.userInfo}>
          <View style={drawerStyles.avatar}>
            <Icon name="account-circle" size={48} color="#4F46E5" />
          </View>
          <Text style={drawerStyles.userName}>{user.name}</Text>
          <Text style={drawerStyles.userEmail}>{user.email}</Text>
        </View>

        <ScrollView style={drawerStyles.drawerItems}>
          {[
            { id: "home", label: "Trang chủ", icon: "home" },
            { id: "courses", label: "Khóa học", icon: "school" },
            { id: "create", label: "Tạo mới", icon: "add-circle" },
            { id: "gallery", label: "Thư viện", icon: "photo-library" },
            { id: "store", label: "Cửa hàng Resource", icon: "store" },
            {
              id: "orderHistory",
              label: "Lịch sử đơn hàng",
              icon: "receipt-long",
            },
            { id: "blogAll", label: "Xem tất cả blog", icon: "dynamic-feed" },
            { id: "blogMine", label: "Blog của tôi", icon: "person-outline" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={[
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
              ]}
              onPress={() => onNavPress(item.id)}
            >
              <View
                style={[
                  drawerStyles.iconContainer,
                  activeNavItem === item.id && drawerStyles.iconContainerActive,
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#6B7280"}
                />
              </View>
              <Text
                style={[
                  drawerStyles.drawerText,
                  activeNavItem === item.id && drawerStyles.drawerTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={drawerStyles.divider} />

          {[
            { id: "profile", label: "Hồ sơ", icon: "person" },
            { id: "settings", label: "Cài đặt", icon: "settings" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={[
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
              ]}
              onPress={() => onNavPress(item.id)}
            >
              <View
                style={[
                  drawerStyles.iconContainer,
                  activeNavItem === item.id && drawerStyles.iconContainerActive,
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#6B7280"}
                />
              </View>
              <Text
                style={[
                  drawerStyles.drawerText,
                  activeNavItem === item.id && drawerStyles.drawerTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={drawerStyles.drawerFooter}>
          <Pressable
            style={drawerStyles.logoutButton}
            onPress={() => navigation.replace("Login")}
          >
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={drawerStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
          <Text style={drawerStyles.versionText}>Phiên bản 1.0.0</Text>
        </View>
      </Reanimated.View>
    </>
  );
}

// --- Main HomeScreen ---
export default function HomeScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNavItem] = useState("home");

  // Animations
  const drawerAnim = useSharedValue(-300);
  const overlayAnim = useSharedValue(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 400 });
  }, []);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getUserProjects();
      // console.log("✅ Projects fetched:", response);
      setProjects(response);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    drawerAnim.value = withTiming(drawerOpen ? 0 : -300, { duration: 300 });
    overlayAnim.value = withTiming(drawerOpen ? 1 : 0, { duration: 300 });
  }, [drawerOpen]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const handleCreate = (type) => {
    setPopoverVisible(false);
    switch (type) {
      case "sketchnote":
        navigation?.navigate?.("NoteSetupScreen");
        break;
      case "whiteboard":
        navigation?.navigate?.("NoteSetupScreen", { mode: "whiteboard" });
        break;
      case "quick_note":
        navigation?.navigate?.("NoteSetupScreen", { quick: true });
        break;
    }
  };

  const toggleDrawer = () => setDrawerOpen((v) => !v);
  const handleNavPress = (id) => {
    setDrawerOpen(false);
  };

  // Double tap detection
  let lastTap = 0;
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      setPopoverVisible(false);
      navigation?.navigate?.("DrawingScreen", { quick: true });
    }
    lastTap = now;
  };

  const handleProjectClick = async (project) => {
    try {
      //console.log("🔄 Fetching project details for:", project.projectId);
      const projectDetails = await projectService.getProjectById(
        project.projectId
      );
      // console.log("✅ Project details fetched:", projectDetails);

      // Build noteConfig từ projectDetails để DrawingScreen hiểu
      const noteConfig = {
        projectId: projectDetails.projectId,
        title: projectDetails.name || "Untitled Note",
        description: projectDetails.description || "",
        hasCover: !!projectDetails.imageUrl,
        orientation: "portrait", // Default, có thể lưu trong DB sau
        paperSize: "A4", // Default, có thể lưu trong DB sau
        cover: projectDetails.imageUrl
          ? {
              template: "custom_image",
              color: "#F8FAFC",
              imageUrl: projectDetails.imageUrl,
            }
          : null,
        paper: { template: "blank" }, // Default
        pages: projectDetails.pages || [], // Mảng pages với pageNumber và strokeUrl
        projectDetails: projectDetails, // Giữ nguyên để dùng sau
      };

      // Navigate to DrawingScreen với noteConfig
      navigation?.navigate?.("DrawingScreen", { noteConfig });
    } catch (error) {
      console.error("❌ Error fetching project details:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin dự án. Vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.cardWrapper}
      onPress={() => handleProjectClick(item)}
    >
      <Shadow distance={6} startColor="#00000012" offset={[0, 3]}>
        <View style={styles.card}>
          <View style={styles.previewContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../../assets/logo1.webp")}
                style={styles.previewImage}
                resizeMode="cover"
              />
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.name || "Untitled Project"}
            </Text>
            <Text style={styles.cardDate}>
              {item.description || "No description"}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </Shadow>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
            }}
            style={{ width: 32, height: 32, resizeMode: "contain" }}
          />
          <Text style={styles.logo}>SketchNote</Text>
        </View>
        <View style={styles.menu}>
          {[
            { icon: "description", label: "Documents", active: true },
            { icon: "star", label: "Favorites" },
            { icon: "share", label: "Shared" },
            { icon: "store", label: "Marketplace" },
            { icon: "delete", label: "Trash" },
          ].map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem, item.active && styles.menuItemActive]}
            >
              <Icon
                name={item.icon}
                size={22}
                color={item.active ? "#4F46E5" : "#64748B"}
              />
              <Text
                style={[
                  styles.menuLabel,
                  item.active && styles.menuLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <Reanimated.View style={[styles.content, fadeStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Projects</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.sortButton}>
                <Text style={styles.sortText}>Date</Text>
                <Icon name="arrow-drop-down" size={18} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={toggleDrawer}
              >
                <Icon name="settings" size={24} color="#2563EB" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setPopoverVisible(true)}
                onPressIn={handleDoubleTap}
              >
                <LinearGradient
                  colors={["#2563EB", "#0EA5E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.newButtonGradient}
                >
                  <Text style={styles.newButtonText}>+ New</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Popover */}
          <CreatePopover
            visible={popoverVisible}
            onClose={() => setPopoverVisible(false)}
            onSelect={handleCreate}
          />

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Loading project...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchProjects()}
              >
                <Text style={styles.retryButtonText}>Retry again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No projects yet.</Text>
              <Text style={styles.emptyText}>Create your first project!</Text>
            </View>
          )}

          {/* Grid - sử dụng responsive columns */}
          {!loading && !error && projects.length > 0 && (
            <FlatList
              data={projects}
              keyExtractor={(item) => item.projectId?.toString()}
              renderItem={renderItem}
              numColumns={columns}
              columnWrapperStyle={[
                styles.gridRow,
                { marginBottom: CARD_GAP, paddingHorizontal: 2 },
              ]}
              contentContainerStyle={[
                styles.gridContainer,
                { paddingBottom: 100 },
              ]}
              showsVerticalScrollIndicator={false}
              // force re-render when columns change
              key={`${columns}`}
            />
          )}
        </Reanimated.View>
      </View>

      {/* Drawer */}
      <NavigationDrawer
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnim}
        overlayAnimation={overlayAnim}
        activeNavItem={activeNavItem}
        onToggleDrawer={toggleDrawer}
        onNavPress={handleNavPress}
      />
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: "#F9FAFB" },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    fontSize: 24,
    fontFamily: "Pacifico-Regular",

    color: "#104D83",
    marginLeft: 10,
  },
  menu: {},
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  menuItemActive: { backgroundColor: "#EEF2FF" },
  menuLabel: {
    marginLeft: 14,
    fontSize: 15.5,
    color: "#6B7280",
    fontWeight: "500",
  },
  menuLabelActive: { color: "#4F46E5", fontWeight: "600" },

  main: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { flex: 1, paddingHorizontal: CONTENT_PADDING, paddingTop: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 12,
  },
  sortText: { color: "#6B7280", fontSize: 14.5, fontWeight: "500" },
  settingsButton: { padding: 6, marginRight: 8 },
  newButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#7C3AED",
  },
  newButtonGradient: { paddingHorizontal: 16, paddingVertical: 10 },
  newButtonText: { color: "#fff", fontWeight: "600", fontSize: 15.5 },

  // Popover
  popoverContainer: {
    position: "absolute",
    right: CONTENT_PADDING,
    top: Platform.OS === "ios" ? 110 : 100,
    zIndex: 100,
  },
  popover: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    minWidth: 210,
    paddingVertical: 8,
    elevation: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  popoverItem: { paddingHorizontal: 16, paddingVertical: 12 },
  popoverRow: { flexDirection: "row", alignItems: "center" },
  popoverLabel: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 14,
    flex: 1,
  },
  badge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { color: "#fff", fontSize: 10.5, fontWeight: "600" },
  popoverTip: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  popoverTipText: { fontSize: 12, color: "#6B7280", fontStyle: "italic" },

  // Grid & Card (SMALLER)
  gridContainer: { paddingBottom: 100, paddingHorizontal: 4 },
  gridRow: { justifyContent: "space-between" },
  cardWrapper: { width: CARD_WIDTH },
  card: {
    width: CARD_WIDTH,
    // Gọn hơn: giảm height (gần vuông, không quá cao)
    height: Math.round(CARD_WIDTH * 0.98),
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  previewContainer: { height: "62%", position: "relative" },
  previewImage: { width: "100%", height: "100%" },
  starIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 10,
    padding: 4,
  },
  cardFooter: { paddingHorizontal: 10, paddingVertical: 6 },
  cardTitle: { color: "#111827", fontSize: 12.5, fontWeight: "600" },
  cardDate: { color: "#6B7280", fontSize: 10, marginTop: 4 },

  // Loading, Error, Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#4F46E5",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    color: "#374151",
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },

  // Drawer styles
  // (giữ giống cũ)
});

const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 98,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    zIndex: 99,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logoContainer: { flexDirection: "row", alignItems: "center" },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginLeft: 8,
  },
  userInfo: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: { marginBottom: 12 },
  userName: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  userEmail: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  drawerItems: { flex: 1, paddingHorizontal: 12, marginTop: 12 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  drawerItemActive: { backgroundColor: "#4F46E5" },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  iconContainerActive: { backgroundColor: "#FFFFFF" },
  drawerText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#1F2937",
    fontWeight: "500",
  },
  drawerTextActive: { color: "#FFFFFF", fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
    marginHorizontal: 12,
  },
  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoutText: { marginLeft: 12, color: "#EF4444", fontWeight: "600" },
  versionText: { fontSize: 12, color: "#9CA3AF", textAlign: "center" },
});
