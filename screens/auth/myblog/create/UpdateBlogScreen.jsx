import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function UpdateBlogScreen({ route, navigation }) {
  const { blog } = route.params;

  // --- States ---
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Fetch blog chi tiết ---
  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setInitialLoading(true);
        const res = await blogService.getBlogById(blog.id);
        const fullBlog = res.result || res;

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
      } finally {
        setInitialLoading(false);
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

  // --- Remove Section ---
  const removeContentSection = async (index) => {
    const section = contents[index];

    if (section.id) {
      try {
        await blogService.deleteContent(section.id);
        Toast.show({
          type: "success",
          text1: "✅ Section deleted successfully!",
        });
      } catch (err) {
        console.error("❌ Delete content failed:", err);
        Toast.show({
          type: "error",
          text1: "Delete failed",
          text2: err.message,
        });
        return;
      }
    }

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
    // --- Validate main fields ---
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Title",
        text2: "Blog must have a title.",
      });
      return;
    }

    if (!summary.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Summary",
        text2: "Summary cannot be empty.",
      });
      return;
    }

    if (!imageUrl) {
      Toast.show({
        type: "error",
        text1: "Missing Featured Image",
        text2: "Please upload a featured image.",
      });
      return;
    }

    // --- Validate content list ---
    if (contents.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Content",
        text2: "Your blog must have at least one content section.",
      });
      return;
    }

    // --- Validate each section ---
    for (let i = 0; i < contents.length; i++) {
      const section = contents[i];

      if (!section.sectionTitle.trim()) {
        Toast.show({
          type: "error",
          text1: "Section Title Missing",
          text2: `Section ${i + 1} must have a title.`,
        });
        return;
      }

      if (!section.content.trim()) {
        Toast.show({
          type: "error",
          text1: "Section Content Missing",
          text2: `Section ${i + 1} must include content.`,
        });
        return;
      }
    }

    // --- If all valid, proceed update ---
    try {
      setLoading(true);

      // Update main blog
      const blogData = {
        title: title.trim(),
        summary: summary.trim(),
        imageUrl: imageUrl,
      };

      await blogService.updateBlog(blog.id, blogData);

      // Update or create content
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

      // Change status to DRAFT after update
      await blogService.changeBlogStatus(blog.id, 'DRAFT');

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


  // --- Loading State ---
  if (initialLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#6B7280" }}>
          Loading blog data...
        </Text>
      </View>
    );
  }

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={isTablet ? 28 : 24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>✏️ Update Blog</Text>
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
              <ImageUploader
                onUploaded={(url) => setImageUrl(url)}
                existingImage={imageUrl}
              />
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Content Sections */}
        <View style={styles.contentSectionsHeader}>
          <Text style={styles.sectionLabel}>📝 Content Sections</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: isTablet ? 16 : 14, color: "#6B7280", fontWeight: "600", marginRight: 8 }}>
              {contents.length} {contents.length === 1 ? 'Section' : 'Sections'}
            </Text>
            <View style={{
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{ fontSize: 12, color: '#92400E', fontWeight: '700' }}>
                {contents.filter(c => c.id).length} Existing | {contents.filter(c => !c.id).length} New
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentCardsContainer}>
          {contents.map((section, index) => (
            <View key={section.id || `new-${index}`} style={styles.contentCard}>
              <View style={styles.contentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.contentIndex}>Section {index + 1}</Text>
                  {section.id ? (
                    <View style={{
                      backgroundColor: '#DBEAFE',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ fontSize: 11, color: '#1E40AF', fontWeight: '700' }}>
                        EXISTING
                      </Text>
                    </View>
                  ) : (
                    <View style={{
                      backgroundColor: '#D1FAE5',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ fontSize: 11, color: '#065F46', fontWeight: '700' }}>
                        NEW
                      </Text>
                    </View>
                  )}
                </View>
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
                onChangeText={(text) =>
                  updateContentSection(index, "sectionTitle", text)
                }
              />

              <TextInput
                style={[styles.input, { height: isTablet ? 140 : 120, textAlignVertical: "top" }]}
                placeholder="Write your section content here..."
                placeholderTextColor="#9CA3AF"
                value={section.content}
                onChangeText={(text) =>
                  updateContentSection(index, "content", text)
                }
                multiline
              />

              <View style={styles.imageSection}>
                <Text style={styles.imageLabel}>🖼️ Section Image (optional)</Text>
                <ImageUploader
                  onUploaded={(url) =>
                    updateContentSection(index, "contentUrl", url)
                  }
                  existingImage={section.contentUrl}
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

        {/* Update Button */}
        <View style={styles.submitButtonContainer}>
          <Pressable onPress={handleUpdateBlog} disabled={loading}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size={isTablet ? "large" : "small"} />
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon name="update" size={isTablet ? 24 : 20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitText}>Update Blog</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}