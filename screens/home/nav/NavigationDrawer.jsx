import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TouchableOpacity, Image, Platform } from "react-native";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";
import { drawerStyles, sidebarStyles } from "./NavigationDrawer.styles";
import { useNavigation } from "@react-navigation/native";
import { getUserFromToken } from "../../../utils/AuthUtils";
import { authService } from "../../../service/authService";

// Sidebar Navigation Component - hiển thị NavigationDrawer như sidebar (luôn mở)
export function SidebarNavigation({ activeNavItem, onNavPress }) {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  
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

  return (
    <View style={sidebarStyles.sidebar}>
      <View style={sidebarStyles.logoContainer}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
          }}
          style={{ width: 32, height: 32, resizeMode: "contain" }}
        />
        <Text style={sidebarStyles.logo}>SketchNote</Text>
      </View>

      <View style={sidebarStyles.menuContainer}>
        <ScrollView 
          style={sidebarStyles.menuScroll}
          showsVerticalScrollIndicator={false}
        >
        {/* Sidebar Menu Items */}
        {[
          { icon: "description", label: "Documents", id: "documents" },
          { icon: "star", label: "Favorites", id: "favorites" },
          { icon: "share", label: "Shared", id: "shared" },
          { icon: "store", label: "Marketplace", id: "marketplace" },
          { icon: "delete", label: "Trash", id: "trash" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              sidebarStyles.menuItem,
              activeNavItem === item.id && sidebarStyles.menuItemActive,
            ]}
            onPress={() => onNavPress(item.id)}
          >
            <Icon
              name={item.icon}
              size={22}
              color={activeNavItem === item.id ? "#4F46E5" : "#64748B"}
            />
            <Text
              style={[
                sidebarStyles.menuLabel,
                activeNavItem === item.id && sidebarStyles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={sidebarStyles.divider} />

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
          <TouchableOpacity
            key={item.id}
            style={[
              sidebarStyles.menuItem,
              activeNavItem === item.id && sidebarStyles.menuItemActive,
            ]}
            onPress={() => onNavPress(item.id)}
          >
            <Icon
              name={item.icon}
              size={22}
              color={activeNavItem === item.id ? "#4F46E5" : "#64748B"}
            />
            <Text
              style={[
                sidebarStyles.menuLabel,
                activeNavItem === item.id && sidebarStyles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={sidebarStyles.divider} />

        {/* Profile & Settings */}
        {[
          { icon: "person", label: "Hồ sơ", id: "profile" },
          { icon: "settings", label: "Cài đặt", id: "settings" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              sidebarStyles.menuItem,
              activeNavItem === item.id && sidebarStyles.menuItemActive,
            ]}
            onPress={() => onNavPress(item.id)}
          >
            <Icon
              name={item.icon}
              size={22}
              color={activeNavItem === item.id ? "#4F46E5" : "#64748B"}
            />
            <Text
              style={[
                sidebarStyles.menuLabel,
                activeNavItem === item.id && sidebarStyles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={sidebarStyles.footer}>
        <TouchableOpacity style={sidebarStyles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={sidebarStyles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
        <Text style={sidebarStyles.versionText}>Phiên bản 1.0.0</Text>
      </View>
    </View>
  );
}

export default function NavigationDrawer({
  drawerOpen,
  drawerAnimation,
  overlayAnimation,
  activeNavItem,
  onToggleDrawer,
  onNavPress,
}) {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
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

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drawerAnimation.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayAnimation.value,
  }));

  return (
    <>
      {/* Overlay khi drawer mở */}
      {drawerOpen && (
        <Reanimated.View
          style={[drawerStyles.overlay, overlayStyle]}
          onTouchStart={onToggleDrawer}
        />
      )}

      {/* Navigation Drawer */}
      <Reanimated.View
        style={[drawerStyles.drawer, drawerStyle]}
      >
        {/* Header */}
        <View style={drawerStyles.drawerHeader}>
          <View style={drawerStyles.logoContainer}>
            <Icon name="palette" size={28} color="#4F46E5" />
            <Text style={drawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={onToggleDrawer} style={drawerStyles.closeButton}>
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
          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "documents" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("documents")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "documents" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="description"
                size={20}
                color={activeNavItem === "documents" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "documents" && drawerStyles.drawerTextActive,
              ]}
            >
              Documents
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "favorites" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("favorites")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "favorites" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="star"
                size={20}
                color={activeNavItem === "favorites" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "favorites" && drawerStyles.drawerTextActive,
              ]}
            >
              Favorites
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "shared" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("shared")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "shared" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="share"
                size={20}
                color={activeNavItem === "shared" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "shared" && drawerStyles.drawerTextActive,
              ]}
            >
              Shared
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "marketplace" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("marketplace")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "marketplace" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="store"
                size={20}
                color={activeNavItem === "marketplace" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "marketplace" && drawerStyles.drawerTextActive,
              ]}
            >
              Marketplace
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "trash" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("trash")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "trash" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="delete"
                size={20}
                color={activeNavItem === "trash" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "trash" && drawerStyles.drawerTextActive,
              ]}
            >
              Trash
            </Text>
          </Pressable>

          <View style={drawerStyles.divider} />

          {/* Main Navigation Items */}
          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "home" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("home")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "home" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="home"
                size={20}
                color={activeNavItem === "home" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "home" && drawerStyles.drawerTextActive,
              ]}
            >
              Trang chủ
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "courses" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("courses")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "courses" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="school"
                size={20}
                color={activeNavItem === "courses" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "courses" && drawerStyles.drawerTextActive,
              ]}
            >
              Khóa học
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "create" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("create")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "create" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="add-circle"
                size={20}
                color={activeNavItem === "create" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "create" && drawerStyles.drawerTextActive,
              ]}
            >
              Tạo mới
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "gallery" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("gallery")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "gallery" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="photo-library"
                size={20}
                color={activeNavItem === "gallery" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "gallery" && drawerStyles.drawerTextActive,
              ]}
            >
              Thư viện
            </Text>
          </Pressable>

          {/* Store Section */}
          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "store" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("store")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "store" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="store"
                size={20}
                color={activeNavItem === "store" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "store" && drawerStyles.drawerTextActive,
              ]}
            >
              Cửa hàng Resource
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "orderHistory" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("orderHistory")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "orderHistory" &&
                  drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="receipt-long"
                size={20}
                color={activeNavItem === "orderHistory" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "orderHistory" &&
                  drawerStyles.drawerTextActive,
              ]}
            >
              Lịch sử đơn hàng
            </Text>
          </Pressable>

          {/* New: Blogs */}
          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "blogAll" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("blogAll")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "blogAll" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="dynamic-feed"
                size={20}
                color={activeNavItem === "blogAll" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "blogAll" && drawerStyles.drawerTextActive,
              ]}
            >
              Xem tất cả blog
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "blogMine" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("blogMine")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "blogMine" &&
                  drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="person-outline"
                size={20}
                color={activeNavItem === "blogMine" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "blogMine" && drawerStyles.drawerTextActive,
              ]}
            >
              Blog của tôi
            </Text>
          </Pressable>

          <View style={drawerStyles.divider} />

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "profile" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("profile")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "profile" && drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="person"
                size={20}
                color={activeNavItem === "profile" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "profile" && drawerStyles.drawerTextActive,
              ]}
            >
              Hồ sơ
            </Text>
          </Pressable>

          <Pressable
            style={[
              drawerStyles.drawerItem,
              activeNavItem === "settings" && drawerStyles.drawerItemActive,
            ]}
            onPress={() => onNavPress("settings")}
          >
            <View
              style={[
                drawerStyles.iconContainer,
                activeNavItem === "settings" &&
                  drawerStyles.iconContainerActive,
              ]}
            >
              <Icon
                name="settings"
                size={20}
                color={activeNavItem === "settings" ? "#FFFFFF" : "#6B7280"}
              />
            </View>
            <Text
              style={[
                drawerStyles.drawerText,
                activeNavItem === "settings" && drawerStyles.drawerTextActive,
              ]}
            >
              Cài đặt
            </Text>
          </Pressable>
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
