import React, { useState, useRef, useEffect } from "react";
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
import { dashboardService } from "../../../service/dashboardService";
import { formatCurrencyVN } from "../../../common/formatCurrencyVN";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerHomeScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("home");
  const [dashboardSummary, setDashboardSummary] = useState({});
  const drawerAnimation = useRef(new Animated.Value(-320)).current;
  const overlayAnimation = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
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
      });
    } else {
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
 const fetchSashboardSummary = async () => {
    try {
      const res = await dashboardService.getDashboardSummaryDesigner();
      console.log(res)
      setDashboardSummary(res);
    } catch (error) {
      console.log(error)
    }
  };
  useEffect(() => {
    fetchSashboardSummary();
  }, []);
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <DesignerNavigationDrawer
        drawerOpen={drawerOpen}
        drawerAnimation={drawerAnimation}
        overlayAnimation={overlayAnimation}
        activeNavItem={activeNavItem}
        onToggleDrawer={toggleDrawer}
        onNavPress={handleNavPress}
      />

      {/* Header - Minimalist */}
      <View style={styles.header}>
        <Pressable onPress={toggleDrawer} style={styles.menuButton}>
          <Icon name="menu" size={22} color="#111827" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <Pressable style={styles.notificationButton}>
          <Icon name="notifications-none" size={22} color="#111827" />
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section - Subtle */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.welcomeText}>Track your business performance</Text>
        </View>

        {/* Wallet Card - Refined Design */}
        <Pressable 
          style={styles.walletCard}
          onPress={() => navigation.navigate("DesignerWallet")}
        >
          <View style={styles.walletHeader}>
            <View>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <Text style={styles.walletBalance}>25,000,000₫</Text>
            </View>
            <View style={styles.walletIconContainer}>
              <Icon name="account-balance-wallet" size={20} color="#6366F1" />
            </View>
          </View>
          <View style={styles.walletDivider} />
          <View style={styles.walletFooter}>
            <Text style={styles.walletFooterText}>Manage wallet</Text>
            <Icon name="arrow-forward" size={16} color="#6B7280" />
          </View>
        </Pressable>

        {/* Stats Grid - Compact */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="inventory-2" size={18} color="#6366F1" />
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statChange}>+2 this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="file-download" size={18} color="#10B981" />
              <Text style={styles.statLabel}>Purchases</Text>
            </View>
            <Text style={styles.statNumber}>{dashboardSummary?.totalSoldCount || 0}</Text>
            {/* <Text style={styles.statChange}>+18% this week</Text> */}
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Icon name="trending-up" size={18} color="#F59E0B" />
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
            <Text style={styles.statNumber}>{formatCurrencyVN(dashboardSummary?.totalRevenue || 0)}</Text>
            {/* <Text style={styles.statChange}>+12% this month</Text> */}
          </View>
        </View>

        {/* Quick Actions - Compact Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("quickUpload")}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Icon name="add" size={20} color="#6366F1" />
              </View>
              <Text style={styles.actionText}>Upload</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("products")}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="inventory-2" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Products</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("analytics")}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="bar-chart" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("DrawingScreen")}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="create" size={20} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Create</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Activity - Clean List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Template published</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#3B82F6' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>150 new downloads</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Payment received: 500,000₫</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  walletCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  walletFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletFooterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  statChange: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
};