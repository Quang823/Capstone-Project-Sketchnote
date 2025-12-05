import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import Icon from "react-native-vector-icons/MaterialIcons";
import { lessonStyles } from "./LessonScreen.styles";
import { courseService } from "../../../service/courseService";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;
const MAIN_CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const PLAYER_WIDTH = MAIN_CONTENT_WIDTH - 64;
const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);

// CHANGED: 80% -> 90%
const COMPLETION_THRESHOLD = 90;

// Helper to format duration
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId = 1, lessonId } = route.params || {};

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const [activeTab, setActiveTab] = useState("content");
  const [expandedLessons, setExpandedLessons] = useState({});

  // Video tracking states
  const [playerState, setPlayerState] = useState("unstarted");
  const [currentTime, setCurrentTime] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const playerRef = useRef(null);
  const timeSpentRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const updateTimeRef = useRef(null);
  const hasAutoSavedRef = useRef(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (lessonId && course?.lessons) {
      setCurrentLessonId(lessonId);
    } else if (course?.lessons && course.lessons.length > 0) {
      setCurrentLessonId(course.lessons[0].lessonId);
    }
  }, [lessonId, course]);

  // Reset tracking khi chuyển lesson
  useEffect(() => {
    // Save progress của lesson cũ trước khi chuyển
    if (currentLessonId) {
      saveLessonProgress();
    }

    // Reset tracking cho lesson mới
    timeSpentRef.current = 0;
    lastUpdateRef.current = Date.now();
    setCurrentTime(0);
    setCanProceed(false);
    hasAutoSavedRef.current = false;

    // Clear intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (updateTimeRef.current) clearInterval(updateTimeRef.current);
      saveLessonProgress();
    };
  }, [currentLessonId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getCourseByIdEnrolled(courseId);
      if (response && response.result.course) {
        setCourse(response.result.course);
      }
    } catch (err) {
      setError("Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  // Lưu progress lên server
  const saveLessonProgress = async (forceComplete = false) => {
    if (!currentLessonId || !courseId) return;

    try {
      // Lấy current time từ player
      let lastPosition = currentTime;
      try {
        const time = await playerRef.current?.getCurrentTime();
        if (time !== undefined && time !== null) {
          lastPosition = Math.floor(time);
        }
      } catch (err) {
        // Không log error
      }

      const timeSpent = Math.floor(timeSpentRef.current);

      // CHANGED: 80% -> 90%
      const lessonDuration = currentLesson?.duration || 0;
      const watchPercentage =
        lessonDuration > 0 ? (lastPosition / lessonDuration) * 100 : 0;
      const completed = forceComplete || watchPercentage >= COMPLETION_THRESHOLD;

      // Chỉ lưu nếu có thời gian xem
      if (timeSpent > 0 || lastPosition > 0) {
        await courseService.saveLessonProgress(courseId, currentLessonId, {
          lastPosition,
          timeSpent,
          completed,
        });

        // CHANGED: Tự động update local lesson status thành COMPLETED khi xem đủ 90%
        if (completed && course?.lessons) {
          const updatedLessons = course.lessons.map((lesson) =>
            lesson.lessonId === currentLessonId
              ? { ...lesson, lessonProgressStatus: "COMPLETED" }
              : lesson
          );
          setCourse({ ...course, lessons: updatedLessons });
        }
      }
    } catch (error) {
      // Không log error
    }
  };

  // Callback khi trạng thái player thay đổi
  const onChangeState = useCallback(
    async (state) => {
      setPlayerState(state);

      if (state === "playing") {
        // Bắt đầu đếm thời gian xem
        lastUpdateRef.current = Date.now();

        // Interval để đếm timeSpent
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - lastUpdateRef.current) / 1000;
            timeSpentRef.current += elapsed;
            lastUpdateRef.current = now;
          }, 1000);
        }

        // Interval để lưu progress định kỳ (mỗi 30 giây)
        if (!saveIntervalRef.current) {
          saveIntervalRef.current = setInterval(() => {
            saveLessonProgress();
          }, 30000);
        }

        if (!updateTimeRef.current) {
          updateTimeRef.current = setInterval(async () => {
            try {
              const time = await playerRef.current?.getCurrentTime();
              if (time !== undefined && time !== null && time > 0) {
                setCurrentTime(time);
                const lessonDuration = currentLesson?.duration || 0;
                if (lessonDuration > 0) {
                  const watchPercentage = (time / lessonDuration) * 100;
                  
                  // CHANGED: 80% -> 90%
                  setCanProceed(watchPercentage >= COMPLETION_THRESHOLD);

                  // CHANGED: Auto-save khi đạt 90% lần đầu
                  if (watchPercentage >= COMPLETION_THRESHOLD && !hasAutoSavedRef.current) {
                    hasAutoSavedRef.current = true;
                    await saveLessonProgress(true);
                  }
                }
              }
            } catch (err) {
              // Không log error
            }
          }, 1000);
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
          saveIntervalRef.current = null;
        }
        if (updateTimeRef.current) {
          clearInterval(updateTimeRef.current);
          updateTimeRef.current = null;
        }

        if (state === "paused") {
          await saveLessonProgress();
        } else if (state === "ended") {
          // CHANGED: Video kết thúc: chỉ lưu progress, KHÔNG tự động chuyển bài
          await saveLessonProgress(true);
          
          // REMOVED: Không tự động chuyển sang bài tiếp theo nữa
          // User phải bấm nút NEXT để chuyển bài
        }
      }
    },
    [currentLessonId, courseId, currentLesson]
  );

  const currentLesson = useMemo(() => {
    if (!course?.lessons) return null;
    return course.lessons.find((l) => l.lessonId === currentLessonId);
  }, [course, currentLessonId]);

  const currentVideoId = useMemo(() => {
    if (!currentLesson?.videoUrl) return null;
    return extractYouTubeId(currentLesson.videoUrl);
  }, [currentLesson]);

  const handleBack = () => {
    saveLessonProgress();
    navigation.goBack();
  };

  // Check if a lesson can be accessed based on progress rules
  const canAccessLesson = (lessonIndex, lesson) => {
    if (!lesson) return false;

    // If lesson is completed, always allow access
    if (lesson.lessonProgressStatus === "COMPLETED") {
      return true;
    }

    // If lesson is the first one, always allow access
    if (lessonIndex === 0) {
      return true;
    }

    // For other lessons, check if previous lesson is completed
    const previousLesson = course.lessons[lessonIndex - 1];
    if (!previousLesson) return false;

    // Only allow access if previous lesson is completed
    return previousLesson.lessonProgressStatus === "COMPLETED";
  };

  const handleOpenLesson = (id) => {
    const targetLesson = course.lessons.find((l) => l.lessonId === id);
    const targetIndex = course.lessons.findIndex((l) => l.lessonId === id);

    // Check if lesson can be accessed based on progress rules
    if (!canAccessLesson(targetIndex, targetLesson)) {
      return;
    }

    saveLessonProgress();
    setCurrentLessonId(id);
  };

  const toggleLessonExpand = (id) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentLessonIndex = useMemo(() => {
    if (!course?.lessons) return 0;
    return course.lessons.findIndex((l) => l.lessonId === currentLessonId);
  }, [course, currentLessonId]);

  const progress = useMemo(() => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    return Math.round(((currentLessonIndex + 1) / course.lessons.length) * 100);
  }, [course, currentLessonIndex]);

  // Check if current lesson can proceed to next
  const canProceedToNext = useMemo(() => {
    if (!course?.lessons || currentLessonIndex === -1) return false;

    const currentLesson = course.lessons[currentLessonIndex];
    if (!currentLesson) return false;

    // Can proceed if current lesson is completed
    if (currentLesson.lessonProgressStatus === "COMPLETED") {
      return true;
    }

    // CHANGED: Fallback: check if user has watched enough of the video (90%)
    const lessonDuration = currentLesson?.duration || 0;
    if (lessonDuration > 0 && currentTime > 0) {
      const watchPercentage = (currentTime / lessonDuration) * 100;
      return watchPercentage >= COMPLETION_THRESHOLD;
    }

    return false;
  }, [course, currentLessonIndex, currentTime]);

  const handlePrevious = () => {
    if (currentLessonIndex > 0 && course?.lessons) {
      saveLessonProgress();
      setCurrentLessonId(course.lessons[currentLessonIndex - 1].lessonId);
    }
  };

  const handleComplete = async () => {
    await saveLessonProgress(true);

    if (currentLessonIndex < course.lessons.length - 1 && course?.lessons) {
      // Chuyển sang bài tiếp theo
      setCurrentLessonId(course.lessons[currentLessonIndex + 1].lessonId);
    } else {
      // Đã hoàn thành khóa học, quay về
      navigation.goBack();
    }
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
      <View style={lessonStyles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={lessonStyles.errorText}>
          {error || "Không tìm thấy khóa học"}
        </Text>
        <Pressable style={lessonStyles.retryButton} onPress={fetchCourseData}>
          <Text style={lessonStyles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={lessonStyles.container}>
      {/* Left Sidebar */}
      <View style={[lessonStyles.sidebar, { width: SIDEBAR_WIDTH }]}>
        <View style={lessonStyles.sidebarHeader}>
          <Pressable onPress={handleBack} style={lessonStyles.backButton}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
        </View>

        <ScrollView style={lessonStyles.sidebarScroll}>
          <Pressable style={lessonStyles.overviewItem}>
            <Text style={lessonStyles.overviewText}>Lesson Overview</Text>
          </Pressable>

          {course.lessons &&
            course.lessons.map((lesson, index) => {
              const isActive = lesson.lessonId === currentLessonId;
              const isExpanded = expandedLessons[lesson.lessonId];
              const lessonProgress = isActive ? progress : 0;
              const isLocked = !canAccessLesson(index, lesson);
              const isCompleted = lesson.lessonProgressStatus === "COMPLETED";

              return (
                <View
                  key={lesson.lessonId}
                  style={lessonStyles.sidebarItemContainer}
                >
                  <Pressable
                    style={[
                      lessonStyles.sidebarItem,
                      isActive && lessonStyles.sidebarItemActive,
                      isLocked && lessonStyles.sidebarItemLocked,
                    ]}
                    onPress={() =>
                      isLocked ? null : toggleLessonExpand(lesson.lessonId)
                    }
                    disabled={isLocked}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {isLocked && (
                        <Icon
                          name="lock"
                          size={16}
                          color="#9CA3AF"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {isCompleted && !isLocked && (
                        <Icon
                          name="check-circle"
                          size={16}
                          color="#10B981"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      {!isLocked && !isCompleted && (
                        <Icon
                          name="play-circle-outline"
                          size={16}
                          color="#6B7280"
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        style={[
                          lessonStyles.sidebarItemText,
                          isActive && lessonStyles.sidebarItemTextActive,
                          isLocked && lessonStyles.sidebarItemTextLocked,
                        ]}
                      >
                        {lesson.title}
                      </Text>
                    </View>
                    <Icon
                      name={
                        isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"
                      }
                      size={20}
                      color={
                        isLocked ? "#9CA3AF" : isActive ? "#FFFFFF" : "#6B7280"
                      }
                    />
                  </Pressable>

                  {isExpanded && (
                    <View style={lessonStyles.sidebarItemExpanded}>
                      {lesson.content && (
                        <Text
                          style={lessonStyles.sidebarItemContent}
                          numberOfLines={3}
                        >
                          {lesson.content}
                        </Text>
                      )}

                      <View style={lessonStyles.sidebarItemMeta}>
                        <View style={lessonStyles.sidebarMetaRow}>
                          <Icon name="schedule" size={16} color="#6B7280" />
                          <Text style={lessonStyles.sidebarMetaText}>
                            {formatDuration(lesson.duration)}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        style={[
                          lessonStyles.sidebarPlayButton,
                          isLocked && lessonStyles.sidebarPlayButtonLocked,
                        ]}
                        onPress={() => handleOpenLesson(lesson.lessonId)}
                        disabled={isLocked}
                      >
                        <Icon
                          name={isLocked ? "lock" : "play-circle-filled"}
                          size={20}
                          color={isLocked ? "#9CA3AF" : "#FFFFFF"}
                        />
                        <Text
                          style={[
                            lessonStyles.sidebarPlayText,
                            isLocked && lessonStyles.sidebarPlayTextLocked,
                          ]}
                        >
                          {isLocked ? "Locked" : "Start Lesson"}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
        </ScrollView>
      </View>

      {/* Main Content */}
      <View style={lessonStyles.mainContent}>
        {/* Header */}
        <View style={lessonStyles.header}>
          <Text style={lessonStyles.headerTitle}>{course.title}</Text>
        </View>

        <ScrollView style={lessonStyles.contentScroll}>
          {/* Lesson Title */}
          <Text style={lessonStyles.lessonMainTitle}>
            {currentLesson?.title}
          </Text>

          {/* Video Player */}
          {currentVideoId ? (
            <View
              style={[
                lessonStyles.playerWrap,
                { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
              ]}
            >
              <YoutubePlayer
                ref={playerRef}
                height={PLAYER_HEIGHT}
                width={PLAYER_WIDTH}
                play={false}
                videoId={currentVideoId}
                onChangeState={onChangeState}
                initialPlayerParams={{
                  preventFullScreen: false,
                }}
                webViewStyle={{ backgroundColor: "#000000" }}
                webViewProps={{ allowsFullscreenVideo: true }}
              />
            </View>
          ) : (
            <View
              style={[
                lessonStyles.playerWrap,
                lessonStyles.noVideoPlaceholder,
                { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
              ]}
            >
              <Icon name="play-circle-outline" size={64} color="#9CA3AF" />
              <Text style={lessonStyles.noVideoText}>Không có video</Text>
            </View>
          )}

          {/* Tabs */}
          <View style={lessonStyles.tabs}>
            <Pressable
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
            </Pressable>
            <Pressable
              style={[
                lessonStyles.tab,
                activeTab === "notes" && lessonStyles.tabActive,
              ]}
              onPress={() => setActiveTab("notes")}
            >
              <Text
                style={[
                  lessonStyles.tabText,
                  activeTab === "notes" && lessonStyles.tabTextActive,
                ]}
              >
                Notes
              </Text>
            </Pressable>
            <Pressable
              style={[
                lessonStyles.tab,
                activeTab === "discussion" && lessonStyles.tabActive,
              ]}
              onPress={() => setActiveTab("discussion")}
            >
              <Text
                style={[
                  lessonStyles.tabText,
                  activeTab === "discussion" && lessonStyles.tabTextActive,
                ]}
              >
                Discussion
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          <View style={lessonStyles.tabContent}>
            {activeTab === "content" && (
              <Text style={lessonStyles.contentText}>
                {currentLesson?.content ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim curi an lin esam venlam."}
              </Text>
            )}
            {activeTab === "notes" && (
              <Text style={lessonStyles.contentText}>
                Ghi chú của bạn sẽ hiển thị ở đây...
              </Text>
            )}
            {activeTab === "discussion" && (
              <Text style={lessonStyles.contentText}>
                Thảo luận về bài học...
              </Text>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={lessonStyles.navigationButtons}>
            <Pressable
              style={[
                lessonStyles.navButton,
                lessonStyles.previousButton,
                currentLessonIndex === 0 && lessonStyles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentLessonIndex === 0}
            >
              <Icon
                name="arrow-back"
                size={20}
                color={currentLessonIndex === 0 ? "#9CA3AF" : "#2563EB"}
              />
              <Text
                style={[
                  lessonStyles.navButtonText,
                  lessonStyles.previousButtonText,
                  currentLessonIndex === 0 &&
                  lessonStyles.navButtonTextDisabled,
                ]}
              >
                PREVIOUS
              </Text>
            </Pressable>

            <Pressable
              style={[
                lessonStyles.navButton,
                lessonStyles.completeButton,
                !canProceedToNext && lessonStyles.navButtonDisabled,
              ]}
              onPress={handleComplete}
              disabled={!canProceedToNext}
            >
              <Text
                style={[
                  lessonStyles.completeButtonText,
                  !canProceedToNext && lessonStyles.navButtonTextDisabled,
                ]}
              >
                {currentLessonIndex === course.lessons.length - 1
                  ? "COMPLETE"
                  : "NEXT"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}