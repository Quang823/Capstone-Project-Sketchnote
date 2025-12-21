import React, { useState, useContext, useMemo } from "react";
import {
    View,
    Text,
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
import { getStyles } from "./CustomNoteSetupScreen.styles";
import { useTheme } from "../../context/ThemeContext";

export default function CustomNoteSetupScreen({ navigation }) {
    const { user, fetchUser } = useContext(AuthContext);
    const { toast } = useToast();
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

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

            // Refresh user profile to update project count (in background, no full-screen loading)
            if (fetchUser) fetchUser(false);
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
                        <MaterialCommunityIcons name={icon} size={32} color={styles.colors.iconColor} />
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
                    <SidebarToggleButton iconSize={24} iconColor={styles.colors.backButtonIcon} />
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
                            color={styles.colors.iconColor}
                        />
                        <Text style={styles.cardTitle}>Notebook Title</Text>
                    </View>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Enter notebook title..."
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor={styles.colors.inputPlaceholder}
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
                            color={styles.colors.iconColor}
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
                        color={theme === 'dark' ? "#F59E0B" : "#F59E0B"}
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
