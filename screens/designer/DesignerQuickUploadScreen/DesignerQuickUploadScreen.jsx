import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
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
  const [releaseDate, setReleaseDate] = useState("");
  const [expiredTime, setExpiredTime] = useState("");
  const [images, setImages] = useState([]);
  const [itemUrls, setItemUrls] = useState([""]); // Array of text URLs
  const [isUploading, setIsUploading] = useState(false);

  // ====== PERMISSION ======
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
  }, []);

  // ====== DEBUG: Log images state ======
  useEffect(() => {
    console.log("🖼️ Images state updated:", images);
  }, [images]);

  // ====== HANDLE IMAGE UPLOADED ======
  const handleImageUploaded = (url) => {
    console.log("📸 Received image URL:", url);
    setImages((prev) => {
      const updated = [...prev, url];
      console.log("✅ Updated images array:", updated);
      return updated;
    });
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
    // Validation
    if (
      !name.trim() ||
      !description.trim() ||
      !type.trim() ||
      !price ||
      !releaseDate ||
      !expiredTime ||
      images.length === 0
    ) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please fill in all required fields.",
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

      // Filter out empty item URLs
      const validItemUrls = itemUrls.filter((url) => url.trim() !== "");

      const template = {
        name,
        description,
        type: formattedType,
        price: Number(price),
        releaseDate,
        expiredTime,
        images: formattedImages,
        items: validItemUrls.map((url, idx) => ({
          itemIndex: idx + 1,
          itemUrl: url.trim(),
        })),
      };

      console.log("📦 Sending to backend:", template);
      await resourceService.uploadResource(template);

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
        <Text style={designerQuickUploadStyles.headerTitle}>Upload Template</Text>
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

      <ScrollView style={designerQuickUploadStyles.content} showsVerticalScrollIndicator={false}>
        {/* Template Name */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>Template Name *</Text>
          <TextInput
            style={designerQuickUploadStyles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter template name..."
          />
        </View>

        {/* Description */}
        <View style={designerQuickUploadStyles.inputContainer}>
          <Text style={designerQuickUploadStyles.inputLabel}>Description *</Text>
          <TextInput
            style={[designerQuickUploadStyles.textInput, designerQuickUploadStyles.textArea]}
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
          <Text style={designerQuickUploadStyles.inputLabel}>Price (VND) *</Text>
          <TextInput
            style={designerQuickUploadStyles.textInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="Enter price..."
          />
        </View>

        {/* Release & Expire Dates */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <View style={[designerQuickUploadStyles.inputContainer, { flex: 1 }]}>
            <Text style={designerQuickUploadStyles.inputLabel}>Release Date *</Text>
            <TextInput
              style={designerQuickUploadStyles.textInput}
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={[designerQuickUploadStyles.inputContainer, { flex: 1 }]}>
            <Text style={designerQuickUploadStyles.inputLabel}>Expired Date *</Text>
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
          <Text style={designerQuickUploadStyles.sectionTitle}>Images * ({images.length})</Text>
          <MultipleImageUploader
            onImageUploaded={handleImageUploaded}
            maxImages={10}
          />
        </View>

        {/* Item URLs Section - Text Input */}
        <View style={designerQuickUploadStyles.itemsSection}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={designerQuickUploadStyles.sectionTitle}>Item URLs (Optional)</Text>
            <Pressable
              onPress={addItemUrl}
              style={{
                backgroundColor: "#10B981",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon name="add" size={16} color="#fff" />
              <Text style={{ color: "#fff", marginLeft: 4, fontSize: 14 }}>Add URL</Text>
            </Pressable>
          </View>

          {itemUrls.map((url, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                gap: 8,
              }}
            >
              <TextInput
                style={[
                  designerQuickUploadStyles.textInput,
                  { flex: 1, marginBottom: 0 },
                ]}
                value={url}
                onChangeText={(text) => updateItemUrl(index, text)}
                placeholder={`Item URL ${index + 1}`}
              />
              {itemUrls.length > 1 && (
                <Pressable
                  onPress={() => removeItemUrl(index)}
                  style={{
                    backgroundColor: "#EF4444",
                    padding: 8,
                    borderRadius: 6,
                  }}
                >
                  <Icon name="delete" size={20} color="#fff" />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Upload Button */}
        <Pressable
          style={[
            designerQuickUploadStyles.uploadButtonContainer,
            isUploading && designerQuickUploadStyles.uploadButtonContainerDisabled,
          ]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <LinearGradient
            colors={isUploading ? ["#9CA3AF", "#6B7280"] : ["#10B981", "#059669"]}
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