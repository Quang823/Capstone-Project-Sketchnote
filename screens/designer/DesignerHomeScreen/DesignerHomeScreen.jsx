import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  ImageBackground,
  StyleSheet,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { designerHomeStyles } from "./DesignerHomeScreen.styles";
import { dashboardService } from "../../../service/dashboardService";
import { formatCurrencyVN } from "../../../common/formatCurrencyVN";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 180;
export default function DesignerHomeScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("home");
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [topTemplates, setTopTemplates] = useState([]);
  useEffect(() => {
    setActiveNavItem("home");
    setActiveNavItemLocal("home");
  }, [setActiveNavItem]);

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

  const fetchTopTemplates = async () => {
    try {
      const res = await dashboardService.getTopTemplates();
      console.log(res);
      setTopTemplates(res);
    } catch (error) {
      console.log("Error fetching top templates:", error);
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
      console.log(res);
      setDashboardSummary(res);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchSashboardSummary();
    fetchTopTemplates();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header - Updated */}
      <View style={styles.header}>
        <SidebarToggleButton
          style={styles.menuButton}
          iconColor="#084F8C"
          iconSize={24}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Designer Homepage</Text>
        </View>
        <Pressable style={styles.notificationButton}>
          <Icon name="notifications-none" size={24} color="#084F8C" />
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section - Updated */}

        {/* Thay thế toàn bộ phần Welcome Section cũ bằng đoạn này */}
        <ImageBackground
          source={{
            uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763710026/w3ykeckpumfg9vjbmxhs.jpg",
          }}
          style={styles.heroBackground}
          imageStyle={{
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
          resizeMode="cover"
        >
          {/* Lớp tối nhẹ để chữ và card vẫn đọc được */}
          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            {/* Cột trái: Greeting */}
            <View style={styles.greetingColumn}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.subGreetingText}>
                Track your business performance
              </Text>
            </View>

            {/* Cột phải: Wallet Card */}
            <Pressable
              style={styles.walletCard}
              onPress={() => navigation.navigate("DesignerWallet")}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
                style={styles.walletGradient}
              >
                <View style={styles.walletHeaderRow}>
                  <View>
                    <Text style={styles.walletLabel}>Available Balance</Text>
                    <Text style={styles.walletAmount}>
                      {formatCurrencyVN(
                        dashboardSummary?.availableBalance || 25000000
                      )}
                    </Text>
                  </View>
                  <View style={styles.walletIconBg}>
                    <Icon
                      name="account-balance-wallet"
                      size={28}
                      color="#084F8C"
                    />
                  </View>
                </View>

                <View style={styles.walletDivider} />

                <View style={styles.walletFooterRow}>
                  <Text style={styles.walletFooterText}>Manage wallet</Text>
                  <Icon name="arrow-forward-ios" size={18} color="#084F8C" />
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </ImageBackground>
        {/* Stats Grid - Updated */}
        <View style={styles.statsGrid}>
          {/* Ô 1: Products */}
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Products</Text>
                <Text style={styles.statChange}>+2 this month</Text>
              </View>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763710804/qyyn2oa2ui2dlefqdnft.jpg",
                }}
                // hoặc dùng link online:
                // source={{ uri: "https://res.cloudinary.com/.../products-illust.png" }}
                style={styles.statIllustration}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Ô 2: Purchases */}
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <View>
                <Text style={styles.statNumber}>
                  {dashboardSummary?.totalSoldCount || 0}
                </Text>
                <Text style={styles.statLabel}>Purchases</Text>
              </View>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763710803/p0ah0qr3hh643s1mg09f.jpg",
                }}
                style={styles.statIllustration}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Ô 3: Revenue */}
          <View style={styles.statCard}>
            <View style={styles.statContent}>
              <View>
                <Text style={styles.statNumber}>
                  {formatCurrencyVN(dashboardSummary?.totalRevenue || 0)}
                </Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763710803/lf1ojyeoboo61kabcrrm.jpg",
                }}
                style={styles.statIllustration}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
        {/* Quick Actions - Updated Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("quickUpload")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
                <Icon name="add" size={24} color="#084F8C" />
              </View>
              <Text style={styles.actionText}>Upload</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("products")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Icon name="inventory-2" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Products</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => handleQuickAction("analytics")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Icon name="bar-chart" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate("DrawingScreen")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#D1FAE5" }]}>
                <Icon name="create" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Create</Text>
            </Pressable>
          </View>
        </View>
        {/* Recent Activity - Updated List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top template</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconWrap}>
                <Icon name="check-circle" size={20} color="#10B981" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Template published</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIconWrap}>
                <Icon name="file-download" size={20} color="#3B82F6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>150 new downloads</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIconWrap}>
                <Icon name="payments" size={20} color="#F59E0B" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  Payment received: 500,000₫
                </Text>
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
    backgroundColor: "#cde6ff2b",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  heroBackground: {
    width: "100%",
    height: 260, // tăng chiều cao lên một chút cho đẹp
    marginBottom: 20,
    overflow: "hidden",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 40, 71, 0.19)", // lớp mờ xanh đậm của brand bạn
  },
  heroContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  greetingColumn: {
    flex: 1,
    paddingRight: 20,
  },
  greetingText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,

    // Viền chữ bằng shadow
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },

  subGreetingText: {
    fontSize: 16,
    color: "#E0E7FF",
    marginTop: 6,
    fontWeight: "500",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  walletCard: {
    width: 280,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  walletGradient: {
    padding: 18,
  },
  walletHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  walletIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(8, 79, 140, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletDivider: {
    height: 1,
    backgroundColor: "rgba(8, 79, 140, 0.2)",
    marginVertical: 12,
  },
  walletFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletFooterText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#084F8C",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    shadowColor: "#084F8C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statHeader: {
    marginBottom: 12,
  },

  statLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#084F8C",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  statChange: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#084F8C",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  statIllustration: {
    width: 130,
    height: 130,
    opacity: 1, // mờ nhẹ cho tinh tế
    marginRight: -10, // kéo sát mép phải một chút
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E7FF",
    shadowColor: "#084F8C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#084F8C",
  },
  activityList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    padding: 20,
    shadowColor: "#084F8C",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#084F8C",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
};
