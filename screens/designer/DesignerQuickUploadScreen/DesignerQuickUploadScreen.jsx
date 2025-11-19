// DesignerQuickUploadScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { styles } from "./DesignerQuickUploadScreen.styles";
import { resourceService } from "../../../service/resourceService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerQuickUploadScreen() {
  const navigation = useNavigation();

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("OTHER");
  const [price, setPrice] = useState("");
  const [expiredTime, setExpiredTime] = useState("");
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
const [releaseDateISO, setReleaseDateISO] = useState(new Date().toISOString());


  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

  const handleUpload = async () => {
    if (!name.trim() || !description.trim() || !type.trim() || !price || !expiredTime) {
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
      } else if (itemSource === "project") {
        const selectedProject = projects.find((p) => p.projectId === selectedProjectId);
        const templateData = {
          name,
          description,
          type: formattedType,
          price: Number(price),
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
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Template</Text>
        <Pressable 
          onPress={handleUpload} 
          disabled={isUploading}
          style={styles.headerButton}
        >
          <Text style={[styles.submitText, isUploading && styles.submitTextDisabled]}>
            {isUploading ? "..." : "Submit"}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Template Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter template name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Type *</Text>
              <TextInput
                style={styles.input}
                value={type}
                onChangeText={setType}
                placeholder="OTHER"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Price (VND) *</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Release Date *</Text>
              <TextInput
  style={styles.input}
  value={releaseDate}          
  onChangeText={(val) => {
    setReleaseDate(val);

    // Convert sang ISO có giờ giữ nguyên
    const iso = new Date(val + "T00:00:00").toISOString();
    setReleaseDateISO(iso);
  }}
  placeholder="YYYY-MM-DD"
  placeholderTextColor="#9CA3AF"
/>

            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Expired Date *</Text>
              <TextInput
                style={styles.input}
                value={expiredTime}
                onChangeText={setExpiredTime}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Banner Images Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Banner Images *</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{images.length}</Text>
            </View>
          </View>
          <MultipleImageUploader onImageUploaded={handleImageUploaded} maxImages={10} />
        </View>

        {/* Item Source Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Item Source *</Text>
          
          <View style={styles.sourceToggle}>
            <Pressable
              onPress={() => setItemSource("upload")}
              style={[
                styles.sourceButton,
                itemSource === "upload" && styles.sourceButtonActive,
              ]}
            >
              <Icon 
                name="upload-file" 
                size={18} 
                color={itemSource === "upload" ? "#FFFFFF" : "#6B7280"} 
              />
              <Text
                style={[
                  styles.sourceButtonText,
                  itemSource === "upload" && styles.sourceButtonTextActive,
                ]}
              >
                Upload from device
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setItemSource("project")}
              style={[
                styles.sourceButton,
                itemSource === "project" && styles.sourceButtonActive,
              ]}
            >
              <Icon 
                name="folder" 
                size={18} 
                color={itemSource === "project" ? "#FFFFFF" : "#6B7280"} 
              />
              <Text
                style={[
                  styles.sourceButtonText,
                  itemSource === "project" && styles.sourceButtonTextActive,
                ]}
              >
                Select from project
              </Text>
            </Pressable>
          </View>

          {/* Upload from device */}
          {itemSource === "upload" && (
            <View style={styles.sourceContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Item Images</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{localItems.length}</Text>
                </View>
              </View>
              <MultipleImageUploader
                onImageUploaded={(url) => setLocalItems((prev) => [...prev, url])}
                maxImages={10}
              />
            </View>
          )}

          {/* Select from project */}
          {itemSource === "project" && (
            <View style={styles.sourceContent}>
              <Text style={styles.sectionTitle}>
                Available Projects ({projects.length})
              </Text>

              {projects.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="folder-open" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No projects available</Text>
                </View>
              ) : (
                projects.map((proj) => (
                  <Pressable
                    key={proj.projectId}
                    onPress={() => setSelectedProjectId(proj.projectId)}
                    style={[
                      styles.projectCard,
                      selectedProjectId === proj.projectId && styles.projectCardActive,
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
                      <View style={styles.checkIcon}>
                        <Icon name="check-circle" size={24} color="#10B981" />
                      </View>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, isUploading && styles.submitButtonDisabled]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Icon name="cloud-upload" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {isUploading ? "Uploading..." : "Upload Template"}
          </Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast />
    </View>
  );
}