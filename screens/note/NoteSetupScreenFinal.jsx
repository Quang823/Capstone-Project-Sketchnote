import React, { useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { projectService } from "../../service/projectService";

const COVER_TEMPLATES = {
  simple: [
    {
      id: "label",
      name: "Label",
      color: "#E3F2FD",
      gradient: ["#E3F2FD", "#BBDEFB"],
    },
    {
      id: "title_tag",
      name: "Title tag",
      color: "#BBDEFB",
      gradient: ["#BBDEFB", "#90CAF9"],
    },
    {
      id: "rouge",
      name: "Rouge",
      color: "#F8BBD0",
      gradient: ["#F8BBD0", "#F48FB1"],
    },
    {
      id: "mountain_mist",
      name: "Mountain mist",
      color: "#B2DFDB",
      gradient: ["#B2DFDB", "#80CBC4"],
    },
    {
      id: "autumn_waves",
      name: "Autumn waves",
      color: "#B3E5FC",
      gradient: ["#B3E5FC", "#81D4FA"],
    },
    {
      id: "eggplant_flower",
      name: "Eggplant flower",
      color: "#E1BEE7",
      gradient: ["#E1BEE7", "#CE93D8"],
    },
    {
      id: "half_seen",
      name: "Half seen",
      color: "#FFE0B2",
      gradient: ["#FFE0B2", "#FFCC80"],
    },
    {
      id: "amber",
      name: "Amber",
      color: "#FFCC80",
      gradient: ["#FFCC80", "#FFB74D"],
    },
    {
      id: "white",
      name: "White",
      color: "#FFFFFF",
      gradient: ["#FFFFFF", "#F5F5F5"],
    },
    {
      id: "custom_image",
      name: "Custom Image",
      color: "#F8FAFC",
      imageUrl:
        "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761133209/r26kwriepr0y7rcepo9l.jpg",
    },
  ],
  graph: [
    { id: "nightfall", name: "Nightfall", color: "#263238", pattern: "grid" },
    { id: "sunrise", name: "Sunrise", color: "#FFF3E0", pattern: "grid" },
    { id: "sunset", name: "Sunset", color: "#FFE0B2", pattern: "grid" },
    { id: "iceberg", name: "Iceberg", color: "#E1F5FE", pattern: "grid" },
    { id: "afterglow", name: "Afterglow", color: "#FCE4EC", pattern: "grid" },
    {
      id: "mountain_peak",
      name: "Mountain peak",
      color: "#E8EAF6",
      pattern: "grid",
    },
  ],
  fruit: [
    {
      id: "lychee",
      name: "Lychee",
      color: "#F8BBD0",
      emoji: "🍑",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/lxjin83oc1j4ybuhyumk.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/rpidw4lr8jhribajfhbz.jpg",
      },
    },
    {
      id: "pineapple",
      name: "Pineapple",
      color: "#FFF9C4",
      emoji: "🍍",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/snz4ype1qqt6gpoe3zb2.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/nkn8ymvheqvfo3th0u0p.jpg",
      },
    },
    {
      id: "orange",
      name: "Orange",
      color: "#FFE0B2",
      emoji: "🍊",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761983056/y5zdbialfifmznufcplx.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/vzopf1domdwbkldpsdn5.jpg",
      },
    },
    {
      id: "strawberry",
      name: "Strawberry",
      color: "#FFCDD2",
      emoji: "🍓",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/neexgy8ewglqna4qd6sd.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/itic068ggqj1tnfl36ne.jpg",
      },
    },
    {
      id: "valencia_orange",
      name: "Valencia orange",
      color: "#FFB74D",
      emoji: "🍊",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/tddrogjmjmeqj0xov1q1.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/trtigisvxb5fgdh4gpc0.jpg",
      },
    },
    {
      id: "explosive_lime",
      name: "Explosive lime",
      color: "#C5E1A5",
      emoji: "🍋",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/r6yrrenqvfnsplvytirm.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/pdivxn4z1mtmix6zxlul.jpg",
      },
    },
    {
      id: "watermelon",
      name: "Watermelon",
      color: "#EF9A9A",
      emoji: "🍉",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/fqkg0cp6qemlicbvg2fo.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761983398/sng1fsx9lzm8atnwlzd9.jpg",
      },
    },
    {
      id: "banana",
      name: "Banana",
      color: "#FFF59D",
      emoji: "🍌",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/q6gsrdtbowpkwvjgaxtj.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/jnbaj6nwo2ho9mbgyuuv.jpg",
      },
    },
    {
      id: "cherry",
      name: "Cherry",
      color: "#F48FB1",
      emoji: "🍒",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984664/ol9i6rmkhkloj2di7jz4.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/kpsv6ampqddvmeq6zorj.jpg",
      },
    },
    {
      id: "cream_a",
      name: "Cream A",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/gtdwiue4xx5lekruhiac.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/tzdjw2mscgkmjqobspfw.jpg",
      },
    },
    {
      id: "cream_b",
      name: "Cream B",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/fykfkrjvfnm91nwozfzg.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/wfxjjcj0eaqyub6leetj.jpg",
      },
    },
    {
      id: "cream_c",
      name: "Cream C",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/b0ksxbp4dznysdowig3z.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984662/qysr6m2irqb3svmswcdb.jpg",
      },
    },
  ],
  illustration: [
    {
      id: "floral_jacket",
      name: "Floral jacket",
      color: "#FFE0B2",
      icon: "flower",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981187/kxqhlz190qzzyrgtdohk.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981187/hgr0cqabrjfioexq2l2k.jpg",
      },
    },
    {
      id: "pipi",
      name: "Pipi",
      color: "#C8E6C9",
      icon: "heart",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981336/dtxdbd3jzumvaxgh1wid.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981336/zamgtde7xmcinjjgedvh.jpg",
      },
    },
    {
      id: "ginger_cat",
      name: "Ginger cat",
      color: "#FFCC80",
      icon: "cat",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981513/g0hdfj1wwxea5r1ocdtz.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981513/dgqc5gegldx248rbmum1.jpg",
      },
    },
    {
      id: "variegated",
      name: "Variegated",
      color: "#C5E1A5",
      icon: "flower",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981948/cjmsadethztd3ctokxap.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981948/cycczfidxa2vqvhtzush.jpg",
      },
    },
    {
      id: "colorful",
      name: "Colorful",
      color: "#FFF9C4",
      icon: "palette",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981947/czsqduut0dgnadvrtrmw.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981947/m90x48eswnj2fe6t41sj.jpg",
      },
    },
    {
      id: "black_cloud",
      name: "Black cloud",
      color: "#CFD8DC",
      icon: "cloud",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982208/ijgxkotnqtpvudm8pjgv.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982337/dvrkeml9p9xlkvprgl1n.jpg",
      },
    },
    {
      id: "finger_held",
      name: "Finger-held",
      color: "#B3E5FC",
      icon: "hand-pointing-up",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982593/mefjt7tim4nwtmz0nqb5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982593/ytgbn7a4aaja3yxs7y2c.jpg",
      },
    },
    {
      id: "book_glued",
      name: "Book glued",
      color: "#F8BBD0",
      icon: "book-heart",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/zx7yoegpwk4qdehwpnu5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/yd6q83gjojpggcegio2c.jpg",
      },
    },
    {
      id: "read_fly",
      name: "Read fly",
      color: "#C8E6C9",
      icon: "book",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/cr3r7tmi5dp80z97jelh.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/k99ne7mqjwjhaniiohvb.jpg",
      },
    },
    {
      id: "book_wings",
      name: "Book wings",
      color: "#FFE0B2",
      icon: "book-open-variant",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/zx7yoegpwk4qdehwpnu5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/yd6q83gjojpggcegio2c.jpg",
      },
    },
  ],
  blackandwhite: [
    {
      id: "sail_ocean",
      name: "Sail the ocean",
      color: "#ECEFF1",
      icon: "sail-boat",
    },
    { id: "soar_high", name: "Soar high", color: "#F5F5F5", icon: "airplane" },
    {
      id: "brave_storms",
      name: "Brave Storms",
      color: "#E0E0E0",
      icon: "weather-lightning",
    },
    {
      id: "spring_air",
      name: "Spring in the air",
      color: "#FAFAFA",
      icon: "flower-tulip",
    },
    {
      id: "swift_rabbit",
      name: "Swift rabbit",
      color: "#EEEEEE",
      icon: "rabbit",
    },
    {
      id: "bunny_family",
      name: "Bunny family",
      color: "#F5F5F5",
      icon: "rabbit-variant",
    },
    { id: "hoppy_play", name: "Hoppy play", color: "#E0E0E0", icon: "run" },
    {
      id: "moonlit_hare",
      name: "Moonlit hare",
      color: "#263238",
      icon: "moon-waning-crescent",
    },
    { id: "cub_fishing", name: "Cub fishing", color: "#CFD8DC", icon: "fish" },
  ],
};

const PAPER_TEMPLATES = {
  base: [
    { id: "blank", name: "Blank", icon: "rectangle-outline" },
    { id: "thin_line", name: "Thin line", icon: "format-line-spacing" },
    { id: "bold_line", name: "Bold line", icon: "format-line-weight" },
    { id: "mini_check", name: "Mini check", icon: "grid" },
    { id: "mid_check", name: "Mid check", icon: "grid" },
    { id: "dot_grid", name: "Dot grid", icon: "dots-grid" },
    { id: "square_grid", name: "Square grid", icon: "grid-large" },
    { id: "hex_grid", name: "Hex grid", icon: "hexagon-outline" },
  ],
  study: [
    { id: "cornell", name: "Cornell", icon: "book-open-variant" },
    { id: "notes", name: "Notes", icon: "notebook" },
    { id: "flashcard", name: "Flashcard", icon: "card-text-outline" },
    { id: "mindmap", name: "Mind map", icon: "graph-outline" },
    { id: "outline", name: "Outline", icon: "format-list-bulleted" },
    { id: "vocab", name: "Vocabulary", icon: "book-alphabet" },
  ],
  plan: [
    { id: "weekly", name: "Weekly", icon: "calendar-week" },
    { id: "monthly", name: "Monthly", icon: "calendar-month" },
    { id: "daily", name: "Daily", icon: "calendar-today" },
    { id: "todo", name: "To-do list", icon: "checkbox-marked-outline" },
    { id: "habit", name: "Habit tracker", icon: "chart-timeline-variant" },
    { id: "goal", name: "Goal setting", icon: "target" },
  ],
  work: [
    { id: "meeting", name: "Meeting", icon: "account-group" },
    { id: "project", name: "Project", icon: "briefcase-outline" },
    { id: "brainstorm", name: "Brainstorm", icon: "lightbulb-outline" },
    { id: "kanban", name: "Kanban", icon: "view-column" },
  ],
  life: [
    { id: "journal", name: "Journal", icon: "book-open-page-variant" },
    { id: "diary", name: "Diary", icon: "book-heart" },
    { id: "gratitude", name: "Gratitude", icon: "heart-outline" },
    { id: "budget", name: "Budget", icon: "currency-usd" },
  ],
};

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

  const [selectedCover, setSelectedCover] = useState("label");
  const [coverColor, setCoverColor] = useState("#E3F2FD");
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  // Update cover image when orientation changes
  React.useEffect(() => {
    const selectedTemplate = Object.values(COVER_TEMPLATES)
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
  }, [orientation, selectedCover]);

  const [selectedPaper, setSelectedPaper] = useState("blank");

  const handleCreate = async () => {
    // Validate input
    if (!noteTitle.trim()) {
      Alert.alert("Error", "Please enter a note title");
      return;
    }

    setIsCreating(true);

    try {
      // Get the selected template to determine final imageUrl based on orientation
      const selectedTemplate = Object.values(COVER_TEMPLATES)
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

      // Create project via API
      const projectData = {
        name: noteTitle.trim(),
        description: noteDescription.trim() || "",
        imageUrl: finalImageUrl || "",
      };

      // console.log("📝 Creating project with data:", projectData);
      const createdProject = await projectService.createProject(projectData);
      //console.log("✅ Project created:", createdProject);

      // Get the project ID (backend trả về projectId)
      const projectId =
        createdProject?.projectId || createdProject?.id || createdProject?._id;

      if (!projectId) {
        throw new Error("Không nhận được projectId từ server");
      }

      // Không gọi lại GET khi vừa tạo để tránh lỗi ID undefined; dùng dữ liệu trả về trực tiếp
      const projectDetails = createdProject;

      // Không tạo page ngay; để người dùng vào vẽ rồi bấm Save mới presign + tạo page
      const initialPages = [];

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
        paper: { template: selectedPaper },
        pages: initialPages, // Chưa có page nào cho tới khi Save
        projectDetails: projectDetails, // Include full project details (từ response tạo project)
      };

      setIsCreating(false);
      //   console.log("🚀 Navigating to DrawingScreen with config:", noteConfig);
      navigation.navigate("DrawingScreen", { noteConfig });
    } catch (error) {
      setIsCreating(false);
      // console.error("❌ Failed to create project:", error);
      Alert.alert(
        "Error",
        "Failed to create project. Please try again.\n" +
          (error.message || "Unknown error"),
      );
    }
  };

  const scrollToCategory = (category) => {
    const yOffset = categoryRefs.current[category];
    if (yOffset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  const templates = selectedTab === "cover" ? COVER_TEMPLATES : PAPER_TEMPLATES;
  const categories = Object.keys(templates);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create note</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
          <LinearGradient
            colors={
              isCreating ? ["#94a3b8", "#64748b"] : ["#3b82f6", "#2563eb"]
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
                <View style={styles.previewBox}>
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
                  style={[styles.previewBox, { backgroundColor: "#FFFFFF" }]}
                >
                  <View style={styles.previewLines}>
                    <View style={styles.previewLine} />
                    <View style={styles.previewLine} />
                    <View style={styles.previewLine} />
                  </View>
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

            {/* Format Dropdown */}
            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Format</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowFormatDropdown(!showFormatDropdown)}
              >
                <Text style={styles.dropdownText}>
                  {ORIENTATIONS.find((o) => o.id === orientation)?.label}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
              {showFormatDropdown && (
                <View style={styles.dropdownMenu}>
                  {ORIENTATIONS.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setOrientation(item.id);
                        setShowFormatDropdown(false);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={18}
                        color="#64748b"
                      />
                      <Text style={styles.dropdownItemText}>{item.label}</Text>
                      {orientation === item.id && (
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="#3b82f6"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
                            <Image
                              source={{ uri: imageUrlToShow }}
                              style={styles.coverTemplatePreview}
                              resizeMode="cover"
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
                        selectedPaper === template.id &&
                          styles.templateCardActive,
                      ]}
                      onPress={() => setSelectedPaper(template.id)}
                    >
                      <View style={styles.paperTemplatePreview}>
                        <MaterialCommunityIcons
                          name={template.icon}
                          size={32}
                          color="#94a3b8"
                        />
                      </View>
                      <Text style={styles.templateName}>{template.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2FE",
  },
  cancelButton: {
    fontSize: 16,
    color: "#64748b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
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
    left: 0,
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
    backgroundColor: "#3b82f6",
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
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
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
    width: "31%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
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
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  templateName: {
    fontSize: 12,
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
    width: 120,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  coverTemplateCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  coverTemplatePreview: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
});
