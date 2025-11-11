import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Shadow } from "react-native-shadow-2";
import { coursesStyles } from "./CoursesScreen.styles";
import { courseService } from "../../../service/courseService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";

// Danh mục khóa học
const courseCategories = [
  { id: "all", name: "Tất cả" },
  { id: "Icons", name: "Icons" },
  { id: "Illustrations", name: "Illustrations" },
  { id: "Typography", name: "Typography" },
];


export default function CoursesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses từ API
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses khi search hoặc category thay đổi
  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, allCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getAllCourse();

      // Transform API data để phù hợp với UI
      const transformedCourses = data.result.map((course) => ({
        id: course.courseId.toString(),
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instructor: "Instructor",
        imageUrl: course.imageUrl && course.imageUrl.trim() !== "​" ? course.imageUrl : null,
        price: course.price,
        rating: 4.5,
        students: course.studentCount,
        totalDuration: course.totalDuration,
        lessonsCount: course.lessons?.length || 0,
        level: course.lessons?.length > 5 ? "Nâng cao" : "Cơ bản",
        category: course.category || "all",
      }));

      setAllCourses(transformedCourses);
      setFilteredCourses(transformedCourses);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = allCourses;

    // Lọc theo danh mục
    if (selectedCategory !== "all") {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
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

  const handleRetry = () => {
    fetchCourses();
  };

  // Render course card
  const renderCourseItem = (item) => {
    const imageUrl = item.imageUrl || "https://via.placeholder.com/280x160?text=No+Image";

    return (
      <Shadow
        distance={8}
        startColor="#00000015"
        finalColor="#00000005"
        key={item.id}
        style={{ marginRight: 16, borderRadius: 16 }}
      >
        <Pressable
          onPress={() => handleViewCourse(item.id)}
          style={coursesStyles.courseCard}
        >
          {/* Image Container */}
          <View style={coursesStyles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={coursesStyles.courseImage}
              resizeMode="cover"
            />
            {/* Level Badge */}
            <View style={coursesStyles.levelBadge}>
              <Text style={coursesStyles.levelBadgeText}>
                {item.level}
              </Text>
            </View>
          </View>

          {/* Info Container */}
          <View style={coursesStyles.courseInfo}>
            <Text style={coursesStyles.courseTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={coursesStyles.courseSubtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>

            {/* Meta Info */}
            <View style={coursesStyles.metaRow}>
              <View style={coursesStyles.metaItem}>
                <Icon name="star" size={14} color="#FFA726" />
                <Text style={coursesStyles.metaText}>{item.rating}</Text>
              </View>
              <View style={coursesStyles.metaItem}>
                <Icon name="play-circle-outline" size={14} color="#4F46E5" />
                <Text style={coursesStyles.metaText}>{item.lessonsCount} bài</Text>
              </View>
              <View style={coursesStyles.metaItem}>
                <Icon name="people" size={14} color="#10B981" />
                <Text style={coursesStyles.metaText}>{item.students}</Text>
              </View>
            </View>

            <Text style={coursesStyles.price}>
              {item.price?.toLocaleString("vi-VN") || "0"} VNĐ
            </Text>

            {/* Action Button */}
            {/* <Pressable
              style={coursesStyles.enrollButton}
              onPress={(e) => {
                e.stopPropagation();
                handleViewCourse(item.id);
              }}
            >
         
              <Text style={coursesStyles.enrollButtonText}>Xem chi tiết</Text>
            </Pressable> */}
          </View>
        </Pressable>
      </Shadow>
    );
  };

  if (loading) {
    return (
      <View style={coursesStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={coursesStyles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  return (
    <View style={coursesStyles.container}>
      {/* Header */}
      <View style={coursesStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SidebarToggleButton iconSize={24} iconColor="#1F2937" />
        </View>
        <Text style={coursesStyles.headerTitle}>Khóa học</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={coursesStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={coursesStyles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#9CA3AF"
            style={coursesStyles.searchIcon}
          />
          <TextInput
            style={coursesStyles.searchInput}
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={coursesStyles.categoryContainer}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {courseCategories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                coursesStyles.categoryButton,
                selectedCategory === category.id &&
                  coursesStyles.selectedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text
                style={[
                  coursesStyles.categoryText,
                  selectedCategory === category.id &&
                    coursesStyles.selectedCategoryText,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* All Courses Section */}
        {filteredCourses.length > 0 ? (
          <View style={coursesStyles.sectionContainer}>
            <View style={coursesStyles.sectionHeader}>
             
              <Text style={coursesStyles.sectionTitle}>Tất cả khóa học</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {filteredCourses.map(renderCourseItem)}
            </ScrollView>
          </View>
        ) : (
          <View style={coursesStyles.emptyState}>
            <Icon name="inbox" size={80} color="#D1D5DB" />
            <Text style={coursesStyles.emptyStateText}>
              Không tìm thấy khóa học nào
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={coursesStyles.errorContainer}>
            <Icon name="error-outline" size={64} color="#EF4444" />
            <Text style={coursesStyles.errorText}>{error}</Text>
            <Pressable style={coursesStyles.retryButton} onPress={handleRetry}>
              <Text style={coursesStyles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}