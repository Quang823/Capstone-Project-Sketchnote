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
    Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from "expo-image-picker";
import { chatService } from "../service/chatService";
import { webSocketService } from "../service/webSocketService";
import { useToast } from "../hooks/use-toast";
import { getStyles } from "./ChatWidget.styles";
import { authService } from "../service/authService";
import { useTheme } from "../context/ThemeContext";
import { uploadToCloudinary } from "../service/cloudinary";



export default function ChatWidget({ visible, onClose }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);

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
                console.warn("Error fetching current user profile:", error);
            }
        };
        const getAdminUsers = async () => {
            try {
                const adminUsers = await authService.getUserRoleAdmin();
                setAdminUsers(adminUsers);

            } catch (error) {
                console.warn("Error fetching admin users:", error);
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

                // Map isImage field properly for image display
                const messageWithImageFlag = {
                    ...message,
                    isImage: message.isImage || message.image || false,
                };
                return sortMessagesByTime([...prev, messageWithImageFlag]);
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
                const lastPageMessages = (lastPageResponse.content || []).map(msg => ({
                    ...msg,
                    isImage: msg.isImage || msg.image || false,
                }));

                setMessages(sortMessagesByTime(lastPageMessages));
                setCurrentPage(lastPage);
                setHasMore(lastPage > 0);
            } else {
                setTotalPages(totalPagesFromAPI);

                // Map isImage field for API messages
                const mappedMessages = newMessages.map(msg => ({
                    ...msg,
                    isImage: msg.isImage || msg.image || false,
                }));

                if (append) {
                    setMessages(prev => sortMessagesByTime([...mappedMessages, ...prev]));
                } else {
                    setMessages(sortMessagesByTime(mappedMessages));
                }

                setCurrentPage(pageToLoad);
                setHasMore(pageToLoad > 0);
            }
        } catch (error) {
            console.warn("Fetch messages error:", error);
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

    // Image handling functions
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Please allow access to photo library");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            setImageUri(result.assets[0].uri);
        } catch (error) {
            console.error("Pick image error:", error);
            Alert.alert("Error", "Cannot select image");
        }
    };

    const clearImage = () => {
        setImageUri(null);
    };

    // Helper function to send a single message
    const sendSingleMessage = async (content, isImage) => {
        const data = {
            receiverId: RECEIVER_ID,
            content: content,
            image: isImage,
        };

        const newMessage = await chatService.sendMessage(data);

        // Add isImage flag to local message
        const messageWithFlag = { ...newMessage, isImage: isImage };
        setMessages((prev) => sortMessagesByTime([...prev, messageWithFlag]));

        if (wsConnected) {
            const wsMessage = {
                senderId: newMessage.senderId,
                senderName: newMessage.senderName,
                senderAvatarUrl: newMessage.senderAvatarUrl,
                receiverId: newMessage.receiverId,
                content: newMessage.content,
                image: isImage, // Use 'image' to match Java backend field serialization
                timestamp: newMessage.createdAt
            };
            webSocketService.send("/app/chat.private", wsMessage);
        }

        return newMessage;
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() && !imageUri) return;

        const messageContent = inputText.trim();
        setInputText("");
        setSending(true);

        try {
            // If there's an image, upload and send it first
            if (imageUri) {
                setUploading(true);
                try {
                    const uploaded = await uploadToCloudinary(imageUri);
                    const imageUrl = uploaded.secure_url;
                    clearImage();

                    // Send image message
                    await sendSingleMessage(imageUrl, true);
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
                    toast({
                        title: "Error",
                        description: "Failed to upload image",
                        variant: "destructive",
                    });
                    setInputText(messageContent);
                    setUploading(false);
                    setSending(false);
                    return;
                }
                setUploading(false);
            }

            // If there's also text, send it as a separate message
            if (messageContent) {
                await sendSingleMessage(messageContent, false);
            }

        } catch (error) {
            console.warn("Send failed:", error);
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
        const isImageMessage = item.isImage || item.image || false;

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
                    {isImageMessage ? (
                        <TouchableOpacity activeOpacity={0.9}>
                            <Image
                                source={{ uri: item.content }}
                                style={{
                                    width: 220,
                                    height: 165,
                                    borderRadius: 12,
                                }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
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
                        </View>
                    )}

                    <Text
                        style={[
                            styles.messageTime,
                            isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                            isImageMessage && { marginTop: 4 },
                        ]}
                    >
                        {new Date(item.createdAt || item.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
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
                            {/* Image Preview */}
                            {imageUri && (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 8,
                                    paddingHorizontal: 4
                                }}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 8,
                                            marginRight: 8,
                                        }}
                                    />
                                    <TouchableOpacity
                                        onPress={clearImage}
                                        style={{
                                            backgroundColor: '#EF4444',
                                            borderRadius: 12,
                                            padding: 4,
                                        }}
                                    >
                                        <Icon name="close" size={16} color="#FFF" />
                                    </TouchableOpacity>
                                    {uploading && (
                                        <View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
                                            <ActivityIndicator size="small" color="#5c66f6" />
                                            <Text style={{ marginLeft: 4, fontSize: 12, color: '#64748B' }}>Uploading...</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.inputWrapper}>
                                {/* Image Picker Button */}
                                <TouchableOpacity
                                    onPress={pickImage}
                                    disabled={sending || uploading}
                                    style={{
                                        padding: 8,
                                        marginRight: 4,
                                        opacity: (sending || uploading) ? 0.5 : 1,
                                    }}
                                >
                                    <Icon name="image" size={24} color="#5c66f6" />
                                </TouchableOpacity>

                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder={imageUri ? "Add a caption..." : "Sketch your message..."}
                                    placeholderTextColor={styles.colors.inputPlaceholder}
                                    multiline
                                    maxLength={1000}
                                    editable={!sending && !uploading}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() && !imageUri || sending || uploading) && styles.sendButtonDisabled,
                                    ]}
                                    onPress={handleSendMessage}
                                    disabled={(!inputText.trim() && !imageUri) || sending || uploading}
                                >
                                    {(sending || uploading) ? (
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