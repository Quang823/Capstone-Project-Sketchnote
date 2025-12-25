import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Modal,
    Pressable,
    Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/use-toast";
import loadingAnimation from "../../assets/loading.json";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationButton() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { toast } = useToast();
    const navigation = useNavigation();
    const buttonRef = useRef(null);

    const {
        unreadCount: notiCount,
        notifications,
        isLoading: loadingNoti,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        setPanelOpen,
    } = useNotifications();

    const [notiOpen, setNotiOpen] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    // Sync local open state with context
    useEffect(() => {
        setPanelOpen(notiOpen);
    }, [notiOpen, setPanelOpen]);

    const toggleNotiDropdown = async () => {
        if (!notiOpen && buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                setButtonPosition({ x, y, width, height });
            });
        }

        const next = !notiOpen;
        setNotiOpen(next);

        if (next) {
            fetchNotifications(0, 20);
        }
    };

    const handleReadAllNoti = async () => {
        try {
            await markAllAsRead();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to mark all as read",
                variant: "destructive",
            });
        }
    };

    const handleReadSingleNoti = async (item) => {
        // Mark as read if not already read
        if (!item.read) {
            try {
                await markAsRead(item.id);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to mark notification as read",
                    variant: "destructive",
                });
            }
        }

        // Navigate based on notification type
        setNotiOpen(false); // Close dropdown first

        if (item.type === "VERSION_AVAILABLE") {
            // Navigate to Drawing screen to view/upgrade resources
            navigation.navigate("Drawing");
        } else if (item.type === "PURCHASE_CONFIRM" && item.orderId) {
            // Navigate to order history or detail
            navigation.navigate("OrderHistory");
        }
        // Add more types as needed
    };

    const screenWidth = Dimensions.get("window").width;
    const dropdownWidth = 320;
    const dropdownLeft = Math.min(
        buttonPosition.x + buttonPosition.width - dropdownWidth,
        screenWidth - dropdownWidth - 16
    );

    return (
        <View>
            <TouchableOpacity
                ref={buttonRef}
                style={[styles.iconButton, isDark && styles.iconButtonDark]}
                onPress={toggleNotiDropdown}
            >
                <View style={{ position: "relative" }}>
                    <Icon name="notifications" size={22} color="#1E40AF" />
                    {notiCount > 0 && (
                        <View style={styles.badgeContainer}>
                            <Text style={styles.badgeText} numberOfLines={1}>
                                {notiCount > 99 ? "99+" : notiCount}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <Modal
                visible={notiOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setNotiOpen(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setNotiOpen(false)}
                >
                    <View
                        style={[
                            styles.dropdownContainer,
                            isDark && styles.dropdownContainerDark,
                            {
                                position: "absolute",
                                top: buttonPosition.y + buttonPosition.height + 8,
                                left: Math.max(16, dropdownLeft),
                            },
                        ]}
                    >
                        <View style={[styles.notiArrowBorder, isDark && styles.notiArrowBorderDark]} />
                        <View style={[styles.notiArrow, isDark && styles.notiArrowDark]} />

                        <View style={styles.dropdownHeader}>
                            <Text style={[styles.dropdownTitle, isDark && styles.dropdownTitleDark]}>
                                Notifications
                            </Text>
                            <View style={styles.dropdownHeaderRight}>
                                <Text style={styles.unreadText}>
                                    {notiCount} unread
                                </Text>
                                {notifications.length > 0 && (
                                    <TouchableOpacity onPress={handleReadAllNoti}>
                                        <Text style={styles.markAllReadText}>
                                            Mark all as read
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {loadingNoti ? (
                            <View style={styles.loadingContainer}>
                                <LottieView
                                    source={loadingAnimation}
                                    autoPlay
                                    loop
                                    style={{ width: 80, height: 80 }}
                                />
                            </View>
                        ) : notifications.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Icon name="notifications-off" size={32} color="#9CA3AF" />
                                <Text style={styles.emptyText}>
                                    No notifications
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={notifications}
                                keyExtractor={(item) => item.id?.toString()}
                                style={{ maxHeight: 300 }}
                                renderItem={({ item }) => {
                                    // Get icon based on notification type
                                    const getNotificationIcon = (type) => {
                                        switch (type) {
                                            case "VERSION_AVAILABLE":
                                                return { name: "upgrade", color: "#10B981" };
                                            case "PURCHASE_CONFIRM":
                                                return { name: "shopping-cart", color: "#3B82F6" };
                                            default:
                                                return { name: "notifications", color: "#6B7280" };
                                        }
                                    };
                                    const iconInfo = getNotificationIcon(item.type);

                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleReadSingleNoti(item)}
                                            activeOpacity={0.8}
                                            style={[
                                                styles.notificationItem,
                                                { backgroundColor: item.read ? (isDark ? "#1E293B" : "#F9FAFB") : (isDark ? "#334155" : "#DBEAFE") }
                                            ]}
                                        >
                                            <View style={styles.notificationRow}>
                                                <View style={[styles.notificationIcon, { backgroundColor: iconInfo.color + "20" }]}>
                                                    <Icon name={iconInfo.name} size={18} color={iconInfo.color} />
                                                </View>
                                                <View style={styles.notificationContent}>
                                                    <View style={styles.notificationTitleRow}>
                                                        <Text
                                                            style={[styles.notificationTitle, isDark && styles.notificationTitleDark]}
                                                            numberOfLines={1}
                                                        >
                                                            {item.title || "Notification"}
                                                        </Text>
                                                        {item.type === "VERSION_AVAILABLE" && (
                                                            <View style={styles.upgradeTag}>
                                                                <Text style={styles.upgradeTagText}>Upgrade</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <Text
                                                        style={[styles.notificationMessage, isDark && styles.notificationMessageDark]}
                                                        numberOfLines={2}
                                                    >
                                                        {item.message}
                                                    </Text>
                                                    {item.createdAt && (
                                                        <Text style={styles.notificationTime}>
                                                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                                                        </Text>
                                                    )}
                                                </View>
                                                <Icon name="chevron-right" size={18} color="#9CA3AF" />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#a1c3efff",
    },
    iconButtonDark: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
    },
    badgeContainer: {
        position: "absolute",
        top: -8,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 3,
    },
    badgeText: {
        color: "#FFF",
        fontSize: 10,
        fontWeight: "700",
    },
    dropdownContainer: {
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "transparent",
    },
    dropdownContainerDark: {
        backgroundColor: "#1E293B",
        shadowColor: "#000",
    },
    notiArrow: {
        position: "absolute",
        top: -12,
        right: 14,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 12,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#FFFFFF",
    },
    notiArrowDark: {
        borderBottomColor: "#1E293B",
    },
    notiArrowBorder: {
        position: "absolute",
        top: -12,
        right: 14,
        width: 0,
        height: 0,
        borderLeftWidth: 11,
        borderRightWidth: 11,
        borderBottomWidth: 14,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#FFFFFF",
    },
    notiArrowBorderDark: {
        borderBottomColor: "#1E293B",
    },
    dropdownHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    dropdownTitleDark: {
        color: "#F1F5F9",
    },
    dropdownHeaderRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    unreadText: {
        fontSize: 12,
        color: "#6B7280",
    },
    markAllReadText: {
        fontSize: 12,
        color: "#2563EB",
        fontWeight: "600",
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    emptyText: {
        marginTop: 6,
        color: "#6B7280",
        fontSize: 13,
    },
    notificationItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginBottom: 6,
    },
    notificationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    notificationIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 2,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        flex: 1,
    },
    notificationTitleDark: {
        color: "#F1F5F9",
    },
    upgradeTag: {
        backgroundColor: "#10B981",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    upgradeTagText: {
        fontSize: 10,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    notificationMessage: {
        fontSize: 12,
        color: "#4B5563",
        marginBottom: 2,
        lineHeight: 16,
    },
    notificationMessageDark: {
        color: "#94A3B8",
    },
    notificationTime: {
        fontSize: 11,
        color: "#9CA3AF",
        marginTop: 2,
    },
});
