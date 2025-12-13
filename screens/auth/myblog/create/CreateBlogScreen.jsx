import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getStyles } from "./CreateBlogScreen.styles";
import { blogService } from "../../../../service/blogService";
import ImageUploader from "../../../../common/ImageUploader";
import { useTheme } from "../../../../context/ThemeContext";

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

  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

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
    // Validate basic fields
    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Title",
        text2: "Please enter a blog title.",
      });
      return;
    }

    if (!summary.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing Summary",
        text2: "A summary is required to publish your blog.",
      });
      return;
    }

    if (!imageUrl) {
      Toast.show({
        type: "error",
        text1: "Missing Featured Image",
        text2: "Please upload a featured image for your blog.",
      });
      return;
    }

    // Validate content sections
    if (contents.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Content Sections",
        text2: "Your blog must include at least one content section.",
      });
      return;
    }

    // Validate each section
    for (let i = 0; i < contents.length; i++) {
      const section = contents[i];

      if (!section.sectionTitle.trim()) {
        Toast.show({
          type: "error",
          text1: `Missing Section Title`,
          text2: `Section ${i + 1} must include a title.`,
        });
        return;
      }

      if (!section.content.trim()) {
        Toast.show({
          type: "error",
          text1: `Missing Section Content`,
          text2: `Section ${i + 1} must include content.`,
        });
        return;
      }
    }

    try {
      setLoading(true);

      const blogData = {
        title: title.trim(),
        summary: summary.trim(),
        imageUrl,
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
        text1: "🎉 Blog created successfully! Please wait for approval.",
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
      {/* Header - Matching UpdateBlogScreen */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color={styles.iconColor1} />
          </Pressable>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Create Blog Post</Text>
            <Text style={styles.headerSubtitle}>Share your story with the world</Text>
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
          </View>
        </View>

        <View style={styles.contentCardsContainer}>
          {contents.map((section, index) => (
            <View key={index} style={styles.contentCard}>
              <View style={styles.contentCardHeader}>
                <View style={styles.contentCardLeft}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Section {index + 1}</Text>
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
                  onChangeText={(text) => updateContentSection(index, "sectionTitle", text)}
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
                  onChangeText={(text) => updateContentSection(index, "content", text)}
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
                  onUploaded={(url) => updateContentSection(index, "contentUrl", url)}
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

          {/* Create Button */}
          <Pressable
            onPress={handleCreateBlog}
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
                  <Text style={styles.submitTextRow}>Creating...</Text>
                </>
              ) : (
                <>
                  <Icon name="publish" size={20} color="#fff" />
                  <Text style={styles.submitTextRow}>Create Blog</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}