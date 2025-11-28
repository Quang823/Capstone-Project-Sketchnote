// HomeScreen.jsx – FINAL 2025 – ĐẸP HOÀN HẢO, KHÔNG CÒN LỖI GÌ
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { projectService } from "../../../service/projectService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { styles, columns, CARD_GAP } from "./HomeScreen.styles";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import LazyImage from "../../../common/LazyImage";
import * as offlineStorage from "../../../utils/offlineStorage";
import TypeFloatText from "./TypeFloatText";
import { useToast } from "../../../hooks/use-toast";
import { AuthContext } from "../../../context/AuthContext";
import ChatWidget from "../../../components/ChatWidget";
const { width } = Dimensions.get("window");

const formatDate = (dateString) => {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Create Popover
const CreatePopover = React.memo(({ visible, onClose, onSelect }) => {
  const anim = useSharedValue(0);
  useEffect(() => {
    anim.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ scale: 0.94 + 0.06 * anim.value }],
  }));

  if (!visible) return null;

  const options = [
    { id: "sketchnote", label: "SketchNote", icon: "description" },
    { id: "whiteboard", label: "Whiteboard", icon: "photo", badge: "NEW" },
    { id: "folder", label: "Folder", icon: "folder" },
    { id: "import", label: "Import", icon: "cloud-download" },
    { id: "image", label: "Image", icon: "image" },
    { id: "quick_note", label: "Quick note", icon: "flash-on" },
  ];

  return (
    <Animated.View style={[styles.popoverContainer, animatedStyle]}>
      <View style={styles.popover}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.popoverItem,
              idx === 0 && {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
              idx === options.length - 1 && {
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              },
            ]}
            onPress={() => {
              onSelect(opt.id);
              onClose();
            }}
          >
            <View style={styles.popoverRow}>
              <Icon name={opt.icon} size={22} color="#2563EB" />
              <Text style={styles.popoverLabel}>{opt.label}</Text>
              {opt.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{opt.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.popoverTip}>
          <Text style={styles.popoverTipText}>
            Double tap "+ New" để tạo Quick note
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

// 3-dot Menu
const ProjectMenu = React.memo(
  ({ visible, onClose, onEdit, onDelete, position }) => {
    const anim = useSharedValue(0);
    useEffect(() => {
      anim.value = withTiming(visible ? 1 : 0, { duration: 180 });
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: anim.value,
      transform: [{ scale: 0.92 + 0.08 * anim.value }],
    }));

    if (!visible) return null;

    return (
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View style={[styles.menu, animatedStyle, position]}>
          <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
            <Icon name="edit" size={18} color="#2563EB" />
            <Text style={styles.menuText}>Edit Project</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemDelete]}
            onPress={onDelete}
          >
            <Icon name="delete-outline" size={18} color="#EF4444" />
            <Text style={[styles.menuText, { color: "#EF4444" }]}>
              Delete Project
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

export default function HomeScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Menu & Modal states
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withTiming(1, { duration: 500 });
  }, []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  const spin = useSharedValue(0);
  useEffect(() => {
    if (user?.hasActiveSubscription) {
      spin.value = withTiming(1, { duration: 6000, easing: Easing.linear });
    } else {
      spin.value = 0;
    }
  }, [user?.hasActiveSubscription]);
  // const spinStyle = useAnimatedStyle(() => ({
  //   transform: [{ rotate: `${spin.value * 360}deg` }],
  // }));

  // Fetch data
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [my, shared] = await Promise.all([
        projectService.getUserProjects(),
        projectService.getSharedProjects(),
      ]);
      setProjects(my || []);
      setSharedProjects(shared || []);
    } catch (err) {
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Double tap Quick Note
  const handleDoubleTap = useMemo(() => {
    let lastTap = 0;
    return () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        setPopoverVisible(false);
        navigation.navigate("DrawingScreen", {
          noteConfig: {
            projectId: Date.now(),
            title: "Quick Note",
            description: "",
            hasCover: false,
            orientation: "portrait",
            paperSize: "A4",
            cover: null,
            paper: { template: "blank", color: "#FFFFFF" },
            pages: [],
            projectDetails: null,
          },
        });
      }
      lastTap = now;
    };
  }, [navigation]);

  // Open project
  const handleProjectClick = useCallback(
    async (project) => {
      try {
        const details = await projectService.getProjectById(project.projectId);
        const meta = await offlineStorage.loadProjectLocally(
          `${details.projectId}_meta`
        );
        const config = {
          projectId: details.projectId,
          title: details.name || "Untitled",
          description: details.description || "",
          hasCover: !!details.imageUrl,
          orientation: details.orientation || meta?.orientation || "portrait",
          paperSize: details.paperSize || meta?.paperSize || "A4",
          cover: details.imageUrl
            ? { template: "custom_image", imageUrl: details.imageUrl }
            : null,
          paper: { template: "blank" },
          pages: details.pages || [],
          projectDetails: details,
        };
        navigation.navigate("DrawingScreen", { noteConfig: config });
      } catch {
        toast({
          title: "Error",
          description: "Failed to open project",
          variant: "destructive",
        });
      }
    },
    [navigation]
  );

  // 3-dot menu
  const openMenu = (project, event) => {
    event.stopPropagation();
    const { pageY, pageX } = event.nativeEvent;
    let top = pageY + 30;
    let left = pageX - 160;

    if (left < 10) left = 10;
    if (left + 200 > width - 10) left = width - 210;

    setSelectedProject(project);
    setMenuPosition({ top, left });
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
  };
  const handleEdit = () => {
    setEditName(selectedProject.name || "");
    setEditDesc(selectedProject.description || "");
    setEditModalVisible(true);
    closeMenu();
  };
  const handleDelete = () => {
    setDeleteModalVisible(true);
    closeMenu();
  };

  const saveEdit = async () => {
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        status: "error",
      });
      return;
    }
    try {
      // Chỉ update name + description, bỏ imageUrl
      await projectService.updateProject(selectedProject.projectId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === selectedProject.projectId
            ? { ...p, name: editName.trim(), description: editDesc.trim() }
            : p
        )
      );
      toast({
        title: "Success",
        description: "Project updated successfully!",
        variant: "success",
      });
      setEditModalVisible(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await projectService.deleteProject(selectedProject.projectId);
      setProjects((prev) =>
        prev.filter((p) => p.projectId !== selectedProject.projectId)
      );
      toast({
        title: "Success",
        description: "Project deleted successfully!",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeleteModalVisible(false);
    }
  };

  // Render mỗi card project (dùng chung cho cả 2 list)
  const renderProjectItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardWrapper}
        onPress={() => handleProjectClick(item)}
      >
        <View style={styles.card}>
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <LazyImage
                source={{ uri: item.imageUrl }}
                style={styles.projectImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Icon name="insert-drive-file" size={48} color="#BFDBFE" />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.08)"]}
              style={styles.imageGradient}
            />
            <TouchableOpacity
              style={styles.threeDotButton}
              onPress={(e) => openMenu(item, e)}
            >
              <Icon name="more-vert" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {item.name || "Untitled"}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {item.description || ""}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.dateContainer}>
                <Icon name="schedule" size={14} color="#60A5FA" />
                <Text style={styles.dateText}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Icon name="arrow-forward-ios" size={16} color="#3B82F6" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleProjectClick]
  );

  return (
    <View style={styles.container}>
      {/* NỀN CHÍNH */}
      <View style={styles.main}>
        <Animated.View style={[styles.content, fadeStyle]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
              <Text style={styles.headerTitle}>Projects</Text>
              <LottieView
                source={require("../../../assets/cat.json")}
                autoPlay
                loop
                style={{ width: 80, height: 70 }}
              />
            </View>
            <View style={styles.headerRight}>
              <View style={{ position: "relative" }}>
                {user?.hasActiveSubscription && (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.subscriptionBorder]}
                  >
                    <LinearGradient
                      colors={["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.subscriptionBorderGradient}
                    />
                  </Animated.View>
                )}
                <TouchableOpacity
                  style={styles.premiumWrapper}
                  onPress={() => navigation.navigate("DesignerSubscription")}
                >
                  <View style={styles.premiumContent}>
                    <View style={styles.premiumTextBox}>
                      {user?.hasActiveSubscription ? (
                        <>
                          <TypeFloatText
                            text={user?.subscriptionType || "Subscribed"}
                            style={styles.premiumTitle}
                            speed={40}
                          />
                          <TypeFloatText
                            text={
                              user?.subscriptionEndDate
                                ? `Active until ${formatDate(
                                    user.subscriptionEndDate
                                  )}`
                                : "Active"
                            }
                            style={styles.premiumSubtitle}
                            speed={35}
                          />
                        </>
                      ) : (
                        <>
                          <TypeFloatText
                            text="Become a Designer"
                            style={styles.premiumTitle}
                            speed={40}
                          />
                          <TypeFloatText
                            text="Click here to upgrade"
                            style={styles.premiumSubtitle}
                            speed={35}
                          />
                        </>
                      )}
                    </View>
                    <LottieView
                      source={require("../../../assets/premium.json")}
                      autoPlay
                      loop
                      style={styles.premiumLottie}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("Wallet")}
              >
                <Icon name="account-balance-wallet" size={22} color="#1E40AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("Cart")}
              >
                <Icon name="shopping-cart" size={22} color="#1E40AF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setPopoverVisible((p) => !p)}
                onPressIn={handleDoubleTap}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  style={styles.createButtonGradient}
                >
                  <Icon name="add" size={20} color="#FFF" />
                  <Text style={styles.createButtonText}>New</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Popover */}
          <CreatePopover
            visible={popoverVisible}
            onClose={() => setPopoverVisible(false)}
            onSelect={(type) => {
              setPopoverVisible(false);
              if (type === "sketchnote") navigation.navigate("NoteSetupScreen");
              if (type === "whiteboard")
                navigation.navigate("NoteSetupScreen", {
                  mode: "whiteboard",
                });
              if (type === "quick_note") handleDoubleTap();
            }}
          />

          {/* MAIN CONTENT */}
          {loading ? (
            <View style={styles.centerContainer}>
              <LottieView
                source={loadingAnimation}
                autoPlay
                loop
                style={{ width: 300, height: 300 }}
              />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Icon name="error-outline" size={48} color="#EF4444" />
              <Text style={styles.errorTitle}>Oops!</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchProjects}
              >
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : projects.length === 0 && sharedProjects.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="folder-open" size={64} color="#BFDBFE" />
              <Text style={styles.emptyTitle}>No Projects Found</Text>
              <Text style={styles.emptyText}>
                Start creating your first project!
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => setPopoverVisible(true)}
              >
                <Text style={styles.createFirstButtonText}>
                  Create First Project
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* MY PROJECTS */}
              {projects.length > 0 && (
                <>
                  <View
                    style={{
                      paddingHorizontal: 16,

                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Icon name="person" size={22} color="#084F8C" />
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "800",
                          color: "#084F8C",
                        }}
                      >
                        My Projects
                      </Text>
                    </View>
                  </View>

                  <FlatList
                    data={projects}
                    renderItem={renderProjectItem}
                    keyExtractor={(item) => `my-${item.projectId}`}
                    numColumns={columns}
                    columnWrapperStyle={{
                      gap: CARD_GAP,
                      paddingHorizontal: 16,
                      marginBottom: 16,
                    }}
                    contentContainerStyle={{
                      paddingBottom: sharedProjects.length > 0 ? 24 : 140,
                    }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                  />
                </>
              )}

              {/* SHARED PROJECTS */}
              {sharedProjects.length > 0 && (
                <>
                  <View
                    style={{
                      paddingHorizontal: 16,

                      marginBottom: 12,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Icon name="groups" size={22} color="#084F8C" />
                      <Text
                        style={{
                          fontSize: 19,
                          fontWeight: "800",
                          color: "#084F8C",
                        }}
                      >
                        Shared Projects
                      </Text>
                    </View>
                  </View>

                  <FlatList
                    data={sharedProjects}
                    renderItem={renderProjectItem}
                    keyExtractor={(item) => `shared-${item.projectId}`}
                    numColumns={columns}
                    columnWrapperStyle={{
                      gap: CARD_GAP,
                      paddingHorizontal: 16,
                    }}
                    // contentContainerStyle={{ paddingBottom: 140 }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                  />
                </>
              )}
            </>
          )}
        </Animated.View>
      </View>
      <TouchableOpacity
        onPress={() => setChatVisible(true)}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          right: 30,
          bottom: 50,
        }}
      >
        <LottieView
          source={require("../../../assets/Chat Bubble.json")}
          autoPlay
          loop
          style={{
            width: 100,
            height: 100,
          }}
        />
      </TouchableOpacity>
      {/* MENU & MODALS – RA NGOÀI ĐỂ KHÔNG BỊ ĐÈ */}
      <ProjectMenu
        visible={menuVisible}
        onClose={closeMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
        position={menuPosition}
      />

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon bút chì + tiêu đề */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={styles.modalIconCircle}>
                <Icon name="edit" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.modalTitle}>Edit Project</Text>
            </View>

            {/* Input tên */}
            <View style={styles.inputWrapper}>
              <Icon
                name="title"
                size={18}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Project Name"
                placeholderTextColor="#94A3B8"
                autoFocus
              />
            </View>

            {/* Input mô tả */}
            <View style={styles.inputWrapper}>
              <Icon
                name="description"
                size={18}
                color="#64748B"
                style={styles.inputIcon1}
              />
              <TextInput
                style={[
                  styles.modalInput,
                  { height: 100, textAlignVertical: "top", paddingTop: 14 },
                ]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Project Description (optional)"
                placeholderTextColor="#94A3B8"
                multiline
              />
            </View>

            {/* Nút */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={saveEdit}>
                <Text style={styles.modalButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Icon cảnh báo đỏ cam */}
            <View
              style={[
                styles.modalIconCircle,
                { backgroundColor: "#FEE2E2", marginBottom: 20 },
              ]}
            >
              <Icon name="warning" size={36} color="#EF4444" />
            </View>

            <Text style={styles.modalTitle}>Delete Project Permanently?</Text>
            <Text style={styles.modalMessage}>
              Project{" "}
              <Text style={{ fontWeight: "700", color: "#DC2626" }}>
                "{selectedProject?.name}"
              </Text>{" "}
              will be permanently deleted and cannot be recovered.
            </Text>

            {/* Nút */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Icon
                  name="delete-forever"
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.modalButtonText}>Delete Permanently</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Widget */}
      <ChatWidget visible={chatVisible} onClose={() => setChatVisible(false)} />
    </View>
  );
}
