import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Image,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import getStyles from "./DesignerQuickUploadScreen.styles";
import { resourceService } from "../../../service/resourceService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { useTheme } from "../../../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerQuickUploadScreen() {
  console.log("RENDER UPLOAD SCREEN");
  const navigation = useNavigation();

  const { theme } = useTheme();
  const { activeNavItem, setActiveNavItem } = useNavContext();
  // Get styles based on theme - memoized to prevent infinite loops
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = React.useMemo(() => ({
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#084F8C",
    textMuted: isDark ? "#64748B" : "#94A3B8",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
    emptyIconColor: isDark ? "#475569" : "#CBD5E1",
    typeButtonText: isDark ? "#94A3B8" : "#64748B",
  }), [isDark]);

  // Lấy thêm activeNavItem từ context để kiểm tra


  useEffect(() => {
    setActiveNavItem("quickUpload");
  }, [setActiveNavItem]);

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TEMPLATES");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [itemSource, setItemSource] = useState("upload");
  const [localItems, setLocalItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const getTodayDateOnly = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [releaseDate, setReleaseDate] = useState(getTodayDateOnly());
  const [releaseDateISO, setReleaseDateISO] = useState(
    new Date().toISOString()
  );

  const getProjectByUserId = useCallback(async () => {
    try {
      const response = await resourceService.getProjectByUserId();
      setProjects(response?.content || []);
    } catch (error) {
      console.error("Error fetching project by user ID:", error);
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "App needs photo library access to upload images.",
        });
      }
    })();
    getProjectByUserId();
  }, [getProjectByUserId]);

  const handleImageUploaded = useCallback((url) => {
    setImages((prev) => [...prev, url]);
  }, []);

  const handleItemImageUploaded = useCallback((url) => {
    setLocalItems((prev) => [...prev, url]);
  }, []);

  const formatPriceDisplay = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    const value = digits ? Number(digits) * 1000 : 0;
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  };

  const handleUpload = async () => {
    if (
      !name.trim() ||
      !description.trim() ||
      !type.trim() ||
      !price
    ) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please fill in all required fields.",
      });
      return;
    }

    if (itemSource === "upload" && images.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing images",
        text2: "Please upload at least one banner image.",
      });
      return;
    }

    if (itemSource === "upload" && localItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing items",
        text2: "Please upload at least one item image.",
      });
      return;
    }

    if (itemSource === "project" && !selectedProjectId) {
      Toast.show({
        type: "error",
        text1: "Missing project",
        text2: "Please select a project.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formattedType = type.toUpperCase();
      const formattedImages = images.map((url, index) => ({
        imageUrl: url,
        isThumbnail: index === 0,
      }));

      if (itemSource === "upload") {
        const template = {
          name,
          description,
          type: formattedType,
          price: Number(String(price).replace(/\D/g, "")) * 1000,
          releaseDate,
          images: formattedImages,
          items: localItems.map((url, idx) => ({
            itemIndex: idx + 1,
            itemUrl: url,
            imageUrl: url,
          })),
        };
        await resourceService.uploadResource(template);
      } else if (itemSource === "project") {
        const selectedProject = projects.find(
          (p) => p.projectId === selectedProjectId
        );
        const templateData = {
          name,
          description,
          type: formattedType,
          price: Number(String(price).replace(/\D/g, "")) * 1000,
          images: [
            {
              imageUrl: selectedProject?.imageUrl,
              isThumbnail: true,
            },
          ],
        };
        await resourceService.uploadTemplate(selectedProjectId, templateData);
      }

      Toast.show({
        type: "success",
        text1: "Upload Successful 🎉",
        text2: "Your template has been uploaded successfully.",
      });

      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      console.error("Upload error:", err);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: err.message || "Something went wrong while uploading.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconColor={colors.primaryWhite} iconSize={26} />
          <Text style={styles.headerTitle}>Upload Template</Text>
        </View>
        <Pressable
          onPress={handleUpload}
          disabled={isUploading}
          style={styles.headerSubmitBtn}
        >
          <Text
            style={[
              styles.headerSubmitText,
              isUploading && styles.submitTextDisabled,
            ]}
          >
            {isUploading ? "..." : "Upload Template"}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color={colors.primaryBlue} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Template Name</Text>
              <TextInput
                style={styles.largeInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter template name"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.largeInput, styles.largeTextarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your template"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeToggle}>
                <Pressable
                  onPress={() => {
                    setType("TEMPLATES");
                    setItemSource("project");
                  }}
                  style={[
                    styles.typeButton,
                    type === "TEMPLATES" && styles.typeButtonActive,
                  ]}
                >
                  <Icon
                    name="grid-view"
                    size={16}
                    color={
                      type === "TEMPLATES" ? "#FFFFFF" : colors.typeButtonText
                    }
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "TEMPLATES" && styles.typeButtonTextActive,
                    ]}
                  >
                    Template
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setType("ICONS");
                    setItemSource("upload");
                  }}
                  style={[
                    styles.typeButton,
                    type === "ICONS" && styles.typeButtonActive,
                  ]}
                >
                  <Icon
                    name="category"
                    size={16}
                    color={type === "ICONS" ? "#FFFFFF" : colors.typeButtonText}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === "ICONS" && styles.typeButtonTextActive,
                    ]}
                  >
                    Icon
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.priceInput}>
                <TextInput
                  style={styles.priceField}
                  value={price}
                  onChangeText={(text) => {
                    const digits = text.replace(/\D/g, "");
                    setPrice(digits);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.priceSuffix}>.000đ</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Release Date</Text>
              <TextInput
                style={styles.input}
                value={releaseDate}
                onChangeText={(val) => {
                  setReleaseDate(val);
                  const iso = new Date(val + "T00:00:00").toISOString();
                  setReleaseDateISO(iso);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Banner Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="image" size={20} color={colors.primaryBlue} />
            <Text style={styles.sectionTitle}>Banner Images</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{images.length}</Text>
            </View>
          </View>
          <MultipleImageUploader
            onImageUploaded={handleImageUploaded}
            maxImages={10}
          />
        </View>

        {/* Available Projects - Only show if project mode */}
        {itemSource === "project" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="folder" size={20} color={colors.primaryBlue} />
              <Text style={styles.sectionTitle}>
                Available Projects ({projects?.length || 0})
              </Text>
            </View>

            {projects?.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="folder-open"
                  size={48}
                  color={colors.emptyIconColor}
                />
                <Text style={styles.emptyText}>No projects available</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.projectListScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {projects?.map((proj) => (
                  <Pressable
                    key={proj.projectId}
                    onPress={() => setSelectedProjectId(proj.projectId)}
                    style={[
                      styles.projectCard,
                      selectedProjectId === proj.projectId &&
                      styles.projectCardActive,
                    ]}
                  >
                    <Image
                      source={{ uri: proj.imageUrl }}
                      style={styles.projectImage}
                    />
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName} numberOfLines={1}>
                        {proj.name}
                      </Text>
                      <Text style={styles.projectDesc} numberOfLines={2}>
                        {proj.description}
                      </Text>
                    </View>
                    {selectedProjectId === proj.projectId && (
                      <Icon
                        name="check-circle"
                        size={24}
                        color={colors.primaryBlue}
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Item Images - Only show if upload mode */}
        {itemSource === "upload" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="collections" size={20} color={colors.primaryBlue} />
              <Text style={styles.sectionTitle}>Item Images</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{localItems.length}</Text>
              </View>
            </View>
            <MultipleImageUploader
              onImageUploaded={handleItemImageUploaded}
              maxImages={10}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast />
    </View>
  );
}
