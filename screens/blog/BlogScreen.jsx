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
import { useTheme } from "../../context/ThemeContext";
import NotificationButton from "../../components/common/NotificationButton";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
      const data = response.result?.content || [];
      setBlogs(data);
      setFilteredBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // Toast.show({
      //   type: "error",
      //   text1: "Error",
      //   text2: "Can't load blog list",
      // });
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
      <View style={[blogStyles.centerContainer, isDark && blogStyles.centerContainerDark]}>
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
    <View style={[blogStyles.container, isDark && blogStyles.containerDark]}>
      {/* 🔹 Header */}

      <View style={[blogStyles.header, isDark && blogStyles.headerDark]}>
        <View style={blogStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor={isDark ? "#FFFFFF" : "#1E40AF"} />
          <Text style={[blogStyles.headerTitle, isDark && blogStyles.headerTitleDark]}>Blog & Insights</Text>
        </View>
        <NotificationButton />
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
            <View style={[blogStyles.heroSearchContainer, isDark && blogStyles.heroSearchContainerDark]}>
              <Icon name="search" size={22} color={isDark ? "#94A3B8" : "#136bb8ff"} style={blogStyles.heroSearchIcon} />
              <TextInput
                style={[blogStyles.heroSearchInput, isDark && blogStyles.heroSearchInputDark]}
                placeholder="Search for inspiration..."
                placeholderTextColor={isDark ? "#94A3B8" : "#94A3B8"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Icon name="close" size={22} color={isDark ? "#94A3B8" : "#64748B"} />
                </Pressable>
              ) : null}
            </View>
          </LinearGradient>
        </Animated.View>


        {/* Featured Section */}
        {filteredBlogs.length > 0 && !searchQuery && (
          <View style={blogStyles.featuredSection}>
            <Text style={[blogStyles.sectionTitle, isDark && blogStyles.sectionTitleDark]}>✨ Featured Story</Text>
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
          <Text style={[blogStyles.sectionTitle, isDark && blogStyles.sectionTitleDark]}>
            📚 {searchQuery ? "Search Results" : "Recent Posts"}
          </Text>

          {filteredBlogs.length === 0 ? (
            <View style={blogStyles.emptyContainer}>
              <View style={[blogStyles.emptyIconContainer, isDark && blogStyles.emptyIconContainerDark]}>
                <LottieView
                  source={require("../../assets/comment.json")}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100 }}
                />
              </View>
              <Text style={[blogStyles.emptyText, isDark && blogStyles.emptyTextDark]}>No articles found</Text>
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
                  <View style={[blogStyles.horizontalCardInner, isDark && blogStyles.horizontalCardInnerDark]}>
                    {/* Image on Left */}
                    <Image
                      source={{
                        uri: item.imageUrl || "https://via.placeholder.com/300x200",
                      }}
                      style={[blogStyles.horizontalImage, isDark && blogStyles.horizontalImageDark]}
                      resizeMode="cover"
                    />

                    {/* Content on Right */}
                    <View style={blogStyles.horizontalContent}>
                      {/* Category Badge (if available) */}
                      <View style={[blogStyles.categoryBadge, isDark && blogStyles.categoryBadgeDark]}>
                        <Text style={[blogStyles.categoryText, isDark && blogStyles.categoryTextDark]}>Article</Text>
                      </View>

                      {/* Title */}
                      <Text style={[blogStyles.horizontalTitle, isDark && blogStyles.horizontalTitleDark]} numberOfLines={2}>
                        {item.title || "Untitled"}
                      </Text>

                      {/* Summary/Excerpt */}
                      <Text style={[blogStyles.horizontalSummary, isDark && blogStyles.horizontalSummaryDark]} numberOfLines={3}>
                        {item.summary || "No description available"}
                      </Text>

                      {/* Footer Meta */}
                      <View style={blogStyles.horizontalFooter}>
                        {/* Author */}
                        <View style={blogStyles.authorInfo}>
                          <View style={[blogStyles.authorAvatar, isDark && blogStyles.authorAvatarDark]}>
                            <Icon name="person" size={16} color="#FFFFFF" />
                          </View>
                          <Text style={[blogStyles.authorName, isDark && blogStyles.authorNameDark]} numberOfLines={1}>
                            {item.authorDisplay || "Anonymous"}
                          </Text>
                        </View>

                        {/* Divider */}
                        <View style={[blogStyles.metaDivider, isDark && blogStyles.metaDividerDark]} />

                        {/* Date */}
                        {item.createdAt && (
                          <>
                            <Icon name="schedule" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                            <Text style={[blogStyles.metaText, isDark && blogStyles.metaTextDark]}>
                              {new Date(item.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Text>
                          </>
                        )}

                        {/* Read Time (estimated) */}
                        <View style={[blogStyles.metaDivider, isDark && blogStyles.metaDividerDark]} />
                        <Icon name="timer" size={14} color={isDark ? "#94A3B8" : "#94A3B8"} />
                        <Text style={[blogStyles.metaText, isDark && blogStyles.metaTextDark]}>5 min read</Text>
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
