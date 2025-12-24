import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { imageService } from "../../../service/imageService";
import loadingAnimation from "../../../assets/waiting.json";
import LazyImage from "../../../common/LazyImage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AIImageChatModal = ({ visible, onClose, onImageSelect }) => {
    const [prompt, setPrompt] = useState("");
    const [size, setSize] = useState("1024x1024");
    const [isIcon, setIsIcon] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImages, setGeneratedImages] = useState([]);
    const [error, setError] = useState(null);

    const sizeOptions = ["512x512", "1024x1024", "1536x1536"];

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            return;
        }

        setError(null);
        setIsGenerating(true);
        setGeneratedImages([]);

        try {
            const result = await imageService.generateImage(prompt, size, isIcon);

            if (result?.imageUrls && Array.isArray(result.imageUrls)) {
                setGeneratedImages(result.imageUrls);
            } else {
                setError("No images generated");
            }
        } catch (err) {
            setError(err.message || "Failed to generate image");
            console.warn("Error generating image:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageClick = (imageUrl) => {
        onImageSelect?.(imageUrl);
        // Clear and close after selection
        setGeneratedImages([]);
        setPrompt("");
        onClose?.();
    };

    const handleClose = () => {
        setGeneratedImages([]);
        setPrompt("");
        setError(null);
        onClose?.();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Icon name="auto-awesome" size={24} color="#3B82F6" />
                        <Text style={styles.headerTitle}>AI Image Generator</Text>
                        <Pressable onPress={handleClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#6B7280" />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Prompt Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Prompt</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter your image description..."
                                placeholderTextColor="#9CA3AF"
                                value={prompt}
                                onChangeText={setPrompt}
                                multiline
                                numberOfLines={3}
                                editable={!isGenerating}
                            />
                        </View>

                        {/* Size Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Image Size</Text>
                            <View style={styles.sizeContainer}>
                                {sizeOptions.map((sizeOption) => (
                                    <Pressable
                                        key={sizeOption}
                                        style={[
                                            styles.sizeButton,
                                            size === sizeOption && styles.sizeButtonActive,
                                        ]}
                                        onPress={() => setSize(sizeOption)}
                                        disabled={isGenerating}
                                    >
                                        <Text
                                            style={[
                                                styles.sizeButtonText,
                                                size === sizeOption && styles.sizeButtonTextActive,
                                            ]}
                                        >
                                            {sizeOption}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Icon Toggle */}
                        <View style={styles.inputGroup}>
                            <View style={styles.toggleRow}>
                                <Text style={styles.label}>Generate as Icon</Text>
                                <Pressable
                                    style={[styles.toggle, isIcon && styles.toggleActive]}
                                    onPress={() => setIsIcon(!isIcon)}
                                    disabled={isGenerating}
                                >
                                    <View
                                        style={[
                                            styles.toggleThumb,
                                            isIcon && styles.toggleThumbActive,
                                        ]}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        {/* Generate Button */}
                        <Pressable
                            style={[styles.generateButton, isGenerating && styles.buttonDisabled]}
                            onPress={handleGenerate}
                            disabled={isGenerating}
                        >
                            <Icon
                                name="auto-awesome"
                                size={20}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.generateButtonText}>
                                {isGenerating ? "Generating..." : "Generate Image"}
                            </Text>
                        </Pressable>

                        {/* Error Message */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Icon name="error-outline" size={20} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Loading Animation */}
                        {isGenerating && (
                            <View style={styles.loadingContainer}>
                                <LottieView
                                    source={loadingAnimation}
                                    autoPlay
                                    loop
                                    style={styles.lottie}
                                />
                                <Text style={styles.loadingText}>Creating your image...</Text>
                            </View>
                        )}

                        {/* Generated Images */}
                        {!isGenerating && generatedImages.length > 0 && (
                            <View style={styles.imagesContainer}>
                                <Text style={styles.imagesTitle}>Generated Images</Text>
                                <View style={styles.imagesGrid}>
                                    {generatedImages.map((imageUrl, index) => (
                                        <Pressable
                                            key={index}
                                            style={styles.imageCard}
                                            onPress={() => handleImageClick(imageUrl)}
                                        >
                                            <LazyImage
                                                source={{ uri: imageUrl }}
                                                style={styles.generatedImage}
                                            />
                                            <View style={styles.imageOverlay}>
                                                <Icon name="add-circle" size={32} color="#FFFFFF" />
                                                <Text style={styles.imageOverlayText}>Add to Canvas</Text>
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 600,
        height: SCREEN_HEIGHT * 0.75,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        gap: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: "#F9FAFB",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#111827",
        minHeight: 80,
        textAlignVertical: "top",
    },
    sizeContainer: {
        flexDirection: "row",
        gap: 8,
    },
    sizeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#F9FAFB",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        borderRadius: 10,
        alignItems: "center",
    },
    sizeButtonActive: {
        backgroundColor: "#EFF6FF",
        borderColor: "#3B82F6",
    },
    sizeButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
    },
    sizeButtonTextActive: {
        color: "#3B82F6",
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggle: {
        width: 52,
        height: 28,
        backgroundColor: "#E5E7EB",
        borderRadius: 14,
        padding: 2,
        justifyContent: "center",
    },
    toggleActive: {
        backgroundColor: "#3B82F6",
    },
    toggleThumb: {
        width: 24,
        height: 24,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    toggleThumbActive: {
        alignSelf: "flex-end",
    },
    generateButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#3B82F6",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: "#9CA3AF",
        shadowOpacity: 0,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        padding: 12,
        borderRadius: 10,
        marginTop: 12,
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        color: "#EF4444",
        flex: 1,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 32,
    },
    lottie: {
        width: 150,
        height: 150,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#6B7280",
        marginTop: 16,
    },
    imagesContainer: {
        marginTop: 20,
    },
    imagesTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
    },
    imagesGrid: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
    },
    imageCard: {
        width: (SCREEN_WIDTH * 0.9 - 64) / 2,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F3F4F6",
        position: "relative",
    },
    generatedImage: {
        width: "100%",
        height: "100%",
    },
    imageOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(59, 130, 246, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        opacity: 0,
    },
    imageOverlayText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
        marginTop: 4,
    },
});

export default AIImageChatModal;
