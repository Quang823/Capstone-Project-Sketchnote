import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Modal,
    TextInput,
    Image,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { styles } from './CreditScreen.styles';
import Toast from 'react-native-toast-message';
import LottieView from 'lottie-react-native';
import { creditService } from '../../service/creditService';
import SidebarToggleButton from "../../components/navigation/SidebarToggleButton";

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
            setHistory([]);
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
            await creditService.purchaseCreditPackage(selectedPackage.id);
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
            <View style={[
                styles.packageCard,
                pkg.isPopular && styles.packageCardPopular
            ]}>
                {/* Popular Badge */}
                {pkg.isPopular && (
                    <View style={styles.popularBadge}>
                        <Icon name="star" size={14} color="#ffffff" />
                        <Text style={styles.popularText}>POPULAR</Text>
                    </View>
                )}

                {/* Discount Tag */}
                {pkg.discountPercent > 0 && (
                    <View style={styles.discountTag}>
                        <Text style={styles.discountText}>-{pkg.discountPercent}%</Text>
                    </View>
                )}

                {/* Icon */}
                <View style={styles.packageIconContainer}>
                    <Icon
                        name="stars"
                        size={36}
                        color={pkg.isPopular ? "#084F8C" : "#64748b"}
                    />
                </View>

                {/* Package Name */}
                <Text style={styles.packageName}>{pkg.name}</Text>

                {/* Credits */}
                <View style={styles.creditsContainer}>
                    <Text style={styles.packageCredits}>
                        {pkg.creditAmount.toLocaleString()}
                    </Text>
                    <Text style={styles.creditsLabel}>Credits</Text>
                </View>

                {/* Savings */}
                {pkg.savingsAmount > 0 && (
                    <View style={styles.savingsTag}>
                        <Icon name="savings" size={14} color="#059669" />
                        <Text style={styles.savingsText}>
                            Save {pkg.savingsAmount.toLocaleString()}đ
                        </Text>
                    </View>
                )}

                {/* Divider */}
                <View style={styles.packageDivider} />

                {/* Price */}
                <View style={styles.priceContainer}>
                    {pkg.originalPrice > pkg.discountedPrice && (
                        <Text style={styles.originalPrice}>
                            {pkg.originalPrice.toLocaleString()}đ
                        </Text>
                    )}
                    <Text style={styles.packagePrice}>
                        {pkg.discountedPrice.toLocaleString()}đ
                    </Text>
                </View>

                {/* Buy Button */}
                <Pressable
                    style={[
                        styles.buyButton,
                        pkg.isPopular && styles.buyButtonPopular
                    ]}
                    onPress={() => handlePurchasePackage(pkg)}
                >
                    <Text style={styles.buyButtonText}>Select Plan</Text>
                    <Icon name="arrow-forward" size={18} color="#ffffff" />
                </Pressable>
            </View>
        </Pressable>
    );

    const renderHistoryItem = (item) => {
        const isUsage = item.type === 'USAGE';
        const color = isUsage ? '#ef4444' : '#10b981';
        const bgColor = isUsage ? '#fef2f2' : '#f0fdf4';
        const iconName = isUsage ? 'trending-down' : 'trending-up';

        return (
            <View key={item.id} style={styles.historyItem}>
                <View style={[styles.historyIconWrapper, { backgroundColor: bgColor }]}>
                    <Icon name={iconName} size={20} color={color} />
                </View>

                <View style={styles.historyContent}>
                    <Text style={styles.historyDescription}>{item.description}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={styles.historyAmountContainer}>
                    <Text style={[styles.historyAmount, { color }]}>
                        {item.amount > 0 ? '+' : ''}{item.amount}
                    </Text>
                    <Text style={styles.historyAmountLabel}>credits</Text>
                </View>
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
                <Text style={styles.loadingText}>Loading your credits...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
                    <Text style={styles.headerTitle}>AI Credits</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* NEW: HALF-SCREEN BALANCE + HISTORY IMAGE */}
                <View style={styles.splitContainer}>
                    {/* LEFT: Balance Card (50%) */}
                    <View style={styles.balanceHalfCard}>
                        <LinearGradient
                            colors={["#0A4D91", "#114d92ff", "#2c3f82ff"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.balanceGradientHalf}
                        >
                            {/* 🔥 Background Image blur/opacity */}
                            <Image
                                source={{
                                    uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765119321/r3z1ybpflup0ie4beajq.jpg",
                                }}
                                style={styles.balanceBackgroundImage}
                                resizeMode="cover"
                            />

                            {/* Background glow blob */}
                            <View style={styles.balanceGlowBlob} />

                            {/* Decorative animation */}
                            <LottieView
                                source={require('../../assets/sparkle.json')}
                                autoPlay
                                loop
                                style={styles.balanceLottie}
                            />

                            {/* Top info */}
                            <View style={styles.balanceTopHalf}>
                                <View>
                                    <Text style={styles.balanceLabelHalf}>Available Balance</Text>

                                    <Text style={styles.balanceAmountHalf}>
                                        {(creditData?.currentBalance || 0).toLocaleString()}
                                    </Text>

                                    <Text style={styles.balanceSubBright}>AI Credits</Text>
                                </View>

                                <Icon name="stars" size={42} color="rgba(255,255,255,0.45)" />
                            </View>

                            {/* Stats */}
                            <View style={styles.statsRowHalf}>
                                <View style={styles.statItemHalf}>
                                    <Icon name="shopping-bag" size={16} color="#fff" />
                                    <Text style={styles.statValueHalf}>
                                        {(creditData?.totalPurchased || 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.statLabelHalf}>Purchased</Text>
                                </View>

                                <View style={styles.statDividerHalf} />

                                <View style={styles.statItemHalf}>
                                    <Icon name="flash-on" size={16} color="#fff" />
                                    <Text style={styles.statValueHalf}>
                                        {(creditData?.totalUsed || 0).toLocaleString()}
                                    </Text>
                                    <Text style={styles.statLabelHalf}>Used</Text>
                                </View>
                            </View>

                            {/* Button */}
                            <Pressable style={styles.quickBuyButtonHalf} onPress={handleTopUpPress}>
                                <Icon name="add-circle" size={18} color="#084F8C" />
                                <Text style={styles.quickBuyTextHalf}>Quick Top Up</Text>
                            </Pressable>
                        </LinearGradient>
                    </View>


                    <Pressable
                        style={[styles.historyImageCard, { overflow: 'hidden' }]}
                        onPress={() => navigation.navigate('CreditTransactionHistory')}
                    >
                        {/* Background image with opacity */}
                        <Image
                            source={{
                                uri: "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765119321/r3z1ybpflup0ie4beajq.jpg",
                            }}
                            style={styles.historyBackgroundOverlayImage}
                            resizeMode="cover"
                        />

                        {/* Main background image */}
                        <Image
                            source={{ uri: 'https://res.cloudinary.com/dk3yac2ie/image/upload/v1765131185/imcoeg6z8xayk0tlbth0.jpg' }}
                            style={styles.historyImageBackground}
                            resizeMode="cover"
                        />

                        {/* Top gradient */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'transparent']}
                            style={[StyleSheet.absoluteFillObject, { zIndex: 2 }]}
                        />

                        {/* Bottom gradient */}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={[StyleSheet.absoluteFillObject, { zIndex: 2 }]}
                        />

                        {/* Content */}
                        <View style={styles.historyImageOverlay}>
                            <View>
                                <Text style={styles.historyLabel}>YOUR</Text>
                                <Text style={styles.historyImageText}>History</Text>
                            </View>
                            <View style={styles.historyArrow}>
                                <Icon name="arrow-forward-ios" size={24} color="#fff" />
                            </View>
                        </View>
                    </Pressable>


                </View>

                {/* PACKAGES SECTION – giữ nguyên */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
                            <Text style={styles.sectionSubtitle}>Select the perfect credit package for you</Text>
                        </View>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.packagesScroll}
                    >
                        {creditPackages.map(renderPackageCard)}
                    </ScrollView>
                </View>

                {/* HISTORY SECTION – vẫn giữ để hiển thị 5 giao dịch gần nhất */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Recent Activity</Text>
                            <Text style={styles.sectionSubtitle}>Your latest transactions</Text>
                        </View>
                        <Pressable
                            style={styles.viewAllButton}
                            onPress={() =>
                                navigation.navigate("CreditTransactionHistory")
                            }
                        >
                            <Text style={styles.viewAllText}>View All</Text>
                            <Icon name="arrow-forward" size={16} color="#3B82F6" />
                        </Pressable>
                    </View>

                    <View style={styles.historyContainer}>
                        {history.length > 0 ? (
                            history.slice(0, 5).map(renderHistoryItem)
                        ) : (
                            <View style={styles.emptyState}>
                                <Icon name="receipt-long" size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>No transactions yet</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* CUSTOM AMOUNT MODAL */}
            <Modal
                visible={customAmountModalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="account-balance-wallet" size={32} color="#084F8C" />
                            </View>
                            <Pressable
                                style={styles.modalClose}
                                onPress={() => setCustomAmountModalVisible(false)}
                            >
                                <Icon name="close" size={24} color="#64748b" />
                            </Pressable>
                        </View>

                        <Text style={styles.modalTitle}>Quick Top Up</Text>
                        <Text style={styles.modalSubtitle}>
                            Enter the amount of credits you'd like to purchase
                        </Text>

                        {/* Amount Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.amountInput}
                                value={customAmount}
                                onChangeText={setCustomAmount}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor="#cbd5e1"
                            />
                            <Text style={styles.inputSuffix}>credits</Text>
                        </View>

                        {/* Quick Amount Buttons */}
                        <View style={styles.quickAmounts}>
                            {[100, 500, 1000, 5000].map((amount) => (
                                <Pressable
                                    key={amount}
                                    style={styles.quickAmountBtn}
                                    onPress={() => setCustomAmount(amount.toString())}
                                >
                                    <Text style={styles.quickAmountText}>+{amount}</Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Confirm Button */}
                        <Pressable
                            style={[styles.modalConfirmBtn, purchasing && { opacity: 0.6 }]}
                            onPress={purchaseCredit}
                            disabled={purchasing}
                        >
                            {purchasing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.modalConfirmText}>Confirm Purchase</Text>
                                    <Icon name="arrow-forward" size={20} color="#ffffff" />
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* PACKAGE DETAILS MODAL */}
            <Modal
                visible={purchaseModalVisible}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalIconContainer}>
                                <Icon name="card-giftcard" size={32} color="#084F8C" />
                            </View>
                            <Pressable
                                style={styles.modalClose}
                                onPress={() => setPurchaseModalVisible(false)}
                            >
                                <Icon name="close" size={24} color="#64748b" />
                            </Pressable>
                        </View>

                        <Text style={styles.modalTitle}>{selectedPackage?.name}</Text>
                        <Text style={styles.modalSubtitle}>{selectedPackage?.description}</Text>

                        {/* Package Details */}
                        <View style={styles.packageDetails}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <Icon name="stars" size={20} color="#084F8C" />
                                    <Text style={styles.detailLabel}>Credits</Text>
                                </View>
                                <Text style={styles.detailValue}>
                                    {selectedPackage?.creditAmount?.toLocaleString()}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <Icon name="payments" size={20} color="#084F8C" />
                                    <Text style={styles.detailLabel}>Price</Text>
                                </View>
                                <View style={styles.detailRight}>
                                    {selectedPackage?.originalPrice > selectedPackage?.discountedPrice && (
                                        <Text style={styles.detailOriginalPrice}>
                                            {selectedPackage?.originalPrice?.toLocaleString()}đ
                                        </Text>
                                    )}
                                    <Text style={styles.detailPrice}>
                                        {selectedPackage?.discountedPrice?.toLocaleString()}đ
                                    </Text>
                                </View>
                            </View>

                            {selectedPackage?.savingsAmount > 0 && (
                                <View style={styles.savingsBanner}>
                                    <Icon name="local-offer" size={16} color="#059669" />
                                    <Text style={styles.savingsBannerText}>
                                        You save {selectedPackage?.savingsAmount?.toLocaleString()}đ with this package!
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Confirm Button */}
                        <Pressable
                            style={[styles.modalConfirmBtn, purchasing && { opacity: 0.6 }]}
                            onPress={confirmPurchase}
                            disabled={purchasing}
                        >
                            {purchasing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.modalConfirmText}>Confirm Purchase</Text>
                                    <Icon name="check-circle" size={20} color="#ffffff" />
                                </>
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}