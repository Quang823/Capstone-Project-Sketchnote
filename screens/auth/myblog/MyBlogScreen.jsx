import React, { useState, useCallback, useEffect } from "react";
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

export default function MyBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const res = await blogService.getBlogByUserId();
      setBlogs(res || []);
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
          } catch (err) {
            console.error("❌ Delete failed:", err.message);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <View style={myBlogStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={myBlogStyles.header}
      >
        <Pressable onPress={() => navigation.goBack()} style={myBlogStyles.headerButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={myBlogStyles.headerTitle}>Manage My Blogs</Text>
        <Pressable
          onPress={() => navigation.navigate("CreateBlog")}
          style={myBlogStyles.headerButton}
        >
          <Icon name="add" size={28} color="#fff" />
        </Pressable>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={myBlogStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={myBlogStyles.loadingText}>Loading your blogs...</Text>
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
              colors={["#667EEA", "#764BA2"]}
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
          {blogs.map((item) => (
            <View key={item.id} style={myBlogStyles.blogItem}>
              <Image
                source={{
                  uri: item.imageurl || "https://i.imgur.com/9Y2w2fQ.jpeg",
                }}
                style={myBlogStyles.blogImage}
              />
              <View style={myBlogStyles.blogInfo}>
                <Text style={myBlogStyles.blogTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={myBlogStyles.blogDesc} numberOfLines={2}>
                  {item.content}
                </Text>
                <Text style={myBlogStyles.blogDate}>
                  🕒 {new Date(item.createdAt).toLocaleDateString()}
                </Text>
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
