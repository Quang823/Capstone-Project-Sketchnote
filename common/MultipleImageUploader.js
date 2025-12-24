import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  Alert,
  Text,
  Pressable,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../service/cloudinary";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

export default function MultipleImageUploader({
  onImageUploaded,
  maxImages = 10,
  initialImages = [],
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);

  // Sync with initialImages only when it has actual content
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const pickImage = async () => {
    try {
      // Kiểm tra số lượng ảnh tối đa
      if (images.length >= maxImages) {
        Toast.show({
          type: "error",
          text1: "Limit",
          text2: `You can upload up to ${maxImages} images`,
        });
        return;
      }

      // Xin quyền truy cập
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Need Permission",
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
    } catch (error) { }
  };

  const handleUpload = async (uri) => {
    try {
      setUploading(true);

      const uploaded = await uploadToCloudinary(uri);

      if (uploaded?.secure_url) {
        // Thêm vào state local
        setImages((prev) => [...prev, uploaded.secure_url]);

        // Gọi callback để parent component biết
        if (onImageUploaded && typeof onImageUploaded === "function") {
          onImageUploaded(uploaded.secure_url);
        }

        Toast.show({
          type: "success",
          text1: "Upload success",
        });
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      console.warn("❌ Upload error:", error);
      Alert.alert("Error", error.message || "Cannot upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    Alert.alert("Confirm", "Are you sure you want to delete this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setImages((prev) => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  return (
    <View>
      {/* Nút Thêm Ảnh - Nhỏ gọn giống Add URL */}
      <Pressable
        onPress={pickImage}
        disabled={uploading || images.length >= maxImages}
        style={{
          backgroundColor: images.length >= maxImages ? "#9CA3AF" : "#084F8C",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          opacity: uploading || images.length >= maxImages ? 0.6 : 1,
          shadowColor: "#084F8C",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.22,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Icon name="add-photo-alternate" size={16} color="#fff" />
        <Text
          style={{
            color: "#fff",
            marginLeft: 6,
            fontSize: 14,
            fontWeight: "500",
          }}
        >
          Add Image ({images.length}/{maxImages})
        </Text>
      </Pressable>

      {/* Loading Indicator */}
      {uploading && (
        <View style={{ marginTop: 12, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#084F8C" />
          <Text style={{ marginTop: 6, color: "#666", fontSize: 12 }}>
            Uploading...
          </Text>
        </View>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 12 }}
          >
            {images.map((uri, index) => (
              <View
                key={index}
                style={{
                  marginRight: 10,
                  position: "relative",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    borderWidth: index === 0 ? 3 : 1,
                    borderColor: index === 0 ? "#084F8C" : "#E2E8F0",
                  }}
                />

                {/* Thumbnail Badge */}
                {index === 0 && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 5,
                      left: 5,
                      backgroundColor: "#084F8C",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      Thumbnail
                    </Text>
                  </View>
                )}

                {/* Remove Button */}
                <Pressable
                  onPress={() => removeImage(index)}
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
            ))}
          </ScrollView>

          {/* Helper Text */}
          <Text style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            The first image will be the thumbnail
          </Text>
        </>
      )}
    </View>
  );
}
