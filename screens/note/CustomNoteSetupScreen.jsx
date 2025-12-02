import React, { useState, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { projectService } from "../../service/projectService";
import { uploadToCloudinary } from "../../service/cloudinary";
import * as offlineStorage from "../../utils/offlineStorage";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";

export default function CustomNoteSetupScreen({ navigation }) {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [title, setTitle] = useState("");
    const [coverImage, setCoverImage] = useState(null);
    const [paperImage, setPaperImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const pickImage = async (type) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                if (type === "cover") setCoverImage(result.assets[0].uri);
                else setPaperImage(result.assets[0].uri);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to pick image",
                variant: "destructive",
            });
        }
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            toast({
                title: "Required",
                description: "Please enter a notebook title",
                variant: "destructive",
            });
            return;
        }
        if (!coverImage) {
            toast({
                title: "Required",
                description: "Please select a cover image",
                variant: "destructive",
            });
            return;
        }
        if (!paperImage) {
            toast({
                title: "Required",
                description: "Please select a paper background image",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            setUploading(true);

            const [coverUrlData, paperUrlData] = await Promise.all([
                uploadToCloudinary(coverImage),
                uploadToCloudinary(paperImage),
            ]);

            const coverUrl = coverUrlData.secure_url;
            const paperUrl = paperUrlData.secure_url;

            const projectData = {
                name: title.trim(),
                description: "Custom Notebook",
                imageUrl: coverUrl,
                orientation: "portrait",
            };

            const created = await projectService.createProject(projectData);
            const projectId = created?.projectId || created?.id || created?._id;

            if (!projectId) throw new Error("Failed to create project");

            const pageNumber = 2;
            const dataObject = {
                type: "paper",
                backgroundColor: "#FFFFFF",
                template: "custom_image",
                imageUrl: paperUrl,
                layers: [
                    { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
                ],
                strokes: [],
            };

            const uploadedPage = await projectService.uploadPageToS3(
                projectId,
                pageNumber,
                dataObject
            );

            await projectService.createPage({
                projectId,
                pages: [{ pageNumber, strokeUrl: uploadedPage.url }],
            });

            await offlineStorage.saveProjectLocally(`${projectId}_meta`, {
                orientation: "portrait",
                paperSize: "A4",
            });

            const noteConfig = {
                projectId,
                title: title.trim(),
                description: "Custom Notebook",
                hasCover: true,
                orientation: "portrait",
                paperSize: "A4",
                cover: { template: "custom_image", imageUrl: coverUrl },
                paper: { template: "custom_image", imageUrl: paperUrl },
                pages: [
                    {
                        pageId: 1,
                        pageNumber: 1,
                        type: "cover",
                        imageUrl: coverUrl,
                    },
                    {
                        pageId: 10001,
                        pageNumber: pageNumber,
                        imageUrl: paperUrl,
                        strokeUrl: uploadedPage.url,
                    },
                ],
                projectDetails: created,
            };

            navigation.replace("DrawingScreen", { noteConfig });
        } catch (error) {
            console.error("Create custom note error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create custom notebook",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const ImagePickerCard = ({ image, onPress, label, icon }) => (
        <TouchableOpacity
            style={styles.imageCard}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {image ? (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                    <View style={styles.imageOverlay}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                        <Text style={styles.overlayText}>Change</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyImageCard}>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name={icon} size={32} color="#3B82F6" />
                    </View>
                    <Text style={styles.emptyLabel}>{label}</Text>
                    <Text style={styles.emptyHint}>Tap to choose</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <SidebarToggleButton iconSize={24} iconColor="#1E40AF" />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Create Custom Notebook</Text>
                        <Text style={styles.headerSubtitle}>
                            Add your cover & page background
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title Section */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons
                            name="format-title"
                            size={20}
                            color="#3B82F6"
                        />
                        <Text style={styles.cardTitle}>Notebook Title</Text>
                    </View>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Enter notebook title..."
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#94A3B8"
                        maxLength={50}
                    />
                    <Text style={styles.charCount}>{title.length}/50</Text>
                </View>

                {/* Images Grid */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons
                            name="image-multiple"
                            size={20}
                            color="#3B82F6"
                        />
                        <Text style={styles.cardTitle}>Images</Text>
                    </View>

                    <View style={styles.imagesGrid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Cover Image</Text>
                            <ImagePickerCard
                                image={coverImage}
                                onPress={() => pickImage("cover")}
                                label="Cover Image"
                                icon="image-area"
                            />
                        </View>

                        <View style={styles.gridItem}>
                            <Text style={styles.gridLabel}>Paper Background</Text>
                            <ImagePickerCard
                                image={paperImage}
                                onPress={() => pickImage("paper")}
                                label="Paper Background"
                                icon="texture-box"
                            />
                        </View>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <MaterialCommunityIcons
                        name="lightbulb-on-outline"
                        size={20}
                        color="#F59E0B"
                    />
                    <Text style={styles.tipsText}>
                        <Text style={styles.tipsBold}>Tips: </Text>
                        Choose a cover and paper background to personalize your notebook.
                        Recommended ratio: 3:4 (portrait)
                    </Text>
                </View>
            </ScrollView>

            {/* Create Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreate}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={
                            loading ? ["#94A3B8", "#64748B"] : ["#3B82F6", "#2563EB"]
                        }
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="#FFF" size="small" />
                                <Text style={styles.buttonText}>
                                    {uploading ? "Uploading..." : "Creating..."}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={20}
                                    color="#FFF"
                                />
                                <Text style={styles.buttonText}>Create Notebook</Text>
                            </View>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F5F9",
    },
    header: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 26,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
    },
    titleInput: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#0F172A",
        fontWeight: "500",
    },
    charCount: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 8,
        textAlign: "right",
    },
    imagesGrid: {
        flexDirection: "row",
        gap: 12,
    },
    gridItem: {
        flex: 1,
    },
    gridLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
    },

    // 🔽 SMALLER IMAGE CARDS (updated)
    imageCard: {
        height: 165, // ↓↓↓ Thu nhỏ ảnh
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F8FAFC",
        borderWidth: 2,
        borderColor: "#E2E8F0",
    },

    imageContainer: {
        flex: 1,
        position: "relative",
    },
    selectedImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    imageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    overlayText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyImageCard: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    emptyLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginBottom: 4,
    },
    emptyHint: {
        fontSize: 12,
        color: "#94A3B8",
    },
    tipsCard: {
        backgroundColor: "#FFFBEB",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        gap: 12,
        borderWidth: 1,
        borderColor: "#FEF3C7",
    },
    tipsText: {
        flex: 1,
        fontSize: 13,
        color: "#92400E",
        lineHeight: 20,
    },
    tipsBold: {
        fontWeight: "700",
    },
    footer: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        padding: 16,
        paddingBottom: 20,
    },
    createButton: {
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        width: "30%",
        alignSelf: "center",
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});
