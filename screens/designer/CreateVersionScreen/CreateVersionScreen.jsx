import Toast from "react-native-toast-message";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resourceService } from "../../../service/resourceService";
import { projectService } from "../../../service/projectService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./CreateVersionScreen.styles";

export default function CreateVersionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    resourceTemplateId,
    productName,
    currentType,
    versionId,
    versionData,
  } = route.params || {};
  const isUpdateMode = !!versionId;

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => getStyles(theme), [theme]);

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(currentType || "TEMPLATES");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [itemSource, setItemSource] = useState(
    currentType === "TEMPLATES" ? "project" : "upload"
  );
  const [localItems, setLocalItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectPages, setProjectPages] = useState([]); // Store pages from selected project

  const getTodayDateOnly = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [releaseDate, setReleaseDate] = useState(getTodayDateOnly());

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

    if (isUpdateMode && versionData) {
      setName(versionData.name || "");
      setDescription(versionData.description || "");
      setType(versionData.type || currentType || "TEMPLATES");
      setPrice(String((versionData.price || 0) / 1000));
      setReleaseDate(versionData.releaseDate || getTodayDateOnly());

      if (versionData.images && versionData.images.length > 0) {
        setImages(versionData.images.map((img) => img.imageUrl));
      }

      if (versionData.items && versionData.items.length > 0) {
        setLocalItems(versionData.items.map((item) => item.itemUrl));
      }
    }
  }, []);

  const handleImageUploaded = (url) => {
    setImages((prev) => [...prev, url]);
  };

  const getProjectByUserId = async () => {
    try {
      const response = await resourceService.getProjectByUserId();
      setProjects(response?.content || []);
    } catch (error) {
      console.warn("Error fetching project by user ID:", error);
      setProjects([]);
    }
  };

  // Fetch project details when selecting a project
  const handleSelectProject = async (projectId) => {
    setSelectedProjectId(projectId);
    setProjectPages([]); // Reset pages

    try {
      const projectDetails = await projectService.getProjectById(projectId);
      if (projectDetails?.pages && projectDetails.pages.length > 0) {
        setProjectPages(projectDetails.pages);
      }
    } catch (error) {
      console.warn("Error fetching project details:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch project details.",
      });
    }
  };

  const handleCreateVersion = async () => {
    if (!name.trim() || !description.trim() || !type.trim() || !price) {
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

      let versionPayload;

      if (itemSource === "upload") {
        versionPayload = {
          sourceType: formattedType,
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
      } else if (itemSource === "project") {
        const selectedProject = projects.find(
          (p) => p.projectId === selectedProjectId
        );

        // Map project pages to items
        const itemsFromPages = projectPages.map((page) => ({
          itemIndex: page.pageNumber,
          itemUrl: page.strokeUrl,
          imageUrl: page.snapshotUrl,
        }));

        versionPayload = {
          sourceType: formattedType,
          projectId: selectedProjectId,
          name,
          description,
          type: formattedType,
          price: Number(String(price).replace(/\D/g, "")) * 1000,
          releaseDate,
          images: [
            {
              imageUrl: selectedProject?.imageUrl,
              isThumbnail: true,
            },
          ],
          items: itemsFromPages, // Include items from project pages
        };
      }

      if (isUpdateMode) {
        await resourceService.updateResourceVersion(versionId, versionPayload);

        await resourceService.republishResourceVersionWhenStaffNotConfirm(
          versionId
        );

        Toast.show({
          type: "success",
          text1: "Version Updated 🎉",
          text2: "Version has been updated and republished successfully.",
        });
      } else {
        await resourceService.createResourceVersion(
          resourceTemplateId,
          versionPayload
        );

        Toast.show({
          type: "success",
          text1: "Version Created 🎉",
          text2: "New version has been created successfully.",
        });
      }

      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      console.warn(
        isUpdateMode ? "Update version error:" : "Create version error:",
        err
      );
      console.log(err);
      Toast.show({
        type: "error",
        text1: isUpdateMode ? "Update Failed" : "Create Failed",
        text2:
          err.message ||
          "Something went wrong while " +
          (isUpdateMode ? "updating" : "creating") +
          " version.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={styles.headerIconColor} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>
            {isUpdateMode ? "Update Version" : "Create New Version"}
          </Text>
          <Text style={{ fontSize: 12, color: styles.textSecondary }}>
            for "{productName}"
          </Text>
        </View>
        <Pressable
          onPress={handleCreateVersion}
          disabled={isUploading}
          style={styles.headerSubmitBtn}
        >
          <Text
            style={[
              styles.headerSubmitText,
              isUploading && styles.submitTextDisabled,
            ]}
          >
            {isUploading
              ? "..."
              : isUpdateMode
                ? "Update Version"
                : "Create Version"}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color={styles.primaryBlue} />
            <Text style={styles.sectionTitle}>Version Information</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Version Name</Text>
              <TextInput
                style={styles.largeInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter version name"
                placeholderTextColor={styles.placeholderText}
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.largeInput, styles.largeTextarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe this version"
                placeholderTextColor={styles.placeholderText}
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
                  disabled={true}
                  style={[
                    styles.typeButton,
                    type === "TEMPLATES" && styles.typeButtonActive,
                    { opacity: type === "TEMPLATES" ? 1 : 0.5 },
                  ]}
                >
                  <Icon
                    name="grid-view"
                    size={16}
                    color={type === "TEMPLATES" ? "#FFFFFF" : styles.textMuted}
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
                  disabled={true}
                  style={[
                    styles.typeButton,
                    type === "ICONS" && styles.typeButtonActive,
                    { opacity: type === "ICONS" ? 1 : 0.5 },
                  ]}
                >
                  <Icon
                    name="category"
                    size={16}
                    color={type === "ICONS" ? "#FFFFFF" : styles.textMuted}
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
                  placeholderTextColor={styles.placeholderText}
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
                onChangeText={setReleaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={styles.placeholderText}
              />
            </View>
          </View>
        </View>

        {/* Banner Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="image" size={20} color={styles.primaryBlue} />
            <Text style={styles.sectionTitle}>Banner Images</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{images.length}</Text>
            </View>
          </View>
          <MultipleImageUploader
            onImageUploaded={handleImageUploaded}
            maxImages={10}
            initialImages={images}
          />
        </View>

        {/* Available Projects - Only show if project mode */}
        {itemSource === "project" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="folder" size={20} color={styles.primaryBlue} />
              <Text style={styles.sectionTitle}>
                Available Projects ({projects?.length || 0})
              </Text>
            </View>

            {projects?.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="folder-open"
                  size={48}
                  color={styles.emptyIconColor}
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
                    onPress={() => handleSelectProject(proj.projectId)}
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
                      {selectedProjectId === proj.projectId &&
                        projectPages.length > 0 && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#10B981",
                              marginTop: 4,
                            }}
                          >
                            {projectPages.length} pages will be added as items
                          </Text>
                        )}
                    </View>
                    {selectedProjectId === proj.projectId && (
                      <Icon
                        name="check-circle"
                        size={24}
                        color={styles.primaryBlue}
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
              <Icon name="collections" size={20} color={styles.primaryBlue} />
              <Text style={styles.sectionTitle}>Item Images</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{localItems.length}</Text>
              </View>
            </View>
            <MultipleImageUploader
              onImageUploaded={(url) => setLocalItems((prev) => [...prev, url])}
              maxImages={10}
              initialImages={localItems}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast />
    </View>
  );
}
