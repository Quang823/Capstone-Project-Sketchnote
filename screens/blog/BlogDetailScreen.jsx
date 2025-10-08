import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { blogDetailStyles } from "./BlogDetailScreen.styles";

// Mock data cho demo
const blogData = {
  "1": {
    id: "1",
    title: "5 mẹo Sketchnote nhanh cho sinh viên",
    author: "Nguyễn Văn A",
    date: "20/09/2025",
    views: 1240,
    image: require("../../assets/logo1.webp"),
    content: `
      Sketchnote là một phương pháp ghi chú bằng hình ảnh 
      đang ngày càng phổ biến trong giới sinh viên và người đi làm. 
      Dưới đây là 5 mẹo giúp bạn sketchnote nhanh hơn:
      
      1. Chuẩn bị trước bộ icon thường dùng.
      2. Luôn bắt đầu với layout đơn giản.
      3. Kết hợp chữ in đậm cho ý chính.
      4. Dùng màu sắc để phân nhóm ý tưởng.
      5. Luyện tập mỗi ngày để tăng tốc độ.
    `,
  },
  "2": {
    id: "2",
    title: "Tại sao Sketchnote giúp bạn nhớ lâu hơn?",
    author: "Trần Thị B",
    date: "15/09/2025",
    views: 980,
    image: require("../../assets/logo1.webp"),
    content: `
      Nhiều nghiên cứu cho thấy việc kết hợp chữ viết và hình ảnh 
      giúp não bộ lưu trữ thông tin lâu hơn. 
      Sketchnote kích hoạt cả bán cầu trái và phải của não,
      tạo ra sự liên kết mạnh mẽ và giúp bạn nhớ kiến thức hiệu quả.
    `,
  },
};

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;

  const blog = blogData[blogId];

  if (!blog) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không tìm thấy bài viết</Text>
      </View>
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
