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
export default function MyBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getBlogByUserId();
      console.log("📚 Fetched blogs:", res);
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

  const handleDeleteBlog = async (id) => {
    Alert.alert("Delete Blog", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await blogService.deleteBlog(id);
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
        },
      },
    ]);
  };

  // Refresh khi màn hình được focus
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
      return { backgroundColor: "#DCFCE7", color: "#16A34A" }; // xanh lá
    case "DRAFT":
      return { backgroundColor: "#FEF9C3", color: "#CA8A04" }; // vàng
    case "ARCHIVED":
      return { backgroundColor: "#FEE2E2", color: "#DC2626" }; // đỏ nhạt
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" }; // xám
  }
};

  return (
    <View style={myBlogStyles.container}>
      {/* Header */}
      <View style={myBlogStyles.header}>
        <View style={myBlogStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={myBlogStyles.headerTitle}>Manage My Blogs</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={myBlogStyles.loadingContainer}>
          <View style={myBlogStyles.centerContainer}>
            <LottieView
              source={loadingAnimation}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
            {/* <Text style={myBlogStyles.loadingText}>Loading your blogs...</Text> */}
          </View>
        </View>
      ) : blogs.length === 0 ? (
        <View style={myBlogStyles.emptyContainer}>
          <Icon name="article" size={60} color="#667EEA" />
          <Text style={myBlogStyles.emptyTitle}>No blogs found</Text>
          <Text style={myBlogStyles.emptySubtitle}>
            Create your first blog post to get started
          </Text>
          <Pressable
            onPress={() => navigation.navigate("CreateBlog")}
            style={myBlogStyles.createButton}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={myBlogStyles.createButtonGradient}
            >
              <Icon name="edit" size={20} color="#fff" />
              <Text style={myBlogStyles.createButtonText}>Create Blog</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={myBlogStyles.filterBar}>
            {statuses.map((s) => {
              const active = statusFilter === s;
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
                </Pressable>
              );
            })}
          </View>
          <ScrollView contentContainerStyle={myBlogStyles.listContainer}>
            {visibleBlogs?.map((item) => (
              <Pressable
                key={item.id}
                style={myBlogStyles.blogItem}
                onPress={() => handleViewBlog(item.id)}
              >
                <Image
                  source={{
                    uri: item.imageUrl || "https://i.imgur.com/9Y2w2fQ.jpeg",
                  }}
                  style={myBlogStyles.blogImage}
                />
                <View style={myBlogStyles.blogInfo}>
                  <Text style={myBlogStyles.blogTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={myBlogStyles.blogDesc} numberOfLines={2}>
                    {item.summary || "No summary available"}
                  </Text>
                 {item.status ? (
  <View
    style={[
      myBlogStyles.statusBadge,
      { backgroundColor: getStatusStyle(item.status).backgroundColor }
    ]}
  >
    <Text
      style={[
        myBlogStyles.statusBadgeText,
        { color: getStatusStyle(item.status).color }
      ]}
    >
      {String(item.status).toUpperCase()}
    </Text>
  </View>
) : null}

                  <View style={myBlogStyles.blogMeta}>
                    <Text style={myBlogStyles.blogDate}>
                      🕒 {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    {item.contents && item.contents.length > 0 && (
                      <Text style={myBlogStyles.blogSections}>
                        📄 {item.contents.length} section
                        {item.contents.length > 1 ? "s" : ""}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={myBlogStyles.actionColumn}>
                  <Pressable onPress={() => handleUpdateBlog(item)}>
                    <Icon name="edit" size={22} color="#667EEA" />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteBlog(item.id)}>
                    <Icon name="delete-outline" size={22} color="#F5576C" />
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
