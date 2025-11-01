import React, { useState } from "react";
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

export default function MultipleImageUploader({ onImageUploaded, maxImages = 10 }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
    } catch (error) {
     
    }
  };

  const handleUpload = async (uri) => {
    try {
      setUploading(true);
     
      
      const uploaded = await uploadToCloudinary(uri);
      
      if (uploaded?.secure_url) {
     
        
        // Thêm vào state local
        setImages((prev) => [...prev, uploaded.secure_url]);
        
        // Gọi callback để parent component biết
        if (onImageUploaded && typeof onImageUploaded === 'function') {
         
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
      console.error("❌ Upload error:", error);
      Alert.alert("Lỗi", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa ảnh này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            setImages((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  return (
    <View>
      {/* Nút Thêm Ảnh - Nhỏ gọn giống Add URL */}
      <Pressable
        onPress={pickImage}
        disabled={uploading || images.length >= maxImages}
        style={{
          backgroundColor: images.length >= maxImages ? "#9CA3AF" : "#4F46E5",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          opacity: (uploading || images.length >= maxImages) ? 0.6 : 1,
        }}
      >
        <Icon name="add-photo-alternate" size={16} color="#fff" />
        <Text style={{ color: "#fff", marginLeft: 6, fontSize: 14, fontWeight: "500" }}>
          Thêm ảnh ({images.length}/{maxImages})
        </Text>
      </Pressable>

      {/* Loading Indicator */}
      {uploading && (
        <View style={{ marginTop: 12, alignItems: "center" }}>
          <ActivityIndicator size="small" color="#4F46E5" />
          <Text style={{ marginTop: 6, color: "#666", fontSize: 12 }}>Đang upload...</Text>
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
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    borderWidth: index === 0 ? 3 : 1,
                    borderColor: index === 0 ? "#10B981" : "#ccc",
                  }}
                />
                
                {/* Thumbnail Badge */}
                {index === 0 && (
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