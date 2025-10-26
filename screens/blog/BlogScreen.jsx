import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { blogStyles } from "./BlogScreen.styles";
import { blogService } from "../../service/blogService";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 4;
const CARD_MARGIN = 8;
const CARD_WIDTH =
  (width - (NUM_COLUMNS + 1) * CARD_MARGIN - 32) / NUM_COLUMNS;

// Danh mục blog
const blogCategories = [
  { id: "all", name: "Tất cả" },
  { id: "tips", name: "Mẹo" },
  { id: "study", name: "Học tập" },
  { id: "business", name: "Kinh doanh" },
];

export default function BlogScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch blogs từ API
  const fetchBlogs = async () => {
    try {
      const data = await blogService.getAllBlogs();

     const transformedBlogs = data.map((blog) => ({
  id: blog.id.toString(),
  title: blog.title,
  author: blog.authorDisplay,
  authorId: blog.authorId,
  content: blog.content,
  image: {
    uri: "https://res.cloudinary.com/dturncvxv/image/upload/v1759910431/b5e15cec-6489-46e7-bd9e-596a24bd5225_wbpdjm.jpg",
  }, 
  date: blog.createdAt || "Chưa có ngày tạo",
}));

      
      setBlogs(transformedBlogs);
      setFilteredBlogs(transformedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, selectedCategory, blogs]);

  const filterBlogs = () => {
    let filtered = blogs;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query)
      );
    }
    
    setFilteredBlogs(filtered);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleViewBlog = (blogId) => {
    navigation.navigate("BlogDetail", { blogId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[blogStyles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Đang tải bài viết...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={blogStyles.container}
    >
      {/* Header */}
      <View style={blogStyles.header}>
        <Pressable style={blogStyles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={blogStyles.headerTitle}>Bài viết</Text>
        <View style={blogStyles.headerRight} />
      </View>

      {/* Search */}
      <View style={blogStyles.searchContainer}>
        <View style={blogStyles.searchInputContainer}>
          <Icon
            name="search"
            size={20}
            color="#6B7280"
            style={blogStyles.searchIcon}
          />
          <TextInput
            style={blogStyles.searchInput}
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Icon name="close" size={20} color="#6B7280" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Categories */}
      <View style={blogStyles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {blogCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                blogStyles.categoryButton,
                selectedCategory === category.id &&
                  blogStyles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text
                style={[
                  blogStyles.categoryButtonText,
                  selectedCategory === category.id &&
                    blogStyles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Blog List */}
      {filteredBlogs.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Icon name="search-off" size={48} color="#9CA3AF" />
          <Text style={{ marginTop: 10, color: "#6B7280", fontSize: 16 }}>
            Không tìm thấy bài viết nào
          </Text>
        </View>
      ) : (
        <FlatList
  data={filteredBlogs}
  keyExtractor={(item) => item.id}
  numColumns={NUM_COLUMNS}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
  columnWrapperStyle={{
    justifyContent: "flex-start", // 👈 quan trọng nhất
    marginBottom: CARD_MARGIN,
  }}
 renderItem={({ item, index }) => {
  const isLastInRow = (index + 1) % NUM_COLUMNS === 0;

  return (
    <Pressable
      style={[
        blogStyles.blogCard,
        {
          width: CARD_WIDTH,
          marginRight: isLastInRow ? 0 : CARD_MARGIN, // 🔥 đều khoảng cách
        },
      ]}
      onPress={() => handleViewBlog(item.id)}
    >
      <Shadow distance={5} startColor="#00000010" finalColor="#00000005">
        <View style={blogStyles.blogCardInner}>
          <Image source={item.image} style={blogStyles.blogImage} resizeMode="cover" />
          <View style={blogStyles.blogContent}>
            <Text style={blogStyles.blogTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={blogStyles.blogAuthor}>
              {item.author} • {item.date}
            </Text>
            <View style={blogStyles.blogMeta}>
              <Icon name="visibility" size={14} color="#6B7280" />
              <Text style={blogStyles.blogViews}>
                {item.views || 0} lượt xem
              </Text>
            </View>
          </View>
        </View>
      </Shadow>
    </Pressable>
  );
}}

/>

      )}
    </LinearGradient>
  );
}