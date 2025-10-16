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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import { blogStyles } from "./BlogScreen.styles";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 4;
const CARD_MARGIN = 8;
const CARD_WIDTH =
  (width - (NUM_COLUMNS + 1) * CARD_MARGIN - 32) / NUM_COLUMNS;

// Dữ liệu mẫu blog
const allBlogs = [
  {
    id: "1",
    title: "5 mẹo Sketchnote nhanh cho sinh viên",
    author: "Nguyễn Văn A",
    image: require("../../assets/logo1.webp"),
    date: "20/09/2025",
    views: 1240,
    category: "tips",
  },
  {
    id: "2",
    title: "Tại sao Sketchnote giúp bạn nhớ lâu hơn?",
    author: "Trần Thị B",
    image: require("../../assets/logo1.webp"),
    date: "15/09/2025",
    views: 980,
    category: "study",
  },
  {
    id: "3",
    title: "Ứng dụng Sketchnote trong kinh doanh",
    author: "Lê Văn C",
    image: require("../../assets/logo1.webp"),
    date: "10/09/2025",
    views: 720,
    category: "business",
  },
   {
    id: "4",
    title: "Ứng dụng Sketchnote trong kinh doanh",
    author: "Lê Văn C",
    image: require("../../assets/logo1.webp"),
    date: "10/09/2025",
    views: 720,
    category: "business",
  },
];

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
  const [filteredBlogs, setFilteredBlogs] = useState(allBlogs);

  useEffect(() => {
    filterBlogs();
  }, [searchQuery, selectedCategory]);

  const filterBlogs = () => {
    let filtered = allBlogs;
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
      <FlatList
        data={filteredBlogs}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 12,
        }}
        renderItem={({ item }) => (
          <Pressable
            style={[blogStyles.blogCard, { width: CARD_WIDTH }]}
            onPress={() => handleViewBlog(item.id)}
          >
            <Shadow distance={5} startColor="#00000010" finalColor="#00000005">
              <View style={blogStyles.blogCardInner}>
                <Image source={item.image} style={blogStyles.blogImage} />
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
                      {item.views} lượt xem
                    </Text>
                  </View>
                </View>
              </View>
            </Shadow>
          </Pressable>
        )}
      />
    </LinearGradient>
  );
}
