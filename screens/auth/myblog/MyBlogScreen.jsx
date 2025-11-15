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

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await blogService.getBlogByUserId();
      // console.log("📚 Fetched blogs:", res);
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
        <ScrollView contentContainerStyle={myBlogStyles.listContainer}>
          {blogs?.map((item) => (
            <View key={item.id} style={myBlogStyles.blogItem}>
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
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
