import Toast from "react-native-toast-message";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    Image
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resourceService } from "../../../service/resourceService";
import MultipleImageUploader from "../../../common/MultipleImageUploader";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./CreateVersionScreen.styles";

export default function CreateVersionScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { resourceTemplateId, productName, currentType, versionId, versionData } = route.params || {};
    const isUpdateMode = !!versionId;

    const { theme } = useTheme();
    const isDark = theme === "dark";
    const styles = useMemo(() => getStyles(theme), [theme]);

    // State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState(currentType || "TEMPLATES");
    const [price, setPrice] = useState("");
    const [expiredTime, setExpiredTime] = useState("");
    const [showExpiredPicker, setShowExpiredPicker] = useState(false);
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [itemSource, setItemSource] = useState("upload");
    const [localItems, setLocalItems] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const getTodayDateOnly = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [releaseDate, setReleaseDate] = useState(getTodayDateOnly());

    useEffect(() => {
        (async () => {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Permission Denied",
                    text2: "App needs photo library access to upload images.",
                });
            }
        })();
        getProjectByUserId();

        if (isUpdateMode && versionData) {
            setName(versionData.name || "");
            setDescription(versionData.description || "");
            setType(versionData.type || currentType || "TEMPLATES");
            setPrice(String((versionData.price || 0) / 1000));
            setExpiredTime(versionData.expiredTime || "");
            setReleaseDate(versionData.releaseDate || getTodayDateOnly());

            if (versionData.images && versionData.images.length > 0) {
                setImages(versionData.images.map(img => img.imageUrl));
            }

            if (versionData.items && versionData.items.length > 0) {
                setLocalItems(versionData.items.map(item => item.itemUrl));
            }
        }
    }, []);

    const handleImageUploaded = (url) => {
        setImages((prev) => [...prev, url]);
    };

    const getProjectByUserId = async () => {
        try {
            const response = await resourceService.getProjectByUserId();
            setProjects(response?.content || []);
        } catch (error) {
            console.error("Error fetching project by user ID:", error);
            setProjects([]);
        }
    };

    const handleCreateVersion = async () => {
        if (
            !name.trim() ||
            !description.trim() ||
            !type.trim() ||
            !price ||
            !expiredTime
        ) {
            Toast.show({
                type: "error",
                text1: "Missing information",
                text2: "Please fill in all required fields.",
            });
            return;
        }

        if (itemSource === "upload" && images.length === 0) {
            Toast.show({
                type: "error",
                text1: "Missing images",
                text2: "Please upload at least one banner image.",
            });
            return;
        }

        if (itemSource === "upload" && localItems.length === 0) {
            Toast.show({
                type: "error",
                text1: "Missing items",
                text2: "Please upload at least one item image.",
            });
            return;
        }

        if (itemSource === "project" && !selectedProjectId) {
            Toast.show({
                type: "error",
                text1: "Missing project",
                text2: "Please select a project.",
            });
            return;
        }

        setIsUploading(true);
        try {
            const formattedType = type.toUpperCase();
            const formattedImages = images.map((url, index) => ({
                imageUrl: url,
                isThumbnail: index === 0,
            }));

            let versionPayload;

            if (itemSource === "upload") {
                versionPayload = {
                    sourceType: formattedType,
                    name,
                    description,
                    type: formattedType,
                    price: Number(String(price).replace(/\D/g, "")) * 1000,
                    releaseDate,
                    expiredTime,
                    images: formattedImages,
                    items: localItems.map((url, idx) => ({
                        itemIndex: idx + 1,
                        itemUrl: url,
                    })),
                };
            } else if (itemSource === "project") {
                const selectedProject = projects.find(
                    (p) => p.projectId === selectedProjectId
                );
                versionPayload = {
                    sourceType: formattedType,
                    projectId: selectedProjectId,
                    name,
                    description,
                    type: formattedType,
                    price: Number(String(price).replace(/\D/g, "")) * 1000,
                    expiredTime,
                    releaseDate,
                    images: [
                        {
                            imageUrl: selectedProject?.imageUrl,
                            isThumbnail: true,
                        },
                    ],
                };
            }

            if (isUpdateMode) {
                await resourceService.updateResourceVersion(
                    versionId,
                    versionPayload
                );

                await resourceService.republishResourceVersionWhenStaffNotConfirm(versionId);

                Toast.show({
                    type: "success",
                    text1: "Version Updated 🎉",
                    text2: "Version has been updated and republished successfully.",
                });
            } else {
                await resourceService.createResourceVersion(
                    resourceTemplateId,
                    versionPayload
                );

                Toast.show({
                    type: "success",
                    text1: "Version Created 🎉",
                    text2: "New version has been created successfully.",
                });
            }

            setTimeout(() => navigation.goBack(), 1500);
        } catch (err) {
            console.error(isUpdateMode ? "Update version error:" : "Create version error:", err);
            Toast.show({
                type: "error",
                text1: isUpdateMode ? "Update Failed" : "Create Failed",
                text2: err.message || "Something went wrong while " + (isUpdateMode ? "updating" : "creating") + " version.",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={styles.headerIconColor} />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>{isUpdateMode ? 'Update Version' : 'Create New Version'}</Text>
                    <Text style={{ fontSize: 12, color: styles.textSecondary }}>
                        for "{productName}"
                    </Text>
                </View>
                <Pressable
                    onPress={handleCreateVersion}
                    disabled={isUploading}
                    style={styles.headerSubmitBtn}
                >
                    <Text
                        style={[
                            styles.headerSubmitText,
                            isUploading && styles.submitTextDisabled,
                        ]}
                    >
                        {isUploading ? "..." : (isUpdateMode ? "Update Version" : "Create Version")}
                    </Text>
                </Pressable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="description" size={20} color={styles.primaryBlue} />
                        <Text style={styles.sectionTitle}>Version Information</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Version Name</Text>
                            <TextInput
                                style={styles.largeInput}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter version name"
                                placeholderTextColor={styles.placeholderText}
                            />
                        </View>

                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.largeInput, styles.largeTextarea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Describe this version"
                                placeholderTextColor={styles.placeholderText}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeToggle}>
                                <Pressable
                                    onPress={() => {
                                        setType("TEMPLATES");
                                        setItemSource("project");
                                    }}
                                    style={[
                                        styles.typeButton,
                                        type === "TEMPLATES" && styles.typeButtonActive,
                                    ]}
                                >
                                    <Icon
                                        name="grid-view"
                                        size={16}
                                        color={type === "TEMPLATES" ? "#FFFFFF" : styles.textMuted}
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === "TEMPLATES" && styles.typeButtonTextActive,
                                        ]}
                                    >
                                        Template
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setType("ICONS");
                                        setItemSource("upload");
                                    }}
                                    style={[
                                        styles.typeButton,
                                        type === "ICONS" && styles.typeButtonActive,
                                    ]}
                                >
                                    <Icon
                                        name="category"
                                        size={16}
                                        color={type === "ICONS" ? "#FFFFFF" : styles.textMuted}
                                    />
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            type === "ICONS" && styles.typeButtonTextActive,
                                        ]}
                                    >
                                        Icon
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Price</Text>
                            <View style={styles.priceInput}>
                                <TextInput
                                    style={styles.priceField}
                                    value={price}
                                    onChangeText={(text) => {
                                        const digits = text.replace(/\D/g, "");
                                        setPrice(digits);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={styles.placeholderText}
                                />
                                <Text style={styles.priceSuffix}>.000đ</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Release Date</Text>
                            <TextInput
                                style={styles.input}
                                value={releaseDate}
                                onChangeText={setReleaseDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={styles.placeholderText}
                            />
                        </View>

                        <View style={styles.halfInput}>
                            <Text style={styles.label}>Expired Date</Text>
                            <Pressable
                                onPress={() => setShowExpiredPicker(true)}
                                style={styles.dateButton}
                            >
                                <Text style={styles.dateText}>
                                    {expiredTime || "Select date"}
                                </Text>
                                <Icon name="calendar-today" size={18} color={styles.textSecondary} />
                            </Pressable>
                            {showExpiredPicker && (
                                <DateTimePicker
                                    value={expiredTime ? new Date(expiredTime) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowExpiredPicker(false);
                                        if (selectedDate) {
                                            const y = selectedDate.getFullYear();
                                            const m = String(selectedDate.getMonth() + 1).padStart(
                                                2,
                                                "0"
                                            );
                                            const d = String(selectedDate.getDate()).padStart(2, "0");
                                            setExpiredTime(`${y}-${m}-${d}`);
                                        }
                                    }}
                                />
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.rowSection}>
                    {/* Images */}
                    <View style={[styles.section, styles.halfSection]}>
                        <View style={styles.sectionHeader}>
                            <Icon name="image" size={20} color={styles.primaryBlue} />
                            <Text style={styles.sectionTitle}>Images</Text>
                        </View>

                        {/* Banner Images - Full Width */}
                        <View style={styles.sectionHeader}>
                            <Icon name="image" size={18} color={styles.primaryBlue} />
                            <Text style={styles.sectionTitle}>Banner Images</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{images.length}</Text>
                            </View>
                        </View>
                        <MultipleImageUploader
                            onImageUploaded={handleImageUploaded}
                            maxImages={10}
                        />
                    </View>

                    {/* Item Source */}
                    <View style={[styles.section, styles.halfSection]}>
                        <View style={styles.sectionHeader}>
                            <Icon name="inventory" size={20} color={styles.primaryBlue} />
                            <Text style={styles.sectionTitle}>Item Source</Text>
                        </View>

                        <View style={[styles.halfInput, styles.sourceToggle]}>
                            <Pressable
                                onPress={() => setItemSource("upload")}
                                disabled={type === "TEMPLATES"}
                                style={[
                                    styles.sourceButton,
                                    itemSource === "upload" && styles.sourceButtonActive,
                                    itemSource === "upload" && styles.sourceButtonSelected,
                                    type === "TEMPLATES" && styles.sourceButtonDisabled,
                                ]}
                            >
                                <Icon
                                    name="upload-file"
                                    size={18}
                                    color={itemSource === "upload" ? "#FFFFFF" : styles.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.sourceButtonText,
                                        itemSource === "upload" && styles.sourceButtonTextActive,
                                    ]}
                                >
                                    Upload
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setItemSource("project")}
                                disabled={type === "ICONS"}
                                style={[
                                    styles.sourceButton,
                                    itemSource === "project" && styles.sourceButtonActive,
                                    itemSource === "project" && styles.sourceButtonSelected,
                                    type === "ICONS" && styles.sourceButtonDisabled,
                                ]}
                            >
                                <Icon
                                    name="folder"
                                    size={18}
                                    color={itemSource === "project" ? "#FFFFFF" : styles.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.sourceButtonText,
                                        itemSource === "project" && styles.sourceButtonTextActive,
                                    ]}
                                >
                                    Project
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Available Projects - Only show if project mode */}
                {itemSource === "project" && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="folder" size={20} color={styles.primaryBlue} />
                            <Text style={styles.sectionTitle}>Available Projects ({projects?.length || 0})</Text>
                        </View>

                        {projects?.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="folder-open" size={48} color={styles.emptyIconColor} />
                                <Text style={styles.emptyText}>
                                    No projects available
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.projectListScroll}
                                nestedScrollEnabled
                                showsVerticalScrollIndicator
                            >
                                {projects?.map((proj) => (
                                    <Pressable
                                        key={proj.projectId}
                                        onPress={() => setSelectedProjectId(proj.projectId)}
                                        style={[
                                            styles.projectCard,
                                            selectedProjectId === proj.projectId &&
                                            styles.projectCardActive,
                                        ]}
                                    >
                                        <Image
                                            source={{ uri: proj.imageUrl }}
                                            style={styles.projectImage}
                                        />
                                        <View style={styles.projectInfo}>
                                            <Text style={styles.projectName} numberOfLines={1}>
                                                {proj.name}
                                            </Text>
                                            <Text style={styles.projectDesc} numberOfLines={2}>
                                                {proj.description}
                                            </Text>
                                        </View>
                                        {selectedProjectId === proj.projectId && (
                                            <Icon
                                                name="check-circle"
                                                size={24}
                                                color={styles.primaryBlue}
                                            />
                                        )}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                )}

                {/* Item Images - Only show if upload mode */}
                {itemSource === "upload" && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Icon name="collections" size={20} color={styles.primaryBlue} />
                            <Text style={styles.sectionTitle}>Item Images</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{localItems.length}</Text>
                            </View>
                        </View>
                        <MultipleImageUploader
                            onImageUploaded={(url) =>
                                setLocalItems((prev) => [...prev, url])
                            }
                            maxImages={10}
                        />
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>

            <Toast />
        </View>
    );
}
