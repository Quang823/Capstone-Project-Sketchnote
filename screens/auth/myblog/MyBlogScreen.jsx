import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { blogService } from "../../../service/blogService";
import { myBlogStyles } from "./MyBlogScreen.styles";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { useTheme } from "../../../context/ThemeContext";

export default function MyBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [moderationInfo, setModerationInfo] = useState(null);
  const [loadingModeration, setLoadingModeration] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getBlogByUserId();
      setBlogs(res.result || []);
    } catch (error) {
      console.warn("❌ Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = (blog) => {
    navigation.navigate("UpdateBlog", { blog });
  };

  const handleViewBlog = async (item) => {
    // If AI_REJECTED, show rejection reason modal
    if (item.status === "AI_REJECTED") {
      try {
        setLoadingModeration(true);
        setRejectionModalVisible(true);
        const moderationData = await blogService.getBLogwithModeration(item.id);
        if (moderationData.result && moderationData.result.length > 0) {
          setModerationInfo(moderationData.result[0]);
        }
      } catch (error) {
        console.warn("❌ Error fetching moderation info:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load rejection details",
        });
      } finally {
        setLoadingModeration(false);
      }
    } else {
      navigation.navigate("BlogDetail", { blogId: item.id });
    }
  };

  const handleDeleteBlog = (blogId) => {
    const blog = blogs.find(b => b.id === blogId);
    setBlogToDelete(blog);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      await blogService.deleteBlog(blogToDelete.id);
      setDeleteModalVisible(false);
      setBlogToDelete(null);
      fetchBlogs();
      Toast.show({
        type: "success",
        text1: "Blog deleted successfully",
      });
    } catch (err) {
      console.warn("❌ Delete failed:", err.message);
      Toast.show({
        type: "error",
        text1: "Delete failed",
        text2: err.message,
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBlogs();
    }, [])
  );

  const statuses = ["ALL", "PUBLISHED", "PENDING_REVIEW", "REJECTED", "AI_REJECTED"];
  const visibleBlogs =
    statusFilter === "ALL"
      ? blogs
      : blogs.filter((b) => (b.status || "").toUpperCase() === statusFilter);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return {
          backgroundColor: isDark ? "#064E3B" : "#DCFCE7",
          color: isDark ? "#6EE7B7" : "#16A34A",
          icon: "check-circle"
        };
      case "PENDING_REVIEW":
        return {
          backgroundColor: isDark ? "#1e3a8a" : "#DBEAFE",
          color: isDark ? "#60A5FA" : "#1E40AF",
          icon: "schedule"
        };
      case "REJECTED":
        return {
          backgroundColor: isDark ? "#450a0a" : "#FEE2E2",
          color: isDark ? "#fca5a5" : "#DC2626",
          icon: "cancel"
        };
      case "AI_REJECTED":
        return {
          backgroundColor: isDark ? "#450a0a" : "#FEE2E2",
          color: isDark ? "#fca5a5" : "#DC2626",
          icon: "block"
        };
      default:
        return {
          backgroundColor: isDark ? "#334155" : "#E5E7EB",
          color: isDark ? "#94A3B8" : "#374151",
          icon: "help-outline"
        };
    }
  };

  const getStatusCount = (status) => {
    if (status === "ALL") return blogs.length;
    return blogs.filter((b) => (b.status || "").toUpperCase() === status).length;
  };

  return (
    <View style={[myBlogStyles.container, isDark && myBlogStyles.containerDark]}>
      {/* Header with Gradient */}
      <View style={[myBlogStyles.header, isDark && myBlogStyles.headerDark]}>
        <View style={myBlogStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor={isDark ? "#FFFFFF" : "#1E40AF"} />
          <Text style={[myBlogStyles.headerTitle, isDark && myBlogStyles.headerTitleDark]}>My Blogs</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate("CreateBlog")}
          style={myBlogStyles.createButton}
        >
          <LinearGradient
            colors={["#084F8C", "#084F8C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={myBlogStyles.createButtonGradient}
          >
            <Icon name="create" size={22} color="#fff" />
            <Text style={myBlogStyles.createButtonText}>Create New Blog</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <View style={[myBlogStyles.loadingContainer, isDark && myBlogStyles.loadingContainerDark]}>
          <LottieView
            source={loadingAnimation}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      ) : blogs.length === 0 ? (
        <View style={[myBlogStyles.emptyContainer, isDark && myBlogStyles.emptyContainerDark]}>
          <View style={[myBlogStyles.emptyCard, isDark && myBlogStyles.emptyCardDark]}>
            <LottieView
              source={require("../../../assets/blog.json")}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
            <Text style={[myBlogStyles.emptyTitle, isDark && myBlogStyles.emptyTitleDark]}>Start Your Journey</Text>
            <Text style={[myBlogStyles.emptySubtitle, isDark && myBlogStyles.emptySubtitleDark]}>
              Share your thoughts and stories with the world.{"\n"}
              Create your first blog post today!
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateBlog")}
              style={myBlogStyles.createButton}
            >
              <LinearGradient
                colors={["#084F8C", "#084F8C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={myBlogStyles.createButtonGradient}
              >
                <Icon name="create" size={22} color="#fff" />
                <Text style={myBlogStyles.createButtonText}>Create Your First Blog</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          {/* Filter Chips */}
          <View style={[myBlogStyles.filterSection, isDark && myBlogStyles.filterSectionDark]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={myBlogStyles.filterBar}
            >
              {statuses.map((s) => {
                const active = statusFilter === s;
                const count = getStatusCount(s);
                return (
                  <Pressable
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={[
                      myBlogStyles.filterChip,
                      isDark && myBlogStyles.filterChipDark,
                      active && myBlogStyles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        myBlogStyles.filterChipText,
                        isDark && myBlogStyles.filterChipTextDark,
                        active && myBlogStyles.filterChipTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                    <View style={[
                      myBlogStyles.filterChipBadge,
                      isDark && myBlogStyles.filterChipBadgeDark,
                      active && myBlogStyles.filterChipBadgeActive
                    ]}>
                      <Text style={[
                        myBlogStyles.filterChipBadgeText,
                        isDark && myBlogStyles.filterChipBadgeTextDark,
                        active && myBlogStyles.filterChipBadgeTextActive
                      ]}>
                        {count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Blog List */}
          <ScrollView
            contentContainerStyle={myBlogStyles.listContainer}
            showsVerticalScrollIndicator={false}
          >
            {visibleBlogs?.map((item, index) => {
              const statusStyle = getStatusStyle(item.status);
              return (
                <Pressable
                  key={item.id}
                  style={[
                    myBlogStyles.blogCard,
                    isDark && myBlogStyles.blogCardDark,
                    { opacity: (item.status === "REJECTED" || item.status === "AI_REJECTED") ? 0.7 : 1 }
                  ]}
                  onPress={() => handleViewBlog(item)}
                >
                  {/* Horizontal Layout */}
                  <View style={{ flexDirection: 'row' }}>
                    {/* Image Section - Left Side */}
                    <View style={myBlogStyles.blogImageContainer}>
                      <Image
                        source={{
                          uri: item.imageUrl || "https://i.imgur.com/9Y2w2fQ.jpeg",
                        }}
                        style={myBlogStyles.blogImage}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)']}
                        style={myBlogStyles.blogImageGradient}
                      />
                    </View>

                    {/* Content Section - Middle */}
                    <View style={myBlogStyles.blogContent}>
                      {/* Top Row: Status Badge + Action Buttons */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        {/* Status Badge */}
                        <View style={[
                          myBlogStyles.statusBadge,
                          { backgroundColor: statusStyle.backgroundColor, position: 'relative', top: 0, right: 0 }
                        ]}>
                          <Icon name={statusStyle.icon} size={10} color={statusStyle.color} />
                          <Text style={[
                            myBlogStyles.statusBadgeText,
                            { color: statusStyle.color }
                          ]}>
                            {String(item.status || "PENDING_REVIEW").toUpperCase()}
                          </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <Pressable
                            onPress={() => handleUpdateBlog(item)}
                            style={myBlogStyles.actionButtonVertical}
                          >
                            <Icon name="edit" size={18} color={isDark ? "#60A5FA" : "#084F8C"} />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDeleteBlog(item.id)}
                            style={myBlogStyles.actionButtonVertical}
                          >
                            <DeleteConfirmModal
                              visible={deleteModalVisible}
                              onClose={() => setDeleteModalVisible(false)}
                              onConfirm={confirmDelete}
                              blogTitle={blogToDelete?.title}
                            />
                            <Icon name="delete-outline" size={18} color="#EF4444" />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={[myBlogStyles.blogTitle, isDark && myBlogStyles.blogTitleDark]} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={[myBlogStyles.blogDesc, isDark && myBlogStyles.blogDescDark]} numberOfLines={2}>
                        {item.summary || "No summary available"}
                      </Text>

                      {/* Meta Info */}
                      <View style={[myBlogStyles.blogMeta, isDark && myBlogStyles.blogMetaDark]}>
                        <View style={myBlogStyles.metaItem}>
                          <Icon name="schedule" size={12} color={isDark ? "#94A3B8" : "#94A3B8"} />
                          <Text style={[myBlogStyles.metaText, isDark && myBlogStyles.metaTextDark]}>
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                        {item.contents && item.contents.length > 0 && (
                          <View style={myBlogStyles.metaItem}>
                            <Icon name="article" size={12} color={isDark ? "#94A3B8" : "#94A3B8"} />
                            <Text style={[myBlogStyles.metaText, isDark && myBlogStyles.metaTextDark]}>
                              {item.contents.length}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}

            {/* Bottom Padding */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </>
      )}

      {/* AI Rejection Reason Modal */}
      <Modal
        visible={rejectionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRejectionModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setRejectionModalVisible(false)}
        >
          <Pressable
            style={[
              myBlogStyles.emptyCard,
              isDark && myBlogStyles.emptyCardDark,
              { maxWidth: '95%', width: 550, maxHeight: '85%' }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[myBlogStyles.emptyTitle, { fontSize: 20, marginTop: 0 }]}>AI Rejection Details</Text>
              <Pressable onPress={() => setRejectionModalVisible(false)}>
                <Icon name="close" size={24} color={isDark ? "#F8FAFC" : "#0F172A"} />
              </Pressable>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 400 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {loadingModeration ? (
                <ActivityIndicator size="large" color="#084F8C" />
              ) : moderationInfo ? (
                <View>
                  {/* Safety Score */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={[myBlogStyles.emptySubtitle, { fontSize: 13, fontWeight: '600', marginBottom: 8 }]}>Safety Score</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{
                          width: `${moderationInfo.safetyScore}%`,
                          height: '100%',
                          backgroundColor: moderationInfo.safetyScore >= 70 ? '#52c41a' : moderationInfo.safetyScore >= 40 ? '#faad14' : '#ff4d4f'
                        }} />
                      </View>
                      <Text style={{ fontWeight: '700', fontSize: 16, color: moderationInfo.safetyScore >= 70 ? '#52c41a' : moderationInfo.safetyScore >= 40 ? '#faad14' : '#ff4d4f' }}>
                        {moderationInfo.safetyScore}/100
                      </Text>
                    </View>
                  </View>

                  {/* Rejection Reason */}
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[myBlogStyles.emptySubtitle, { fontSize: 13, fontWeight: '600', marginBottom: 8 }]}>Violations Detected</Text>
                    <View style={{
                      padding: 14,
                      backgroundColor: isDark ? '#450a0a' : '#FEE2E2',
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isDark ? '#7f1d1d' : '#fca5a5',
                    }}>
                      {moderationInfo.reason.split('\\n').filter(line => !line.toLowerCase().includes('safety score')).map((line, index) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return null;

                        if (trimmedLine.startsWith('- ')) {
                          return (
                            <View key={index} style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' }}>
                              <Text style={{ color: '#DC2626', marginRight: 8, fontWeight: '700' }}>•</Text>
                              <Text style={{ flex: 1, color: isDark ? '#fca5a5' : '#DC2626', fontSize: 13, lineHeight: 20 }}>
                                {trimmedLine.substring(2)}
                              </Text>
                            </View>
                          );
                        }
                        return (
                          <Text key={index} style={{
                            fontWeight: trimmedLine.includes('Violations detected') ? '700' : '400',
                            color: isDark ? '#fca5a5' : '#DC2626',
                            fontSize: 13,
                            marginBottom: 6,
                            lineHeight: 20
                          }}>
                            {trimmedLine}
                          </Text>
                        );
                      })}
                    </View>
                  </View>

                  {/* Checked At */}
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[myBlogStyles.emptySubtitle, { fontSize: 11, textAlign: 'center' }]}>
                      Checked at: {new Date(moderationInfo.checkedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[myBlogStyles.emptySubtitle, { textAlign: 'center' }]}>No moderation information available</Text>
              )}
            </ScrollView>

            {/* Close Button */}
            <Pressable
              onPress={() => setRejectionModalVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: '#084F8C',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}