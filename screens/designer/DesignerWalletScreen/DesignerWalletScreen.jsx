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
import { LinearGradient } from "expo-linear-gradient";
import { paymentService } from "../../../service/paymentService";
import { useToast } from "../../../hooks/use-toast";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";

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
  const [withdrawAmount, setWithdrawAmount] = useState("");
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
      // In a real app, you would fetch this from your API
      const data = await paymentService.getWallet();
      // Mock data for designer-specific fields
      setWalletData({
        ...data.result,
        totalEarnings: 12500000, // Example value
        pendingWithdrawals: 2500000, // Example value
        totalWithdrawn: 8500000, // Example value
      });
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
      // In a real app, you would call your API to process the withdrawal
      // await paymentService.withdraw(amount, bankInfo);

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
        description: "Withdrawal failed. Please try again later.",
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SidebarToggleButton
          style={styles.backButton}
          iconColor="#084F8C"
          iconSize={24}
        />
        <Text style={styles.headerTitle}>Designer Wallet</Text>
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
            <Text style={styles.balanceLabelNew}>Available Balance</Text>
            <Text style={styles.balanceAmountNew}>
              {formatCurrency(walletData.balance)}
            </Text>

            <View style={styles.statsRowNew}>
              <View style={styles.statBox}>
                <Text style={styles.statValueNew}>
                  {formatCurrency(walletData.totalEarnings)}
                </Text>
                <Text style={styles.statLabelNew}>Total Earnings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValueNew}>
                  {formatCurrency(walletData.pendingWithdrawals)}
                </Text>
                <Text style={styles.statLabelNew}>Pending</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValueNew}>
                  {formatCurrency(walletData.totalWithdrawn)}
                </Text>
                <Text style={styles.statLabelNew}>Total Withdrawn</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.withdrawButtonNew}
              onPress={() => setShowWithdrawModal(true)}
            >
              <Icon name="account-balance-wallet" size={20} color="#FFFFFF" />
              <Text style={styles.withdrawButtonTextNew}>Withdraw Funds</Text>
            </TouchableOpacity>
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
                onPress={() => navigation.navigate("TransactionHistory")}
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
        <View style={[styles.recentCard, isWide && styles.recentCardLimit]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, idx) => (
              <View
                key={
                  transaction?.transactionId ??
                  transaction?.id ??
                  `${transaction?.type || "TX"}-${
                    transaction?.createdAt || ""
                  }-${idx}`
                }
                style={styles.transactionItemNew}
              >
                <View style={styles.transIconWrap}>
                  <Icon
                    name={
                      transaction.type === "DEPOSIT"
                        ? "arrow-downward"
                        : transaction.type === "WITHDRAWAL"
                        ? "arrow-upward"
                        : "shopping-cart"
                    }
                    size={20}
                    color={
                      transaction.type === "DEPOSIT"
                        ? "#16A34A"
                        : transaction.type === "WITHDRAWAL"
                        ? "#DC2626"
                        : "#084F8C"
                    }
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.transactionTitleNew}>
                    {transaction.type === "DEPOSIT"
                      ? "Deposit"
                      : transaction.type === "WITHDRAWAL"
                      ? "Withdrawal"
                      : "Purchase"}
                  </Text>
                  <Text style={styles.transactionDateNew}>
                    {formatDate(transaction.createdAt)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.transactionAmountNew,
                    { color: transaction.amount > 0 ? "#16A34A" : "#1E293B" },
                  ]}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
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

  /* TOP 2 COLUMNS */
  topWrapper: { padding: 20 },
  topWrapperRow: {
    flexDirection: "row",
    gap: 20,
    alignItems: "stretch",
  },
  topWrapperLimit: {
    width: "90%",
    alignSelf: "center",
  },

  leftCol: { flex: 60 },
  rightCol: { flex: 1, maxWidth: 370 },

  /* BALANCE CARD */
  balanceCardNew: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#084F8C",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    flex: 1,
  },

  balanceLabelNew: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },

  balanceAmountNew: {
    fontSize: 38,
    fontWeight: "800",
    color: "#084F8C",
    marginTop: 6,
  },
  statsRowNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E7FF",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E7FF",
  },
  statValueNew: {
    fontSize: 16,
    fontWeight: "700",
    color: "#084F8C",
  },

  statLabelNew: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  withdrawButtonNew: {
    backgroundColor: "#084F8C",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
    flexDirection: "row",
    shadowColor: "#062b7cff",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    // 👇 THÊM DÒNG NÀY
    alignSelf: "center",
  },

  withdrawButtonTextNew: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 8,
  },

  /* ACTION CARD */
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#084F8C",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#E0E7FF",
  },
  actionCardTitle: {
    fontSize: 15,
    color: "#084F8C",
    fontWeight: "600",
    marginBottom: 16,
  },

  actionList: { gap: 16 },
  oneActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 16,
    backgroundColor: "#F8FAFF",
    // width sẽ được override trong JSX
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  actionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#084F8C",
  },

  /* RECENT TRANSACTIONS */
  recentCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recentCardLimit: {
    alignSelf: "center",
    width: "88%",
  },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#084F8C",
  },

  transactionItemNew: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  transIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionTitleNew: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  transactionDateNew: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  transactionAmountNew: { fontSize: 15, fontWeight: "700" },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 12,
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
    maxHeight: "92%",
    paddingBottom: 10,
    shadowColor: "#084F8C",
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9F5",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#084F8C",
  },

  modalBody: {
    padding: 24,
    flexGrow: 1, // cho ScrollView chiếm đủ không gian
  },

  /* INPUT LABEL */
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },

  /* AMOUNT INPUT */
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: "#D4DAF3",
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    padding: 0,
  },

  /* QUICK AMOUNTS */
  quickAmountsNew: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  quickAmountButtonNew: {
    backgroundColor: "#F1F5FF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  quickAmountTextNew: {
    color: "#084F8C",
    fontWeight: "700",
    fontSize: 14,
  },

  /* BANK GRID */
  bankGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  bankGridItem: {
    flex: 1,
  },
  bankInfoLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontWeight: "600",
  },
  bankInfoInputNew: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "#D4DAF3",
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  /* NOTE BOX */
  noteContainerNew: {
    flexDirection: "row",
    backgroundColor: "#F1F5FF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  noteTextNew: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
    fontWeight: "500",
  },

  /* FOOTER */
  modalFooterNew: {
    flexDirection: "row",
    justifyContent: "center", // canh giữa
    paddingHorizontal: 20,
    gap: 60, // khoảng cách giữa 2 nút
  },

  buttonNew: {
    width: "28%", // mỗi nút khoảng 50%
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonNew: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  confirmButtonNew: {
    backgroundColor: "#084F8C",
    shadowColor: "#084F8C",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonTextNew: {
    fontSize: 16,
    fontWeight: "700",
  },
});
