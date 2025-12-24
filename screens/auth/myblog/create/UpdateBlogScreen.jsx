import React, { useState, useEffect, useMemo } from "react";
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
import { getStyles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";
import { useTheme } from "../../../../context/ThemeContext";

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

  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

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
        console.warn("❌ Fetch blog detail failed:", err);
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
        console.warn("❌ Delete content failed:", err);
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
      await blogService.changeBlogStatus(blog.id, 'PENDING_REVIEW');

      Toast.show({
        type: "success",
        text1: "🎉 Blog updated successfully!",
      });

      navigation.goBack();
    } catch (err) {
      console.warn("❌ Update error:", err);
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
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#084F8C" />
          <Text style={styles.loadingText}>Loading blog data...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </View>
    );
  }

  // --- Render ---
  return (
    <View style={styles.container}>
      {/* Header with Gradient */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color={styles.iconColor1} />
          </Pressable>

          {/* Wrap hai dòng text vào một View */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Update Blog Post</Text>
            <Text style={styles.headerSubtitle}>Make your changes and save</Text>
          </View>
        </View>
      </View>


      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <View style={[styles.progressIcon, { backgroundColor: title.trim() ? '#DCFCE7' : (theme === 'dark' ? '#450a0a' : '#FEE2E2') }]}>
              <Icon name={title.trim() ? 'check' : 'title'} size={20} color={title.trim() ? '#16A34A' : '#DC2626'} />
            </View>
            <Text style={styles.progressText}>Title</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <View style={[styles.progressIcon, { backgroundColor: summary.trim() ? '#DCFCE7' : (theme === 'dark' ? '#450a0a' : '#FEE2E2') }]}>
              <Icon name={summary.trim() ? 'check' : 'description'} size={20} color={summary.trim() ? '#16A34A' : '#DC2626'} />
            </View>
            <Text style={styles.progressText}>Summary</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <View style={[styles.progressIcon, { backgroundColor: imageUrl ? '#DCFCE7' : (theme === 'dark' ? '#450a0a' : '#FEE2E2') }]}>
              <Icon name={imageUrl ? 'check' : 'image'} size={20} color={imageUrl ? '#16A34A' : '#DC2626'} />
            </View>
            <Text style={styles.progressText}>Image</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <View style={[styles.progressIcon, { backgroundColor: contents.length > 0 ? '#DCFCE7' : (theme === 'dark' ? '#450a0a' : '#FEE2E2') }]}>
              <Icon name={contents.length > 0 ? 'check' : 'article'} size={20} color={contents.length > 0 ? '#16A34A' : '#DC2626'} />
            </View>
            <Text style={styles.progressText}>Content</Text>
          </View>
        </View>

        {/* Main Content - 2 columns on tablet */}
        <View style={styles.mainContent}>
          {/* Left Column - Basic Info */}
          <View style={styles.leftColumn}>
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Icon name="title" size={20} color={styles.iconColor} />
                <Text style={styles.inputLabel}>Blog Title</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter an engaging title..."
                placeholderTextColor={styles.placeholderText}
                value={title}
                onChangeText={setTitle}
              />
              <Text style={styles.inputHint}>
                {title.length}/100 characters
              </Text>
            </View>

            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Icon name="description" size={20} color={styles.iconColor} />
                <Text style={styles.inputLabel}>Summary</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write a compelling summary that captures attention..."
                placeholderTextColor={styles.placeholderText}
                value={summary}
                onChangeText={setSummary}
                multiline
              />
              <Text style={styles.inputHint}>
                {summary.length}/500 characters
              </Text>
            </View>
          </View>

          {/* Right Column - Main Image */}
          <View style={styles.rightColumn}>
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Icon name="photo-camera" size={20} color={styles.iconColor} />
                <Text style={styles.inputLabel}>Featured Image</Text>
              </View>
              <ImageUploader
                onUploaded={(url) => setImageUrl(url)}
                existingImage={imageUrl}
              />
              <Text style={styles.inputHint}>
                This image will be the main visual for your blog
              </Text>
            </View>
          </View>
        </View>

        {/* Content Sections Header */}
        <View style={styles.sectionHeaderCard}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.sectionIconWrapper}>
              <Icon name="article" size={24} color={styles.iconColor} />
            </View>
            <View>
              <Text style={styles.sectionHeaderTitle}>Content Sections</Text>
              <Text style={styles.sectionHeaderSubtitle}>
                Add multiple sections to structure your blog
              </Text>
            </View>
          </View>
          <View style={styles.sectionStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{contents.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: theme === 'dark' ? '#1E3A8A' : '#DBEAFE' }]}>
              <Text style={[styles.statNumber, { color: theme === 'dark' ? '#93C5FD' : '#1E40AF' }]}>
                {contents.filter(c => c.id).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme === 'dark' ? '#93C5FD' : '#1E40AF' }]}>Existing</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: theme === 'dark' ? '#064E3B' : '#D1FAE5' }]}>
              <Text style={[styles.statNumber, { color: theme === 'dark' ? '#6EE7B7' : '#065F46' }]}>
                {contents.filter(c => !c.id).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme === 'dark' ? '#6EE7B7' : '#065F46' }]}>New</Text>
            </View>
          </View>
        </View>

        {/* Content Cards */}
        <View style={styles.contentCardsContainer}>
          {contents.map((section, index) => (
            <View key={section.id || `new-${index}`} style={styles.contentCard}>
              {/* Card Header */}
              <View style={styles.contentCardHeader}>
                <View style={styles.contentCardLeft}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Section {index + 1}</Text>
                  {section.id ? (
                    <View style={styles.existingBadge}>
                      <Icon name="cloud-done" size={12} color={theme === 'dark' ? '#93C5FD' : '#1E40AF'} />
                      <Text style={styles.existingBadgeText}>SAVED</Text>
                    </View>
                  ) : (
                    <View style={styles.newBadge}>
                      <Icon name="fiber-new" size={12} color={theme === 'dark' ? '#6EE7B7' : '#065F46'} />
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                </View>
                {contents.length > 1 && (
                  <Pressable
                    onPress={() => removeContentSection(index)}
                    style={styles.deleteButton}
                  >
                    <Icon name="delete-outline" size={22} color="#EF4444" />
                  </Pressable>
                )}
              </View>

              {/* Section Title Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Section Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Introduction, Main Points, Conclusion..."
                  placeholderTextColor={styles.placeholderText}
                  value={section.sectionTitle}
                  onChangeText={(text) =>
                    updateContentSection(index, "sectionTitle", text)
                  }
                />
              </View>

              {/* Section Content Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Section Content</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your section content here..."
                  placeholderTextColor={styles.placeholderText}
                  value={section.content}
                  onChangeText={(text) =>
                    updateContentSection(index, "content", text)
                  }
                  multiline
                />
                <Text style={styles.inputHint}>
                  {section.content.length} characters
                </Text>
              </View>

              {/* Section Image */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Section Image (Optional)</Text>
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

        {/* Bottom Action Buttons - Side by Side */}
        <View style={styles.bottomActionsContainer}>
          {/* Add Section Button */}
          <Pressable onPress={addContentSection} style={styles.addSectionButtonRow}>
            <Icon name="add-circle-outline" size={20} color={styles.iconColor} />
            <Text style={styles.addSectionTextRow}>Add Section</Text>
          </Pressable>

          {/* Update Button */}
          <Pressable
            onPress={handleUpdateBlog}
            disabled={loading}
            style={styles.submitWrapperRow}
          >
            <LinearGradient
              colors={loading ? ["#94A3B8", "#64748B"] : ["#084F8C", "#06396b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonRow}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.submitTextRow}>Updating...</Text>
                </>
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.submitTextRow}>Update Blog</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}