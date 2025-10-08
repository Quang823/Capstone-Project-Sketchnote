import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { myBlogStyles } from "./MyBlogScreen.styles";

const mockPosts = [
  {
    id: 1,
    title: "Cách vẽ concept nhanh bằng iPad",
    thumbnail: "https://i.imgur.com/9Y2w2fQ.jpeg",
    date: "2024-06-01",
    views: 523,
    likes: 45,
    comments: 12,
    category: "Tutorial",
  },
  {
    id: 2,
    title: "Góc chia sẻ: Kinh nghiệm freelance designer",
    thumbnail: "https://i.imgur.com/Ky3sYV2.jpeg",
    date: "2024-05-28",
    views: 412,
    likes: 33,
    comments: 8,
    category: "Experience",
  },
  {
    id: 3,
    title: "10 công cụ AI hỗ trợ designer năm 2024",
    thumbnail: "https://i.imgur.com/7jD5Q8k.jpeg",
    date: "2024-05-20",
    views: 892,
    likes: 67,
    comments: 23,
    category: "Tools",
  },
];

export default function MyBlogScreen({ navigation }) {
  const [posts] = useState(mockPosts);
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Enhanced Profile Card */}
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
                  <Text style={myBlogStyles.joinedText}>Tham gia từ 2024</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={myBlogStyles.statsContainer}>
            <View style={myBlogStyles.statItem}>
              <View style={myBlogStyles.statIconContainer}>
                <Icon name="article" size={20} color="#FFFFFF" />
              </View>
              <Text style={myBlogStyles.statValue}>{posts.length}</Text>
              <Text style={myBlogStyles.statLabel}>Bài viết</Text>
            </View>
            
            <View style={myBlogStyles.statDivider} />
            
            <View style={myBlogStyles.statItem}>
              <View style={myBlogStyles.statIconContainer}>
                <Icon name="visibility" size={20} color="#FFFFFF" />
              </View>
              <Text style={myBlogStyles.statValue}>{(totalViews / 1000).toFixed(1)}K</Text>
              <Text style={myBlogStyles.statLabel}>Lượt xem</Text>
            </View>
            
            <View style={myBlogStyles.statDivider} />
            
            <View style={myBlogStyles.statItem}>
              <View style={myBlogStyles.statIconContainer}>
                <Icon name="favorite" size={20} color="#FFFFFF" />
              </View>
              <Text style={myBlogStyles.statValue}>{totalLikes}</Text>
              <Text style={myBlogStyles.statLabel}>Lượt thích</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Section Header with View Toggle */}
        <View style={myBlogStyles.sectionHeader}>
          <View>
            <Text style={myBlogStyles.sectionTitle}>Bài viết của tôi</Text>
            <Text style={myBlogStyles.sectionSubtitle}>{posts.length} bài viết</Text>
          </View>
          <View style={myBlogStyles.viewToggle}>
            <Pressable 
              onPress={() => setViewMode("list")}
              style={[
                myBlogStyles.toggleButton,
                viewMode === "list" && myBlogStyles.toggleButtonActive
              ]}
            >
              <Icon 
                name="view-list" 
                size={20} 
                color={viewMode === "list" ? "#6366F1" : "#9CA3AF"} 
              />
            </Pressable>
            <Pressable 
              onPress={() => setViewMode("grid")}
              style={[
                myBlogStyles.toggleButton,
                viewMode === "grid" && myBlogStyles.toggleButtonActive
              ]}
            >
              <Icon 
                name="grid-view" 
                size={20} 
                color={viewMode === "grid" ? "#6366F1" : "#9CA3AF"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Blog List/Grid */}
        <View style={myBlogStyles.listContainer}>
          {viewMode === "list" ? (
            // List View
            posts.map((post) => (
              <Pressable
                key={post.id}
                style={myBlogStyles.postCard}
                onPress={() => navigation.navigate("BlogDetail", { id: post.id })}
              >
                <Image
                  source={{ uri: post.thumbnail }}
                  style={myBlogStyles.postImage}
                />
                <View style={myBlogStyles.categoryBadge}>
                  <Text style={myBlogStyles.categoryText}>{post.category}</Text>
                </View>
                
                <View style={myBlogStyles.postContent}>
                  <Text style={myBlogStyles.postTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                  
                  <View style={myBlogStyles.postMeta}>
                    <Icon name="calendar-today" size={14} color="#9CA3AF" />
                    <Text style={myBlogStyles.postDate}>
                      {new Date(post.date).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                  
                  <View style={myBlogStyles.postFooter}>
                    <View style={myBlogStyles.postStats}>
                      <View style={myBlogStyles.statGroup}>
                        <Icon name="favorite" size={16} color="#EF4444" />
                        <Text style={myBlogStyles.statText}>{post.likes}</Text>
                      </View>
                      <View style={myBlogStyles.statGroup}>
                        <Icon name="visibility" size={16} color="#3B82F6" />
                        <Text style={myBlogStyles.statText}>{post.views}</Text>
                      </View>
                      <View style={myBlogStyles.statGroup}>
                        <Icon name="chat-bubble-outline" size={16} color="#10B981" />
                        <Text style={myBlogStyles.statText}>{post.comments}</Text>
                      </View>
                    </View>
                    
                    <View style={myBlogStyles.actionButtons}>
                      <Pressable style={myBlogStyles.actionButton}>
                        <Icon name="edit" size={18} color="#6366F1" />
                      </Pressable>
                      <Pressable style={myBlogStyles.actionButton}>
                        <Icon name="more-vert" size={18} color="#9CA3AF" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            // Grid View
            <View style={myBlogStyles.gridContainer}>
              {posts.map((post) => (
                <Pressable
                  key={post.id}
                  style={myBlogStyles.postGridItem}
                  onPress={() => navigation.navigate("BlogDetail", { id: post.id })}
                >
                  <Image
                    source={{ uri: post.thumbnail }}
                    style={myBlogStyles.postImageGrid}
                  />
                  <View style={myBlogStyles.categoryBadgeSmall}>
                    <Text style={myBlogStyles.categoryTextSmall}>{post.category}</Text>
                  </View>
                  
                  <View style={myBlogStyles.postContentGrid}>
                    <Text style={myBlogStyles.postTitleGrid} numberOfLines={2}>
                      {post.title}
                    </Text>
                    
                    <View style={myBlogStyles.postStatsGrid}>
                      <View style={myBlogStyles.statGroupSmall}>
                        <Icon name="favorite" size={12} color="#EF4444" />
                        <Text style={myBlogStyles.statTextSmall}>{post.likes}</Text>
                      </View>
                      <View style={myBlogStyles.statGroupSmall}>
                        <Icon name="visibility" size={12} color="#3B82F6" />
                        <Text style={myBlogStyles.statTextSmall}>{post.views}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Empty State if no posts */}
        {posts.length === 0 && (
          <View style={myBlogStyles.emptyState}>
            <Icon name="edit-note" size={80} color="#E5E7EB" />
            <Text style={myBlogStyles.emptyTitle}>Chưa có bài viết nào</Text>
            <Text style={myBlogStyles.emptySubtitle}>
              Bắt đầu viết blog đầu tiên của bạn ngay hôm nay!
            </Text>
            <Pressable style={myBlogStyles.emptyButton}>
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={myBlogStyles.emptyButtonText}>Tạo bài viết</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}