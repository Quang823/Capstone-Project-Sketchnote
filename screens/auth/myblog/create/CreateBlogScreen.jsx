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
        text1: "Missing Information",
        text2: "Please fill in both title and content.",
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
        text1: "🎉 Post created successfully!",
      });

      navigation.goBack();
    } catch (err) {
      console.log("Error:", err.message);
      Toast.show({
        type: "error",
        text1: "Error creating post",
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

      <Text style={styles.header}>Create New Post</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter title..."
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 160, textAlignVertical: "top" }]}
        placeholder="Enter your content..."
        value={content}
        onChangeText={setContent}
        multiline
      />

      {/* 🟣 Add Image Button */}
      <View style={styles.addImageContainer}>
        <ImageUploader onUploaded={(url) => setImageUrl(url)} />
      </View>

      {/* 🟢 Post Button */}
      <Pressable onPress={handleCreateBlog} disabled={loading}>
        <LinearGradient
          colors={["#4F46E5", "#c39ae9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Post</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
