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
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { myCoursesStyles } from "./MyCoursesScreen.styles";
import { courseService } from "../../../service/courseService";
import { useNavigation as useReactNavigation } from "@react-navigation/native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { feedbackService } from "../../../service/feedbackService";
import { Modal, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { LinearGradient } from "expo-linear-gradient";

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

  const renderCourseItem = (item, index) => {
    const course = item.course;
    const progressPercent = item.progressPercent || 0;

    return (
      <View key={index} style={myCoursesStyles.courseCardWrapper}>
        <TouchableOpacity
          style={myCoursesStyles.courseCard}
          onPress={() => handleCoursePress(course)}
          activeOpacity={0.95}
        >
          {/* Image with gradient overlay */}
          <View style={myCoursesStyles.imageContainer}>
            <Image
              source={{
                uri: course.imageUrl || "https://via.placeholder.com/150",
              }}
              style={myCoursesStyles.courseImage}
            />
            <View style={myCoursesStyles.imageGradient}>
              <View style={myCoursesStyles.categoryBadge}>
                <Icon name="auto-awesome" size={12} color="#FFF" />
                <Text style={myCoursesStyles.categoryText}>
                  {course.category || "Other"}
                </Text>
              </View>
            </View>

            {/* Feedback button on image */}
            <Pressable
              style={myCoursesStyles.feedbackButtonFloat}
              onPress={() => openFeedbackModal(course)}
            >
              <Icon name="star" size={18} color="#FFB300" />
            </Pressable>
          </View>

          {/* Course Info */}
          <View style={myCoursesStyles.courseInfo}>
            <Text style={myCoursesStyles.courseTitle} numberOfLines={2}>
              {course.title}
            </Text>

            {course.subtitle && (
              <Text style={myCoursesStyles.courseSubtitle} numberOfLines={1}>
                {course.subtitle}
              </Text>
            )}

            {/* Meta Info */}
            <View style={myCoursesStyles.metaContainer}>
              <View style={myCoursesStyles.metaItem}>
                <Icon name="access-time" size={14} color="#64748B" />
                <Text style={myCoursesStyles.metaText}>
                  {formatDuration(course.totalDuration || 0)}
                </Text>
              </View>
              <View style={myCoursesStyles.metaDivider} />
              <View style={myCoursesStyles.metaItem}>
                <Icon name="play-circle-outline" size={14} color="#64748B" />
                <Text style={myCoursesStyles.metaText}>
                  {course.lessons?.length || 0}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={myCoursesStyles.progressSection}>
              <View style={myCoursesStyles.progressBarContainer}>
                <View
                  style={[
                    myCoursesStyles.progressBar,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
              <Text style={myCoursesStyles.progressText}>
                {progressPercent}% Complete
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={myCoursesStyles.continueButton}
              onPress={() => handleCoursePress(course)}
            >
              <Text style={myCoursesStyles.continueButtonText}>
                {progressPercent === 0 ? "Start Course" : "Continue"}
              </Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
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
      {/* Premium Header */}

      <View style={myCoursesStyles.header}>
        <View style={myCoursesStyles.headerLeft}>
          <SidebarToggleButton iconSize={28} iconColor="#084F8C" />
          <View>
            <Text style={myCoursesStyles.headerTitle}>My Learning</Text>
            <Text style={myCoursesStyles.headerSubtitle}>
              {enrollments.length} {enrollments.length === 1 ? "Course" : "Courses"} in progress
            </Text>
          </View>
        </View>
      </View>


      <ScrollView
        style={myCoursesStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Hero Banner */}
        <View style={myCoursesStyles.heroContainer}>
          <Image
            source={{ uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765365414/ugtp99tsix53ay127xrs.jpg" }}
            style={myCoursesStyles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={myCoursesStyles.heroOverlay}
          />
          <View style={myCoursesStyles.heroContent}>
            <Text style={myCoursesStyles.heroTitle}>Keep Learning</Text>
            <Text style={myCoursesStyles.heroSubtitle}>Continue your journey to mastery</Text>
          </View>
        </View>

        {enrollments.length === 0 ? (
          <View style={myCoursesStyles.emptyContainer}>
            <View style={myCoursesStyles.emptyIconContainer}>
              <LottieView
                source={require("../../../assets/course.json")}
                autoPlay
                loop
                style={{ width: 240, height: 240 }}
              />
            </View>
            <Text style={myCoursesStyles.emptyTitle}>Begin Your Journey</Text>
            <Text style={myCoursesStyles.emptyDescription}>
              Unlock your potential with world-class courses designed for success
            </Text>
            <TouchableOpacity
              style={myCoursesStyles.exploreButton}
              onPress={() => navigation.navigate("CoursesScreen")}
            >
              <Icon name="explore" size={22} color="#FFFFFF" />
              <Text style={myCoursesStyles.exploreButtonText}>
                Discover Courses
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={myCoursesStyles.coursesGrid}>
            {enrollments.map(renderCourseItem)}
          </View>
        )}
      </ScrollView>

      {/* Premium Feedback Modal */}
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
            {/* Modal Header */}
            <View style={myCoursesStyles.modalHeader}>
              <View style={myCoursesStyles.modalIconContainer}>
                <View style={myCoursesStyles.modalIcon}>
                  <Icon name="rate-review" size={24} color="#084F8C" />
                </View>
              </View>
              <Text style={myCoursesStyles.modalTitle}>Share Your Experience</Text>
              <Text style={myCoursesStyles.modalSubtitle} numberOfLines={2}>
                {selectedCourse?.title}
              </Text>
              <Pressable onPress={closeFeedbackModal} style={myCoursesStyles.closeButton}>
                <Icon name="close" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Rating Section */}
            <View style={myCoursesStyles.section}>
              <Text style={myCoursesStyles.sectionLabel}>Your Rating</Text>
              <View style={myCoursesStyles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={myCoursesStyles.starButton}
                  >
                    <Icon
                      name={star <= rating ? "star" : "star-border"}
                      size={40}
                      color={star <= rating ? "#FFB300" : "#E2E8F0"}
                    />
                  </Pressable>
                ))}
              </View>
              {rating > 0 && (
                <View style={myCoursesStyles.ratingBadge}>
                  <Text style={myCoursesStyles.ratingEmoji}>
                    {rating === 1 && "😞"}
                    {rating === 2 && "😐"}
                    {rating === 3 && "🙂"}
                    {rating === 4 && "😊"}
                    {rating === 5 && "🤩"}
                  </Text>
                  <Text style={myCoursesStyles.ratingText}>
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </Text>
                </View>
              )}
            </View>

            {/* Comment Section */}
            <View style={myCoursesStyles.section}>
              <Text style={myCoursesStyles.sectionLabel}>Your Feedback</Text>
              <TextInput
                style={myCoursesStyles.commentInput}
                placeholder="Share what you loved or how we can improve..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={myCoursesStyles.charCount}>{comment.length}/500</Text>
            </View>

            {/* Action Buttons */}
            <View style={myCoursesStyles.buttonRow}>
              <Pressable style={myCoursesStyles.cancelButton} onPress={closeFeedbackModal}>
                <Text style={myCoursesStyles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  myCoursesStyles.submitButton,
                  (submittingFeedback || rating === 0 || !comment.trim()) &&
                  myCoursesStyles.submitButtonDisabled,
                ]}
                onPress={submitFeedback}
                disabled={submittingFeedback || rating === 0 || !comment.trim()}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={myCoursesStyles.submitButtonText}>Submit Review</Text>
                    <Icon name="send" size={18} color="#FFFFFF" />
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