import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Pressable,
    Image,
    Dimensions,
    Modal,
    StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import getStyles from "./DesignerProductDetailScreen.styles";
import { useTheme } from "../../../context/ThemeContext";
import { resourceService } from "../../../service/resourceService";
import NotificationButton from "../../../components/common/NotificationButton";

export default function DesignerProductDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { product } = route.params || {};
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const styles = useMemo(() => getStyles(theme), [theme]);

    // Local state for modals
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showDeleteVersionModal, setShowDeleteVersionModal] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);

    if (!product) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={isDark ? "#FFF" : "#084F8C"} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Product Not Found</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={[styles.contentContainer, { alignItems: "center", marginTop: 50 }]}>
                    <Text style={{ color: styles.textSecondary }}>Unable to load product details.</Text>
                </View>
            </View>
        );
    }

    // Helper functions
    const formatCurrency = (amount) => {
        return (amount ?? 0).toLocaleString("vi-VN") + " VND";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING_REVIEW": return "#3B82F6";
            case "PUBLISHED": return "#10B981";
            case "REJECTED": return "#EF4444";
            case "ARCHIVED": return "#F59E0B";
            case "DELETED": return "#6B7280";
            default: return "#9CA3AF";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "PENDING_REVIEW": return "Pending Review";
            case "PUBLISHED": return "Published";
            case "REJECTED": return "Rejected";
            case "ARCHIVED": return "Archived";
            case "DELETED": return "Deleted";
            default: return "All";
        }
    };

    // Version Actions
    const handlePublishVersion = (version) => {
        setSelectedVersion(version);
        setShowPublishModal(true);
    };

    const confirmPublishVersion = async () => {
        try {
            await resourceService.pubicResourceVersion(selectedVersion.versionId);
            setShowPublishModal(false);
            Toast.show({
                type: "success",
                text1: "Version Published",
                text2: `Version ${selectedVersion.versionNumber} has been published successfully`,
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message || "Failed to publish version",
            });
        }
    };

    const handleDeleteVersion = (version) => {
        setSelectedVersion(version);
        setShowDeleteVersionModal(true);
    };

    const confirmDeleteVersion = async () => {
        try {
            await resourceService.deleteResourceVersion(selectedVersion.versionId);
            setShowDeleteVersionModal(false);
            Toast.show({
                type: "success",
                text1: "Version Deleted",
                text2: `Version ${selectedVersion.versionNumber} has been deleted successfully`,
            });
            // Go back to refresh the product list
            setTimeout(() => navigation.goBack(), 1000);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error.message || "Failed to delete version",
            });
        }
    };

    const handleUpdateVersion = (version) => {
        if (!version) return;
        navigation.navigate("CreateVersionScreen", {
            resourceTemplateId: product.resourceTemplateId,
            productName: product.name,
            currentType: product.type,
            versionId: version.versionId,
            versionData: version,
        });
    };

    const currentVersion = product.versions?.find(
        v => v.versionId === product.currentPublishedVersionId
    ) || product.versions?.[0];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={isDark ? "#FFF" : "#084F8C"} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Product Details</Text>
                </View>
                <View style={styles.headerActions}>
                    <NotificationButton />
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.detailBodyRow}>
                    {/* Left Pane: Images & Banner */}
                    <View style={styles.leftPane}>
                        <View style={styles.leftPaneCard}>
                            {(() => {
                                const allImages = currentVersion?.images || product.images || [];

                                if (allImages.length === 0) {
                                    return (
                                        <View style={styles.heroPlaceholder}>
                                            <Icon name="image" size={48} color={isDark ? "#64748B" : "#9CA3AF"} />
                                            <Text style={{ color: isDark ? "#64748B" : "#9CA3AF", fontSize: 12, marginTop: 8 }}>No images</Text>
                                        </View>
                                    );
                                }

                                return (
                                    <View>
                                        {/* Main Image */}
                                        <Image
                                            source={{ uri: allImages[0].imageUrl || allImages[0].url }}
                                            style={styles.detailImage}
                                        />

                                        {/* Thumbnail Gallery */}
                                        {allImages.length > 1 && (
                                            <View style={{ marginTop: 12 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                                    <Text style={{ fontSize: 12, fontWeight: "600", color: styles.textPrimary }}>
                                                        All Gallery Images
                                                    </Text>
                                                    <View style={{ backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                                                        <Text style={{ fontSize: 10, color: styles.primaryBlue, fontWeight: "600" }}>
                                                            {allImages.length} images
                                                        </Text>
                                                    </View>
                                                </View>
                                                <ScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={false}
                                                    style={{ marginHorizontal: -4 }}
                                                >
                                                    {allImages.map((img, idx) => (
                                                        <View
                                                            key={idx}
                                                            style={{
                                                                marginHorizontal: 4,
                                                                borderRadius: 8,
                                                                borderWidth: img.isThumbnail ? 2 : 1,
                                                                borderColor: img.isThumbnail ? styles.primaryBlue : styles.borderColor,
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <Image
                                                                source={{ uri: img.imageUrl || img.url }}
                                                                style={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    backgroundColor: styles.inputBackground,
                                                                }}
                                                            />
                                                        </View>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </View>
                                );
                            })()}
                        </View>

                        {/* Banner Image Card */}
                        {/* {product.bannerImageUrl && (
                            <View style={styles.leftPaneCard}>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: styles.textPrimary, marginBottom: 8 }}>
                                    Banner Image
                                </Text>
                                <Image
                                    source={{ uri: product.bannerImageUrl }}
                                    style={styles.bannerImage}
                                />
                            </View>
                        )} */}

                        {/* Included Items Gallery */}
                        {currentVersion?.items && currentVersion.items.length > 0 && (
                            <View style={styles.leftPaneCard}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: styles.textPrimary }}>
                                        Included Items ({currentVersion.items.length})
                                    </Text>
                                    <Icon name="grid-view" size={18} color={styles.primaryBlue} />
                                </View>
                                <View style={styles.itemsGrid}>
                                    {currentVersion.items.map((item, idx) => (
                                        <View key={item.resourceItemId || idx} style={styles.itemImageContainer}>
                                            <Image
                                                source={{ uri: item.imageUrl }}
                                                style={styles.itemImage}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Right Pane: Info */}
                    <View style={styles.rightPane}>
                        <View style={styles.infoCard}>
                            <View style={styles.detailSection}>
                                <Text style={styles.productNameText}>{product.name}</Text>
                                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                                    <View style={styles.typeBadge}>
                                        <Icon name="category" size={14} color={styles.accentBlue} />
                                        <Text style={styles.typeText}>{product.type}</Text>
                                    </View>
                                    <View style={[styles.typeBadge, { backgroundColor: isDark ? "#1E3A5F" : "#F0F9FF", borderColor: "#3B82F640" }]}>
                                        <Icon name="event" size={14} color="#3B82F6" />
                                        <Text style={[styles.typeText, { color: "#3B82F6" }]}>{formatDate(product.createdAt)}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <View style={styles.sectionHeader}>
                                    <Icon name="description" size={18} color={styles.primaryBlue} />
                                    <Text style={styles.sectionTitle}>Description</Text>
                                </View>
                                <Text style={styles.descriptionText}>{product.description}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailCol}>
                                    <View style={styles.sectionHeader}>
                                        <Icon name="payments" size={18} color={styles.primaryBlue} />
                                        <Text style={styles.sectionTitle}>Price</Text>
                                    </View>
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceText}>{formatCurrency(product.price)}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Sales Metrics Cards */}
                            <View style={{ marginVertical: 12 }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: styles.textPrimary, marginBottom: 10 }}>
                                    Sales Performance
                                </Text>
                                <View style={{ flexDirection: "row", gap: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#3B82F6" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                            <Icon name="shopping-cart" size={16} color="#3B82F6" />
                                            <Text style={{ fontSize: 11, color: isDark ? "#60A5FA" : "#1E40AF", fontWeight: "600" }}>Purchases</Text>
                                        </View>
                                        <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#60A5FA" : "#1E3A8A" }}>
                                            {product.totalPurchases ?? 0}
                                        </Text>
                                    </View>

                                    <View style={{ flex: 1, backgroundColor: isDark ? "#064E3B" : "#D1FAE5", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#10B981" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                            <Icon name="attach-money" size={16} color="#10B981" />
                                            <Text style={{ fontSize: 11, color: isDark ? "#34D399" : "#065F46", fontWeight: "600" }}>Revenue</Text>
                                        </View>
                                        <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#34D399" : "#065F46" }}>
                                            {formatCurrency(product.totalRevenue ?? 0)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: isDark ? "#451A03" : "#FEF3C7", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#F59E0B" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                            <Icon name="star" size={16} color="#F59E0B" />
                                            <Text style={{ fontSize: 11, color: isDark ? "#FCD34D" : "#92400E", fontWeight: "600" }}>Rating</Text>
                                        </View>
                                        <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#FCD34D" : "#92400E" }}>
                                            {(product.averageRating ?? currentVersion?.averageRating ?? 0).toFixed(1)} ⭐
                                        </Text>
                                    </View>

                                    <View style={{ flex: 1, backgroundColor: isDark ? "#312E81" : "#E0E7FF", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#6366F1" }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                            <Icon name="layers" size={16} color="#6366F1" />
                                            <Text style={{ fontSize: 11, color: isDark ? "#A5B4FC" : "#3730A3", fontWeight: "600" }}>Version</Text>
                                        </View>
                                        <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#A5B4FC" : "#3730A3" }}>
                                            {product.currentVersionNumber ?? "N/A"}
                                        </Text>
                                    </View>
                                </View>
                            </View>





                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Status</Text>
                                <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(product.status) }]}>
                                    <Icon name="circle" size={8} color="#FFFFFF" />
                                    <Text style={styles.statusTextLarge}>{getStatusText(product.status)}</Text>
                                </View>
                            </View>

                            {/* Versions Section */}
                            {product.versions && product.versions.length > 0 && (
                                <View style={styles.detailSection}>
                                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <Text style={styles.detailLabel}>Version History</Text>
                                        <View style={{ backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                            <Text style={{ fontSize: 11, color: styles.primaryBlue, fontWeight: "600" }}>
                                                {product.versions.length} versions
                                            </Text>
                                        </View>
                                    </View>
                                    {product.versions.map((version, index) => (
                                        <View
                                            key={version.versionId}
                                            style={{
                                                backgroundColor: version.status === "PUBLISHED" ? (isDark ? "#064E3B" : "#F0FDF4") : styles.cardBackground,
                                                padding: 14,
                                                borderRadius: 10,
                                                marginTop: 10,
                                                borderLeftWidth: 4,
                                                borderLeftColor: version.status === "PUBLISHED" ? "#10B981" : version.status === "PENDING_REVIEW" ? "#3B82F6" : "#6B7280",
                                                shadowColor: styles.shadowColor,
                                                shadowOffset: { width: 0, height: 1 },
                                                shadowOpacity: isDark ? 0.3 : 0.05,
                                                shadowRadius: 2,
                                                elevation: 1,
                                            }}
                                        >
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                                                    {/* Version Thumbnail */}
                                                    {(() => {
                                                        const thumbnail = version.images?.find(img => img.isThumbnail) || version.images?.[0];
                                                        if (thumbnail && thumbnail.imageUrl && thumbnail.imageUrl !== "string") {
                                                            return (
                                                                <Image
                                                                    source={{ uri: thumbnail.imageUrl }}
                                                                    style={{
                                                                        width: 50,
                                                                        height: 50,
                                                                        borderRadius: 8,
                                                                        backgroundColor: styles.inputBackground,
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <View
                                                                style={{
                                                                    width: 50,
                                                                    height: 50,
                                                                    borderRadius: 8,
                                                                    backgroundColor: styles.inputBackground,
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                <Icon name="image" size={24} color={isDark ? "#64748B" : "#9CA3AF"} />
                                                            </View>
                                                        );
                                                    })()}
                                                    <View style={{ flex: 1 }}>
                                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                                            <View style={{ backgroundColor: styles.cardBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: styles.borderColor }}>
                                                                <Text style={{ fontSize: 13, fontWeight: "700", color: styles.textPrimary }}>
                                                                    v{version.versionNumber}
                                                                </Text>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    backgroundColor: getStatusColor(version.status),
                                                                    paddingHorizontal: 8,
                                                                    paddingVertical: 4,
                                                                    borderRadius: 6,
                                                                }}
                                                            >
                                                                <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}>
                                                                    {getStatusText(version.status)}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <Text style={{ fontSize: 14, color: styles.textPrimary, fontWeight: "600", marginTop: 4 }} numberOfLines={1}>
                                                            {version.name}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Text style={{ fontSize: 12, color: styles.textSecondary, marginBottom: 10, lineHeight: 16 }}>
                                                {version.description}
                                            </Text>

                                            {/* Metrics Row */}
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                    <Icon name="attach-money" size={14} color="#10B981" />
                                                    <Text style={{ fontSize: 11, color: styles.textPrimary, fontWeight: "600" }}>
                                                        {formatCurrency(version.price)}
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                    <Icon name="shopping-cart" size={14} color="#3B82F6" />
                                                    <Text style={{ fontSize: 11, color: styles.textPrimary }}>
                                                        {version.purchaseCount} sales
                                                    </Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                    <Icon name="star" size={14} color="#FBBF24" />
                                                    <Text style={{ fontSize: 11, color: styles.textPrimary }}>
                                                        {(version.averageRating ?? 0).toFixed(1)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Action Buttons */}
                                            {version.status === "PUBLISHED" && version.versionId !== product.currentPublishedVersionId ? (
                                                <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: styles.borderColor }}>
                                                    <Pressable
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor: "#10B981",
                                                            paddingVertical: 8,
                                                            paddingHorizontal: 12,
                                                            borderRadius: 8,
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: 6,
                                                        }}
                                                        onPress={() => handlePublishVersion(version)}
                                                    >
                                                        <Icon name="publish" size={16} color="#FFFFFF" />
                                                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                                                            Set as Current
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            ) : version.status !== "PUBLISHED" ? (
                                                <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: styles.borderColor }}>
                                                    {version.status === "PENDING_REVIEW" && (
                                                        <Pressable
                                                            style={{
                                                                flex: 1,
                                                                backgroundColor: "#3B82F6",
                                                                paddingVertical: 8,
                                                                paddingHorizontal: 12,
                                                                borderRadius: 8,
                                                                flexDirection: "row",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                gap: 6,
                                                            }}
                                                            onPress={() => handleUpdateVersion(version)}
                                                        >
                                                            <Icon name="edit" size={16} color="#FFFFFF" />
                                                            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                                                                Update
                                                            </Text>
                                                        </Pressable>
                                                    )}
                                                    <Pressable
                                                        style={{ flex: 1, backgroundColor: "#EF4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
                                                        onPress={() => handleDeleteVersion(version)}
                                                    >
                                                        <Icon name="delete" size={16} color="#FFFFFF" />
                                                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Delete</Text>
                                                    </Pressable>
                                                </View>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Publish Confirmation Modal */}
            <Modal
                visible={showPublishModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPublishModal(false)}
            >
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalContent}>
                        <Icon name="publish" size={48} color="#10B981" />
                        <Text style={localStyles.modalTitle}>Publish Version</Text>
                        <Text style={localStyles.modalText}>
                            Are you sure you want to set version {selectedVersion?.versionNumber} as the current published version?
                        </Text>
                        <View style={localStyles.modalButtons}>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.cancelButton]}
                                onPress={() => setShowPublishModal(false)}
                            >
                                <Text style={localStyles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.confirmButton]}
                                onPress={confirmPublishVersion}
                            >
                                <Text style={localStyles.confirmButtonText}>Publish</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Version Confirmation Modal */}
            <Modal
                visible={showDeleteVersionModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteVersionModal(false)}
            >
                <View style={localStyles.modalOverlay}>
                    <View style={localStyles.modalContent}>
                        <Icon name="delete-forever" size={48} color="#EF4444" />
                        <Text style={localStyles.modalTitle}>Delete Version</Text>
                        <Text style={localStyles.modalText}>
                            Are you sure you want to delete version {selectedVersion?.versionNumber}? This action cannot be undone.
                        </Text>
                        <View style={localStyles.modalButtons}>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.cancelButton]}
                                onPress={() => setShowDeleteVersionModal(false)}
                            >
                                <Text style={localStyles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={[localStyles.modalButton, localStyles.deleteButton]}
                                onPress={confirmDeleteVersion}
                            >
                                <Text style={localStyles.confirmButtonText}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Toast />
        </View>
    );
}

const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1F2937",
        marginTop: 16,
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    cancelButtonText: {
        color: "#4B5563",
        fontWeight: "600",
    },
    confirmButton: {
        backgroundColor: "#10B981",
    },
    deleteButton: {
        backgroundColor: "#EF4444",
    },
    confirmButtonText: {
        color: "#FFF",
        fontWeight: "600",
    },
});
