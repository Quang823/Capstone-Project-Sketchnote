import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const TABS = ["All", "Deposits", "Expenses", "Pending"];
const screenWidth = Dimensions.get("window").width;

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions: initialTransactions = [] } = route.params || {};

  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) {
      fetchHistory();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const historyData = await import("../../../service/creditService").then(m => m.creditService.getCreditTransactionHistory());
      if (Array.isArray(historyData)) {
        setTransactions(historyData);
      } else if (historyData && historyData.content && Array.isArray(historyData.content)) {
        setTransactions(historyData.content);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const translateX = useRef(new Animated.Value(0)).current;

  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: (screenWidth / 4) * index,
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
        description: `Deposit to wallet${transaction.orderCode ? ` • #${transaction.orderCode}` : ""
          }`,
        category: "deposit",
      },
      COURSE_FEE: {
        icon: "school",
        color: "#8B5CF6",
        sign: "-",
        label: "Course Fee",
        description: "Course enrollment payment",
        category: "expense",
      },
      PAYMENT: {
        icon: "payment",
        color: "#DC2626",
        sign: "-",
        label: "Payment",
        description: "Payment transaction",
        category: "expense",
      },
      PURCHASE: {
        icon: "shopping-cart",
        color: "#DC2626",
        sign: "-",
        label: "Purchase",
        description: "Product purchase",
        category: "expense",
      },
    };
    return configs[transaction.type] || configs.PURCHASE;
  };

  const totalDeposit = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(
      (t) =>
        ["COURSE_FEE", "PAYMENT", "PURCHASE"].includes(t.type) &&
        t.status === "SUCCESS"
    )
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPending = transactions.filter(
    (t) => t.status === "PENDING"
  ).length;

  const filteredData = transactions
    .filter((t) => {
      if (activeTab === "All") return true;
      if (activeTab === "Deposits") return t.type === "DEPOSIT";
      if (activeTab === "Expenses")
        return ["COURSE_FEE", "PAYMENT", "PURCHASE"].includes(t.type);
      if (activeTab === "Pending") return t.status === "PENDING";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN") + " đ";
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
        style={[styles.card, { borderColor: "#E0E7FF", borderWidth: 1 }]}
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Icon
            name="account-balance-wallet"
            size={20}
            color="#16A34A"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Total Deposit</Text>
          <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
            +{formatCurrency(totalDeposit)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon
            name="trending-down"
            size={20}
            color="#DC2626"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryValue, { color: "#DC2626" }]}>
            -{formatCurrency(totalExpense)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon
            name="schedule"
            size={20}
            color="#F59E0B"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text
            style={[styles.summaryValue, { color: "#F59E0B", fontSize: 18 }]}
          >
            {totalPending}
          </Text>
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
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.transactionId?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Icon name="receipt" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {/* Modal Detail */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="close" size={26} color="#0F172A" />
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

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Description</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { maxWidth: "60%", textAlign: "right" },
                            ]}
                          >
                            {config.description}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // căn giữa tuyệt đối
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
    padding: 12, // vùng chạm lớn hơn
    borderRadius: 30,
    backgroundColor: "#F8FAFC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },

  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: "#084F8C",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#E0E7FF",
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 4,
    fontWeight: "600",
  },
  summaryValue: { fontSize: 16, fontWeight: "700" },
  divider: { width: 1, backgroundColor: "#E0E7FF", marginHorizontal: 8 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, color: "#64748B", fontWeight: "600" },
  tabTextActive: { color: "#084F8C" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: screenWidth / 4,
    height: 3,
    backgroundColor: "#084F8C",
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
  cardCode: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
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
  detailValue: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
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
