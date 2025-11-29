import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { myCoursesStyles } from "./MyCoursesScreen.styles";
import { courseService } from "../../../service/courseService";
import { useNavigation as useReactNavigation } from "@react-navigation/native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { feedbackService } from "../../../service/feedbackService";
import { LinearGradient } from "expo-linear-gradient";
import { Modal, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
export default function MyCoursesScreen() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useReactNavigation();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourseEnrollments2();
      setEnrollments(data.result || []);
    } catch (error) {
      console.error("Error fetching courses:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const createFeedback = async ({ courseId, rating, comment }) => {
    try {
      const payload = {
        courseId,
        rating,
        comment,
        validTarget: true,
      };

      await feedbackService.postFeedbackCourse(payload);
    } catch (error) {
      console.error("Error creating feedback:", error.message);
      throw error;
    }
  };

  const openFeedbackModal = (course) => {
    setSelectedCourse(course);
    setRating(0);
    setComment("");
    setFeedbackModalVisible(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setSelectedCourse(null);
    setRating(0);
    setComment("");
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Comment Required", "Please write a comment about your experience.");
      return;
    }
    try {
      setSubmittingFeedback(true);
      await createFeedback({
        courseId: selectedCourse?.courseId || selectedCourse?.id,
        rating,
        comment: comment.trim(),
      });
      Alert.alert("Success", "Thank you for your feedback!", [{ text: "OK", onPress: closeFeedbackModal }]);
    } catch (error) {
      Alert.alert("Error", error?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
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
    const courseId = course.courseId || course.id;

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

          <TouchableOpacity
            style={myCoursesStyles.feedbackButtonTopRight}
            onPress={() => openFeedbackModal(course)}
          >
            <Icon name="rate-review" size={18} color="#2563EB" />
          </TouchableOpacity>

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
      <LinearGradient
        colors={["#ffffffff", "#ffffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={myCoursesStyles.header}
      >
        <View style={myCoursesStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={myCoursesStyles.headerTitle}>My Courses</Text>
        </View>
      </LinearGradient>

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
              {/* {enrollments.length}{" "}
              {enrollments.length === 1 ? "Course" : "Courses"} Enrolled */}
            </Text>
            {enrollments.map(renderCourseItem)}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFeedbackModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={myCoursesStyles.modalOverlay}
        >
          <Pressable
            style={myCoursesStyles.modalBackdrop}
            onPress={closeFeedbackModal}
          />
          <View style={myCoursesStyles.modalContent}>
            <View style={myCoursesStyles.modalHeader}>
              <View>
                <Text style={myCoursesStyles.modalTitle}>Write a Review</Text>
                <Text style={myCoursesStyles.modalSubtitle}>
                  {selectedCourse?.title}
                </Text>
              </View>
              <Pressable onPress={closeFeedbackModal}>
                <Icon name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            <View style={myCoursesStyles.section}>
              <Text style={myCoursesStyles.sectionTitle}>Your Rating</Text>
              <View style={myCoursesStyles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)} style={myCoursesStyles.starButton}>
                    <Icon
                      name={star <= rating ? "star" : "star-border"}
                      size={40}
                      color={star <= rating ? "#FFB300" : "#BDC3C7"}
                    />
                  </Pressable>
                ))}
              </View>
              {rating > 0 && (
                <Text style={myCoursesStyles.ratingText}>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </Text>
              )}
            </View>

            <View style={myCoursesStyles.section}>
              <Text style={myCoursesStyles.sectionTitle}>Your Comment</Text>
              <TextInput
                style={myCoursesStyles.commentInput}
                placeholder="Share your experience with this course..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={myCoursesStyles.charCount}>{comment.length} characters</Text>
            </View>

            <View style={myCoursesStyles.buttonRow}>
              <Pressable style={myCoursesStyles.cancelButton} onPress={closeFeedbackModal}>
                <Text style={myCoursesStyles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  myCoursesStyles.submitButton,
                  (submittingFeedback || rating === 0 || !comment.trim()) && myCoursesStyles.submitButtonDisabled,
                ]}
                onPress={submitFeedback}
                disabled={submittingFeedback || rating === 0 || !comment.trim()}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={myCoursesStyles.submitButtonText}>Submit Review</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
