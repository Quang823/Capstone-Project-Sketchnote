// DesignerQuickUploadScreen.js
import React, { useState, useEffect, useRef } from "react";
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
import { styles } from "./DesignerQuickUploadScreen.styles";
import { resourceService } from "../../../service/resourceService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerQuickUploadScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("quickUpload");

  useEffect(() => {
    setActiveNavItem("quickUpload");
    setActiveNavItemLocal("quickUpload");
  }, [setActiveNavItem]);

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TEMPLATES");
  const [price, setPrice] = useState("");
  const [expiredTime, setExpiredTime] = useState("");
  const [showExpiredPicker, setShowExpiredPicker] = useState(false);
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
  }, []);

  const handleImageUploaded = (url) => {
    setImages((prev) => [...prev, url]);
  };

  const getProjectByUserId = async () => {
    try {
      const response = await resourceService.getProjectByUserId();
      setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching project by user ID:", error);
    }
  };

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
      !price ||
      !expiredTime
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
          expiredTime,
          images: formattedImages,
          items: localItems.map((url, idx) => ({
            itemIndex: idx + 1,
            itemUrl: url,
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
          expiredTime: new Date(expiredTime).toISOString(),
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
        <SidebarToggleButton
          style={styles.headerButton}
          iconColor="#084F8C"
          iconSize={24}
        />
        <Text style={styles.headerTitle}>Upload Template</Text>
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
            <Icon name="description" size={20} color="#084F8C" />
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
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.largeInput, styles.largeTextarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your template"
                placeholderTextColor="#94A3B8"
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
                  onPress={() => setType("TEMPLATES")}
                  style={[
                    styles.typeButton,
                    type === "TEMPLATES" && styles.typeButtonActive,
                  ]}
                >
                  <Icon
                    name="grid-view"
                    size={16}
                    color={type === "TEMPLATES" ? "#FFFFFF" : "#64748B"}
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
                  onPress={() => setType("ICONS")}
                  style={[
                    styles.typeButton,
                    type === "ICONS" && styles.typeButtonActive,
                  ]}
                >
                  <Icon
                    name="category"
                    size={16}
                    color={type === "ICONS" ? "#FFFFFF" : "#64748B"}
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
                  placeholderTextColor="#94A3B8"
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
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>Expired Date</Text>
              <Pressable
                onPress={() => setShowExpiredPicker(true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateText}>
                  {expiredTime || "Select date"}
                </Text>
                <Icon name="calendar-today" size={18} color="#64748B" />
              </Pressable>
              {showExpiredPicker && (
                <DateTimePicker
                  value={expiredTime ? new Date(expiredTime) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowExpiredPicker(false);
                    if (selectedDate) {
                      const y = selectedDate.getFullYear();
                      const m = String(selectedDate.getMonth() + 1).padStart(
                        2,
                        "0"
                      );
                      const d = String(selectedDate.getDate()).padStart(2, "0");
                      setExpiredTime(`${y}-${m}-${d}`);
                    }
                  }}
                />
              )}
            </View>
          </View>
        </View>

        {/* Images */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="image" size={20} color="#084F8C" />
            <Text style={styles.sectionTitle}>Images</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <View style={styles.sectionHeader}>
                <Icon name="image" size={18} color="#084F8C" />
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
            <View style={styles.verticalDivider} />
            <View style={styles.halfInput}>
              {itemSource === "upload" && (
                <>
                  <View style={styles.sectionHeader}>
                    <Icon name="collections" size={18} color="#084F8C" />
                    <Text style={styles.sectionTitle}>Item Images</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{localItems.length}</Text>
                    </View>
                  </View>
                  <MultipleImageUploader
                    onImageUploaded={(url) =>
                      setLocalItems((prev) => [...prev, url])
                    }
                    maxImages={10}
                  />
                </>
              )}
            </View>
          </View>
        </View>

        {/* Item Source */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="inventory" size={20} color="#084F8C" />
            <Text style={styles.sectionTitle}>Item Source</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.halfInput, styles.sourceToggle]}>
              <Pressable
                onPress={() => setItemSource("upload")}
                style={[
                  styles.sourceButton,
                  itemSource === "upload" && styles.sourceButtonActive,
                  itemSource === "upload" && styles.sourceButtonSelected,
                ]}
              >
                <Icon
                  name="upload-file"
                  size={18}
                  color={itemSource === "upload" ? "#FFFFFF" : "#64748B"}
                />
                <Text
                  style={[
                    styles.sourceButtonText,
                    itemSource === "upload" && styles.sourceButtonTextActive,
                  ]}
                >
                  Upload
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setItemSource("project")}
                style={[
                  styles.sourceButton,
                  itemSource === "project" && styles.sourceButtonActive,
                  itemSource === "project" && styles.sourceButtonSelected,
                ]}
              >
                <Icon
                  name="folder"
                  size={18}
                  color={itemSource === "project" ? "#FFFFFF" : "#64748B"}
                />
                <Text
                  style={[
                    styles.sourceButtonText,
                    itemSource === "project" && styles.sourceButtonTextActive,
                  ]}
                >
                  Project
                </Text>
              </Pressable>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.halfInput}>
              {itemSource === "project" && (
                <View style={styles.sourceContent}>
                  <Text style={styles.itemTitle}>
                    Available Projects ({projects.length})
                  </Text>

                  {projects.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Icon name="folder-open" size={48} color="#CBD5E1" />
                      <Text style={styles.emptyText}>
                        No projects available
                      </Text>
                    </View>
                  ) : (
                    projects.map((proj) => (
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
                          <Icon name="check-circle" size={24} color="#084F8C" />
                        )}
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Removed bottom upload button: now on header */}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast />
    </View>
  );
}
