import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { courseDetailStyles } from "./CourseDetailScreen.styles";
import { courseService } from "../../../service/courseService";
import Toast from "react-native-toast-message";
import { feedbackService } from "../../../service/feedbackService";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";

const ReanimatedView = Reanimated.createAnimatedComponent(View);

const formatDuration = (seconds) => {
  if (!seconds) return "0 phút";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes > 0 ? minutes + " phút" : ""}`;
  }
  return `${minutes} phút`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function CourseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || { courseId: 1 };

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });

    fetchCourseDetail(courseId);
    fetchFeedback(courseId);

  }, [courseId]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleStartLearning = () => {
    if (course && course.lessons && course.lessons.length > 0) {
      navigation.navigate("LessonScreen", {
        courseId: course.id,
        lessonId: course.lessons[0].lessonId,
      });
    }
  };

  const handlePreviewLesson = (lessonId) => {
    navigation.navigate("LessonScreen", {
      courseId: course.id,
      lessonId: lessonId,
      isPreview: true,
    });
  };

  const handleBuyCourse = async () => {
    setShowPurchaseModal(false);
    try {
      const res = await courseService.buyCourse(course.price);

      if (res.code === 402) {
        setShowConfirmModal(true);
        return;
      }

      if (res.code && res.code !== 200) {
        Toast.show({
          type: "error",
          text1: "Buy Failed",
          text2: res.message || "An error occurred",
        });
        return;
      }

      if (res.result?.status === "SUCCESS") {
        const enrollRes = await courseService.enrollCourse(course.id);

        Toast.show({
          type: "success",
          text1: "Buy Success",
          text2: "Course purchased successfully!",
        });

        await fetchCourseDetail(courseId);
        handleStartLearning();
      } else {
        Toast.show({
          type: "error",
          text1: "Buy Failed",
          text2: "Unknown error occurred",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Buy Failed",
        text2: error.message || "Something went wrong",
      });
    }
  };

  const handleConfirmGoToWallet = () => {
    setShowConfirmModal(false);
    navigation.navigate("Wallet");
  };

  const handleCancelGoToWallet = () => {
    setShowConfirmModal(false);
  };

  const handleOpenPurchaseModal = () => {
    setShowPurchaseModal(true);
  };

  const handleCancelPurchase = () => {
    setShowPurchaseModal(false);
  };

  const toggleLesson = (lessonId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const fetchFeedback = async (courseId) => {
    try {
      const data = await feedbackService.getAllFeedbackCourse(courseId);

      setFeedbackData(data);

    } catch (error) {
      console.error("Error fetching feedback:", error.message);
    }
  };

  const fetchCourseDetail = async (courseId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await courseService.getCourseById(courseId);
      const enrolledRes = await courseService.getAllCourseEnrollments2();

      if (response && response.result) {
        const data = response.result;

        const enrolledCourses = enrolledRes.result || [];
        const isEnrolled = enrolledCourses.some(
          (item) => item.courseId === data.courseId
        );

        const transformedCourse = {
          id: data.courseId,
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          instructor: "Instructor",
          imageUrl: data.imageUrl?.trim() || null,
          price: data.price,
          rating: 4.5,
          students: data.studentCount,
          level: data.lessons?.length > 5 ? "Nâng cao" : "Cơ bản",
          category: data.category,
          duration: formatDuration(data.totalDuration),
          totalLessons: data.lessons?.length || 0,
          includes: [
            `${data.lessons?.length || 0} video lessons`,
            "Study materials",
            "Full access to all lessons",
          ],
          lessons: data.lessons || [],
          isEnrolled,
        };

        setCourse(transformedCourse);
      }
    } catch (error) {
      console.error("Error fetching course detail:", error.message);
      setError("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={courseDetailStyles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-border"}
            size={16}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={courseDetailStyles.ratingBarContainer}>
        <View style={courseDetailStyles.ratingBarBg}>
          <View
            style={[
              courseDetailStyles.ratingBarFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>
        <Text style={courseDetailStyles.ratingBarText}>{count}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
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

  if (error || !course) {
    return (
      <View style={courseDetailStyles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={courseDetailStyles.errorText}>
          {error || "Không tìm thấy khóa học"}
        </Text>
        <Pressable
          style={courseDetailStyles.retryButton}
          onPress={() => fetchCourseDetail(courseId)}
        >
          <Text style={courseDetailStyles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl =
    course.imageUrl || "https://via.placeholder.com/400x200?text=Course+Image";

  return (
    <View style={courseDetailStyles.container}>
      <View style={courseDetailStyles.header}>
        <Pressable
          style={courseDetailStyles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={courseDetailStyles.headerTitle}>Course Details</Text>
        <View style={courseDetailStyles.headerRight} />
      </View>

      <ScrollView style={courseDetailStyles.scrollView}>
        <ReanimatedView
          style={[courseDetailStyles.twoColumnContainer, animatedStyle]}
        >
          {/* LEFT COLUMN - Info & Content */}
          <View style={courseDetailStyles.leftColumn}>
            <View style={courseDetailStyles.mainCard}>
              <Image
                source={{ uri: imageUrl }}
                style={courseDetailStyles.courseImage}
              />

              <View style={courseDetailStyles.courseInfo}>
                <Text style={courseDetailStyles.courseTitle}>
                  {course.title}
                </Text>
                <Text style={courseDetailStyles.subtitle}>
                  {course.subtitle || course.description}
                </Text>

                <View style={courseDetailStyles.metaRow}>
                  <View style={courseDetailStyles.metaItem}>
                    <Icon name="person-outline" size={16} color="#6B7280" />
                    <Text style={courseDetailStyles.metaText}>
                      {course.instructor}
                    </Text>
                  </View>
                  <View style={courseDetailStyles.metaItem}>
                    <Icon name="star" size={16} color="#F59E0B" />
                    <Text style={courseDetailStyles.metaText}>
                      {course.rating}
                    </Text>
                  </View>
                  <View style={courseDetailStyles.metaItem}>
                    <Icon name="people-outline" size={16} color="#6B7280" />
                    <Text style={courseDetailStyles.metaText}>
                      {course.students}
                    </Text>
                  </View>
                  <View style={courseDetailStyles.metaItem}>
                    <Text style={courseDetailStyles.levelBadge}>
                      {course.level}
                    </Text>
                  </View>
                </View>

                <View style={courseDetailStyles.descriptionText}>
                  <Text style={courseDetailStyles.descriptionContent}>
                    {course.description}
                  </Text>
                </View>

                <View style={courseDetailStyles.includesSection}>
                  <Text style={courseDetailStyles.includesTitle}>
                    What you'll learn:
                  </Text>
                  {course.includes.map((item, index) => (
                    <View key={index} style={courseDetailStyles.includeItem}>
                      <Icon name="check" size={18} color="#10B981" />
                      <Text style={courseDetailStyles.includeText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT COLUMN - Price & Curriculum */}
          <View style={courseDetailStyles.rightColumn}>
            <View style={courseDetailStyles.stickyCard}>
              <View style={courseDetailStyles.priceSection}>
                <Text style={courseDetailStyles.priceText}>
                  {course.price?.toLocaleString("vi-VN") || "0"} đ
                </Text>

                {course.isEnrolled ? (
                  <Pressable
                    style={courseDetailStyles.primaryButton}
                    onPress={handleStartLearning}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={courseDetailStyles.buttonGradient}
                    >
                      <Icon name="play-arrow" size={22} color="white" />
                      <Text style={courseDetailStyles.buttonText}>
                        Start Learning
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <Pressable
                    style={courseDetailStyles.primaryButton}
                    onPress={handleOpenPurchaseModal}
                  >
                    <LinearGradient
                      colors={["#3B82F6", "#2563EB"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={courseDetailStyles.buttonGradient}
                    >
                      <Icon name="shopping-cart" size={20} color="white" />
                      <Text style={courseDetailStyles.buttonText}>Buy Now</Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>

              <View style={courseDetailStyles.curriculumSection}>
                <View style={courseDetailStyles.curriculumHeader}>
                  <Icon name="format-list-bulleted" size={24} color="#3B82F6" />
                  <Text style={courseDetailStyles.curriculumTitle}>
                    Course Curriculum
                  </Text>
                </View>
                <Text style={courseDetailStyles.curriculumMeta}>
                  {course.totalLessons} lessons • {course.duration}
                </Text>

                {course.lessons.map((lesson, index) => (
                  <View
                    key={lesson.lessonId}
                    style={courseDetailStyles.lessonItem}
                  >
                    <Pressable
                      style={courseDetailStyles.lessonHeader}
                      onPress={() => toggleLesson(lesson.lessonId)}
                    >
                      <View style={courseDetailStyles.lessonHeaderLeft}>
                        <Text style={courseDetailStyles.lessonIndex}>
                          {index + 1}
                        </Text>
                        <View style={courseDetailStyles.lessonInfo}>
                          <Text style={courseDetailStyles.lessonTitle}>
                            {lesson.title}
                          </Text>
                          <Text style={courseDetailStyles.lessonDuration}>
                            {formatDuration(lesson.duration)}
                          </Text>
                        </View>
                      </View>
                      <Icon
                        name={
                          expandedModules[lesson.lessonId]
                            ? "expand-less"
                            : "expand-more"
                        }
                        size={24}
                        color="#9CA3AF"
                      />
                    </Pressable>

                    {expandedModules[lesson.lessonId] && lesson.content && (
                      <View style={courseDetailStyles.lessonContent}>
                        <Text style={courseDetailStyles.lessonContentText}>
                          {lesson.content}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ReanimatedView>

        {/* DEDICATED FEEDBACK SECTION */}
        {feedbackData && (
          <View style={courseDetailStyles.feedbackContainer}>
            {/* <View style={courseDetailStyles.feedbackHeader}>
              <Icon name="rate-review" size={28} color="#3B82F6" />
              <View>
                <Text style={courseDetailStyles.feedbackTitle}>Student Feedback</Text>
                <Text style={courseDetailStyles.feedbackSubTitle}>
                  Đánh giá và nhận xét từ học viên đã tham gia khóa học
                </Text>
              </View>
            </View> */}

            <View style={courseDetailStyles.feedbackContent}>
              {/* LEFT: Rating Summary */}
              <View style={courseDetailStyles.ratingSummaryColumn}>
                <View style={courseDetailStyles.ratingOverview}>
                  <Text style={courseDetailStyles.averageRating}>
                    {feedbackData.averageRating?.toFixed(1) || "0.0"}
                  </Text>
                  {renderStars(Math.round(feedbackData.averageRating || 0))}
                  <Text style={courseDetailStyles.totalReviews}>
                    {feedbackData.totalFeedbacks} feedbacks
                  </Text>
                </View>

                <View style={courseDetailStyles.ratingDistribution}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <View key={star} style={courseDetailStyles.ratingRow}>
                      <View style={courseDetailStyles.ratingStars}>
                        {renderStars(star)}
                      </View>
                      {renderRatingBar(
                        feedbackData.ratingDistribution?.[star] || 0,
                        feedbackData.totalFeedbacks
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* RIGHT: Reviews List */}
              <View style={courseDetailStyles.reviewsListColumn}>
                <Text style={courseDetailStyles.reviewsListTitle}>Feedback List</Text>
                <View style={courseDetailStyles.reviewsList}>
                  {feedbackData.feedbacks && feedbackData.feedbacks.length > 0 ? (
                    feedbackData.feedbacks.map((feedback) => (
                      <View key={feedback.id} style={courseDetailStyles.reviewItem}>
                        <View style={courseDetailStyles.reviewHeader}>
                          <View style={courseDetailStyles.reviewerInfo}>
                            {feedback.userAvatarUrl ? (
                              <Image
                                source={{ uri: feedback.userAvatarUrl }}
                                style={courseDetailStyles.reviewerAvatar}
                              />
                            ) : (
                              <View style={courseDetailStyles.reviewerAvatarPlaceholder}>
                                <Text style={courseDetailStyles.reviewerInitial}>
                                  {feedback.userFullName?.charAt(0) || "U"}
                                </Text>
                              </View>
                            )}
                            <View style={courseDetailStyles.reviewerDetails}>
                              <Text style={courseDetailStyles.reviewerName}>
                                {feedback.userFullName || "Anonymous"}
                              </Text>
                              <View style={courseDetailStyles.reviewMeta}>
                                {renderStars(feedback.rating)}
                                <Text style={courseDetailStyles.reviewDate}>
                                  {formatDate(feedback.createdAt)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          {feedback.isEdited && (
                            <Text style={courseDetailStyles.editedBadge}>Edited</Text>
                          )}
                        </View>
                        {feedback.comment && (
                          <Text style={courseDetailStyles.reviewComment}>
                            {feedback.comment}
                          </Text>
                        )}
                        {feedback.progressWhenSubmitted === 100 && (
                          <View style={courseDetailStyles.completedBadge}>
                            <Icon name="check-circle" size={14} color="#10B981" />
                            <Text style={courseDetailStyles.completedText}>
                              Completed
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={courseDetailStyles.noReviews}>
                      No feedbacks yet.
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal Confirm - Purchase */}
      < Modal
        visible={showPurchaseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPurchase}
      >
        <View style={courseDetailStyles.modalOverlay}>
          <View style={courseDetailStyles.modalContent}>
            <Icon name="shopping-cart" size={48} color="#3B82F6" />
            <Text style={courseDetailStyles.modalTitle}>Confirm Purchase</Text>
            <Text style={courseDetailStyles.modalMessage}>
              Do you want to purchase "{course.title}" for{" "}
              {course.price?.toLocaleString("vi-VN") || "0"} đ?
            </Text>

            <View style={courseDetailStyles.modalButtons}>
              <Pressable
                style={courseDetailStyles.cancelButton}
                onPress={handleCancelPurchase}
              >
                <Text style={courseDetailStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={courseDetailStyles.confirmButton}
                onPress={handleBuyCourse}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={courseDetailStyles.confirmButtonGradient}
                >
                  <Text style={courseDetailStyles.confirmButtonText}>
                    Confirm
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirm - Insufficient Balance */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelGoToWallet}
      >
        <View style={courseDetailStyles.modalOverlay}>
          <View style={courseDetailStyles.modalContent}>
            <Icon name="account-balance-wallet" size={48} color="#EF4444" />
            <Text style={courseDetailStyles.modalTitle}>
              Insufficient Balance
            </Text>
            <Text style={courseDetailStyles.modalMessage}>
              You don't have enough balance to purchase this course. Would you
              like to go to your wallet to deposit funds?
            </Text>

            <View style={courseDetailStyles.modalButtons}>
              <Pressable
                style={courseDetailStyles.cancelButton}
                onPress={handleCancelGoToWallet}
              >
                <Text style={courseDetailStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={courseDetailStyles.confirmButton}
                onPress={handleConfirmGoToWallet}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={courseDetailStyles.confirmButtonGradient}
                >
                  <Text style={courseDetailStyles.confirmButtonText}>
                    Go to Wallet
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
