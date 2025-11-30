// GuestHomeScreen.jsx - Homepage for unauthenticated users
import React, {
    useEffect,
    useState,
    useCallback,
    useContext,
} from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { styles, columns, CARD_GAP } from "../HomeScreen/HomeScreen.styles";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import LazyImage from "../../../common/LazyImage";
import * as offlineStorage from "../../../utils/offlineStorage";
import { useToast } from "../../../hooks/use-toast";
import { AuthContext } from "../../../context/AuthContext";

const { width } = Dimensions.get("window");

const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export default function GuestHomeScreen({ navigation }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [storageWarning, setStorageWarning] = useState(false);
    const { isGuest } = useContext(AuthContext);
    const { toast } = useToast();
    const fade = useSharedValue(0);

    useEffect(() => {
        fade.value = withTiming(1, { duration: 500 });
    }, []);

    const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

    // Load local projects
    const fetchLocalProjects = useCallback(async () => {
        try {
            setLoading(true);
            const localProjects = await offlineStorage.getAllGuestProjects();
            setProjects(localProjects || []);

            // Check storage usage
            const usage = await offlineStorage.checkStorageUsage();
            if (usage.percentage > 80) {
                setStorageWarning(true);
                toast({
                    title: "Storage Warning",
                    description: `You're using ${usage.percentage}% of local storage. Consider deleting old projects.`,
                    variant: "warning",
                });
            }
        } catch (err) {
            console.error("Failed to load local projects:", err);
            toast({
                title: "Error",
                description: "Failed to load projects",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLocalProjects();
    }, [fetchLocalProjects]);

    // Handle project click
    const handleProjectClick = useCallback(
        async (project) => {
            try {
                const config = {
                    projectId: project.projectId,
                    title: project.name || "Untitled",
                    description: project.description || "",
                    hasCover: !!project.imageUrl,
                    orientation: project.orientation || "portrait",
                    paperSize: project.paperSize || "A4",
                    cover: project.imageUrl
                        ? { template: "custom_image", imageUrl: project.imageUrl }
                        : null,
                    paper: { template: "blank" },
                    pages: project.pages || [],
                    isLocal: true, // Mark as local project
                };
                navigation.navigate("DrawingScreen", { noteConfig: config });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to open project",
                    variant: "destructive",
                });
            }
        },
        [navigation, toast]
    );

    // Delete project
    const handleDeleteProject = useCallback(
        async (project) => {
            Alert.alert(
                "Delete Project",
                `Are you sure you want to delete "${project.name || "Untitled"}"?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await offlineStorage.deleteGuestProject(project.projectId);
                                setProjects((prev) =>
                                    prev.filter((p) => p.projectId !== project.projectId)
                                );
                                toast({
                                    title: "Success",
                                    description: "Project deleted",
                                    variant: "success",
                                });
                            } catch (error) {
                                toast({
                                    title: "Error",
                                    description: "Failed to delete project",
                                    variant: "destructive",
                                });
                            }
                        },
                    },
                ]
            );
        },
        [toast]
    );

    // Render project card
    const renderProjectItem = useCallback(
        ({ item }) => (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.cardWrapper}
                onPress={() => handleProjectClick(item)}
            >
                <View style={styles.card}>
                    <View style={styles.imageContainer}>
                        {item.imageUrl ? (
                            <LazyImage
                                source={{ uri: item.imageUrl }}
                                style={styles.projectImage}
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Icon name="insert-drive-file" size={48} color="#BFDBFE" />
                            </View>
                        )}
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.08)"]}
                            style={styles.imageGradient}
                        />
                        <TouchableOpacity
                            style={styles.threeDotButton}
                            onPress={() => handleDeleteProject(item)}
                        >
                            <Icon name="delete" size={24} color="#EF4444" />
                        </TouchableOpacity>
                        {/* Local badge */}
                        <View
                            style={{
                                position: "absolute",
                                top: 8,
                                left: 8,
                                backgroundColor: "rgba(96, 165, 250, 0.9)",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 12,
                            }}
                        >
                            <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>
                                LOCAL
                            </Text>
                        </View>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.projectTitle} numberOfLines={1}>
                            {item.name || "Untitled"}
                        </Text>
                        <Text style={styles.projectDescription} numberOfLines={2}>
                            {item.description || ""}
                        </Text>
                        <View style={styles.cardFooter}>
                            <View style={styles.dateContainer}>
                                <Icon name="schedule" size={14} color="#60A5FA" />
                                <Text style={styles.dateText}>
                                    {formatDate(item.createdAt)}
                                </Text>
                            </View>
                            <Icon name="arrow-forward-ios" size={16} color="#3B82F6" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ),
        [handleProjectClick, handleDeleteProject]
    );

    return (
        <View style={styles.container}>
            <View style={styles.main}>
                <Animated.View style={[styles.content, fadeStyle]}>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>Guest Mode</Text>
                            <LottieView
                                source={require("../../../assets/cat.json")}
                                autoPlay
                                loop
                                style={{ width: 80, height: 70, marginLeft: -10 }}
                            />
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={[
                                    styles.createButton,
                                    {
                                        backgroundColor: "#3B82F6",
                                        marginRight: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 10,
                                        paddingVertical: 10,

                                    },
                                ]}
                                onPress={() => navigation.navigate("Login")}
                            >
                                <Icon name="login" size={18} color="#FFF" />
                                <Text style={[styles.createButtonText, { marginLeft: 6 }]}>
                                    Login
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => navigation.navigate("NoteSetupScreen", { isGuest: true })}
                            >
                                <LinearGradient
                                    colors={["#3B82F6", "#2563EB"]}
                                    style={styles.createButtonGradient}
                                >
                                    <Icon name="add" size={20} color="#FFF" />
                                    <Text style={styles.createButtonText}>New</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Guest Mode Banner */}
                    <View
                        style={{
                            marginHorizontal: 16,
                            marginBottom: 12,
                            padding: 12,
                            backgroundColor: "#EFF6FF",
                            borderRadius: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: "#3B82F6",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Icon name="info" size={20} color="#3B82F6" />
                            <Text
                                style={{
                                    marginLeft: 8,
                                    flex: 1,
                                    fontSize: 13,
                                    color: "#1E40AF",
                                    fontWeight: "600",
                                }}
                            >
                                You're in Guest Mode. Login to save projects to cloud and share
                                with others.
                            </Text>
                        </View>
                    </View>

                    {/* Storage Warning */}
                    {storageWarning && (
                        <View
                            style={{
                                marginHorizontal: 16,
                                marginBottom: 12,
                                padding: 12,
                                backgroundColor: "#FEF3C7",
                                borderRadius: 12,
                                borderLeftWidth: 4,
                                borderLeftColor: "#F59E0B",
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Icon name="warning" size={20} color="#F59E0B" />
                                <Text
                                    style={{
                                        marginLeft: 8,
                                        flex: 1,
                                        fontSize: 13,
                                        color: "#92400E",
                                        fontWeight: "600",
                                    }}
                                >
                                    Storage is running low. Delete old projects or login to sync
                                    to cloud.
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* MAIN CONTENT */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <LottieView
                                source={loadingAnimation}
                                autoPlay
                                loop
                                style={{ width: 300, height: 300 }}
                            />
                        </View>
                    ) : projects.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <Icon name="folder-open" size={64} color="#BFDBFE" />
                            <Text style={styles.emptyTitle}>No Local Projects</Text>
                            <Text style={styles.emptyText}>
                                Create your first sketchnote!
                            </Text>
                            <TouchableOpacity
                                style={styles.createFirstButton}
                                onPress={() => navigation.navigate("NoteSetupScreen", { isGuest: true })}
                            >
                                <Text style={styles.createFirstButtonText}>
                                    Create First Project
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View
                                style={{
                                    paddingHorizontal: 16,
                                    marginBottom: 12,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Icon name="phone-android" size={22} color="#084F8C" />
                                    <Text
                                        style={{
                                            fontSize: 19,
                                            fontWeight: "800",
                                            color: "#084F8C",
                                        }}
                                    >
                                        Local Projects ({projects.length})
                                    </Text>
                                </View>
                            </View>

                            <FlatList
                                data={projects}
                                renderItem={renderProjectItem}
                                keyExtractor={(item) => item.projectId}
                                numColumns={columns}
                                columnWrapperStyle={{
                                    gap: CARD_GAP,
                                    paddingHorizontal: 16,
                                    marginBottom: 16,
                                }}
                                contentContainerStyle={{ paddingBottom: 40 }}
                            />
                        </>
                    )}
                </Animated.View>
            </View>
        </View>
    );
}
