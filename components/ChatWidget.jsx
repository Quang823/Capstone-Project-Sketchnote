import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from "../service/chatService";
import { webSocketService } from "../service/webSocketService";
import { useToast } from "../hooks/use-toast";
import { getStyles } from "./ChatWidget.styles";
import { authService } from "../service/authService";
import { useTheme } from "../context/ThemeContext";



export default function ChatWidget({ visible, onClose }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [currentPage, setCurrentPage] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 20;

    const flatListRef = useRef(null);
    const { toast } = useToast();
    const slideAnim = useRef(new Animated.Value(500)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [adminUsers, setAdminUsers] = useState([]);
    const RECEIVER_ID = adminUsers[0]?.id || null;
    //   const RECEIVER_ID = 1;
    // Pulse animation cho status dot
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    const sortMessagesByTime = (messages) => {
        return [...messages].sort((a, b) =>
            new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)
        );
    };

    useEffect(() => {
        const getUser = async () => {
            try {
                const profile = await authService.getMyProfile();
                if (profile && profile.id) {
                    setCurrentUserId(profile.id);
                }
            } catch (error) {
                console.error("Error fetching current user profile:", error);
            }
        };
        const getAdminUsers = async () => {
            try {
                const adminUsers = await authService.getUserRoleAdmin();
                setAdminUsers(adminUsers);

            } catch (error) {
                console.error("Error fetching admin users:", error);
            }
        };
        getAdminUsers();
        getUser();
    }, []);

    useEffect(() => {
        if (visible && currentUserId) {
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://sketchnote.litecsys.com/";
            const wsUrl = apiUrl.replace(/\/$/, "") + "/ws";

            webSocketService.connect(
                wsUrl,
                () => {
                    setWsConnected(true);
                    const topic = `/queue/private/${currentUserId}`;
                    webSocketService.subscribe(topic, (msg) => {
                        handleIncomingMessage(msg);
                    });
                },
                (error) => {
                    setWsConnected(false);
                }
            );
        } else if (!visible) {
            webSocketService.disconnect();
            setWsConnected(false);
        }

        return () => {
            if (visible) {
                webSocketService.disconnect();
            }
        };
    }, [visible, currentUserId]);

    const handleIncomingMessage = (message) => {
        if (message.senderId === currentUserId) {
            return;
        }
        if (message.senderId === RECEIVER_ID && message.receiverId === currentUserId) {
            setMessages((prev) => {
                const exists = prev.some((m) => {
                    if (m.id && message.id && m.id === message.id) {
                        return true;
                    }

                    const mTime = new Date(m.createdAt || m.timestamp).getTime();
                    const msgTime = new Date(message.createdAt || message.timestamp).getTime();
                    const timeDiff = Math.abs(mTime - msgTime);

                    const contentMatch = m.content === message.content &&
                        m.senderId === message.senderId &&
                        timeDiff < 500;

                    return contentMatch;
                });

                if (exists) {
                    return prev;
                }

                return sortMessagesByTime([...prev, message]);
            });
        }
    };

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }).start();

            setCurrentPage(null);
            setHasMore(true);
            fetchMessages(null, false);
        } else {
            Animated.timing(slideAnim, {
                toValue: 500,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const fetchMessages = async (page = null, append = false) => {
        try {
            if (!append) setLoading(true);
            else setLoadingMore(true);

            const pageToLoad = page !== null ? page : 0;
            const response = await chatService.getMessagesByUserId(RECEIVER_ID, pageToLoad, PAGE_SIZE);
            const newMessages = response.content || [];
            const totalPagesFromAPI = response.totalPages || 0;

            if (page === null && totalPagesFromAPI > 0) {
                const lastPage = totalPagesFromAPI - 1;
                setTotalPages(totalPagesFromAPI);

                const lastPageResponse = await chatService.getMessagesByUserId(RECEIVER_ID, lastPage, PAGE_SIZE);
                const lastPageMessages = lastPageResponse.content || [];

                setMessages(sortMessagesByTime(lastPageMessages));
                setCurrentPage(lastPage);
                setHasMore(lastPage > 0);
            } else {
                setTotalPages(totalPagesFromAPI);

                if (append) {
                    setMessages(prev => sortMessagesByTime([...newMessages, ...prev]));
                } else {
                    setMessages(sortMessagesByTime(newMessages));
                }

                setCurrentPage(pageToLoad);
                setHasMore(pageToLoad > 0);
            }
        } catch (error) {
            console.error("Fetch messages error:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (!loadingMore && hasMore && currentPage !== null && currentPage > 0) {
            const previousPage = currentPage - 1;
            fetchMessages(previousPage, true);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const messageContent = inputText.trim();
        setInputText("");
        setSending(true);

        try {
            const data = {
                receiverId: RECEIVER_ID,
                content: messageContent,
            };

            const newMessage = await chatService.sendMessage(data);
            setMessages((prev) => sortMessagesByTime([...prev, newMessage]));

            if (wsConnected) {
                const wsMessage = {
                    senderId: newMessage.senderId,
                    senderName: newMessage.senderName,
                    senderAvatarUrl: newMessage.senderAvatarUrl,
                    receiverId: newMessage.receiverId,
                    content: newMessage.content,
                    timestamp: newMessage.createdAt
                };

                webSocketService.send("/app/chat.private", wsMessage);
            } else {
                console.warn("⚠️ WebSocket not connected");
            }

        } catch (error) {
            console.error("Send failed:", error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
            setInputText(messageContent);
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId !== RECEIVER_ID;
        const avatarUrl = item.senderAvatarUrl;

        return (
            <View
                style={[
                    styles.messageRow,
                    isMyMessage ? styles.messageRowMy : styles.messageRowTheir,
                ]}
            >
                {!isMyMessage && (
                    <View style={styles.messageAvatar}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 34, height: 34, borderRadius: 17 }}
                            />
                        ) : (
                            <Icon name="support-agent" size={22} color={styles.colors.iconColor} />
                        )}
                    </View>
                )}

                <View style={styles.messageContainer}>
                    <View
                        style={[
                            styles.messageBubble,
                            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                isMyMessage ? styles.myMessageText : styles.theirMessageText,
                            ]}
                        >
                            {item.content}
                        </Text>

                        <Text
                            style={[
                                styles.messageTime,
                                isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                            ]}
                        >
                            {new Date(item.createdAt || item.timestamp).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                {isMyMessage && (
                    <View style={styles.messageAvatar}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 34, height: 34, borderRadius: 17 }}
                            />
                        ) : (
                            <Icon name="person" size={22} color={styles.colors.iconColor} />
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.chatContainer,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    {/* Header với Sketch branding */}
                    <LinearGradient
                        colors={["#5c66f6ff", "rgba(70, 58, 237, 1)", "rgba(55, 45, 205, 1)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.header}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.avatar}>
                                <Icon name="draw" size={24} color="#5c66f6ff" />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.headerTitle}>Sketch Support</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Animated.View
                                        style={{
                                            transform: [{ scale: pulseAnim }],
                                        }}
                                    >
                                        <View style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: wsConnected ? '#10B981' : '#EF4444',
                                            marginRight: 6
                                        }} />
                                    </Animated.View>
                                    <Text style={styles.headerSubtitle}>
                                        {wsConnected ? "Always here to help" : "Connecting..."}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Messages */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#5c66f6ff" />
                            <Text style={styles.loadingText}>Loading messages...</Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item, index) => {
                                const timestamp = item.createdAt || item.timestamp || '';
                                return item.id ? `msg-${item.id}-${timestamp}` : `msg-temp-${index}-${timestamp}`;
                            }}
                            inverted
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.5}
                            ListHeaderComponent={
                                loadingMore ? (
                                    <View style={{ padding: 16, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color="#5c66f6ff" />
                                        <Text style={{ marginTop: 8, color: '#64748B', fontSize: 12, fontWeight: '600' }}>
                                            Loading more messages...
                                        </Text>
                                    </View>
                                ) : null
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Icon name="brush" size={56} color={styles.colors.emptyIconColor} />
                                    <Text style={styles.emptyText}>Start Sketching!</Text>
                                    <Text style={styles.emptySubtext}>
                                        Send your first message to begin the conversation
                                    </Text>
                                </View>
                            }
                        />
                    )}

                    {/* Input */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                    >
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder="Sketch your message..."
                                    placeholderTextColor={styles.colors.inputPlaceholder}
                                    multiline
                                    maxLength={1000}
                                    editable={!sending}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || sending) && styles.sendButtonDisabled,
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={!inputText.trim() || sending}
                                >
                                    {sending ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Icon name="send" size={20} color="#FFF" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
}