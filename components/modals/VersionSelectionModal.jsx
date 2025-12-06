import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { projectService } from "../../service/projectService";

const formatDateTime = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const VersionSelectionModal = ({
    visible,
    onClose,
    versions: propVersions,
    loading: propLoading,
    onVersionSelect,
    projectId,
}) => {
    const [internalVersions, setInternalVersions] = useState([]);
    const [internalLoading, setInternalLoading] = useState(false);

    const versions = propVersions || internalVersions;
    const loading = propLoading !== undefined ? propLoading : internalLoading;

    useEffect(() => {
        if (visible && projectId && !propVersions) {
            const fetchVersions = async () => {
                try {
                    setInternalLoading(true);
                    const list = await projectService.getProjectVersions(projectId);
                    setInternalVersions(list || []);
                } catch (error) {
                    console.error("Failed to fetch versions:", error);
                } finally {
                    setInternalLoading(false);
                }
            };
            fetchVersions();
        }
    }, [visible, projectId, propVersions]);

    if (!visible) return null;

    const renderItem = ({ item }) => {
        // Find the first page with a snapshotUrl
        const coverPage = item.pages?.find(p => p.snapshotUrl) || item.pages?.[0];
        const snapshotUrl = coverPage?.snapshotUrl;

        return (
            <TouchableOpacity
                style={styles.versionItem}
                onPress={() => onVersionSelect(item)}
                activeOpacity={0.9}
            >
                {/* Snapshot Preview */}
                <View style={styles.imageContainer}>
                    {snapshotUrl ? (
                        <Image
                            source={{ uri: snapshotUrl }}
                            style={styles.snapshotImage}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Icon name="image-not-supported" size={40} color="#CBD5E1" />
                        </View>
                    )}
                    <View style={styles.versionBadge}>
                        <Text style={styles.versionBadgeText}>v{item.versionNumber}</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                        <View style={styles.dateContainer}>
                            <Icon name="schedule" size={14} color="#64748B" />
                            <Text style={styles.versionDate}>
                                {formatDateTime(item.createdAt)}
                            </Text>
                        </View>
                        <View style={styles.pageInfo}>
                            <Icon name="description" size={14} color="#60A5FA" />
                            <Text style={styles.pageCount}>
                                {item.pages?.length || 0} page{item.pages?.length !== 1 ? "s" : ""}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.versionNote} numberOfLines={2}>
                        {item.note || "No description"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle="overFullScreen"
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Icon name="history" size={24} color="#1E40AF" />
                            <Text style={styles.title}>Version History</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Loading versions...</Text>
                        </View>
                    ) : versions && versions.length > 0 ? (
                        <FlatList
                            data={versions}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.projectVersionId.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Icon name="info-outline" size={48} color="#94A3B8" />
                            <Text style={styles.emptyText}>No versions available</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16, // Reduced padding
    },
    modalContainer: {
        width: "100%",
        maxWidth: 600, // Increased maxWidth
        height: "90%", // Increased height
        backgroundColor: "#F8FAFC",
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0F172A",
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#F1F5F9",
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    versionItem: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        height: 160,
        backgroundColor: "#F1F5F9",
        position: "relative",
    },
    snapshotImage: {
        width: "100%",
        height: "100%",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    versionBadge: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(37, 99, 235, 0.9)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backdropFilter: "blur(4px)",
    },
    versionBadgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
    },
    itemContent: {
        padding: 16,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    versionDate: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "500",
    },
    pageInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    pageCount: {
        fontSize: 12,
        color: "#3B82F6",
        fontWeight: "600",
    },
    versionNote: {
        fontSize: 15,
        color: "#334155",
        lineHeight: 22,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#64748B",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: "#64748B",
    },
});

export default VersionSelectionModal;
