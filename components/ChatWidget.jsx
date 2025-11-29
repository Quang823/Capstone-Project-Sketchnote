import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatService } from "../service/chatService";
import { webSocketService } from "../service/webSocketService";
import { useToast } from "../hooks/use-toast";
import { styles } from "./ChatWidget.styles";
import { authService } from "../service/authService";

const RECEIVER_ID = 8; // ID của người nhận (User A - Web)

export default function ChatWidget({ visible, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(null); // null = chưa load
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const PAGE_SIZE = 20;

    const flatListRef = useRef(null);
    const { toast } = useToast();
    const slideAnim = useRef(new Animated.Value(500)).current;

    // Helper function để sort tin nhắn theo thời gian
    const sortMessagesByTime = (messages) => {
        return [...messages].sort((a, b) =>
            new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp)
        );
    };

    // 1. Lấy User ID khi component mount
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
        getUser();
    }, []);

    // 2. Quản lý WebSocket Connection
    useEffect(() => {
        // Chỉ connect khi Widget hiện và đã có UserId
        if (visible && currentUserId) {

            // Build WebSocket URL from API base URL (giống web)
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://sketchnote.litecsys.com/";
            // URL gốc: https://sketchnote.litecsys.com/ws
            const wsUrl = apiUrl.replace(/\/$/, "") + "/ws";


            console.log(`🔌 Connecting to WebSocket at: ${wsUrl} with UserID: ${currentUserId}`);

            webSocketService.connect(
                wsUrl,
                () => {
                    console.log("✅ Mobile WebSocket Connected!");
                    setWsConnected(true);

                    // Subscribe ngay khi connect thành công
                    const topic = `/queue/private/${currentUserId}`;
                    console.log(`📥 Subscribing to: ${topic}`);
                    webSocketService.subscribe(topic, (msg) => {
                        console.log("📨 Mobile Received Message:", msg);
                        handleIncomingMessage(msg);
                    });
                },
                (error) => {
                    console.error("❌ Mobile WebSocket Error:", error);
                    setWsConnected(false);
                }
            );
        } else if (!visible) {
            // Ngắt kết nối khi đóng widget để tiết kiệm tài nguyên
            console.log("🛑 Widget closed, disconnecting WebSocket...");
            webSocketService.disconnect();
            setWsConnected(false);
        }

        // Cleanup khi unmount
        return () => {
            if (visible) {
                webSocketService.disconnect();
            }
        };
    }, [visible, currentUserId]);

    const handleIncomingMessage = (message) => {
        console.log("📨 Incoming message:", {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            content: message.content?.substring(0, 20)
        });

        // Chỉ xử lý tin nhắn liên quan đến cuộc trò chuyện hiện tại
        if (message.senderId === RECEIVER_ID || message.receiverId === RECEIVER_ID) {
            setMessages((prev) => {
                // Chống trùng lặp tin nhắn (giống web)
                const exists = prev.some((m) => {
                    // Kiểm tra theo ID trước (chính xác nhất)
                    if (m.id && message.id) {
                        const idMatch = m.id === message.id;
                        if (idMatch) {
                            console.log(`⚠️ Duplicate detected by ID: ${message.id}`);
                        }
                        return idMatch;
                    }
                    // Fallback: kiểm tra theo content + senderId + timestamp
                    const contentMatch = m.content === message.content &&
                        m.senderId === message.senderId &&
                        Math.abs(new Date(m.createdAt || m.timestamp) - new Date(message.timestamp || message.createdAt)) < 1000;

                    if (contentMatch) {
                        console.log("⚠️ Duplicate detected by content+time");
                    }
                    return contentMatch;
                });

                if (exists) {
                    console.log("⚠️ Message already exists, skipping");
                    return prev;
                }

                console.log("➕ Adding new message to UI");
                // Thêm tin nhắn mới và sort lại để đảm bảo thứ tự đúng
                return sortMessagesByTime([...prev, message]);
            });

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } else {
            console.log("❌ Message not for this conversation");
        }
    };

    // Animation & Fetch History
    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();

            // Reset pagination và fetch messages MỚI NHẤT
            setCurrentPage(null);
            setHasMore(true);
            fetchMessages(null, false); // null = load trang cuối cùng
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

            // Nếu page = null, load trang đầu tiên để lấy totalPages
            const pageToLoad = page !== null ? page : 0;
            const response = await chatService.getMessagesByUserId(RECEIVER_ID, pageToLoad, PAGE_SIZE);
            const newMessages = response.content || [];
            const totalPagesFromAPI = response.totalPages || 0;

            console.log(`📄 Loaded page ${pageToLoad}, total pages: ${totalPagesFromAPI}`);

            // Lần đầu load (page = null): load trang CUỐI CÙNG để lấy tin nhắn mới nhất
            if (page === null && totalPagesFromAPI > 0) {
                const lastPage = totalPagesFromAPI - 1;
                console.log(`🔄 Loading last page (${lastPage}) for newest messages`);
                setTotalPages(totalPagesFromAPI);

                // Load lại trang cuối cùng
                const lastPageResponse = await chatService.getMessagesByUserId(RECEIVER_ID, lastPage, PAGE_SIZE);
                const lastPageMessages = lastPageResponse.content || [];

                setMessages(sortMessagesByTime(lastPageMessages));
                setCurrentPage(lastPage);
                setHasMore(lastPage > 0); // Còn trang cũ hơn để load không
            } else {
                // Load more: thêm tin nhắn cũ hơn
                setTotalPages(totalPagesFromAPI);

                if (append) {
                    setMessages(prev => sortMessagesByTime([...newMessages, ...prev]));
                } else {
                    setMessages(sortMessagesByTime(newMessages));
                }

                setCurrentPage(pageToLoad);
                setHasMore(pageToLoad > 0); // Còn trang cũ hơn không
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreMessages = () => {
        if (!loadingMore && hasMore && currentPage !== null && currentPage > 0) {
            const previousPage = currentPage - 1;
            console.log("📄 Loading older messages, page:", previousPage);
            fetchMessages(previousPage, true);
        }
    };

    const formatVNTime = (utcString) => {
        if (!utcString) return "";
        return new Date(utcString).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
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

            // 1. Lưu DB
            console.log("💾 Saving message to DB...");
            const newMessage = await chatService.sendMessage(data);
            console.log("✅ Saved to DB:", newMessage.id);

            // 2. Thêm tin nhắn vào UI ngay lập tức (giống web)
            setMessages((prev) => sortMessagesByTime([...prev, newMessage]));
            console.log("✅ Added message to UI immediately");

            // 3. Gửi WebSocket để người khác nhận được
            if (wsConnected) {
                const wsMessage = {
                    ...newMessage,
                    timestamp: new Date().toISOString()
                };
                console.log("🚀 Sending via WebSocket:", wsMessage);
                webSocketService.send("/app/chat.private", wsMessage);
            } else {
                console.warn("⚠️ WebSocket not connected");
            }

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

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

        return (
            <View
                style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
                ]}
            >
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
                        {formatVNTime(item.createdAt || item.timestamp)}
                    </Text>
                </View>
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
                    {/* Header */}
                    <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.avatar}>
                                <Icon name="person" size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.headerTitle}>Chat Support</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: wsConnected ? '#4ADE80' : '#EF4444',
                                        marginRight: 6
                                    }} />
                                    <Text style={styles.headerSubtitle}>
                                        {wsConnected ? "Online" : "Connecting..."}
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
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item, index) =>
                                item.id?.toString() || index.toString()
                            }
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() =>
                                flatListRef.current?.scrollToEnd({ animated: true })
                            }
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.5}
                            ListHeaderComponent={
                                loadingMore ? (
                                    <View style={{ padding: 16, alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color="#3B82F6" />
                                        <Text style={{ marginTop: 8, color: '#64748B', fontSize: 12 }}>
                                            Loading more messages...
                                        </Text>
                                    </View>
                                ) : null
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Icon name="chat-bubble-outline" size={48} color="#BFDBFE" />
                                    <Text style={styles.emptyText}>No messages yet</Text>
                                    <Text style={styles.emptySubtext}>
                                        Start a conversation!
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
                                    placeholder="Type a message..."
                                    placeholderTextColor="#94A3B8"
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
                                        <Icon name="send" size={18} color="#FFF" />
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
