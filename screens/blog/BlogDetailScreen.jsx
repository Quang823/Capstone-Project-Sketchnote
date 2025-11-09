import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { blogService } from "../../service/blogService";


const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const contentMaxWidth = isTablet ? 1000 : windowWidth;

  // 🧩 Gọi API thật
  const fetchBlogDetail = async () => {
    try {
      const response = await blogService.getBlogById(blogId);
      const blogData = response?.result;

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ marginTop: 16, color: "#64748B", fontSize: 16, fontWeight: "600" }}>
          Đang tải bài viết...
        </Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>Không tìm thấy bài viết</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={{ backgroundColor: "#FFFFFF", paddingBottom: 32 }}>
          {/* Header Image */}
          {blog.imageUrl && (
            <Image
              source={{ uri: blog.imageUrl }}
              style={{
                width: "100%",
                height: isTablet ? 350 : 200,
                resizeMode: "cover",
              }}
            />
          )}

          {/* Title + Author */}
          <View
            style={{
              maxWidth: contentMaxWidth,
              alignSelf: "center",
              width: "100%",
              paddingHorizontal: isTablet ? 40 : 20,
              paddingTop: 32,
            }}
          >
            <Text
              style={{
                fontSize: isTablet ? 36 : 28,
                fontWeight: "700",
                color: "#1E293B",
                lineHeight: isTablet ? 44 : 36,
                marginBottom: 20,
                letterSpacing: -0.5,
              }}
            >
              {blog.title}
            </Text>

            {/* Author Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginBottom: 28,
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
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginBottom: 4,
                  }}
                >
                  {blog.author}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "500" }}>
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            {/* Summary */}
            {blog.summary && (
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 40,
                  borderLeftWidth: 4,
                  borderLeftColor: "#60A5FA",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>💡</Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1E40AF",
                    }}
                  >
                    TÓM TẮT
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#1E293B",
                    lineHeight: 24,
                    fontWeight: "500",
                  }}
                >
                  {blog.summary}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Nội dung bài viết */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: isTablet ? 40 : 20,
            paddingVertical: 20,
          }}
        >
          {blog.contents.map((section, index) => {
            const isEven = index % 2 === 0;
            const showImageLeft = isTablet && isEven;
            const showImageRight = isTablet && !isEven;

            return (
              <View
                key={section.id || index}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: isTablet ? 32 : 20,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  <View
                    style={{
                      width: 5,
                      height: 28,
                      backgroundColor: "#60A5FA",
                      borderRadius: 3,
                      marginRight: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isTablet ? 24 : 20,
                      fontWeight: "700",
                      color: "#1E293B",
                      flex: 1,
                      letterSpacing: -0.5,
                    }}
                  >
                    {section.sectionTitle}
                  </Text>
                </View>

                {isTablet ? (
                  <View style={{ flexDirection: showImageLeft ? "row" : "row-reverse", gap: 32 }}>
                    {section.contentUrl && (
                      <View style={{ width: "45%" }}>
                        <Image
                          source={{ uri: section.contentUrl }}
                          style={{
                            width: "100%",
                            height: 280,
                            borderRadius: 12,
                            resizeMode: "cover",
                          }}
                        />
                      </View>
                    )}
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#475569",
                          lineHeight: 28,
                          textAlign: "justify",
                          fontWeight: "500",
                        }}
                      >
                        {section.content}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {section.contentUrl && (
                      <Image
                        source={{ uri: section.contentUrl }}
                        style={{
                          width: "100%",
                          height: 200,
                          borderRadius: 12,
                          marginBottom: 16,
                          resizeMode: "cover",
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#475569",
                        lineHeight: 28,
                        textAlign: "justify",
                        fontWeight: "500",
                      }}
                    >
                      {section.content}
                    </Text>
                  </>
                )}
              </View>
            );
          })}

          {/* End marker */}
          <View
            style={{
              marginTop: 20,
              marginBottom: 40,
              paddingTop: 24,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 40, height: 1, backgroundColor: "#CBD5E1", marginRight: 12 }} />
              <Text style={{ fontSize: 24 }}>✓</Text>
              <View style={{ width: 40, height: 1, backgroundColor: "#CBD5E1", marginLeft: 12 }} />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#64748B",
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
