import React, { useEffect, useState } from "react";
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
import { myBlogStyles } from "./MyBlogScreen.styles";
import { blogService } from "../../../service/blogService";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function MyBlogScreen({ navigation }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
 


  const fetchBlogs = async () => {
    try {
      const res = await blogService.getBlogByUserId();
      console.log("📄 API blogs:", res);
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


  
  const handleDeleteBlog = async (blogId) => {
    Alert.alert("Delete Blog", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await blogService.deleteBlog(blogId);
            console.log("🗑 Blog deleted!");
            fetchBlogs();
          } catch (err) {
            console.error("❌ Delete failed:", err.message);
          }
        },
      },
    ]);
  };

  useFocusEffect(
  useCallback(() => {
    fetchBlogs();
  }, [])
);


  return (
    <View style={myBlogStyles.container}>
      {/* Header */}
      <View style={myBlogStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={myBlogStyles.headerTitle}>My Blog</Text>
        <Pressable onPress={() => navigation.navigate("CreateBlog")}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={myBlogStyles.addButton}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <LinearGradient
            colors={["#667EEA", "#764BA2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={myBlogStyles.profileCard}
          >
            <View style={myBlogStyles.profileHeader}>
              <View style={myBlogStyles.profileRow}>
                <View style={myBlogStyles.avatarContainer}>
                  <Image
                    source={{ uri: "https://i.imgur.com/WxNkK8Q.png" }}
                    style={myBlogStyles.avatar}
                  />
                  <View style={myBlogStyles.verifiedBadge}>
                    <Icon name="verified" size={16} color="#3B82F6" />
                  </View>
                </View>
                <View style={myBlogStyles.userInfo}>
                  <Text style={myBlogStyles.userName}>Quang Hao</Text>
                  <Text style={myBlogStyles.userSubtitle}>Designer & Blogger</Text>
                  <View style={myBlogStyles.joinedContainer}>
                    <Icon name="access-time" size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={myBlogStyles.joinedText}>Joined since 2024</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={myBlogStyles.statsContainer}>
              <View style={myBlogStyles.statItem}>
                <View style={myBlogStyles.statIconContainer}>
                  <Icon name="article" size={20} color="#FFFFFF" />
                </View>
                <Text style={myBlogStyles.statValue}>{blogs.length}</Text>
                <Text style={myBlogStyles.statLabel}>Posts</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Section Header */}
          <View style={myBlogStyles.sectionHeader}>
            <View>
              <Text style={myBlogStyles.sectionTitle}>My Posts</Text>
              <Text style={myBlogStyles.sectionSubtitle}>{blogs.length} posts</Text>
            </View>
          
          </View>

          {/* Blog List */}
          <View style={[myBlogStyles.listContainer, myBlogStyles.gridContainer]}>
  {blogs.length === 0 ? (
    <View style={myBlogStyles.emptyState}>
      <Icon name="edit-note" size={80} color="#E5E7EB" />
      <Text style={myBlogStyles.emptyTitle}>No posts yet</Text>
      <Text style={myBlogStyles.emptySubtitle}>
        Start writing your first blog post today!
      </Text>
      <Pressable
        style={myBlogStyles.emptyButton}
        onPress={() => navigation.navigate("CreateBlog")}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={myBlogStyles.emptyButtonText}>Create a post</Text>
      </Pressable>
    </View>
  ) : (
    blogs.map((item) => (
      <View key={item.id} style={myBlogStyles.postGridItem}>
        <Image
          source={{ uri: item.imageurl || "https://i.imgur.com/9Y2w2fQ.jpeg" }}
          style={myBlogStyles.postImageGrid}
        />

        <View style={myBlogStyles.postContentGrid}>
          <Text style={myBlogStyles.postTitleGrid} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={myBlogStyles.postSubtitle} numberOfLines={2}>
            {item.content}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Pressable onPress={() => handleUpdateBlog(item)}>
              <Icon name="edit" size={20} color="#4F46E5" />
            </Pressable>
            <Pressable onPress={() => handleDeleteBlog(item.id)}>
              <Icon name="delete-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </View>
    ))
  )}
</View>

        </ScrollView>
      )}
    </View>
  );
}
