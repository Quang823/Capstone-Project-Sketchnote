import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { coursesStyles } from "./CoursesScreen.styles";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

// Dữ liệu mẫu cho các khóa học
const allCourses = [
  {
    id: "1",
    title: "Nghệ thuật Sketchnote cơ bản",
    instructor: "Nguyễn Văn A",
    image: require("../../../assets/logo1.webp"),
    price: "299.000đ",
    rating: 4.8,
    students: 1240,
    level: "Cơ bản",
    category: "design",
  },
  {
    id: "2",
    title: "Sketchnote nâng cao cho doanh nghiệp",
    instructor: "Trần Thị B",
    image: require("../../../assets/logo1.webp"),
    price: "499.000đ",
    rating: 4.9,
    students: 850,
    level: "Nâng cao",
    category: "business",
  },
  {
    id: "3",
    title: "Kỹ thuật vẽ biểu đồ trực quan",
    instructor: "Lê Văn C",
    image: require("../../../assets/logo1.webp"),
    price: "399.000đ",
    rating: 4.7,
    students: 920,
    level: "Trung cấp",
    category: "design",
  },
  {
    id: "4",
    title: "Sketchnote cho học sinh, sinh viên",
    instructor: "Phạm Thị D",
    image: require("../../../assets/logo1.webp"),
    price: "249.000đ",
    rating: 4.6,
    students: 1560,
    level: "Cơ bản",
    category: "education",
  },
  {
    id: "5",
    title: "Sketchnote trong lập kế hoạch dự án",
    instructor: "Hoàng Văn E",
    image: require("../../../assets/logo1.webp"),
    price: "349.000đ",
    rating: 4.5,
    students: 720,
    level: "Trung cấp",
    category: "business",
  },
  {
    id: "6",
    title: "Nghệ thuật tạo mindmap trực quan",
    instructor: "Ngô Thị F",
    image: require("../../../assets/logo1.webp"),
    price: "299.000đ",
    rating: 4.8,
    students: 980,
    level: "Cơ bản",
    category: "education",
  },
];

// Danh mục khóa học
const courseCategories = [
  { id: "all", name: "Tất cả" },
  { id: "design", name: "Thiết kế" },
  { id: "business", name: "Kinh doanh" },
  { id: "education", name: "Giáo dục" },
];

export default function CoursesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredCourses, setFilteredCourses] = useState(allCourses);
  
  // Animation cho các phần tử
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });
    
    filterCourses();
  }, [searchQuery, selectedCategory]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const filterCourses = () => {
    let filtered = allCourses;
    
    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        course => 
          course.title.toLowerCase().includes(query) || 
          course.instructor.toLowerCase().includes(query)
      );
    }
    
    setFilteredCourses(filtered);
  };

  const handleCategoryPress = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleViewCourse = (courseId) => {
    navigation.navigate("CourseDetailScreen", { courseId });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={coursesStyles.container}
    >
      <View style={coursesStyles.header}>
        <Pressable style={coursesStyles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={coursesStyles.headerTitle}>Khóa học</Text>
        <View style={coursesStyles.headerRight} />
      </View>

      <View style={coursesStyles.searchContainer}>
        <View style={coursesStyles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" style={coursesStyles.searchIcon} />
          <TextInput
            style={coursesStyles.searchInput}
            placeholder="Tìm kiếm khóa học..."
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

      <View style={coursesStyles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {courseCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                coursesStyles.categoryButton,
                selectedCategory === category.id && coursesStyles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text
                style={[
                  coursesStyles.categoryButtonText,
                  selectedCategory === category.id && coursesStyles.categoryButtonTextActive,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ReanimatedView style={[coursesStyles.coursesContainer, animatedStyle]}>
        <FlatList
          data={filteredCourses}
  keyExtractor={(item) => item.id}
  numColumns={5} 
  columnWrapperStyle={coursesStyles.courseRow}
  showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={coursesStyles.courseCard}
              onPress={() => handleViewCourse(item.id)}
            >
              <Shadow distance={5} startColor="#00000010" finalColor="#00000005">
                <View style={coursesStyles.courseCardInner}>
                  <Image source={item.image} style={coursesStyles.courseImage} />
                  <View style={coursesStyles.courseContent}>
                    <Text style={coursesStyles.courseTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={coursesStyles.courseInstructor}>
                      {item.instructor}
                    </Text>
                    <View style={coursesStyles.courseMetaContainer}>
                      <View style={coursesStyles.courseRating}>
                        <Icon name="star" size={14} color="#F59E0B" />
                        <Text style={coursesStyles.courseRatingText}>{item.rating}</Text>
                      </View>
                      <Text style={coursesStyles.courseLevel}>{item.level}</Text>
                    </View>
                    <View style={coursesStyles.coursePriceContainer}>
                      <Text style={coursesStyles.coursePrice}>{item.price}</Text>
                    </View>
                  </View>
                </View>
              </Shadow>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={coursesStyles.emptyContainer}>
              <Icon name="search-off" size={64} color="#9CA3AF" />
              <Text style={coursesStyles.emptyText}>Không tìm thấy khóa học nào</Text>
            </View>
          }
        />
      </ReanimatedView>
    </LinearGradient>
  );
}