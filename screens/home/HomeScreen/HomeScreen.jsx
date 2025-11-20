// HomeScreen.jsx (FINAL STABLE VERSION)
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { styles, columns } from "./HomeScreen.styles";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import LazyImage from "../../../common/LazyImage";
import * as offlineStorage from "../../../utils/offlineStorage";
//
// 🔹 Helper: format date
//
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

//
// 🔹 CreatePopover (memoized + animation)
//
const CreatePopover = React.memo(({ visible, onClose, onSelect }) => {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(visible ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.ease),
    });
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
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              },
              idx === options.length - 1 && {
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              },
            ]}
            onPress={() => {
              onSelect(opt.id);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.popoverRow}>
              <Icon name={opt.icon} size={20} color="#2563EB" />
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
            💡 Double tap "+ New" để tạo Quick note
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

//
// 🔹 HomeScreen chính
//
export default function HomeScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fade-in animation khi mở
  const fade = useSharedValue(0);
  useEffect(() => {
    fade.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  //
  // 🔹 Fetch projects — ✅ version fixed (1 useEffect duy nhất)
  //
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getUserProjects();
      setProjects(response);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  //
  // 🔹 Navigation handlers
  //
  const handleCreate = useCallback(
    (type) => {
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
        default:
          break;
      }
    },
    [navigation]
  );

  // Double tap handler
  const handleDoubleTap = useMemo(() => {
    let lastTap = 0;
    return () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        setPopoverVisible(false);
        const quickNoteConfig = {
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
        };
        navigation?.navigate?.("DrawingScreen", { noteConfig: quickNoteConfig });
      }
      lastTap = now;
    };
  }, [navigation]);

  //
  // 🔹 Khi click vào project
  //
  const handleProjectClick = useCallback(
    async (project) => {
      try {
        const projectDetails = await projectService.getProjectById(
          project.projectId
        );
        const meta = await offlineStorage.loadProjectLocally(
          `${projectDetails.projectId}_meta`
        );
        const restoredOrientation =
          projectDetails?.orientation || meta?.orientation || "portrait";
        const restoredPaperSize =
          projectDetails?.paperSize || meta?.paperSize || "A4";
        const noteConfig = {
          projectId: projectDetails.projectId,
          title: projectDetails.name || "Untitled Note",
          description: projectDetails.description || "",
          hasCover: !!projectDetails.imageUrl,
          orientation: restoredOrientation,
          paperSize: restoredPaperSize,
          cover: projectDetails.imageUrl
            ? {
                template: "custom_image",
                color: "#F8FAFC",
                imageUrl: projectDetails.imageUrl,
              }
            : null,
          paper: { template: "blank" },
          pages: projectDetails.pages || [],
          projectDetails,
        };
        navigation?.navigate?.("DrawingScreen", { noteConfig });
      } catch (error) {
        console.error("❌ Error fetching project details:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin dự án. Vui lòng thử lại.");
      }
    },
    [navigation]
  );

  //
  // 🔹 Pagination
  //
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(start, start + ITEMS_PER_PAGE);
  }, [projects, currentPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  //
  // 🔹 Render project item
  //
  const renderItem = useCallback(
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
              colors={["transparent", "rgba(0,0,0,0.05)"]}
              style={styles.imageGradient}
            />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {item.name || "Untitled Project"}
            </Text>
            <Text style={styles.projectDescription} numberOfLines={2}>
              {item.description || " "}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.dateContainer}>
                <Icon name="schedule" size={14} color="#60A5FA" />
                <Text style={styles.dateText}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
              <Icon name="arrow-forward" size={18} color="#3B82F6" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleProjectClick]
  );

  //
  // 🔹 Render chính
  //
  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Animated.View style={[styles.content, fadeStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
              <Text style={styles.headerTitle}>My Projects</Text>
            </View>

            <View style={styles.headerRight}>
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

              <TouchableOpacity style={styles.filterButton}>
                <Icon name="filter-list" size={20} color="#1E40AF" />
                <Text style={styles.filterText}>Date</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subscriptionButton}
                onPress={() => navigation.navigate("DesignerSubscription")}
              >
                <Icon name="workspace-premium" size={20} color="#FBBF24" />
                <Text style={styles.subscriptionText}>Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setPopoverVisible((p) => !p)}
                onPressIn={handleDoubleTap}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>New</Text>
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

          {/* Loading / Error / Empty / List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <LottieView
                source={loadingAnimation}
                autoPlay
                loop
                style={{ width: 300, height: 300 }}
              />
              {/* <Text style={styles.loadingText}>Loading projects...</Text> */}
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
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.centerContainer}>
              <Icon name="folder-open" size={64} color="#BFDBFE" />
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyText}>
                Start creating amazing projects!
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
              <FlatList
                data={paginatedProjects}
                keyExtractor={(item) => item.projectId?.toString()}
                renderItem={renderItem}
                numColumns={columns}
                columnWrapperStyle={styles.gridRow}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
              />

              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled,
                    ]}
                    onPress={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Icon
                      name="chevron-left"
                      size={20}
                      color={currentPage === 1 ? "#CBD5E1" : "#3B82F6"}
                    />
                  </TouchableOpacity>

                  <View style={styles.paginationNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <TouchableOpacity
                          key={page}
                          style={[
                            styles.paginationNumber,
                            currentPage === page &&
                              styles.paginationNumberActive,
                          ]}
                          onPress={() => handlePageChange(page)}
                        >
                          <Text
                            style={[
                              styles.paginationNumberText,
                              currentPage === page &&
                                styles.paginationNumberTextActive,
                            ]}
                          >
                            {page}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.paginationButton,
                      currentPage === totalPages &&
                        styles.paginationButtonDisabled,
                    ]}
                    onPress={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={currentPage === totalPages ? "#CBD5E1" : "#3B82F6"}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}
