import React, { useContext } from "react";
import { View, Text, Pressable, Animated, ScrollView, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { designerDrawerStyles } from "./DesignerNavigationDrawer.styles";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../../context/AuthContext";

export default function DesignerNavigationDrawer({
  drawerOpen,
  drawerAnimation,
  overlayAnimation,
  activeNavItem,
  onToggleDrawer,
  onNavPress,
}) {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  const displayName = user
    ? user.name || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Designer"
    : "Guest";

  const handleLogout = async () => {
    await logout();
    onToggleDrawer?.();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Login" }] })
    );
  };

  const mainNavItems = [
    { icon: "dashboard", label: "Dashboard", id: "home" },
    { icon: "inventory", label: "Product Management", id: "products" },
    { icon: "analytics", label: "Analytics & Reports", id: "analytics" },
  ];

  const workspaceNavItems = [
    { icon: "upload", label: "Quick Template Upload", id: "quickUpload" },
    { icon: "create", label: "Create New", id: "create" },
    { icon: "photo-library", label: "Library", id: "gallery" },
  ];

  const accountNavItems = [
    { icon: "account-balance-wallet", label: "Designer Wallet", id: "wallet" },
    { icon: "person", label: "Profile", id: "profile" },
    { icon: "settings", label: "Settings", id: "settings" },
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
              color={isActive ? "#FFFFFF" : "#64748B"}
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
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1762576688/gll0d20tw2f9mbhi3tzi.png",
              }}
              style={designerDrawerStyles.logoImage}
            />
            <Text style={designerDrawerStyles.drawerTitle}>SketchNote</Text>
          </View>
          <Pressable onPress={onToggleDrawer} style={designerDrawerStyles.closeButton}>
            <Icon name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* User Info */}
        <View style={designerDrawerStyles.userInfo}>
          <View style={designerDrawerStyles.avatar}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={designerDrawerStyles.avatarImage} />
            ) : (
              <Icon name="account-circle" size={56} color="#4F46E5" />
            )}
          </View>
          <Text style={designerDrawerStyles.userName}>{displayName}</Text>
          <Text style={designerDrawerStyles.userEmail}>{user?.email || "designer@example.com"}</Text>
          {(user?.role || user) && (
            <View style={designerDrawerStyles.roleBadge}>
              <Text style={designerDrawerStyles.roleText}>
                {(user?.role || "Designer").toString().toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        {/* Navigation Items */}
        <ScrollView style={designerDrawerStyles.drawerItems} showsVerticalScrollIndicator={false}>
          {renderNavSection("MAIN", mainNavItems)}
          {renderNavSection("WORKSPACE", workspaceNavItems)}
          {renderNavSection("ACCOUNT", accountNavItems, true)}
        </ScrollView>
        
        {/* Footer */}
        <View style={designerDrawerStyles.drawerFooter}>
          <Pressable style={designerDrawerStyles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={designerDrawerStyles.logoutText}>Sign Out</Text>
          </Pressable>
          
          <Text style={designerDrawerStyles.versionText}>Designer v1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
}
