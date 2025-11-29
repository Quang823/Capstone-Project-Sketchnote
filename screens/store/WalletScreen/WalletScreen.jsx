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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { walletStyles } from "./WalletScreen.styles";
import { paymentService } from "../../../service/paymentService";
import Toast from "react-native-toast-message";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LottieView from "lottie-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function WalletScreen() {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
  });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  // 📦 Format helpers
  const formatCurrency = (amount) =>
    (amount ?? 0).toLocaleString("vi-VN") + " đ";

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
      //console.log(url)
      setShowDepositModal(false);
      navigation.navigate("PaymentWebView", { paymentUrl: url.message });
    } catch (error) {
      console.error("Payment error:", error);
      Toast.show({
        text1: "Failed",
        text2: "Deposit failed. Please try again.",
        type: "error",
      });
    }
  };

  const fetchWallet = async () => {
    try {
      const data = await paymentService.getWallet();
      setWalletData(data.result);
    } catch (error) {
      console.error("Error fetching wallet:", error.message);
      Toast.show({
        text1: "Error",
        text2: "Failed to load wallet information. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchWallet();
    const unsubscribe = navigation.addListener("focus", fetchWallet);
    return unsubscribe;
  }, [navigation]);

  const totalDeposit = walletData.transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "SUCCESS")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = walletData.transactions
    .filter((t) => t.type === "PURCHASE")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const recentTransactions = [...walletData.transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get transaction icon and color
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
    <View style={walletStyles.container}>
      {/* Header */}
      <View style={walletStyles.header}>
        <View style={walletStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#084F8C" />
          <Text style={walletStyles.headerTitle}>Customer Wallet</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={walletStyles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 💰 Balance Card */}
        <View style={walletStyles.walletOverview}>
          {/* Left Column - Balance Info */}
          <View style={walletStyles.balanceInfoCard}>
            <View style={walletStyles.balanceHeaderRow}>
              <View>
                <Text style={walletStyles.balanceLabel}>Available Balance</Text>
                <Text style={walletStyles.balanceAmount}>
                  {formatCurrency(walletData.balance)}
                </Text>
              </View>
              <View style={walletStyles.walletIconLarge}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={42}
                  color="#084F8C"
                />
                <Text style={walletStyles.walletLabel}>Wallet</Text>
              </View>
            </View>

            <View style={walletStyles.miniStats}>
              <View style={walletStyles.miniStat}>
                <Text style={walletStyles.miniStatLabel}>Deposited</Text>
                <Text style={walletStyles.miniStatValue}>
                  {formatCurrency(totalDeposit)}
                </Text>
              </View>

              <View style={walletStyles.miniStatDivider} />

              <View style={walletStyles.miniStat}>
                <Text style={walletStyles.miniStatLabel}>Spent</Text>
                <Text style={walletStyles.miniStatValueNegative}>
                  {formatCurrency(totalSpent)}
                </Text>
              </View>
            </View>

            <Pressable
              style={walletStyles.depositButtonNew}
              onPress={() => setShowDepositModal(true)}
            >
              <Icon name="add-circle" size={18} color="#FFF" />
              <Text style={walletStyles.depositButtonTextNew}>
                Deposit Funds
              </Text>
            </Pressable>
          </View>

          {/* Right Column - Decorative Image */}
          <View style={walletStyles.imageCard}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1763869859/lmxle0retihhni0cujue.jpg",
              }}
              style={walletStyles.decorativeImage}
              resizeMode="cover"
            />
            <View style={walletStyles.imageOverlay}>
              <Text style={walletStyles.imageText}>Secure & Fast</Text>
              <Text style={walletStyles.imageSubtext}>
                Your money, always ready
              </Text>
            </View>
          </View>
        </View>

        {/* 🧾 Transaction History */}
        <View style={walletStyles.historySection}>
          <View style={walletStyles.historySectionHeader}>
            <View>
              <Text style={walletStyles.sectionTitle}>Recent Transactions</Text>
              <Text style={walletStyles.transactionCount}>
                {recentTransactions.length} of {walletData.transactions.length}
              </Text>
            </View>
            {walletData.transactions.length > 0 && (
              <Pressable
                style={walletStyles.viewAllButton}
                onPress={() =>
                  navigation.navigate("TransactionHistory", {
                    transactions: walletData.transactions,
                  })
                }
              >
                <Text style={walletStyles.viewAllText}>View All</Text>
                <Icon name="arrow-forward" size={16} color="#3B82F6" />
              </Pressable>
            )}
          </View>
          {recentTransactions.length > 0 ? (
            <>
              {recentTransactions.map((transaction) => {
                const style = getTransactionStyle(transaction);
                return (
                  <View
                    key={
                      transaction.transactionId ??
                      transaction.id ??
                      `${transaction.type}-${transaction.createdAt}`
                    }
                    style={walletStyles.transactionItem}
                  >
                    <View
                      style={[
                        walletStyles.transactionIcon,
                        { backgroundColor: `${style.color}15` },
                      ]}
                    >
                      <Icon name={style.icon} size={24} color={style.color} />
                    </View>

                    <View style={walletStyles.transactionInfo}>
                      <Text style={walletStyles.transactionLabel}>
                        {style.label}
                      </Text>
                      <Text style={walletStyles.transactionDate}>
                        {formatDate(transaction.createdAt)}
                      </Text>
                      {transaction.orderCode && (
                        <Text style={walletStyles.transactionCode}>
                          Order: {transaction.orderCode}
                        </Text>
                      )}
                    </View>

                    <View style={walletStyles.transactionRight}>
                      <Text
                        style={[
                          walletStyles.transactionAmount,
                          { color: style.color },
                        ]}
                      >
                        {style.sign}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <Text style={walletStyles.balanceAfter}>
                        Balance: {formatCurrency(transaction.balance)}
                      </Text>
                      {transaction.status && (
                        <View
                          style={[
                            walletStyles.statusBadge,
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
                              walletStyles.statusText,
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
            </>
          ) : (
            <View style={walletStyles.emptyState}>
              <LottieView
                source={require("../../../assets/transaction.json")}
                autoPlay
                loop
                style={{ width: 180, height: 180 }}
              />
              <Text style={walletStyles.emptyStateText}>
                No transactions yet
              </Text>
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
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={walletStyles.modalBody}
            >
              <View style={walletStyles.modalHeader}>
                <Text style={walletStyles.modalTitle}>Deposit Funds</Text>
                <Pressable onPress={() => setShowDepositModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              {/* Amount Input */}
              <View style={walletStyles.amountSection}>
                <Text style={walletStyles.amountLabel}>Deposit Amount</Text>
                <View style={walletStyles.amountInputContainer}>
                  <Text style={walletStyles.currencySymbol}>₫</Text>
                  <TextInput
                    style={walletStyles.amountInput}
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>

                <View style={walletStyles.quickAmounts}>
                  {quickAmounts.map((amt) => (
                    <Pressable
                      key={amt}
                      style={[
                        walletStyles.quickAmountButton,
                        depositAmount === amt.toString() &&
                        walletStyles.quickAmountButtonActive,
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
              <View style={walletStyles.modalFooterNew}>
                <Pressable
                  style={[walletStyles.buttonNew, walletStyles.cancelButtonNew]}
                  onPress={() => setShowDepositModal(false)}
                >
                  <Text
                    style={[walletStyles.buttonTextNew, { color: "#64748B" }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    walletStyles.buttonNew,
                    walletStyles.confirmButtonNew,
                  ]}
                  onPress={handleDeposit}
                >
                  <Text
                    style={[walletStyles.buttonTextNew, { color: "#FFFFFF" }]}
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
