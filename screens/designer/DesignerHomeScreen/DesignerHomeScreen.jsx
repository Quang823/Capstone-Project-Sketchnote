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
import { notiService } from "../../../service/notiService";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { paymentService } from "../../../service/paymentService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 180;
export default function DesignerHomeScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("home");
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [notiCount, setNotiCount] = useState(0);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNoti, setLoadingNoti] = useState(false);
  const [topTemplates, setTopTemplates] = useState([]);
  const [wallet, setWallet] = useState({});
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
      setTopTemplates(res);
    } catch (error) { }
  };
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
 const fetchWallet = async () =>{
  try {
    const res = await paymentService.getWallet();
 
    setWallet(res.result);
  } catch (error) {
    console.log(error);
  }
 }
  const fetchSashboardSummary = async () => {
    try {
      const res = await dashboardService.getDashboardSummaryDesigner();
      setDashboardSummary(res);
    } catch (error) { }
  };

  const loadNotiCount = async () => {
    try {
      const data = await notiService.getCountNotiUnRead();
      const count = Number(data?.unread ?? 0);
      setNotiCount(count);
    } catch (error) { }
  };

  const toggleNotiDropdown = async () => {
    const next = !notiOpen;
    setNotiOpen(next);
    if (!next) return;

    try {
      setLoadingNoti(true);
      const data = await notiService.getAllNoti(0, 20);
      const list = Array.isArray(data) ? data : data?.content || [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {

    } finally {
      setLoadingNoti(false);
    }
  };

  const handleReadAllNoti = async () => {
    try {
      await notiService.readAllNoti();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotiCount(0);
    } catch (error) {
    }
  };

  const handleReadSingleNoti = async (item) => {
    if (item.read) return;
    try {
      await notiService.readNotiByNotiId(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      setNotiCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchSashboardSummary();
    fetchTopTemplates();
    loadNotiCount();
    fetchWallet();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <SidebarToggleButton
          style={styles.menuButton}
          iconColor="#084F8C"
          iconSize={24}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Designer Homepage</Text>
        </View>
        <Pressable
          style={styles.notificationButton}
          onPress={toggleNotiDropdown}
        >
          <Icon name="notifications" size={24} color="#084F8C" />
          {notiCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {notiCount > 99 ? "99+" : notiCount}
              </Text>
            </View>
          )}
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
                        wallet?.balance || 0
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
        {/* Top Templates from API */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Templates</Text>
          <View style={styles.topTemplateList}>
            {topTemplates && topTemplates.length > 0 ? (
              topTemplates.map((item) => (
                <View
                  key={item.templateId}
                  style={styles.topTemplateCard}
                >
                  <View style={styles.topTemplateRow}>
                    <View style={styles.topTemplateThumbnail}>
                      <Icon name="image" size={20} color="#1D4ED8" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={styles.topTemplateName}
                        numberOfLines={2}
                      >
                        {item.templateName}
                      </Text>
                      <Text style={styles.topTemplateMeta}>
                        {item.soldCount || 0} sales
                      </Text>
                    </View>

                    <View style={styles.topTemplateChip}>
                      <Icon
                        name="trending-up"
                        size={14}
                        color="#4F46E5"
                      />
                      <Text style={styles.topTemplateRevenueValue}>
                        {formatCurrencyVN(item.revenue || 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.activityTime}>
                No top templates data yet
              </Text>
            )}
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {notiOpen && (
        <View
          style={{
            position: "absolute",
            top: 80,
            right: 20,
            width: 320,
            maxHeight: 360,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            paddingVertical: 8,
            paddingHorizontal: 12,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            zIndex: 50,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Notifications
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                {notiCount} unread
              </Text>
              {notifications.length > 0 && (
                <Pressable onPress={handleReadAllNoti}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#2563EB",
                      fontWeight: "600",
                    }}
                  >
                    Mark all as read
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {loadingNoti ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 20,
              }}
            >
              <Text style={{ color: "#6B7280" }}>Loading...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 16,
              }}
            >
              <Icon name="notifications-off" size={32} color="#9CA3AF" />
              <Text
                style={{
                  marginTop: 6,
                  color: "#6B7280",
                  fontSize: 13,
                }}
              >
                No notifications
              </Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 300 }}>
              {notifications.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleReadSingleNoti(item)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    backgroundColor: item.read ? "#F9FAFB" : "#DBEAFE",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: 2,
                    }}
                    numberOfLines={1}
                  >
                    {item.title || "Notification"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#4B5563",
                      marginBottom: 2,
                    }}
                    numberOfLines={2}
                  >
                    {item.message}
                  </Text>
                  {item.createdAt && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}
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
  topTemplateList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  topTemplateCard: {
    flexDirection: "column",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  topTemplateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topTemplateThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  topTemplateName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  topTemplateMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  topTemplateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    gap: 4,
    alignSelf: "flex-start",
  },
  topTemplateRevenueValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#047857",
  },
};
