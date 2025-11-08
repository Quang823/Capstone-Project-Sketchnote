import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { blogService } from "../../service/blogService";

const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlogDetail = async () => {
    try {
      const response = await blogService.getBlogById(blogId);
      const blogData = response.result;

      if (blogData) {
        setBlog({
          id: blogData.id,
          title: blogData.title,
          author: blogData.authorDisplay || "Ẩn danh",
          authorId: blogData.authorId,
          summary: blogData.summary,
          imageUrl: blogData.imageUrl,
          createdAt: blogData.createdAt,
          updatedAt: blogData.updatedAt,
          contents: blogData.contents || [],
        });
      } else {
        Alert.alert("Lỗi", "Không tìm thấy bài viết");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching blog detail:", error);
      Alert.alert("Lỗi", "Không thể tải chi tiết bài viết");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetail();
  }, [blogId]);

  if (loading) {
    return (
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Đang tải bài viết...
        </Text>
      </LinearGradient>
    );
  }

  if (!blog) {
    return (
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Icon name="error-outline" size={48} color="#EF4444" />
        <Text style={{ marginTop: 10, color: "#6B7280", fontSize: 16 }}>
          Không tìm thấy bài viết
        </Text>
        <Pressable
          style={{
            marginTop: 20,
            backgroundColor: "#3B82F6",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
            Quay lại
          </Text>
        </Pressable>
      </LinearGradient>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Hero Image với Header Overlay */}
      <View style={{ position: "relative" }}>
        {blog.imageUrl && (
          <>
           <Image
  source={{ uri: blog.imageUrl }}
  style={{
    width: width * 0.9,       // nhỏ lại 90% chiều rộng màn hình
    height: 250,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 16,
    resizeMode: "cover",
  }}
/>

            {/* Dark Gradient Overlay */}
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.8)"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </>
        )}

        {/* Header Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 50,
            left: 16,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>

        {/* Title Overlay on Image */}
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: "#FFFFFF",
              lineHeight: 36,
              textShadowColor: "rgba(0, 0, 0, 0.75)",
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 4,
            }}
          >
            {blog.title}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Content Container */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {/* Author Info Card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 16,
              paddingHorizontal: 16,
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#DBEAFE",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Icon name="person" size={26} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginBottom: 3,
                }}
              >
                {blog.author}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="schedule" size={14} color="#9CA3AF" />
                <Text style={{ fontSize: 13, color: "#6B7280", marginLeft: 4 }}>
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "Chưa có ngày"}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Box */}
          {blog.summary && (
            <View
              style={{
                backgroundColor: "#FEF3C7",
                padding: 18,
                borderRadius: 16,
                marginBottom: 28,
                borderLeftWidth: 5,
                borderLeftColor: "#F59E0B",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Icon name="lightbulb" size={20} color="#D97706" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#92400E",
                    marginLeft: 6,
                  }}
                >
                  TÓM TẮT
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: "#78350F",
                  lineHeight: 24,
                }}
              >
                {blog.summary}
              </Text>
            </View>
          )}

          {/* Content Sections */}
          {blog.contents.map((section, index) => (
            <View key={section.id || index} style={{ marginBottom: 32 }}>
              {/* Section Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 28,
                    backgroundColor: "#3B82F6",
                    borderRadius: 3,
                    marginRight: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#111827",
                    flex: 1,
                  }}
                >
                  {section.sectionTitle}
                </Text>
              </View>

              {/* Section Image */}
              {section.contentUrl && (
                <View
                  style={{
                    marginBottom: 16,
                    borderRadius: 16,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                 <Image
  source={{ uri: section.contentUrl }}
  style={{
    width: width * 0.85,       // chỉ chiếm 85% màn hình
    height: 180,
    borderRadius: 16,
    alignSelf: "center",
    resizeMode: "cover",
  }}
/>

                </View>
              )}

              {/* Section Text */}
              <Text
                style={{
                  fontSize: 16,
                  color: "#374151",
                  lineHeight: 28,
                  textAlign: "justify",
                  letterSpacing: 0.3,
                }}
              >
                {section.content}
              </Text>
            </View>
          ))}

          {/* End Marker */}
          <View
            style={{
              marginTop: 16,
              paddingTop: 24,
              paddingBottom: 12,
              borderTopWidth: 2,
              borderTopColor: "#E5E7EB",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#D1D5DB",
                  marginRight: 12,
                }}
              />
              <Icon name="check-circle" size={24} color="#10B981" />
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#D1D5DB",
                  marginLeft: 12,
                }}
              />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#9CA3AF",
                fontWeight: "500",
              }}
            >
              Hết bài viết
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}