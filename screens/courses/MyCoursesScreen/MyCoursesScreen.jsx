import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { myCoursesStyles } from "./MyCoursesScreen.styles";
import { courseService } from "../../../service/courseService";
import { useNavigation as useReactNavigation } from "@react-navigation/native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
export default function MyCoursesScreen() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useReactNavigation();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourseEnrollments2();
      console.log(data.result);
      setEnrollments(data.result || []);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Format giây → giờ:phút:giây
  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCoursePress = (course) => {
    if (course.lessons && course.lessons.length > 0) {
      navigation.navigate("LessonScreen", {
        courseId: course.courseId || course.id,
        lessonId: course.lessons[0].lessonId,
      });
    } else {
      navigation.navigate("CourseDetailScreen", {
        courseId: course.courseId || course.id,
      });
    }
  };

  const renderCourseItem = (item) => {
    const course = item.course;
    return (
      <TouchableOpacity
        key={item.enrollmentId}
        style={[myCoursesStyles.courseCard, { backgroundColor: "#F9FAFB" }]}
        onPress={() => handleCoursePress(course)}
      >
        <Image
          source={{
            uri: course.imageUrl || "https://via.placeholder.com/150",
          }}
          style={myCoursesStyles.courseImage}
        />

        <View style={myCoursesStyles.courseInfo}>
          <Text style={myCoursesStyles.courseTitle}>{course.title}</Text>

          {/* Category Badge */}
          <View style={myCoursesStyles.categoryPriceRow}>
            <View
              style={[
                myCoursesStyles.categoryBadge,
                { backgroundColor: "#E0E7FF" },
              ]}
            >
              <Text
                style={[myCoursesStyles.categoryText, { color: "#4F46E5" }]}
              >
                {course.category || "Other"}
              </Text>
            </View>
          </View>

          {/* 🔹 Subtitle */}
          <Text style={myCoursesStyles.courseSubtitle}>{course.subtitle}</Text>
          <Text style={myCoursesStyles.courseDescription} numberOfLines={2}>
            {course.description}
          </Text>

          {/* Meta info */}
          <View style={myCoursesStyles.courseMeta}>
            <View style={myCoursesStyles.metaItem}>
              <Icon name="schedule" size={16} color="#4F46E5" />
              <Text style={myCoursesStyles.metaText}>
                {formatDuration(course.totalDuration || 0)}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={myCoursesStyles.progressContainer}>
            <Text style={myCoursesStyles.progressText}>
              Progress: {item.progressPercent || 0}%
            </Text>
            <View style={myCoursesStyles.progressBar}>
              <View
                style={[
                  myCoursesStyles.progressFill,
                  {
                    width: `${item.progressPercent || 0}%`,
                    backgroundColor: "#10B981",
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={myCoursesStyles.centerContainer}>
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
    <View style={myCoursesStyles.container}>
      {/* Header */}
      <View style={myCoursesStyles.header}>
        <View style={myCoursesStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={myCoursesStyles.headerTitle}>My Courses</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={myCoursesStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {enrollments.length === 0 ? (
          <View style={myCoursesStyles.emptyContainer}>
            <LottieView
              source={require("../../../assets/course.json")}
              autoPlay
              loop
              style={{ width: 170, height: 170 }}
            />
            <Text style={myCoursesStyles.emptyTitle}>No Courses Yet</Text>
            <Text style={myCoursesStyles.emptyDescription}>
              You haven't enrolled in any courses yet. Start exploring and
              enroll in your first course!
            </Text>
            <TouchableOpacity
              style={myCoursesStyles.exploreButton}
              onPress={() => navigation.navigate("CoursesScreen")}
            >
              <Text style={myCoursesStyles.exploreButtonText}>
                Explore Courses
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={myCoursesStyles.sectionTitle}>
              {enrollments.length}{" "}
              {enrollments.length === 1 ? "Course" : "Courses"} Enrolled
            </Text>
            {enrollments.map(renderCourseItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
