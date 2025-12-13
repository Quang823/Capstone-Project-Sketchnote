
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

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { getStyles } from "./DesignerHomeScreen.styles";
import { dashboardService } from "../../../service/dashboardService";
import { formatCurrencyVN } from "../../../common/formatCurrencyVN";
import { notiService } from "../../../service/notiService";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { paymentService } from "../../../service/paymentService";
import { notificationWebSocketService } from "../../../service/notificationWebSocketService";
import { authService } from "../../../service/authService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../../../context/ThemeContext";

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
    const [currentUserId, setCurrentUserId] = useState(null);

    const { theme } = useTheme();
    const isDark = theme === "dark";
    const styles = useMemo(() => getStyles(theme), [theme]);

    useEffect(() => {
        setActiveNavItem("home");
        setActiveNavItemLocal("home");
    }, [setActiveNavItem]);

    const notiOpenRef = useRef(notiOpen);
    useEffect(() => {
        notiOpenRef.current = notiOpen;
    }, [notiOpen]);

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
    const fetchWallet = async () => {
        try {
            const res = await paymentService.getWallet();

            setWallet(res.result);
        } catch (error) {
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

    // Get current user ID
    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const profile = await authService.getMyProfile();
                if (profile && profile.id) {
                    setCurrentUserId(profile.id);
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };
        getCurrentUser();
    }, []);

    useEffect(() => {
        fetchSashboardSummary();
        fetchTopTemplates();
        loadNotiCount();
        fetchWallet();
    }, []);

    // Connect to WebSocket for real-time notifications
    useFocusEffect(
        useCallback(() => {
            if (!currentUserId) return;

            const connectWebSocket = async () => {
                try {
                    const token = await AsyncStorage.getItem("accessToken");
                    if (!token) {
                        console.error("❌ No access token, cannot connect WebSocket");
                        return;
                    }

                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://sketchnote.litecsys.com/";
                    const wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "") + `/ws-notifications`;

                    notificationWebSocketService.connect(
                        wsUrl,
                        currentUserId,
                        token,
                        (notification) => {
                            const isRead = notification.read ?? false;
                            if (!isRead) {
                                setNotiCount((prev) => prev + 1);
                            }
                            if (notiOpenRef.current) {
                                setNotifications((prev) => [{ ...notification, read: isRead }, ...prev]);
                            }
                        },
                        (error) => console.error("❌ WebSocket error:", error)
                    );
                } catch (error) {
                    console.error("❌ Error connecting WebSocket:", error);
                }
            };

            connectWebSocket();

            return () => {
                notificationWebSocketService.disconnect();
            };
        }, [currentUserId])
    );

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
            />

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <SidebarToggleButton
                        iconColor={styles.iconColor}
                        iconSize={26}
                    />
                    <Text style={styles.headerTitle}>Designer Homepage</Text>
                </View>
                <Pressable
                    style={styles.notificationButton}
                    onPress={toggleNotiDropdown}
                >
                    <Icon name="notifications" size={24} color={styles.iconColor} />
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
                                <Text style={styles.statNumber}>
                                    {dashboardSummary?.totalProductCount || 0}
                                </Text>
                                <Text style={styles.statLabel}>Products</Text>
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
                            onPress={() => navigation.navigate("Home")}
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
                <View style={styles.notificationDropdown}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>
                            Notifications
                        </Text>
                        <View style={styles.notificationMetaRow}>
                            <Text style={styles.notificationUnreadText}>
                                {notiCount} unread
                            </Text>
                            {notifications.length > 0 && (
                                <Pressable onPress={handleReadAllNoti}>
                                    <Text style={styles.markAllReadText}>
                                        Mark all as read
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>

                    {loadingNoti ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : notifications.length === 0 ? (
                        <View style={styles.emptyNotificationContainer}>
                            <Icon name="notifications-off" size={32} color="#9CA3AF" />
                            <Text style={styles.emptyNotificationText}>
                                No notifications
                            </Text>
                        </View>
                    ) : (
                        <ScrollView style={{ maxHeight: 300 }}>
                            {notifications.map((item) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => handleReadSingleNoti(item)}
                                    style={[
                                        styles.notificationItem,
                                        item.read ? styles.notificationItemRead : styles.notificationItemUnread
                                    ]}
                                >
                                    <Text
                                        style={styles.notificationItemTitle}
                                        numberOfLines={1}
                                    >
                                        {item.title || "Notification"}
                                    </Text>
                                    <Text
                                        style={styles.notificationItemMessage}
                                        numberOfLines={2}
                                    >
                                        {item.message}
                                    </Text>
                                    {item.createdAt && (
                                        <Text style={styles.notificationItemTime}>
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
