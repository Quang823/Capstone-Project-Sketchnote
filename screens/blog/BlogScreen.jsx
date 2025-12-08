import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Animated,
  Dimensions,
  Alert,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { blogStyles } from "./BlogScreen.styles";
import { blogService } from "../../service/blogService";
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";
import loadingAnimation from "../../assets/loading.json";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 4;
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - (NUM_COLUMNS + 1) * CARD_MARGIN - 32) / NUM_COLUMNS;

export default function BlogScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const animatedGradient = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedGradient, {
        toValue: 1,
        duration: 12000,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: false,
      })
    ).start();
  }, []);
  const animatedColors = animatedGradient.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      "#0ea5e9",  // cyan
      "#3c47e6ff",  // indigo
      "#0ea5e9",  // về cyan
    ],
  });

  // 🔹 Fetch blogs từ API
  const fetchBlogs = async () => {
    try {
      const response = await blogService.getAllBlogs(0, 10);

      // ✅ FIX: Truy cập đúng cấu trúc dữ liệu từ API
      // response có cấu trúc: { data: { code, message, result: { content: [...] } } }
      const data = response.result?.content || [];

      //console.log("Fetched blogs:", data);
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't load blog list",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, blogs]);

  // 🔹 Lọc bài viết theo tìm kiếm
  const filterBlogs = () => {
    let filtered = blogs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          (b.authorDisplay && b.authorDisplay.toLowerCase().includes(query))
      );
    }

    setFilteredBlogs(filtered);
  };

  const handleViewBlog = (blogId) => {
    navigation.navigate("BlogDetail", { blogId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={blogStyles.centerContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
        {/* <Text style={blogStyles.loadingText}>
          Loading blogs...
        </Text> */}
      </View>
    );
  }

  return (
    <View style={blogStyles.container}>
      {/* 🔹 Header */}

      <View style={blogStyles.header}>
        <View style={blogStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={blogStyles.headerTitle}>Blog & Insights</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 🎨 Hero Section – Animated Gradient */}
        <Animated.View
          style={{
            width: "100%",
            borderRadius: 0,
            overflow: "hidden",
            backgroundColor: animatedColors,
          }}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.05)", "rgba(0,0,0,0.15)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={blogStyles.heroSection}
          >
            {/* Glow Text */}
            <Text
              style={[
                blogStyles.heroTitle,
                {
                  textShadowColor: "rgba(255,255,255,0.5)",
                  textShadowRadius: 12
                }
              ]}
            >
              Discover Amazing Stories
            </Text>

            <Text style={blogStyles.heroSubtitle}>
              Explore our collection of insights, tutorials, and creative inspiration
            </Text>

            {/* Search in Hero */}
            <View style={blogStyles.heroSearchContainer}>
              <Icon name="search" size={22} color="#136bb8ff" style={blogStyles.heroSearchIcon} />
              <TextInput
                style={blogStyles.heroSearchInput}
                placeholder="Search for inspiration..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Icon name="close" size={22} color="#64748B" />
                </Pressable>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>


        {/* Featured Section */}
        {filteredBlogs.length > 0 && !searchQuery && (
          <View style={blogStyles.featuredSection}>
            <Text style={blogStyles.sectionTitle}>✨ Featured Story</Text>
            <Pressable
              style={blogStyles.featuredCard}
              onPress={() => handleViewBlog(filteredBlogs[0].id)}
            >
              <LinearGradient
                colors={["#5eadf2ff", "#1d7accff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={blogStyles.featuredGradient}
              >
                <Image
                  source={{
                    uri: filteredBlogs[0].imageUrl || "https://via.placeholder.com/600x300",
                  }}
                  style={blogStyles.featuredImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
                  style={blogStyles.featuredOverlay}
                >
                  <View style={blogStyles.featuredBadge}>
                    <Icon name="star" size={16} color="#FCD34D" />
                    <Text style={blogStyles.featuredBadgeText}>Featured</Text>
                  </View>
                  <Text style={blogStyles.featuredTitle} numberOfLines={2}>
                    {filteredBlogs[0].title || "Untitled"}
                  </Text>
                  <View style={blogStyles.featuredMeta}>
                    <Icon name="person" size={14} color="#E0F2FE" />
                    <Text style={blogStyles.featuredAuthor}>
                      {filteredBlogs[0].authorDisplay || "Anonymous"}
                    </Text>
                    <Icon name="schedule" size={14} color="#E0F2FE" style={{ marginLeft: 12 }} />
                    <Text style={blogStyles.featuredDate}>
                      {new Date(filteredBlogs[0].createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* Recent Posts Section */}
        <View style={blogStyles.recentSection}>
          <Text style={blogStyles.sectionTitle}>
            📚 {searchQuery ? "Search Results" : "Recent Posts"}
          </Text>

          {filteredBlogs.length === 0 ? (
            <View style={blogStyles.emptyContainer}>
              <View style={blogStyles.emptyIconContainer}>
                <LottieView
                  source={require("../../assets/comment.json")}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100 }}
                />
              </View>
              <Text style={blogStyles.emptyText}>No articles found</Text>
              <Text style={blogStyles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : (
            <View style={blogStyles.blogListContainer}>
              {(searchQuery ? filteredBlogs : filteredBlogs.slice(1)).map((item, index) => (
                <Pressable
                  key={item.id}
                  style={blogStyles.horizontalCard}
                  onPress={() => handleViewBlog(item.id)}
                >
                  <View style={blogStyles.horizontalCardInner}>
                    {/* Image on Left */}
                    <Image
                      source={{
                        uri: item.imageUrl || "https://via.placeholder.com/300x200",
                      }}
                      style={blogStyles.horizontalImage}
                      resizeMode="cover"
                    />

                    {/* Content on Right */}
                    <View style={blogStyles.horizontalContent}>
                      {/* Category Badge (if available) */}
                      <View style={blogStyles.categoryBadge}>
                        <Text style={blogStyles.categoryText}>Article</Text>
                      </View>

                      {/* Title */}
                      <Text style={blogStyles.horizontalTitle} numberOfLines={2}>
                        {item.title || "Untitled"}
                      </Text>

                      {/* Summary/Excerpt */}
                      <Text style={blogStyles.horizontalSummary} numberOfLines={3}>
                        {item.summary || "No description available"}
                      </Text>

                      {/* Footer Meta */}
                      <View style={blogStyles.horizontalFooter}>
                        {/* Author */}
                        <View style={blogStyles.authorInfo}>
                          <View style={blogStyles.authorAvatar}>
                            <Icon name="person" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={blogStyles.authorName} numberOfLines={1}>
                            {item.authorDisplay || "Anonymous"}
                          </Text>
                        </View>

                        {/* Divider */}
                        <View style={blogStyles.metaDivider} />

                        {/* Date */}
                        {item.createdAt && (
                          <>
                            <Icon name="schedule" size={14} color="#94A3B8" />
                            <Text style={blogStyles.metaText}>
                              {new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Text>
                          </>
                        )}

                        {/* Read Time (estimated) */}
                        <View style={blogStyles.metaDivider} />
                        <Icon name="timer" size={14} color="#94A3B8" />
                        <Text style={blogStyles.metaText}>5 min read</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
