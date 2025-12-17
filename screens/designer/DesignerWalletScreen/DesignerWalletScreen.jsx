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
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { paymentService } from "../../../service/paymentService";
import { bankAccountService } from "../../../service/bankAccountService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { useTheme } from "../../../context/ThemeContext";
import getStyles, { getAlertStyles } from "./DesignerWalletScreen.styles";

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function DesignerWalletScreen() {
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { setActiveNavItem } = useNavContext();
  const { theme } = useTheme();

  // Get styles based on theme
  const styles = getStyles(theme);
  const alertStyles = getAlertStyles(theme);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = {
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#084F8C",
    textPrimary: isDark ? "#F1F5F9" : "#1E293B",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
    textMuted: isDark ? "#64748B" : "#94A3B8",
    background: isDark ? "#0F172A" : "#F8FAFC",
    cardBackground: isDark ? "#1E293B" : "#FFFFFF",
    borderColor: isDark ? "#334155" : "#E2E8F0",
    inputBackground: isDark ? "#0F172A" : "#F8FAFF",
    tabActiveBg: "#3B82F6",
    tabInactiveBg: isDark ? "#334155" : "#F1F5F9",
    tabActiveText: "#FFFFFF",
    tabInactiveText: isDark ? "#94A3B8" : "#64748B",
    bankItemBg: isDark ? "#1E293B" : "#FFFFFF",
    bankItemSelectedBg: isDark ? "#1E3A5F" : "#DBEAFE",
    bankItemBorder: isDark ? "#334155" : "#E2E8F0",
    bankItemSelectedBorder: "#3B82F6",
    bankSelectorBg: isDark ? "#0F172A" : "#F8FAFC",
  };

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

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: "error",
    title: "",
    message: "",
  });

  // Bank selection states
  const [banks, setBanks] = useState([]);
  const [savedBankAccounts, setSavedBankAccounts] = useState([]);
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showSavedAccounts, setShowSavedAccounts] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedSavedAccount, setSelectedSavedAccount] = useState(null);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [saveBankAccount, setSaveBankAccount] = useState(false);

  // Show alert modal helper
  const showAlert = (type, title, message) => {
    setAlertModal({ visible: true, type, title, message });
  };

  // Close alert modal
  const closeAlert = () => {
    setAlertModal({ visible: false, type: "error", title: "", message: "" });
  };

  // Format helpers
  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Fetch wallet data
  const fetchWallet = async () => {
    try {
      const data = await paymentService.getWallet();

      try {
        const withdrawalData = await paymentService.getWithdrawHistory(
          0,
          1000,
          "createdAt",
          "DESC"
        );
        let withdrawals = [];

        if (withdrawalData && Array.isArray(withdrawalData.content)) {
          withdrawals = withdrawalData.content;
        } else if (Array.isArray(withdrawalData)) {
          withdrawals = withdrawalData;
        } else if (withdrawalData && Array.isArray(withdrawalData.result)) {
          withdrawals = withdrawalData.result;
        }

        const totalWithdrawn = withdrawals
          .filter(
            (w) =>
              w.status === "SUCCESS" ||
              w.status === "COMPLETED" ||
              w.status === "APPROVED"
          )
          .reduce((sum, w) => sum + (w.amount || 0), 0);

        setWalletData({
          ...data.result,
          totalWithdrawn: totalWithdrawn,
        });
      } catch (withdrawalError) {
        console.error("Error fetching withdrawal history:", withdrawalError);
        setWalletData(data.result);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error.message);
      showAlert(
        "error",
        "Error",
        "Cannot fetch wallet data. Please try again."
      );
    }
  };

  // Handle bank selection from VietQR list
  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setBankInfo((prev) => ({
      ...prev,
      bankName: bank.shortName,
    }));
    setShowBankSelector(false);
    setBankSearchQuery("");
  };

  // Handle selection from saved bank accounts
  const handleSelectSavedAccount = (account) => {
    setSelectedSavedAccount(account);
    setBankInfo({
      bankName: account.branch,
      accountNumber: account.accountNumber,
      accountName: account.accountHolderName,
    });
    setShowSavedAccounts(false);
  };

  // Reset bank info when modal closes
  const handleCloseWithdrawModal = () => {
    setShowWithdrawModal(false);
    setWithdrawAmount("");
    setBankInfo({ bankName: "", accountNumber: "", accountName: "" });
    setSelectedBank(null);
    setSelectedSavedAccount(null);
    setShowBankSelector(false);
    setShowSavedAccounts(false);
    setBankSearchQuery("");
    setSaveBankAccount(false);
  };

  // Handle withdraw request
  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 10000) {
      showAlert(
        "error",
        "Invalid Amount",
        "Minimum withdraw amount is 10,000 đ"
      );
      return;
    }

    if (amount > walletData.balance) {
      showAlert(
        "error",
        "Insufficient Balance",
        "You do not have enough balance to withdraw this amount."
      );
      return;
    }

    if (
      !bankInfo.bankName ||
      !bankInfo.accountNumber ||
      !bankInfo.accountName
    ) {
      showAlert(
        "error",
        "Missing Information",
        "Please fill in all bank information."
      );
      return;
    }

    try {
      // 1. Save bank account if checkbox is checked
      if (saveBankAccount && selectedBank) {
        try {
          const accountData = {
            bankName: selectedBank.name,
            accountNumber: bankInfo.accountNumber.trim(),
            accountHolderName: bankInfo.accountName.trim(),
            branch: selectedBank.shortName,
            logoUrl: selectedBank.logo,
            isDefault: savedBankAccounts.length === 0,
          };
          await bankAccountService.createBankAccount(accountData);

          // Refresh saved accounts list immediately
          const accounts = await bankAccountService.getBankAccounts();
          setSavedBankAccounts(accounts);

          console.log("Bank account saved successfully");
        } catch (saveError) {
          console.error("Failed to save bank account:", saveError);
          // Continue with withdrawal even if save fails
        }
      }

      // 2. Proceed with withdrawal request
      const payload = {
        amount: amount,
        bankName: bankInfo.bankName,
        bankAccountNumber: bankInfo.accountNumber,
        bankAccountHolder: bankInfo.accountName,
      };

      await paymentService.withdrawRequest(payload);

      setShowWithdrawModal(false);
      setWithdrawAmount("");

      showAlert(
        "success",
        "Success",
        `Withdrawal request of ${formatCurrency(
          amount
        )} has been submitted successfully.`
      );

      fetchWallet();
    } catch (error) {
      console.error("Withdrawal error:", error);
      showAlert(
        "error",
        "Withdrawal Failed",
        error.message || "Withdrawal failed. Please try again later."
      );
    }
  };

  // Handle deposit request
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 10000) {
      showAlert(
        "error",
        "Invalid Amount",
        "Minimum deposit amount is 10,000 đ"
      );
      return;
    }

    try {
      const url = await paymentService.depositWallet(amount);
      setShowDepositModal(false);
      setDepositAmount("");
      navigation.navigate("PaymentWebView", { paymentUrl: url.message });
    } catch (error) {
      console.error("Payment error:", error);
      showAlert("error", "Deposit Failed", "Deposit failed. Please try again.");
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

  // Fetch banks from VietQR
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksData = await bankAccountService.getBanks();
        setBanks(banksData);
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      }
    };
    fetchBanks();
  }, []);

  // Fetch saved bank accounts
  useEffect(() => {
    const fetchSavedAccounts = async () => {
      try {
        const accounts = await bankAccountService.getBankAccounts();
        setSavedBankAccounts(accounts);
      } catch (err) {
        console.error("Failed to fetch saved bank accounts:", err);
      }
    };
    fetchSavedAccounts();
  }, []);

  // Recent transactions (last 5)
  const recentTransactions = [...(walletData.transactions || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
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
          <SidebarToggleButton iconSize={26} iconColor={colors.primaryWhite} />
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
                  color={colors.primaryBlue}
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
                <Icon name="add-circle" size={18} color={colors.primaryWhite} />
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
                  <Icon name="history" size={24} color={colors.primaryBlue} />
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
                  <Icon
                    name="swap-horiz"
                    size={24}
                    color={colors.primaryBlue}
                  />
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
                  <Icon
                    name="account-balance"
                    size={24}
                    color={colors.primaryBlue}
                  />
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
                <Icon
                  name="arrow-forward"
                  size={16}
                  color={colors.primaryWhite}
                />
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
                      {/* {transaction.orderCode && (
                        <Text style={styles.transactionDateNew}>
                          Order: {transaction.orderCode}
                        </Text>
                      )} */}
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
              <LottieView
                source={require("../../../assets/transaction.json")}
                autoPlay
                loop
                style={{ width: 100, height: 100 }}
              />
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
        onRequestClose={handleCloseWithdrawModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdrawal</Text>
              <Pressable onPress={handleCloseWithdrawModal}>
                <Icon name="close" size={26} color={colors.textPrimary} />
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
                  placeholderTextColor={colors.textMuted}
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

              {/* BANK SELECTION OPTIONS */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    showBankSelector
                      ? styles.tabButtonActive
                      : styles.tabButtonInactive,
                  ]}
                  onPress={() => {
                    setShowBankSelector(!showBankSelector);
                    setShowSavedAccounts(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      showBankSelector
                        ? styles.tabButtonTextActive
                        : styles.tabButtonTextInactive,
                    ]}
                  >
                    Select Bank
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    showSavedAccounts
                      ? styles.tabButtonActive
                      : styles.tabButtonInactive,
                  ]}
                  onPress={() => {
                    setShowSavedAccounts(!showSavedAccounts);
                    setShowBankSelector(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      showSavedAccounts
                        ? styles.tabButtonTextActive
                        : styles.tabButtonTextInactive,
                    ]}
                  >
                    Saved Accounts ({savedBankAccounts.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* BANK SELECTOR */}
              {showBankSelector && (
                <View style={styles.bankSelectorContainer}>
                  <TextInput
                    style={styles.bankSearchInput}
                    placeholder="Search bank..."
                    placeholderTextColor={colors.textMuted}
                    value={bankSearchQuery}
                    onChangeText={setBankSearchQuery}
                  />
                  <ScrollView
                    style={{ maxHeight: 220 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {banks
                      .filter(
                        (bank) =>
                          bank.name
                            .toLowerCase()
                            .includes(bankSearchQuery.toLowerCase()) ||
                          bank.shortName
                            .toLowerCase()
                            .includes(bankSearchQuery.toLowerCase())
                      )
                      .map((bank) => (
                        <TouchableOpacity
                          key={bank.id}
                          style={[
                            styles.bankItemContainer,
                            selectedBank?.id === bank.id &&
                            styles.bankItemSelected,
                          ]}
                          onPress={() => handleSelectBank(bank)}
                        >
                          <Image
                            source={{ uri: bank.logo }}
                            style={{
                              width: 40,
                              height: 40,
                              marginRight: 12,
                              borderRadius: 6,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bankItemName}>
                              {bank.shortName}
                            </Text>
                            <Text
                              style={styles.bankItemFullName}
                              numberOfLines={1}
                            >
                              {bank.name}
                            </Text>
                          </View>
                          {selectedBank?.id === bank.id && (
                            <Icon
                              name="check-circle"
                              size={20}
                              color="#3B82F6"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}

              {/* SAVED ACCOUNTS SELECTOR */}
              {showSavedAccounts && (
                <View style={styles.bankSelectorContainer}>
                  {savedBankAccounts.length > 0 ? (
                    <ScrollView
                      style={{ maxHeight: 220 }}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {savedBankAccounts.map((account, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.bankItemContainer,
                            selectedSavedAccount === account &&
                            styles.bankItemSelected,
                          ]}
                          onPress={() => handleSelectSavedAccount(account)}
                        >
                          {account.logoUrl && (
                            <Image
                              source={{ uri: account.logoUrl }}
                              style={{
                                width: 40,
                                height: 40,
                                marginRight: 12,
                                borderRadius: 6,
                              }}
                            />
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={styles.bankItemName}>
                              {account.branch} - {account.bankName}
                            </Text>
                            <Text style={styles.bankItemFullName}>
                              {account.accountNumber}
                            </Text>
                            <Text style={styles.bankItemFullName}>
                              {account.accountHolderName}
                            </Text>
                          </View>
                          {selectedSavedAccount === account && (
                            <Icon
                              name="check-circle"
                              size={20}
                              color="#3B82F6"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={styles.savedAccountEmpty}>
                      No saved accounts yet
                    </Text>
                  )}
                </View>
              )}

              {/* 2-COLUMN BANK INPUTS */}
              <View style={styles.bankGrid}>
                <View style={styles.bankGridItem}>
                  <Text style={styles.bankInfoLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.bankInfoInputNew}
                    placeholder="Enter bank name"
                    placeholderTextColor={colors.textMuted}
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
                    placeholderTextColor={colors.textMuted}
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
                  placeholderTextColor={colors.textMuted}
                  value={bankInfo.accountName}
                  onChangeText={(text) =>
                    setBankInfo({ ...bankInfo, accountName: text })
                  }
                />
              </View>

              {/* Save Bank Account Checkbox */}
              <View style={styles.saveAccountOption}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => setSaveBankAccount(!saveBankAccount)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      saveBankAccount && styles.checkboxChecked,
                    ]}
                  >
                    {saveBankAccount && (
                      <Icon name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    Save this bank account for future use
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* FOOTER BUTTONS */}
            <View style={styles.modalFooterNew}>
              <Pressable
                style={[styles.buttonNew, styles.cancelButtonNew]}
                onPress={handleCloseWithdrawModal}
              >
                <Text
                  style={[
                    styles.buttonTextNew,
                    { color: colors.textSecondary },
                  ]}
                >
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
                <Icon name="close" size={24} color={colors.textPrimary} />
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
                    placeholderTextColor={colors.textMuted}
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
                  style={[styles.paymentMethod, styles.selectedPaymentMethod]}
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
                    style={[
                      styles.buttonTextNew,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.buttonNew, styles.confirmButtonNew]}
                  onPress={handleDeposit}
                >
                  <Text style={[styles.buttonTextNew, { color: "#FFFFFF" }]}>
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Beautiful Alert Modal */}
      <Modal
        visible={alertModal.visible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeAlert}
      >
        <View style={alertStyles.alertOverlay}>
          <View style={alertStyles.alertContainer}>
            {/* Icon Section */}
            <View
              style={[
                alertStyles.alertIconContainer,
                alertModal.type === "error" && { backgroundColor: "#FEE2E2" },
                alertModal.type === "success" && { backgroundColor: "#D1FAE5" },
                alertModal.type === "warning" && { backgroundColor: "#FEF3C7" },
              ]}
            >
              <Icon
                name={
                  alertModal.type === "error"
                    ? "error-outline"
                    : alertModal.type === "success"
                      ? "check-circle-outline"
                      : "warning"
                }
                size={56}
                color={
                  alertModal.type === "error"
                    ? "#EF4444"
                    : alertModal.type === "success"
                      ? "#10B981"
                      : "#F59E0B"
                }
              />
            </View>

            {/* Title */}
            <Text style={alertStyles.alertTitle}>{alertModal.title}</Text>

            {/* Message */}
            <Text style={alertStyles.alertMessage}>{alertModal.message}</Text>

            {/* OK Button */}
            <TouchableOpacity
              style={[
                alertStyles.alertButton,
                alertModal.type === "error" && { backgroundColor: "#EF4444" },
                alertModal.type === "success" && { backgroundColor: "#10B981" },
                alertModal.type === "warning" && { backgroundColor: "#F59E0B" },
              ]}
              onPress={closeAlert}
              activeOpacity={0.8}
            >
              <Text style={alertStyles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
