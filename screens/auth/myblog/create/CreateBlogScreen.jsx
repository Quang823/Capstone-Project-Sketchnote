import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";



export default function CreateBlogScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageurl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateBlog = async () => {
    if (!title || !content) {
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đủ tiêu đề và nội dung!",
      });
      return;
    }

    try {
      setLoading(true);

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        imageurl: imageurl || "https://via.placeholder.com/400",
      };

      await blogService.createBlog(blogData);

      Toast.show({
        type: "success",
        text1: "🎉 Đăng bài thành công!",
      });

      navigation.goBack();
    } catch (err) {
      console.log("Error:", err.message);
      Toast.show({
        type: "error",
        text1: "Lỗi tạo bài viết",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#1F2937" />
      </Pressable>

      <Text style={styles.header}>Tạo bài viết mới</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập tiêu đề..."
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 160, textAlignVertical: "top" }]}
        placeholder="Nội dung bài viết..."
        value={content}
        onChangeText={setContent}
        multiline
      />

      <ImageUploader onUploaded={(url) => setImageUrl(url)} />

      <Pressable onPress={handleCreateBlog} disabled={loading}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Đăng bài</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
