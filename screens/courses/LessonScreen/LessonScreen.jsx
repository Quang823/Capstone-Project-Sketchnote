import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import YoutubePlayer from "react-native-youtube-iframe";
import Icon from "react-native-vector-icons/MaterialIcons";
import { lessonStyles } from "./LessonScreen.styles";
import { courseService } from "../../../service/courseService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = 280;
const MAIN_CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const PLAYER_WIDTH = MAIN_CONTENT_WIDTH - 64;
const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);

// Helper to format duration
const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function LessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId = 1, lessonId } = route.params || {};

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLessonId, setCurrentLessonId] = useState(lessonId);
  const [activeTab, setActiveTab] = useState('content');
  const [expandedLessons, setExpandedLessons] = useState({});

  // Video tracking states
  const [playerState, setPlayerState] = useState('unstarted');
  const [currentTime, setCurrentTime] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const playerRef = useRef(null);
  const timeSpentRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const saveIntervalRef = useRef(null);

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
      // Cleanup khi unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      saveLessonProgress();
    };
  }, [currentLessonId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getCourseById(courseId);
      
      if (response && response.result) {
        setCourse(response.result);
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      setError("Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  // Lưu progress lên server
  const saveLessonProgress = async () => {
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
        console.log('Could not get current time from player');
      }

      const timeSpent = Math.floor(timeSpentRef.current);
      
      // Tính completed dựa trên % xem video
      const lessonDuration = currentLesson?.duration || 0;
      const watchPercentage = lessonDuration > 0 ? (lastPosition / lessonDuration) * 100 : 0;
      const completed = watchPercentage >= 80;

      // Chỉ lưu nếu có thời gian xem
      if (timeSpent > 0 || lastPosition > 0) {
        console.log('Saving progress:', {
          courseId,
          lessonId: currentLessonId,
          lastPosition,
          timeSpent,
          completed,
          watchPercentage: watchPercentage.toFixed(1)
        });

        await courseService.saveLessonProgress(courseId, currentLessonId, {
          lastPosition,
          timeSpent,
          completed
        });

        console.log('Progress saved successfully');
      }
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  // Callback khi trạng thái player thay đổi
  const onChangeState = useCallback((state) => {
    console.log('Player state:', state);
    setPlayerState(state);
    
    if (state === 'playing') {
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
        }, 30000); // 30 seconds
      }

      // Update current time và check canProceed
      const updateTime = setInterval(async () => {
        try {
          const time = await playerRef.current?.getCurrentTime();
          if (time !== undefined && time !== null) {
            setCurrentTime(time);
            
            // Check nếu xem đủ 90% thì cho phép next
            const lessonDuration = currentLesson?.duration || 0;
            if (lessonDuration > 0) {
              const watchPercentage = (time / lessonDuration) * 100;
              setCanProceed(watchPercentage >= 90);
            }
          }
        } catch (err) {
          // Ignore error
        }
      }, 1000);

      return () => clearInterval(updateTime);
    } else {
      // Dừng đếm khi pause/ended/paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }

      // Lưu progress khi pause hoặc ended
      if (state === 'paused' || state === 'ended') {
        saveLessonProgress();
      }
    }
  }, [currentLessonId, courseId]);

  const currentLesson = useMemo(() => {
    if (!course?.lessons) return null;
    return course.lessons.find(l => l.lessonId === currentLessonId);
  }, [course, currentLessonId]);

  const currentVideoId = useMemo(() => {
    if (!currentLesson?.videoUrl) return null;
    return extractYouTubeId(currentLesson.videoUrl);
  }, [currentLesson]);

  const handleBack = () => {
    saveLessonProgress(); // Save trước khi back
    navigation.goBack();
  };

  const handleOpenLesson = (id) => {
    saveLessonProgress(); // Save lesson hiện tại
    setCurrentLessonId(id);
  };

  const toggleLessonExpand = (id) => {
    setExpandedLessons(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const currentLessonIndex = useMemo(() => {
    if (!course?.lessons) return 0;
    return course.lessons.findIndex(l => l.lessonId === currentLessonId);
  }, [course, currentLessonId]);

  const progress = useMemo(() => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    return Math.round(((currentLessonIndex + 1) / course.lessons.length) * 100);
  }, [course, currentLessonIndex]);

  const handlePrevious = () => {
    if (currentLessonIndex > 0 && course?.lessons) {
      saveLessonProgress(); // Save trước khi chuyển
      setCurrentLessonId(course.lessons[currentLessonIndex - 1].lessonId);
    }
  };

  const handleComplete = () => {
    saveLessonProgress(); // Save trước khi chuyển
    if (currentLessonIndex < course.lessons.length - 1 && course?.lessons) {
      setCurrentLessonId(course.lessons[currentLessonIndex + 1].lessonId);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={lessonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={lessonStyles.loadingText}>Đang tải khóa học...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={lessonStyles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={lessonStyles.errorText}>{error || "Không tìm thấy khóa học"}</Text>
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

          {course.lessons && course.lessons.map((lesson, index) => {
            const isActive = lesson.lessonId === currentLessonId;
            const isExpanded = expandedLessons[lesson.lessonId];
            const lessonProgress = isActive ? progress : 0;
            
            return (
              <View key={lesson.lessonId} style={lessonStyles.sidebarItemContainer}>
                <Pressable
                  style={[lessonStyles.sidebarItem, isActive && lessonStyles.sidebarItemActive]}
                  onPress={() => toggleLessonExpand(lesson.lessonId)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[lessonStyles.sidebarItemText, isActive && lessonStyles.sidebarItemTextActive]}>
                      {lesson.title}
                    </Text>
                  </View>
                  <Icon 
                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={20} 
                    color={isActive ? "#FFFFFF" : "#6B7280"} 
                  />
                </Pressable>
                
                {isExpanded && (
                  <View style={lessonStyles.sidebarItemExpanded}>
                    {lesson.content && (
                      <Text style={lessonStyles.sidebarItemContent} numberOfLines={3}>
                        {lesson.content}
                      </Text>
                    )}
                    
                    <View style={lessonStyles.sidebarItemMeta}>
                      <View style={lessonStyles.sidebarMetaRow}>
                        <Icon name="schedule" size={16} color="#6B7280" />
                        <Text style={lessonStyles.sidebarMetaText}>{formatDuration(lesson.duration)}</Text>
                      </View>
                    </View>
                    
                    <Pressable 
                      style={lessonStyles.sidebarPlayButton}
                      onPress={() => handleOpenLesson(lesson.lessonId)}
                    >
                      <Icon name="play-circle-filled" size={20} color="#FFFFFF" />
                      <Text style={lessonStyles.sidebarPlayText}>Start Lesson</Text>
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
          <View style={lessonStyles.headerActions}>
            {/* Debug info - có thể xóa sau */}
            <Text style={{ fontSize: 12, color: '#666', marginRight: 10 }}>
              Time: {Math.floor(timeSpentRef.current)}s | Pos: {Math.floor(currentTime)}s
            </Text>
          </View>
        </View>

        <ScrollView style={lessonStyles.contentScroll}>
          {/* Lesson Title */}
          <Text style={lessonStyles.lessonMainTitle}>{currentLesson?.title}</Text>

          {/* Video Player */}
          {currentVideoId ? (
            <View style={[lessonStyles.playerWrap, { width: PLAYER_WIDTH, height: PLAYER_HEIGHT }]}>
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
            <View style={[lessonStyles.playerWrap, lessonStyles.noVideoPlaceholder, { width: PLAYER_WIDTH, height: PLAYER_HEIGHT }]}>
              <Icon name="play-circle-outline" size={64} color="#9CA3AF" />
              <Text style={lessonStyles.noVideoText}>Không có video</Text>
            </View>
          )}

          {/* Tabs */}
          <View style={lessonStyles.tabs}>
            <Pressable 
              style={[lessonStyles.tab, activeTab === 'content' && lessonStyles.tabActive]}
              onPress={() => setActiveTab('content')}
            >
              <Text style={[lessonStyles.tabText, activeTab === 'content' && lessonStyles.tabTextActive]}>
                Content
              </Text>
            </Pressable>
            <Pressable 
              style={[lessonStyles.tab, activeTab === 'notes' && lessonStyles.tabActive]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[lessonStyles.tabText, activeTab === 'notes' && lessonStyles.tabTextActive]}>
                Notes
              </Text>
            </Pressable>
            <Pressable 
              style={[lessonStyles.tab, activeTab === 'discussion' && lessonStyles.tabActive]}
              onPress={() => setActiveTab('discussion')}
            >
              <Text style={[lessonStyles.tabText, activeTab === 'discussion' && lessonStyles.tabTextActive]}>
                Discussion
              </Text>
            </Pressable>
          </View>

          {/* Tab Content */}
          <View style={lessonStyles.tabContent}>
            {activeTab === 'content' && (
              <Text style={lessonStyles.contentText}>
                {currentLesson?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim curi an lin esam venlam."}
              </Text>
            )}
            {activeTab === 'notes' && (
              <Text style={lessonStyles.contentText}>Ghi chú của bạn sẽ hiển thị ở đây...</Text>
            )}
            {activeTab === 'discussion' && (
              <Text style={lessonStyles.contentText}>Thảo luận về bài học...</Text>
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={lessonStyles.navigationButtons}>
            <Pressable 
              style={[lessonStyles.navButton, lessonStyles.previousButton, currentLessonIndex === 0 && lessonStyles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentLessonIndex === 0}
            >
              <Icon name="arrow-back" size={20} color={currentLessonIndex === 0 ? "#9CA3AF" : "#2563EB"} />
              <Text style={[lessonStyles.navButtonText, lessonStyles.previousButtonText, currentLessonIndex === 0 && lessonStyles.navButtonTextDisabled]}>
                PREVIOUS
              </Text>
            </Pressable>

            <Pressable 
              style={[lessonStyles.navButton, lessonStyles.completeButton, !canProceed && lessonStyles.navButtonDisabled]}
              onPress={handleComplete}
              disabled={!canProceed}
            >
              <Text style={[lessonStyles.completeButtonText, !canProceed && lessonStyles.navButtonTextDisabled]}>
               Next
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}