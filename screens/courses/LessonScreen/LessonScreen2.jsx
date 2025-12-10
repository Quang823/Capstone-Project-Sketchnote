// import React, {
//     useCallback,
//     useMemo,
//     useState,
//     useEffect,
//     useRef,
//   } from "react";
//   import {
//     View,
//     Text,
//     ScrollView,
//     Pressable,
//     Dimensions,
//   } from "react-native";
//   import { useNavigation, useRoute } from "@react-navigation/native";
//   import YoutubePlayer from "react-native-youtube-iframe";
//   import Icon from "react-native-vector-icons/MaterialIcons";
//   import { lessonStyles } from "./LessonScreen.styles";
//   import { courseService } from "../../../service/courseService";
//   import LottieView from "lottie-react-native";
//   import loadingAnimation from "../../../assets/loading.json";
  
//   const { width: SCREEN_WIDTH } = Dimensions.get("window");
//   const SIDEBAR_WIDTH = 280;
//   const MAIN_CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
//   const PLAYER_WIDTH = MAIN_CONTENT_WIDTH - 64;
//   const PLAYER_HEIGHT = Math.round((PLAYER_WIDTH * 9) / 16);
  
//   const COMPLETION_THRESHOLD = 90; // 90%
//   const HEARTBEAT_INTERVAL_MS = 10000; // Save every 10 seconds
  
//   // Helper to format duration
//   const formatDuration = (seconds) => {
//     if (!seconds) return "0:00";
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };
  
//   // Extract YouTube video ID from URL
//   const extractYouTubeId = (url) => {
//     if (!url) return null;
//     const regExp =
//       /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//     const match = url.match(regExp);
//     return match && match[2].length === 11 ? match[2] : null;
//   };
  
//   export default function LessonScreen() {
//     const navigation = useNavigation();
//     const route = useRoute();
//     const { courseId = 1, lessonId } = route.params || {};
  
//     // UI States
//     const [course, setCourse] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [currentLessonId, setCurrentLessonId] = useState(lessonId);
//     const [activeTab, setActiveTab] = useState("content");
//     const [expandedLessons, setExpandedLessons] = useState({});
//     const [playerState, setPlayerState] = useState("unstarted");
  
//     // Tracking refs - ONLY THESE, NO DUPLICATES
//     const trackingRef = useRef({
//       timeSpent: 0,
//       lastPosition: 0,
//       lastSaveTime: Date.now(),
//       isSaving: false,
//       hasCompleted: false,
//     });
  
//     const playerRef = useRef(null);
//     const heartbeatIntervalRef = useRef(null);
//     const startTimeRef = useRef(null);
//     const forceUpdateRef = useRef(0); // For triggering re-renders
  
//     // Force update function
//     const forceUpdate = useCallback(() => {
//       forceUpdateRef.current += 1;
//     }, []);
  
//     // ============================================
//     // FETCH COURSE DATA
//     // ============================================
  
//     useEffect(() => {
//       fetchCourseData();
//     }, [courseId]);
  
//     useEffect(() => {
//       if (lessonId && course?.lessons) {
//         setCurrentLessonId(lessonId);
//       } else if (course?.lessons && course.lessons.length > 0) {
//         setCurrentLessonId(course.lessons[0].lessonId);
//       }
//     }, [lessonId, course]);
  
//     const fetchCourseData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await courseService.getCourseByIdEnrolled(courseId);
//         if (response && response.result.course) {
//           setCourse(response.result.course);
  
//           // ============================================
//           // LOG COMPLETED LESSONS
//           // ============================================
//           const completedLessons = response.result.course.lessons.filter(
//             lesson => lesson.lessonProgressStatus === "COMPLETED"
//           );
  
//           console.log("========================================");
//           console.log("📚 COURSE INFO:");
//           console.log(`Course ID: ${courseId}`);
//           console.log(`Course Title: ${response.result.course.title}`);
//           console.log(`Total Lessons: ${response.result.course.lessons.length}`);
//           console.log(`Completed: ${completedLessons.length}`);
//           console.log("========================================");
  
//           if (completedLessons.length > 0) {
//             console.log("✅ COMPLETED LESSONS:");
//             completedLessons.forEach((lesson, index) => {
//               console.log(`  ${index + 1}. [ID: ${lesson.lessonId}] ${lesson.title}`);
//             });
//           } else {
//             console.log("❌ No lessons completed yet");
//           }
  
//           console.log("========================================");
//           console.log("📋 ALL LESSONS STATUS:");
//           response.result.course.lessons.forEach((lesson, index) => {
//             const status = lesson.lessonProgressStatus === "COMPLETED" ? "✅" : "⏳";
//             console.log(`  ${status} ${index + 1}. [ID: ${lesson.lessonId}] ${lesson.title} - Status: ${lesson.lessonProgressStatus || "NOT_STARTED"}`);
//           });
//           console.log("========================================");
//         }
//       } catch (err) {
//         console.error("Failed to fetch course:", err);
//         setError("Không thể tải khóa học");
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     // ============================================
//     // COMPUTED VALUES
//     // ============================================
  
//     const currentLesson = useMemo(() => {
//       if (!course?.lessons) return null;
//       return course.lessons.find((l) => l.lessonId === currentLessonId);
//     }, [course, currentLessonId]);
  
//     const currentVideoId = useMemo(() => {
//       if (!currentLesson?.videoUrl) return null;
//       return extractYouTubeId(currentLesson.videoUrl);
//     }, [currentLesson]);
  
//     const currentLessonIndex = useMemo(() => {
//       if (!course?.lessons) return 0;
//       return course.lessons.findIndex((l) => l.lessonId === currentLessonId);
//     }, [course, currentLessonId]);
  
//     const progress = useMemo(() => {
//       if (!course?.lessons || course.lessons.length === 0) return 0;
//       return Math.round(((currentLessonIndex + 1) / course.lessons.length) * 100);
//     }, [course, currentLessonIndex]);
  
//     // ============================================
//     // CORE PROGRESS SAVE LOGIC
//     // ============================================
  
//     const saveProgressToServer = useCallback(
//       async (force = false, markComplete = false) => {
//         if (!currentLessonId || !courseId) return;
//         if (trackingRef.current.isSaving) {
//           console.warn("⚠️ Save already in progress, skipping...");
//           return;
//         }
  
//         // Avoid redundant saves once marked completed unless explicitly forced
//         if (trackingRef.current.hasCompleted && !force && !markComplete) {
//           return;
//         }
  
//         try {
//           trackingRef.current.isSaving = true;
  
//           // Get current position from player
//           let currentPosition = trackingRef.current.lastPosition;
//           try {
//             const time = await playerRef.current?.getCurrentTime();
//             if (typeof time === "number" && !isNaN(time)) {
//               currentPosition = Math.floor(time);
//               trackingRef.current.lastPosition = currentPosition;
//             }
//           } catch (err) {
//             console.warn("Failed to get current time:", err);
//           }
  
//           // Calculate if completed
//           const lessonDuration = currentLesson?.duration || 0;
//           const watchPercentage =
//             lessonDuration > 0 ? (currentPosition / lessonDuration) * 100 : 0;
  
//           const isCompleted =
//             markComplete ||
//             trackingRef.current.hasCompleted ||
//             watchPercentage >= COMPLETION_THRESHOLD;
  
//           // Only save if there's actual progress OR forced
//           const hasProgress =
//             trackingRef.current.timeSpent > 0 || currentPosition > 0;
//           if (!hasProgress && !force) {
//             return;
//           }
  
//           // Prepare payload
//           const payload = {
//             lastPosition: currentPosition,
//             timeSpent: Math.floor(trackingRef.current.timeSpent),
//             completed: isCompleted,
//           };
  
//           console.log("💾 Saving progress:", payload);
  
//           // Call API
//           await courseService.saveLessonProgress(
//             courseId,
//             currentLessonId,
//             payload
//           );
  
//           console.log(`✅ Progress saved successfully for Lesson ID: ${currentLessonId}`);
  
//           // Update tracking - ONLY set hasCompleted if isCompleted is true
//           trackingRef.current.lastSaveTime = Date.now();
  
//           // CRITICAL FIX: Only mark as completed if not already marked AND is actually completed
//           if (isCompleted && !trackingRef.current.hasCompleted) {
//             trackingRef.current.hasCompleted = true;
//             console.log(`🎉 Lesson ${currentLessonId} marked as COMPLETED!`);
//             forceUpdate(); // Trigger re-render to enable Next button
  
//             // Stop heartbeat saves once completed to prevent spam
//             if (heartbeatIntervalRef.current) {
//               clearInterval(heartbeatIntervalRef.current);
//               heartbeatIntervalRef.current = null;
//             }
  
//             // Update local state if completed
//             if (course?.lessons) {
//               setCourse((prev) => ({
//                 ...prev,
//                 lessons: prev.lessons.map((lesson) =>
//                   lesson.lessonId === currentLessonId
//                     ? { ...lesson, lessonProgressStatus: "COMPLETED" }
//                     : lesson
//                 ),
//               }));
  
//               // Log updated completed lessons
//               const updatedCompletedLessons = course.lessons.filter(
//                 lesson => lesson.lessonId === currentLessonId || lesson.lessonProgressStatus === "COMPLETED"
//               );
//               console.log(`📊 Total completed lessons in course ${courseId}: ${updatedCompletedLessons.length}`);
//               console.log("Completed lesson IDs:", updatedCompletedLessons.map(l => l.lessonId));
//             }
//           }
  
//           return true;
//         } catch (error) {
//           console.error("Failed to save progress:", error);
//           return false;
//         } finally {
//           trackingRef.current.isSaving = false;
//         }
//       },
//       [currentLessonId, courseId, currentLesson, course, forceUpdate]
//     );
  
//     // ============================================
//     // TIME TRACKING
//     // ============================================
  
//     const startTimeTracking = useCallback(() => {
//       startTimeRef.current = Date.now();
  
//       // Clear existing interval
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//         heartbeatIntervalRef.current = null;
//       }
  
//       // Single interval for both time tracking and periodic saves
//       heartbeatIntervalRef.current = setInterval(async () => {
//         if (startTimeRef.current) {
//           const elapsed = (Date.now() - startTimeRef.current) / 1000;
//           trackingRef.current.timeSpent += elapsed;
//           startTimeRef.current = Date.now();
//         }
  
//         // Get current position
//         try {
//           const time = await playerRef.current?.getCurrentTime();
//           if (typeof time === "number" && !isNaN(time)) {
//             trackingRef.current.lastPosition = Math.floor(time);
  
//             // Check completion threshold
//             const lessonDuration = currentLesson?.duration || 0;
//             if (lessonDuration > 0) {
//               const watchPercentage = (time / lessonDuration) * 100;
  
//               // Auto-complete when reaching threshold (ONLY ONCE)
//               if (
//                 watchPercentage >= COMPLETION_THRESHOLD &&
//                 !trackingRef.current.hasCompleted
//               ) {
//                 console.log(`🎯 Reached ${COMPLETION_THRESHOLD}% threshold, auto-completing...`);
//                 trackingRef.current.hasCompleted = true;
//                 await saveProgressToServer(true, true);
//                 // CRITICAL: Stop the interval after completing to prevent spam
//                 clearInterval(heartbeatIntervalRef.current);
//                 heartbeatIntervalRef.current = null;
//                 return; // Exit early
//               }
//             }
//           }
//         } catch (err) {
//           console.warn("Heartbeat getCurrentTime failed:", err);
//         }
  
//         // Periodic save (only if not completed)
//         if (!trackingRef.current.hasCompleted) {
//           await saveProgressToServer(false, false);
//         }
//       }, HEARTBEAT_INTERVAL_MS);
//     }, [saveProgressToServer, currentLesson]);
  
//     const stopTimeTracking = useCallback(() => {
//       if (heartbeatIntervalRef.current) {
//         clearInterval(heartbeatIntervalRef.current);
//         heartbeatIntervalRef.current = null;
//       }
  
//       // Save accumulated time
//       if (startTimeRef.current) {
//         const elapsed = (Date.now() - startTimeRef.current) / 1000;
//         trackingRef.current.timeSpent += elapsed;
//         startTimeRef.current = null;
//       }
//     }, []);
  
//     // ============================================
//     // PLAYER STATE HANDLER
//     // ============================================
  
//     const onChangeState = useCallback(
//       async (state) => {
//         setPlayerState(state);
  
//         switch (state) {
//           case "playing":
//             startTimeTracking();
//             break;
  
//           case "paused":
//             stopTimeTracking();
//             await saveProgressToServer(true, false);
//             break;
  
//           case "ended":
//             stopTimeTracking();
//             await saveProgressToServer(true, true);
//             break;
  
//           case "buffering":
//             // Don't stop tracking, just wait
//             break;
  
//           default:
//             stopTimeTracking();
//             break;
//         }
//       },
//       [startTimeTracking, stopTimeTracking, saveProgressToServer]
//     );
  
//     // ============================================
//     // LESSON CHANGE HANDLER
//     // ============================================
  
//     useEffect(() => {
//       // Save old lesson progress before switching
//       const saveAndSwitch = async () => {
//         if (currentLessonId) {
//           stopTimeTracking();
//           await saveProgressToServer(true, false);
//         }
  
//         // Reset tracking for new lesson
//         trackingRef.current = {
//           timeSpent: 0,
//           lastPosition: 0,
//           lastSaveTime: Date.now(),
//           isSaving: false,
//           hasCompleted: false,
//         };
//         startTimeRef.current = null;
//         setPlayerState("unstarted");
//       };
  
//       saveAndSwitch();
  
//       // Cleanup on unmount or lesson change
//       return () => {
//         stopTimeTracking();
//       };
//     }, [currentLessonId, stopTimeTracking, saveProgressToServer]);
  
//     // ============================================
//     // LESSON ACCESS CONTROL
//     // ============================================
  
//     const canAccessLesson = useCallback(
//       (lessonIndex, lesson) => {
//         if (!lesson) return false;
  
//         // If lesson is completed, always allow access
//         if (lesson.lessonProgressStatus === "COMPLETED") {
//           return true;
//         }
  
//         // If lesson is the first one, always allow access
//         if (lessonIndex === 0) {
//           return true;
//         }
  
//         // For other lessons, check if previous lesson is completed
//         const previousLesson = course?.lessons?.[lessonIndex - 1];
//         if (!previousLesson) return false;
  
//         return previousLesson.lessonProgressStatus === "COMPLETED";
//       },
//       [course]
//     );
  
//     // ============================================
//     // NAVIGATION HANDLERS
//     // ============================================
  
//     const handleBack = useCallback(async () => {
//       stopTimeTracking();
//       await saveProgressToServer(true, false);
//       navigation.goBack();
//     }, [stopTimeTracking, saveProgressToServer, navigation]);
  
//     const handlePrevious = useCallback(async () => {
//       if (currentLessonIndex > 0 && course?.lessons) {
//         stopTimeTracking();
//         await saveProgressToServer(true, false);
//         setCurrentLessonId(course.lessons[currentLessonIndex - 1].lessonId);
//       }
//     }, [currentLessonIndex, course, stopTimeTracking, saveProgressToServer]);
  
//     const handleComplete = useCallback(async () => {
//       stopTimeTracking();
//       await saveProgressToServer(true, true);
  
//       console.log("🔄 Navigating to next lesson...");
//       console.log(`Current Lesson Index: ${currentLessonIndex}`);
//       console.log(`Total Lessons: ${course.lessons.length}`);
  
//       if (currentLessonIndex < course.lessons.length - 1 && course?.lessons) {
//         const nextLesson = course.lessons[currentLessonIndex + 1];
//         console.log(`➡️ Moving to next lesson: [ID: ${nextLesson.lessonId}] ${nextLesson.title}`);
//         setCurrentLessonId(nextLesson.lessonId);
//       } else {
//         console.log("🎓 Course completed! Going back...");
//         navigation.goBack();
//       }
//     }, [
//       currentLessonIndex,
//       course,
//       stopTimeTracking,
//       saveProgressToServer,
//       navigation,
//     ]);
  
//     const handleOpenLesson = useCallback(
//       async (id) => {
//         const targetLesson = course?.lessons?.find((l) => l.lessonId === id);
//         const targetIndex = course?.lessons?.findIndex((l) => l.lessonId === id);
  
//         if (!canAccessLesson(targetIndex, targetLesson)) {
//           return;
//         }
  
//         stopTimeTracking();
//         await saveProgressToServer(true, false);
//         setCurrentLessonId(id);
//       },
//       [course, canAccessLesson, stopTimeTracking, saveProgressToServer]
//     );
  
//     const toggleLessonExpand = useCallback((id) => {
//       setExpandedLessons((prev) => ({
//         ...prev,
//         [id]: !prev[id],
//       }));
//     }, []);
  
//     // ============================================
//     // CAN PROCEED CHECK
//     // ============================================
  
//     const canProceedToNext = useMemo(() => {
//       if (!course?.lessons || currentLessonIndex === -1) return false;
  
//       const lesson = course.lessons[currentLessonIndex];
//       if (!lesson) return false;
  
//       // Already completed in database
//       if (lesson.lessonProgressStatus === "COMPLETED") {
//         return true;
//       }
  
//       // Completed in current session
//       // Force re-read from ref to ensure reactivity
//       return trackingRef.current.hasCompleted;
//     }, [course, currentLessonIndex, forceUpdateRef.current]); // Add forceUpdateRef.current as dep
  
//     // ============================================
//     // RENDER
//     // ============================================
  
//     if (loading) {
//       return (
//         <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//           <LottieView
//             source={loadingAnimation}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       );
//     }
  
//     if (error || !course) {
//       return (
//         <View style={lessonStyles.errorContainer}>
//           <Icon name="error-outline" size={64} color="#EF4444" />
//           <Text style={lessonStyles.errorText}>
//             {error || "Không tìm thấy khóa học"}
//           </Text>
//           <Pressable style={lessonStyles.retryButton} onPress={fetchCourseData}>
//             <Text style={lessonStyles.retryButtonText}>Thử lại</Text>
//           </Pressable>
//         </View>
//       );
//     }
  
//     return (
//       <View style={lessonStyles.container}>
//         {/* Left Sidebar */}
//         <View style={[lessonStyles.sidebar, { width: SIDEBAR_WIDTH }]}>
//           <View style={lessonStyles.sidebarHeader}>
//             <Pressable onPress={handleBack} style={lessonStyles.backButton}>
//               <Icon name="arrow-back" size={24} color="#1F2937" />
//             </Pressable>
//           </View>
  
//           <ScrollView style={lessonStyles.sidebarScroll}>
//             <Pressable style={lessonStyles.overviewItem}>
//               <Text style={lessonStyles.overviewText}>Lesson Overview</Text>
//             </Pressable>
  
//             {course.lessons &&
//               course.lessons.map((lesson, index) => {
//                 const isActive = lesson.lessonId === currentLessonId;
//                 const isExpanded = expandedLessons[lesson.lessonId];
//                 const isLocked = !canAccessLesson(index, lesson);
//                 const isCompleted = lesson.lessonProgressStatus === "COMPLETED";
  
//                 return (
//                   <View
//                     key={lesson.lessonId}
//                     style={lessonStyles.sidebarItemContainer}
//                   >
//                     <Pressable
//                       style={[
//                         lessonStyles.sidebarItem,
//                         isActive && lessonStyles.sidebarItemActive,
//                         isLocked && lessonStyles.sidebarItemLocked,
//                       ]}
//                       onPress={() =>
//                         isLocked ? null : toggleLessonExpand(lesson.lessonId)
//                       }
//                       disabled={isLocked}
//                     >
//                       <View
//                         style={{
//                           flex: 1,
//                           flexDirection: "row",
//                           alignItems: "center",
//                         }}
//                       >
//                         {isLocked && (
//                           <Icon
//                             name="lock"
//                             size={16}
//                             color="#9CA3AF"
//                             style={{ marginRight: 8 }}
//                           />
//                         )}
//                         {isCompleted && !isLocked && (
//                           <Icon
//                             name="check-circle"
//                             size={16}
//                             color="#10B981"
//                             style={{ marginRight: 8 }}
//                           />
//                         )}
//                         {!isLocked && !isCompleted && (
//                           <Icon
//                             name="play-circle-outline"
//                             size={16}
//                             color="#6B7280"
//                             style={{ marginRight: 8 }}
//                           />
//                         )}
//                         <Text
//                           style={[
//                             lessonStyles.sidebarItemText,
//                             isActive && lessonStyles.sidebarItemTextActive,
//                             isLocked && lessonStyles.sidebarItemTextLocked,
//                           ]}
//                         >
//                           {lesson.title}
//                         </Text>
//                       </View>
//                       <Icon
//                         name={
//                           isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"
//                         }
//                         size={20}
//                         color={
//                           isLocked ? "#9CA3AF" : isActive ? "#FFFFFF" : "#6B7280"
//                         }
//                       />
//                     </Pressable>
  
//                     {isExpanded && (
//                       <View style={lessonStyles.sidebarItemExpanded}>
//                         {lesson.content && (
//                           <Text
//                             style={lessonStyles.sidebarItemContent}
//                             numberOfLines={3}
//                           >
//                             {lesson.content}
//                           </Text>
//                         )}
  
//                         <View style={lessonStyles.sidebarItemMeta}>
//                           <View style={lessonStyles.sidebarMetaRow}>
//                             <Icon name="schedule" size={16} color="#6B7280" />
//                             <Text style={lessonStyles.sidebarMetaText}>
//                               {formatDuration(lesson.duration)}
//                             </Text>
//                           </View>
//                         </View>
  
//                         <Pressable
//                           style={[
//                             lessonStyles.sidebarPlayButton,
//                             isLocked && lessonStyles.sidebarPlayButtonLocked,
//                           ]}
//                           onPress={() => handleOpenLesson(lesson.lessonId)}
//                           disabled={isLocked}
//                         >
//                           <Icon
//                             name={isLocked ? "lock" : "play-circle-filled"}
//                             size={20}
//                             color={isLocked ? "#9CA3AF" : "#FFFFFF"}
//                           />
//                           <Text
//                             style={[
//                               lessonStyles.sidebarPlayText,
//                               isLocked && lessonStyles.sidebarPlayTextLocked,
//                             ]}
//                           >
//                             {isLocked ? "Locked" : "Start Lesson"}
//                           </Text>
//                         </Pressable>
//                       </View>
//                     )}
//                   </View>
//                 );
//               })}
//           </ScrollView>
//         </View>
  
//         {/* Main Content */}
//         <View style={lessonStyles.mainContent}>
//           <View style={lessonStyles.header}>
//             <Text style={lessonStyles.headerTitle}>{course.title}</Text>
//           </View>
  
//           <ScrollView style={lessonStyles.contentScroll}>
//             <Text style={lessonStyles.lessonMainTitle}>
//               {currentLesson?.title}
//             </Text>
  
//             {/* Video Player */}
//             {currentVideoId ? (
//               <View
//                 style={[
//                   lessonStyles.playerWrap,
//                   { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
//                 ]}
//               >
//                 <YoutubePlayer
//                   ref={playerRef}
//                   height={PLAYER_HEIGHT}
//                   width={PLAYER_WIDTH}
//                   play={false}
//                   videoId={currentVideoId}
//                   onChangeState={onChangeState}
//                   initialPlayerParams={{
//                     preventFullScreen: false,
//                   }}
//                   webViewStyle={{ backgroundColor: "#000000" }}
//                   webViewProps={{ allowsFullscreenVideo: true }}
//                 />
//               </View>
//             ) : (
//               <View
//                 style={[
//                   lessonStyles.playerWrap,
//                   lessonStyles.noVideoPlaceholder,
//                   { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
//                 ]}
//               >
//                 <Icon name="play-circle-outline" size={64} color="#9CA3AF" />
//                 <Text style={lessonStyles.noVideoText}>Không có video</Text>
//               </View>
//             )}
  
//             {/* Tabs */}
//             <View style={lessonStyles.tabs}>
//               <Pressable
//                 style={[
//                   lessonStyles.tab,
//                   activeTab === "content" && lessonStyles.tabActive,
//                 ]}
//                 onPress={() => setActiveTab("content")}
//               >
//                 <Text
//                   style={[
//                     lessonStyles.tabText,
//                     activeTab === "content" && lessonStyles.tabTextActive,
//                   ]}
//                 >
//                   Content
//                 </Text>
//               </Pressable>
//               <Pressable
//                 style={[
//                   lessonStyles.tab,
//                   activeTab === "notes" && lessonStyles.tabActive,
//                 ]}
//                 onPress={() => setActiveTab("notes")}
//               >
//                 <Text
//                   style={[
//                     lessonStyles.tabText,
//                     activeTab === "notes" && lessonStyles.tabTextActive,
//                   ]}
//                 >
//                   Notes
//                 </Text>
//               </Pressable>
//               <Pressable
//                 style={[
//                   lessonStyles.tab,
//                   activeTab === "discussion" && lessonStyles.tabActive,
//                 ]}
//                 onPress={() => setActiveTab("discussion")}
//               >
//                 <Text
//                   style={[
//                     lessonStyles.tabText,
//                     activeTab === "discussion" && lessonStyles.tabTextActive,
//                   ]}
//                 >
//                   Discussion
//                 </Text>
//               </Pressable>
//             </View>
  
//             {/* Tab Content */}
//             <View style={lessonStyles.tabContent}>
//               {activeTab === "content" && (
//                 <Text style={lessonStyles.contentText}>
//                   {currentLesson?.content ||
//                     "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."}
//                 </Text>
//               )}
//               {activeTab === "notes" && (
//                 <Text style={lessonStyles.contentText}>
//                   Ghi chú của bạn sẽ hiển thị ở đây...
//                 </Text>
//               )}
//               {activeTab === "discussion" && (
//                 <Text style={lessonStyles.contentText}>
//                   Thảo luận về bài học...
//                 </Text>
//               )}
//             </View>
  
//             {/* Navigation Buttons */}
//             <View style={lessonStyles.navigationButtons}>
//               <Pressable
//                 style={[
//                   lessonStyles.navButton,
//                   lessonStyles.previousButton,
//                   currentLessonIndex === 0 && lessonStyles.navButtonDisabled,
//                 ]}
//                 onPress={handlePrevious}
//                 disabled={currentLessonIndex === 0}
//               >
//                 <Icon
//                   name="arrow-back"
//                   size={20}
//                   color={currentLessonIndex === 0 ? "#9CA3AF" : "#2563EB"}
//                 />
//                 <Text
//                   style={[
//                     lessonStyles.navButtonText,
//                     lessonStyles.previousButtonText,
//                     currentLessonIndex === 0 &&
//                     lessonStyles.navButtonTextDisabled,
//                   ]}
//                 >
//                   PREVIOUS
//                 </Text>
//               </Pressable>
  
//               <Pressable
//                 style={[
//                   lessonStyles.navButton,
//                   lessonStyles.completeButton,
//                   !canProceedToNext && lessonStyles.navButtonDisabled,
//                 ]}
//                 onPress={handleComplete}
//                 disabled={!canProceedToNext}
//               >
//                 <Text
//                   style={[
//                     lessonStyles.completeButtonText,
//                     !canProceedToNext && lessonStyles.navButtonTextDisabled,
//                   ]}
//                 >
//                   {currentLessonIndex === course.lessons.length - 1
//                     ? "COMPLETE"
//                     : "NEXT"}
//                 </Text>
//               </Pressable>
//             </View>
//           </ScrollView>
//         </View>
//       </View>
//     );
//   }