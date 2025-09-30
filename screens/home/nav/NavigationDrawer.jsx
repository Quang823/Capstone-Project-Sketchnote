import React from "react";
import { View, Text, Pressable, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { drawerStyles } from "./NavigationDrawer.styles";

export default function NavigationDrawer({ 
  drawerOpen, 
  drawerAnimation, 
  overlayAnimation, 
  activeNavItem, 
  onToggleDrawer, 
  onNavPress 
}) {
  return (
    <>
      {/* Overlay khi drawer mở */}
      {drawerOpen && (
        <Animated.View 
          style={[
            drawerStyles.overlay, 
            { opacity: overlayAnimation }
          ]}
          onTouchStart={onToggleDrawer}
        />
      )}
      
      {/* Navigation Drawer */}
      <Animated.View 
        style={[
          drawerStyles.drawer, 
          { transform: [{ translateX: drawerAnimation }] }
        ]}
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
          <Text style={drawerStyles.userName}>Người dùng</Text>
          <Text style={drawerStyles.userEmail}>user@example.com</Text>
        </View>
        
        {/* Navigation Items */}
        <View style={drawerStyles.drawerItems}>
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'home' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('home')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'home' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="home" 
                size={20} 
                color={activeNavItem === 'home' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'home' && drawerStyles.drawerTextActive
              ]}
            >
              Trang chủ
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'courses' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('courses')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'courses' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="school" 
                size={20} 
                color={activeNavItem === 'courses' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'courses' && drawerStyles.drawerTextActive
              ]}
            >
              Khóa học
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'create' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('create')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'create' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="add-circle" 
                size={20} 
                color={activeNavItem === 'create' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'create' && drawerStyles.drawerTextActive
              ]}
            >
              Tạo mới
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'gallery' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('gallery')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'gallery' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="photo-library" 
                size={20} 
                color={activeNavItem === 'gallery' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'gallery' && drawerStyles.drawerTextActive
              ]}
            >
              Thư viện
            </Text>
          </Pressable>

          {/* New: Blogs */}
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'blogAll' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('blogAll')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'blogAll' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="dynamic-feed" 
                size={20} 
                color={activeNavItem === 'blogAll' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'blogAll' && drawerStyles.drawerTextActive
              ]}
            >
              Xem tất cả blog
            </Text>
          </Pressable>

          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'blogMine' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('blogMine')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'blogMine' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="person-outline" 
                size={20} 
                color={activeNavItem === 'blogMine' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'blogMine' && drawerStyles.drawerTextActive
              ]}
            >
              Blog của tôi
            </Text>
          </Pressable>
          
          <View style={drawerStyles.divider} />
          
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'profile' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('profile')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'profile' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="person" 
                size={20} 
                color={activeNavItem === 'profile' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'profile' && drawerStyles.drawerTextActive
              ]}
            >
              Hồ sơ
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              drawerStyles.drawerItem, 
              activeNavItem === 'settings' && drawerStyles.drawerItemActive
            ]}
            onPress={() => onNavPress('settings')}
          >
            <View style={[
              drawerStyles.iconContainer,
              activeNavItem === 'settings' && drawerStyles.iconContainerActive
            ]}>
              <Icon 
                name="settings" 
                size={20} 
                color={activeNavItem === 'settings' ? "#FFFFFF" : "#6B7280"} 
              />
            </View>
            <Text 
              style={[
                drawerStyles.drawerText,
                activeNavItem === 'settings' && drawerStyles.drawerTextActive
              ]}
            >
              Cài đặt
            </Text>
          </Pressable>
        </View>
        
        {/* Footer */}
        <View style={drawerStyles.drawerFooter}>
          <Pressable style={drawerStyles.logoutButton}>
            <Icon name="logout" size={20} color="#EF4444" />
            <Text style={drawerStyles.logoutText}>Đăng xuất</Text>
          </Pressable>
          
          <Text style={drawerStyles.versionText}>Phiên bản 1.0.0</Text>
        </View>
      </Animated.View>
    </>
  );
}