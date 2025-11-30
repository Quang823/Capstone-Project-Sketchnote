import { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const navigation = useReactNavigation();
  const isDesigner = String(user?.role || "").toUpperCase() === "DESIGNER";

  const handleLogout = async () => {
    await logout(); // reset user + remove token
    toggleSidebar(false); // đóng sidebar nếu đang mở
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "GuestHome" }] })
    );
  };

  const handleNavPress = (itemId) => {
    setActiveNavItem(itemId);

    if (isDesigner) {
      switch (itemId) {
        case "designerDashboard":
          navigation.navigate("DesignerDashboard");
          break;
        case "home":
          navigation.navigate("Home");
          break;
        case "products":
          navigation.navigate("DesignerProducts");
          break;
        case "analytics":
          navigation.navigate("DesignerAnalytics");
          break;
        case "quickUpload":
          navigation.navigate("DesignerQuickUpload");
          break;
        case "wallet":
          navigation.navigate("DesignerWallet");
          break;
        case "courses":
          navigation.navigate("CoursesScreen");
          break;
        case "myCourses":
          navigation.navigate("MyCourses");
          break;
        case "gallery":
          navigation.navigate("Gallery");
          break;
        case "profile":
          navigation.navigate("Profile");
          break;
        case "settings":
          navigation.navigate("Settings");
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
        default:
          break;
      }
    } else {
      switch (itemId) {
        case "home":
          navigation.navigate("Home");
          break;
        case "courses":
          navigation.navigate("CoursesScreen");
          break;
        case "myCourses":
          navigation.navigate("MyCourses");
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
    }

    toggleSidebar(); // đóng sidebar sau navigation
  };

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarAnimation.value }],
  }));

  useEffect(() => {
    if (user?.hasActiveSubscription) {
      rotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [user?.hasActiveSubscription]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  const blogNavItems = [
    { icon: "article", label: "All Blogs", id: "blogAll" },
    { icon: "person-outline", label: "My Blogs", id: "blogMine" },
  ];

  const accountNavItems = [
    { icon: "person", label: "Profile", id: "profile" },
    { icon: "settings", label: "Settings", id: "settings" },
  ];

  const designerMainItems = [
    { icon: "dashboard", label: "Dashboard", id: "designerDashboard" },
    { icon: "inventory", label: "Product Management", id: "products" },
    { icon: "analytics", label: "Analytics & Reports", id: "analytics" },
  ];

  const designerWorkspaceItems = [
    { icon: "upload", label: "Resource Upload", id: "quickUpload" },
    { icon: "photo-library", label: "Gallery", id: "gallery" },
  ];

  const designerAccountItems = [
    { icon: "account-balance-wallet", label: "Designer Wallet", id: "wallet" },
    { icon: "person", label: "Profile", id: "profile" },
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
          <View
            style={{
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user?.hasActiveSubscription && (
              <Animated.View
                style={{
                  position: "absolute",
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  top: -8,
                  left: -8,
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                }}
              >
                <LinearGradient
                  colors={["#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: "100%", height: "100%", borderRadius: 48 }}
                />
              </Animated.View>
            )}
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
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <View style={drawerStyles.roleBadge}>
                <Text style={drawerStyles.roleText}>{user.role}</Text>
              </View>
              {user?.hasActiveSubscription && (
                <View
                  style={[
                    drawerStyles.roleBadge,
                    { backgroundColor: "#F59E0B" },
                  ]}
                >
                  <Text style={drawerStyles.roleText}>PRO</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <ScrollView
          style={drawerStyles.drawerItems}
          showsVerticalScrollIndicator={false}
        >
          {isDesigner ? (
            <>
              <Text style={drawerStyles.sectionTitle}>DESIGNER</Text>
              {designerMainItems.map((item) => (
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>WORKSPACE</Text>
              {designerWorkspaceItems.map((item) => (
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>ACCOUNT</Text>
              {designerAccountItems.map((item) => (
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>MAIN</Text>
              {[
                { icon: "home", label: "Home", id: "home" },
                { icon: "school", label: "Courses", id: "courses" },
                { icon: "menu-book", label: "My Courses", id: "myCourses" },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>STORE</Text>
              {[
                { icon: "store", label: "Resource Store", id: "store" },
                {
                  icon: "receipt-long",
                  label: "Order History",
                  id: "orderHistory",
                },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>BLOG</Text>
              {[
                { icon: "dynamic-feed", label: "All Blogs", id: "blogAll" },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>SETTINGS</Text>
              {accountNavItems
                .filter((i) => i.id !== "profile")
                .map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      drawerStyles.drawerItem,
                      activeNavItem === item.id &&
                      drawerStyles.drawerItemActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleNavPress(item.id)}
                  >
                    <View
                      style={[
                        drawerStyles.iconContainer,
                        activeNavItem === item.id &&
                        drawerStyles.iconContainerActive,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={22}
                        color={
                          activeNavItem === item.id ? "#FFFFFF" : "#64748B"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        drawerStyles.drawerText,
                        activeNavItem === item.id &&
                        drawerStyles.drawerTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
            </>
          ) : (
            <>
              <Text style={drawerStyles.sectionTitle}>MAIN</Text>
              {[
                { icon: "home", label: "Home", id: "home" },
                { icon: "school", label: "Courses", id: "courses" },
                { icon: "menu-book", label: "My Courses", id: "myCourses" },
                { icon: "photo-library", label: "Gallery", id: "gallery" },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>STORE</Text>
              {[
                { icon: "store", label: "Resource Store", id: "store" },
                {
                  icon: "receipt-long",
                  label: "Order History",
                  id: "orderHistory",
                },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>BLOG</Text>
              {[
                { icon: "dynamic-feed", label: "All Blogs", id: "blogAll" },
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
                      activeNavItem === item.id &&
                      drawerStyles.iconContainerActive,
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
                      activeNavItem === item.id &&
                      drawerStyles.drawerTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}

              <View style={drawerStyles.divider} />

              <Text style={drawerStyles.sectionTitle}>SETTINGS</Text>
              {accountNavItems
                .filter((i) => i.id !== "profile")
                .map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      drawerStyles.drawerItem,
                      activeNavItem === item.id &&
                      drawerStyles.drawerItemActive,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => handleNavPress(item.id)}
                  >
                    <View
                      style={[
                        drawerStyles.iconContainer,
                        activeNavItem === item.id &&
                        drawerStyles.iconContainerActive,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={22}
                        color={
                          activeNavItem === item.id ? "#FFFFFF" : "#64748B"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        drawerStyles.drawerText,
                        activeNavItem === item.id &&
                        drawerStyles.drawerTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
            </>
          )}
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
