import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Pressable,
    FlatList,
    Modal,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { paymentService } from "../../../service/paymentService";

export default function WithdrawalHistoryScreen() {
    const navigation = useNavigation();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
   

    useEffect(() => {
        fetchHistory(0);
    }, []);

    const fetchHistory = async (pageNumber = 0) => {
        if (pageNumber === 0) {
            setLoading(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const data = await paymentService.getWithdrawHistory(pageNumber, 20, "createdAt", "DESC");

            let newWithdrawals = [];
            let totalPages = 0;

            if (data && Array.isArray(data.content)) {
                newWithdrawals = data.content;
                totalPages = data.totalPages;
            } else if (Array.isArray(data)) {
                // Fallback if backend doesn't return Page object
                newWithdrawals = data;
                totalPages = 1;
            } else if (data && Array.isArray(data.result)) {
                // Fallback wrapper
                newWithdrawals = data.result;
                totalPages = 1;
            }

            if (pageNumber === 0) {
                setWithdrawals(newWithdrawals);
            } else {
                setWithdrawals((prev) => [...prev, ...newWithdrawals]);
            }

            setHasMore(pageNumber + 1 < totalPages);
            setPage(pageNumber);

        } catch (error) {
            console.error("Failed to fetch withdrawal history", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && !isFetchingMore && hasMore) {
            fetchHistory(page + 1);
        }
    };

    const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN") + " đ";
    const formatDate = (d) =>
        new Date(d).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getStatusColor = (status) => {
        switch (status) {
            case "SUCCESS":
            case "COMPLETED":
            case "APPROVED":
                return "#16A34A"; // Green
            case "PENDING":
            case "PROCESSING":
                return "#F59E0B"; // Amber
            case "FAILED":
            case "REJECTED":
            case "CANCELLED":
                return "#DC2626"; // Red
            default:
                return "#64748B"; // Gray
        }
    };

    const renderItem = ({ item }) => {
        const color = getStatusColor(item.status);
        return (
            <Pressable
                style={[styles.card, { borderColor: "#E0E7FF", borderWidth: 1 }]}
                onPress={() => {
                    setSelectedTx(item);
                    setModalVisible(true);
                }}
            >
                <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
                    <Icon name="arrow-upward" size={22} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>Withdrawal</Text>
                    <Text style={styles.cardDescription}>
                        {item.bankName} - {item.bankAccountNumber}
                    </Text>
                    <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.amount, { color: color }]}>
                        -{formatCurrency(item.amount)}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
                        <Text style={[styles.badgeText, { color: color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={24} color="#084F8C" />
                </Pressable>
                <Text style={styles.headerTitle}>Withdrawal History</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* List */}
            {loading && page === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#084F8C" />
                </View>
            ) : (
                <FlatList
                    data={withdrawals}
                    keyExtractor={(item) => (item.id || item.withdrawalId || Math.random()).toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingMore ? (
                            <View style={{ paddingVertical: 20 }}>
                                <ActivityIndicator size="small" color="#084F8C" />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="receipt" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyText}>No withdrawal history found</Text>
                        </View>
                    }
                />
            )}

            {/* Modal Detail */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Withdrawal Details</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={26} color="#0F172A" />
                            </Pressable>
                        </View>

                        {selectedTx && (
                            <View>
                                <View style={styles.modalIconSection}>
                                    <View
                                        style={[
                                            styles.modalIcon,
                                            { backgroundColor: `${getStatusColor(selectedTx.status)}15` },
                                        ]}
                                    >
                                        <Icon
                                            name="arrow-upward"
                                            size={40}
                                            color={getStatusColor(selectedTx.status)}
                                        />
                                    </View>
                                    <Text style={styles.modalLabel}>Withdrawal Amount</Text>
                                    <Text style={styles.modalAmount}>
                                        -{formatCurrency(selectedTx.amount)}
                                    </Text>
                                </View>

                                <View style={styles.detailSection}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Status</Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: `${getStatusColor(selectedTx.status)}15` },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusBadgeText,
                                                    { color: getStatusColor(selectedTx.status) },
                                                ]}
                                            >
                                                {selectedTx.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Date & Time</Text>
                                        <Text style={styles.detailValue}>
                                            {formatDate(selectedTx.createdAt)}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Bank Name</Text>
                                        <Text style={styles.detailValue}>{selectedTx.bankName}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Account Number</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedTx.bankAccountNumber}
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Account Holder</Text>
                                        <Text style={styles.detailValue}>
                                            {selectedTx.bankAccountHolder}
                                        </Text>
                                    </View>

                                    {selectedTx.note && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Note</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedTx.note}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        <Pressable
                            style={styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeBtnText}>Close</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },
    backButton: {
        position: "absolute",
        left: 20,
        padding: 12,
        borderRadius: 30,
        backgroundColor: "#F8FAFC",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "Pacifico-Regular",
        color: "#084F8C",
        letterSpacing: -0.5,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#084F8C",
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 6,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2,
    },
    cardDescription: { fontSize: 13, color: "#94A3B8", marginBottom: 2 },
    cardDate: { fontSize: 12, color: "#64748B" },
    amount: { fontSize: 15, fontWeight: "700" },
    badge: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 4,
    },
    badgeText: { fontSize: 10, fontWeight: "600" },
    emptyBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyText: { fontSize: 14, color: "#94A3B8", marginTop: 12 },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: "85%",
        shadowColor: "#084F8C",
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
        borderWidth: 1,
        borderColor: "#E0E7FF",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E7FF",
        paddingBottom: 12,
    },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#084F8C" },
    modalIconSection: {
        alignItems: "center",
        marginBottom: 24,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 8,
    },
    modalAmount: { fontSize: 28, fontWeight: "700", color: "#1E293B" },
    detailSection: {
        backgroundColor: "#F8FAFF",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E7FF",
    },
    detailLabel: { fontSize: 14, color: "#64748B", fontWeight: "500" },
    detailValue: { fontSize: 14, color: "#1E293B", fontWeight: "600", maxWidth: '60%', textAlign: 'right' },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    statusBadgeText: { fontSize: 12, fontWeight: "600" },
    closeBtn: {
        backgroundColor: "#084F8C",
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
    },
    closeBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
});
