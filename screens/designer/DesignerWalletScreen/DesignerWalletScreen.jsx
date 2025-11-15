import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import { paymentService } from "../../../service/paymentService";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function DesignerWalletScreen() {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [],
    totalEarnings: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: ""
  });

  // Format helpers
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
        totalWithdrawn: 8500000 // Example value
      });
    } catch (error) {
      console.error("Error fetching wallet:", error.message);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể tải thông tin ví. Vui lòng thử lại sau.",
      });
    }
  };

  // Handle withdraw request
  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100000) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số tiền rút tối thiểu là 100,000 VND",
      });
      return;
    }

    if (amount > walletData.balance) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Số dư không đủ để thực hiện giao dịch",
      });
      return;
    }

    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập đầy đủ thông tin ngân hàng",
      });
      return;
    }

    try {
      // In a real app, you would call your API to process the withdrawal
      // await paymentService.withdraw(amount, bankInfo);
      
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Yêu cầu rút ${formatCurrency(amount)} đã được ghi nhận`,
      });
      
      // Refresh wallet data
      fetchWallet();
    } catch (error) {
      console.error("Withdrawal error:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Rút tiền thất bại. Vui lòng thử lại sau.",
      });
    }
  };

  useEffect(() => {
    fetchWallet();
    const unsubscribe = navigation.addListener("focus", fetchWallet);
    return unsubscribe;
  }, [navigation]);

  // Recent transactions (last 5)
  const recentTransactions = walletData.transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}> Designer Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>SAvailable Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(walletData.balance)}
              </Text>
            </View>
            <View style={styles.walletIconContainer}>
              <Icon name="account-balance-wallet" size={28} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(walletData.totalEarnings)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(walletData.pendingWithdrawals)}</Text>
              <Text style={styles.statLabel}>Pending Withdrawals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(walletData.totalWithdrawn)}</Text>
              <Text style={styles.statLabel}>Total Withdrawn</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
            <Icon name="arrow-forward" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => navigation.navigate("TransactionHistory")}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Icon name="history" size={24} color="#6366F1" />
            </View>
            <Text style={styles.actionText}>Transaction History</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => navigation.navigate("WithdrawalHistory")}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
              <Icon name="swap-horiz" size={24} color="#A855F7" />
            </View>
            <Text style={styles.actionText}>Withdrawal History</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => navigation.navigate("BankAccounts")}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
              <Icon name="account-balance" size={24} color="#EC4899" />
            </View>
            <Text style={styles.actionText}>Bank Accounts</Text>
          </Pressable>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {walletData.transactions.length > 5 && (
              <Pressable
                onPress={() => navigation.navigate("TransactionHistory")}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            )}
          </View>
          
          {recentTransactions.length > 0 ? (
            <View style={styles.transactionList}>
              {recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIconContainer}>
                    <Icon 
                      name={
                        transaction.type === 'DEPOSIT' ? 
                        'arrow-downward' : 
                        transaction.type === 'WITHDRAWAL' ? 
                        'arrow-upward' : 
                        'shopping-cart'
                      } 
                      size={20} 
                      color={
                        transaction.type === 'DEPOSIT' ? 
                        '#10B981' : 
                        transaction.type === 'WITHDRAWAL' ? 
                        '#EF4444' : 
                        '#3B82F6'
                      } 
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type === 'DEPOSIT' ? 'Deposit' : 
                       transaction.type === 'WITHDRAWAL' ? 'Withdrawal' : 
                       'Purchase'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.amount > 0 ? '#10B981' : '#1F2937',
                        fontWeight: '600',
                      }
                    ]}
                  >
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="receipt" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No recent transactions</Text>
              <Text style={styles.emptyStateSubtext}>
                Recent transactions will appear here
              </Text>
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
                <Icon name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Withdrawal Amount (VND)</Text>
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
              
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                Quick Amounts
              </Text>
              <View style={styles.quickAmounts}>
                {quickAmounts.map((amount) => (
                  <Pressable
                    key={amount}
                    style={({ pressed }) => [
                      styles.quickAmountButton,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => setWithdrawAmount(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>
                      {amount.toLocaleString()}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              <Text style={[styles.inputLabel, { marginTop: 24 }]}>
                Bank Information
              </Text>
              <View style={styles.bankInfoContainer}>
                <View style={styles.bankInfoItem}>
                  <Text style={styles.bankInfoLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.bankInfoInput}
                    placeholder="Enter bank name"
                    value={bankInfo.bankName}
                    onChangeText={(text) => setBankInfo({...bankInfo, bankName: text})}
                  />
                </View>
                <View style={styles.bankInfoItem}>
                  <Text style={styles.bankInfoLabel}>Account Number</Text>
                  <TextInput
                    style={styles.bankInfoInput}
                    placeholder="Enter account number"
                    keyboardType="numeric"
                    value={bankInfo.accountNumber}
                    onChangeText={(text) => setBankInfo({...bankInfo, accountNumber: text})}
                  />
                </View>
                <View style={styles.bankInfoItem}>
                  <Text style={styles.bankInfoLabel}>Account Name</Text>
                  <TextInput
                    style={styles.bankInfoInput}
                    placeholder="Enter account name"  
                    value={bankInfo.accountName}
                    onChangeText={(text) => setBankInfo({...bankInfo, accountName: text})}
                  />
                </View>
              </View>
              
              <View style={styles.noteContainer}>
                <Icon name="info" size={16} color="#64748B" />
                <Text style={styles.noteText}>
                  Processing Time: 1-3 business days. Withdrawal Fee: 1.1% (minimum 5,000 VND).
                </Text>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={[styles.buttonText, { color: '#64748B' }]}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton]}
                onPress={handleWithdraw}
                disabled={!withdrawAmount || !bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName}
              >
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  balanceCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  withdrawButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionList: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
    padding: 0,
    height: '100%',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 8,
  },
  quickAmountButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickAmountText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  bankInfoContainer: {
    marginTop: 8,
  },
  bankInfoItem: {
    marginBottom: 16,
  },
  bankInfoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '500',
  },
  bankInfoInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 12,
  },
  confirmButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
