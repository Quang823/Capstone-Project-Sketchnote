import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { drawerStyles } from "../../screens/home/nav/NavigationDrawer.styles";
import { useNavigation as useReactNavigation } from "@react-navigation/native";
import { useNavigation } from "../../context/NavigationContext";
import { getUserFromToken } from "../../utils/AuthUtils";
import { authService } from "../../service/authService";

// Global Sidebar Component - can be called from any page
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
      {/* Overlay when drawer is open */}
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
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
            <Text style={drawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={toggleSidebar} style={drawerStyles.closeButton}>
            <Icon name="close" size={22} color="#64748B" />
          </Pressable>
        </View>

        {/* User Info */}
        <View style={drawerStyles.userInfo}>
          <View style={drawerStyles.avatar}>
            <Icon name="account-circle" size={60} color="#3B82F6" />
          </View>
          <Text style={drawerStyles.userName}>
            {user?.name || "User"}
          </Text>
          <Text style={drawerStyles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>

        {/* Navigation Items */}
        <ScrollView 
          style={drawerStyles.drawerItems}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Access Menu */}
          {[
            { icon: "description", label: "Documents", id: "documents" },
            { icon: "star", label: "Favorites", id: "favorites" },
            { icon: "share", label: "Shared", id: "shared" },
            { icon: "shopping-bag", label: "Marketplace", id: "marketplace" },
            { icon: "delete-outline", label: "Trash", id: "trash" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
                pressed && { opacity: 0.7 },
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
                  size={22}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#64748B"}
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

          {/* Main Navigation */}
          {[
            { icon: "home", label: "Home", id: "home" },
            { icon: "school", label: "Courses", id: "courses" },
            { icon: "add-circle-outline", label: "Create New", id: "create" },
            { icon: "collections", label: "Gallery", id: "gallery" },
            { icon: "store", label: "Resource Store", id: "store" },
            { icon: "receipt-long", label: "Order History", id: "orderHistory" },
            { icon: "article", label: "All Blogs", id: "blogAll" },
            { icon: "person-outline", label: "My Blogs", id: "blogMine" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
                pressed && { opacity: 0.7 },
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
                  size={22}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#64748B"}
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

          {/* Account Settings */}
          {[
            { icon: "person", label: "Profile", id: "profile" },
            { icon: "settings", label: "Settings", id: "settings" },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                drawerStyles.drawerItem,
                activeNavItem === item.id && drawerStyles.drawerItemActive,
                pressed && { opacity: 0.7 },
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
                  size={22}
                  color={activeNavItem === item.id ? "#FFFFFF" : "#64748B"}
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
          <Pressable 
            style={({ pressed }) => [
              drawerStyles.logoutButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#DC2626" />
            <Text style={drawerStyles.logoutText}>Sign Out</Text>
          </Pressable>
          <Text style={drawerStyles.versionText}>Version 1.0.0</Text>
        </View>
      </Reanimated.View>
    </>
  );
}