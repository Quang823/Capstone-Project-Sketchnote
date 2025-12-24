import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getBlogByUserId();
      setBlogs(res.result || []);
    } catch (error) {
      console.error("❌ Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBlog = (blog) => {
    navigation.navigate("UpdateBlog", { blog });
  };

  const handleViewBlog = (blogId) => {
    navigation.navigate("BlogDetail", { blogId });
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
      console.error("❌ Delete failed:", err.message);
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

  const statuses = ["ALL", "PUBLISHED", "PENDING_REVIEW", "REJECTED"];
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
                  onPress={() => handleViewBlog(item.id)}
                >
                  {/* Image Section */}
                  <View style={myBlogStyles.blogImageContainer}>
                    <Image
                      source={{
                        uri: item.imageUrl || "https://i.imgur.com/9Y2w2fQ.jpeg",
                      }}
                      style={myBlogStyles.blogImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={myBlogStyles.blogImageGradient}
                    />
                    <View style={[
                      myBlogStyles.statusBadge,
                      { backgroundColor: statusStyle.backgroundColor }
                    ]}>
                      <Icon name={statusStyle.icon} size={12} color={statusStyle.color} />
                      <Text style={[
                        myBlogStyles.statusBadgeText,
                        { color: statusStyle.color }
                      ]}>
                        {String(item.status || "PENDING_REVIEW").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Content Section */}
                  <View style={myBlogStyles.blogContent}>
                    <Text style={[myBlogStyles.blogTitle, isDark && myBlogStyles.blogTitleDark]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[myBlogStyles.blogDesc, isDark && myBlogStyles.blogDescDark]} numberOfLines={3}>
                      {item.summary || "No summary available"}
                    </Text>

                    {/* Meta Info */}
                    <View style={[myBlogStyles.blogMeta, isDark && myBlogStyles.blogMetaDark]}>
                      <View style={myBlogStyles.metaItem}>
                        <Icon name="schedule" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                        <Text style={[myBlogStyles.metaText, isDark && myBlogStyles.metaTextDark]}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                      {item.contents && item.contents.length > 0 && (
                        <View style={myBlogStyles.metaItem}>
                          <Icon name="article" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                          <Text style={[myBlogStyles.metaText, isDark && myBlogStyles.metaTextDark]}>
                            {item.contents.length} {item.contents.length > 1 ? "sections" : "section"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Action Buttons */}
                    <View style={myBlogStyles.blogActions}>
                      <Pressable
                        onPress={() => handleUpdateBlog(item)}
                        style={myBlogStyles.actionButton}
                      >
                        <Icon name="edit" size={18} color={isDark ? "#60A5FA" : "#084F8C"} />
                        <Text style={[myBlogStyles.actionButtonText, isDark && myBlogStyles.actionButtonTextDark]}>Edit</Text>
                      </Pressable>
                      <View style={[myBlogStyles.actionDivider, isDark && myBlogStyles.actionDividerDark]} />
                      <Pressable
                        onPress={() => handleDeleteBlog(item.id)}
                        style={myBlogStyles.actionButton}
                      >
                        <DeleteConfirmModal
                          visible={deleteModalVisible}
                          onClose={() => setDeleteModalVisible(false)}
                          onConfirm={confirmDelete}
                          blogTitle={blogToDelete?.title}
                        />
                        <Icon name="delete-outline" size={18} color="#EF4444" />
                        <Text style={[myBlogStyles.actionButtonText, { color: "#EF4444" }]}>
                          Delete
                        </Text>
                      </Pressable>
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
    </View>
  );
}