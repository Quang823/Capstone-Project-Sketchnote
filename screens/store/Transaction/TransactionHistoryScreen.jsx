import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../context/ThemeContext";
import { paymentService } from "../../../service/paymentService";
import getStyles from "./TransactionHistoryScreen.styles";

// Map tabs to API type parameters
const TABS = [
  { label: "All", type: null },
  { label: "Deposit", type: "DEPOSIT" },
  { label: "Payment", type: "PAYMENT" },
  { label: "Withdraw", type: "WITHDRAW" },
  { label: "Course Fee", type: "COURSE_FEE" },
  { label: "Subscription", type: "SUBSCRIPTION" },
  { label: "AI Credits", type: "PURCHASE_AI_CREDITS" },
  { label: "Resource", type: "PURCHASE_RESOURCE" },
];

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Get styles based on theme
  const styles = getStyles(theme);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = {
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#084F8C",
    textPrimary: isDark ? "#F1F5F9" : "#1E293B",
    emptyIconColor: isDark ? "#475569" : "#CBD5E1",
    closeIconColor: isDark ? "#F1F5F9" : "#0F172A",
  };

  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Pagination state
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchTransactions(0, true);
  }, [activeTab]);

  const fetchTransactions = async (page = 0, reset = false) => {
    if (loading || loadingMore) return;

    try {
      if (reset) {
        setLoading(true);
        setTransactions([]);
      } else {
        setLoadingMore(true);
      }

      const data = await paymentService.getAllWalletTransaction(
        page,
        PAGE_SIZE,
        activeTab.type,
        "createdAt",
        "DESC"
      );

      setCurrentBalance(data.currentBalance || 0);

      let newTransactions = data.transactions || [];

      if (reset) {
        setTransactions(newTransactions);
      } else {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }

      setPageNo(data.pageNo);
      setTotalPages(data.totalPages);
      setHasMore(!data.last);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPageNo(0);
    fetchTransactions(0, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchTransactions(pageNo + 1, false);
    }
  };

  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    setPageNo(0);
    setHasMore(true);
    const tabWidth = screenWidth / TABS.length;
    Animated.spring(translateX, {
      toValue: tabWidth * index,
      useNativeDriver: true,
    }).start();
  };

  const getTransactionConfig = (transaction) => {
    const configs = {
      DEPOSIT: {
        icon: "account-balance-wallet",
        color:
          transaction.status === "SUCCESS"
            ? "#16A34A"
            : transaction.status === "PENDING"
              ? "#F59E0B"
              : "#DC2626",
        sign: "+",
        label:
          transaction.status === "SUCCESS"
            ? "Deposit Success"
            : transaction.status === "PENDING"
              ? "Pending Deposit"
              : "Deposit Failed",
        description: transaction.description || `Deposit to wallet${transaction.orderCode ? ` • #${transaction.orderCode}` : ""}`,
        category: "deposit",
      },
      COURSE_FEE: {
        icon: "school",
        color: "#8B5CF6",
        sign: "-",
        label: "Course Fee",
        description: transaction.description || "Course enrollment payment",
        category: "expense",
      },
      PAYMENT: {
        icon: "payment",
        color: "#DC2626",
        sign: "-",
        label: "Payment",
        description: transaction.description || "Payment transaction",
        category: "expense",
      },
      PURCHASE: {
        icon: "shopping-cart",
        color: "#DC2626",
        sign: "-",
        label: "Purchase",
        description: transaction.description || "Product purchase",
        category: "expense",
      },
      WITHDRAW: {
        icon: "account-balance",
        color: "#EF4444",
        sign: "-",
        label: "Withdrawal",
        description: transaction.description || "Withdraw to bank account",
        category: "expense",
      },
      PURCHASE_RESOURCE: {
        icon: "shopping-bag",
        color: "#DC2626",
        sign: "-",
        label: "Resource Purchase",
        description: transaction.description || "Purchase resource",
        category: "expense",
      },
      PURCHASE_AI_CREDITS: {
        icon: "stars",
        color: "#F59E0B",
        sign: "-",
        label: "AI Credits Purchase",
        description: transaction.description || "Purchase AI credits",
        category: "expense",
      },
      PURCHASE_SUBSCRIPTION: {
        icon: "card-membership",
        color: "#8B5CF6",
        sign: "-",
        label: "Subscription Purchase",
        description: transaction.description || "Purchase subscription",
        category: "expense",
      },
      SUBSCRIPTION: {
        icon: "card-membership",
        color: "#8B5CF6",
        sign: "-",
        label: "Subscription",
        description: transaction.description || "Subscription transaction",
        category: "expense",
      },
    };
    return configs[transaction.type] || {
      icon: "receipt",
      color: "#64748B",
      sign: "-",
      label: transaction.type || "Transaction",
      description: transaction.description || "Transaction",
      category: "other",
    };
  };

  const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN") + " đ";
  const formatDate = (d) => {
    // Handle both "2025-12-16 19:41:57" and ISO format
    const date = new Date(d.replace(" ", "T"));
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <Text style={styles.cardDescription}>{config.description}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          {item.externalTransactionId && (
            <Text style={styles.cardCode}>
              Ref: {item.externalTransactionId}
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, { color: config.color }]}>
            {config.sign}
            {formatCurrency(item.amount)}
          </Text>
          {item.balanceAfter !== null && item.balanceAfter !== undefined && (
            <Text style={styles.cardDate}>
              Balance: {formatCurrency(item.balanceAfter)}
            </Text>
          )}
          <View
            style={[styles.badge, { backgroundColor: `${config.color}15` }]}
          >
            <Text style={[styles.badgeText, { color: config.color }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primaryBlue} />
      </View>
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
            <Icon name="arrow-back" size={24} color={colors.primaryWhite} />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {TABS.map((tab, index) => (
            <Pressable
              key={tab.label}
              style={[styles.tab, { flex: 1, minWidth: screenWidth / 4 }]}
              onPress={() => handleTabPress(tab, index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab.label === tab.label && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => `${item.transactionId}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primaryBlue]}
              tintColor={colors.primaryBlue}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <LottieView
                source={require("../../../assets/transaction.json")}
                autoPlay
                loop
                style={{ width: 100, height: 100 }}
              />
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
                <Icon name="close" size={26} color={colors.closeIconColor} />
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
                          {formatCurrency(selectedTx.amount)}
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Status</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: `${config.color}15` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                { color: config.color },
                              ]}
                            >
                              {selectedTx.status}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Transaction ID</Text>
                          <Text style={styles.detailValue}>
                            #{selectedTx.transactionId}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Type</Text>
                          <Text style={styles.detailValue}>
                            {selectedTx.type}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Date & Time</Text>
                          <Text style={styles.detailValue}>
                            {formatDate(selectedTx.createdAt)}
                          </Text>
                        </View>

                        {selectedTx.balanceAfter !== null && selectedTx.balanceAfter !== undefined && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Balance After</Text>
                            <Text style={styles.detailValue}>
                              {formatCurrency(selectedTx.balanceAfter)}
                            </Text>
                          </View>
                        )}

                        {selectedTx.orderCode && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order Code</Text>
                            <Text style={styles.detailValue}>
                              #{selectedTx.orderCode}
                            </Text>
                          </View>
                        )}

                        {selectedTx.externalTransactionId && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reference ID</Text>
                            <Text style={styles.detailValue}>
                              {selectedTx.externalTransactionId}
                            </Text>
                          </View>
                        )}

                        {selectedTx.provider && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>
                              Payment Provider
                            </Text>
                            <Text style={styles.detailValue}>
                              {selectedTx.provider}
                            </Text>
                          </View>
                        )}

                        {selectedTx.orderId && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order ID</Text>
                            <Text style={styles.detailValue}>
                              #{selectedTx.orderId}
                            </Text>
                          </View>
                        )}

                        {selectedTx.description && (
                          <View
                            style={[styles.detailRow, { borderBottomWidth: 0 }]}
                          >
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
                        )}
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
