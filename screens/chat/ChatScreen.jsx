import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { chatService } from "../../service/chatService";
import { useToast } from "../../hooks/use-toast";
import { styles } from "./ChatScreen.styles";

const RECEIVER_ID = 8; // Hardcoded receiver ID as requested

export default function ChatScreen({ navigation }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(0);
    const flatListRef = useRef(null);
    const { toast } = useToast();

    // Fetch messages
    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await chatService.getMessagesByUserId(RECEIVER_ID, page, 50);
            setMessages(response.content || []);
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to load messages",
                variant: "destructive",
            });
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    // Send message
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

            // Add the new message to the list
            setMessages((prev) => [...prev, newMessage]);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

            toast({
                title: "Success",
                description: "Message sent!",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send message",
                variant: "destructive",
            });
            console.log(error)
            // Restore the input text if failed
            setInputText(messageContent);
        } finally {
            setSending(false);
        }
    };

    // Render message item
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
                        {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.avatar}>
                        <Icon name="person" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>User #{RECEIVER_ID}</Text>
                        <Text style={styles.headerSubtitle}>Online</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Icon name="more-vert" size={24} color="#FFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Messages List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="chat-bubble-outline" size={64} color="#BFDBFE" />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>
                                Start a conversation by sending a message!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity style={styles.attachButton}>
                            <Icon name="attach-file" size={24} color="#64748B" />
                        </TouchableOpacity>
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
                                <Icon name="send" size={20} color="#FFF" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
