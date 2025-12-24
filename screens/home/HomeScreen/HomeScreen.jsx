// HomeScreen.jsx – FINAL 2025 – ĐẸP HOÀN HẢO, KHÔNG CÒN LỖI GÌ
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import premiumAnimation from "../../../assets/Premium Gold.json";
import diamondAnimation from "../../../assets/Diamond.json";
import LazyImage from "../../../common/LazyImage";
import * as offlineStorage from "../../../utils/offlineStorage";
import TypeFloatText from "./TypeFloatText";
import { useToast } from "../../../hooks/use-toast";
import { AuthContext } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

import { notiService } from "../../../service/notiService";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../../service/cloudinary";
import PaginationControls from "../../../components/common/PaginationControls";
import { decodeProjectData, isEncodedData } from "../../../utils/dataEncoder";
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
  const { theme } = useTheme();
  const isDark = theme === "dark";
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
    {
      id: "sketchnote",
      label: "SketchNote",
      icon: "description",
      badge: "Default",
    },
    { id: "quick_note", label: "Quick note", icon: "flash-on" },
    { id: "custom_note", label: "Custom note", icon: "image" },
    { id: "template", label: "Template", icon: "stars", badge: "Premium" },
    { id: "import", label: "Import", icon: "cloud-download" },
  ];

  return (
    <Animated.View style={[styles.popoverContainer, animatedStyle]}>
      <View style={[styles.popover, isDark && styles.popoverDark]}>
        <View
          style={[
            styles.popoverArrowBorder,
            isDark && styles.popoverArrowBorderDark,
          ]}
        />
        <View
          style={[styles.popoverArrow, isDark && styles.popoverArrowDark]}
        />
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
              <Icon
                name={opt.icon}
                size={22}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
              <Text
                style={[styles.popoverLabel, isDark && styles.popoverLabelDark]}
              >
                {opt.label}
              </Text>
              {opt.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{opt.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={[styles.popoverTip, isDark && styles.popoverTipDark]}>
          <Text
            style={[styles.popoverTipText, isDark && styles.popoverTipTextDark]}
          >
            Double tap "+ New" to create Quick note
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

// 3-dot Menu
const ProjectMenu = React.memo(
  ({ visible, onClose, onEdit, onDelete, position }) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
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
        <Animated.View
          style={[
            styles.menu,
            isDark && styles.menuDark,
            animatedStyle,
            position,
          ]}
        >
          <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
            <Icon
              name="edit"
              size={18}
              color={isDark ? "#60A5FA" : "#2563EB"}
            />
            <Text style={[styles.menuText, isDark && styles.menuTextDark]}>
              Edit Project
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.menuItem,
              styles.menuItemDelete,
              isDark && styles.menuItemDeleteDark,
            ]}
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
  const [localProjects, setLocalProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [notiCount, setNotiCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(8); // Fixed at 8 items per page
  const [activeTab, setActiveTab] = useState("cloud"); // cloud | local | shared

  // Menu & Modal states
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedProject, setSelectedProject] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImageUrl, setEditImageUrl] = useState(null);
  const [editPaperSize, setEditPaperSize] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { toast } = useToast();
  const { user, fetchUser } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === "dark";
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

  // Fetch data with pagination
  const fetchProjects = useCallback(
    async (page) => {
      try {
        setLoading(true);
        setError(null);

        // If page is not a number (e.g. event object), default to 0
        const targetPage = typeof page === "number" ? page : 0;

        // Load cloud projects with pagination, and local projects in parallel
        const results = await Promise.allSettled([
          projectService.getUserProjectsPaged(targetPage, pageSize),
          projectService.getSharedProjects(),
          offlineStorage.getAllGuestProjects(),
        ]);

        const myPaged =
          results[0].status === "fulfilled"
            ? results[0].value
            : { content: [], totalPages: 0 };
        const shared =
          results[1].status === "fulfilled" ? results[1].value : [];
        const local = results[2].status === "fulfilled" ? results[2].value : [];

        // Log errors if any
        if (results[0].status === "rejected")
          console.error("Failed to load user projects:", results[0].reason);
        if (results[1].status === "rejected")
          console.error("Failed to load shared projects:", results[1].reason);
        if (results[2].status === "rejected")
          console.error("Failed to load local projects:", results[2].reason);

        setProjects(myPaged.content || []);
        setTotalPages(myPaged.totalPages || 0);
        setCurrentPage(targetPage);
        setSharedProjects(shared || []);
        setLocalProjects(local || []);
      } catch (err) {
        setError("Failed to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useFocusEffect(
    useCallback(() => {
      fetchProjects(0);
    }, [fetchProjects])
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages) {
        fetchProjects(newPage);
      }
    },
    [totalPages, fetchProjects]
  );

  useEffect(() => {
    const loadNotiCount = async () => {
      try {
        const data = await notiService.getCountNotiUnRead();
        const count = Number(data?.unread ?? 0);
        setNotiCount(count);
      } catch (error) {}
    };

    loadNotiCount();
  }, []);

  // Render Local Project Item
  const renderLocalProjectItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() =>
        navigation.navigate("DrawingScreen", {
          noteId: item.projectId,
          isLocalProject: true, // Flag for local project
        })
      }
    >
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View
          style={[styles.imageContainer, isDark && styles.imageContainerDark]}
        >
          <LazyImage
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require("../../../assets/default_image.png")
            }
            style={styles.projectImage}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.08)"]}
            style={styles.imageGradient}
          />
          <View style={styles.cardBadges}>
            <View style={[styles.badge, { backgroundColor: "#F59E0B" }]}>
              <Text style={styles.badgeText}>Local</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text
            style={[styles.projectTitle, isDark && styles.projectTitleDark]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.projectDescription,
              isDark && styles.projectDescriptionDark,
            ]}
            numberOfLines={1}
          >
            {item.description || "Local Draft"}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Icon
                name="schedule"
                size={14}
                color={isDark ? "#60A5FA" : "#60A5FA"}
              />
              <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
                {formatDate(item.updatedAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const toggleNotiDropdown = async () => {
    const next = !notiOpen;
    setNotiOpen(next);
    if (!next) return;

    try {
      setLoadingNoti(true);
      const data = await notiService.getAllNoti(0, 20);
      const list = Array.isArray(data) ? data : data?.content || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoadingNoti(false);
    }
  };

  const handleReadAllNoti = async () => {
    try {
      await notiService.readAllNoti();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotiCount(0);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark all as read",
        variant: "destructive",
      });
    }
  };

  const handleReadSingleNoti = async (item) => {
    if (item.read) return;
    try {
      await notiService.readNotiByNotiId(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setNotiCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  // Double tap Quick Note
  const handleDoubleTap = useMemo(() => {
    let lastTap = 0;
    return () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        setPopoverVisible(false);
        setQuickNoteModalVisible(true);
      }
      lastTap = now;
    };
  }, [navigation]);

  // Open project - Direct navigation
  const handleProjectClick = useCallback(
    async (project) => {
      try {
        // Load the project and navigate to it
        const details = await projectService.getProjectById(project.projectId);
        const meta = await offlineStorage.loadProjectLocally(
          `${details.projectId}_meta`
        );
        const config = {
          projectId: details.projectId,
          title: details.name || "Untitled",
          description: details.description || "",
          hasCover: !!details.imageUrl,
          orientation:
            details.paperSize === "LANDSCAPE"
              ? "landscape"
              : details.paperSize === "PORTRAIT"
              ? "portrait"
              : details.orientation || meta?.orientation || "portrait",
          paperSize: "A4",
          cover: details.imageUrl
            ? { template: "custom_image", imageUrl: details.imageUrl }
            : null,
          paper: { template: "blank" },
          pages: details.pages || [],
          projectDetails: details,
        };
        navigation.navigate("DrawingScreen", { noteConfig: config });
      } catch (error) {
        console.error("❌ Error in handleProjectClick:", error);
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
      }
    },
    [navigation, toast]
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
    setEditImageUrl(selectedProject.imageUrl || null);
    setEditPaperSize(selectedProject.paperSize || "PORTRAIT");
    setEditModalVisible(true);
    closeMenu();
  };
  const handleDelete = () => {
    setDeleteModalVisible(true);
    closeMenu();
  };

  const [quickNoteModalVisible, setQuickNoteModalVisible] = useState(false);

  const createQuickNote = useCallback(
    async (orientation) => {
      const portraitUrl =
        "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764387248/ip922pwckxhifmww7iiv.jpg";
      const landscapeUrl =
        "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764387248/bqffv8bevx0qlnrfgtpt.jpg";

      const isPortrait = orientation === "portrait";
      const bgUrl = isPortrait ? portraitUrl : landscapeUrl;
      setQuickNoteModalVisible(false);

      try {
        const projectData = {
          name: "Quick Note",
          description: "",
          imageUrl: bgUrl,
          orientation: isPortrait ? "portrait" : "landscape",
        };
        const created = await projectService.createProject(projectData);
        const projectId = created?.projectId || created?.id || created?._id;
        if (!projectId) throw new Error("Cannot get projectId after creation");

        const pageNumber = 2; // first paper page if 1 is cover
        const dataObject = {
          type: "paper",
          backgroundColor: "#FFFFFF",
          template: "blank",
          imageUrl: bgUrl,
          layers: [
            { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
          ],
          strokes: [],
          pageWidth: null,
          pageHeight: null,
        };

        const uploaded = await projectService.uploadPageToS3(
          projectId,
          pageNumber,
          dataObject
        );
        const strokeUrl = uploaded?.url;
        const payload = { projectId, pages: [{ pageNumber, strokeUrl }] };
        await projectService.createPage(payload);

        await offlineStorage.saveProjectLocally(`${projectId}_meta`, {
          orientation: isPortrait ? "portrait" : "landscape",
          paperSize: "A4",
        });

        const noteConfig = {
          projectId,
          title: "Quick Note",
          description: "",
          hasCover: false,
          orientation: isPortrait ? "portrait" : "landscape",
          paperSize: "A4",
          cover: null,
          paper: { template: "blank", imageUrl: bgUrl },
          pages: [
            {
              pageId: 10001,
              pageNumber,
              imageUrl: bgUrl,
              strokeUrl,
              snapshotUrl: null,
            },
          ],
          projectDetails: created,
        };

        // Refresh user profile to update project count (in background, no full-screen loading)
        fetchUser(false);

        navigation.navigate("DrawingScreen", { noteConfig });
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to create Quick Note",
          variant: "destructive",
        });
      }
    },
    [navigation]
  );

  const handleImportJSON = useCallback(async () => {
    try {
      // Pick JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) {
        toast({
          title: "Error",
          description: "No file selected",
          variant: "destructive",
        });
        return;
      }

      // Read file content
      const response = await fetch(file.uri);
      const jsonText = await response.text();

      // 🔓 Check if data is encoded and decode if necessary
      let importedData;
      if (isEncodedData(jsonText)) {
        try {
          importedData = decodeProjectData(jsonText);
          toast({
            title: "Decoding...",
            description: "Decoding secure project file",
          });
        } catch (error) {
          toast({
            title: "Decode Failed",
            description:
              "Failed to decode file. It may be corrupted or invalid.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Plain JSON format (backward compatibility)
        importedData = JSON.parse(jsonText);
      }

      // Support both old and new JSON formats
      const hasNoteConfig = importedData.noteConfig;
      const config = hasNoteConfig ? importedData.noteConfig : importedData;
      const pages = importedData.pages || [];

      // Validate JSON structure
      if (!config.projectId && !config.projectDetails?.projectId) {
        toast({
          title: "Invalid File",
          description: "The selected file is not a valid project export",
          variant: "destructive",
        });
        return;
      }

      if (!pages || pages.length === 0) {
        toast({
          title: "Invalid File",
          description: "No pages found in the imported file",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Importing...",
        description: "Creating project from imported data",
      });

      // Extract project info
      const projectDetails = config.projectDetails || {};
      const projectData = {
        name: config.title || projectDetails.name || "Imported Project",
        description:
          config.description ||
          projectDetails.description ||
          "Imported from JSON",
        imageUrl: config.cover?.imageUrl || projectDetails.imageUrl || "",
        orientation: config.orientation || "portrait",
        paperSize: config.paperSize || "A4",
      };

      const created = await projectService.createProject(projectData);
      const newProjectId = created?.projectId || created?.id || created?._id;

      if (!newProjectId) throw new Error("Failed to create project");

      // Download and upload pages from strokeUrl
      const pagePromises = pages.map(async (page) => {
        try {
          // Fetch stroke data from URL
          const strokeResponse = await fetch(page.strokeUrl);
          const strokeData = await strokeResponse.json();

          // Upload to new project
          const uploaded = await projectService.uploadPageToS3(
            newProjectId,
            page.pageNumber,
            strokeData
          );

          return {
            pageNumber: page.pageNumber,
            strokeUrl: uploaded.url,
            snapshotUrl: page.snapshotUrl || null,
          };
        } catch (error) {
          console.error(`Failed to import page ${page.pageNumber}:`, error);
          return null;
        }
      });

      const uploadedPages = (await Promise.all(pagePromises)).filter(Boolean);

      if (uploadedPages.length === 0) {
        throw new Error("Failed to import any pages");
      }

      // Create pages in backend
      await projectService.createPage({
        projectId: newProjectId,
        pages: uploadedPages.map((p) => ({
          pageNumber: p.pageNumber,
          strokeUrl: p.strokeUrl,
        })),
      });

      // Save metadata
      await offlineStorage.saveProjectLocally(`${newProjectId}_meta`, {
        orientation: projectData.orientation,
        paperSize: projectData.paperSize,
      });

      toast({
        title: "Success",
        description: `Project imported successfully with ${uploadedPages.length} page(s)!`,
        variant: "success",
      });

      // Refresh projects list
      await fetchProjects();

      // Navigate to drawing screen
      const noteConfig = {
        projectId: newProjectId,
        title: projectData.name,
        description: projectData.description,
        hasCover: !!projectData.imageUrl,
        orientation: projectData.orientation,
        paperSize: projectData.paperSize,
        cover: projectData.imageUrl
          ? {
              template: "custom_image",
              imageUrl: projectData.imageUrl,
            }
          : null,
        paper: config.paper || { template: "blank" },
        pages: uploadedPages.map((p, idx) => ({
          pageId: 10000 + idx,
          pageNumber: p.pageNumber,
          strokeUrl: p.strokeUrl,
          snapshotUrl: p.snapshotUrl,
        })),
        projectDetails: created,
      };

      // Refresh user profile to update project count (in background, no full-screen loading)
      fetchUser(false);

      navigation.navigate("DrawingScreen", { noteConfig });
    } catch (error) {
      console.error("Import JSON error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import project",
        variant: "destructive",
      });
    }
  }, [navigation, toast, fetchProjects]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setEditImageUrl(result.assets[0].uri);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to pick image",
        variant: "destructive",
      });
    }
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
      let finalImageUrl = editImageUrl;

      // If image is a local URI, upload it
      if (editImageUrl && !editImageUrl.startsWith("http")) {
        toast({
          title: "Uploading...",
          description: "Uploading project cover image...",
        });
        const uploadResult = await uploadToCloudinary(editImageUrl);
        finalImageUrl = uploadResult.secure_url;
      }

      await projectService.updateProject(selectedProject.projectId, {
        name: editName.trim(),
        description: editDesc.trim(),
        imageUrl: finalImageUrl || "",
        paperSize: editPaperSize,
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.projectId === selectedProject.projectId
            ? {
                ...p,
                name: editName.trim(),
                description: editDesc.trim(),
                imageUrl: finalImageUrl || "",
                paperSize: editPaperSize,
              }
            : p
        )
      );
      toast({
        title: "Success",
        description: "Project updated successfully!",
        variant: "success",
      });
      setEditModalVisible(false);
    } catch (err) {
      console.error(err);
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
      // Refresh user profile to update project count (in background, no full-screen loading)
      fetchUser(false);
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
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View
            style={[styles.imageContainer, isDark && styles.imageContainerDark]}
          >
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
              style={[
                styles.threeDotButton,
                isDark && styles.threeDotButtonDark,
              ]}
              onPress={(e) => openMenu(item, e)}
            >
              <Icon
                name="more-vert"
                size={24}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardInfo}>
            <Text
              style={[styles.projectTitle, isDark && styles.projectTitleDark]}
              numberOfLines={1}
            >
              {item.name || "Untitled"}
            </Text>
            <Text
              style={[
                styles.projectDescription,
                isDark && styles.projectDescriptionDark,
              ]}
              numberOfLines={2}
            >
              {item.description || ""}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.dateContainer}>
                <Icon
                  name="schedule"
                  size={14}
                  color={isDark ? "#60A5FA" : "#60A5FA"}
                />
                <Text style={[styles.dateText, isDark && styles.dateTextDark]}>
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
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* NỀN CHÍNH */}
      <View style={styles.main}>
        <Animated.View style={[styles.content, fadeStyle]}>
          {/* HEADER */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerLeft}>
              <SidebarToggleButton
                iconSize={26}
                iconColor={isDark ? "#FFFFFF" : "#1E40AF"}
              />
              <Text
                style={[styles.headerTitle, isDark && styles.headerTitleDark]}
              >
                Projects
              </Text>
              <LottieView
                source={require("../../../assets/cat.json")}
                autoPlay
                loop
                style={{ width: 80, height: 70, marginLeft: -30 }}
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
                style={[styles.iconButton, isDark && styles.iconButtonDark]}
                onPress={toggleNotiDropdown}
              >
                <View style={{ position: "relative" }}>
                  <Icon name="notifications" size={22} color="#1E40AF" />
                  {notiCount > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        minWidth: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: "#EF4444",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 3,
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFF",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                        numberOfLines={1}
                      >
                        {notiCount > 99 ? "99+" : notiCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, isDark && styles.iconButtonDark]}
                onPress={() => navigation.navigate("DesignerWallet")}
              >
                <Icon name="account-balance-wallet" size={22} color="#1E40AF" />
              </TouchableOpacity>
              {/* Credit Button */}
              <TouchableOpacity
                style={[styles.iconButton, isDark && styles.iconButtonDark]}
                onPress={() => navigation.navigate("CreditScreen")}
              >
                <View style={{ position: "relative" }}>
                  <LottieView
                    source={premiumAnimation}
                    autoPlay
                    loop
                    style={{ width: 35, height: 35 }}
                  />
                  {/* Credit Badge - You can add state for actual credit count */}
                  <View
                    style={{
                      position: "absolute",
                      top: -12,
                      right: -8,
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "#3375f0ff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <LottieView
                      source={diamondAnimation}
                      autoPlay
                      loop
                      style={{ width: 25, height: 25 }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, isDark && styles.iconButtonDark]}
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

              // 🚀 Check project limits for logged-in users without active subscription
              if (user && !user.hasActiveSubscription) {
                const current = user.currentProjects || 0;
                const max = user.maxProjects || 3;

                if (current >= max) {
                  toast({
                    type: "error",
                    text1: "Project Limit Reached",
                    text2: `You have reached the limit of ${max} projects for the Free plan. Please upgrade to a Premium plan to create more projects.`,
                  });
                  return;
                }
              }

              if (type === "sketchnote") navigation.navigate("NoteSetupScreen");
              if (type === "custom_note")
                navigation.navigate("CustomNoteSetupScreen");
              if (type === "quick_note") setQuickNoteModalVisible(true);
              if (type === "template")
                navigation.navigate("TemplateSelectionScreen");
              if (type === "import") handleImportJSON();
            }}
          />

          {/* TABS */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              marginBottom: 12,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setActiveTab("cloud");
                fetchProjects(0);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: activeTab === "cloud" ? "#2563EB" : "#E0F2FE",
              }}
            >
              <Text
                style={{
                  color: activeTab === "cloud" ? "#FFF" : "#2563EB",
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                My Projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActiveTab("local");
                fetchProjects(0);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: activeTab === "local" ? "#F59E0B" : "#FEF3C7",
              }}
            >
              <Text
                style={{
                  color: activeTab === "local" ? "#FFF" : "#D97706",
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Local Projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActiveTab("shared");
                fetchProjects(0);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: activeTab === "shared" ? "#10B981" : "#D1FAE5",
              }}
            >
              <Text
                style={{
                  color: activeTab === "shared" ? "#FFF" : "#059669",
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Shared Projects
              </Text>
            </TouchableOpacity>
          </View>

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
              <Text
                style={[styles.errorTitle, isDark && styles.errorTitleDark]}
              >
                Oops!
              </Text>
              <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
                {error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchProjects(currentPage)}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* 🔥 LOCAL PROJECTS TAB */}
              {activeTab === "local" && (
                <>
                  {localProjects.length === 0 ? (
                    <View style={styles.centerContainer}>
                      <View
                        style={[
                          styles.emptyIcon,
                          isDark && styles.emptyIconDark,
                        ]}
                      >
                        <Icon
                          name="smartphone"
                          size={64}
                          color={isDark ? "#FDE68A" : "#FDE68A"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.emptyTitle,
                          isDark && styles.emptyTitleDark,
                        ]}
                      >
                        No Local Projects
                      </Text>
                      <Text
                        style={[
                          styles.emptyText,
                          isDark && styles.emptyTextDark,
                        ]}
                      >
                        Projects created offline will appear here.
                      </Text>
                    </View>
                  ) : (
                    <>
                      <View
                        style={{
                          paddingHorizontal: 16,
                          marginBottom: 12,
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 16, color: "#6B7280" }}>
                          Showing {localProjects.length} local project(s)
                        </Text>
                        <TouchableOpacity
                          onPress={() => navigation.navigate("GuestHome")}
                        >
                          <Text style={{ color: "#3B82F6", fontWeight: "600" }}>
                            Manage
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <FlatList
                        data={localProjects}
                        renderItem={renderLocalProjectItem}
                        keyExtractor={(item) => `local-${item.projectId}`}
                        numColumns={columns}
                        columnWrapperStyle={{
                          gap: CARD_GAP,
                          paddingHorizontal: 16,
                          marginBottom: 16,
                        }}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                      />
                    </>
                  )}
                </>
              )}

              {/* MY PROJECTS TAB */}
              {activeTab === "cloud" && (
                <>
                  {projects.length === 0 ? (
                    <View style={styles.centerContainer}>
                      <View
                        style={[
                          styles.emptyIcon,
                          isDark && styles.emptyIconDark,
                        ]}
                      >
                        <Icon
                          name="cloud-off"
                          size={64}
                          color={isDark ? "#BFDBFE" : "#BFDBFE"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.emptyTitle,
                          isDark && styles.emptyTitleDark,
                        ]}
                      >
                        No Cloud Projects
                      </Text>
                      <Text
                        style={[
                          styles.emptyText,
                          isDark && styles.emptyTextDark,
                        ]}
                      >
                        Create a new project to get started!
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
                        data={projects}
                        renderItem={renderProjectItem}
                        keyExtractor={(item) => `my-${item.projectId}`}
                        numColumns={columns}
                        columnWrapperStyle={{
                          gap: CARD_GAP,
                          paddingHorizontal: 16,
                          marginBottom: 10,
                        }}
                        contentContainerStyle={{
                          paddingBottom: 10,
                        }}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={true}
                      />

                      {/* Pagination Controls */}
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        hasShared={false}
                      />
                    </>
                  )}
                </>
              )}

              {/* SHARED PROJECTS TAB */}
              {activeTab === "shared" && (
                <>
                  {sharedProjects.length === 0 ? (
                    <View style={styles.centerContainer}>
                      <View
                        style={[
                          styles.emptyIcon,
                          isDark && styles.emptyIconDark,
                        ]}
                      >
                        <Icon
                          name="folder-shared"
                          size={64}
                          color={isDark ? "#A7F3D0" : "#A7F3D0"}
                        />
                      </View>
                      <Text
                        style={[
                          styles.emptyTitle,
                          isDark && styles.emptyTitleDark,
                        ]}
                      >
                        No Shared Projects
                      </Text>
                      <Text
                        style={[
                          styles.emptyText,
                          isDark && styles.emptyTextDark,
                        ]}
                      >
                        Projects shared with you will appear here.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={sharedProjects}
                      renderItem={renderProjectItem}
                      keyExtractor={(item) => `shared-${item.projectId}`}
                      numColumns={columns}
                      columnWrapperStyle={{
                        gap: CARD_GAP,
                        paddingHorizontal: 16,
                        marginBottom: 16,
                      }}
                      contentContainerStyle={{ paddingBottom: 100 }}
                      showsVerticalScrollIndicator={false}
                      removeClippedSubviews={true}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Animated.View>
      </View>
      <Modal
        visible={quickNoteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQuickNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text
              style={[
                {
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: 12,
                },
                isDark && { color: "#F1F5F9" },
              ]}
            >
              Create Quick Note
            </Text>
            <Text
              style={[
                { fontSize: 14, color: "#374151", marginBottom: 16 },
                isDark && { color: "#94A3B8" },
              ]}
            >
              Choose orientation for the first page
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  backgroundColor: "#EFF6FF",
                }}
                onPress={() => createQuickNote("portrait")}
              >
                <Icon
                  name="smartphone"
                  size={22}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
                <Text
                  style={{
                    marginTop: 6,
                    color: isDark ? "#F1F5F9" : "#1E293B",
                    fontWeight: "600",
                  }}
                >
                  Portrait
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#DBEAFE",
                  backgroundColor: "#EFF6FF",
                }}
                onPress={() => createQuickNote("landscape")}
              >
                <Icon
                  name="stay-current-landscape"
                  size={22}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
                <Text
                  style={{
                    marginTop: 6,
                    color: isDark ? "#F1F5F9" : "#1E293B",
                    fontWeight: "600",
                  }}
                >
                  Landscape
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: isDark ? "#334155" : "#E5E7EB",
                }}
                onPress={() => setQuickNoteModalVisible(false)}
              >
                <Text
                  style={{
                    color: isDark ? "#94A3B8" : "#111827",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {notiOpen && (
        <View
          style={{
            position: "absolute",
            top: 125,
            right: 310,
            width: 320,
            maxHeight: 360,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            zIndex: 50,
          }}
        >
          <View style={styles.notiArrowBorder} />
          <View style={styles.notiArrow} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Notifications
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                {notiCount} unread
              </Text>
              {notifications.length > 0 && (
                <TouchableOpacity onPress={handleReadAllNoti}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    Mark all as read
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loadingNoti ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 20,
              }}
            >
              <LottieView
                source={loadingAnimation}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            </View>
          ) : notifications.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
              }}
            >
              <Icon name="notifications-off" size={32} color="#9CA3AF" />
              <Text
                style={{
                  marginTop: 6,
                  color: "#6B7280",
                  fontSize: 13,
                }}
              >
                No notifications
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id?.toString()}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleReadSingleNoti(item)}
                  activeOpacity={0.8}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    backgroundColor: item.read ? "#F9FAFB" : "#DBEAFE",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.title || "Notification"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#4B5563",
                      marginBottom: 2,
                    }}
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                  {item.createdAt && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

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
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            {/* Icon bút chì + tiêu đề */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={[
                  styles.modalIconCircle,
                  isDark && styles.modalIconCircleDark,
                ]}
              >
                <Icon name="edit" size={28} color="#3B82F6" />
              </View>
              <Text
                style={[styles.modalTitle, isDark && styles.modalTitleDark]}
              >
                Edit Project
              </Text>
            </View>

            {/* Image Picker */}
            <View style={{ marginBottom: 16, alignItems: "center" }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{ position: "relative" }}
              >
                <LazyImage
                  source={
                    editImageUrl
                      ? { uri: editImageUrl }
                      : require("../../../assets/default_image.png")
                  }
                  style={{
                    width: 200,
                    height: 120,
                    borderRadius: 12,
                    backgroundColor: "#F1F5F9",
                  }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -10,
                    right: -10,
                    backgroundColor: "#3B82F6",
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: "#FFF",
                  }}
                >
                  <Icon name="camera-alt" size={20} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={{ marginTop: 12, color: "#64748B", fontSize: 13 }}>
                Tap to change cover image
              </Text>
            </View>

            {/* Input tên */}
            <View
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}
            >
              <Icon
                name="title"
                size={18}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.modalInput, isDark && styles.modalInputDark]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Project Name"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* Input mô tả */}
            <View
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}
            >
              <Icon
                name="description"
                size={18}
                color="#64748B"
                style={styles.inputIcon1}
              />
              <TextInput
                style={[
                  styles.modalInput,
                  { height: 80, textAlignVertical: "top", paddingTop: 14 },
                ]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Project Description (optional)"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                multiline
              />
            </View>

            {/* Read-only Paper Size */}
            <View
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}
            >
              <Icon
                name="aspect-ratio"
                size={18}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDark ? "#334155" : "#F1F5F9",
                    color: isDark ? "#94A3B8" : "#64748B",
                  },
                ]}
                value={editPaperSize}
                editable={false}
                placeholder="Paper Size"
              />
              <View style={{ position: "absolute", right: 12, top: 20 }}>
                <Icon name="lock" size={16} color="#94A3B8" />
              </View>
            </View>

            {/* Nút */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButtonCancel,
                  isDark && styles.modalButtonCancelDark,
                ]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonTextCancel,
                    isDark && styles.modalButtonTextCancelDark,
                  ]}
                >
                  Cancel
                </Text>
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
          <View
            style={[styles.modalContent, isDark && styles.modalContentDark]}
          >
            {/* Icon cảnh báo đỏ cam */}
            <View
              style={[
                styles.modalIconCircle,
                { backgroundColor: "#FEE2E2", marginBottom: 20 },
              ]}
            >
              <Icon name="warning" size={36} color="#EF4444" />
            </View>

            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              Delete Project Permanently?
            </Text>
            <Text
              style={[styles.modalMessage, isDark && styles.modalMessageDark]}
            >
              Project{" "}
              <Text style={{ fontWeight: "700", color: "#DC2626" }}>
                "{selectedProject?.name}"
              </Text>{" "}
              will be permanently deleted and cannot be recovered.
            </Text>

            {/* Nút */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButtonCancel,
                  isDark && styles.modalButtonCancelDark,
                ]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonTextCancel,
                    isDark && styles.modalButtonTextCancelDark,
                  ]}
                >
                  Cancel
                </Text>
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
    </View>
  );
}
