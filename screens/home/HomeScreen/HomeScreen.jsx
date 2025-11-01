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
import { getUserFromToken } from "../../../utils/AuthUtils";

const ReanimatedView = Reanimated.createAnimatedComponent(View);
const { width } = Dimensions.get("window");

// Sample purchased courses
const purchasedCourses = [
  {
    id: "1",
    title: "Basic Sketchnote Art",
    instructor: "John Nguyen",
    image: require("../../../assets/logo1.webp"),
    progress: 45,
    lastAccessed: "Today, 10:30 AM",
    level: "Beginner",
    duration: "2.5h",
  },
  {
    id: "2",
    title: "Advanced Sketchnote for Business",
    instructor: "Mary Tran",
    image: require("../../../assets/logo1.webp"),
    progress: 20,
    lastAccessed: "Yesterday, 3:45 PM",
    level: "Advanced",
    duration: "4h",
  },
  {
    id: "3",
    title: "Visual Chart Techniques",
    instructor: "Liam Le",
    image: require("../../../assets/logo1.webp"),
    progress: 75,
    lastAccessed: "06/24/2023",
    level: "Intermediate",
    duration: "3h",
  },
];

// Recent projects
const recentProjects = [
  {
    id: "1",
    title: "Math Lesson Plan",
    preview: require("../../../assets/logo1.webp"),
    date: "Today",
    time: "10:30 AM",
    color: "#E0F7FA",
    category: "Education",
  },
  {
    id: "2",
    title: "New Project Ideas",
    preview: require("../../../assets/logo1.webp"),
    date: "Yesterday",
    time: "3:45 PM",
    color: "#E8F5E9",
    category: "Brainstorm",
  },
  {
    id: "3",
    title: "Weekly Schedule",
    preview: require("../../../assets/logo1.webp"),
    date: "3 days ago",
    time: "9:15 AM",
    color: "#FFF3E0",
    category: "Planning",
  },
];

// Quick actions
const quickActions = [
  {
    id: 1,
    title: "New Sketchnote",
    icon: "edit",
    color: "#2563EB",
    action: "create",
  },
  {
    id: 2,
    title: "From Template",
    icon: "content-copy",
    color: "#059669",
    action: "template",
  },
  {
    id: 3,
    title: "Scan & Edit",
    icon: "camera",
    color: "#DC2626",
    action: "scan",
  },
  {
    id: 4,
    title: "Collaborate",
    icon: "group",
    color: "#7C3AED",
    action: "collaborate",
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Drawer animation
  const drawerAnimation = useRef(new Animated.Value(-320)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  // Header animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
  }, []);
  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromToken();
      setUserName(user?.name || "");
    };
    getUser();
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const toggleDrawer = () => {
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
      ]).start(() => setDrawerOpen(false));
    } else {
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
        switch (navItem) {
          case "courses":
            navigation.navigate("CoursesScreen");
            break;
          case "blogAll":
            navigation.navigate("BlogList");
            break;
          case "blogMine":
            navigation.navigate("MyBlog");
            break;
          case "create":
            navigation.navigate("DrawingScreen");
            break;
          case "gallery":
            navigation.navigate("GalleryScreen");
            break;
          case "store":
            navigation.navigate("ResourceStore");
            break;
          case "wallet":
            navigation.navigate("Wallet");
            break;
          case "profile":
            navigation.navigate("ProfileScreen");
            break;
          case "settings":
            navigation.navigate("SettingsScreen");
            break;
            case "orderHistory":
  navigation.navigate("OrderHistory");
  break;
          default:
            break;
        }
      });
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "create":
        navigation.navigate("DrawingScreen");
        break;
      case "template":
        navigation.navigate("TemplateScreen");
        break;
      case "scan":
        navigation.navigate("ScanScreen");
        break;
      case "collaborate":
        navigation.navigate("CollaborationScreen");
        break;
      default:
        break;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <LinearGradient
      colors={["#F0FAFF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={homeStyles.container}
    >
      {/* Drawer */}
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
        <ScrollView
          style={homeStyles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ReanimatedView style={[homeStyles.header, animatedStyle]}>
            <View style={homeStyles.headerTop}>
              <Pressable onPress={toggleDrawer} style={homeStyles.menuButton}>
                <Icon name="menu" size={24} color="#1E40AF" />
              </Pressable>

              <View style={homeStyles.headerActions}>
                <Pressable
                  style={homeStyles.headerActionButton}
                  onPress={() => navigation.navigate("Wallet")}
                >
                  <Icon
                    name="account-balance-wallet"
                    size={24}
                    color="#1E3A8A"
                  />
                </Pressable>
                <Pressable
                  style={homeStyles.headerActionButton}
                  onPress={() => navigation.navigate("Cart")}
                >
                  <Icon name="shopping-cart" size={24} color="#1E3A8A" />
                  <View style={homeStyles.cartBadge}>
                    <Text style={homeStyles.cartBadgeText}>2</Text>
                  </View>
                </Pressable>
                <Pressable style={homeStyles.notificationButton}>
                  <Icon name="notifications-none" size={24} color="#1E3A8A" />
                  <View style={homeStyles.notificationBadge}>
                    <Text style={homeStyles.notificationCount}>3</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={homeStyles.welcomeContainer}>
              <Text style={homeStyles.greetingText}>{getGreeting()},</Text>
              <Text style={homeStyles.userName}>{userName}!</Text>
              <Text style={homeStyles.motivationText}>
                Create amazing sketchnotes today 🎨
              </Text>
            </View>
          </ReanimatedView>

          {/* Quick Actions */}
          <View style={homeStyles.sectionContainer}>
            <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
            <View style={homeStyles.quickActionsContainer}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  style={[
                    homeStyles.quickActionButton,
                    { backgroundColor: action.color + "15" },
                  ]}
                  onPress={() => handleQuickAction(action.action)}
                >
                  <View
                    style={[
                      homeStyles.quickActionIcon,
                      { backgroundColor: action.color },
                    ]}
                  >
                    <Icon name={action.icon} size={20} color="#fff" />
                  </View>
                  <Text style={homeStyles.quickActionText}>{action.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Purchased Courses */}
          <View style={homeStyles.sectionContainer}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Your Courses</Text>
              <Pressable onPress={() => navigation.navigate("CoursesScreen")}>
                <Text style={homeStyles.viewAllText}>View All →</Text>
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
                  onPress={() =>
                    navigation.navigate("LessonScreen", {
                      courseId: course.id,
                      lessonId: "l1",
                    })
                  }
                >
                  <Shadow
                    distance={8}
                    startColor="#00000015"
                    finalColor="#00000005"
                  >
                    <View style={homeStyles.courseCardInner}>
                      <Image
                        source={course.image}
                        style={homeStyles.courseImage}
                      />
                      <View style={homeStyles.courseOverlay}>
                        <View style={homeStyles.courseLevelBadge}>
                          <Text style={homeStyles.courseLevelText}>
                            {course.level}
                          </Text>
                        </View>
                        <Icon
                          name="play-circle-outline"
                          size={32}
                          color="#fff"
                        />
                      </View>
                      <View style={homeStyles.courseInfo}>
                        <Text style={homeStyles.courseTitle} numberOfLines={2}>
                          {course.title}
                        </Text>
                        <View style={homeStyles.courseMetaContainer}>
                          <Icon name="person" size={14} color="#6B7280" />
                          <Text style={homeStyles.courseInstructor}>
                            {course.instructor}
                          </Text>
                        </View>
                        <View style={homeStyles.courseDurationContainer}>
                          <Icon name="access-time" size={14} color="#6B7280" />
                          <Text style={homeStyles.courseDuration}>
                            {course.duration}
                          </Text>
                        </View>
                        <View style={homeStyles.progressContainer}>
                          <View style={homeStyles.progressBar}>
                            <View
                              style={[
                                homeStyles.progressFill,
                                { width: `${course.progress}%` },
                              ]}
                            />
                          </View>
                          <Text style={homeStyles.progressText}>
                            {course.progress}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Shadow>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Recent Projects */}
          <View style={homeStyles.sectionContainer}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>Recent Projects</Text>
              <Pressable onPress={() => navigation.navigate("GalleryScreen")}>
                <Text style={homeStyles.viewAllText}>View All →</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={homeStyles.coursesContainer}
            >
              {recentProjects.map((project) => (
                <Pressable
                  key={project.id}
                  style={homeStyles.projectCard}
                  onPress={() =>
                    navigation.navigate("DrawingScreen", {
                      projectId: project.id,
                    })
                  }
                >
                  <Shadow
                    distance={8}
                    startColor="#00000015"
                    finalColor="#00000005"
                  >
                    <View style={homeStyles.projectCardInner}>
                      <Image
                        source={project.preview}
                        style={homeStyles.projectPreview}
                      />
                      <View style={homeStyles.courseOverlay}>
                        <View style={homeStyles.courseLevelBadge}>
                          <Text style={homeStyles.courseLevelText}>
                            {project.category}
                          </Text>
                        </View>
                        <Icon name="more-vert" size={28} color="#fff" />
                      </View>
                      <View style={homeStyles.projectFooter}>
                        <Text style={homeStyles.projectTitle} numberOfLines={2}>
                          {project.title}
                        </Text>
                        <View style={homeStyles.projectTimeContainer}>
                          <Icon name="access-time" size={14} color="#6B7280" />
                          <Text style={homeStyles.projectDate}>
                            {project.date}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Shadow>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
