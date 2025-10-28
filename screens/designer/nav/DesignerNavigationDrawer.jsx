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
  onNavPress 
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
          {/* Dashboard */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'home' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('home')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'home' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="dashboard" 
                size={20} 
                color={activeNavItem === 'home' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'home' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Dashboard
            </Text>
          </Pressable>

          {/* Products Management */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'products' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('products')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'products' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="inventory" 
                size={20} 
                color={activeNavItem === 'products' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'products' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Quản lý sản phẩm
            </Text>
          </Pressable>

          {/* Analytics */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'analytics' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('analytics')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'analytics' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="analytics" 
                size={20} 
                color={activeNavItem === 'analytics' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'analytics' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Thống kê & Báo cáo
            </Text>
          </Pressable>

          {/* Quick Upload */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'quickUpload' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('quickUpload')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'quickUpload' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="upload" 
                size={20} 
                color={activeNavItem === 'quickUpload' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'quickUpload' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Đăng nhanh template
            </Text>
          </Pressable>

          {/* Create New */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'create' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('create')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'create' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="create" 
                size={20} 
                color={activeNavItem === 'create' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'create' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Tạo mới
            </Text>
          </Pressable>

          {/* Gallery */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'gallery' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('gallery')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'gallery' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="photo-library" 
                size={20} 
                color={activeNavItem === 'gallery' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'gallery' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Thư viện
            </Text>
          </Pressable>

          <View style={designerDrawerStyles.divider} />

          {/* Profile */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'profile' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('profile')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'profile' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="person" 
                size={20} 
                color={activeNavItem === 'profile' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'profile' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Hồ sơ
            </Text>
          </Pressable>
          
          {/* Settings */}
          <Pressable 
            style={[
              designerDrawerStyles.drawerItem, 
              activeNavItem === 'settings' && designerDrawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('settings')}
          >
            <View style={[
              designerDrawerStyles.iconContainer,
              activeNavItem === 'settings' && designerDrawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="settings" 
                size={20} 
                color={activeNavItem === 'settings' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                designerDrawerStyles.drawerText,
                activeNavItem === 'settings' && designerDrawerStyles.drawerTextActive
              ]}
            >
              Cài đặt
            </Text>
          </Pressable>
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
