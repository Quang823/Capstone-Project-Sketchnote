import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Animated, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { designerDrawerStyles } from "./DesignerNavigationDrawer.styles";
import { useNavigation } from "@react-navigation/native";
import { getUserFromToken } from "../../../utils/AuthUtils";
import { authService } from "../../../service/authService";

export default function DesignerNavigationDrawer({
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

  const mainNavItems = [
    { icon: "dashboard", label: "Bảng điều khiển", id: "home" },
    { icon: "inventory", label: "Quản lý sản phẩm", id: "products" },
    { icon: "analytics", label: "Thống kê & Báo cáo", id: "analytics" },
  ];

  const workspaceNavItems = [
    { icon: "upload", label: "Đăng nhanh template", id: "quickUpload" },
    { icon: "create", label: "Tạo mới", id: "create" },
    { icon: "photo-library", label: "Thư viện", id: "gallery" },
  ];

  const accountNavItems = [
    { icon: "account-balance-wallet", label: "Ví Designer", id: "wallet" },
    { icon: "person", label: "Hồ sơ", id: "profile" },
    { icon: "settings", label: "Cài đặt", id: "settings" },
  ];

  const renderNavItems = (items) =>
    items.map((item) => {
      const isActive = activeNavItem === item.id;
      return (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            designerDrawerStyles.drawerItem,
            isActive && designerDrawerStyles.drawerItemActive,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => onNavPress(item.id)}
        >
          <View
            style={[
              designerDrawerStyles.iconContainer,
              isActive && designerDrawerStyles.iconContainerActive,
            ]}
          >
            <Icon
              name={item.icon}
              size={20}
              color={isActive ? "#4F46E5" : "#6B7280"}
            />
          </View>
          <Text
            style={[
              designerDrawerStyles.drawerText,
              isActive && designerDrawerStyles.drawerTextActive,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      );
    });

  const renderNavSection = (title, items, isLastSection = false) => (
    <View key={title} style={designerDrawerStyles.sectionWrapper}>
      <Text style={designerDrawerStyles.sectionTitle}>{title}</Text>
      {renderNavItems(items)}
      {!isLastSection && <View style={designerDrawerStyles.divider} />}
    </View>
  );

  return (
    <>
      {/* Overlay khi drawer mở */}
      {drawerOpen && (
        <Animated.View 
          style={[
            designerDrawerStyles.overlay, 
            { opacity: overlayAnimation }
          ]}
          onTouchStart={onToggleDrawer}
        />
      )}
      
      {/* Navigation Drawer */}
      <Animated.View 
        style={[
          designerDrawerStyles.drawer, 
          { transform: [{ translateX: drawerAnimation }] }
        ]}
      >
        {/* Header */}
        <View style={designerDrawerStyles.drawerHeader}>
          <View style={designerDrawerStyles.logoContainer}>
            <Icon name="palette" size={28} color="#4F46E5" />
            <Text style={designerDrawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={onToggleDrawer} style={designerDrawerStyles.closeButton}>
            <Icon name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        
        {/* User Info */}
        <View style={designerDrawerStyles.userInfo}>
          <View style={designerDrawerStyles.avatar}>
            <Icon name="account-circle" size={48} color="#4F46E5" />
          </View>
          <Text style={designerDrawerStyles.userName}>{user?.name || "Designer"}</Text>
          <Text style={designerDrawerStyles.userEmail}>{user?.email || "designer@example.com"}</Text>
          <View style={designerDrawerStyles.roleBadge}>
            <Text style={designerDrawerStyles.roleText}>DESIGNER</Text>
          </View>
        </View>
        
        {/* Navigation Items */}
        <ScrollView style={designerDrawerStyles.drawerItems}>
          {renderNavSection("MAIN", mainNavItems)}
          {renderNavSection("WORKSPACE", workspaceNavItems)}
          {renderNavSection("ACCOUNT", accountNavItems, true)}
        </ScrollView>
        
        {/* Footer */}
        <View style={designerDrawerStyles.drawerFooter}>
          <Pressable style={designerDrawerStyles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={designerDrawerStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
          
          <Text style={designerDrawerStyles.versionText}>Designer v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
}
