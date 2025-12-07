import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { paymentService } from "../../../service/paymentService";
import { useToast } from "../../../hooks/use-toast";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import styles from "./DesignerWalletScreen.styles";
const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function DesignerWalletScreen() {
  const navigation = useNavigation();
  const { toast } = useToast();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("wallet");
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
    totalEarnings: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0,
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  // Format helpers
  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

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

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      // Fetch wallet balance and transactions
      const data = await paymentService.getWallet();

      // Fetch withdrawal history to calculate total withdrawn
      try {
        const withdrawalData = await paymentService.getWithdrawHistory(0, 1000, "createdAt", "DESC");
        let withdrawals = [];

        if (withdrawalData && Array.isArray(withdrawalData.content)) {
          withdrawals = withdrawalData.content;
        } else if (Array.isArray(withdrawalData)) {
          withdrawals = withdrawalData;
        } else if (withdrawalData && Array.isArray(withdrawalData.result)) {
          withdrawals = withdrawalData.result;
        }

        // Calculate total withdrawn amount from successful withdrawals
        const totalWithdrawn = withdrawals
          .filter(w =>
            w.status === "SUCCESS" ||
            w.status === "COMPLETED" ||
            w.status === "APPROVED"
          )
          .reduce((sum, w) => sum + (w.amount || 0), 0);

        // Update wallet data with calculated totalWithdrawn
        setWalletData({
          ...data.result,
          totalWithdrawn: totalWithdrawn,
        });
      } catch (withdrawalError) {
        console.error("Error fetching withdrawal history:", withdrawalError);
        // Continue with wallet data even if withdrawal fetch fails
        setWalletData(data.result);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error.message);

      toast({
        title: "Error",
        description: "Cannot fetch wallet data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle withdraw request
  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100000) {
      toast({
        title: "Error",
        description: "Minimum withdraw amount is 100,000 VND",
        variant: "destructive",
      });
      return;
    }

    if (amount > walletData.balance) {
      toast({
        title: "Error",
        description: "Insufficient balance to withdraw this amount.",
        variant: "destructive",
      });
      return;
    }

    if (
      !bankInfo.bankName ||
      !bankInfo.accountNumber ||
      !bankInfo.accountName
    ) {
      toast({
        title: "Error",
        description: "Please fill in all bank information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        amount: amount,
        bankName: bankInfo.bankName,
        bankAccountNumber: bankInfo.accountNumber,
        bankAccountHolder: bankInfo.accountName,
      };

      await paymentService.withdrawRequest(payload);

      setShowWithdrawModal(false);
      setWithdrawAmount("");

      toast({
        title: "Success",
        description: `Withdrawal request of ${formatCurrency(
          amount
        )} has been submitted.`,
        variant: "success",
      });

      // Refresh wallet data
      fetchWallet();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: error.message || "Withdrawal failed. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Handle deposit request
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 5000) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is 5,000 VND",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = await paymentService.depositWallet(amount);
      setShowDepositModal(false);
      setDepositAmount("");
      navigation.navigate("PaymentWebView", { paymentUrl: url.message });
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Failed",
        description: "Deposit failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWallet();
    const unsubscribe = navigation.addListener("focus", fetchWallet);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setActiveNavItem("wallet");
    setActiveNavItemLocal("wallet");
  }, [setActiveNavItem]);

  // Recent transactions (last 5)
  const recentTransactions = walletData.transactions.slice(0, 5);
  const isLandscape = windowWidth > windowHeight;
  const isPortrait = !isLandscape;
  const isWide = windowWidth > 900;

  // Get transaction icon and color
  const getTransactionStyle = (transaction) => {
    const typeConfig = {
      DEPOSIT: {
        icon: "account-balance-wallet",
        color:
          transaction.status === "SUCCESS"
            ? "#10B981"
            : transaction.status === "PENDING"
              ? "#F59E0B"
              : "#EF4444",
        sign: "+",
        label:
          transaction.status === "SUCCESS"
            ? "Deposit Success"
            : transaction.status === "PENDING"
              ? "Pending Deposit"
              : "Deposit Failed",
        description: `Deposit to wallet${transaction.orderCode ? ` • #${transaction.orderCode}` : ""
          }`,
      },
      WITHDRAWAL: {
        icon: "account-balance",
        color: "#EF4444",
        sign: "-",
        label: "Withdrawal",
        description: "Withdraw to bank account",
      },
      COURSE_FEE: {
        icon: "school",
        color: "#8B5CF6",
        sign: "-",
        label: "Course Fee",
        description: "Course enrollment payment",
      },
      PAYMENT: {
        icon: "payment",
        color: "#EF4444",
        sign: "-",
        label: "Payment",
        description: "Payment transaction",
      },
      PURCHASE: {
        icon: "shopping-cart",
        color: "#EF4444",
        sign: "-",
        label: "Purchase",
        description: "Product purchase",
      },
    };

    return typeConfig[transaction.type] || typeConfig.PURCHASE;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#084F8C" />
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TOP SECTION LAYOUT */}
        <View
          style={[
            styles.topWrapper,
            isLandscape && styles.topWrapperRow,
            isWide && styles.topWrapperLimit,
          ]}
        >
          {/* LEFT – BALANCE CARD */}
          <View
            style={[
              styles.balanceCardNew,
              isLandscape && { flex: 1, maxWidth: "100%", marginRight: 16 },
            ]}
          >
            <View style={styles.balanceHeaderRow}>
              <View>
                <Text style={styles.balanceLabelNew}>Available Balance</Text>
                <Text style={styles.balanceAmountNew}>
                  {formatCurrency(walletData.balance)}
                </Text>
              </View>
              <View style={styles.walletIconLarge}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={42}
                  color="#084F8C"
                />
                <Text style={styles.walletLabel}>Wallet</Text>
              </View>
            </View>

            <View style={styles.miniStats}>
              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Earnings</Text>
                <Text style={styles.miniStatValue}>
                  {formatCurrency(walletData.totalEarnings)}
                </Text>
              </View>

              <View style={styles.miniStatDivider} />

              <View style={styles.miniStat}>
                <Text style={styles.miniStatLabel}>Withdrawn</Text>
                <Text style={styles.miniStatValueNegative}>
                  {formatCurrency(walletData.totalWithdrawn)}
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.withdrawButtonNew}
                onPress={() => setShowWithdrawModal(true)}
              >
                <Icon name="account-balance" size={18} color="#FFFFFF" />
                <Text style={styles.withdrawButtonTextNew}>Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.depositButtonNew}
                onPress={() => setShowDepositModal(true)}
              >
                <Icon name="add-circle" size={18} color="#084F8C" />
                <Text style={styles.depositButtonTextNew}>Deposit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RIGHT – ACTION CARD */}
          <View style={[styles.actionCard, isLandscape && styles.rightCol]}>
            <Text style={styles.actionCardTitle}>Quick Actions</Text>

            <View
              style={[
                styles.actionList,
                isPortrait
                  ? {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }
                  : { flexDirection: "column", gap: 16 },
              ]}
            >
              <Pressable
                style={[styles.oneActionItem, isPortrait && { width: "48%" }]}
                onPress={() =>
                  navigation.navigate("TransactionHistory", {
                    transactions: walletData.transactions || [],
                  })
                }
              >
                <View
                  style={[
                    styles.actionCircle,
                    isLandscape && { width: 40, height: 40, borderRadius: 20 },
                  ]}
                >
                  <Icon name="history" size={24} color="#084F8C" />
                </View>
                <Text
                  style={[styles.actionName, isLandscape && { fontSize: 14 }]}
                >
                  Transaction History
                </Text>
              </Pressable>

              <Pressable
                style={[styles.oneActionItem, isPortrait && { width: "48%" }]}
                onPress={() => navigation.navigate("WithdrawalHistory")}
              >
                <View
                  style={[
                    styles.actionCircle,
                    isLandscape && { width: 40, height: 40, borderRadius: 20 },
                  ]}
                >
                  <Icon name="swap-horiz" size={24} color="#084F8C" />
                </View>
                <Text
                  style={[styles.actionName, isLandscape && { fontSize: 14 }]}
                >
                  Withdraw History
                </Text>
              </Pressable>

              <Pressable
                style={[styles.oneActionItem, isPortrait && { width: "48%" }]}
                onPress={() => navigation.navigate("BankAccounts")}
              >
                <View
                  style={[
                    styles.actionCircle,
                    isLandscape && { width: 40, height: 40, borderRadius: 20 },
                  ]}
                >
                  <Icon name="account-balance" size={24} color="#084F8C" />
                </View>
                <Text
                  style={[styles.actionName, isLandscape && { fontSize: 14 }]}
                >
                  Bank Accounts
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.historySection}>
          {/* Header Outside Card */}
          <View style={styles.historySectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <Text style={styles.transactionCount}>
                {recentTransactions.length} of {walletData.transactions.length}
              </Text>
            </View>
            {walletData.transactions.length > 0 && (
              <Pressable
                style={styles.viewAllButton}
                onPress={() =>
                  navigation.navigate("TransactionHistory", {
                    transactions: walletData.transactions || [],
                  })
                }
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#3B82F6" />
              </Pressable>
            )}
          </View>

          {/* Transaction List in White Card */}
          {recentTransactions.length > 0 ? (
            <View style={[styles.recentCard, isWide && styles.recentCardLimit]}>
              {recentTransactions.map((transaction, idx) => {
                const style = getTransactionStyle(transaction);
                return (
                  <View
                    key={
                      transaction?.transactionId ??
                      transaction?.id ??
                      `${transaction?.type || "TX"}-${transaction?.createdAt || ""
                      }-${idx}`
                    }
                    style={styles.transactionItemNew}
                  >
                    <View
                      style={[
                        styles.transIconWrap,
                        { backgroundColor: `${style.color}15` },
                      ]}
                    >
                      <Icon name={style.icon} size={24} color={style.color} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.transactionTitleNew}>
                        {style.label}
                      </Text>
                      <Text style={styles.transactionDateNew}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                      {transaction.orderCode && (
                        <Text style={styles.transactionDateNew}>
                          Order: {transaction.orderCode}
                        </Text>
                      )}
                    </View>

                    <View style={styles.transactionRightNew}>
                      <Text
                        style={[
                          styles.transactionAmountNew,
                          { color: style.color },
                        ]}
                      >
                        {style.sign}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Text>
                      {typeof transaction.balance === "number" && (
                        <Text style={styles.transactionBalanceNew}>
                          Balance: {formatCurrency(transaction.balance)}
                        </Text>
                      )}
                      {transaction.status && (
                        <View
                          style={[
                            styles.statusBadgeNew,
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
                              styles.statusTextNew,
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
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="receipt" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No recent transactions</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdrawal</Text>
              <Pressable onPress={() => setShowWithdrawModal(false)}>
                <Icon name="close" size={26} color="#0F172A" />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* AMOUNT INPUT */}
              <Text style={styles.inputLabel}>Withdrawal Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₫</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
              </View>

              {/* QUICK AMOUNTS */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                Quick Amounts
              </Text>
              <View style={styles.quickAmountsNew}>
                {quickAmounts.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButtonNew}
                    onPress={() => setWithdrawAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountTextNew}>
                      {amount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* BANK INFO TITLE */}
              <Text style={[styles.inputLabel, { marginTop: 24 }]}>
                Bank Information
              </Text>

              {/* 2-COLUMN BANK INPUTS */}
              <View style={styles.bankGrid}>
                <View style={styles.bankGridItem}>
                  <Text style={styles.bankInfoLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.bankInfoInputNew}
                    placeholder="Enter bank name"
                    value={bankInfo.bankName}
                    onChangeText={(text) =>
                      setBankInfo({ ...bankInfo, bankName: text })
                    }
                  />
                </View>

                <View style={styles.bankGridItem}>
                  <Text style={styles.bankInfoLabel}>Account Number</Text>
                  <TextInput
                    style={styles.bankInfoInputNew}
                    placeholder="Enter account number"
                    keyboardType="numeric"
                    value={bankInfo.accountNumber}
                    onChangeText={(text) =>
                      setBankInfo({ ...bankInfo, accountNumber: text })
                    }
                  />
                </View>
              </View>

              <View style={[styles.bankGridItem, { marginTop: 12 }]}>
                <Text style={styles.bankInfoLabel}>Account Name</Text>
                <TextInput
                  style={styles.bankInfoInputNew}
                  placeholder="Enter account name"
                  value={bankInfo.accountName}
                  onChangeText={(text) =>
                    setBankInfo({ ...bankInfo, accountName: text })
                  }
                />
              </View>

              {/* NOTE BOX */}
              <View style={styles.noteContainerNew}>
                <Icon name="info" size={18} color="#0F172A" />
                <Text style={styles.noteTextNew}>
                  Payouts take 1–3 business days. Fee: 1.1% (min 5,000 VND).
                </Text>
              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.modalFooterNew}>
              <Pressable
                style={[styles.buttonNew, styles.cancelButtonNew]}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={[styles.buttonTextNew, { color: "#64748B" }]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[styles.buttonNew, styles.confirmButtonNew]}
                onPress={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  !bankInfo.bankName ||
                  !bankInfo.accountNumber ||
                  !bankInfo.accountName
                }
              >
                <Text style={[styles.buttonTextNew, { color: "#FFFFFF" }]}>
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent]}>
            {/* Header Outside ScrollView */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit Funds</Text>
              <Pressable onPress={() => setShowDepositModal(false)}>
                <Icon name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalBody}
            >
              {/* Amount Input */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Deposit Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₫</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.quickAmounts}>
                  {quickAmounts.map((amt) => (
                    <Pressable
                      key={amt}
                      style={[
                        styles.quickAmountButton,
                        depositAmount === amt.toString() &&
                        styles.quickAmountButtonActive,
                      ]}
                      onPress={() => setDepositAmount(amt.toString())}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          depositAmount === amt.toString() &&
                          styles.quickAmountTextActive,
                        ]}
                      >
                        {formatCurrency(amt)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.paymentSection}>
                <Text style={styles.paymentLabel}>Payment Method</Text>
                <View
                  style={[
                    styles.paymentMethod,
                    styles.selectedPaymentMethod,
                  ]}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Text style={styles.paymentIcon}>💳</Text>
                    <View>
                      <Text style={styles.paymentName}>PayOS</Text>
                      <Text style={styles.paymentFee}>Free</Text>
                    </View>
                  </View>
                  <Icon name="check-circle" size={24} color="#3B82F6" />
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.modalFooterNew}>
                <Pressable
                  style={[styles.buttonNew, styles.cancelButtonNew]}
                  onPress={() => setShowDepositModal(false)}
                >
                  <Text
                    style={[styles.buttonTextNew, { color: "#64748B" }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.buttonNew,
                    styles.confirmButtonNew,
                  ]}
                  onPress={handleDeposit}
                >
                  <Text
                    style={[styles.buttonTextNew, { color: "#FFFFFF" }]}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

