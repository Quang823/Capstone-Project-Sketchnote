import { useContext } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { drawerStyles } from "./GlobalSidebar.styles";
import {
  useNavigation as useReactNavigation,
  CommonActions,
} from "@react-navigation/native";
import { useNavigation } from "../../context/NavigationContext";
import { AuthContext } from "../../context/AuthContext";

export default function GlobalSidebar() {
  const {
    sidebarOpen,
    activeNavItem,
    setActiveNavItem,
    toggleSidebar,
    sidebarAnimation,
    overlayAnimation,
  } = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const navigation = useReactNavigation();

  const handleLogout = async () => {
    await logout(); // reset user + remove token
    toggleSidebar(false); // đóng sidebar nếu đang mở
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
    );
  };

  const handleNavPress = (itemId) => {
    setActiveNavItem(itemId);

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

    toggleSidebar(); // đóng sidebar sau navigation
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarAnimation.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  const mainNavItems = [
    { icon: "home", label: "Home", id: "home" },
    { icon: "school", label: "Courses", id: "courses" },
    { icon: "add-circle-outline", label: "Create New", id: "create" },
    { icon: "collections", label: "Gallery", id: "gallery" },
  ];

  const shopNavItems = [
    { icon: "store", label: "Resource Store", id: "store" },
    { icon: "receipt-long", label: "Order History", id: "orderHistory" },
  ];

  const blogNavItems = [
    { icon: "article", label: "All Blogs", id: "blogAll" },
    { icon: "person-outline", label: "My Blogs", id: "blogMine" },
  ];

  const accountNavItems = [
    { icon: "person", label: "Profile", id: "profile" },
    { icon: "settings", label: "Settings", id: "settings" },
  ];

  return (
    <>
      {sidebarOpen && (
        <Reanimated.View
          style={[drawerStyles.overlay, overlayStyle]}
          onTouchStart={toggleSidebar}
        />
      )}

      <Reanimated.View style={[drawerStyles.drawer, drawerStyle]}>
        {/* Header */}
        <View style={drawerStyles.drawerHeader}>
          <View style={drawerStyles.logoContainer}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
              }}
              style={{ width: 36, height: 36, resizeMode: "contain" }}
            />
            <Text style={drawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={toggleSidebar} style={drawerStyles.closeButton}>
            <Icon name="close" size={24} color="#64748B" />
          </Pressable>
        </View>

        {/* User Info */}
        <View style={drawerStyles.userInfo}>
          <View style={drawerStyles.avatar}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={drawerStyles.avatarImage}
              />
            ) : (
              <Icon name="account-circle" size={64} color="#3B82F6" />
            )}
          </View>

          <Text style={drawerStyles.userName}>
            {user
              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                "User"
              : "Guest"}
          </Text>

          <Text style={drawerStyles.userEmail}>
            {user?.email ?? "guest@example.com"}
          </Text>

          {user?.role && (
            <View style={drawerStyles.roleBadge}>
              <Text style={drawerStyles.roleText}>{user.role}</Text>
            </View>
          )}
        </View>

        {/* Navigation Items */}
        <ScrollView
          style={drawerStyles.drawerItems}
          showsVerticalScrollIndicator={false}
        >
          <Text style={drawerStyles.sectionTitle}>MAIN</Text>
          {mainNavItems.map((item) => (
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

          {/* Shop Section */}
          <Text style={drawerStyles.sectionTitle}>SHOP</Text>
          {shopNavItems.map((item) => (
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

          {/* Blog Section */}
          <Text style={drawerStyles.sectionTitle}>BLOG</Text>
          {blogNavItems.map((item) => (
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
          <Text style={drawerStyles.sectionTitle}>ACCOUNT</Text>
          {accountNavItems.map((item) => (
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
              pressed && { opacity: 0.7 },
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
