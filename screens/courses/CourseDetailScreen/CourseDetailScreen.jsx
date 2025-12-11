import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
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
const { width } = Dimensions.get("window");

const formatDuration = (seconds) => {
  if (!seconds) return "0 minutes";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hours ${minutes > 0 ? minutes + " minutes" : ""}`;
  }
  return `${minutes} minutes`;
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

  // Biến này dùng để chặn double-click/double-tap
  const isProcessing = useRef(false);

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
    // 1. CHẶN DOUBLE CLICK
    if (isProcessing.current) {
      console.log("Already processing, blocking duplicate call");
      return;
    }
    isProcessing.current = true;

    // 2. UI FEEDBACK NGAY LẬP TỨC
    setShowPurchaseModal(false);
    setLoading(true);

    try {
      console.log("=== START TRANSACTION ===");
      console.log("Course ID:", course.id);
      console.log("Course Price:", course.price);

      // Gọi enrollCourse - backend sẽ tự lo việc charge và enroll
      console.log("Calling enrollCourse API (backend handles payment + enrollment)...");
      const enrollRes = await courseService.enrollCourse(course.id);
      console.log("enrollCourse Response:", JSON.stringify(enrollRes, null, 2));

      // Enrollment thành công
      console.log("Enrollment successful!");
      Toast.show({
        type: "success",
        text1: "Buy Success",
        text2: "Course purchased successfully!",
      });

      console.log("Fetching updated course details...");
      await fetchCourseDetail(courseId);
      console.log("=== END TRANSACTION - Starting learning ===");
      handleStartLearning();
    } catch (error) {
      console.error("Error in handleBuyCourse:", error);

      // Xử lý lỗi không đủ tiền
      if (error.message && error.message.includes("Insufficient balance")) {
        console.log("Insufficient balance, showing confirm modal");
        setShowConfirmModal(true);
      } else {
        Toast.show({
          type: "error",
          text1: "Buy Failed",
          text2: error.message || "Something went wrong",
        });
      }
    } finally {
      // 3. LUÔN LUÔN RESET TRẠNG THÁI Ở ĐÂY
      setLoading(false);
      isProcessing.current = false;
      console.log("Transaction lock released");
    }
  };

  const handleConfirmGoToWallet = () => {
    setShowConfirmModal(false);
    navigation.navigate("DesignerWallet");
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
          rating: data.avgRating || 0,
          students: data.studentCount || 0,
          level: data.lessons?.length > 5 ? "Advanced" : "Basic",
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
      <View style={courseDetailStyles.loadingContainer}>
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
      <ScrollView style={courseDetailStyles.scrollView} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={courseDetailStyles.heroContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={courseDetailStyles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={courseDetailStyles.heroOverlay}
          />

          <View style={courseDetailStyles.heroHeader}>
            <Pressable
              style={courseDetailStyles.backButton}
              onPress={handleBackPress}
            >
              <Icon name="arrow-back" size={24} color="white" />
            </Pressable>
          </View>

          <View style={courseDetailStyles.heroContent}>
            <View style={courseDetailStyles.heroBadges}>
              <View style={courseDetailStyles.levelBadge}>
                <Text style={courseDetailStyles.levelBadgeText}>{course.level}</Text>
              </View>
              <View style={courseDetailStyles.categoryBadge}>
                <Text style={courseDetailStyles.categoryBadgeText}>{course.category || "Design"}</Text>
              </View>
            </View>

            <Text style={courseDetailStyles.heroTitle}>{course.title}</Text>
            <Text style={courseDetailStyles.heroSubtitle}>{course.subtitle}</Text>

            <View style={courseDetailStyles.heroMeta}>
              <View style={courseDetailStyles.heroMetaItem}>
                <Icon name="star" size={20} color="#F59E0B" />
                <Text style={courseDetailStyles.heroMetaText}>{course.rating} Rating</Text>
              </View>
              <View style={courseDetailStyles.heroDivider} />
              <View style={courseDetailStyles.heroMetaItem}>
                <Icon name="people" size={20} color="#FFF" />
                <Text style={courseDetailStyles.heroMetaText}>{course.students} Students</Text>
              </View>
              <View style={courseDetailStyles.heroDivider} />
              <View style={courseDetailStyles.heroMetaItem}>
                <Icon name="schedule" size={20} color="#FFF" />
                <Text style={courseDetailStyles.heroMetaText}>{course.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        <ReanimatedView
          style={[courseDetailStyles.twoColumnContainer, animatedStyle]}
        >
          {/* LEFT COLUMN - Info & Content */}
          <View style={courseDetailStyles.leftColumn}>
            <Shadow distance={8} startColor="#00000008" finalColor="#00000000" style={{ width: '100%' }}>
              <View style={courseDetailStyles.mainCard}>
                <View style={courseDetailStyles.courseInfo}>
                  <Text style={courseDetailStyles.sectionHeaderTitle}>About this course</Text>

                  <View style={courseDetailStyles.instructorRow}>
                    <View style={courseDetailStyles.instructorAvatar}>
                      <Text style={courseDetailStyles.instructorInitial}>I</Text>
                    </View>
                    <View>
                      <Text style={courseDetailStyles.instructorName}>{course.instructor}</Text>
                      <Text style={courseDetailStyles.instructorRole}>Course Instructor</Text>
                    </View>
                  </View>

                  <View style={courseDetailStyles.descriptionText}>
                    <Text style={courseDetailStyles.descriptionContent}>
                      {course.description}
                    </Text>
                  </View>

                  <View style={courseDetailStyles.includesSection}>
                    <Text style={courseDetailStyles.includesTitle}>
                      What you'll learn
                    </Text>
                    <View style={courseDetailStyles.includesGrid}>
                      {course.includes.map((item, index) => (
                        <View key={index} style={courseDetailStyles.includeItem}>
                          <Icon name="check-circle" size={20} color="#10B981" />
                          <Text style={courseDetailStyles.includeText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </Shadow>

            {/* DEDICATED FEEDBACK SECTION */}
            {feedbackData && (
              <View style={{ marginTop: 32 }}>
                <Shadow distance={8} startColor="#00000008" finalColor="#00000000" style={{ width: '100%' }}>
                  <View style={courseDetailStyles.feedbackCard}>
                    <Text style={courseDetailStyles.sectionHeaderTitle}>Student Feedback</Text>

                    <View style={courseDetailStyles.feedbackContent}>
                      {/* LEFT: Rating Summary */}
                      <View style={courseDetailStyles.ratingSummaryColumn}>
                        <View style={courseDetailStyles.ratingOverview}>
                          <Text style={courseDetailStyles.averageRating}>
                            {feedbackData.averageRating?.toFixed(1) || "0.0"}
                          </Text>
                          <View style={courseDetailStyles.starsWrapper}>
                            {renderStars(Math.round(feedbackData.averageRating || 0))}
                          </View>
                          <Text style={courseDetailStyles.totalReviews}>
                            {feedbackData.totalFeedbacks} Course Rating
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
                                </View>
                                {feedback.comment && (
                                  <Text style={courseDetailStyles.reviewComment}>
                                    {feedback.comment}
                                  </Text>
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
                </Shadow>
              </View>
            )}
          </View>

          {/* RIGHT COLUMN - Price & Curriculum */}
          <View style={courseDetailStyles.rightColumn}>
            <Shadow distance={8} startColor="#00000008" finalColor="#00000000" style={{ width: '100%' }}>
              <View style={courseDetailStyles.stickyCard}>
                {/* Decorative top glow */}
                <View style={courseDetailStyles.cardGlowTop} />

                <View style={courseDetailStyles.priceSection}>
                  {/* Badge "Best Value" nếu giá tốt */}
                  {course.originalPrice && course.price < course.originalPrice && (
                    <View style={courseDetailStyles.bestValueBadge}>
                      <Icon name="local-offer" size={14} color="#DC2626" />
                      <Text style={courseDetailStyles.bestValueText}>Best Value Today!</Text>
                    </View>
                  )}

                  {/* Price */}
                  <Text style={courseDetailStyles.priceLabel}>Course Price</Text>

                  <View style={courseDetailStyles.priceRow}>
                    {course.originalPrice && course.price < course.originalPrice ? (
                      <>
                        <Text style={courseDetailStyles.originalPrice}>
                          {course.originalPrice.toLocaleString("vi-VN")}đ
                        </Text>
                        <Text style={courseDetailStyles.discountPrice}>
                          {course.price.toLocaleString("vi-VN")}đ
                        </Text>
                      </>
                    ) : (
                      <Text style={courseDetailStyles.discountPrice}>
                        {course.price?.toLocaleString("vi-VN") || "0"}đ
                      </Text>
                    )}
                  </View>

                  {/* Discount percentage nếu có */}
                  {course.originalPrice && course.price < course.originalPrice && (
                    <View style={courseDetailStyles.discountBadge}>
                      <Text style={courseDetailStyles.discountText}>
                        -{Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}%
                      </Text>
                    </View>
                  )}

                  {/* Main CTA Button */}
                  {course.isEnrolled ? (
                    <Pressable style={courseDetailStyles.primaryButton} onPress={handleStartLearning}>
                      <LinearGradient
                        colors={["#10B981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={courseDetailStyles.buttonGradient}
                      >
                        <Icon name="play-arrow" size={24} color="white" />
                        <Text style={courseDetailStyles.buttonText}>Start Learning Now</Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <Pressable style={courseDetailStyles.primaryButton} onPress={handleOpenPurchaseModal}>
                      <LinearGradient
                        colors={["#3B82F6", "#1D4ED8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={courseDetailStyles.buttonGradient}
                      >
                        <Icon name="shopping-cart" size={22} color="white" />
                        <Text style={courseDetailStyles.buttonText}>Buy Now Only {course.price?.toLocaleString("vi-VN")}đ</Text>
                      </LinearGradient>
                    </Pressable>
                  )}

                  {/* Trust elements */}
                  <View style={courseDetailStyles.trustRow}>
                    <View style={courseDetailStyles.trustItem}>
                      <Icon name="verified" size={18} color="#10B981" />
                      <Text style={courseDetailStyles.trustText}>Certificate of Completion</Text>
                    </View>
                    <View style={courseDetailStyles.trustItem}>
                      <Icon name="access-time" size={18} color="#F59E0B" />
                      <Text style={courseDetailStyles.trustText}>Learn for Life</Text>
                    </View>
                  </View>
                </View>

                <View style={courseDetailStyles.curriculumSection}>
                  <View style={courseDetailStyles.curriculumHeader}>
                    <Text style={courseDetailStyles.curriculumTitle}>
                      Curriculum
                    </Text>
                    <Text style={courseDetailStyles.curriculumMeta}>
                      {course.totalLessons} lessons • {course.duration}
                    </Text>
                  </View>

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
                          <View style={courseDetailStyles.lessonIndexBadge}>
                            <Text style={courseDetailStyles.lessonIndex}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={courseDetailStyles.lessonInfo}>
                            <Text style={courseDetailStyles.lessonTitle} numberOfLines={1}>
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
                              ? "keyboard-arrow-up"
                              : "keyboard-arrow-down"
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
            </Shadow>
          </View>
        </ReanimatedView>
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
            <View style={courseDetailStyles.modalIconContainer}>
              <Icon name="shopping-cart" size={32} color="#2348bfff" />
            </View>
            <Text style={courseDetailStyles.modalTitle}>Confirm Purchase</Text>
            <Text style={courseDetailStyles.modalMessage}>
              Do you want to purchase "{course.title}" for{" "}
              <Text style={{ fontWeight: '700', color: '#1F2937' }}>{course.price?.toLocaleString("vi-VN") || "0"} đ</Text>?
            </Text>

            <View style={courseDetailStyles.modalButtons}>
              <Pressable
                style={courseDetailStyles.cancelButton}
                onPress={handleCancelPurchase}
                disabled={loading}
              >
                <Text style={courseDetailStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  courseDetailStyles.confirmButton,
                  loading && { opacity: 0.6 }
                ]}
                onPress={handleBuyCourse}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#2348bfff", "#1e40afff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={courseDetailStyles.confirmButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={courseDetailStyles.confirmButtonText}>
                      Confirm
                    </Text>
                  )}
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
            <View style={[courseDetailStyles.modalIconContainer, { backgroundColor: '#FEF2F2' }]}>
              <Icon name="account-balance-wallet" size={32} color="#EF4444" />
            </View>
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
                  colors={["#2348bfff", "#1e40afff"]}
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
