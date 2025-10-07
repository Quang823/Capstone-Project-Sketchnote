import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
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

const ReanimatedView = Reanimated.createAnimatedComponent(View);

// Dữ liệu mẫu cho khóa học
const courseData = {
  id: "1",
  title: "Nghệ thuật Sketchnote cơ bản",
  instructor: "Nguyễn Văn A",
  image: require("../../../assets/logo1.webp"),
  price: "299.000đ",
  rating: 4.8,
  students: 1240,
  level: "Cơ bản",
  category: "design",
  description: "Khóa học này sẽ giúp bạn nắm vững các kỹ thuật cơ bản của Sketchnote, từ cách tạo các yếu tố hình ảnh đơn giản đến việc tổ chức thông tin một cách trực quan và hấp dẫn. Phù hợp cho người mới bắt đầu muốn cải thiện kỹ năng ghi chú và tư duy trực quan.",
  duration: "4 giờ 30 phút",
  lastUpdated: "Tháng 6, 2023",
  includes: [
    "12 bài học video",
    "5 bài tập thực hành",
    "3 tài liệu tải về",
    "Truy cập trọn đời",
    "Chứng chỉ hoàn thành",
  ],
  modules: [
    {
      id: "m1",
      title: "Giới thiệu về Sketchnote",
      lessons: [
        { id: "l1", title: "Sketchnote là gì?", duration: "10:15", isPreview: true },
        { id: "l2", title: "Lợi ích của Sketchnote", duration: "12:30", isPreview: false },
        { id: "l3", title: "Các công cụ cần thiết", duration: "15:45", isPreview: false },
      ],
    },
    {
      id: "m2",
      title: "Các yếu tố cơ bản",
      lessons: [
        { id: "l4", title: "Chữ và phông chữ", duration: "20:10", isPreview: false },
        { id: "l5", title: "Biểu tượng đơn giản", duration: "18:25", isPreview: false },
        { id: "l6", title: "Khung và đường viền", duration: "14:50", isPreview: false },
      ],
    },
    {
      id: "m3",
      title: "Tổ chức thông tin",
      lessons: [
        { id: "l7", title: "Cấu trúc trang", duration: "22:15", isPreview: false },
        { id: "l8", title: "Sử dụng màu sắc", duration: "16:40", isPreview: false },
        { id: "l9", title: "Kỹ thuật nhấn mạnh", duration: "19:30", isPreview: false },
      ],
    },
    {
      id: "m4",
      title: "Thực hành và ứng dụng",
      lessons: [
        { id: "l10", title: "Sketchnote cho cuộc họp", duration: "25:20", isPreview: false },
        { id: "l11", title: "Sketchnote cho học tập", duration: "23:15", isPreview: false },
        { id: "l12", title: "Dự án cuối khóa", duration: "30:00", isPreview: false },
      ],
    },
  ],
};

export default function CourseDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params || { courseId: "1" };
  
  const [course, setCourse] = useState(courseData);
  const [expandedModules, setExpandedModules] = useState({});
  
  // Animation cho các phần tử
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });
    
    // Trong thực tế, bạn sẽ fetch dữ liệu khóa học dựa trên courseId
    // fetchCourseData(courseId).then(data => setCourse(data));
  }, [courseId]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackPress = () => {
    navigation.goBack();
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleStartLearning = () => {
    // Điều hướng đến màn hình học
    navigation.navigate("LessonScreen", { 
      courseId: course.id, 
      lessonId: course.modules[0].lessons[0].id 
    });
  };

  const handlePreviewLesson = (lessonId) => {
    // Điều hướng đến màn hình xem trước bài học
    navigation.navigate("LessonScreen", { 
      courseId: course.id, 
      lessonId: lessonId,
      isPreview: true
    });
  };

  return (
    <LinearGradient
      colors={["#E0F2FE", "#FEF3C7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={courseDetailStyles.container}
    >
      <View style={courseDetailStyles.header}>
        <Pressable style={courseDetailStyles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={courseDetailStyles.headerTitle}>Chi tiết khóa học</Text>
        <View style={courseDetailStyles.headerRight} />
      </View>

      <ScrollView style={courseDetailStyles.scrollView}>
        <Image source={course.image} style={courseDetailStyles.courseImage} />
        
        <ReanimatedView style={[courseDetailStyles.courseInfoContainer, animatedStyle]}>
          <Text style={courseDetailStyles.courseTitle}>{course.title}</Text>
          
          <View style={courseDetailStyles.instructorContainer}>
            <Icon name="person" size={16} color="#6B7280" />
            <Text style={courseDetailStyles.instructorText}>
              Giảng viên: {course.instructor}
            </Text>
          </View>
          
          <View style={courseDetailStyles.metaContainer}>
            <View style={courseDetailStyles.metaItem}>
              <Icon name="star" size={16} color="#F59E0B" />
              <Text style={courseDetailStyles.metaText}>{course.rating} (120 đánh giá)</Text>
            </View>
            <View style={courseDetailStyles.metaItem}>
              <Icon name="people" size={16} color="#6B7280" />
              <Text style={courseDetailStyles.metaText}>{course.students} học viên</Text>
            </View>
            <View style={courseDetailStyles.metaItem}>
              <Icon name="school" size={16} color="#6B7280" />
              <Text style={courseDetailStyles.metaText}>{course.level}</Text>
            </View>
          </View>
          
          <View style={courseDetailStyles.priceContainer}>
            <Text style={courseDetailStyles.priceText}>{course.price}</Text>
          </View>
          
          <Pressable
            style={courseDetailStyles.enrollButton}
            onPress={handleStartLearning}
          >
            <LinearGradient
              colors={["#4F46E5", "#6366F1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={courseDetailStyles.enrollButtonGradient}
            >
              <Text style={courseDetailStyles.enrollButtonText}>Đăng ký học ngay</Text>
            </LinearGradient>
          </Pressable>
          
          <View style={courseDetailStyles.section}>
            <Text style={courseDetailStyles.sectionTitle}>Mô tả khóa học</Text>
            <Text style={courseDetailStyles.descriptionText}>{course.description}</Text>
          </View>
          
          <View style={courseDetailStyles.section}>
            <Text style={courseDetailStyles.sectionTitle}>Khóa học bao gồm</Text>
            {course.includes.map((item, index) => (
              <View key={index} style={courseDetailStyles.includeItem}>
                <Icon name="check-circle" size={16} color="#4F46E5" />
                <Text style={courseDetailStyles.includeText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={courseDetailStyles.section}>
            <Text style={courseDetailStyles.sectionTitle}>Nội dung khóa học</Text>
            <Text style={courseDetailStyles.contentMeta}>
              {course.modules.length} phần • {course.modules.reduce((total, module) => total + module.lessons.length, 0)} bài học • {course.duration} thời lượng
            </Text>
            
            {course.modules.map((module) => (
              <View key={module.id} style={courseDetailStyles.moduleContainer}>
                <Pressable
                  style={courseDetailStyles.moduleHeader}
                  onPress={() => toggleModule(module.id)}
                >
                  <View style={courseDetailStyles.moduleHeaderLeft}>
                    <Text style={courseDetailStyles.moduleTitle}>{module.title}</Text>
                    <Text style={courseDetailStyles.moduleMeta}>
                      {module.lessons.length} bài học
                    </Text>
                  </View>
                  <Icon
                    name={expandedModules[module.id] ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#4B5563"
                  />
                </Pressable>
                
                {expandedModules[module.id] && (
                  <View style={courseDetailStyles.lessonsContainer}>
                    {module.lessons.map((lesson) => (
                      <View key={lesson.id} style={courseDetailStyles.lessonItem}>
                        <View style={courseDetailStyles.lessonInfo}>
                          <Icon
                            name={lesson.isPreview ? "play-circle-filled" : "lock"}
                            size={20}
                            color={lesson.isPreview ? "#4F46E5" : "#9CA3AF"}
                          />
                          <Text style={courseDetailStyles.lessonTitle}>{lesson.title}</Text>
                        </View>
                        <View style={courseDetailStyles.lessonMeta}>
                          {lesson.isPreview && (
                            <Pressable
                              style={courseDetailStyles.previewButton}
                              onPress={() => handlePreviewLesson(lesson.id)}
                            >
                              <Text style={courseDetailStyles.previewButtonText}>Xem trước</Text>
                            </Pressable>
                          )}
                          <Text style={courseDetailStyles.lessonDuration}>{lesson.duration}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ReanimatedView>
      </ScrollView>
    </LinearGradient>
  );
}