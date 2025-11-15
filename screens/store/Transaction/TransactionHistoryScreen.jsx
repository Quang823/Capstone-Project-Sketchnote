import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  FlatList,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const TABS = ["All", "Deposits", "Expenses", "Pending"];
const screenWidth = Dimensions.get("window").width;

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions = [] } = route.params || {};

  const [activeTab, setActiveTab] = useState("All");
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;

  // Animate tab indicator
  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: (screenWidth / 4) * index,
      useNativeDriver: true,
    }).start();
  };

  // Get transaction config
  const getTransactionConfig = (transaction) => {
    const configs = {
      DEPOSIT: {
        icon: "account-balance-wallet",
        color: transaction.status === "SUCCESS" ? "#10B981" : transaction.status === "PENDING" ? "#F59E0B" : "#EF4444",
        sign: "+",
        label: transaction.status === "SUCCESS" ? "Deposit Success" : transaction.status === "PENDING" ? "Pending Deposit" : "Deposit Failed",
        description: `Deposit to wallet${transaction.orderCode ? ` • #${transaction.orderCode}` : ""}`,
        category: "deposit"
      },
      COURSE_FEE: {
        icon: "school",
        color: "#8B5CF6",
        sign: "-",
        label: "Course Fee",
        description: "Course enrollment payment",
        category: "expense"
      },
      PAYMENT: {
        icon: "payment",
        color: "#EF4444",
        sign: "-",
        label: "Payment",
        description: "Payment transaction",
        category: "expense"
      },
      PURCHASE: {
        icon: "shopping-cart",
        color: "#EF4444",
        sign: "-",
        label: "Purchase",
        description: "Product purchase",
        category: "expense"
      }
    };

    return configs[transaction.type] || configs.PURCHASE;
  };

  // Summary calculations
  const totalDeposit = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalExpense = transactions
    .filter((t) => ["COURSE_FEE", "PAYMENT", "PURCHASE"].includes(t.type) && t.status === "SUCCESS")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalPending = transactions.filter((t) => t.status === "PENDING").length;

  // Filtered data
  const filteredData = transactions
    .filter((t) => {
      if (activeTab === "All") return true;
      if (activeTab === "Deposits") return t.type === "DEPOSIT";
      if (activeTab === "Expenses") return ["COURSE_FEE", "PAYMENT", "PURCHASE"].includes(t.type);
      if (activeTab === "Pending") return t.status === "PENDING";
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Helpers
  const formatCurrency = (n) => (n ?? 0).toLocaleString("vi-VN") + " VND";

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
        <View style={[styles.iconWrap, { backgroundColor: `${config.color}15` }]}>
          <Icon name={config.icon} size={22} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{config.label}</Text>
          <Text style={styles.cardDescription}>{config.description}</Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
          {item.externalTransactionId && (
            <Text style={styles.cardCode}>Ref: {item.externalTransactionId}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.amount, { color: config.color }]}>
            {config.sign}{formatCurrency(item.amount)}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
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
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Icon name="account-balance-wallet" size={20} color="#10B981" style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Total Deposit</Text>
          <Text style={[styles.summaryValue, { color: "#10B981" }]}>
            +{formatCurrency(totalDeposit)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon name="trending-down" size={20} color="#EF4444" style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Total Expense</Text>
          <Text style={[styles.summaryValue, { color: "#EF4444" }]}>
            -{formatCurrency(totalExpense)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon name="schedule" size={20} color="#F59E0B" style={{ marginBottom: 4 }} />
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: "#F59E0B", fontSize: 18 }]}>
            {totalPending}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.tabIndicator,
            { transform: [{ translateX }] },
          ]}
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
            <Icon name="receipt-long" size={60} color="#D1D5DB" />
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
                <Icon name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {selectedTx && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {(() => {
                  const config = getTransactionConfig(selectedTx);
                  return (
                    <>
                      {/* Transaction Icon & Type */}
                      <View style={styles.modalIconSection}>
                        <View style={[styles.modalIcon, { backgroundColor: `${config.color}15` }]}>
                          <Icon name={config.icon} size={40} color={config.color} />
                        </View>
                        <Text style={styles.modalLabel}>{config.label}</Text>
                        <Text style={styles.modalAmount}>
                          {config.sign}{formatCurrency(selectedTx.amount)}
                        </Text>
                      </View>

                      {/* Details */}
                      <View style={styles.detailSection}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Status</Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${config.color}15` }]}>
                            <Text style={[styles.statusBadgeText, { color: config.color }]}>
                              {selectedTx.status}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Transaction ID</Text>
                          <Text style={styles.detailValue}>#{selectedTx.transactionId}</Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Type</Text>
                          <Text style={styles.detailValue}>{selectedTx.type}</Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Date & Time</Text>
                          <Text style={styles.detailValue}>{formatDate(selectedTx.createdAt)}</Text>
                        </View>

                        {selectedTx.orderCode && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order Code</Text>
                            <Text style={styles.detailValue}>#{selectedTx.orderCode}</Text>
                          </View>
                        )}

                        {selectedTx.externalTransactionId && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reference ID</Text>
                            <Text style={styles.detailValue}>{selectedTx.externalTransactionId}</Text>
                          </View>
                        )}

                        {selectedTx.provider && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Payment Provider</Text>
                            <Text style={styles.detailValue}>{selectedTx.provider}</Text>
                          </View>
                        )}

                        {selectedTx.orderId && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Order ID</Text>
                            <Text style={styles.detailValue}>#{selectedTx.orderId}</Text>
                          </View>
                        )}

                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Description</Text>
                          <Text style={[styles.detailValue, { maxWidth: '60%', textAlign: 'right' }]}>
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

const styles = {
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937" },
  
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    margin: 12,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryLabel: { fontSize: 11, color: "#6B7280", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: "700" },
  divider: { width: 1, backgroundColor: "#E5E7EB", marginHorizontal: 8 },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: "hidden",
    elevation: 2,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#1D4ED8" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: screenWidth / 4,
    height: 3,
    backgroundColor: "#3B82F6",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  cardDescription: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  cardDate: { fontSize: 12, color: "#9CA3AF" },
  cardCode: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "700" },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: "600" },

  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#9CA3AF", marginTop: 10, fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  
  modalIconSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
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
    color: "#6B7280",
    marginBottom: 8,
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
  },

  detailSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  closeBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontWeight: "600", fontSize: 16 },
};