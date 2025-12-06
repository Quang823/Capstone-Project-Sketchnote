import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Alert,
  Text,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../service/cloudinary";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

export default function ImageUploader({ onUploaded, existingImage }) {
  const [imageUri, setImageUri] = useState(existingImage || null);
  const [uploading, setUploading] = useState(false);

  // Update imageUri when existingImage changes
  useEffect(() => {
    if (existingImage) {
      setImageUri(existingImage);
    }
  }, [existingImage]);

  const pickImage = async () => {
    try {
      // Xin quyền truy cập
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Need Permission",
          text2: "Please allow access to photo library",
        });
        return;
      }

      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const selectedUri = result.assets[0].uri;
      await handleUpload(selectedUri);
    } catch (error) {
      console.error("❌ Pick image error:", error);
      Alert.alert("Error", "Cannot select image");
    }
  };

  const handleUpload = async (uri) => {
    try {
      setUploading(true);

      const uploaded = await uploadToCloudinary(uri);

      if (uploaded?.secure_url) {
        // Cập nhật state local
        setImageUri(uploaded.secure_url);

        // Gọi callback để parent component biết
        if (onUploaded && typeof onUploaded === 'function') {
          onUploaded(uploaded.secure_url);
        }

        Toast.show({
          type: "success",
          text1: "Upload success",
          text2: "Image uploaded successfully",
        });
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Error", error.message || "Cannot upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      "Confirm",
      "Do you want to remove this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setImageUri(null);
            if (onUploaded && typeof onUploaded === 'function') {
              onUploaded(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Nút Thêm/Đổi Ảnh - Nhỏ gọn giống MultipleImageUploader */}
      <Pressable
        onPress={pickImage}
        disabled={uploading}
        style={{
          backgroundColor: "#084F8C",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <Icon name={imageUri ? "edit" : "add-photo-alternate"} size={16} color="#fff" />
        <Text style={{ color: "#fff", marginLeft: 6, fontSize: 14, fontWeight: "500" }}>
          {imageUri ? "Change image" : "Add image"}
        </Text>
      </Pressable>

      {/* Loading Indicator */}
      {uploading && (
        <View style={{ marginTop: 12, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#084F8C" />
          <Text style={{ marginTop: 6, color: "#666", fontSize: 12 }}>Uploading...</Text>
        </View>
      )}

      {/* Image Preview */}
      {imageUri && !uploading && (
        <View style={{ marginTop: 12 }}>
          <View
            style={{
              position: "relative",
              alignSelf: "flex-start",
            }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 8,
                borderWidth: 3,
                borderColor: "#10B981",
              }}
            />

            {/* Thumbnail Badge */}
            <View
              style={{
                position: "absolute",
                bottom: 5,
                left: 5,
                backgroundColor: "#10B981",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                Thumbnail
              </Text>
            </View>

            {/* Remove Button */}
            <Pressable
              onPress={removeImage}
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                backgroundColor: "#EF4444",
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Icon name="close" size={16} color="#fff" />
            </Pressable>
          </View>

          {/* Helper Text */}
          <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            This image will be the thumbnail
          </Text>
        </View>
      )}
    </View>
  );
}