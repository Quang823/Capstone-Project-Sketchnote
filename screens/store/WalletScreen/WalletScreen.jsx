import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { walletStyles } from './WalletScreen.styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { paymentService } from '../../../service/paymentService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const paymentMethods = [
  { id: 'vnpay', name: 'VNPay', icon: '💳', fee: 0 },
  { id: 'momo', name: 'MoMo', icon: '📱', fee: 0 },
  { id: 'zalopay', name: 'ZaloPay', icon: '💙', fee: 0 },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦', fee: 0 },
];

const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function WalletScreen() {
  const navigation = useNavigation();
  const [walletData, setWalletData] = useState({ balance: 0, transactions: [] });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('vnpay');

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 VND';
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 10000) {
      Alert.alert('Error', 'Minimum deposit amount is 10,000 VND');
      return;
    }

    Alert.alert(
      'Confirm Deposit',
      `You are about to deposit ${formatCurrency(amount)} via ${
        paymentMethods.find((p) => p.id === selectedPaymentMethod)?.name
      }.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const newTransaction = {
              id: Date.now().toString(),
              type: 'deposit',
              amount: amount,
              description: `Deposit via ${
                paymentMethods.find((p) => p.id === selectedPaymentMethod)?.name
              }`,
              date: new Date().toISOString().split('T')[0],
              status: 'completed',
            };

            setWalletData((prev) => ({
              ...prev,
              balance: prev.balance + amount,
              transactions: [newTransaction, ...prev.transactions],
            }));

            setShowDepositModal(false);
            setDepositAmount('');
            Alert.alert('Success', 'Deposit successful!');
          },
        },
      ]
    );
  };

  const handleQuickAmount = (amount) => {
    setDepositAmount(amount.toString());
  };

  const renderTransaction = (transaction) => (
    <View key={transaction.id} style={walletStyles.transactionItem}>
      <View style={walletStyles.transactionIcon}>
        <Icon
          name={transaction.type === 'deposit' ? 'account-balance-wallet' : 'shopping-cart'}
          size={24}
          color={transaction.type === 'deposit' ? '#10B981' : '#EF4444'}
        />
      </View>

      <View style={walletStyles.transactionInfo}>
        <Text style={walletStyles.transactionDescription}>
          {transaction.description}
        </Text>
        <Text style={walletStyles.transactionDate}>
          {formatDate(transaction.date)}
        </Text>
      </View>
      <Text
        style={[
          walletStyles.transactionAmount,
          transaction.type === 'deposit'
            ? walletStyles.depositAmount
            : walletStyles.purchaseAmount,
        ]}
      >
        {transaction.type === 'deposit' ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount))}
      </Text>
    </View>
  );

  const getTransactionStats = () => {
    const totalDeposit = walletData.transactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = walletData.transactions
      .filter((t) => t.type === 'purchase')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { totalDeposit, totalSpent };
  };

  const stats = getTransactionStats();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await paymentService.getWallet();
        console.log('📦 API wallet data:', data);
        setWalletData(data);
      } catch (error) {
        console.error('Error fetching wallet:', error.message);
        Alert.alert('Error', 'Failed to fetch wallet information.');
      }
    };

    fetchWallet();
  }, []);

  return (
    <View style={walletStyles.container}>
      <View style={walletStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={walletStyles.headerTitle}>E-Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={walletStyles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
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

          {/* Stats Row */}
          <View style={walletStyles.statsRow}>
            <View style={walletStyles.statItem}>
              <Text style={walletStyles.statLabel}>Total Deposits</Text>
              <Text style={walletStyles.statValue}>
                {formatCurrency(stats.totalDeposit)}
              </Text>
            </View>
            <View style={walletStyles.statDivider} />
            <View style={walletStyles.statItem}>
              <Text style={walletStyles.statLabel}>Total Spent</Text>
              <Text style={walletStyles.statValue}>
                {formatCurrency(stats.totalSpent)}
              </Text>
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

        {/* Transaction History */}
        <View style={walletStyles.historySection}>
          <View style={walletStyles.historySectionHeader}>
            <Text style={walletStyles.sectionTitle}>Transaction History</Text>
            <Text style={walletStyles.transactionCount}>
              {walletData.transactions?.length || 0} transactions
            </Text>
          </View>

          {walletData.transactions?.length > 0 ? (
            walletData.transactions.map(renderTransaction)
          ) : (
            <View style={walletStyles.emptyState}>
              <Text style={walletStyles.emptyStateIcon}>📭</Text>
              <Text style={walletStyles.emptyStateText}>
                No transactions yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={walletStyles.modalOverlay}>
          <View style={[walletStyles.modalContent, { maxHeight: '85%' }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={walletStyles.modalHeader}>
                <Text style={walletStyles.modalTitle}>Deposit Funds</Text>
                <Pressable onPress={() => setShowDepositModal(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

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
                  {quickAmounts.map((amount) => (
                    <Pressable
                      key={amount}
                      style={[
                        walletStyles.quickAmountButton,
                        depositAmount === amount.toString() &&
                          walletStyles.quickAmountButtonActive,
                      ]}
                      onPress={() => handleQuickAmount(amount)}
                    >
                      <Text
                        style={[
                          walletStyles.quickAmountText,
                          depositAmount === amount.toString() &&
                            walletStyles.quickAmountTextActive,
                        ]}
                      >
                        {formatCurrency(amount)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={walletStyles.paymentSection}>
                <Text style={walletStyles.paymentLabel}>Payment Method</Text>
                {paymentMethods.map((method) => (
                  <Pressable
                    key={method.id}
                    style={[
                      walletStyles.paymentMethod,
                      selectedPaymentMethod === method.id &&
                        walletStyles.selectedPaymentMethod,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <View style={walletStyles.paymentMethodLeft}>
                      <Text style={walletStyles.paymentIcon}>{method.icon}</Text>
                      <View>
                        <Text style={walletStyles.paymentName}>{method.name}</Text>
                        <Text style={walletStyles.paymentFee}>
                          {method.fee === 0 ? 'Free' : `Fee: ${method.fee}%`}
                        </Text>
                      </View>
                    </View>
                    {selectedPaymentMethod === method.id && (
                      <Icon name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </Pressable>
                ))}
              </View>

              <View style={walletStyles.modalActions}>
                <Pressable
                  style={walletStyles.cancelButton}
                  onPress={() => setShowDepositModal(false)}
                >
                  <Text style={walletStyles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={walletStyles.confirmButton}
                  onPress={handleDeposit}
                >
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
