import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { blogDetailStyles } from "./BlogDetailScreen.styles";
import { blogService } from "../../service/blogService";

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch chi tiết blog từ API
  const fetchBlogDetail = async () => {
    try {
      // Nếu blogService có method getBlogById, sử dụng nó
      // Nếu không, lấy tất cả blogs và filter
      const allBlogs = await blogService.getAllBlogs();
      const blogDetail = allBlogs.find((b) => b.id.toString() === blogId.toString());

      if (blogDetail) {
        // Transform data
        setBlog({
          id: blogDetail.id.toString(),
          title: blogDetail.title,
          author: blogDetail.authorDisplay,
          authorId: blogDetail.authorId,
          content: blogDetail.content,
          image: {
    uri: "https://res.cloudinary.com/dturncvxv/image/upload/v1759910431/b5e15cec-6489-46e7-bd9e-596a24bd5225_wbpdjm.jpg",
  },
          date: blogDetail.createdAt || "N/A",
          views: Math.floor(Math.random() * 2000), // Random views nếu API không có
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
        style={[blogDetailStyles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Đang tải bài viết...</Text>
      </LinearGradient>
    );
  }

  if (!blog) {
    return (
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[blogDetailStyles.container, { justifyContent: "center", alignItems: "center" }]}
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
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={blogDetailStyles.container}
    >
      {/* Header */}
      <View style={blogDetailStyles.header}>
        <Pressable
          style={blogDetailStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={blogDetailStyles.headerTitle}>Chi tiết bài viết</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={blogDetailStyles.scrollContent}
      >
        {/* Ảnh blog */}
        <Image source={blog.image} style={blogDetailStyles.blogImage} />

        {/* Tiêu đề */}
        <Text style={blogDetailStyles.blogTitle}>{blog.title}</Text>

        {/* Info */}
        <View style={blogDetailStyles.blogInfo}>
          <Text style={blogDetailStyles.blogAuthor}>
            {blog.author} • {blog.date}
          </Text>
          <View style={blogDetailStyles.blogMeta}>
            <Icon name="visibility" size={16} color="#6B7280" />
            <Text style={blogDetailStyles.blogViews}>{blog.views} lượt xem</Text>
          </View>
        </View>

        {/* Nội dung */}
        <Text style={blogDetailStyles.blogContent}>{blog.content}</Text>
      </ScrollView>
    </LinearGradient>
  );
}