import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LazyImage from "../../common/LazyImage";
import { projectService } from "../../service/projectService";
import { paperService } from "../../service/paperService";
import * as offlineStorage from "../../utils/offlineStorage";
import { AuthContext } from "../../context/AuthContext";
import NetInfo from "@react-native-community/netinfo";
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";


const PAPER_SIZES = [
  { id: "A3", label: "A3" },
  { id: "A4", label: "A4" },
  { id: "A5", label: "A5" },
  { id: "B3", label: "B3" },
  { id: "B4", label: "B4" },
  { id: "B5", label: "B5" },
  { id: "Letter", label: "Letter" },
];

const ORIENTATIONS = [
  { id: "portrait", label: "Portrait", icon: "phone-rotate-portrait" },
  { id: "landscape", label: "Landscape", icon: "phone-rotate-landscape" },
];

export default function NoteSetupScreen({ navigation, route }) {
  const scrollRef = useRef(null);
  const categoryRefs = useRef({});

  const [selectedTab, setSelectedTab] = useState("cover");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [hasCover, setHasCover] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [paperSize, setPaperSize] = useState("A4");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  // 🔥 Add AuthContext at component level (not inside handleCreate)
  const { isGuest, user } = useContext(AuthContext);
  const [titleModalVisible, setTitleModalVisible] = useState(false);

  // API-fetched templates
  const [coverTemplates, setCoverTemplates] = useState({});
  const [paperTemplates, setPaperTemplates] = useState({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  const [selectedCover, setSelectedCover] = useState(null);
  const [coverColor, setCoverColor] = useState("#E3F2FD");
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  // Fetch templates from API when orientation changes
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);

        // Fetch cover templates
        const coverData = await paperService.getCoverTemplates(orientation);
        setCoverTemplates(coverData);

        // Fetch paper templates
        const paperData = await paperService.getPaperTemplatesGrouped(orientation);
        setPaperTemplates(paperData);

        // Set default selections if not set
        if (!selectedCover && Object.keys(coverData).length > 0) {
          const firstCategory = Object.keys(coverData)[0];
          const firstTemplate = coverData[firstCategory]?.[0];
          if (firstTemplate) {
            setSelectedCover(firstTemplate.id);
            setCoverImageUrl(firstTemplate.imageUrl[orientation]);
            setCoverColor(firstTemplate.color || "#E3F2FD");
          }
        }

        if (!selectedPaper && Object.keys(paperData).length > 0) {
          const firstCategory = Object.keys(paperData)[0];
          const firstTemplate = paperData[firstCategory]?.[0];
          if (firstTemplate) {
            setSelectedPaper(firstTemplate.id);
            setPaperImageUrl(firstTemplate.imageUrl[orientation]);
          }
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Show empty templates on error
        setCoverTemplates({});
        setPaperTemplates({});
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [orientation]);

  // Update cover image when orientation or selection changes
  React.useEffect(() => {
    if (!selectedCover || Object.keys(coverTemplates).length === 0) return;

    const selectedTemplate = Object.values(coverTemplates)
      .flat()
      .find((t) => t.id === selectedCover);

    if (selectedTemplate?.imageUrl) {
      if (
        typeof selectedTemplate.imageUrl === "object" &&
        selectedTemplate.imageUrl[orientation]
      ) {
        setCoverImageUrl(selectedTemplate.imageUrl[orientation]);
      } else if (typeof selectedTemplate.imageUrl === "string") {
        setCoverImageUrl(selectedTemplate.imageUrl);
      }
    } else {
      setCoverImageUrl(null);
    }
  }, [orientation, selectedCover, coverTemplates]);

  const [selectedPaper, setSelectedPaper] = useState("blank");
  const [paperImageUrl, setPaperImageUrl] = useState(null);

  // Update paper image when orientation or selection changes
  React.useEffect(() => {
    if (!selectedPaper || Object.keys(paperTemplates).length === 0) return;

    const selectedTemplate = Object.values(paperTemplates)
      .flat()
      .find((t) => t.id === selectedPaper);

    if (selectedTemplate?.imageUrl) {
      if (
        typeof selectedTemplate.imageUrl === "object" &&
        selectedTemplate.imageUrl[orientation]
      ) {
        setPaperImageUrl(selectedTemplate.imageUrl[orientation]);
      } else if (typeof selectedTemplate.imageUrl === "string") {
        setPaperImageUrl(selectedTemplate.imageUrl);
      }
    } else {
      setPaperImageUrl(null);
    }
  }, [orientation, selectedPaper, paperTemplates]);

  const handleCreate = async () => {
    // Validate input
    if (!noteTitle.trim()) {
      setTitleModalVisible(true);
      return;
    }

    setIsCreating(true);

    try {
      // Get the selected template to determine final imageUrl based on orientation
      const selectedTemplate = Object.values(coverTemplates)
        .flat()
        .find((t) => t.id === selectedCover);

      let finalImageUrl = coverImageUrl;
      if (
        selectedTemplate?.imageUrl &&
        typeof selectedTemplate.imageUrl === "object"
      ) {
        // If template has orientation-based imageUrl, use the current orientation
        finalImageUrl = selectedTemplate.imageUrl[orientation] || null;
      }

      // 🔥 Check if user is guest or offline
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected && netState.isInternetReachable;
      const shouldCreateLocally = isGuest || !isOnline || !user;

      let createdProject;
      let projectId;

      if (shouldCreateLocally) {
        // ✅ Check guest project limit
        const { canCreate, currentCount, limit } = await offlineStorage.checkGuestProjectLimit();

        if (!canCreate) {
          setIsCreating(false);
          Alert.alert(
            "Project Limit Reached",
            `Guest mode only allows ${limit} projects. You currently have ${currentCount} projects.\n\nPlease login to create unlimited projects.`,
            [
              { text: "OK", style: "cancel" },
              {
                text: "Login Now",
                onPress: () => navigation.navigate("Login")
              }
            ]
          );
          return;
        }

        // ✅ Create project LOCALLY (no API call)

        const localProjectData = {
          name: noteTitle.trim(),
          description: noteDescription.trim() || "",
          imageUrl: finalImageUrl || "",
          orientation,
          paperSize,
        };

        createdProject = await projectService.createProjectLocally(localProjectData);
        projectId = createdProject.projectId;

        // Show info if offline
        if (!isOnline) {
          Alert.alert(
            "Offline Mode",
            "Project created locally. It will sync to cloud when you're online and logged in."
          );
        }
      } else {
        // ✅ Create project via API (cloud)

        const projectData = {
          name: noteTitle.trim(),
          description: noteDescription.trim() || "",
          imageUrl: finalImageUrl || "",
        };

        createdProject = await projectService.createProject(projectData);
        projectId = createdProject?.projectId || createdProject?.id || createdProject?._id;

        if (!projectId) {
          throw new Error("Cannot get projectId after creation");
        }
      }

      // Lookup selected paper template image by orientation
      const selectedPaperTemplate = Object.values(paperTemplates)
        .flat()
        .find((t) => t.id === selectedPaper);

      let finalPaperImageUrl = paperImageUrl;
      if (
        selectedPaperTemplate?.imageUrl &&
        typeof selectedPaperTemplate.imageUrl === "object"
      ) {
        finalPaperImageUrl =
          selectedPaperTemplate.imageUrl[orientation] || null;
      }

      // Prepare noteConfig for DrawingScreen with complete information
      const noteConfig = {
        projectId: projectId,
        title: noteTitle || "Untitled Note",
        description: noteDescription || "",
        hasCover,
        orientation,
        paperSize,
        cover: hasCover
          ? {
            template: selectedCover,
            color: coverColor,
            imageUrl: finalImageUrl,
          }
          : null,
        paper: { template: selectedPaper, imageUrl: finalPaperImageUrl },
        pages: [], // No pages yet until Save
        projectDetails: createdProject,
        isLocal: shouldCreateLocally, // 🔥 Mark if it's a local project
      };

      await offlineStorage.saveProjectLocally(`${projectId}_meta`, {
        orientation,
        paperSize,
      });

      setIsCreating(false);
      navigation.navigate("DrawingScreen", { noteConfig });
    } catch (error) {
      setIsCreating(false);
      console.error("❌ Failed to create project:", error);
      Alert.alert(
        "Error",
        "Failed to create project. Please try again.\n" +
        (error.message || "Unknown error")
      );
    }
  };

  const scrollToCategory = (category) => {
    const yOffset = categoryRefs.current[category];
    if (yOffset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  const templates = selectedTab === "cover" ? coverTemplates : paperTemplates;
  const categories = Object.keys(templates);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#084F8C" />
          <Text style={styles.headerTitle}>Create note</Text>
        </View>
        <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
          <LinearGradient
            colors={
              isCreating ? ["#94a3b8", "#64748b"] : ["#1863dbff", "#084F8C"]
            }
            style={styles.createButton}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PHẦN TRÊN: 2 Columns */}
        <View style={styles.topSection}>
          {/* LEFT: Preview */}
          <View style={styles.leftColumn}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "cover" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("cover")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "cover" && styles.tabLabelActive,
                  ]}
                >
                  Cover
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "paper" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("paper")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "paper" && styles.tabLabelActive,
                  ]}
                >
                  Paper
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preview Cards */}
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                <View
                  style={[
                    styles.previewBox,
                    orientation === "portrait"
                      ? styles.previewPortrait
                      : styles.previewLandscape,
                  ]}
                >
                  {coverImageUrl ? (
                    <Image
                      source={{ uri: coverImageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.previewBoxInner,
                        { backgroundColor: coverColor },
                      ]}
                    />
                  )}
                  <Text style={styles.previewLabel}>Cover</Text>
                </View>
              </View>
              <View style={styles.previewCard}>
                <View
                  style={[
                    styles.previewBox,
                    orientation === "portrait"
                      ? styles.previewPortrait
                      : styles.previewLandscape,
                  ]}
                >
                  {paperImageUrl ? (
                    <Image
                      source={{ uri: paperImageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.previewLines}>
                      <View style={styles.previewLine} />
                      <View style={styles.previewLine} />
                      <View style={styles.previewLine} />
                    </View>
                  )}
                  <Text style={styles.previewLabel}>Page</Text>
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT: Settings */}
          <View style={styles.rightColumn}>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter note title"
              placeholderTextColor="#94a3b8"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Enter project description (optional)"
                placeholderTextColor="#94a3b8"
                value={noteDescription}
                onChangeText={setNoteDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Cover</Text>
              <TouchableOpacity onPress={() => setHasCover(!hasCover)}>
                <View style={[styles.toggle, hasCover && styles.toggleActive]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      hasCover && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Format</Text>
              <View style={styles.orientationTabs}>
                {ORIENTATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.orientationTab,
                      orientation === item.id && styles.orientationTabActive,
                    ]}
                    onPress={() => setOrientation(item.id)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={18}
                      color={orientation === item.id ? "#3b82f6" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.orientationTabText,
                        orientation === item.id &&
                        styles.orientationTabTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size Buttons */}
            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Size</Text>
              <View style={styles.sizeButtons}>
                {PAPER_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    style={[
                      styles.sizeButton,
                      paperSize === size.id && styles.sizeButtonActive,
                    ]}
                    onPress={() => setPaperSize(size.id)}
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        paperSize === size.id && styles.sizeButtonTextActive,
                      ]}
                    >
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* PHẦN DƯỚI: Categories & Templates */}
        <View style={styles.bottomSection}>
          {isLoadingTemplates ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1863dbff" />
              <Text style={styles.loadingText}>Loading templates...</Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="image-off" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No templates available</Text>
            </View>
          ) : (
            <>
              {/* Category Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.categoryPill}
                    onPress={() => scrollToCategory(category)}
                  >
                    <Text style={styles.categoryPillText}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Templates by Category */}
              {categories.map((category) => (
                <View
                  key={category}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    categoryRefs.current[category] = y + 300; // Offset for top section
                  }}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryLine} />
                    <Text style={styles.categoryTitle}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                    <View style={styles.categoryLine} />
                  </View>

                  {selectedTab === "cover" ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.horizontalTemplates}
                    >
                      {templates[category]?.map((template) => (
                        <TouchableOpacity
                          key={template.id}
                          style={[
                            styles.coverTemplateCard,
                            orientation === "portrait"
                              ? styles.coverCardPortrait
                              : styles.coverCardLandscape,
                            selectedCover === template.id &&
                            styles.coverTemplateCardActive,
                          ]}
                          onPress={() => {
                            setSelectedCover(template.id);
                            setCoverColor(template.color || "#F8FAFC");
                            // Get imageUrl based on orientation and template structure
                            let imageUrlValue = null;
                            if (template.imageUrl) {
                              if (
                                typeof template.imageUrl === "object" &&
                                template.imageUrl[orientation]
                              ) {
                                // If imageUrl is an object with landscape/portrait keys
                                imageUrlValue = template.imageUrl[orientation];
                              } else if (typeof template.imageUrl === "string") {
                                // If imageUrl is a simple string
                                imageUrlValue = template.imageUrl;
                              }
                            }
                            setCoverImageUrl(imageUrlValue);
                          }}
                        >
                          {(() => {
                            // Get imageUrl based on orientation
                            let imageUrlToShow = null;
                            if (template.imageUrl) {
                              if (
                                typeof template.imageUrl === "object" &&
                                template.imageUrl[orientation]
                              ) {
                                imageUrlToShow = template.imageUrl[orientation];
                              } else if (typeof template.imageUrl === "string") {
                                imageUrlToShow = template.imageUrl;
                              }
                            }

                            if (imageUrlToShow) {
                              return (
                                <LazyImage
                                  source={{ uri: imageUrlToShow }}
                                  style={[
                                    styles.coverTemplatePreview,
                                    orientation === "portrait"
                                      ? styles.coverPreviewPortrait
                                      : styles.coverPreviewLandscape,
                                  ]}
                                />
                              );
                            }

                            // Fallback to gradient or solid color
                            if (template.gradient) {
                              return (
                                <LinearGradient
                                  colors={template.gradient}
                                  style={styles.coverTemplatePreview}
                                />
                              );
                            }

                            return (
                              <View
                                style={[
                                  styles.coverTemplatePreview,
                                  { backgroundColor: template.color },
                                ]}
                              >
                                {template.emoji && (
                                  <Text style={styles.coverEmoji}>
                                    {template.emoji}
                                  </Text>
                                )}
                                {template.icon && (
                                  <MaterialCommunityIcons
                                    name={template.icon}
                                    size={40}
                                    color="#64748b"
                                  />
                                )}
                              </View>
                            );
                          })()}
                          <Text style={styles.coverTemplateName} numberOfLines={2}>
                            {template.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.templatesGrid}>
                      {templates[category]?.map((template) => (
                        <TouchableOpacity
                          key={template.id}
                          style={[
                            styles.templateCard,
                            orientation === "portrait"
                              ? styles.paperCardPortrait
                              : styles.paperCardLandscape,
                            selectedPaper === template.id &&
                            styles.templateCardActive,
                          ]}
                          onPress={() => {
                            setSelectedPaper(template.id);
                            // Lấy imageUrl theo orientation nếu có
                            let img = null;
                            if (template.imageUrl) {
                              if (
                                typeof template.imageUrl === "object" &&
                                template.imageUrl[orientation]
                              ) {
                                img = template.imageUrl[orientation];
                              } else if (typeof template.imageUrl === "string") {
                                img = template.imageUrl;
                              }
                            }
                            setPaperImageUrl(img);
                          }}
                        >
                          {(() => {
                            let imageUrlToShow = null;
                            if (template.imageUrl) {
                              if (
                                typeof template.imageUrl === "object" &&
                                template.imageUrl[orientation]
                              ) {
                                imageUrlToShow = template.imageUrl[orientation];
                              } else if (typeof template.imageUrl === "string") {
                                imageUrlToShow = template.imageUrl;
                              }
                            }

                            if (imageUrlToShow) {
                              return (
                                <LazyImage
                                  source={{ uri: imageUrlToShow }}
                                  style={[
                                    styles.paperTemplatePreview,
                                    orientation === "portrait"
                                      ? styles.paperPreviewPortrait
                                      : styles.paperPreviewLandscape,
                                  ]}
                                />
                              );
                            }

                            return (
                              <View
                                style={[
                                  styles.paperTemplatePreview,
                                  orientation === "portrait"
                                    ? styles.paperPreviewPortrait
                                    : styles.paperPreviewLandscape,
                                ]}
                              >
                                <MaterialCommunityIcons
                                  name={template.icon}
                                  size={32}
                                  color="#94a3b8"
                                />
                              </View>
                            );
                          })()}
                          <Text style={styles.templateName}>{template.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <Modal
        visible={titleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: 300,
              maxWidth: "95%",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Missing title
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>
              Please enter a note title.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: "#3B82F6",
                }}
                onPress={() => setTitleModalVisible(false)}
              >
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "600" }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  cancelButton: {
    fontSize: 16,
    color: "#64748b",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: 0.5,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  topSection: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 30,
    gap: 20,
  },
  leftColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  previewContainer: {
    flexDirection: "row",
    gap: 12,
  },
  previewCard: {
    flex: 1,
  },
  previewBox: {
    height: 180,
    borderRadius: 12,
    padding: 16,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  previewPortrait: {
    height: 330,
  },
  previewLandscape: {
    height: 150,
  },
  previewBoxInner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewImage: {
    position: "absolute",
    top: 0,
    left: 15,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  previewLines: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  previewLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  previewLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: -8,
  },
  titleInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  descriptionInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 80,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: {
    gap: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  addButton: {
    padding: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#085497ff",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  orientationTabs: {
    flexDirection: "row",
    gap: 8,
  },
  orientationTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  orientationTabActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3b82f6",
  },
  orientationTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  orientationTabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
  },
  sizeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sizeButtonActive: {
    backgroundColor: "#1366aeff",
    borderColor: "#084F8C",
  },
  sizeButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  sizeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  bottomSection: {
    paddingHorizontal: 20,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryPillText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  templateCard: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  paperCardPortrait: {
    width: 140,
  },
  paperCardLandscape: {
    width: 200,
  },
  templateCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  templatePreview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paperTemplatePreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paperPreviewPortrait: {
    height: 160,
  },
  paperPreviewLandscape: {
    height: 120,
  },
  templateName: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  // Horizontal cover templates
  horizontalTemplates: {
    paddingRight: 20,
    gap: 12,
    paddingBottom: 20,
  },
  coverTemplateCard: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  coverCardPortrait: {
    width: 140,
  },
  coverCardLandscape: {
    width: 200,
  },
  coverTemplateCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  coverTemplatePreview: {
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  coverPreviewPortrait: {
    width: 120,
    height: 180,
  },
  coverPreviewLandscape: {
    width: 180,
    height: 120,
  },
  coverEmoji: {
    fontSize: 48,
  },
  coverTemplateName: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
});
