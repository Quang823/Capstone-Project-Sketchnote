import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";

export default function CreateBlogScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contents, setContents] = useState([
    { sectionTitle: "", content: "", contentUrl: "", index: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  const addContentSection = () => {
    setContents([
      ...contents,
      { 
        sectionTitle: "", 
        content: "", 
        contentUrl: "", 
        index: contents.length 
      }
    ]);
  };

  const removeContentSection = (index) => {
    if (contents.length > 1) {
      const newContents = contents.filter((_, i) => i !== index);
      // Cập nhật lại index
      const reindexed = newContents.map((item, i) => ({ ...item, index: i }));
      setContents(reindexed);
    }
  };

  const updateContentSection = (index, field, value) => {
    const newContents = [...contents];
    newContents[index][field] = value;
    setContents(newContents);
  };

  const handleCreateBlog = async () => {
    if (!title || !summary) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill in title and summary.",
      });
      return;
    }

    // Kiểm tra ít nhất 1 content section có nội dung
    const hasContent = contents.some(c => c.content.trim() !== "");
    if (!hasContent) {
      Toast.show({
        type: "error",
        text1: "Missing Content",
        text2: "Please add at least one content section.",
      });
      return;
    }

    try {
      setLoading(true);

      const blogData = {
        title: title.trim(),
        summary: summary.trim(),
        imageUrl: imageUrl ,
        contents: contents.map((item, idx) => ({
          sectionTitle: item.sectionTitle.trim(),
          content: item.content.trim(),
          contentUrl: item.contentUrl || "",
          index: idx
        }))
      };

      await blogService.createBlog(blogData);

      Toast.show({
        type: "success",
        text1: "🎉 Post created successfully!",
      });

      navigation.goBack();
    } catch (err) {
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Create New Post</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <TextInput
          style={styles.input}
          placeholder="Enter title..."
          value={title}
          onChangeText={setTitle}
        />

        {/* Summary */}
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="Enter summary..."
          value={summary}
          onChangeText={setSummary}
          multiline
        />

        {/* Main Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Main Image</Text>
          <ImageUploader onUploaded={(url) => setImageUrl(url)} />
        </View>

        {/* Content Sections */}
        <View style={styles.contentSections}>
          <Text style={styles.sectionLabel}>Content Sections</Text>
          
          {contents.map((section, index) => (
            <View key={index} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentIndex}>Section {index + 1}</Text>
                {contents.length > 1 && (
                  <Pressable onPress={() => removeContentSection(index)}>
                    <Icon name="delete" size={20} color="#EF4444" />
                  </Pressable>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Section title (optional)..."
                value={section.sectionTitle}
                onChangeText={(text) => updateContentSection(index, "sectionTitle", text)}
              />

              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                placeholder="Section content..."
                value={section.content}
                onChangeText={(text) => updateContentSection(index, "content", text)}
                multiline
              />

              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Section Image (optional)</Text>
                <ImageUploader 
                  onUploaded={(url) => updateContentSection(index, "contentUrl", url)} 
                />
              </View>
            </View>
          ))}

          {/* Add Section Button */}
          <Pressable onPress={addContentSection} style={styles.addSectionButton}>
            <Icon name="add-circle-outline" size={20} color="#4F46E5" />
            <Text style={styles.addSectionText}>Add Another Section</Text>
          </Pressable>
        </View>

        {/* Post Button */}
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
      </ScrollView>
    </View>
  );
}