import { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Image } from "expo-image";
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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const navigation = useReactNavigation();
  const isDesigner = String(user?.role || "").toUpperCase() === "DESIGNER";

  const handleLogout = async () => {
    await logout();
    toggleSidebar(false);
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

    toggleSidebar();
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

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [user?.hasActiveSubscription]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  const designerMainItems = [
    { icon: "dashboard", label: "Dashboard", id: "designerDashboard", gradient: ["#3B82F6", "#2563EB"] },
    { icon: "inventory", label: "Product Management", id: "products", gradient: ["#8B5CF6", "#7C3AED"] },
    { icon: "analytics", label: "Analytics & Reports", id: "analytics", gradient: ["#10B981", "#059669"] },
  ];

  const designerWorkspaceItems = [
    { icon: "upload", label: "Resource Upload", id: "quickUpload", gradient: ["#F59E0B", "#D97706"] },
    { icon: "photo-library", label: "Gallery", id: "gallery", gradient: ["#EC4899", "#DB2777"] },
  ];

  const designerAccountItems = [
    { icon: "account-balance-wallet", label: "Designer Wallet", id: "wallet", gradient: ["#14B8A6", "#0D9488"] },
    { icon: "person", label: "Profile", id: "profile", gradient: ["#6366F1", "#4F46E5"] },
  ];

  const mainItems = [
    { icon: "home", label: "Home", id: "home", gradient: ["#3B82F6", "#2563EB"] },
    { icon: "school", label: "Courses", id: "courses", gradient: ["#8B5CF6", "#7C3AED"] },
    { icon: "menu-book", label: "My Courses", id: "myCourses", gradient: ["#10B981", "#059669"] },
    { icon: "photo-library", label: "Gallery", id: "gallery", gradient: ["#EC4899", "#DB2777"] },
  ];

  const storeItems = [
    { icon: "store", label: "Resource Store", id: "store", gradient: ["#F59E0B", "#D97706"] },
    { icon: "receipt-long", label: "Order History", id: "orderHistory", gradient: ["#14B8A6", "#0D9488"] },
  ];

  const blogItems = [
    { icon: "dynamic-feed", label: "All Blogs", id: "blogAll", gradient: ["#6366F1", "#4F46E5"] },
    { icon: "person-outline", label: "My Blogs", id: "blogMine", gradient: ["#EF4444", "#DC2626"] },
  ];

  const accountNavItems = [
    { icon: "person", label: "Profile", id: "profile", gradient: ["#6366F1", "#4F46E5"] },
    { icon: "settings", label: "Settings", id: "settings", gradient: ["#64748B", "#475569"] },
  ];

  const renderNavItem = (item) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginHorizontal: 12,
          marginVertical: 4,
          borderRadius: 12,
          backgroundColor: activeNavItem === item.id ? "#F1F5F9" : "transparent",
        },
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      ]}
      onPress={() => handleNavPress(item.id)}
    >
      {activeNavItem === item.id ? (
        <LinearGradient
          colors={item.gradient || ["#3B82F6", "#2563EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: item.gradient?.[0] || "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Icon name={item.icon} size={22} color="#FFFFFF" />
        </LinearGradient>
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#F8FAFC",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name={item.icon} size={22} color="#64748B" />
        </View>
      )}
      <Text
        style={{
          marginLeft: 12,
          fontSize: 15,
          fontWeight: activeNavItem === item.id ? "800" : "600",
          color: activeNavItem === item.id ? "#000000ff" : "#5f6266ff",
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  );

  const renderSectionTitle = (title) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          width: 3,
          height: 14,
          borderRadius: 2,
          backgroundColor: "#3B82F6",
          marginRight: 8,
        }}
      />

      <Text
        style={{
          fontSize: 12,
          fontWeight: "900",
          color: "#475569",
          letterSpacing: 1.2,
        }}
      >
        {title}
      </Text>
    </View>
  );


  return (
    <>
      {sidebarOpen && (
        <Reanimated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 998,
            },
            overlayStyle,
          ]}
          onTouchStart={toggleSidebar}
        />
      )}

      <Reanimated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 300,
            backgroundColor: "#FFFFFF",
            zIndex: 999,
            shadowColor: "#000",
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          },
          drawerStyle,
        ]}
      >
        {/* Header với Gradient Background */}
        <LinearGradient
          colors={["#084F8C", "#0e6ec8ff", "#639dfaff"]}

          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
          }}
        >

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
                }}
                style={{ width: 36, height: 36, contentFit: "contain" }}
              />
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 22,
                  fontFamily: "Pacifico-Regular",
                  color: "#FFFFFF",
                }}
              >
                SketchNote
              </Text>
            </View>
            <Pressable
              onPress={toggleSidebar}
              style={({ pressed }) => [
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                },
                pressed && { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              ]}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* User Info */}
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
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
                    width: 106,
                    height: 106,
                    borderRadius: 53,
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
                        }),
                      },
                      { scale: pulseAnim },
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
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: "#FFFFFF",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 4,
                  borderColor: "#FFFFFF",
                }}
              >
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{ width: 82, height: 82, borderRadius: 41 }}
                  />
                ) : (
                  <Icon name="account-circle" size={64} color="#3B82F6" />
                )}
              </View>
            </View>

            <Text
              style={{
                marginTop: 12,
                fontSize: 18,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {user
                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                "User"
                : "Guest"}
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {user?.email ?? "guest@example.com"}
            </Text>

            {user?.role && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                    }}
                  >
                    {user.role}
                  </Text>
                </View>
                {user?.hasActiveSubscription && (
                  <LinearGradient
                    colors={["#F59E0B", "#EF4444"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: "#FFFFFF",
                        textTransform: "uppercase",
                      }}
                    >
                      ⭐ PRO
                    </Text>
                  </LinearGradient>
                )}
              </View>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          showsVerticalScrollIndicator={false}
        >
          {isDesigner ? (
            <>
              {renderSectionTitle("DESIGNER")}
              {designerMainItems.map(renderNavItem)}

              {renderSectionTitle("WORKSPACE")}
              {designerWorkspaceItems.map(renderNavItem)}

              {renderSectionTitle("ACCOUNT")}
              {designerAccountItems.map(renderNavItem)}

              {renderSectionTitle("MAIN")}
              {mainItems.slice(0, 3).map(renderNavItem)}

              {renderSectionTitle("STORE")}
              {storeItems.map(renderNavItem)}

              {renderSectionTitle("BLOG")}
              {blogItems.map(renderNavItem)}

              {renderSectionTitle("SETTINGS")}
              {accountNavItems
                .filter((i) => i.id !== "profile")
                .map(renderNavItem)}
            </>
          ) : (
            <>
              {renderSectionTitle("MAIN")}
              {mainItems.map(renderNavItem)}

              {renderSectionTitle("STORE")}
              {storeItems.map(renderNavItem)}

              {renderSectionTitle("BLOG")}
              {blogItems.map(renderNavItem)}

              {renderSectionTitle("SETTINGS")}
              {accountNavItems
                .filter((i) => i.id !== "profile")
                .map(renderNavItem)}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: "#F1F5F9",
            backgroundColor: "#FAFAFA",
          }}
        >
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 12,
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: "#FCA5A5",
              },
              pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#DC2626" />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 15,
                fontWeight: "600",
                color: "#DC2626",
              }}
            >
              Sign Out
            </Text>
          </Pressable>
          <Text
            style={{
              marginTop: 12,
              fontSize: 11,
              color: "#94A3B8",
              textAlign: "center",
            }}
          >
            Version 1.0.0
          </Text>
        </View>
      </Reanimated.View>
    </>
  );
}