import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./TransactionHistoryScreen.styles";

const TABS = ["All", "Deposits", "Expenses", "Pending"];

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
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#084F8C" />
          </Pressable>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={{ width: 24 }} />
        </View>
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

