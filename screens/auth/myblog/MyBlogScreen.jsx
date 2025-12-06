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
export default function MyBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
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

  const statuses = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"];
  const visibleBlogs =
    statusFilter === "ALL"
      ? blogs
      : blogs.filter((b) => (b.status || "").toUpperCase() === statusFilter);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return {
          backgroundColor: "#DCFCE7",
          color: "#16A34A",
          icon: "check-circle"
        };
      case "DRAFT":
        return {
          backgroundColor: "#FEF9C3",
          color: "#CA8A04",
          icon: "edit"
        };
      case "ARCHIVED":
        return {
          backgroundColor: "#FEE2E2",
          color: "#DC2626",
          icon: "archive"
        };
      default:
        return {
          backgroundColor: "#E5E7EB",
          color: "#374151",
          icon: "help-outline"
        };
    }
  };

  const getStatusCount = (status) => {
    if (status === "ALL") return blogs.length;
    return blogs.filter((b) => (b.status || "").toUpperCase() === status).length;
  };

  return (
    <View style={myBlogStyles.container}>
      {/* Header with Gradient */}
      <View style={myBlogStyles.header}>
        <View style={myBlogStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={myBlogStyles.headerTitle}>My Blogs</Text>
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
        <View style={myBlogStyles.loadingContainer}>
          <LottieView
            source={loadingAnimation}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      ) : blogs.length === 0 ? (
        <View style={myBlogStyles.emptyContainer}>
          <View style={myBlogStyles.emptyCard}>
            <LottieView
              source={require("../../../assets/blog.json")}
              autoPlay
              loop
              style={{ width: 200, height: 200 }}
            />
            <Text style={myBlogStyles.emptyTitle}>Start Your Journey</Text>
            <Text style={myBlogStyles.emptySubtitle}>
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
          <View style={myBlogStyles.filterSection}>
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
                      active && myBlogStyles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        myBlogStyles.filterChipText,
                        active && myBlogStyles.filterChipTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                    <View style={[
                      myBlogStyles.filterChipBadge,
                      active && myBlogStyles.filterChipBadgeActive
                    ]}>
                      <Text style={[
                        myBlogStyles.filterChipBadgeText,
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
                    { opacity: item.status === "ARCHIVED" ? 0.7 : 1 }
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
                        {String(item.status || "DRAFT").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Content Section */}
                  <View style={myBlogStyles.blogContent}>
                    <Text style={myBlogStyles.blogTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={myBlogStyles.blogDesc} numberOfLines={3}>
                      {item.summary || "No summary available"}
                    </Text>

                    {/* Meta Info */}
                    <View style={myBlogStyles.blogMeta}>
                      <View style={myBlogStyles.metaItem}>
                        <Icon name="schedule" size={14} color="#94A3B8" />
                        <Text style={myBlogStyles.metaText}>
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </View>
                      {item.contents && item.contents.length > 0 && (
                        <View style={myBlogStyles.metaItem}>
                          <Icon name="article" size={14} color="#94A3B8" />
                          <Text style={myBlogStyles.metaText}>
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
                        <Icon name="edit" size={18} color="#084F8C" />
                        <Text style={myBlogStyles.actionButtonText}>Edit</Text>
                      </Pressable>
                      <View style={myBlogStyles.actionDivider} />
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