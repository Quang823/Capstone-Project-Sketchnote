import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";

export default function UpdateBlogScreen({ route, navigation }) {
  const { blog } = route.params;

  // --- States ---
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch blog chi tiết ---
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        const res = await blogService.getBlogById(blog.id);
        const fullBlog = res.result || res; // tuỳ API structure

        setTitle(fullBlog.title || "");
        setSummary(fullBlog.summary || "");
        setImageUrl(fullBlog.imageUrl || "");
        setContents(
          fullBlog.contents && fullBlog.contents.length > 0
            ? fullBlog.contents.map((c, idx) => ({
                id: c.id,
                sectionTitle: c.sectionTitle || "",
                content: c.content || "",
                contentUrl: c.contentUrl || "",
                index: idx,
              }))
            : [
                {
                  sectionTitle: "",
                  content: "",
                  contentUrl: "",
                  index: 0,
                },
              ]
        );
      } catch (err) {
        console.error("❌ Fetch blog detail failed:", err);
        Toast.show({
          type: "error",
          text1: "Failed to load blog data",
          text2: err.message,
        });
      }
    };

    fetchBlogDetail();
  }, [blog.id]);

  // --- Add Section ---
  const addContentSection = () => {
    setContents((prev) => [
      ...prev,
      {
        sectionTitle: "",
        content: "",
        contentUrl: "",
        index: prev.length,
      },
    ]);
  };

 
  const removeContentSection = async (index) => {
    const section = contents[index];

    if (section.id) {
      try {
        await blogService.deleteContent(section.id);
        Toast.show({
          type: "success",
          text1: "Section deleted successfully!",
        });
      } catch (err) {
        console.error("❌ Delete content failed:", err);
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2: err.message,
        });
        return; // Dừng nếu xóa thất bại
      }
    }

    // Xóa trong state
    const newContents = contents.filter((_, i) => i !== index);
    const reindexed = newContents.map((item, i) => ({ ...item, index: i }));
    setContents(reindexed);
  };

  // --- Update field ---
  const updateContentSection = (index, field, value) => {
    const newContents = [...contents];
    newContents[index][field] = value;
    setContents(newContents);
  };

  // --- Handle Update Blog ---
  const handleUpdateBlog = async () => {
    if (!title.trim() || !summary.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing information",
        text2: "Please fill in title and summary.",
      });
      return;
    }

    const hasContent = contents.some((c) => c.content.trim() !== "");
    if (!hasContent) {
      Toast.show({
        type: "error",
        text1: "Missing content",
        text2: "Please add at least one content section.",
      });
      return;
    }

    try {
      setLoading(true);

      // --- 1️⃣ Update blog chính ---
      const blogData = {
        title: title.trim(),
        summary: summary.trim(),
        imageUrl: imageUrl || "https://via.placeholder.com/400",
      };

      await blogService.updateBlog(blog.id, blogData);

      // --- 2️⃣ Update hoặc Create content ---
      const updatePromises = contents.map((section, i) => {
        const contentData = {
          sectionTitle: section.sectionTitle.trim(),
          content: section.content.trim(),
          contentUrl: section.contentUrl || "",
          index: i,
        };

        if (section.id) {
          return blogService.updateContent(section.id, contentData);
        } else {
          return blogService.createContent(blog.id, contentData);
        }
      });

      await Promise.all(updatePromises);

      Toast.show({
        type: "success",
        text1: "🎉 Blog updated successfully!",
      });

      navigation.goBack();
    } catch (err) {
      console.error("❌ Update error:", err);
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Update Blog</Text>
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
          <ImageUploader
            onUploaded={(url) => setImageUrl(url)}
            existingImage={imageUrl}
          />
        </View>

        {/* Content Sections */}
        <View style={styles.contentSections}>
          <Text style={styles.sectionLabel}>Content Sections</Text>

          {contents.map((section, index) => (
            <View key={section.id || `new-${index}`} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentIndex}>
                  Section {index + 1} {section.id ? "(Existing)" : "(New)"}
                </Text>
                {contents.length > 1 && (
                  <Pressable onPress={() => removeContentSection(index)}>
                    <Icon name="delete" size={20} color="#EF4444" />
                  </Pressable>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Section title..."
                value={section.sectionTitle}
                onChangeText={(text) =>
                  updateContentSection(index, "sectionTitle", text)
                }
              />

              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: "top" }]}
                placeholder="Section content..."
                value={section.content}
                onChangeText={(text) =>
                  updateContentSection(index, "content", text)
                }
                multiline
              />

              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>Section Image (optional)</Text>
                <ImageUploader
                  onUploaded={(url) =>
                    updateContentSection(index, "contentUrl", url)
                  }
                  existingImage={section.contentUrl}
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

        {/* Update Button */}
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
              <Text style={styles.submitText}>Update Blog</Text>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}
