import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './CreditScreen.styles';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { creditService } from '../../service/creditService';


export default function CreditScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [creditData, setCreditData] = useState({ balance: 0, totalPurchased: 0, totalUsed: 0 });

    const [history, setHistory] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [customAmountModalVisible, setCustomAmountModalVisible] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [purchasing, setPurchasing] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [creditPackages, setCreditPackages] = useState([]);

    useEffect(() => {
        fetchCreditData();
        fetchHistory();
        getAllCreditPackages();
    }, []);

    const fetchCreditData = async () => {
        try {
            const data = await creditService.getCreditBalance();

            setCreditData(data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load credit information',
            });
        } finally {
            setLoading(false);
        }
    };

    const getAllCreditPackages = async () => {
        try {
            const packages = await creditService.getAllCreditPackages();
            setCreditPackages(packages);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load credit packages',
            });
        }
    };

    const fetchHistory = async () => {
        try {
            const historyData = await creditService.getCreditTransactionHistory();

            // Handle both array and paginated object response
            if (Array.isArray(historyData)) {
                setHistory(historyData);
            } else if (historyData && historyData.content && Array.isArray(historyData.content)) {
                setHistory(historyData.content);
            } else {
                setHistory([]);
            }
        } catch (error) {
            console.error('Fetch history error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load credit history',
            });
            setHistory([]); // Set empty array on error
        }
    };

    const handleTopUpPress = () => {
        setCustomAmount('');
        setCustomAmountModalVisible(true);
    };

    const purchaseCredit = async () => {
        const amount = parseInt(customAmount);

        if (!amount || amount <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Amount',
                text2: 'Please enter a valid credit amount',
            });
            return;
        }

        try {
            setPurchasing(true);
            await creditService.purchaseCredit(amount);

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Successfully purchased ${amount} credits!`,
            });

            setCustomAmountModalVisible(false);
            setCustomAmount('');
            fetchCreditData();
            fetchHistory();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Purchase Failed',
                text2: 'Please check your balance and try again.',
            });

        } finally {
            setPurchasing(false);
        }
    };

    const handlePurchasePackage = (pkg) => {
        setSelectedPackage(pkg);
        setPurchaseModalVisible(true);
    };

    const confirmPurchase = async () => {
        if (!selectedPackage) return;
        try {
            setPurchasing(true);
            // Use purchaseCredit with the package's credit amount
            const result = await creditService.purchaseCredit(selectedPackage.creditAmount);

            Toast.show({
                type: 'success',
                text1: 'Purchase Successful',
                text2: `${selectedPackage.creditAmount} credits added`,
            });

            setPurchaseModalVisible(false);
            fetchCreditData();
            fetchHistory();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Purchase Failed',
                text2: error.message || 'Failed to purchase package',
            });
        } finally {
            setPurchasing(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const renderPackageCard = (pkg) => (
        <Pressable
            key={pkg.id}
            style={styles.packageWrapper}
            onPress={() => handlePurchasePackage(pkg)}
        >
            <LinearGradient
                colors={pkg.isPopular ? ["#5eadf2ff", "#1d7accff"] : ["#ffffff", "#f8fafc"]}
                style={[styles.packageCard, pkg.isPopular && styles.packageCardPopular]}
            >
                {pkg.discountPercent > 0 && (
                    <View style={styles.discountTag}>
                        <Text style={styles.discountText}>-{pkg.discountPercent}%</Text>
                    </View>
                )}

                <Text style={[styles.packageName, pkg.isPopular && { color: "#fff" }]}>{pkg.name}</Text>

                <Text style={[styles.packageCredits, pkg.isPopular && { color: "#fff" }]}>
                    {pkg.creditAmount} Credits
                </Text>

                {pkg.savingsAmount > 0 && (
                    <Text style={[styles.packageBonus, pkg.isPopular && { color: "#e0f2fe" }]}>
                        Save {pkg.savingsAmount.toLocaleString()}đ
                    </Text>
                )}

                <Text style={[styles.packagePrice, pkg.isPopular && { color: "#fff" }]}>
                    {pkg.discountedPrice.toLocaleString()}đ
                </Text>

                <Pressable
                    style={[styles.buyButton, pkg.isPopular ? styles.buyButtonPopular : styles.buyButtonNormal]}
                    onPress={() => handlePurchasePackage(pkg)}
                >
                    <Text style={[styles.buyButtonText, pkg.isPopular ? { color: "#136bb8ff" } : { color: "#fff" }]}>
                        Buy Now
                    </Text>
                </Pressable>
            </LinearGradient>
        </Pressable>
    );

    const renderHistoryItem = (item) => {
        const color = item.type === 'USAGE' ? '#dc2626' : '#16a34a';

        return (
            <View key={item.id} style={styles.historyItem}>
                <View style={[styles.historyIcon, { borderColor: color }]}>
                    <Icon name={item.type === 'USAGE' ? 'south' : 'north'} size={18} color={color} />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.historyDescription}>{item.description}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <Text style={[styles.historyAmount, { color }]}>
                    {item.amount > 0 ? '+' : ''}{item.amount}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LottieView
                    source={require('../../assets/loading.json')}
                    autoPlay
                    loop
                    style={{ width: 160, height: 160 }}
                />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Icon style={styles.backIcon} name="arrow-back" size={24} color="#1e293b" />
                </Pressable>
                <Text style={styles.headerTitle}>Credit Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* BALANCE */}
                <LinearGradient
                    colors={["#136bb8ff", "#0251c7ff"]}
                    style={styles.balanceCard}
                >
                    <Text style={styles.balanceLabel}>Available Credits</Text>

                    <Text style={styles.balanceAmount}>
                        {(creditData?.currentBalance || 0).toLocaleString()}
                    </Text>

                    <View style={styles.usedContainer}>
                        <Text style={styles.usedLabel}>Total Used: </Text>
                        <Text style={styles.usedAmount}>
                            {(creditData?.totalUsed || 0).toLocaleString()}
                        </Text>
                    </View>

                    <Pressable style={styles.topUpButton} onPress={handleTopUpPress}>
                        <Text style={styles.topUpText}>Top Up</Text>
                    </Pressable>
                </LinearGradient>

                {/* PACKAGES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💎 Purchase Credits</Text>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.packagesScrollContent}
                    >
                        {creditPackages.map(renderPackageCard)}
                    </ScrollView>
                </View>

                {/* HISTORY */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <Pressable onPress={() => navigation.navigate('CreditTransactionHistory')}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </Pressable>
                    </View>

                    <View style={styles.historyList}>
                        {history.length > 0 ? (
                            history.slice(0, 5).map(renderHistoryItem)
                        ) : (
                            <Text style={styles.emptyState}>No transactions yet</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Custom Amount Modal */}
            <Modal
                visible={customAmountModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Top Up</Text>
                            <Pressable onPress={() => setCustomAmountModalVisible(false)}>
                                <Icon name="close" size={22} color="#64748b" />
                            </Pressable>
                        </View>

                        <View style={styles.modalBody}>
                            <Icon name="account-balance-wallet" size={48} color="#3b82f6" style={{ marginBottom: 16 }} />
                            <Text style={styles.modalSubtitle}>Input the amount of credits you want to top up</Text>

                            <TextInput
                                style={styles.amountInput}
                                value={customAmount}
                                onChangeText={setCustomAmount}
                                placeholder=""
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />

                            <Pressable
                                style={[styles.modalConfirm, purchasing && { opacity: 0.6 }]}
                                onPress={purchaseCredit}
                                disabled={purchasing}
                            >
                                {purchasing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Confirm top up</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* PURCHASE MODAL - Enhanced Details */}
            <Modal
                visible={purchaseModalVisible}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Package Details</Text>
                            <Pressable onPress={() => setPurchaseModalVisible(false)}>
                                <Icon name="close" size={22} color="#64748b" />
                            </Pressable>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.modalPackageName}>{selectedPackage?.name}</Text>
                            <Text style={styles.modalPackageDesc}>{selectedPackage?.description}</Text>

                            <View style={styles.modalDivider} />

                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Credits:</Text>
                                <Text style={styles.modalDetailValue}>{selectedPackage?.creditAmount}</Text>
                            </View>

                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Price:</Text>
                                <View style={styles.modalPriceContainer}>
                                    {selectedPackage?.originalPrice > selectedPackage?.discountedPrice && (
                                        <Text style={styles.modalOriginalPrice}>
                                            {selectedPackage?.originalPrice?.toLocaleString()}đ
                                        </Text>
                                    )}
                                    <Text style={styles.modalPrice}>
                                        {selectedPackage?.discountedPrice?.toLocaleString()}đ
                                    </Text>
                                </View>
                            </View>

                            {selectedPackage?.savingsAmount > 0 && (
                                <View style={styles.modalSavingsContainer}>
                                    <Text style={styles.modalSavingsText}>
                                        You save {selectedPackage?.savingsAmount?.toLocaleString()}đ
                                    </Text>
                                </View>
                            )}

                            <Pressable
                                style={styles.modalConfirm}
                                onPress={confirmPurchase}
                            >
                                {purchasing
                                    ? <ActivityIndicator color="white" />
                                    : <Text style={styles.modalConfirmText}>Confirm Purchase</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
