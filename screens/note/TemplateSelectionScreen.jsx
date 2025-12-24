import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Image,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import { orderService } from "../../service/orderService";
import { projectService } from "../../service/projectService";
import * as offlineStorage from "../../utils/offlineStorage";
import { useToast } from "../../hooks/use-toast";
import { getStyles } from "./TemplateSelectionScreen.styles";
import { useTheme } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const AnimatedTemplateCard = ({ item, onPress, disabled, styles }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.templateCard}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.imageContainer}>
                    {item.images && item.images.length > 0 ? (
                        <Image
                            source={{ uri: item.images[0] }}
                            style={styles.templateImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={styles.colors.imagePlaceholderGradient}
                            style={styles.placeholderImage}
                        >
                            <Icon name="image" size={56} color={styles.colors.imagePlaceholderIcon} />
                        </LinearGradient>
                    )}
                    <LinearGradient
                        colors={["transparent", "rgba(0,0,0,0.4)"]}
                        style={styles.imageGradient}
                    />
                    <View style={styles.badge}>
                        <LinearGradient
                            colors={styles.colors.badgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.badgeGradient}
                        >
                            <Icon name="stars" size={12} color="#FFF" />
                            <Text style={styles.badgeText}>PREMIUM</Text>
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.cardInfo}>
                    <Text style={styles.templateTitle} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.templateDescription} numberOfLines={2}>
                        {item.description || "Professional template ready to use"}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.itemCount}>
                            <View style={styles.pageCountBadge}>
                                <Icon name="layers" size={14} color={styles.colors.pageCountText} />
                                <Text style={styles.itemCountText}>
                                    {item.items?.length || 0} {item.items?.length !== 1 ? "pages" : "page"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.useButton}>
                            <Text style={styles.useButtonText}>Use</Text>
                            <Icon name="arrow-forward" size={14} color={styles.colors.useButtonText} />
                        </View>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function TemplateSelectionScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { toast } = useToast();
    const { fetchUser } = useContext(AuthContext);

    useEffect(() => {
        fetchPurchasedTemplates();
    }, []);

    const fetchPurchasedTemplates = async () => {
        try {
            setLoading(true);
            const data = await orderService.getPurchasedTemplates();
            setTemplates(data || []);
        } catch (error) {
            console.warn("Failed to fetch templates:", error);
            toast({
                title: "Error",
                description: "Failed to load purchased templates",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const createProjectFromTemplate = useCallback(
        async (template) => {
            if (creating) return;

            try {
                setCreating(true);
                toast({
                    title: "Creating...",
                    description: "Creating project from template",
                });

                const projectData = {
                    name: template.name || "Template Project",
                    description: template.description || "Created from template",
                    imageUrl: template.images?.[0] || "",
                    orientation: "portrait",
                    paperSize: "A4",
                };

                const created = await projectService.createProject(projectData);
                const newProjectId = created?.projectId || created?.id || created?._id;

                if (!newProjectId) throw new Error("Failed to create project");

                const items = template.items || [];
                const pagePromises = items.map(async (item, index) => {
                    try {
                        const response = await fetch(item.itemUrl);
                        const templateData = await response.json();

                        const pageNumber = index + 1;
                        const uploaded = await projectService.uploadPageToS3(
                            newProjectId,
                            pageNumber,
                            templateData
                        );

                        return {
                            pageNumber,
                            strokeUrl: uploaded.url,
                            snapshotUrl: item.imageUrl || null,
                        };
                    } catch (error) {
                        console.warn(`Failed to import template item ${index}:`, error);
                        return null;
                    }
                });

                const uploadedPages = (await Promise.all(pagePromises)).filter(Boolean);

                if (uploadedPages.length === 0) {
                    throw new Error("Failed to import template pages");
                }

                await projectService.createPage({
                    projectId: newProjectId,
                    pages: uploadedPages.map((p) => ({
                        pageNumber: p.pageNumber,
                        strokeUrl: p.strokeUrl,
                    })),
                });

                await offlineStorage.saveProjectLocally(`${newProjectId}_meta`, {
                    orientation: projectData.orientation,
                    paperSize: projectData.paperSize,
                });

                toast({
                    title: "Success",
                    description: `Project created with ${uploadedPages.length} page(s)!`,
                    variant: "success",
                });

                const noteConfig = {
                    projectId: newProjectId,
                    title: projectData.name,
                    description: projectData.description,
                    hasCover: !!projectData.imageUrl,
                    orientation: projectData.orientation,
                    paperSize: projectData.paperSize,
                    cover: projectData.imageUrl
                        ? {
                            template: "custom_image",
                            imageUrl: projectData.imageUrl,
                        }
                        : null,
                    paper: { template: "blank" },
                    pages: uploadedPages.map((p, idx) => ({
                        pageId: 10000 + idx,
                        pageNumber: p.pageNumber,
                        strokeUrl: p.strokeUrl,
                        snapshotUrl: p.snapshotUrl,
                    })),
                    projectDetails: created,
                };

                // Refresh user profile to update project count
                if (fetchUser) fetchUser(false);
                navigation.replace("DrawingScreen", { noteConfig });
            } catch (error) {
                console.warn("Create from template error:", error);
                toast({
                    title: "Failed",
                    description: error.message || "Failed to create project from template",
                    variant: "destructive",
                });
            } finally {
                setCreating(false);
            }
        },
        [creating, navigation, toast]
    );

    const renderTemplateItem = ({ item }) => (
        <AnimatedTemplateCard
            item={item}
            onPress={() => createProjectFromTemplate(item)}
            disabled={creating}
            styles={styles}
        />
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={styles.colors.gradient}
                style={styles.background}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={styles.colors.backButtonIcon} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Choose Template</Text>
                    <Text style={styles.headerSubtitle}>{templates.length} templates available</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Loading templates...</Text>
                    </View>
                </View>
            ) : templates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <LinearGradient
                        colors={styles.colors.emptyIconGradient}
                        style={styles.emptyIconContainer}
                    >
                        <Icon name="inventory-2" size={64} color={styles.colors.emptyIcon} />
                    </LinearGradient>
                    <Text style={styles.emptyTitle}>No Templates Yet</Text>
                    <Text style={styles.emptyDescription}>
                        Discover beautiful templates in our store{"\n"}and start creating amazing projects
                    </Text>
                    <TouchableOpacity
                        style={styles.storeButton}
                        onPress={() => navigation.navigate("StoreScreen")}
                    >
                        <LinearGradient
                            colors={["#3B82F6", "#2563EB"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.storeButtonGradient}
                        >
                            <Icon name="store" size={20} color="#FFF" />
                            <Text style={styles.storeButtonText}>Browse Store</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={templates}
                    renderItem={renderTemplateItem}
                    keyExtractor={(item) => item.resourceTemplateId.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Creating Overlay */}
            {creating && (
                <View style={styles.creatingOverlay}>
                    <View style={styles.creatingBox}>
                        <LinearGradient
                            colors={["#3B82F6", "#2563EB"]}
                            style={styles.creatingIconContainer}
                        >
                            <ActivityIndicator size="large" color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.creatingText}>Creating your project</Text>
                        <Text style={styles.creatingSubtext}>This will only take a moment...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}