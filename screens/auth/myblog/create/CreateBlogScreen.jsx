// CreateBlogScreen.jsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

 

import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";

export default function CreateBlogScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreateBlog = async () => {
    if (!title || !content) {
      toast.show("Vui lòng nhập đủ tiêu đề và nội dung!", { type: "warning" });
      return;
    }

    try {
      setLoading(true);
      const userId = await authService.getUserId(); 
      
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        authorId: userId,
      };

      const res = await blogService.createBlog(blogData);
     
      navigation.goBack();
    } catch (err) {
      console.log("Error:", err.message);
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
