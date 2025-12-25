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
    StatusBar,
} from "react-native";
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
            activeOpacity={0.9}
            style={styles.templateCard}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
        >
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.imageContainer}>
                    {item.bannerUrl && item.bannerUrl.length > 0 ? (
                        <Image
                            source={{ uri: item.bannerUrl }}
                            style={styles.templateImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Icon name="image" size={40} color={styles.colors.textMuted} />
                        </View>
                    )}

                    <View style={styles.badge}>
                        <View style={styles.badgeGradient}>
                            <Icon name="stars" size={10} color="#FFF" />
                            <Text style={styles.badgeText}>PREMIUM</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>
                        {item.description || "Professional template ready to use"}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.pageCountBadge}>
                            <Icon name="layers" size={12} color={styles.colors.textSecondary} />
                            <Text style={styles.itemCountText}>
                                {item.items?.length || 0} {item.items?.length !== 1 ? "pages" : "page"}
                            </Text>
                        </View>
                        <View style={styles.useButton}>
                            <Text style={styles.useButtonText}>Use</Text>
                            <Icon name="arrow-forward" size={12} color="#FFF" />
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
            // Filter to only show TEMPLATES
            const filteredTemplates = (data || []).filter(item => item.type === "TEMPLATES");
            setTemplates(filteredTemplates);
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
                    visibilityTime: 2000,
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

    const isDark = theme === "dark";

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={styles.colors.headerBackground}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={22} color={styles.colors.textSecondary} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>
                            Choose Template
                        </Text>
                        <Text style={{ fontSize: 12, color: styles.colors.textSecondary }}>
                            {templates.length} templates available
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={styles.colors.loadingColor} />
                        <Text style={styles.loadingText}>Loading templates...</Text>
                    </View>
                </View>
            ) : templates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Icon name="inventory-2" size={48} color={styles.colors.primaryBlue} />
                    </View>
                    <Text style={styles.emptyTitle}>No Templates Yet</Text>
                    <Text style={styles.emptyDescription}>
                        Discover beautiful templates in our store{"\n"}and start creating amazing projects
                    </Text>
                    <TouchableOpacity
                        style={styles.storeButton}
                        onPress={() => navigation.navigate("ResourceStore")}
                    >
                        <View style={styles.storeButtonGradient}>
                            <Icon name="store" size={20} color="#FFF" />
                            <Text style={styles.storeButtonText}>Browse Store</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={templates}
                    renderItem={renderTemplateItem}
                    keyExtractor={(item) => item.resourceTemplateId.toString()}
                    numColumns={4}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Creating Overlay */}
            {creating && (
                <View style={styles.creatingOverlay}>
                    <View style={styles.creatingBox}>
                        <View style={styles.creatingIconContainer}>
                            <ActivityIndicator size="large" color="#FFF" />
                        </View>
                        <Text style={styles.creatingText}>Creating your project</Text>
                        <Text style={styles.creatingSubtext}>This will only take a moment...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}