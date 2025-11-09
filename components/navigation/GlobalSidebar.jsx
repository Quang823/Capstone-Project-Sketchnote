import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image } from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { drawerStyles } from "../../screens/home/nav/NavigationDrawer.styles";
import { useNavigation as useReactNavigation } from "@react-navigation/native";
import { useNavigation } from "../../context/NavigationContext";
import { getUserFromToken } from "../../utils/AuthUtils";
import { authService } from "../../service/authService";

// Global Sidebar Component - có thể gọi từ bất kỳ trang nào
export default function GlobalSidebar() {
  const {
    sidebarOpen,
    activeNavItem,
    setActiveNavItem,
    toggleSidebar,
    sidebarAnimation,
    overlayAnimation,
  } = useNavigation();

  const [user, setUser] = useState(null);
  const navigation = useReactNavigation();

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserFromToken();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    const ok = await authService.logout();
    if (ok) {
      navigation.replace("Login");
    }
  };

  const handleNavPress = (itemId) => {
    setActiveNavItem(itemId);
    
    // Navigate to different screens based on itemId
    switch (itemId) {
      case "home":
        navigation.navigate("Home");
        break;
      case "courses":
        navigation.navigate("Courses");
        break;
      case "create":
        navigation.navigate("DrawingScreen");
        break;
      case "gallery":
        navigation.navigate("Gallery");
        break;
      case "store":
        navigation.navigate("ResourceStore");
        break;
      case "orderHistory":
        navigation.navigate("OrderHistory");
        break;
      case "blogAll":
        navigation.navigate("BlogList");
        break;
      case "blogMine":
        navigation.navigate("MyBlog");
        break;
      case "profile":
        navigation.navigate("Profile");
        break;
      case "settings":
        navigation.navigate("Settings");
        break;
      default:
        break;
    }
    
    // Close sidebar after navigation
    toggleSidebar();
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarAnimation.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  return (
    <>
      {/* Overlay khi drawer mở */}
      {sidebarOpen && (
        <Reanimated.View
          style={[drawerStyles.overlay, overlayStyle]}
          onTouchStart={toggleSidebar}
        />
      )}

      {/* Navigation Drawer */}
      <Reanimated.View style={[drawerStyles.drawer, drawerStyle]}>
        {/* Header */}
        <View style={drawerStyles.drawerHeader}>
          <View style={drawerStyles.logoContainer}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
              }}
              style={{ width: 28, height: 28, resizeMode: "contain" }}
            />
            <Text style={drawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={toggleSidebar} style={drawerStyles.closeButton}>
            <Icon name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* User Info */}
        <View style={drawerStyles.userInfo}>
          <View style={drawerStyles.avatar}>
            <Icon name="account-circle" size={48} color="#4F46E5" />
          </View>
          <Text style={drawerStyles.userName}>
            {user?.name || "Người dùng"}
          </Text>
          <Text style={drawerStyles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>

        {/* Navigation Items */}
        <ScrollView style={drawerStyles.drawerItems}>
          {/* Sidebar Menu Items */}
          {[
            { icon: "description", label: "Documents", id: "documents" },
            { icon: "star", label: "Favorites", id: "favorites" },
            { icon: "share", label: "Shared", id: "shared" },
            { icon: "store", label: "Marketplace", id: "marketplace" },
            { icon: "delete", label: "Trash", id: "trash" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={[
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
              ]}
              onPress={() => handleNavPress(item.id)}
            >
              <View
                style={[
                  drawerStyles.iconContainer,
                  activeNavItem === item.id && drawerStyles.iconContainerActive,
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#6B7280"}
                />
              </View>
              <Text
                style={[
                  drawerStyles.drawerText,
                  activeNavItem === item.id && drawerStyles.drawerTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={drawerStyles.divider} />

          {/* Main Navigation Items */}
          {[
            { icon: "home", label: "Trang chủ", id: "home" },
            { icon: "school", label: "Khóa học", id: "courses" },
            { icon: "add-circle", label: "Tạo mới", id: "create" },
            { icon: "photo-library", label: "Thư viện", id: "gallery" },
            { icon: "store", label: "Cửa hàng Resource", id: "store" },
            { icon: "receipt-long", label: "Lịch sử đơn hàng", id: "orderHistory" },
            { icon: "dynamic-feed", label: "Xem tất cả blog", id: "blogAll" },
            { icon: "person-outline", label: "Blog của tôi", id: "blogMine" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={[
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
              ]}
              onPress={() => handleNavPress(item.id)}
            >
              <View
                style={[
                  drawerStyles.iconContainer,
                  activeNavItem === item.id && drawerStyles.iconContainerActive,
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#6B7280"}
                />
              </View>
              <Text
                style={[
                  drawerStyles.drawerText,
                  activeNavItem === item.id && drawerStyles.drawerTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}

          <View style={drawerStyles.divider} />

          {/* Profile & Settings */}
          {[
            { icon: "person", label: "Hồ sơ", id: "profile" },
            { icon: "settings", label: "Cài đặt", id: "settings" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={[
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
              ]}
              onPress={() => handleNavPress(item.id)}
            >
              <View
                style={[
                  drawerStyles.iconContainer,
                  activeNavItem === item.id && drawerStyles.iconContainerActive,
                ]}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#6B7280"}
                />
              </View>
              <Text
                style={[
                  drawerStyles.drawerText,
                  activeNavItem === item.id && drawerStyles.drawerTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={drawerStyles.drawerFooter}>
          <Pressable style={drawerStyles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={drawerStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
          <Text style={drawerStyles.versionText}>Phiên bản 1.0.0</Text>
        </View>
      </Reanimated.View>
    </>
  );
}
