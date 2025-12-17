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
import { notiService } from "../../service/notiService";
import { useToast } from "../../hooks/use-toast";
import loadingAnimation from "../../assets/loading.json";

export default function NotificationButton() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { toast } = useToast();
    const buttonRef = useRef(null);

    const [notiCount, setNotiCount] = useState(0);
    const [notiOpen, setNotiOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loadingNoti, setLoadingNoti] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });

    useEffect(() => {
        const loadNotiCount = async () => {
            try {
                const data = await notiService.getCountNotiUnRead();
                const count = Number(data?.unread ?? 0);
                setNotiCount(count);
            } catch (error) {
                console.warn("Failed to load notification count", error);
            }
        };

        loadNotiCount();
    }, []);

    const toggleNotiDropdown = async () => {
        if (!notiOpen && buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                setButtonPosition({ x, y, width, height });
            });
        }

        const next = !notiOpen;
        setNotiOpen(next);
        if (!next) return;

        try {
            setLoadingNoti(true);
            const data = await notiService.getAllNoti(0, 20);
            const list = Array.isArray(data) ? data : data?.content || [];
            setNotifications(Array.isArray(list) ? list : []);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to load notifications",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: error.message || "Failed to mark all as read",
                variant: "destructive",
            });
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
            toast({
                title: "Error",
                description: error.message || "Failed to mark notification as read",
                variant: "destructive",
            });
        }
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
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleReadSingleNoti(item)}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.notificationItem,
                                            { backgroundColor: item.read ? (isDark ? "#1E293B" : "#F9FAFB") : (isDark ? "#334155" : "#DBEAFE") }
                                        ]}
                                    >
                                        <Text
                                            style={[styles.notificationTitle, isDark && styles.notificationTitleDark]}
                                            numberOfLines={1}
                                        >
                                            {item.title || "Notification"}
                                        </Text>
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
                                    </TouchableOpacity>
                                )}
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
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 10,
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 2,
    },
    notificationTitleDark: {
        color: "#F1F5F9",
    },
    notificationMessage: {
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 2,
    },
    notificationMessageDark: {
        color: "#94A3B8",
    },
    notificationTime: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 2,
    },
});
