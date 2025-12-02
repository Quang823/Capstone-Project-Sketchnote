import React from "react";
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
    versions,
    loading,
    onVersionSelect,
}) => {

    if (!visible) return null;

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
                        <ScrollView style={styles.scrollView}>
                            {versions.map((item) => (
                                <TouchableOpacity
                                    key={item.projectVersionId}
                                    style={styles.versionItem}
                                    onPress={() => onVersionSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.versionHeader}>
                                        <View style={styles.versionBadge}>
                                            <Text style={styles.versionBadgeText}>
                                                v{item.versionNumber}
                                            </Text>
                                        </View>
                                        <Text style={styles.versionDate}>
                                            {formatDateTime(item.createdAt)}
                                        </Text>
                                    </View>
                                    <Text style={styles.versionNote} numberOfLines={2}>
                                        {item.note || "No description"}
                                    </Text>
                                    <View style={styles.pageInfo}>
                                        <Icon name="description" size={14} color="#60A5FA" />
                                        <Text style={styles.pageCount}>
                                            {item.pages?.length || 0} page
                                            {item.pages?.length !== 1 ? "s" : ""}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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
        padding: 20,
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
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
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
    },
    closeButton: {
        padding: 4,
    },
    scrollView: {
        maxHeight: 500,
    },
    versionItem: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    versionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    versionBadge: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    versionBadgeText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    versionDate: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    versionNote: {
        fontSize: 14,
        color: "#334155",
        marginBottom: 8,
        lineHeight: 20,
    },
    pageInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    pageCount: {
        fontSize: 12,
        color: "#60A5FA",
        fontWeight: "600",
    },
    loadingContainer: {
        padding: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#64748B",
    },
    emptyContainer: {
        padding: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        marginTop: 16,
        fontSize: 14,
        color: "#64748B",
    },
});

export default VersionSelectionModal;
