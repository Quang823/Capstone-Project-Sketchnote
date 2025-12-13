import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Shadow } from "react-native-shadow-2";
import { coursesStyles } from "./CoursesScreen.styles";
import { courseService } from "../../../service/courseService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";

// Course Categories
const courseCategories = [
  { id: "all", name: "All", icon: "apps" },
  { id: "Icons", name: "Icons", icon: "emoji-emotions" },
  { id: "Illustrations", name: "Illustrations", icon: "palette" },
  { id: "Typography", name: "Typography", icon: "text-fields" },
];

export default function CoursesScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [notEnrolledCourses, setNotEnrolledCourses] = useState([]);
  const [filteredEnrolledCourses, setFilteredEnrolledCourses] = useState([]);
  const [filteredNotEnrolledCourses, setFilteredNotEnrolledCourses] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Floating animation cho 2 circle
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  // Floating animation cho 2 circle - ĐÃ SỬA HOÀN HẢO
  useEffect(() => {
    const animateFloat = (animValue, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };

    // Circle 1: chậm, nhẹ nhàng
    animateFloat(floatAnim1, 0);

    // Circle 2: ngược pha, chậm hơn 2s
    animateFloat(floatAnim2, 2000);
  }, []);
  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses when search or category changes
  useEffect(() => {
    filterCourses();
  }, [searchQuery, selectedCategory, enrolledCourses, notEnrolledCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch enrolled courses
      const enrolledData = await courseService.getAllCourseEnrollments();
      const transformedEnrolled = enrolledData.map((course) => ({
        id: course.courseId.toString(),
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instructor: "Instructor",
        imageUrl:
          course.imageUrl && course.imageUrl.trim() !== "​"
            ? course.imageUrl
            : null,
        price: course.price,
        rating: course.avgRating || 0,
        ratingCount: course.ratingCount || 0,
        students: course.studentCount || 0,
        totalDuration: course.totalDuration || 0,
        lessonsCount: course.lessons?.length || 0,
        level: course.lessons?.length > 5 ? "Advanced" : "Beginner",
        category: course.category || "all",
        isNew: false,
        isEnrolled: true,
      }));

      // Fetch not enrolled courses
      const notEnrolledData =
        await courseService.getCourseNotEnrollmentsByUserId();
      const transformedNotEnrolled = notEnrolledData.map((course) => ({
        id: course.courseId.toString(),
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instructor: "Instructor",
        imageUrl:
          course.imageUrl && course.imageUrl.trim() !== "​"
            ? course.imageUrl
            : null,
        price: course.price,
        rating: course.avgRating || 0,
        ratingCount: course.ratingCount || 0,
        students: course.studentCount || 0,
        totalDuration: course.totalDuration || 0,
        lessonsCount: course.lessons?.length || 0,
        level: course.lessons?.length > 5 ? "Advanced" : "Beginner",
        category: course.category || "all",
        isNew: Math.random() > 0.7,
        isEnrolled: false,
      }));

      setEnrolledCourses(transformedEnrolled);
      setNotEnrolledCourses(transformedNotEnrolled);
      setFilteredEnrolledCourses(transformedEnrolled);
      setFilteredNotEnrolledCourses(transformedNotEnrolled);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    // Filter enrolled courses
    let filteredEnrolled = enrolledCourses;
    if (selectedCategory !== "all") {
      filteredEnrolled = filteredEnrolled.filter(
        (course) => course.category === selectedCategory
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEnrolled = filteredEnrolled.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query)
      );
    }

    // Filter not enrolled courses
    let filteredNotEnrolled = notEnrolledCourses;
    if (selectedCategory !== "all") {
      filteredNotEnrolled = filteredNotEnrolled.filter(
        (course) => course.category === selectedCategory
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNotEnrolled = filteredNotEnrolled.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query)
      );
    }

    setFilteredEnrolledCourses(filteredEnrolled);
    setFilteredNotEnrolledCourses(filteredNotEnrolled);
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

  // Get hot new releases (top 4 new courses from not enrolled)
  const hotNewReleases = notEnrolledCourses
    .filter((course) => course.isNew)
    .slice(0, 4);

  // Render featured course card (for hot new releases)
  const renderFeaturedCourseItem = (item, index) => {
    const gradients = [
      ["#667eea", "#555abcff"], // Purple-Pink
      ["#f093fb", "#f5576c"], // Pink-Red
      ["#4facfe", "#00f2fe"], // Blue-Cyan
      ["#43e97b", "#38f9d7"], // Green-Mint
    ];

    const imageUrl =
      item.imageUrl || "https://via.placeholder.com/320x180?text=No+Image";

    return (
      <Shadow
        distance={16}
        startColor="#00000030"
        finalColor="#00000000"
        key={item.id}
        style={{ marginRight: 20, borderRadius: 24 }}
      >
        <Pressable
          onPress={() => handleViewCourse(item.id)}
          style={coursesStyles.featuredCard}
        >
          <LinearGradient
            colors={gradients[index % gradients.length]}
            style={coursesStyles.featuredGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Background Pattern */}
            <View style={coursesStyles.patternOverlay}>
              <View style={coursesStyles.patternCircle1} />
              <View style={coursesStyles.patternCircle2} />
            </View>

            {/* Image with overlay */}
            <View style={coursesStyles.featuredImageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={coursesStyles.featuredImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
                style={coursesStyles.featuredOverlay}
              />
            </View>

            {/* Content */}
            <View style={coursesStyles.featuredContent}>
              <View style={coursesStyles.featuredTop}>
                <View style={coursesStyles.featuredBadge}>
                  <Icon
                    name="local-fire-department"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={coursesStyles.featuredBadgeText}>HOT</Text>
                </View>
                <View style={coursesStyles.featuredNewBadge}>
                  <Text style={coursesStyles.featuredNewBadgeText}>NEW</Text>
                </View>
              </View>

              <View style={coursesStyles.featuredBottom}>
                <Text style={coursesStyles.featuredTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={coursesStyles.featuredSubtitle} numberOfLines={1}>
                  {item.subtitle || "Professional course"}
                </Text>

                <View style={coursesStyles.featuredMeta}>
                  <View style={coursesStyles.featuredMetaItem}>
                    <View style={coursesStyles.ratingContainer}>
                      <Icon name="star" size={18} color="#FFD700" />
                      <Text style={coursesStyles.featuredMetaText}>
                        {item.rating}
                      </Text>
                    </View>
                  </View>
                  <View style={coursesStyles.divider} />
                  <View style={coursesStyles.featuredMetaItem}>
                    <Icon name="people" size={18} color="#FFF" />
                    <Text style={coursesStyles.featuredMetaText}>
                      {item.students > 1000
                        ? `${(item.students / 1000).toFixed(1)}k`
                        : item.students}
                    </Text>
                  </View>
                  <View style={coursesStyles.divider} />
                  <View style={coursesStyles.featuredMetaItem}>
                    <Icon name="play-circle-outline" size={18} color="#FFF" />
                    <Text style={coursesStyles.featuredMetaText}>
                      {item.lessonsCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </Shadow>
    );
  };

  // Render course card
  const renderCourseItem = (item) => {
    const imageUrl =
      item.imageUrl || "https://via.placeholder.com/280x160?text=No+Image";

    return (
      <Shadow
        distance={12}
        startColor="#00000020"
        finalColor="#00000000"
        key={item.id}
        style={{ marginRight: 20, borderRadius: 20 }}
      >
        <Pressable
          onPress={() => handleViewCourse(item.id)}
          style={[
            coursesStyles.courseCard,
            isDark && coursesStyles.courseCardDark,
          ]}
        >
          {/* Image */}
          <View
            style={[
              coursesStyles.imageContainer,
              isDark && coursesStyles.imageContainerDark,
            ]}
          >
            <Image
              source={{ uri: imageUrl }}
              style={coursesStyles.courseImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={
                isDark
                  ? ["transparent", "rgba(0,0,0,0.6)"]
                  : ["transparent", "rgba(0,0,0,0.3)"]
              }
              style={coursesStyles.imageGradient}
            />

            {/* Badges */}
            <View style={coursesStyles.badgesContainer}>
              {item.isNew && (
                <View style={coursesStyles.newBadge}>
                  <Icon name="fiber-new" size={16} color="#FFF" />
                  <Text style={coursesStyles.newBadgeText}>NEW</Text>
                </View>
              )}
              <View style={coursesStyles.levelBadge}>
                <Text style={coursesStyles.levelBadgeText}>{item.level}</Text>
              </View>
            </View>
          </View>

          {/* Info */}
          <View style={coursesStyles.courseInfo}>
            <View style={coursesStyles.courseTitleContainer}>
              <Text
                style={[
                  coursesStyles.courseTitle,
                  isDark && coursesStyles.courseTitleDark,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View
                style={[
                  coursesStyles.ratingBadge,
                  isDark && coursesStyles.ratingBadgeDark,
                ]}
              >
                <Icon name="star" size={12} color="#FFB800" />
                <Text style={coursesStyles.ratingText}>{item.rating}</Text>
              </View>
            </View>

            <Text
              style={[
                coursesStyles.courseSubtitle,
                isDark && coursesStyles.courseSubtitleDark,
              ]}
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>

            <View
              style={[
                coursesStyles.metaRow,
                isDark && coursesStyles.metaRowDark,
              ]}
            >
              <View style={coursesStyles.metaItem}>
                <Icon
                  name="play-circle-outline"
                  size={16}
                  color={isDark ? "#60A5FA" : "#2348bfff"}
                />
                <Text
                  style={[
                    coursesStyles.metaText,
                    isDark && coursesStyles.metaTextDark,
                  ]}
                >
                  {item.lessonsCount} lessons
                </Text>
              </View>

              <View style={coursesStyles.metaItem}>
                <Icon name="people-outline" size={16} color="#10B981" />
                <Text
                  style={[
                    coursesStyles.metaText,
                    isDark && coursesStyles.metaTextDark,
                  ]}
                >
                  {item.students > 1000
                    ? `${(item.students / 1000).toFixed(1)}k`
                    : item.students}
                </Text>
              </View>

              <View style={coursesStyles.metaItem}>
                <Icon name="star" size={16} color="#FFB800" />
                <Text
                  style={[
                    coursesStyles.metaText,
                    isDark && coursesStyles.metaTextDark,
                  ]}
                >
                  {item.ratingCount} ratings
                </Text>
              </View>
            </View>

            <View style={coursesStyles.priceRow}>
              <View style={coursesStyles.priceContainer}>
                <Text
                  style={[
                    coursesStyles.price,
                    isDark && coursesStyles.priceDark,
                  ]}
                >
                  {item.price?.toLocaleString("vi-VN") || "0"}
                </Text>
                <Text
                  style={[
                    coursesStyles.currency,
                    isDark && coursesStyles.currencyDark,
                  ]}
                >
                  đ
                </Text>
              </View>
              <LinearGradient
                colors={["#2348bfff", "#1e40afff"]}
                style={coursesStyles.enrollButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </View>
          </View>
        </Pressable>
      </Shadow>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          coursesStyles.loadingContainer,
          isDark && coursesStyles.loadingContainerDark,
        ]}
      >
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <View
      style={[coursesStyles.container, isDark && coursesStyles.containerDark]}
    >
      {/* Header cố định */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#0F172A"] : ["#FFFFFF", "#F8FAFC"]}
        style={[coursesStyles.header, isDark && coursesStyles.headerDark]}
      >
        <View style={coursesStyles.headerContent}>
          <View style={coursesStyles.headerLeft}>
            <SidebarToggleButton
              iconSize={26}
              iconColor={isDark ? "#FFFFFF" : "#084F8C"}
            />
            <View>
              <Text
                style={[
                  coursesStyles.headerTitle,
                  isDark && coursesStyles.headerTitleDark,
                ]}
              >
                Courses
              </Text>
              <Text
                style={[
                  coursesStyles.headerSubtitle,
                  isDark && coursesStyles.headerSubtitleDark,
                ]}
              >
                {enrolledCourses.length + notEnrolledCourses.length} courses
                available
              </Text>
            </View>
          </View>
          <Pressable
            style={[
              coursesStyles.notificationButton,
              isDark && coursesStyles.notificationButtonDark,
            ]}
          >
            <Icon
              name="notifications-none"
              size={24}
              color={isDark ? "#FFFFFF" : "#084F8C"}
            />
            <View
              style={[
                coursesStyles.notificationBadge,
                isDark && coursesStyles.notificationBadgeDark,
              ]}
            />
          </Pressable>
        </View>
      </LinearGradient>

      {/* TOÀN BỘ NỘI DUNG BÂY GIỜ ĐỀU TRONG SCROLLVIEW → CUỘN MƯỢT */}
      <ScrollView
        style={coursesStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]} // không dùng sticky nữa
      >
        {/* 1. Hero Banner - Bây giờ cuộn được */}
        <View style={coursesStyles.heroContainer}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185266/m5hl24cfn305uwxbg5ox.avif",
            }}
            style={coursesStyles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
            style={coursesStyles.heroOverlay}
          />
          <View style={coursesStyles.heroContent}>
            <Text style={coursesStyles.heroTitle}>
              Study design{"\n"}professionally
            </Text>
            <Text style={coursesStyles.heroSubtitle}>
              Discover courses for{"\n"}creative professionals
            </Text>
          </View>
        </View>

        {/* 2. Search + Category nằm chung 1 hàng (mới) */}
        <View
          style={[
            coursesStyles.searchCategoryRow,
            isDark && coursesStyles.searchCategoryRowDark,
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
          >
            {courseCategories.map((category) => (
              <Shadow
                key={category.id}
                distance={selectedCategory === category.id ? 10 : 4}
                startColor={
                  selectedCategory === category.id ? "#084F8C30" : "#00000008"
                }
                finalColor="#00000000"
                style={{ borderRadius: 16, marginRight: 10 }}
              >
                <Pressable
                  style={[
                    coursesStyles.categoryButton,
                    isDark && coursesStyles.categoryButtonDark,
                    selectedCategory === category.id &&
                      coursesStyles.selectedCategoryButton,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <Icon
                    name={category.icon}
                    size={18}
                    color={
                      selectedCategory === category.id
                        ? "#FFF"
                        : isDark
                        ? "#94A3B8"
                        : "#64748B"
                    }
                  />
                  <Text
                    style={[
                      coursesStyles.categoryText,
                      isDark && coursesStyles.categoryTextDark,
                      selectedCategory === category.id &&
                        coursesStyles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              </Shadow>
            ))}
          </ScrollView>

          {/* Thanh tìm kiếm nhỏ gọn */}
          <View style={coursesStyles.searchCompactWrapper}>
            <Shadow distance={6} startColor="#00000010" finalColor="#00000000">
              <View
                style={[
                  coursesStyles.searchCompactContainer,
                  isDark && coursesStyles.searchCompactContainerDark,
                ]}
              >
                <Icon
                  name="search"
                  size={20}
                  color={isDark ? "#94A3B8" : "#084F8C"}
                />
                <TextInput
                  style={[
                    coursesStyles.searchCompactInput,
                    isDark && coursesStyles.searchCompactInputDark,
                  ]}
                  placeholder="Search..."
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
                    <Icon
                      name="close"
                      size={18}
                      color={isDark ? "#94A3B8" : "#94A3B8"}
                    />
                  </Pressable>
                )}
              </View>
            </Shadow>
          </View>
        </View>

        {/* Khoảng trống nhẹ giữa header con và nội dung */}
        <View style={{ height: 16 }} />

        {/* Hot New Releases */}
        {hotNewReleases.length > 0 && (
          <View style={coursesStyles.hotReleasesWrapper}>
            <LinearGradient
              colors={["#0F172A", "#1E40AF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={coursesStyles.hotReleasesGradient}
            >
              {/* Floating Circle 1 */}
              <Animated.View
                style={[
                  coursesStyles.decorCircle1,
                  {
                    transform: [
                      {
                        translateY: floatAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -30], // Trôi lên 30px rồi xuống
                        }),
                      },
                      {
                        translateX: floatAnim1.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 15], // Nhẹ nhàng trôi ngang
                        }),
                      },
                    ],
                    opacity: floatAnim1.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.15, 0.25, 0.15],
                    }),
                  },
                ]}
              />

              {/* Floating Circle 2 - ngược pha */}
              <Animated.View
                style={[
                  coursesStyles.decorCircle2,
                  {
                    transform: [
                      {
                        translateY: floatAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 25], // Trôi lên xuống khác nhịp
                        }),
                      },
                      {
                        translateX: floatAnim2.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -20],
                        }),
                      },
                    ],
                    opacity: floatAnim2.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.1, 0.2, 0.1],
                    }),
                  },
                ]}
              />

              <View style={coursesStyles.hotReleasesSection}>
                <View style={coursesStyles.hotReleasesHeader}>
                  <View style={coursesStyles.hotReleasesHeaderLeft}>
                    <View style={coursesStyles.fireIconContainer}>
                      <Icon
                        name="local-fire-department"
                        size={32}
                        color="#FFD700"
                      />
                    </View>
                    <View>
                      <Text style={coursesStyles.hotReleasesTitle}>
                        Hot new releases
                      </Text>
                      <Text style={coursesStyles.hotReleasesSubtitle}>
                        Trending courses this week
                      </Text>
                    </View>
                  </View>
                  <Pressable style={coursesStyles.exploreButton}>
                    <Text style={coursesStyles.exploreButtonText}>
                      View all
                    </Text>
                    <Icon name="arrow-forward" size={18} color="#FFF" />
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingBottom: 12,
                  }}
                >
                  {hotNewReleases.map(renderFeaturedCourseItem)}
                </ScrollView>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* My Courses - Enrolled */}
        {filteredEnrolledCourses.length > 0 && (
          <View
            style={[
              coursesStyles.sectionContainer,
              isDark && coursesStyles.sectionContainerDark,
            ]}
          >
            <View style={coursesStyles.sectionHeader}>
              <View>
                <Text
                  style={[
                    coursesStyles.sectionTitle,
                    isDark && coursesStyles.sectionTitleDark,
                  ]}
                >
                  My Courses
                </Text>
                <Text
                  style={[
                    coursesStyles.sectionSubtitle,
                    isDark && coursesStyles.sectionSubtitleDark,
                  ]}
                >
                  {filteredEnrolledCourses.length} enrolled courses • Continue
                  learning
                </Text>
              </View>
              <Pressable
                style={[
                  coursesStyles.filterButton,
                  isDark && coursesStyles.filterButtonDark,
                ]}
                onPress={() => navigation.navigate("MyCourses")}
              >
                <Text
                  style={{
                    color: isDark ? "#60A5FA" : "#2348bfff",
                    fontSize: 14,
                    fontWeight: "600",
                    marginRight: 4,
                  }}
                >
                  View All
                </Text>
                <Icon
                  name="arrow-forward"
                  size={18}
                  color={isDark ? "#60A5FA" : "#2348bfff"}
                />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {filteredEnrolledCourses.map(renderCourseItem)}
            </ScrollView>
          </View>
        )}

        {/* All Courses - Not Enrolled */}
        {filteredNotEnrolledCourses.length > 0 ? (
          <View
            style={[
              coursesStyles.sectionContainer,
              isDark && coursesStyles.sectionContainerDark,
            ]}
          >
            <View style={coursesStyles.sectionHeader}>
              <View>
                <Text
                  style={[
                    coursesStyles.sectionTitle,
                    isDark && coursesStyles.sectionTitleDark,
                  ]}
                >
                  All Courses
                </Text>
                <Text
                  style={[
                    coursesStyles.sectionSubtitle,
                    isDark && coursesStyles.sectionSubtitleDark,
                  ]}
                >
                  {filteredNotEnrolledCourses.length} courses available •
                  Updated daily
                </Text>
              </View>
              <Pressable
                style={[
                  coursesStyles.filterButton,
                  isDark && coursesStyles.filterButtonDark,
                ]}
              >
                <Icon
                  name="tune"
                  size={20}
                  color={isDark ? "#60A5FA" : "#2348bfff"}
                />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {filteredNotEnrolledCourses.map(renderCourseItem)}
            </ScrollView>
          </View>
        ) : (
          !loading &&
          filteredEnrolledCourses.length === 0 && (
            <View style={coursesStyles.emptyState}>
              <LinearGradient
                colors={
                  isDark ? ["#1E293B", "#0F172A"] : ["#F8FAFC", "#EFF6FF"]
                }
                style={coursesStyles.emptyStateGradient}
              >
                <Icon
                  name="search-off"
                  size={80}
                  color={isDark ? "#475569" : "#CBD5E1"}
                />
                <Text
                  style={[
                    coursesStyles.emptyStateText,
                    isDark && coursesStyles.emptyStateTextDark,
                  ]}
                >
                  No courses found
                </Text>
                <Text
                  style={[
                    coursesStyles.emptyStateSubtext,
                    isDark && coursesStyles.emptyStateSubtextDark,
                  ]}
                >
                  Try adjusting your search or filters
                </Text>
              </LinearGradient>
            </View>
          )
        )}

        {error && (
          <View style={coursesStyles.errorContainer}>
            <Icon name="error-outline" size={64} color="#EF4444" />
            <Text style={coursesStyles.errorText}>{error}</Text>
            <Pressable style={coursesStyles.retryButton} onPress={handleRetry}>
              <Text style={coursesStyles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}
