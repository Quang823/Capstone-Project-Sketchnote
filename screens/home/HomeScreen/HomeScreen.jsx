import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Shadow } from "react-native-shadow-2";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { homeStyles } from "./HomeScreen.styles";
import NavigationDrawer from "../nav/NavigationDrawer";

const ReanimatedView = Reanimated.createAnimatedComponent(View);
const { width } = Dimensions.get("window");

// Dữ liệu mẫu cho các khóa học đã mua
const purchasedCourses = [
  {
    id: "1",
    title: "Nghệ thuật Sketchnote cơ bản",
    instructor: "Nguyễn Văn A",
    image: require("../../../assets/logo1.webp"),
    progress: 45,
    lastAccessed: "Hôm nay, 10:30",
    level: "Cơ bản",
    duration: "2.5 giờ"
  },
  {
    id: "2",
    title: "Sketchnote nâng cao cho doanh nghiệp",
    instructor: "Trần Thị B",
    image: require("../../../assets/logo1.webp"),
    progress: 20,
    lastAccessed: "Hôm qua, 15:45",
    level: "Nâng cao",
    duration: "4 giờ"
  },
  {
    id: "3",
    title: "Kỹ thuật vẽ biểu đồ trực quan",
    instructor: "Lê Văn C",
    image: require("../../../assets/logo1.webp"),
    progress: 75,
    lastAccessed: "24/06/2023",
    level: "Trung cấp",
    duration: "3 giờ"
  },
];

// Dữ liệu mẫu cho các dự án gần đây
const recentProjects = [
  {
    id: "1",
    title: "Bài học Toán học",
    preview: require("../../../assets/logo1.webp"),
    date: "Hôm nay",
    time: "10:30",
    color: "#FFE4E1",
    category: "Giáo dục"
  },
  {
    id: "2",
    title: "Ý tưởng dự án mới",
    preview: require("../../../assets/logo1.webp"),
    date: "Hôm qua",
    time: "15:45",
    color: "#E1F5FE",
    category: "Brainstorm"
  },
  {
    id: "3",
    title: "Lịch trình tuần ",
    preview: require("../../../assets/logo1.webp"),
    date: "3 ngày trước",
    time: "09:15",
    color: "#F1F8E9",
    category: "Lập kế hoạch"
  },
];

// Quick actions data
const quickActions = [
  { id: 1, title: "Sketchnote mới", icon: "edit", color: "#4F46E5", action: "create" },
  { id: 2, title: "Từ template", icon: "content-copy", color: "#059669", action: "template" },
  { id: 3, title: "Scan & Edit", icon: "camera", color: "#DC2626", action: "scan" },
  { id: 4, title: "Cộng tác", icon: "group", color: "#7C3AED", action: "collaborate" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Nguyễn Văn A");
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Animation cho drawer
  const drawerAnimation = useRef(new Animated.Value(-320)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  
  // Animation cho các phần tử
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.ease });
    translateY.value = withTiming(0, { duration: 800, easing: Easing.ease });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const toggleDrawer = () => {
    if (drawerOpen) {
      // Đóng drawer
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -320,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Callback để đảm bảo animation hoàn tất
        setDrawerOpen(false);
      });
    } else {
      // Mở drawer
      setDrawerOpen(true);
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNavPress = (navItem) => {
    setActiveNavItem(navItem);
    
    // Đóng drawer trước khi navigate
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -320,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDrawerOpen(false);
        // Navigation sau khi đóng drawer
        switch(navItem) {
          case 'home':
            break;
          case 'courses':
            navigation.navigate("CoursesScreen");
            break;
          case 'blogAll':
            navigation.navigate("BlogList");
            break;
          case 'blogMine':
            navigation.navigate("BlogMyList");
            break;
          case 'create':
            navigation.navigate("DrawingScreen");
            break;
          case 'gallery':
            navigation.navigate("GalleryScreen");
            break;
          case 'profile':
            navigation.navigate("ProfileScreen");
            break;
          case 'settings':
            navigation.navigate("SettingsScreen");
            break;
          default:
            break;
        }
      });
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'create':
        navigation.navigate("DrawingScreen");
        break;
      case 'template':
        navigation.navigate("TemplateScreen");
        break;
      case 'scan':
        navigation.navigate("ScanScreen");
        break;
      case 'collaborate':
        navigation.navigate("CollaborationScreen");
        break;
      default:
        break;
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <LinearGradient
      colors={["#F0F9FF", "#FEF7CD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={homeStyles.container}
    >
      {/* Navigation Drawer */}
      <NavigationDrawer
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        overlayAnimation={overlayAnimation}
        activeNavItem={activeNavItem}
        onToggleDrawer={toggleDrawer}
        onNavPress={handleNavPress}
      />

      {/* Main Content */}
      <View style={homeStyles.mainContent}>
        <ScrollView style={homeStyles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header với thiết kế mới */}
          <ReanimatedView style={[homeStyles.header, animatedStyle]}>
            <View style={homeStyles.headerTop}>
              <Pressable onPress={toggleDrawer} style={homeStyles.menuButton}>
                <Icon name="menu" size={24} color="#1F2937" />
              </Pressable>
              <View style={homeStyles.notificationContainer}>
                <Pressable style={homeStyles.notificationButton}>
                  <Icon name="notifications-none" size={24} color="#6B7280" />
                  <View style={homeStyles.notificationBadge}>
                    <Text style={homeStyles.notificationCount}>3</Text>
                  </View>
                </Pressable>
              </View>
            </View>
            
            <View style={homeStyles.welcomeContainer}>
              <Text style={homeStyles.greetingText}>{getCurrentGreeting()}</Text>
              <Text style={homeStyles.userName}>{userName}!</Text>
              <Text style={homeStyles.motivationText}>
                Hãy tạo ra những sketchnote tuyệt vời hôm nay 🎨
              </Text>
            </View>
          </ReanimatedView>

          {/* Quick Actions */}
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Thao tác nhanh</Text>
            <View style={homeStyles.quickActionsContainer}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  style={[homeStyles.quickActionButton, { backgroundColor: action.color + '15' }]}
                  onPress={() => handleQuickAction(action.action)}
                >
                  <View style={[homeStyles.quickActionIcon, { backgroundColor: action.color }]}>
                    <Icon name={action.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text style={homeStyles.quickActionText}>{action.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>

       
        

          {/* Khóa học đã mua với thiết kế mới */}
          <View style={homeStyles.sectionContainer}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Khóa học của bạn</Text>
              <Pressable onPress={() => navigation.navigate("CoursesScreen")}>
                <Text style={homeStyles.viewAllText}>Xem tất cả →</Text>
              </Pressable>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={homeStyles.coursesContainer}
            >
              {purchasedCourses.map((course) => (
                <Pressable
                  key={course.id}
                  style={homeStyles.courseCard}
                  onPress={() => navigation.navigate("LessonScreen", { courseId: course.id, lessonId: "l1" })}
                >
                  <Shadow distance={8} startColor="#00000015" finalColor="#00000005">
                    <View style={homeStyles.courseCardInner}>
                      <Image source={course.image} style={homeStyles.courseImage} />
                      <View style={homeStyles.courseOverlay}>
                        <View style={homeStyles.courseLevelBadge}>
                          <Text style={homeStyles.courseLevelText}>{course.level}</Text>
                        </View>
                        <Icon name="play-circle-outline" size={32} color="#FFFFFF" />
                      </View>
                      <View style={homeStyles.courseInfo}>
                        <Text style={homeStyles.courseTitle} numberOfLines={2}>
                          {course.title}
                        </Text>
                        <View style={homeStyles.courseMetaContainer}>
                          <Icon name="person" size={14} color="#6B7280" />
                          <Text style={homeStyles.courseInstructor}>{course.instructor}</Text>
                        </View>
                        <View style={homeStyles.courseDurationContainer}>
                          <Icon name="access-time" size={14} color="#6B7280" />
                          <Text style={homeStyles.courseDuration}>{course.duration}</Text>
                        </View>
                        <View style={homeStyles.progressContainer}>
                          <View style={homeStyles.progressBar}>
                            <View 
                              style={[
                                homeStyles.progressFill, 
                                { width: `${course.progress}%` }
                              ]} 
                            />
                          </View>
                          <Text style={homeStyles.progressText}>{course.progress}%</Text>
                        </View>
                      </View>
                    </View>
                  </Shadow>
                </Pressable>
              ))}
            </ScrollView>
          </View>

         {/* Dự án gần đây  */} 
<View style={homeStyles.sectionContainer}>
  <View style={homeStyles.sectionHeader}>
    <Text style={homeStyles.sectionTitle}>Dự án gần đây</Text>
    <Pressable onPress={() => navigation.navigate("GalleryScreen")}>
      <Text style={homeStyles.viewAllText}>Xem tất cả →</Text>
    </Pressable>
  </View>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={homeStyles.coursesContainer} // tái sử dụng container
  >
    {recentProjects.map((project) => (
      <Pressable
        key={project.id}
        style={homeStyles.projectCard} 
        onPress={() =>
          navigation.navigate("DrawingScreen", { projectId: project.id })
        }
      >
        <Shadow distance={8} startColor="#00000015" finalColor="#00000005">
          <View style={homeStyles.projectCardInner}>
            <Image source={project.preview} style={homeStyles.projectPreview} />

            <View style={homeStyles.courseOverlay}>
              <View style={homeStyles.courseLevelBadge}>
                <Text style={homeStyles.courseLevelText}>
                  {project.category}
                </Text>
              </View>
              <Icon name="more-vert" size={28} color="#FFFFFF" />
            </View>

            <View style={homeStyles.projectFooter}>
              <Text style={homeStyles.projectTitle} numberOfLines={2}>
                {project.title}
              </Text>
              <View style={homeStyles.projectTimeContainer}>
                <Icon name="access-time" size={14} color="#6B7280" />
                <Text style={homeStyles.projectDate}>{project.date}</Text>
              </View>
            </View>
          </View>
        </Shadow>
      </Pressable>
    ))}
  </ScrollView>
</View>


          
          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
}