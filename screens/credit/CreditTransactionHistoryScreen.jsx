import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    Text,
    Animated,
    Pressable,
    FlatList,
    Modal,
    Dimensions,
    ScrollView,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { creditService } from "../../service/creditService";
import { getStyles } from "./CreditTransactionHistoryScreen.styles";
import { useTheme } from "../../context/ThemeContext";

const TABS = ["All", "Deposits", "Usage"];
const screenWidth = Dimensions.get("window").width;

export default function CreditTransactionHistoryScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [selectedTx, setSelectedTx] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const historyData = await creditService.getCreditTransactionHistory();
            if (Array.isArray(historyData)) {
                setTransactions(historyData);
            } else if (historyData && historyData.content && Array.isArray(historyData.content)) {
                setTransactions(historyData.content);
            }
        } catch (error) {
            console.warn("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabPress = (tab, index) => {
        setActiveTab(tab);
        Animated.spring(translateX, {
            toValue: (screenWidth / 3) * index, // Divide by 3 tabs
            useNativeDriver: true,
        }).start();
    };

    const getTransactionConfig = (transaction) => {
        // Default config
        let config = {
            icon: "help-outline",
            color: "#64748B",
            sign: "",
            label: "Unknown",
            description: transaction.description || "Transaction",
            category: "other"
        };

        if (transaction.type === 'DEPOSIT' || transaction.type === 'TOPUP') {
            config = {
                icon: "account-balance-wallet",
                color: "#16A34A",
                sign: "+",
                label: "Credit Top-up",
                description: transaction.description || "Purchased credits",
                category: "deposit"
            };
        } else if (transaction.type === 'PACKAGE_PURCHASE') {
            config = {
                icon: "card-giftcard",
                color: "#7C3AED",
                sign: "+",
                label: transaction.packageName || "Package Purchase",
                description: transaction.description || "Purchased package",
                category: "deposit"
            };
        } else if (transaction.type === 'USAGE' || transaction.type === 'SPEND') {
            config = {
                icon: "shopping-cart",
                color: "#DC2626",
                sign: "-",
                label: "Credit Usage",
                description: transaction.description || "Used credits",
                category: "usage"
            };
        }

        return config;
    };

    const filteredData = transactions
        .filter((t) => {
            if (activeTab === "All") return true;
            if (activeTab === "Deposits") return t.type === 'DEPOSIT' || t.type === 'TOPUP' || t.type === 'PACKAGE_PURCHASE';
            if (activeTab === "Usage") return t.type === 'USAGE' || t.type === 'SPEND';
            return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN");
    const formatDate = (d) =>
        new Date(d).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const renderItem = ({ item }) => {
        const config = getTransactionConfig(item);
        return (
            <Pressable
                style={styles.card}
                onPress={() => {
                    setSelectedTx(item);
                    setModalVisible(true);
                }}
            >
                <View
                    style={[styles.iconWrap, { backgroundColor: `${config.color}15` }]}
                >
                    <Icon name={config.icon} size={22} color={config.color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{config.label}</Text>
                    <Text style={styles.cardDescription} numberOfLines={2}>{config.description}</Text>
                    <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                    {item.referenceId && (
                        <Text style={styles.cardRef}>Ref: {item.referenceId}</Text>
                    )}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.amount, { color: config.color }]}>
                        {config.sign}
                        {formatCurrency(item.amount)}
                    </Text>
                    {item.balanceAfter !== undefined && (
                        <Text style={styles.balanceText}>
                            Balance: {formatCurrency(item.balanceAfter)}
                        </Text>
                    )}
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Icon name="arrow-back" size={24} color={styles.colors.iconColor} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Credit History</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <Animated.View
                    style={[styles.tabIndicator, { transform: [{ translateX }] }]}
                />
                {TABS.map((tab, index) => (
                    <Pressable
                        key={tab}
                        style={styles.tab}
                        onPress={() => handleTabPress(tab, index)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.tabTextActive,
                            ]}
                        >
                            {tab}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={styles.colors.loadingColor} />
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Icon name="receipt" size={48} color={styles.colors.emptyIcon} />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    }
                />
            )}

            {/* Modal Detail */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Transaction Details</Text>
                            <Pressable onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={26} color={styles.colors.modalCloseIcon} />
                            </Pressable>
                        </View>

                        {selectedTx && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {(() => {
                                    const config = getTransactionConfig(selectedTx);
                                    return (
                                        <>
                                            <View style={styles.modalIconSection}>
                                                <View
                                                    style={[
                                                        styles.modalIcon,
                                                        { backgroundColor: `${config.color}15` },
                                                    ]}
                                                >
                                                    <Icon
                                                        name={config.icon}
                                                        size={40}
                                                        color={config.color}
                                                    />
                                                </View>
                                                <Text style={styles.modalLabel}>{config.label}</Text>
                                                <Text style={styles.modalAmount}>
                                                    {config.sign}
                                                    {formatCurrency(selectedTx.amount)} Credits
                                                </Text>
                                            </View>

                                            <View style={styles.detailSection}>
                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Transaction ID</Text>
                                                    <Text style={styles.detailValue}>
                                                        #{selectedTx.id}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Type</Text>
                                                    <Text style={styles.detailValue}>
                                                        {selectedTx.type}
                                                    </Text>
                                                </View>

                                                {selectedTx.packageName && (
                                                    <View style={styles.detailRow}>
                                                        <Text style={styles.detailLabel}>Package Name</Text>
                                                        <Text style={styles.detailValue}>
                                                            {selectedTx.packageName}
                                                        </Text>
                                                    </View>
                                                )}

                                                {selectedTx.referenceId && (
                                                    <View style={styles.detailRow}>
                                                        <Text style={styles.detailLabel}>Reference ID</Text>
                                                        <Text style={styles.detailValue}>
                                                            {selectedTx.referenceId}
                                                        </Text>
                                                    </View>
                                                )}

                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Amount</Text>
                                                    <Text style={[styles.detailValue, { color: config.color, fontWeight: '700' }]}>
                                                        {config.sign}{formatCurrency(selectedTx.amount)} Credits
                                                    </Text>
                                                </View>

                                                {selectedTx.balanceAfter !== undefined && (
                                                    <View style={styles.detailRow}>
                                                        <Text style={styles.detailLabel}>Balance After</Text>
                                                        <Text style={[styles.detailValue, { fontWeight: '700' }]}>
                                                            {formatCurrency(selectedTx.balanceAfter)} Credits
                                                        </Text>
                                                    </View>
                                                )}

                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Date & Time</Text>
                                                    <Text style={styles.detailValue}>
                                                        {formatDate(selectedTx.createdAt)}
                                                    </Text>
                                                </View>

                                                <View style={styles.detailRow}>
                                                    <Text style={styles.detailLabel}>Description</Text>
                                                    <Text
                                                        style={[
                                                            styles.detailValue,
                                                            { maxWidth: "60%", textAlign: "right" },
                                                        ]}
                                                    >
                                                        {selectedTx.description}
                                                    </Text>
                                                </View>
                                            </View>
                                        </>
                                    );
                                })()}
                            </ScrollView>
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
