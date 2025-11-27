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
import { chatService } from "../service/chatService";
import { useToast } from "../hooks/use-toast";
import { styles } from "./ChatWidget.styles";

const RECEIVER_ID = 8;

export default function ChatWidget({ visible, onClose }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);
    const { toast } = useToast();
    const slideAnim = useRef(new Animated.Value(500)).current;

    useEffect(() => {
        if (visible) {
            fetchMessages();
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 500,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await chatService.getMessagesByUserId(RECEIVER_ID, 0, 50);

            // 🔥 Reverse để tin nhắn mới nhất nằm DƯỚI
            setMessages((response.content || []).reverse());
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: error.message || "Failed to load messages",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
const formatVNTime = (utcString) => {
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

            const newMessage = await chatService.sendMessage(data);

            // 🔥 Add message cuối list
            setMessages((prev) => [...prev, newMessage]);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            toast({
                title: "Success",
                description: "Message sent!",
                variant: "success",
            });
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: error.message || "Failed to send message",
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

                    {/* 🔥 FORMAT TIME ENGLISH */}
                    <Text
                        style={[
                            styles.messageTime,
                            isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
                        ]}
                    >
                        {formatVNTime(item.createdAt)}
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
                                <Text style={styles.headerSubtitle}>User #{RECEIVER_ID}</Text>
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
