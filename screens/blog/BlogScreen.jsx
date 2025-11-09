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
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";

const { width } = Dimensions.get("window");

const NUM_COLUMNS = 4;
const CARD_MARGIN = 8;
const CARD_WIDTH =
  (width - (NUM_COLUMNS + 1) * CARD_MARGIN - 32) / NUM_COLUMNS;

export default function BlogScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch blogs từ API
  const fetchBlogs = async () => {
    try {
      const response = await blogService.getAllBlogs(0, 10);

      // ✅ FIX: Truy cập đúng cấu trúc dữ liệu từ API
      // response có cấu trúc: { data: { code, message, result: { content: [...] } } }
      const data = response.result?.content || [];

      console.log("Fetched blogs:", data);
      setBlogs(data);
      setFilteredBlogs(data);
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
      <LinearGradient
        colors={["#E0F2FE", "#FEF3C7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          blogStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Đang tải bài viết...
        </Text>
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
      {/* 🔹 Header */}
      <View style={blogStyles.header}>
      <SidebarToggleButton iconSize={24}  />
        
        <Text style={blogStyles.headerTitle}>Bài viết</Text>
        <View style={blogStyles.headerRight} />
      </View>

      {/* 🔹 Search */}
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

      {/* 🔹 Blog List */}
      {filteredBlogs.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Icon name="search-off" size={48} color="#9CA3AF" />
          <Text style={{ marginTop: 10, color: "#6B7280", fontSize: 16 }}>
            Không tìm thấy bài viết nào
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBlogs}
          keyExtractor={(item) => item.id.toString()}
          numColumns={NUM_COLUMNS}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          columnWrapperStyle={{
            justifyContent: "flex-start",
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
                    marginRight: isLastInRow ? 0 : CARD_MARGIN,
                  },
                ]}
                onPress={() => handleViewBlog(item.id)}
              >
                <Shadow distance={5} startColor="#00000010" finalColor="#00000005">
                  <View style={blogStyles.blogCardInner}>
                    <Image
                      source={{ 
                        uri: item.imageUrl || 'https://via.placeholder.com/150' 
                      }}
                      style={blogStyles.blogImage}
                      resizeMode="cover"
                    />
                    <View style={blogStyles.blogContent}>
                      <Text style={blogStyles.blogTitle} numberOfLines={2}>
                        {item.title || "Không có tiêu đề"}
                      </Text>
                      <Text style={blogStyles.blogAuthor} numberOfLines={1}>
                        {item.authorDisplay || "Ẩn danh"}
                      </Text>
                      <Text
                        style={{
                          color: "#6B7280",
                          fontSize: 12,
                          marginTop: 2,
                        }}
                        numberOfLines={2}
                      >
                        {item.summary || "Không có mô tả"}
                      </Text>
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