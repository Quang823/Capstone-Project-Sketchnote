import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { getStyles } from "./CourseDetailScreen.styles";
import { courseService } from "../../../service/courseService";
import Toast from "react-native-toast-message";
import { feedbackService } from "../../../service/feedbackService";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { useTheme } from "../../../context/ThemeContext";

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
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function CourseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || { courseId: 1 };
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

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
      return;
    }
    isProcessing.current = true;

    // 2. UI FEEDBACK NGAY LẬP TỨC
    setShowPurchaseModal(false);
    setLoading(true);

    try {
      const enrollRes = await courseService.enrollCourse(course.id);
      // Enrollment thành công
      Toast.show({
        type: "success",
        text1: "Buy Success",
        text2: "Course purchased successfully!",
      });

      await fetchCourseDetail(courseId);
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
      setError("Error fetching course detail");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? "star" : "star-border"}
            size={16}
            color={styles.colors.star}
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View style={styles.ratingBarContainer}>
        <View style={styles.ratingBarBg}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarText}>{count}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={styles.colors.error} />
        <Text style={styles.errorText}>
          {error || "Can not load course detail"}
        </Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => fetchCourseDetail(courseId)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const imageUrl =
    course.imageUrl || "https://via.placeholder.com/400x200?text=Course+Image";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              styles.colors.heroOverlayStart,
              styles.colors.heroOverlayEnd,
            ]}
            style={styles.heroOverlay}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{course.level}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {course.category || "Design"}
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>{course.title}</Text>
            <Text style={styles.heroSubtitle}>{course.subtitle}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Icon name="star" size={20} color={styles.colors.star} />
                <Text style={styles.heroMetaText}>{course.rating} Rating</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaItem}>
                <Icon name="people" size={20} color={styles.colors.white} />
                <Text style={styles.heroMetaText}>
                  {course.students} Students
                </Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroMetaItem}>
                <Icon name="schedule" size={20} color={styles.colors.white} />
                <Text style={styles.heroMetaText}>{course.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        <ReanimatedView style={[styles.twoColumnContainer, animatedStyle]}>
          {/* LEFT COLUMN - Info & Content */}
          <View style={styles.leftColumn}>
            <Shadow
              distance={8}
              startColor={styles.colors.shadowColor + "08"}
              finalColor={styles.colors.shadowColor + "00"}
              style={{ width: "100%" }}
            >
              <View style={styles.mainCard}>
                <View style={styles.courseInfo}>
                  <Text style={styles.sectionHeaderTitle}>
                    About this course
                  </Text>

                  <View style={styles.instructorRow}>
                    <View style={styles.instructorAvatar}>
                      <Text style={styles.instructorInitial}>I</Text>
                    </View>
                    <View>
                      <Text style={styles.instructorName}>
                        {course.instructor}
                      </Text>
                      <Text style={styles.instructorRole}>
                        Course Instructor
                      </Text>
                    </View>
                  </View>

                  <View style={styles.descriptionText}>
                    <Text style={styles.descriptionContent}>
                      {course.description}
                    </Text>
                  </View>

                  <View style={styles.includesSection}>
                    <Text style={styles.includesTitle}>What you'll learn</Text>
                    <View style={styles.includesGrid}>
                      {course.includes.map((item, index) => (
                        <View key={index} style={styles.includeItem}>
                          <Icon
                            name="check-circle"
                            size={20}
                            color={styles.colors.success}
                          />
                          <Text style={styles.includeText}>{item}</Text>
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
                <Shadow
                  distance={8}
                  startColor={styles.colors.shadowColor + "08"}
                  finalColor={styles.colors.shadowColor + "00"}
                  style={{ width: "100%" }}
                >
                  <View style={styles.feedbackCard}>
                    <Text style={styles.sectionHeaderTitle}>
                      Student Feedback
                    </Text>

                    <View style={styles.feedbackContent}>
                      {/* LEFT: Rating Summary */}
                      <View style={styles.ratingSummaryColumn}>
                        <View style={styles.ratingOverview}>
                          <Text style={styles.averageRating}>
                            {feedbackData.averageRating?.toFixed(1) || "0.0"}
                          </Text>
                          <View style={styles.starsWrapper}>
                            {renderStars(
                              Math.round(feedbackData.averageRating || 0)
                            )}
                          </View>
                          <Text style={styles.totalReviews}>
                            {feedbackData.totalFeedbacks} Course Rating
                          </Text>
                        </View>

                        <View style={styles.ratingDistribution}>
                          {[5, 4, 3, 2, 1].map((star) => (
                            <View key={star} style={styles.ratingRow}>
                              <View style={styles.ratingStars}>
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
                      <View style={styles.reviewsListColumn}>
                        <View style={styles.reviewsList}>
                          {feedbackData.feedbacks &&
                            feedbackData.feedbacks.length > 0 ? (
                            feedbackData.feedbacks.map((feedback) => (
                              <View key={feedback.id} style={styles.reviewItem}>
                                <View style={styles.reviewHeader}>
                                  <View style={styles.reviewerInfo}>
                                    {feedback.userAvatarUrl ? (
                                      <Image
                                        source={{ uri: feedback.userAvatarUrl }}
                                        style={styles.reviewerAvatar}
                                      />
                                    ) : (
                                      <View
                                        style={styles.reviewerAvatarPlaceholder}
                                      >
                                        <Text style={styles.reviewerInitial}>
                                          {feedback.userFullName?.charAt(0) ||
                                            "U"}
                                        </Text>
                                      </View>
                                    )}
                                    <View style={styles.reviewerDetails}>
                                      <Text style={styles.reviewerName}>
                                        {feedback.userFullName || "Anonymous"}
                                      </Text>
                                      <View style={styles.reviewMeta}>
                                        {renderStars(feedback.rating)}
                                        <Text style={styles.reviewDate}>
                                          {formatDate(feedback.createdAt)}
                                        </Text>
                                      </View>
                                    </View>
                                  </View>
                                </View>
                                {feedback.comment && (
                                  <Text style={styles.reviewComment}>
                                    {feedback.comment}
                                  </Text>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noReviews}>
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
          <View style={styles.rightColumn}>
            <Shadow
              distance={8}
              startColor={styles.colors.shadowColor + "08"}
              finalColor={styles.colors.shadowColor + "00"}
              style={{ width: "100%" }}
            >
              <View style={styles.stickyCard}>
                {/* Decorative top glow */}
                <View style={styles.cardGlowTop} />

                <View style={styles.priceSection}>
                  {/* Badge "Best Value" nếu giá tốt */}
                  {course.originalPrice &&
                    course.price < course.originalPrice && (
                      <View style={styles.bestValueBadge}>
                        <Icon
                          name="local-offer"
                          size={14}
                          color={styles.colors.bestValueIcon}
                        />
                        <Text style={styles.bestValueText}>
                          Best Value Today!
                        </Text>
                      </View>
                    )}

                  {/* Price */}
                  <Text style={styles.priceLabel}>Course Price</Text>

                  <View style={styles.priceRow}>
                    {course.originalPrice &&
                      course.price < course.originalPrice ? (
                      <>
                        <Text style={styles.originalPrice}>
                          {course.originalPrice.toLocaleString("vi-VN")}đ
                        </Text>
                        <Text style={styles.discountPrice}>
                          {course.price.toLocaleString("vi-VN")}đ
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.discountPrice}>
                        {course.price?.toLocaleString("vi-VN") || "0"}đ
                      </Text>
                    )}
                  </View>

                  {/* Discount percentage nếu có */}
                  {course.originalPrice &&
                    course.price < course.originalPrice && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                          -
                          {Math.round(
                            ((course.originalPrice - course.price) /
                              course.originalPrice) *
                            100
                          )}
                          %
                        </Text>
                      </View>
                    )}

                  {/* Main CTA Button */}
                  {course.isEnrolled ? (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleStartLearning}
                    >
                      <LinearGradient
                        colors={["#10B981", "#059669"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Icon
                          name="play-arrow"
                          size={24}
                          color={styles.colors.ratingBarBg}
                        />
                        <Text style={styles.buttonText}>
                          Start Learning Now
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  ) : (
                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleOpenPurchaseModal}
                    >
                      <LinearGradient
                        colors={["#3B82F6", "#1D4ED8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        <Icon
                          name="shopping-cart"
                          size={22}
                          color={styles.colors.white}
                        />
                        <Text style={styles.buttonText}>
                          Buy Now Only {course.price?.toLocaleString("vi-VN")}đ
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  )}

                  {/* Trust elements */}
                  <View style={styles.trustRow}>
                    <View style={styles.trustItem}>
                      <Icon
                        name="verified"
                        size={18}
                        color={styles.colors.success}
                      />
                      <Text style={styles.trustText}>
                        Certificate of Completion
                      </Text>
                    </View>
                    <View style={styles.trustItem}>
                      <Icon
                        name="access-time"
                        size={18}
                        color={styles.colors.star}
                      />
                      <Text style={styles.trustText}>Learn for Life</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.curriculumSection}>
                  <View style={styles.curriculumHeader}>
                    <Text style={styles.curriculumTitle}>Curriculum</Text>
                    <Text style={styles.curriculumMeta}>
                      {course.totalLessons} lessons • {course.duration}
                    </Text>
                  </View>

                  {course.lessons.map((lesson, index) => (
                    <View key={lesson.lessonId} style={styles.lessonItem}>
                      <Pressable
                        style={styles.lessonHeader}
                        onPress={() => toggleLesson(lesson.lessonId)}
                      >
                        <View style={styles.lessonHeaderLeft}>
                          <View style={styles.lessonIndexBadge}>
                            <Text style={styles.lessonIndex}>{index + 1}</Text>
                          </View>
                          <View style={styles.lessonInfo}>
                            <Text style={styles.lessonTitle} numberOfLines={1}>
                              {lesson.title}
                            </Text>
                            <Text style={styles.lessonDuration}>
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
                          color={styles.colors.arrowIcon}
                        />
                      </Pressable>

                      {expandedModules[lesson.lessonId] && lesson.content && (
                        <View style={styles.lessonContent}>
                          <Text style={styles.lessonContentText}>
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
      <View style={styles.heroHeader}>
        <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color={styles.colors.white} />
        </Pressable>
      </View>
      {/* Modal Confirm - Purchase */}
      <Modal
        visible={showPurchaseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPurchase}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Icon
                name="shopping-cart"
                size={32}
                color={styles.colors.shoppingCartIcon}
              />
            </View>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
            <Text style={styles.modalMessage}>
              Do you want to purchase "{course.title}" for{" "}
              <Text style={{ fontWeight: "700", color: styles.colors.text }}>
                {course.price?.toLocaleString("vi-VN") || "0"} đ
              </Text>
              ?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelPurchase}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmButton, loading && { opacity: 0.6 }]}
                onPress={handleBuyCourse}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#2348bfff", "#1e40afff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: "#FEF2F2" },
              ]}
            >
              <Icon
                name="account-balance-wallet"
                size={32}
                color={styles.colors.error}
              />
            </View>
            <Text style={styles.modalTitle}>Insufficient Balance</Text>
            <Text style={styles.modalMessage}>
              You don't have enough balance to purchase this course. Would you
              like to go to your wallet to deposit funds?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={handleCancelGoToWallet}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleConfirmGoToWallet}
              >
                <LinearGradient
                  colors={["#2348bfff", "#1e40afff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>Go to Wallet</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}