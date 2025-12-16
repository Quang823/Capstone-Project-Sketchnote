import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  TextInput,
  ImageBackground,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { blogService } from "../../service/blogService";
import { authService } from "../../service/authService";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { getUserFromToken } from "../../utils/AuthUtils";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../assets/loading.json";
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from "./BlogDetailScreen.styles";
import { useTheme } from "../../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [replies, setReplies] = useState({});
  const [replyLoadingMap, setReplyLoadingMap] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [editingTarget, setEditingTarget] = useState({ id: null, parentId: null, type: null });
  const [editingText, setEditingText] = useState("");
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const contentMaxWidth = isTablet ? 900 : windowWidth;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const fetchAuthorProfile = async (userId) => {
    if (!userId && userId !== 0) {
      setAuthorProfile(null);
      return;
    }
    try {
      const profile = await authService.getUserById(userId);
      setAuthorProfile(profile || null);
    } catch (error) {
      console.warn("Unable to load author profile", error?.message || error);
      setAuthorProfile(null);
    }
  };

  const fetchBlogDetail = async () => {
    try {
      const response = await blogService.getBlogById(blogId);
      const blogData = response?.result;

      if (blogData) {
        setBlog({
          id: blogData.id,
          title: blogData.title,
          author: blogData.authorDisplay,
          authorId: blogData.authorId,
          summary: blogData.summary,
          imageUrl: blogData.imageUrl,
          createdAt: blogData.createdAt,
          updatedAt: blogData.updatedAt,
          contents: blogData.contents || [],
        });
        fetchAuthorProfile(blogData.authorId);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load blog detail.",
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching blog detail:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load blog detail.",
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getCommentsBlog = async () => {
    try {
      setCommentsLoading(true);
      const response = await blogService.getCommentsBlog(blogId, 0, 10);
      const commentData = response?.result?.content || [];
      setComments(commentData);
      setReplies((prev) => {
        const next = {};
        commentData.forEach((comment) => {
          if (prev[comment.id]) {
            next[comment.id] = prev[comment.id];
          }
        });
        return next;
      });
    } catch (error) {
      console.error("Error fetching comments blog:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load comments.",
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchReplyComments = async (commentId) => {
    try {
      setReplyLoadingMap((prev) => ({ ...prev, [commentId]: true }));
      const response = await blogService.getReplyCommentsBlog(commentId, 0, 10);
      const replyData = response?.result?.content || [];
      setReplies((prev) => ({ ...prev, [commentId]: replyData }));
    } catch (error) {
      console.error("Error fetching reply comments:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load replies.",
      });
    } finally {
      setReplyLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const createCommentsBlog = async (content, parentId = null) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Toast.show({
        type: "error",
        text1: "Missing content",
        text2: "Please enter a message before submitting.",
      });
      return false;
    }

    try {
      const payload = {
        content: trimmedContent,
        parentCommentId: parentId,
      };
      await blogService.createCommentsBlog(blogId, payload);
      await getCommentsBlog();
      if (parentId) {
        await fetchReplyComments(parentId);
      }
      Toast.show({
        type: "success",
        text1: parentId ? "Reply posted" : "Comment posted",
      });
      return true;
    } catch (error) {
      console.error("Error creating comment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: parentId ? "Failed to reply to comment." : "Failed to add comment.",
      });
      return false;
    }
  };

  const handleStartEditing = (type, targetId, currentContent, parentId = null) => {
    setEditingTarget({ id: targetId, parentId, type });
    setEditingText(currentContent);
  };

  const handleCancelEditing = () => {
    setEditingTarget({ id: null, parentId: null, type: null });
    setEditingText("");
  };

  const handleSaveEditing = async () => {
    if (!editingTarget.id) return;
    const trimmedContent = editingText.trim();
    if (!trimmedContent) {
      Toast.show({
        type: "error",
        text1: "Missing content",
        text2: "Please enter a message before saving.",
      });
      return;
    }

    try {
      await blogService.updateCommentsBlog(editingTarget.id, { content: trimmedContent });
      await getCommentsBlog();
      if (editingTarget.parentId) {
        await fetchReplyComments(editingTarget.parentId);
      }
      Toast.show({
        type: "success",
        text1: "Comment updated",
      });
      handleCancelEditing();
    } catch (error) {
      console.error("Error updating comment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update comment.",
      });
    }
  };

  const handleDeleteComment = async (commentId, parentId = null) => {
    try {
      await blogService.deleteCommentsBlog(commentId);
      Toast.show({
        type: "success",
        text1: "Comment deleted",
      });
      if (editingTarget.id === commentId) {
        handleCancelEditing();
      }
      await getCommentsBlog();
      if (parentId) {
        await fetchReplyComments(parentId);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete comment.",
      });
    }
  };

  const confirmDeleteComment = (commentId, parentId = null) => {
    Alert.alert("Delete comment", "Are you sure you want to delete this comment?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteComment(commentId, parentId) },
    ]);
  };

  const handleToggleReplies = (commentId, replyCount) => {
    setExpandedComments((prev) => {
      const isExpanding = !prev[commentId];
      if (isExpanding && replyCount > 0 && !replies[commentId]) {
        fetchReplyComments(commentId);
      }
      return { ...prev, [commentId]: isExpanding };
    });
  };

  const handleSubmitComment = async () => {
    const success = await createCommentsBlog(commentInput);
    if (success) {
      setCommentInput("");
    }
  };

  const handleReplyChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReplyToReply = (commentId, authorName) => {
    const mention = `@${authorName} `;
    setReplyInputs((prev) => ({
      ...prev,
      [commentId]: mention,
    }));
  };

  const handleSubmitReply = async (commentId) => {
    const content = replyInputs[commentId] || "";
    const success = await createCommentsBlog(content, commentId);
    if (success) {
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setExpandedComments((prev) => ({ ...prev, [commentId]: true }));
    }
  };

  useEffect(() => {
    fetchBlogDetail();
    getCommentsBlog();
  }, [blogId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserFromToken();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.warn("Unable to load current user", error);
      }
    };

    fetchUser();
  }, []);

  const canManageComment = (authorId) => {
    if (!currentUser) return false;
    return currentUser.id === authorId;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
        <Icon name="article" size={64} color={isDark ? "#94A3B8" : "#CBD5E1"} />
        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>Blog post not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Fixed Back Button - Outside ScrollView */}
      <Pressable style={[styles.backButton, isDark && styles.backButtonDark]} onPress={handleBackPress}>
        <Icon name="arrow-back" size={30} color={isDark ? "#FFFFFF" : "#3B82F6"} />
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient Overlay */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            {blog.imageUrl && (
              <>
                <Image
                  source={{ uri: blog.imageUrl }}
                  style={[styles.heroImage, { height: isTablet ? 500 : 280 }]}
                  blurRadius={0.5}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.heroGradient}
                />
              </>
            )}
          </View>

          {/* Content Overlay on Hero */}
          <View style={[styles.heroContent, { maxWidth: contentMaxWidth }]}>
            <View style={[styles.categoryBadge, isDark && styles.categoryBadgeDark]}>
              <Icon name="auto-stories" size={14} color="#3B82F6" />
              <Text style={styles.categoryText}>Article</Text>
            </View>

            <Text style={[styles.title, { fontSize: isTablet ? 42 : 32 }]}>
              {blog.title}
            </Text>

            {/* Author Card - Floating */}
            <View style={[styles.authorCard, isDark && styles.authorCardDark]}>
              <Image
                source={{
                  uri: authorProfile?.avatarUrl ||
                    `https://ui-avatars.com/api/?background=3B82F6&color=fff&name=${encodeURIComponent(blog.author || "Author")}`,
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={[styles.authorName, isDark && styles.authorNameDark]}>{blog.author}</Text>
                <View style={styles.metaRow}>
                  <Icon name="schedule" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                  <Text style={[styles.metaText, isDark && styles.metaTextDark]}>{formatDate(blog.createdAt)}</Text>
                  <View style={styles.metaDot} />
                  <Icon name="visibility" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                  <Text style={[styles.metaText, isDark && styles.metaTextDark]}>5 min read</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={[styles.contentWrapper, { maxWidth: contentMaxWidth }]}>
          {/* Summary Card */}
          {blog.summary && (
            <View style={[styles.summaryCard, isDark && styles.summaryCardDark]}>
              <View style={styles.summaryHeader}>
                <View style={[styles.summaryIconWrapper, isDark && styles.summaryIconWrapperDark]}>
                  <Icon name="lightbulb" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.summaryTitle, isDark && styles.summaryTitleDark]}>Key Takeaways</Text>
              </View>
              <Text style={[styles.summaryText, isDark && styles.summaryTextDark]}>{blog.summary}</Text>
            </View>
          )}

          {/* Blog Content Sections */}
          {blog.contents?.map((section, index) => {
            const isEven = index % 2 === 0;
            // Alternating accent colors
            const accentColor = isEven ? "#1967abff" : "#4aa051ff";
            const bgGradient = isEven
              ? ["#EFF6FF", "#FFFFFF"]
              : ["#F5F3FF", "#FFFFFF"];

            return (
              <View key={section.id || index} style={[styles.sectionCard, isDark && styles.sectionCardDark]}>
                {/* Section Number Badge - Floating */}
                <View style={[styles.sectionNumberBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.sectionNumberBadgeText}>{String(index + 1).padStart(2, '0')}</Text>
                </View>

                {/* Full-width Image First */}
                {section.contentUrl && (
                  <View style={styles.fullWidthImageContainer}>
                    <Image
                      source={{ uri: section.contentUrl }}
                      style={styles.fullWidthImage}
                      resizeMode="cover"
                    />
                    {/* Gradient Overlay on Image */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.4)']}
                      style={styles.imageGradientOverlay}
                    />
                  </View>
                )}

                {/* Content Section */}
                <View style={styles.sectionContentPadding}>
                  {/* Accent Line */}
                  <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

                  {/* Title */}
                  <Text style={[styles.sectionTitleNew, isDark && styles.sectionTitleNewDark]}>
                    {section.sectionTitle}
                  </Text>

                  {/* Content Text */}
                  <Text style={[styles.sectionContentNew, isDark && styles.sectionContentNewDark]}>
                    {section.content}
                  </Text>
                </View>
              </View>
            );
          })}


          {/* End Marker - Redesigned */}
          <View style={styles.endMarkerContainer}>
            <ImageBackground
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764996327/qgdhn0jjt3npvq3rjqcb.png",
              }}
              style={[styles.endMarkerCard, isDark && styles.endMarkerCardDark]}
              imageStyle={{ opacity: 0.22, borderRadius: 16 }}
            >
              <View style={styles.endMarkerContent}>

                {/* Ảnh thay cho icon */}
                <View style={[styles.endMarkerIconCircle, isDark && styles.endMarkerIconCircleDark]}>
                  <Image
                    source={{
                      uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764996004/esaxlyo29fonqfi5g48c.png",
                    }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                </View>

                <Text style={[styles.endMarkerTitle, isDark && styles.endMarkerTitleDark]}>You've reached the end</Text>
                <Text style={[styles.endMarkerSubtext, isDark && styles.endMarkerSubtextDark]}>
                  Thanks for reading! Share your thoughts below 👇
                </Text>

              </View>
            </ImageBackground>
          </View>


          {/* Comments Section - Enhanced */}
          <View style={[styles.commentsSection, isDark && styles.commentsSectionDark]}>
            {/* Discussion Header with Gradient */}
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#FFFFFF']}
              style={styles.discussionHeader}
            >
              <View style={styles.discussionHeaderContent}>
                <View style={[styles.discussionIconWrapper, isDark && styles.discussionIconWrapperDark]}>
                  <LottieView
                    source={require("../../assets/discussion.json")}
                    autoPlay
                    loop
                    style={{ width: 40, height: 40 }}
                  />
                </View>
                <View style={styles.discussionTitleWrapper}>
                  <Text style={[styles.discussionTitle, isDark && styles.discussionTitleDark]}>Discussion</Text>
                  <Text style={[styles.discussionSubtitle, isDark && styles.discussionSubtitleDark]}>
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Comment Input */}
            <View style={[styles.commentInputCard, isDark && styles.commentInputCardDark]}>
              <Image
                source={{
                  uri: currentUser?.avatarUrl || "https://ui-avatars.com/api/?background=3B82F6&color=fff&name=You",
                }}
                style={styles.inputAvatar}
              />
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={[styles.commentInput, isDark && styles.commentInputDark]}
                  placeholder="Share your thoughts..."
                  placeholderTextColor={isDark ? "#94A3B8" : "#94A3B8"}
                  value={commentInput}
                  onChangeText={setCommentInput}
                  multiline
                />
                <Pressable style={[styles.submitButton, isDark && styles.submitButtonDark]} onPress={handleSubmitComment}>
                  <Icon name="send" size={18} color={isDark ? "#FFFFFF" : "#0062ffff"} />
                </Pressable>
              </View>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
              <View style={styles.commentsLoader}>
                <ActivityIndicator size="small" color="#084F8C" />
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <LottieView
                  source={require("../../assets/comment.json")}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100 }}
                />
                <Text style={[styles.emptyCommentsText, isDark && styles.emptyCommentsTextDark]}>No comments yet</Text>
                <Text style={styles.emptyCommentsSubtext}>Be the first to share your thoughts</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={{
                      uri: comment.authorAvatarUrl ||
                        "https://ui-avatars.com/api/?background=E0E7FF&color=3B82F6&name=User",
                    }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <View style={[styles.commentBubble, isDark && styles.commentBubbleDark]}>
                      <View style={styles.commentHeader}>
                        <Text style={[styles.commentAuthor, isDark && styles.commentAuthorDark]}>{comment.authorDisplay || "User"}</Text>
                        <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                      </View>

                      {editingTarget.type === "comment" && editingTarget.id === comment.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={[styles.editInput, isDark && styles.editInputDark]}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                            autoFocus
                          />
                          <View style={styles.editActions}>
                            <Pressable onPress={handleCancelEditing} style={styles.editButton}>
                              <Text style={styles.editButtonTextCancel}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleSaveEditing} style={[styles.editButton, styles.editButtonSave]}>
                              <Text style={styles.editButtonTextSave}>Save</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.commentText, isDark && styles.commentTextDark]}>{comment.content}</Text>
                      )}
                    </View>

                    <View style={styles.commentActions}>
                      <Pressable onPress={() => handleToggleReplies(comment.id, comment.replyCount || 0)} style={styles.actionButton}>
                        <Icon name={expandedComments[comment.id] ? "expand-less" : "expand-more"} size={18} color="#64748B" />
                        <Text style={styles.actionText}>
                          {comment.replyCount > 0 ? `${comment.replyCount} ${comment.replyCount === 1 ? 'Reply' : 'Replies'}` : "Reply"}
                        </Text>
                      </Pressable>

                      {canManageComment(comment.authorId) && editingTarget.id !== comment.id && (
                        <>
                          <Pressable onPress={() => handleStartEditing("comment", comment.id, comment.content)} style={styles.actionButton}>
                            <Icon name="edit" size={16} color="#64748B" />
                            <Text style={styles.actionText}>Edit</Text>
                          </Pressable>
                          <Pressable onPress={() => confirmDeleteComment(comment.id)} style={styles.actionButton}>
                            <Icon name="delete-outline" size={16} color="#EF4444" />
                            <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                          </Pressable>
                        </>
                      )}
                    </View>

                    {/* Replies */}
                    {expandedComments[comment.id] && (
                      <View style={[styles.repliesContainer, isDark && styles.repliesContainerDark]}>
                        {comment.replyCount > 0 && replyLoadingMap[comment.id] && (
                          <ActivityIndicator size="small" color="#084F8C" style={{ marginVertical: 12 }} />
                        )}

                        {replies[comment.id]?.map((reply) => (
                          <View key={reply.id} style={styles.replyItem}>
                            <Image
                              source={{
                                uri: reply.authorAvatarUrl ||
                                  "https://ui-avatars.com/api/?background=E0E7FF&color=3B82F6&name=User",
                              }}
                              style={styles.replyAvatar}
                            />
                            <View style={styles.commentContent}>
                              <View style={[styles.commentBubble, isDark && styles.commentBubbleDark]}>
                                <View style={styles.commentHeader}>
                                  <Text style={[styles.commentAuthor, isDark && styles.commentAuthorDark]}>{reply.authorDisplay || "User"}</Text>
                                  <Text style={styles.commentTime}>{formatDate(reply.createdAt)}</Text>
                                </View>

                                {editingTarget.type === "reply" && editingTarget.id === reply.id ? (
                                  <View style={styles.editContainer}>
                                    <TextInput
                                      style={[styles.editInput, isDark && styles.editInputDark]}
                                      value={editingText}
                                      onChangeText={setEditingText}
                                      multiline
                                      autoFocus
                                    />
                                    <View style={styles.editActions}>
                                      <Pressable onPress={handleCancelEditing} style={styles.editButton}>
                                        <Text style={styles.editButtonTextCancel}>Cancel</Text>
                                      </Pressable>
                                      <Pressable onPress={handleSaveEditing} style={[styles.editButton, styles.editButtonSave]}>
                                        <Text style={styles.editButtonTextSave}>Save</Text>
                                      </Pressable>
                                    </View>
                                  </View>
                                ) : (
                                  <Text style={[styles.commentText, isDark && styles.commentTextDark]}>{reply.content}</Text>
                                )}
                              </View>

                              <View style={styles.commentActions}>
                                <Pressable onPress={() => handleReplyToReply(comment.id, reply.authorDisplay)} style={styles.actionButton}>
                                  <Icon name="reply" size={16} color="#64748B" />
                                  <Text style={styles.actionText}>Reply</Text>
                                </Pressable>

                                {canManageComment(reply.authorId) && editingTarget.id !== reply.id && (
                                  <>
                                    <Pressable onPress={() => handleStartEditing("reply", reply.id, reply.content, comment.id)} style={styles.actionButton}>
                                      <Icon name="edit" size={16} color="#64748B" />
                                      <Text style={styles.actionText}>Edit</Text>
                                    </Pressable>
                                    <Pressable onPress={() => confirmDeleteComment(reply.id, comment.id)} style={styles.actionButton}>
                                      <Icon name="delete-outline" size={16} color="#EF4444" />
                                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                                    </Pressable>
                                  </>
                                )}
                              </View>
                            </View>
                          </View>
                        ))}

                        {/* Reply Input */}
                        <View style={styles.replyInputContainer}>
                          <TextInput
                            style={[styles.replyInput, isDark && styles.replyInputDark]}
                            placeholder="Write a reply..."
                            placeholderTextColor={isDark ? "#94A3B8" : "#94A3B8"}
                            value={replyInputs[comment.id] || ""}
                            onChangeText={(value) => handleReplyChange(comment.id, value)}
                          />
                          <Pressable onPress={() => handleSubmitReply(comment.id)} style={[styles.replySubmitButton, isDark && styles.replySubmitButtonDark]}>
                            <Icon name="send" size={16} color={isDark ? "#FFFFFF" : "#084F8C"} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
