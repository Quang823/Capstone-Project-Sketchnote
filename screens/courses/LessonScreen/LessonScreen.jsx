import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getStyles } from "./LessonScreen.styles";
import { courseService } from "../../../service/courseService";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../context/ThemeContext";

// Breakpoints
const TABLET_BREAKPOINT = 768;
const SIDEBAR_WIDTH_TABLET = 320;
const SIDEBAR_WIDTH_PHONE = 280;

export default function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || {};
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive calculations
  const isTablet = windowWidth >= TABLET_BREAKPOINT;
  const isLandscape = windowWidth > windowHeight;
  const sidebarWidth = isTablet ? SIDEBAR_WIDTH_TABLET : SIDEBAR_WIDTH_PHONE;

  // For phone: show sidebar as modal, for tablet: show side by side
  const showSidebarInline = isTablet;

  // Calculate player dimensions
  const mainContentWidth = showSidebarInline
    ? windowWidth - sidebarWidth
    : windowWidth;
  const playerWidth = mainContentWidth - (isTablet ? 64 : 32);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  // States
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false); // For phone modal
  const [videoStatus, setVideoStatus] = useState({}); // Video playback status
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastSavedPositionRef = useRef(0); // Track last saved position to avoid duplicate saves

  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  // Fetch course enrollment data with lessons
  const fetchCourseData = useCallback(async () => {
    if (!courseId) {
      setError("Course ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getCourseEnrollmentsByCourseId(courseId);
      setEnrollmentData(data);

      if (data?.course?.lessons) {
        // Sort lessons by orderIndex
        const sortedLessons = [...data.course.lessons].sort(
          (a, b) => a.orderIndex - b.orderIndex
        );
        setLessons(sortedLessons);

        // Find first incomplete lesson or first lesson
        const firstIncompleteIndex = sortedLessons.findIndex(
          (lesson) => lesson.lessonProgressStatus !== "COMPLETED"
        );
        setCurrentLessonIndex(
          firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0
        );
      }
    } catch (err) {
      console.warn("Error fetching course data:", err);
      setError(err.message || "Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [fetchCourseData]);

  // Current lesson
  const currentLesson = lessons[currentLessonIndex] || null;

  // Check if lesson is unlocked
  const isLessonUnlocked = (index) => {
    if (index === 0) return true; // First lesson always unlocked

    // Check if previous lesson is completed
    const previousLesson = lessons[index - 1];
    return previousLesson?.lessonProgressStatus === "COMPLETED";
  };

  // Handle lesson selection from sidebar
  const handleSelectLesson = (index) => {
    if (!isLessonUnlocked(index)) {
      Alert.alert(
        "Lesson Locked",
        "Please complete the previous lesson first to unlock this one.",
        [{ text: "OK" }]
      );
      return;
    }
    setCurrentLessonIndex(index);
    setExpandedLesson(null);
    setActiveTab("overview");
    setVideoProgress(0);
  };

  // Toggle lesson expand in sidebar
  const toggleLessonExpand = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  // Handle video state change - auto complete when video ends
  const onVideoStateChange = useCallback(
    async (state) => {
      if (state === "ended") {
        // Video ended - auto save and move to next lesson
        if (!currentLesson || saving) return;
        if (currentLesson.lessonProgressStatus === "COMPLETED") {
          // Already completed, just move to next
          const nextIndex = currentLessonIndex + 1;
          if (nextIndex < lessons.length && isLessonUnlocked(nextIndex)) {
            setCurrentLessonIndex(nextIndex);
          }
          return;
        }

        try {
          setSaving(true);

          const progressData = {
            lastPosition: currentLesson.duration,
            timeSpent: currentLesson.duration,
            completed: true,
          };

          await courseService.saveLessonProgress(
            courseId,
            currentLesson.lessonId,
            progressData
          );

          // Refresh data to get updated progress
          await fetchCourseData();

          // Show completion toast
          Toast.show({
            type: "success",
            position: "top",
            text1: "✓ Lesson Completed!",
            text2: `Great job! You've completed "${currentLesson.title}"`,
            duration: 3000,
          });

          // Check if all lessons are completed
          const allLessonsCompleted = lessons.every(
            (lesson, idx) =>
              idx < lessons.length &&
              (lesson.lessonProgressStatus === "COMPLETED" ||
                idx === currentLessonIndex)
          );

          // Check if there's a next lesson
          const nextIndex = currentLessonIndex + 1;
          if (nextIndex < lessons.length) {
            // Auto move to next lesson
            setTimeout(() => {
              setCurrentLessonIndex(nextIndex);
            }, 1500);
          } else if (allLessonsCompleted) {
            // Show course completion toast
            setTimeout(() => {
              Toast.show({
                type: "success",
                position: "top",
                text1: "🎉 Course Completed!",
                text2: `Congratulations! You've completed all lessons in this course.`,
                duration: 4000,
              });
            }, 1500);
          }
          // If all lessons completed, just stay on current screen (don't navigate)
        } catch (err) {
          console.warn("Error saving lesson progress:", err);
          Toast.show({
            type: "error",
            position: "top",
            text1: "Error",
            text2: "Failed to save lesson progress. Please try again.",
            duration: 3000,
          });
        } finally {
          setSaving(false);
        }
      }
    },
    [
      currentLesson,
      saving,
      currentLessonIndex,
      lessons,
      courseId,
      fetchCourseData,
    ]
  );

  // Handle video playback status update from expo-av
  const onPlaybackStatusUpdate = useCallback(
    async (status) => {
      setVideoStatus(status);

      if (!status.isLoaded) return;

      // Update progress states
      if (status.durationMillis) {
        setVideoDuration(Math.floor(status.durationMillis / 1000));
      }
      if (status.positionMillis) {
        setVideoProgress(Math.floor(status.positionMillis / 1000));
      }
      setIsVideoPlaying(status.isPlaying);

      // Auto-save progress periodically (every 10 seconds of video watched)
      const currentPosition = Math.floor(status.positionMillis / 1000);
      if (
        currentLesson &&
        currentLesson.lessonProgressStatus !== "COMPLETED" &&
        currentPosition > 0 &&
        currentPosition - lastSavedPositionRef.current >= 10
      ) {
        lastSavedPositionRef.current = currentPosition;
        try {
          const progressData = {
            lastPosition: currentPosition,
            timeSpent: currentPosition,
            completed: false,
          };
          await courseService.saveLessonProgress(
            courseId,
            currentLesson.lessonId,
            progressData
          );
        } catch (err) {
          console.warn("Error auto-saving progress:", err);
        }
      }

      // Handle video ended
      if (status.didJustFinish && !status.isLooping) {
        onVideoStateChange("ended");
      }
    },
    [currentLesson, courseId, onVideoStateChange]
  );

  // Reset video states when lesson changes
  useEffect(() => {
    setVideoProgress(0);
    setVideoDuration(0);
    setVideoStatus({});
    lastSavedPositionRef.current = 0;

    // Seek to last position if lesson has progress
    if (currentLesson?.lastPosition > 0 && videoRef.current) {
      setTimeout(async () => {
        try {
          await videoRef.current.setPositionAsync(
            currentLesson.lastPosition * 1000
          );
        } catch (err) {
          console.warn("Error seeking to last position:", err);
        }
      }, 500);
    }
  }, [currentLessonIndex, currentLesson?.lessonId]);

  // Check if video URL is a Cloudinary/direct video URL (not YouTube)
  const isDirectVideoUrl = (url) => {
    if (!url) return false;
    return (
      url.includes("cloudinary.com") ||
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".mov")
    );
  };

  // Save lesson progress and mark as complete (manual button)
  const handleCompleteLesson = async () => {
    if (!currentLesson || saving) return;

    try {
      setSaving(true);

      const progressData = {
        lastPosition: currentLesson.duration,
        timeSpent: currentLesson.duration,
        completed: true,
      };

      await courseService.saveLessonProgress(
        courseId,
        currentLesson.lessonId,
        progressData
      );

      // Refresh data to get updated progress
      await fetchCourseData();

      // Show completion toast
      Toast.show({
        type: "success",
        position: "top",
        text1: "✓ Lesson Completed!",
        text2: `Great job! You've completed "${currentLesson.title}"`,
        duration: 3000,
      });

      // Check if all lessons are completed
      const allLessonsCompleted = lessons.every(
        (lesson, idx) =>
          idx < lessons.length &&
          (lesson.lessonProgressStatus === "COMPLETED" ||
            idx === currentLessonIndex)
      );

      // Check if there's a next lesson
      const nextIndex = currentLessonIndex + 1;
      if (nextIndex < lessons.length) {
        // Auto move to next lesson
        setTimeout(() => {
          setCurrentLessonIndex(nextIndex);
        }, 1500);
      } else if (allLessonsCompleted) {
        // Show course completion toast
        setTimeout(() => {
          Toast.show({
            type: "success",
            position: "top",
            text1: "🎉 Course Completed!",
            text2: `Congratulations! You've completed all lessons in this course.`,
            duration: 4000,
          });
        }, 1500);
      }
      // If all lessons completed, just stay on current screen (don't navigate)
    } catch (err) {
      console.warn("Error saving lesson progress:", err);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Error",
        text2: "Failed to save lesson progress. Please try again.",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Navigate to previous lesson
  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setActiveTab("overview");
    }
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    const nextIndex = currentLessonIndex + 1;
    if (nextIndex < lessons.length && isLessonUnlocked(nextIndex)) {
      setCurrentLessonIndex(nextIndex);
      setActiveTab("overview");
    }
  };

  // Format duration (seconds to mm:ss or hh:mm:ss)
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if current lesson has a valid video URL
  const hasVideoUrl =
    currentLesson?.videoUrl && currentLesson.videoUrl.length > 0;

  // Get lesson status icon and color
  const getLessonStatusIcon = (lesson, index) => {
    if (lesson.lessonProgressStatus === "COMPLETED") {
      return { icon: "check-circle", color: styles.checkIcon }; // Green check
    }
    if (!isLessonUnlocked(index)) {
      return { icon: "lock", color: styles.lockIcon }; // Gray lock
    }
    if (lesson.lessonProgressStatus === "IN_PROGRESS") {
      return { icon: "play-circle-outline", color: styles.inProgressIcon }; // Orange in progress
    }
    return { icon: "play-circle-outline", color: styles.playIcon }; // Blue ready to start
  };

  // Calculate completed lessons count
  const completedLessonsCount = lessons.filter(
    (l) => l.lessonProgressStatus === "COMPLETED"
  ).length;

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCourseData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const course = enrollmentData?.course;
  const progressPercent = enrollmentData?.progressPercent || 0;

  // Sidebar content component (reused for both inline and modal)
  const renderSidebarContent = () => (
    <>
      {/* Sidebar Header */}
      <View style={[styles.sidebarHeader, !isTablet && { paddingTop: 50 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (!isTablet) {
              setSidebarVisible(false);
            }
            navigation.goBack();
          }}
        >
          <Icon name="arrow-back" size={20} color={styles.backButtonIcon} />
        </TouchableOpacity>
        <Text
          style={[styles.sidebarHeaderText, !isTablet && { fontSize: 14 }]}
          numberOfLines={1}
        >
          {course?.title || "Course"}
        </Text>
        {!isTablet && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSidebarVisible(false)}
          >
            <Icon name="close" size={20} color={styles.backButtonIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Course Progress Overview */}
      {/* <View style={styles.overviewItem}>
        <Text style={styles.overviewText}>
          Progress: {progressPercent.toFixed(1)}%
        </Text>
        <View style={[styles.progressBar, { marginTop: 8 }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text
          style={[styles.overviewText, { marginTop: 6, fontSize: 12 }]}
        >
          {completedLessonsCount} / {lessons.length} lessons completed
        </Text>
      </View> */}

      {/* Lessons List */}
      <ScrollView style={styles.sidebarScroll}>
        {lessons.map((lesson, index) => {
          const isUnlocked = isLessonUnlocked(index);
          const isActive = index === currentLessonIndex;
          const isExpanded = expandedLesson === lesson.lessonId;
          const statusIcon = getLessonStatusIcon(lesson, index);

          return (
            <View key={lesson.lessonId} style={styles.sidebarItemContainer}>
              <TouchableOpacity
                style={[
                  styles.sidebarItem,
                  isActive && styles.sidebarItemActive,
                  !isUnlocked && styles.sidebarItemLocked,
                ]}
                onPress={() => {
                  if (isUnlocked) {
                    toggleLessonExpand(lesson.lessonId);
                  } else {
                    handleSelectLesson(index);
                  }
                }}
              >
                <Icon
                  name={statusIcon.icon}
                  size={20}
                  color={isActive ? "#FFFFFF" : statusIcon.color}
                />
                <Text
                  style={[
                    styles.sidebarItemText,
                    isActive && styles.sidebarItemTextActive,
                    !isUnlocked && styles.sidebarItemTextLocked,
                  ]}
                  numberOfLines={2}
                >
                  {index + 1}. {lesson.title}
                </Text>
                {isUnlocked && (
                  <Icon
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={20}
                    color={isActive ? "#FFFFFF" : styles.sidebarMetaIcon}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>

              {/* Expanded Lesson Info */}
              {isExpanded && isUnlocked && (
                <View style={styles.sidebarItemExpanded}>
                  <Text style={styles.sidebarItemContent}>
                    {lesson.description || lesson.content}
                  </Text>

                  <View style={styles.sidebarItemMeta}>
                    <View style={styles.sidebarMetaRow}>
                      <Icon
                        name="schedule"
                        size={16}
                        color={styles.sidebarMetaIcon}
                      />
                      <Text style={styles.sidebarMetaText}>
                        {formatDuration(lesson.duration)}
                      </Text>
                    </View>

                    {lesson.lessonProgressStatus === "COMPLETED" && (
                      <View style={styles.progressCircleContainer}>
                        <View
                          style={[
                            styles.progressCircleInner,
                            { borderColor: "#22C55E" },
                          ]}
                        >
                          <Icon name="check" size={18} color="#22C55E" />
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sidebarPlayButton,
                      !isUnlocked && styles.sidebarPlayButtonLocked,
                    ]}
                    onPress={() => {
                      handleSelectLesson(index);
                      if (!isTablet) setSidebarVisible(false);
                    }}
                    disabled={!isUnlocked}
                  >
                    <Icon
                      name={
                        lesson.lessonProgressStatus === "COMPLETED"
                          ? "replay"
                          : "play-arrow"
                      }
                      size={18}
                      color={isUnlocked ? "#FFFFFF" : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.sidebarPlayText,
                        !isUnlocked && styles.sidebarPlayTextLocked,
                      ]}
                    >
                      {lesson.lessonProgressStatus === "COMPLETED"
                        ? "Review Lesson"
                        : "Start Lesson"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );

  return (
    <View style={[styles.container, !isTablet && { flexDirection: "column" }]}>
      {/* Tablet: Inline Sidebar */}
      {isTablet && (
        <View style={[styles.sidebar, { width: sidebarWidth }]}>
          {renderSidebarContent()}
        </View>
      )}

      {/* Phone: Modal Sidebar */}
      {!isTablet && (
        <Modal
          visible={sidebarVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <View style={[styles.sidebar, { width: "100%", flex: 1 }]}>
            {renderSidebarContent()}
          </View>
        </Modal>
      )}

      {/* Main Content */}
      <View style={[styles.mainContent, !isTablet && { flex: 1 }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            !isTablet && {
              paddingHorizontal: 16,
              paddingTop: 50,
              paddingVertical: 12,
            },
          ]}
        >
          {/* Menu button for phone */}
          {!isTablet && (
            <TouchableOpacity
              style={[styles.backButton, { marginRight: 12 }]}
              onPress={() => setSidebarVisible(true)}
            >
              <Icon name="menu" size={24} color={styles.menuIcon} />
            </TouchableOpacity>
          )}
          <Text
            style={[styles.headerTitle, !isTablet && { fontSize: 16, flex: 1 }]}
            numberOfLines={1}
          >
            {isTablet
              ? `Lesson ${currentLessonIndex + 1}: ${currentLesson?.title || ""
              }`
              : currentLesson?.title || ""}
          </Text>
          <View style={styles.headerActions}>
            {currentLesson?.lessonProgressStatus === "COMPLETED" && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="check-circle" size={20} color="#22C55E" />
                {isTablet && (
                  <Text
                    style={{
                      color: "#22C55E",
                      marginLeft: 4,
                      fontWeight: "600",
                    }}
                  >
                    Completed
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressContainer,
            !isTablet && { paddingHorizontal: 16 },
          ]}
        >
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent.toFixed(0)}%</Text>
        </View>

        {/* Content Scroll */}
        <ScrollView
          style={[styles.contentScroll, !isTablet && { paddingHorizontal: 16 }]}
        >
          {isTablet && (
            <Text style={styles.lessonMainTitle}>{currentLesson?.title}</Text>
          )}
          {/* Course Completed Banner */}
          {completedLessonsCount === lessons.length && lessons.length > 0 && (
            <View style={styles.completedBanner}>
              <View style={styles.completedBannerIcon}>
                <Icon name="emoji-events" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.completedBannerTitle}>Course Completed!</Text>
              <Text style={styles.completedBannerText}>
                Congratulations! You have successfully completed all lessons in
                this course.
              </Text>
            </View>
          )}
          {/* Video Player */}
          {hasVideoUrl ? (
            <View
              style={[
                styles.playerWrap,
                { width: playerWidth, height: playerHeight },
              ]}
            >
              <Video
                ref={videoRef}
                source={{ uri: currentLesson.videoUrl }}
                style={{
                  width: playerWidth,
                  height: playerHeight,
                  borderRadius: 12,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                shouldPlay={false}
                positionMillis={
                  currentLesson?.lastPosition
                    ? currentLesson.lastPosition * 1000
                    : 0
                }
              />
              {/* Video Progress Info */}
              {videoStatus.isLoaded && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 8,
                    paddingTop: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {formatDuration(videoProgress)} /{" "}
                    {formatDuration(videoDuration || currentLesson?.duration)}
                  </Text>
                  {isVideoPlaying && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#22C55E",
                          marginRight: 4,
                        }}
                      />
                      <Text style={{ fontSize: 12, color: "#22C55E" }}>
                        Playing
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.playerWrap,
                styles.noVideoPlaceholder,
                { height: isTablet ? 300 : 200 },
              ]}
            >
              <Icon name="videocam-off" size={48} color={styles.noVideoIcon} />
              <Text style={styles.noVideoText}>No video available</Text>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "overview" && styles.tabActive]}
              onPress={() => setActiveTab("overview")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "overview" && styles.tabTextActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "content" && styles.tabActive]}
              onPress={() => setActiveTab("content")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "content" && styles.tabTextActive,
                ]}
              >
                Content
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === "overview" && (
              <View>
                <Text style={styles.contentText}>
                  {currentLesson?.description || "No description available."}
                </Text>
                <View style={{ marginTop: 16 }}>
                  {/* <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Icon
                      name="schedule"
                      size={18}
                      color={styles.sidebarMetaIcon}
                    />
                    <Text style={[styles.contentText, { marginLeft: 8 }]}>
                      Duration: {formatDuration(currentLesson?.duration)}
                    </Text>
                  </View> */}
                  {currentLesson?.timeSpent > 0 && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Icon
                        name="timer"
                        size={18}
                        color={styles.sidebarMetaIcon}
                      />
                      <Text style={[styles.contentText, { marginLeft: 8 }]}>
                        Time spent: {formatDuration(currentLesson?.timeSpent)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            {activeTab === "content" && (
              <Text style={styles.contentText}>
                {currentLesson?.content || "No content available."}
              </Text>
            )}
          </View>

          {/* Navigation Buttons */}
          <View
            style={[
              styles.navigationButtons,
              !isTablet && { flexDirection: "column", gap: 12 },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.previousButton,
                currentLessonIndex === 0 && styles.navButtonDisabled,
                !isTablet && { width: "100%", justifyContent: "center" },
              ]}
              onPress={handlePreviousLesson}
              disabled={currentLessonIndex === 0}
            >
              <Icon
                name="arrow-back"
                size={18}
                color={currentLessonIndex === 0 ? "#94A3B8" : "#0EA5E9"}
              />
              <Text
                style={[
                  styles.navButtonText,
                  styles.previousButtonText,
                  currentLessonIndex === 0 && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {currentLesson?.lessonProgressStatus !== "COMPLETED" ? (
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.completeButton,
                  saving && styles.navButtonDisabled,
                  !isTablet && { width: "100%", justifyContent: "center" },
                ]}
                onPress={handleCompleteLesson}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="check-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.completeButtonText}>
                      Mark as Complete
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.completeButton,
                  (currentLessonIndex === lessons.length - 1 ||
                    !isLessonUnlocked(currentLessonIndex + 1)) &&
                  styles.navButtonDisabled,
                  !isTablet && { width: "100%", justifyContent: "center" },
                ]}
                onPress={handleNextLesson}
                disabled={
                  currentLessonIndex === lessons.length - 1 ||
                  !isLessonUnlocked(currentLessonIndex + 1)
                }
              >
                <Text style={styles.completeButtonText}>Next Lesson</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}
