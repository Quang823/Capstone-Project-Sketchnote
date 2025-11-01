import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { walletStyles } from "./WalletScreen.styles";
import { paymentService } from "../../../service/paymentService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function WalletScreen() {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  // 📦 Format helpers
  const formatCurrency = (amount) =>
    (amount ?? 0).toLocaleString("vi-VN") + " VND";

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 💳 Handle deposit
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 5000) {
      Alert.alert("Lỗi", "Số tiền nạp tối thiểu là 5,000 VND");
      return;
    }

    try {
      const url = await paymentService.depositWallet(amount);

      setShowDepositModal(false);
      navigation.navigate("PaymentWebView", { paymentUrl: url });
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Thất bại", "Không thể tạo liên kết thanh toán.");
    }
  };

  // ⚡ Fetch wallet info
  const fetchWallet = async () => {
    try {
      const data = await paymentService.getWallet();
      setWalletData(data);
    } catch (error) {
      console.error("Error fetching wallet:", error.message);
      Alert.alert("Lỗi", "Không thể tải thông tin ví.");
    }
  };

  useEffect(() => {
    fetchWallet();
    const unsubscribe = navigation.addListener("focus", fetchWallet);
    return unsubscribe;
  }, [navigation]);

  // 📊 Stats
  const totalDeposit = walletData.transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = walletData.transactions
    .filter((t) => t.type === "PURCHASE")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // 🧾 Lấy 5 giao dịch gần nhất (mới nhất trước)
  const recentTransactions = [...walletData.transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get transaction icon and color
  const getTransactionStyle = (transaction) => {
    if (transaction.type === "DEPOSIT") {
      return {
        icon: "account-balance-wallet",
        color: transaction.status === "SUCCESS" ? "#10B981" : "#F59E0B",
        sign: "+",
        label: transaction.status === "SUCCESS" ? "Deposit" : "Pending Deposit",
      };
    } else {
      return {
        icon: "shopping-cart",
        color: "#EF4444",
        sign: "-",
        label: "Purchase",
      };
    }
  };

  return (
    <View style={walletStyles.container}>
      {/* Header */}
      <View style={walletStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={walletStyles.headerTitle}>E-Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={walletStyles.content} showsVerticalScrollIndicator={false}>
        {/* 💰 Balance Card */}
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={walletStyles.balanceCard}
        >
          <View style={walletStyles.balanceHeader}>
            <Text style={walletStyles.balanceLabel}>Current Balance</Text>
            <View style={walletStyles.walletIconContainer}>
              <Text style={walletStyles.walletIcon}>💎</Text>
            </View>
          </View>

          <Text style={walletStyles.balanceAmount}>
            {formatCurrency(walletData.balance)}
          </Text>

          {/* Stats */}
          <View style={walletStyles.statsRow}>
            <View style={walletStyles.statItem}>
              <Text style={walletStyles.statLabel}>Total Deposits</Text>
              <Text style={walletStyles.statValue}>{formatCurrency(totalDeposit)}</Text>
            </View>
            <View style={walletStyles.statDivider} />
            <View style={walletStyles.statItem}>
              <Text style={walletStyles.statLabel}>Total Spent</Text>
              <Text style={walletStyles.statValue}>{formatCurrency(totalSpent)}</Text>
            </View>
          </View>

          <Pressable
            style={walletStyles.depositButton}
            onPress={() => setShowDepositModal(true)}
          >
            <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={walletStyles.depositButtonText}>Deposit Funds</Text>
          </Pressable>
        </LinearGradient>

        {/* 🧾 Transaction History */}
        <View style={walletStyles.historySection}>
          <View style={walletStyles.historySectionHeader}>
            <Text style={walletStyles.sectionTitle}>Recent Transactions</Text>
            <Text style={walletStyles.transactionCount}>
              {recentTransactions.length} of {walletData.transactions.length}
            </Text>
          </View>

          {recentTransactions.length > 0 ? (
            <>
              {recentTransactions.map((transaction) => {
                const style = getTransactionStyle(transaction);
                return (
                  <View key={transaction.transactionId} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: `${style.color}15` }]}>
                      <Icon name={style.icon} size={24} color={style.color} />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionLabel}>{style.label}</Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                      {transaction.orderCode && (
                        <Text style={styles.transactionCode}>
                          Order: {transaction.orderCode}
                        </Text>
                      )}
                    </View>

                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: style.color },
                        ]}
                      >
                        {style.sign}{formatCurrency(transaction.amount)}
                      </Text>
                      {transaction.status && (
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                transaction.status === "SUCCESS"
                                  ? "#10B98115"
                                  : transaction.status === "PENDING"
                                  ? "#F59E0B15"
                                  : "#EF444415",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color:
                                  transaction.status === "SUCCESS"
                                    ? "#10B981"
                                    : transaction.status === "PENDING"
                                    ? "#F59E0B"
                                    : "#EF4444",
                              },
                            ]}
                          >
                            {transaction.status}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}

              {/* View All Button */}
              {walletData.transactions.length > 5 && (
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() =>
                    navigation.navigate("TransactionHistory", {
                      transactions: walletData.transactions,
                    })
                  }
                >
                  <Text style={styles.viewAllText}>View All Transactions</Text>
                  <Icon name="arrow-forward" size={18} color="#3B82F6" />
                </Pressable>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 💵 Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={walletStyles.modalOverlay}>
          <View style={[walletStyles.modalContent, { maxHeight: "85%" }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={walletStyles.modalHeader}>
                <Text style={walletStyles.modalTitle}>Deposit Funds</Text>
                <Pressable onPress={() => setShowDepositModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              {/* Amount Input */}
              <View style={walletStyles.amountSection}>
                <Text style={walletStyles.amountLabel}>Deposit Amount</Text>
                <TextInput
                  style={walletStyles.amountInput}
                  value={depositAmount}
                  onChangeText={setDepositAmount}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                />

                <View style={walletStyles.quickAmounts}>
                  {quickAmounts.map((amt) => (
                    <Pressable
                      key={amt}
                      style={[
                        walletStyles.quickAmountButton,
                        depositAmount === amt.toString() && walletStyles.quickAmountButtonActive,
                      ]}
                      onPress={() => setDepositAmount(amt.toString())}
                    >
                      <Text
                        style={[
                          walletStyles.quickAmountText,
                          depositAmount === amt.toString() &&
                            walletStyles.quickAmountTextActive,
                        ]}
                      >
                        {formatCurrency(amt)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Payment Method */}
              <View style={walletStyles.paymentSection}>
                <Text style={walletStyles.paymentLabel}>Payment Method</Text>
                <View
                  style={[
                    walletStyles.paymentMethod,
                    walletStyles.selectedPaymentMethod,
                  ]}
                >
                  <View style={walletStyles.paymentMethodLeft}>
                    <Text style={walletStyles.paymentIcon}>💳</Text>
                    <View>
                      <Text style={walletStyles.paymentName}>PayOS</Text>
                      <Text style={walletStyles.paymentFee}>Free</Text>
                    </View>
                  </View>
                  <Icon name="check-circle" size={24} color="#3B82F6" />
                </View>
              </View>

              {/* Buttons */}
              <View style={walletStyles.modalActions}>
                <Pressable
                  style={walletStyles.cancelButton}
                  onPress={() => setShowDepositModal(false)}
                >
                  <Text style={walletStyles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={walletStyles.confirmButton} onPress={handleDeposit}>
                  <Text style={walletStyles.confirmButtonText}>Confirm Deposit</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionCode: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3B82F6",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
};