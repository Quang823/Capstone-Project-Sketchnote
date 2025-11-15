import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

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
        imageUrl: imageUrl,
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
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={isTablet ? 28 : 24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Create New Post</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Main Content - 2 columns on tablet */}
        <View style={styles.mainContent}>
          {/* Left Column - Basic Info */}
          <View style={styles.leftColumn}>
            <TextInput
              style={styles.input}
              placeholder="Enter an engaging title..."
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: isTablet ? 140 : 80, textAlignVertical: "top" }]}
              placeholder="Write a compelling summary..."
              placeholderTextColor="#9CA3AF"
              value={summary}
              onChangeText={setSummary}
              multiline
            />
          </View>

          {/* Right Column - Main Image */}
          <View style={styles.rightColumn}>
            <View style={styles.imageSection}>
              <Text style={styles.sectionLabel}>📸 Featured Image</Text>
              <ImageUploader onUploaded={(url) => setImageUrl(url)} />
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Content Sections */}
        <View style={styles.contentSectionsHeader}>
          <Text style={styles.sectionLabel}>📝 Content Sections</Text>
          <Text style={{ fontSize: isTablet ? 16 : 14, color: "#6B7280", fontWeight: "600" }}>
            {contents.length} {contents.length === 1 ? 'Section' : 'Sections'}
          </Text>
        </View>
        
        <View style={styles.contentCardsContainer}>
          {contents.map((section, index) => (
            <View key={index} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <Text style={styles.contentIndex}>Section {index + 1}</Text>
                {contents.length > 1 && (
                  <Pressable 
                    onPress={() => removeContentSection(index)}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete" size={isTablet ? 22 : 20} color="#EF4444" />
                  </Pressable>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Section title (optional)..."
                placeholderTextColor="#9CA3AF"
                value={section.sectionTitle}
                onChangeText={(text) => updateContentSection(index, "sectionTitle", text)}
              />

              <TextInput
                style={[styles.input, { height: isTablet ? 140 : 120, textAlignVertical: "top" }]}
                placeholder="Write your section content here..."
                placeholderTextColor="#9CA3AF"
                value={section.content}
                onChangeText={(text) => updateContentSection(index, "content", text)}
                multiline
              />

              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>🖼️ Section Image (optional)</Text>
                <ImageUploader 
                  onUploaded={(url) => updateContentSection(index, "contentUrl", url)} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Add Section Button */}
        <Pressable onPress={addContentSection} style={styles.addSectionButton}>
          <Icon name="add-circle-outline" size={isTablet ? 24 : 20} color="#4F46E5" />
          <Text style={styles.addSectionText}>Add Another Section</Text>
        </Pressable>

        {/* Post Button */}
        <View style={styles.submitButtonContainer}>
          <Pressable onPress={handleCreateBlog} disabled={loading}>
            <LinearGradient
              colors={["#4F46E5", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size={isTablet ? "large" : "small"} />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name="publish" size={isTablet ? 24 : 20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitText}>Publish Post</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}