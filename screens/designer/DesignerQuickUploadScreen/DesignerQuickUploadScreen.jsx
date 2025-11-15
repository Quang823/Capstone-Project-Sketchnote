import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Image 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { designerQuickUploadStyles } from "./DesignerQuickUploadScreen.styles";
import { resourceService } from "../../../service/resourceService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerQuickUploadScreen() {
  const navigation = useNavigation();

  // ====== STATE ======
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OTHER");
  const [price, setPrice] = useState("");

  const [expiredTime, setExpiredTime] = useState("");
  const [images, setImages] = useState([]);
  const [itemUrls, setItemUrls] = useState([""]); // Array of text URLs
  const [isUploading, setIsUploading] = useState(false);
const [itemSource, setItemSource] = useState("upload"); // or "project"
const [localItems, setLocalItems] = useState([]);
const [projects, setProjects] = useState([]);
const [selectedProjectId, setSelectedProjectId] = useState(null);
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  const seconds = String(today.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

  const [releaseDate, setReleaseDate] = useState(getToday());
  // ====== PERMISSION ======
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

  // ====== HANDLE IMAGE UPLOADED ======
  const handleImageUploaded = (url) => {
    setImages((prev) => {
      const updated = [...prev, url];
      return updated;
    });
  };
  const getProjectByUserId = async () => {
    try {
      const response = await resourceService.getProjectByUserId();
     setProjects(response.projects);
    } catch (error) {
      console.error("Error fetching project by user ID:", error);
      throw error;
    }
  };
  // ====== HANDLE ITEM URL CHANGE ======
  const updateItemUrl = (index, value) => {
    const updated = [...itemUrls];
    updated[index] = value;
    setItemUrls(updated);
  };

  const addItemUrl = () => {
    setItemUrls([...itemUrls, ""]);
  };

  const removeItemUrl = (index) => {
    setItemUrls(itemUrls.filter((_, i) => i !== index));
  };

  
// ====== HANDLE UPLOAD ======
const handleUpload = async () => {
  // Shared validation
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

  // Only validate banner images when uploading locally
  if (itemSource === "upload" && images.length === 0) {
    Toast.show({
      type: "error",
      text1: "Missing images",
      text2: "Please upload at least one banner image.",
    });
    return;
  }

  // Source-specific validation
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

    // Uploading directly from local files -> call uploadResource
    if (itemSource === "upload") {
      const template = {
        name,
        description,
        type: formattedType,
        price: Number(price),
        releaseDate,
        expiredTime,
        images: formattedImages,
        items: localItems.map((url, idx) => ({
          itemIndex: idx + 1,
          itemUrl: url,
        })),
      };

      await resourceService.uploadResource(template);
    } 
    // Selecting from existing project -> call uploadTemplate
    else if (itemSource === "project") {
      // Get selected project info
      const selectedProject = projects.find(
        (p) => p.projectId === selectedProjectId
      );

      // Request payload for uploadTemplate - reuse project image
      const templateData = {
        name,
        description,
        type: formattedType,
        price: Number(price),
        expiredTime: new Date(expiredTime).toISOString(), // Format thành ISO 8601
        images: [
          {
            imageUrl: selectedProject?.imageUrl,
            isThumbnail: true,
          }
        ],
      };

      // console.log('📤 Uploading template with project:', selectedProjectId);
      // console.log('📦 Data:', JSON.stringify(templateData, null, 2));
      
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

  // ====== UI ======
  return (
    <View style={designerQuickUploadStyles.container}>
      <View style={designerQuickUploadStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={designerQuickUploadStyles.headerTitle}>
          Upload Template
        </Text>
        <Pressable onPress={handleUpload} disabled={isUploading}>
          <Text
            style={[
              designerQuickUploadStyles.uploadButton,
              isUploading && designerQuickUploadStyles.uploadButtonDisabled,
            ]}
          >
            {isUploading ? "Uploading..." : "Submit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={designerQuickUploadStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Template Name */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>
            Template Name *
          </Text>
          <TextInput
            style={designerQuickUploadStyles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter template name..."
          />
        </View>

        {/* Description */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>
            Description *
          </Text>
          <TextInput
            style={[
              designerQuickUploadStyles.textInput,
              designerQuickUploadStyles.textArea,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            multiline
          />
        </View>

        {/* Type */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>Type *</Text>
          <TextInput
            style={designerQuickUploadStyles.textInput}
            value={type}
            onChangeText={setType}
            placeholder="OTHER / DOCUMENT / VIDEO"
          />
        </View>

        {/* Price */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>
            Price (VND) *
          </Text>
          <TextInput
            style={designerQuickUploadStyles.textInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="Enter price..."
          />
        </View>

        {/* Release & Expire Dates */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <View style={[designerQuickUploadStyles.inputContainer, { flex: 1 }]}>
            <Text style={designerQuickUploadStyles.inputLabel}>
              Release Date *
            </Text>
            <TextInput
              style={designerQuickUploadStyles.textInput}
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={[designerQuickUploadStyles.inputContainer, { flex: 1 }]}>
            <Text style={designerQuickUploadStyles.inputLabel}>
              Expired Date *
            </Text>
            <TextInput
              style={designerQuickUploadStyles.textInput}
              value={expiredTime}
              onChangeText={setExpiredTime}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        {/* Images Section */}
        <View style={designerQuickUploadStyles.imageUploadSection}>
          <Text style={designerQuickUploadStyles.sectionTitle}>
            Banner * ({images.length})

          </Text>
          <MultipleImageUploader
            onImageUploaded={handleImageUploaded}
            maxImages={10}
          />
        </View>

        {/* Item URLs Section - Text Input */}
        {/* Item Section */}
<View style={designerQuickUploadStyles.itemsSection}>
  <Text style={designerQuickUploadStyles.sectionTitle}>
    Item Upload *
  </Text>

  {/* Choose item source: upload or project */}
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 8,
    }}
  >
    <Pressable
      onPress={() => setItemSource("upload")}
      style={{
        flex: 1,
        backgroundColor: itemSource === "upload" ? "#10B981" : "#E5E7EB",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: itemSource === "upload" ? "#fff" : "#111827",
          fontWeight: "500",
        }}
      >
        Upload from device
      </Text>
    </Pressable>

    <Pressable
      onPress={() => setItemSource("project")}
      style={{
        flex: 1,
        backgroundColor: itemSource === "project" ? "#10B981" : "#E5E7EB",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: itemSource === "project" ? "#fff" : "#111827",
          fontWeight: "500",
        }}
      >
        Select from project
      </Text>
    </Pressable>
  </View>

  {/* If the user chooses “Upload from device” */}
  {itemSource === "upload" && (
    <View style={{ marginTop: 15 }}>
      <Text style={designerQuickUploadStyles.sectionTitle}>
        Upload item images ({localItems.length})
      </Text>
      <MultipleImageUploader
        onImageUploaded={(url) =>
          setLocalItems((prev) => [...prev, url])
        }
        maxImages={10}
      />
    </View>
  )}

  {/* If the user chooses “Project” */}
  {itemSource === "project" && (
    <View style={{ marginTop: 15 }}>
      <Text style={designerQuickUploadStyles.sectionTitle}>
        Select project ({projects.length})
      </Text>

      {projects.length === 0 ? (
        <Text style={{ color: "#6B7280", marginTop: 8 }}>
          No projects available.
        </Text>
      ) : (
        projects.map((proj) => (
          <Pressable
            key={proj.projectId}
            onPress={() => setSelectedProjectId(proj.projectId)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              marginVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor:
                selectedProjectId === proj.projectId
                  ? "#10B981"
                  : "#E5E7EB",
              backgroundColor:
                selectedProjectId === proj.projectId
                  ? "#D1FAE5"
                  : "#F9FAFB",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
  {/* Ảnh project */}
  <Image
    source={{ uri: proj.imageUrl }}
    style={{
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 10,
      backgroundColor: "#f3f4f6", // fallback khi chưa có ảnh
    }}
  />

  {/* Thông tin project */}
  <View style={{ flex: 1 }}>
    <Text style={{ fontWeight: "600", color: "#111827" }}>
      {proj.name}
    </Text>
    <Text
      style={{
        color: "#6B7280",
        fontSize: 13,
        marginTop: 2,
      }}
    >
      {proj.description}
    </Text>
  </View>
</View>

          </Pressable>
        ))
      )}
    </View>
  )}
</View>


        {/* Upload Button */}
        <Pressable
          style={[
            designerQuickUploadStyles.uploadButtonContainer,
            isUploading &&
              designerQuickUploadStyles.uploadButtonContainerDisabled,
          ]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <LinearGradient
            colors={
              isUploading ? ["#9CA3AF", "#6B7280"] : ["#10B981", "#059669"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={designerQuickUploadStyles.uploadButtonGradient}
          >
            <Icon name="cloud-upload" size={24} color="#FFFFFF" />
            <Text style={designerQuickUploadStyles.uploadButtonText}>
              {isUploading ? "Uploading..." : "Upload Template"}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {/* Toast Component */}
      <Toast />
    </View>
  );
}
