import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import DesignerNavigationDrawer from "../nav/DesignerNavigationDrawer";
import { designerHomeStyles } from "./DesignerHomeScreen.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerHomeScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("home");
  
  // Animation values
  const drawerAnimation = useRef(new Animated.Value(-320)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    if (drawerOpen) {
      // Close drawer
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -320,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDrawerOpen(false);
      });
    } else {
      // Open drawer
      setDrawerOpen(true);
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNavPress = (navItem) => {
    setActiveNavItem(navItem);
    if (drawerOpen) {
      Animated.parallel([
        Animated.timing(drawerAnimation, {
          toValue: -320,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDrawerOpen(false);
        switch (navItem) {
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
          case "profile":
            navigation.navigate("ProfileScreen");
            break;
          case "settings":
            navigation.navigate("SettingsScreen");
            break;
          default:
            break;
        }
      });
    }
  };


  const handleQuickAction = (action) => {
    switch (action) {
      case "quickUpload":
        navigation.navigate("DesignerQuickUpload");
        break;
      case "products":
        navigation.navigate("DesignerProducts");
        break;
      case "analytics":
        navigation.navigate("DesignerAnalytics");
        break;
      default:
        break;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={designerHomeStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Navigation Drawer */}
      <DesignerNavigationDrawer
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        overlayAnimation={overlayAnimation}
        activeNavItem={activeNavItem}
        onToggleDrawer={toggleDrawer}
        onNavPress={handleNavPress}
      />

      {/* Header */}
      <View style={designerHomeStyles.header}>
        <Pressable onPress={toggleDrawer} style={designerHomeStyles.menuButton}>
          <Icon name="menu" size={24} color="#1F2937" />
        </Pressable>
        <View style={designerHomeStyles.headerCenter}>
          <Text style={designerHomeStyles.headerTitle}>Designer Dashboard</Text>
          <Text style={designerHomeStyles.headerSubtitle}>Manage products & analytics</Text>
        </View>
        <Pressable style={designerHomeStyles.notificationButton}>
          <Icon name="notifications" size={24} color="#1F2937" />
          <View style={designerHomeStyles.notificationBadge} />
        </Pressable>
      </View>

      <ScrollView style={designerHomeStyles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={designerHomeStyles.welcomeSection}>
          <Text style={designerHomeStyles.greeting}>{getGreeting()}, Designer!</Text>
          <Text style={designerHomeStyles.welcomeText}>
            Manage your products and monitor performance
          </Text>
        </View>

        {/* Wallet Card */}
        <Pressable 
          style={designerHomeStyles.walletCard}
          onPress={() => navigation.navigate("DesignerWallet")}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={designerHomeStyles.walletGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={designerHomeStyles.walletHeader}>
              <Text style={designerHomeStyles.walletTitle}>Designer Wallet</Text>
              <Icon name="account-balance-wallet" size={24} color="#FFFFFF" />
            </View>
            <Text style={designerHomeStyles.walletBalance}>25,000,000 VND</Text>
            <Text style={designerHomeStyles.walletSubtitle}>Available balance</Text>
            <View style={designerHomeStyles.walletFooter}>
              <Text style={designerHomeStyles.walletFooterText}>View details</Text>
              <Icon name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Quick Stats */}
        <View style={designerHomeStyles.statsContainer}>
          <View style={designerHomeStyles.statCard}>
            <View style={designerHomeStyles.statIcon}>
              <Icon name="inventory" size={24} color="#3B82F6" />
            </View>
            <View style={designerHomeStyles.statContent}>
              <Text style={designerHomeStyles.statNumber}>12</Text>
              <Text style={designerHomeStyles.statLabel}>Published products</Text>
            </View>
          </View>

          <View style={designerHomeStyles.statCard}>
            <View style={designerHomeStyles.statIcon}>
              <Icon name="trending-up" size={24} color="#10B981" />
            </View>
            <View style={designerHomeStyles.statContent}>
              <Text style={designerHomeStyles.statNumber}>2.5M</Text>
              <Text style={designerHomeStyles.statLabel}>Total downloads</Text>
            </View>
          </View>

          <View style={designerHomeStyles.statCard}>
            <View style={designerHomeStyles.statIcon}>
              <Icon name="attach-money" size={24} color="#F59E0B" />
            </View>
            <View style={designerHomeStyles.statContent}>
              <Text style={designerHomeStyles.statNumber}>15.2M</Text>
              <Text style={designerHomeStyles.statLabel}>Revenue (VND)</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={designerHomeStyles.quickActionsSection}>
          <Text style={designerHomeStyles.sectionTitle}>Quick actions</Text>
          <View style={designerHomeStyles.quickActionsGrid}>
            <Pressable
              style={designerHomeStyles.quickActionCard}
              onPress={() => handleQuickAction("quickUpload")}
            >
              <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerHomeStyles.quickActionGradient}
              >
                <Icon name="upload" size={32} color="#FFFFFF" />
                <Text style={designerHomeStyles.quickActionText}>Quick upload</Text>
                <Text style={designerHomeStyles.quickActionSubtext}>New template</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={designerHomeStyles.quickActionCard}
              onPress={() => handleQuickAction("products")}
            >
              <LinearGradient
                colors={["#F093FB", "#F5576C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerHomeStyles.quickActionGradient}
              >
                <Icon name="inventory" size={32} color="#FFFFFF" />
                <Text style={designerHomeStyles.quickActionText}>Products</Text>
                <Text style={designerHomeStyles.quickActionSubtext}>Manage</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={designerHomeStyles.quickActionCard}
              onPress={() => handleQuickAction("analytics")}
            >
              <LinearGradient
                colors={["#4FACFE", "#00F2FE"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerHomeStyles.quickActionGradient}
              >
                <Icon name="analytics" size={32} color="#FFFFFF" />
                <Text style={designerHomeStyles.quickActionText}>Analytics</Text>
                <Text style={designerHomeStyles.quickActionSubtext}>Performance</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={designerHomeStyles.quickActionCard}
              onPress={() => navigation.navigate("DrawingScreen")}
            >
              <LinearGradient
                colors={["#43E97B", "#38F9D7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={designerHomeStyles.quickActionGradient}
              >
                <Icon name="create" size={32} color="#FFFFFF" />
                <Text style={designerHomeStyles.quickActionText}>Create drawing</Text>
                <Text style={designerHomeStyles.quickActionSubtext}>Build template</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={designerHomeStyles.activitySection}>
          <Text style={designerHomeStyles.sectionTitle}>Recent activity</Text>
          <View style={designerHomeStyles.activityList}>
            <View style={designerHomeStyles.activityItem}>
              <View style={designerHomeStyles.activityIcon}>
                <Icon name="upload" size={20} color="#10B981" />
              </View>
              <View style={designerHomeStyles.activityContent}>
                <Text style={designerHomeStyles.activityTitle}>New template published</Text>
                <Text style={designerHomeStyles.activityTime}>2 hours ago</Text>
              </View>
              <Text style={designerHomeStyles.activityStatus}>Success</Text>
            </View>

            <View style={designerHomeStyles.activityItem}>
              <View style={designerHomeStyles.activityIcon}>
                <Icon name="download" size={20} color="#3B82F6" />
              </View>
              <View style={designerHomeStyles.activityContent}>
                <Text style={designerHomeStyles.activityTitle}>Template downloaded</Text>
                <Text style={designerHomeStyles.activityTime}>5 hours ago</Text>
              </View>
              <Text style={designerHomeStyles.activityStatus}>+150 downloads</Text>
            </View>

            <View style={designerHomeStyles.activityItem}>
              <View style={designerHomeStyles.activityIcon}>
                <Icon name="attach-money" size={20} color="#F59E0B" />
              </View>
              <View style={designerHomeStyles.activityContent}>
                <Text style={designerHomeStyles.activityTitle}>Payment received</Text>
                <Text style={designerHomeStyles.activityTime}>1 day ago</Text>
              </View>
              <Text style={designerHomeStyles.activityStatus}>+500K VND</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
