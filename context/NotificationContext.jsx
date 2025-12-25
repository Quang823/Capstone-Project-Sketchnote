// NotificationContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import { notificationWebSocketService } from "../service/notificationWebSocketService";
import { notiService } from "../service/notiService";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Ref to track if notification panel is open (for immediate updates)
    const isPanelOpenRef = useRef(false);

    // Ref for the latest callback to avoid stale closure issues
    const onMessageCallbackRef = useRef(null);

    // Subscribers for notification events (for dashboard refresh, etc.)
    const subscribersRef = useRef(new Set());

    /**
     * Subscribe to notification events
     * @param {function} callback - Called with notification when received
     * @returns {function} Unsubscribe function
     */
    const subscribeToNotifications = useCallback((callback) => {
        subscribersRef.current.add(callback);
        return () => {
            subscribersRef.current.delete(callback);
        };
    }, []);

    /**
     * Fetch initial unread count from API
     */
    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const response = await notiService.getCountNotiUnRead();
            // API returns { unread: number }
            const count = Number(response?.unread ?? 0);
            setUnreadCount(count);
        } catch (error) {
            console.warn("Failed to fetch unread count:", error);
        }
    }, [user?.id]);

    /**
     * Fetch notifications list
     */
    const fetchNotifications = useCallback(async (page = 0, size = 20) => {
        if (!user?.id) return { content: [], totalPages: 0 };

        setIsLoading(true);
        try {
            const response = await notiService.getAllNoti(page, size);
            const list = Array.isArray(response) ? response : response?.content || [];
            if (page === 0) {
                setNotifications(list);
            }
            return { content: list, totalPages: response?.totalPages || 0 };
        } catch (error) {
            console.warn("Failed to fetch notifications:", error);
            return { content: [], totalPages: 0 };
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    /**
     * Mark notification as read
     */
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notiService.readNotiByNotiId(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.warn("Failed to mark notification as read:", error);
            throw error;
        }
    }, []);

    /**
     * Mark all notifications as read
     */
    const markAllAsRead = useCallback(async () => {
        try {
            await notiService.readAllNoti();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.warn("Failed to mark all as read:", error);
            throw error;
        }
    }, []);

    /**
     * Handle incoming WebSocket notification
     */
    const handleNewNotification = useCallback((notification) => {
        console.log("📬 New notification received:", notification?.title);

        // Update unread count
        const isRead = notification.read ?? false;
        if (!isRead) {
            setUnreadCount(prev => {
                console.log("📊 Updating unread count:", prev, "->", prev + 1);
                return prev + 1;
            });
        }

        // Add to notifications list if panel is open
        if (isPanelOpenRef.current) {
            setNotifications(prev => [{ ...notification, read: isRead }, ...prev]);
        }

        // Notify all subscribers (for dashboard refresh, etc.)
        subscribersRef.current.forEach(callback => {
            try {
                callback(notification);
            } catch (e) {
                console.warn("Error in notification subscriber:", e);
            }
        });
    }, []);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onMessageCallbackRef.current = handleNewNotification;
    }, [handleNewNotification]);

    /**
     * Set panel open state (call from components when opening/closing notification panel)
     */
    const setPanelOpen = useCallback((isOpen) => {
        isPanelOpenRef.current = isOpen;
        if (isOpen) {
            // Refresh notifications when panel opens
            fetchNotifications(0, 20);
        }
    }, [fetchNotifications]);

    /**
     * Connect to WebSocket
     */
    const connectWebSocket = useCallback(async () => {
        if (!user?.id) {
            console.log("⚠️ No user, skipping WebSocket connection");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("accessToken");
            if (!token) {
                console.warn("❌ No access token, cannot connect WebSocket");
                return;
            }

            const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://sketchnote.litecsys.com/";
            const wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "") + `/ws-notifications`;

            console.log("🔌 Connecting to notification WebSocket:", wsUrl);

            // Use a wrapper function that calls the ref to avoid stale closure
            const onMessageWrapper = (notification) => {
                if (onMessageCallbackRef.current) {
                    onMessageCallbackRef.current(notification);
                }
            };

            notificationWebSocketService.connect(
                wsUrl,
                user.id,
                token,
                onMessageWrapper,
                (error) => {
                    console.warn("❌ WebSocket error:", error);
                    setIsConnected(false);
                }
            );

            setIsConnected(true);
            console.log("✅ WebSocket connection initiated for user:", user.id);
        } catch (error) {
            console.warn("❌ Error connecting WebSocket:", error);
            setIsConnected(false);
        }
    }, [user?.id]); // Remove handleNewNotification dependency

    /**
     * Disconnect from WebSocket
     */
    const disconnectWebSocket = useCallback(() => {
        notificationWebSocketService.disconnect();
        setIsConnected(false);
        console.log("🔌 WebSocket disconnected");
    }, []);

    // Connect WebSocket when user logs in, disconnect when logs out
    useEffect(() => {
        if (user?.id) {
            // Connect WebSocket
            const connect = async () => {
                try {
                    const token = await AsyncStorage.getItem("accessToken");
                    if (!token) {
                        console.warn("❌ No access token, cannot connect WebSocket");
                        return;
                    }

                    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://sketchnote.litecsys.com/";
                    const wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "") + `/ws-notifications`;

                    console.log("🔌 Connecting to notification WebSocket:", wsUrl);

                    // Use a wrapper function that calls the ref to avoid stale closure
                    const onMessageWrapper = (notification) => {
                        console.log("📬 NotificationContext received:", notification?.title);
                        if (onMessageCallbackRef.current) {
                            onMessageCallbackRef.current(notification);
                        }
                    };

                    notificationWebSocketService.connect(
                        wsUrl,
                        user.id,
                        token,
                        onMessageWrapper,
                        (error) => {
                            console.warn("❌ WebSocket error:", error);
                            setIsConnected(false);
                        }
                    );

                    setIsConnected(true);
                    console.log("✅ WebSocket connection initiated for user:", user.id);
                } catch (error) {
                    console.warn("❌ Error connecting WebSocket:", error);
                    setIsConnected(false);
                }
            };

            connect();

            // Fetch initial unread count
            const fetchCount = async () => {
                try {
                    const response = await notiService.getCountNotiUnRead();
                    const count = Number(response?.unread ?? 0);
                    setUnreadCount(count);
                    console.log("📊 Initial unread count:", count);
                } catch (error) {
                    console.warn("Failed to fetch unread count:", error);
                }
            };
            fetchCount();
        } else {
            notificationWebSocketService.disconnect();
            setIsConnected(false);
            setNotifications([]);
            setUnreadCount(0);
        }

        return () => {
            notificationWebSocketService.disconnect();
            setIsConnected(false);
        };
    }, [user?.id]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                setNotifications,
                unreadCount,
                setUnreadCount,
                isConnected,
                isLoading,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                setPanelOpen,
                connectWebSocket,
                disconnectWebSocket,
                subscribeToNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * Custom hook to use notification context
 */
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
