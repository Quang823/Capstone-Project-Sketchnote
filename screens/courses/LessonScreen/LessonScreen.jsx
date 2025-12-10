import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { lessonStyles } from "./LessonScreen.styles";
import { courseService } from "../../../service/courseService";
import { useNavigation, useRoute } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import Toast from "react-native-toast-message";

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
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

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
      console.error("Error fetching course data:", err);
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
  const onVideoStateChange = useCallback(async (state) => {
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
            idx < lessons.length && (lesson.lessonProgressStatus === "COMPLETED" || idx === currentLessonIndex)
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
        console.error("Error saving lesson progress:", err);
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
  }, [currentLesson, saving, currentLessonIndex, lessons, courseId, fetchCourseData]);

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
          idx < lessons.length && (lesson.lessonProgressStatus === "COMPLETED" || idx === currentLessonIndex)
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
      console.error("Error saving lesson progress:", err);
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

  // Get YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get current video ID
  const currentVideoId = currentLesson?.videoUrl 
    ? getYouTubeVideoId(currentLesson.videoUrl) 
    : null;

  // Get lesson status icon and color
  const getLessonStatusIcon = (lesson, index) => {
    if (lesson.lessonProgressStatus === "COMPLETED") {
      return { icon: "check-circle", color: "#22C55E" }; // Green check
    }
    if (!isLessonUnlocked(index)) {
      return { icon: "lock", color: "#9CA3AF" }; // Gray lock
    }
    if (lesson.lessonProgressStatus === "IN_PROGRESS") {
      return { icon: "play-circle-outline", color: "#F59E0B" }; // Orange in progress
    }
    return { icon: "play-circle-outline", color: "#2563EB" }; // Blue ready to start
  };

  // Calculate completed lessons count
  const completedLessonsCount = lessons.filter(
    (l) => l.lessonProgressStatus === "COMPLETED"
  ).length;

  // Loading state
  if (loading) {
    return (
      <View style={lessonStyles.loadingContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={lessonStyles.loadingText}>Loading course...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={lessonStyles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={lessonStyles.errorText}>{error}</Text>
        <TouchableOpacity
          style={lessonStyles.retryButton}
          onPress={fetchCourseData}
        >
          <Text style={lessonStyles.retryButtonText}>Retry</Text>
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
      <View style={[lessonStyles.sidebarHeader, !isTablet && { paddingTop: 50 }]}>
        <TouchableOpacity
          style={lessonStyles.backButton}
          onPress={() => {
            if (!isTablet) {
              setSidebarVisible(false);
            }
            navigation.goBack();
          }}
        >
          <Icon name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={[lessonStyles.sidebarHeaderText, !isTablet && { fontSize: 14 }]} numberOfLines={1}>
          {course?.title || "Course"}
        </Text>
        {!isTablet && (
          <TouchableOpacity
            style={lessonStyles.backButton}
            onPress={() => setSidebarVisible(false)}
          >
            <Icon name="close" size={20} color="#1E293B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Course Progress Overview */}
      <View style={lessonStyles.overviewItem}>
        <Text style={lessonStyles.overviewText}>
          Progress: {progressPercent.toFixed(1)}%
        </Text>
        <View style={[lessonStyles.progressBar, { marginTop: 8 }]}>
          <View
            style={[
              lessonStyles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text
          style={[lessonStyles.overviewText, { marginTop: 6, fontSize: 12 }]}
        >
          {completedLessonsCount} / {lessons.length} lessons completed
        </Text>
      </View>

      {/* Lessons List */}
      <ScrollView style={lessonStyles.sidebarScroll}>
        {lessons.map((lesson, index) => {
          const isUnlocked = isLessonUnlocked(index);
          const isActive = index === currentLessonIndex;
          const isExpanded = expandedLesson === lesson.lessonId;
          const statusIcon = getLessonStatusIcon(lesson, index);

          return (
            <View key={lesson.lessonId} style={lessonStyles.sidebarItemContainer}>
              <TouchableOpacity
                style={[
                  lessonStyles.sidebarItem,
                  isActive && lessonStyles.sidebarItemActive,
                  !isUnlocked && lessonStyles.sidebarItemLocked,
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
                    lessonStyles.sidebarItemText,
                    isActive && lessonStyles.sidebarItemTextActive,
                    !isUnlocked && lessonStyles.sidebarItemTextLocked,
                  ]}
                  numberOfLines={2}
                >
                  {index + 1}. {lesson.title}
                </Text>
                {isUnlocked && (
                  <Icon
                    name={isExpanded ? "expand-less" : "expand-more"}
                    size={20}
                    color={isActive ? "#FFFFFF" : "#64748B"}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>

              {/* Expanded Lesson Info */}
              {isExpanded && isUnlocked && (
                <View style={lessonStyles.sidebarItemExpanded}>
                  <Text style={lessonStyles.sidebarItemContent}>
                    {lesson.description || lesson.content}
                  </Text>

                  <View style={lessonStyles.sidebarItemMeta}>
                    <View style={lessonStyles.sidebarMetaRow}>
                      <Icon name="schedule" size={16} color="#64748B" />
                      <Text style={lessonStyles.sidebarMetaText}>
                        {formatDuration(lesson.duration)}
                      </Text>
                    </View>

                    {lesson.lessonProgressStatus === "COMPLETED" && (
                      <View style={lessonStyles.progressCircleContainer}>
                        <View
                          style={[
                            lessonStyles.progressCircleInner,
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
                      lessonStyles.sidebarPlayButton,
                      !isUnlocked && lessonStyles.sidebarPlayButtonLocked,
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
                        lessonStyles.sidebarPlayText,
                        !isUnlocked && lessonStyles.sidebarPlayTextLocked,
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
    <View style={[lessonStyles.container, !isTablet && { flexDirection: 'column' }]}>
      {/* Tablet: Inline Sidebar */}
      {isTablet && (
        <View style={[lessonStyles.sidebar, { width: sidebarWidth }]}>
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
          <View style={[lessonStyles.sidebar, { width: '100%', flex: 1 }]}>
            {renderSidebarContent()}
          </View>
        </Modal>
      )}

      {/* Main Content */}
      <View style={[lessonStyles.mainContent, !isTablet && { flex: 1 }]}>
        {/* Header */}
        <View style={[
          lessonStyles.header, 
          !isTablet && { 
            paddingHorizontal: 16, 
            paddingTop: 50,
            paddingVertical: 12 
          }
        ]}>
          {/* Menu button for phone */}
          {!isTablet && (
            <TouchableOpacity
              style={[lessonStyles.backButton, { marginRight: 12 }]}
              onPress={() => setSidebarVisible(true)}
            >
              <Icon name="menu" size={24} color="#1E293B" />
            </TouchableOpacity>
          )}
          <Text style={[
            lessonStyles.headerTitle, 
            !isTablet && { fontSize: 16, flex: 1 }
          ]} numberOfLines={1}>
            {isTablet 
              ? `Lesson ${currentLessonIndex + 1}: ${currentLesson?.title || ""}`
              : currentLesson?.title || ""
            }
          </Text>
          <View style={lessonStyles.headerActions}>
            {currentLesson?.lessonProgressStatus === "COMPLETED" && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="check-circle" size={20} color="#22C55E" />
                {isTablet && (
                  <Text style={{ color: "#22C55E", marginLeft: 4, fontWeight: "600" }}>
                    Completed
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[
          lessonStyles.progressContainer,
          !isTablet && { paddingHorizontal: 16 }
        ]}>
          <View style={lessonStyles.progressBar}>
            <View
              style={[
                lessonStyles.progressFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={lessonStyles.progressText}>
            {progressPercent.toFixed(0)}%
          </Text>
        </View>

        {/* Content Scroll */}
        <ScrollView style={[
          lessonStyles.contentScroll,
          !isTablet && { paddingHorizontal: 16 }
        ]}>
          {isTablet && (
            <Text style={lessonStyles.lessonMainTitle}>
              {currentLesson?.title}
            </Text>
          )}

          {/* Video Player */}
          {currentVideoId ? (
            <View
              style={[
                lessonStyles.playerWrap,
                { width: playerWidth, height: playerHeight },
              ]}
            >
              <YoutubePlayer
                ref={videoRef}
                height={playerHeight}
                width={playerWidth}
                play={false}
                videoId={currentVideoId}
                onChangeState={onVideoStateChange}
                webViewStyle={{ backgroundColor: "#000000" }}
                webViewProps={{ 
                  allowsFullscreenVideo: true,
                  allowsInlineMediaPlayback: true,
                }}
                initialPlayerParams={{
                  preventFullScreen: false,
                  modestbranding: true,
                  rel: false,
                }}
              />
            </View>
          ) : (
            <View
              style={[
                lessonStyles.playerWrap,
                lessonStyles.noVideoPlaceholder,
                { height: isTablet ? 300 : 200 },
              ]}
            >
              <Icon name="videocam-off" size={48} color="#9CA3AF" />
              <Text style={lessonStyles.noVideoText}>No video available</Text>
            </View>
          )}

          {/* Tabs */}
          <View style={lessonStyles.tabs}>
            <TouchableOpacity
              style={[
                lessonStyles.tab,
                activeTab === "overview" && lessonStyles.tabActive,
              ]}
              onPress={() => setActiveTab("overview")}
            >
              <Text
                style={[
                  lessonStyles.tabText,
                  activeTab === "overview" && lessonStyles.tabTextActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                lessonStyles.tab,
                activeTab === "content" && lessonStyles.tabActive,
              ]}
              onPress={() => setActiveTab("content")}
            >
              <Text
                style={[
                  lessonStyles.tabText,
                  activeTab === "content" && lessonStyles.tabTextActive,
                ]}
              >
                Content
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={lessonStyles.tabContent}>
            {activeTab === "overview" && (
              <View>
                <Text style={lessonStyles.contentText}>
                  {currentLesson?.description || "No description available."}
                </Text>
                <View style={{ marginTop: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Icon name="schedule" size={18} color="#64748B" />
                    <Text style={[lessonStyles.contentText, { marginLeft: 8 }]}>
                      Duration: {formatDuration(currentLesson?.duration)}
                    </Text>
                  </View>
                  {currentLesson?.timeSpent > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Icon name="timer" size={18} color="#64748B" />
                      <Text style={[lessonStyles.contentText, { marginLeft: 8 }]}>
                        Time spent: {formatDuration(currentLesson?.timeSpent)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            {activeTab === "content" && (
              <Text style={lessonStyles.contentText}>
                {currentLesson?.content || "No content available."}
              </Text>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={[
            lessonStyles.navigationButtons,
            !isTablet && { flexDirection: 'column', gap: 12 }
          ]}>
            <TouchableOpacity
              style={[
                lessonStyles.navButton,
                lessonStyles.previousButton,
                currentLessonIndex === 0 && lessonStyles.navButtonDisabled,
                !isTablet && { width: '100%', justifyContent: 'center' }
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
                  lessonStyles.navButtonText,
                  lessonStyles.previousButtonText,
                  currentLessonIndex === 0 && lessonStyles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {currentLesson?.lessonProgressStatus !== "COMPLETED" ? (
              <TouchableOpacity
                style={[
                  lessonStyles.navButton, 
                  lessonStyles.completeButton,
                  !isTablet && { width: '100%', maxWidth: '100%' }
                ]}
                onPress={handleCompleteLesson}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="check" size={18} color="#FFFFFF" />
                    <Text style={lessonStyles.completeButtonText}>
                      Mark as Complete
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  lessonStyles.navButton,
                  {
                    backgroundColor: "#0EA5E9",
                    flex: isTablet ? 1 : undefined,
                    width: isTablet ? undefined : '100%',
                    maxWidth: isTablet ? 200 : '100%',
                  },
                  currentLessonIndex >= lessons.length - 1 &&
                    lessonStyles.navButtonDisabled,
                ]}
                onPress={handleNextLesson}
                disabled={
                  currentLessonIndex >= lessons.length - 1 ||
                  !isLessonUnlocked(currentLessonIndex + 1)
                }
              >
                <Text style={[lessonStyles.navButtonText, { color: "#FFFFFF" }]}>
                  {currentLessonIndex >= lessons.length - 1
                    ? "Course Completed"
                    : "Next Lesson"}
                </Text>
                {currentLessonIndex < lessons.length - 1 && (
                  <Icon name="arrow-forward" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}