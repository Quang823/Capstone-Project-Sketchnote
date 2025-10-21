import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles"; 
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";

export default function UpdateBlogScreen({ route, navigation }) {
  const { blog } = route.params; 
  const [title, setTitle] = useState(blog?.title || "");
  const [content, setContent] = useState(blog?.content || "");
  const [imageurl, setImageUrl] = useState(blog?.imageurl || "");
  const [loading, setLoading] = useState(false);

const handleUpdateBlog = async () => {
  console.log("🟣 Handle update start");

  if (!title || !content) {
    Toast.show({ type: "error", text1: "Please fill in all fields" });
    return;
  }

 
  const updatedBlog = {
    title: title.trim(),
    content: content.trim(),
    imageurl: imageurl || blog.imageurl || "https://via.placeholder.com/400",
  };



  try {
    setLoading(true);
    await blogService.updateBlog(blog.id, updatedBlog); // ⚠️ Pass ID separately
    Toast.show({ type: "success", text1: "🎉 Update blog success!" });
    navigation.goBack();
  } catch (err) {
   
    Toast.show({ 
      type: "error", 
      text1: "Update failed" 
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

      <Text style={styles.header}>Update Blog</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter blog title..."
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 160, textAlignVertical: "top" }]}
        placeholder="Enter blog content..."
        value={content}
        onChangeText={setContent}
        multiline
      />

      <ImageUploader onUploaded={(url) => setImageUrl(url)} existingImage={imageurl} />

      <Pressable onPress={handleUpdateBlog} disabled={loading}>
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.submitButton}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Cập nhật</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}
