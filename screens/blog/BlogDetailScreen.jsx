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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { blogService } from "../../service/blogService";
import { authService } from "../../service/authService";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { getUserFromToken } from "../../utils/AuthUtils";

const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { blogId } = route.params;

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
  const contentMaxWidth = isTablet ? 1000 : windowWidth;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
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

  // 🧩 Gọi API thật
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ marginTop: 16, color: "#64748B", fontSize: 16, fontWeight: "600" }}>
          Loading blog...
        </Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
        <Text style={{ fontSize: 16, color: "#64748B" }}>Can not find this blog</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={{ backgroundColor: "#FFFFFF", paddingBottom: 32 }}>
          {/* Header Image */}
          <View style={{ position: "relative" }}>
            {blog.imageUrl && (
              <Image
                source={{ uri: blog.imageUrl }}
                style={{
                  width: "100%",
                  height: isTablet ? 350 : 200,
                  resizeMode: "cover",
                }}
              />
            )}
            <Pressable style={styles.backButton} onPress={handleBackPress}>
              <Icon name="arrow-back" size={24} color="#1F2937" />
            </Pressable>
          </View>

          {/* Title + Author */}
          <View
            style={{
              maxWidth: contentMaxWidth,
              alignSelf: "center",
              width: "100%",
              paddingHorizontal: isTablet ? 40 : 20,
              paddingTop: 32,
            }}
          >
            <Text
              style={{
                fontSize: isTablet ? 36 : 28,
                fontWeight: "700",
                color: "#1E293B",
                lineHeight: isTablet ? 44 : 36,
                marginBottom: 20,
                letterSpacing: -0.5,
              }}
            >
              {blog.title}
            </Text>

            {/* Author Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: "#F8FAFC",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E2E8F0",
                marginBottom: 28,
              }}
            >
              <Image
                source={{
                  uri:
                    authorProfile?.avatarUrl ||
                    `https://ui-avatars.com/api/?background=bae6fd&color=0f172a&name=${encodeURIComponent(
                      blog.author || "Author"
                    )}`,
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 14,
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1E293B",
                    marginBottom: 4,
                  }}
                >
                  {blog.author}
                </Text>
                <Text style={{ fontSize: 13, color: "#64748B", fontWeight: "500" }}>
                  {formatDate(blog.createdAt)}
                </Text>
              </View>
            </View>

            {/* Summary */}
            {blog.summary && (
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 40,
                  borderLeftWidth: 4,
                  borderLeftColor: "#60A5FA",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>💡</Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1E40AF",
                    }}
                  >
                    Summary
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    color: "#1E293B",
                    lineHeight: 24,
                    fontWeight: "500",
                  }}
                >
                  {blog.summary}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Nội dung bài viết */}
        <View
          style={{
            maxWidth: contentMaxWidth,
            alignSelf: "center",
            width: "100%",
            paddingHorizontal: isTablet ? 40 : 20,
            paddingVertical: 20,
          }}
        >
          {blog.contents?.map((section, index) => {
            const isEven = index % 2 === 0;
            const showImageLeft = isTablet && isEven;
            const showImageRight = isTablet && !isEven;

            return (
              <View
                key={section.id || index}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: isTablet ? 32 : 20,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  <View
                    style={{
                      width: 5,
                      height: 28,
                      backgroundColor: "#60A5FA",
                      borderRadius: 3,
                      marginRight: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: isTablet ? 24 : 20,
                      fontWeight: "700",
                      color: "#1E293B",
                      flex: 1,
                      letterSpacing: -0.5,
                    }}
                  >
                    {section.sectionTitle}
                  </Text>
                </View>

                {isTablet ? (
                  <View style={{ flexDirection: showImageLeft ? "row" : "row-reverse", gap: 32 }}>
                    {section.contentUrl && (
                      <View style={{ width: "45%" }}>
                        <Image
                          source={{ uri: section.contentUrl }}
                          style={{
                            width: "100%",
                            height: 280,
                            borderRadius: 12,
                            resizeMode: "cover",
                          }}
                        />
                      </View>
                    )}
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#475569",
                          lineHeight: 28,
                          textAlign: "justify",
                          fontWeight: "500",
                        }}
                      >
                        {section.content}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {section.contentUrl && (
                      <Image
                        source={{ uri: section.contentUrl }}
                        style={{
                          width: "100%",
                          height: 200,
                          borderRadius: 12,
                          marginBottom: 16,
                          resizeMode: "cover",
                        }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#475569",
                        lineHeight: 28,
                        textAlign: "justify",
                        fontWeight: "500",
                      }}
                    >
                      {section.content}
                    </Text>
                  </>
                )}
              </View>
            );
          })}

          {/* End marker */}
          <View
            style={{
              marginTop: 20,
              marginBottom: 40,
              paddingTop: 24,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#E2E8F0",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 40, height: 1, backgroundColor: "#CBD5E1", marginRight: 12 }} />
              <Text style={{ fontSize: 24 }}>✓</Text>
              <View style={{ width: 40, height: 1, backgroundColor: "#CBD5E1", marginLeft: 12 }} />
            </View>
            <Text
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#64748B",
                fontWeight: "500",
              }}
            >
              End of the blog
            </Text>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>

            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#94A3B8"
                value={commentInput}
                onChangeText={setCommentInput}
                multiline
              />
              <Pressable style={styles.submitButton} onPress={handleSubmitComment}>
                <Text style={styles.submitButtonText}>Post</Text>
              </Pressable>
            </View>

            {commentsLoading ? (
              <View style={styles.commentsLoader}>
                <ActivityIndicator size="small" color="#60A5FA" />
              </View>
            ) : comments.length === 0 ? (
              <Text style={styles.emptyCommentsText}>Be the first to share your thoughts.</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAuthorInfo}>
                      <Image
                        source={{
                          uri:
                            comment.authorAvatarUrl ||
                            "https://ui-avatars.com/api/?background=bae6fd&color=0f172a&name=User",
                        }}
                        style={styles.commentAvatar}
                      />
                      <View>
                        <Text style={styles.commentAuthor}>{comment.authorDisplay || "Ẩn danh"}</Text>
                        <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                      </View>
                    </View>
                  </View>
                  {editingTarget.type === "comment" && editingTarget.id === comment.id ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline
                      />
                      <View style={styles.editActions}>
                        <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEditing}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSaveEditing}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentContent}>{comment.content}</Text>
                  )}
                  <View style={styles.commentActionsRow}>
                    <Pressable
                      style={styles.replyBadge}
                      onPress={() => handleToggleReplies(comment.id, comment.replyCount || 0)}
                    >
                      <Text style={styles.replyBadgeText}>
                        {expandedComments[comment.id]
                          ? "Hide replies"
                          : comment.replyCount > 0
                            ? `${comment.replyCount} repl${comment.replyCount > 1 ? "ies" : "y"}`
                            : "Reply"}
                      </Text>
                    </Pressable>
                    {canManageComment(comment.authorId) && editingTarget.id !== comment.id && (
                      <View style={styles.manageActions}>
                        <Pressable
                          style={[styles.manageActionButton, styles.editActionButton]}
                          onPress={() => handleStartEditing("comment", comment.id, comment.content)}
                        >
                          <Text style={styles.manageActionText}>Edit</Text>
                        </Pressable>
                        <Pressable
                          style={[styles.manageActionButton, styles.deleteActionButton]}
                          onPress={() => confirmDeleteComment(comment.id)}
                        >
                          <Text style={[styles.manageActionText, styles.manageDeleteText]}>Delete</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {expandedComments[comment.id] && (
                    <View style={styles.replySection}>
                      {comment.replyCount > 0 && replyLoadingMap[comment.id] && (
                        <ActivityIndicator size="small" color="#60A5FA" style={{ marginBottom: 8 }} />
                      )}

                      {replies[comment.id]?.map((reply) => (
                        <View key={reply.id} style={styles.replyCard}>
                          <View style={styles.replyHeader}>
                            <View style={styles.replyAuthorInfo}>
                              <Image
                                source={{
                                  uri:
                                    reply.authorAvatarUrl ||
                                    "https://ui-avatars.com/api/?background=bae6fd&color=0f172a&name=User",
                                }}
                                style={styles.replyAvatar}
                              />
                              <View>
                                <Text style={styles.replyAuthor}>{reply.authorDisplay || "Ẩn danh"}</Text>
                                <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
                              </View>
                            </View>
                          </View>
                          {editingTarget.type === "reply" && editingTarget.id === reply.id ? (
                            <View style={styles.editContainer}>
                              <TextInput
                                style={styles.editInput}
                                value={editingText}
                                onChangeText={setEditingText}
                                multiline
                              />
                              <View style={styles.editActions}>
                                <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelEditing}>
                                  <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSaveEditing}>
                                  <Text style={styles.saveButtonText}>Save</Text>
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.replyContent}>{reply.content}</Text>
                          )}
                          {canManageComment(reply.authorId) && editingTarget.id !== reply.id && (
                            <View style={styles.replyActions}>
                              <Pressable
                                style={[styles.manageActionButton, styles.editActionButton]}
                                onPress={() => handleStartEditing("reply", reply.id, reply.content, comment.id)}
                              >
                                <Text style={styles.manageActionText}>Edit</Text>
                              </Pressable>
                              <Pressable
                                style={[styles.manageActionButton, styles.deleteActionButton]}
                                onPress={() => confirmDeleteComment(reply.id, comment.id)}
                              >
                                <Text style={[styles.manageActionText, styles.manageDeleteText]}>Delete</Text>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      ))}

                      <View style={styles.replyInputWrapper}>
                        <TextInput
                          style={styles.replyInput}
                          placeholder="Write a reply..."
                          placeholderTextColor="#94A3B8"
                          value={replyInputs[comment.id] || ""}
                          onChangeText={(value) => handleReplyChange(comment.id, value)}
                          multiline
                        />
                        <Pressable style={styles.submitButton} onPress={() => handleSubmitReply(comment.id)}>
                          <Text style={styles.submitButtonText}>Reply</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  commentsSection: {
    marginTop: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  commentsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  commentInputWrapper: {
    marginBottom: 24,
  },
  commentInput: {
    minHeight: 70,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 22,
  },
  submitButton: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  commentsLoader: {
    paddingVertical: 20,
  },
  emptyCommentsText: {
    color: "#94A3B8",
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 24,
  },
  commentCard: {
    marginBottom: 18,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  commentAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  commentDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  commentContent: {
    fontSize: 15,
    color: "#1F2937",
    marginBottom: 12,
    lineHeight: 22,
    marginLeft: 4,
  },
  commentActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  replyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },
  replyBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
  },
  manageActions: {
    flexDirection: "row",
    gap: 10,
  },
  manageActionButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  editActionButton: {
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },
  deleteActionButton: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  manageActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  manageDeleteText: {
    color: "#DC2626",
  },
  replySection: {
    marginTop: 16,
    paddingLeft: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#93C5FD",
    gap: 8,
  },
  replyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  replyAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  replyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  replyDate: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  replyContent: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
    marginLeft: 2,
  },
  replyInputWrapper: {
    marginTop: 14,
  },
  replyInput: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
    lineHeight: 20,
  },
  commentActionText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  deleteActionText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
  },
  editContainer: {
    marginBottom: 12,
  },
  editInput: {
    minHeight: 60,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    lineHeight: 22,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelButtonText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#2563EB",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
