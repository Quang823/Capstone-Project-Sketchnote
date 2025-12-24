import React, { useEffect, useState, useRef, useContext, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { subscriptionService } from "../../../service/subscriptionService";
import { AuthContext } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./DesignerSubscription.styles";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function SubscriptionPlansScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingPlanId, setBuyingPlanId] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [upgradeCheckData, setUpgradeCheckData] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });
  const [isInsufficientFunds, setIsInsufficientFunds] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const errorScaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await subscriptionService.getSubscriptionPlans();
        const data = Array.isArray(res?.result) ? res.result : [];
        setPlans(data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    if (showConfirmModal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }).start();
    }
  }, [showConfirmModal]);

  useEffect(() => {
    if (showErrorModal) {
      Animated.spring(errorScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }).start();
    } else {
      errorScaleAnim.setValue(0.85);
    }
  }, [showErrorModal]);

  const loadUserSubscriptions = async () => {
    try {
      const res = await subscriptionService.getUserSubscriptions();
      const list = Array.isArray(res?.result) ? res.result : [];
      const activeItem = list.find(
        (s) =>
          s?.isCurrentlyActive ||
          String(s?.status || "").toUpperCase() === "ACTIVE"
      );
      const pid = activeItem?.plan?.planId ?? null;
      setActivePlanId(pid);
      setHasActiveSubscription(!!pid);
    } catch (err) {
      setActivePlanId(null);
      setHasActiveSubscription(false);
    }
  };

  useEffect(() => {
    loadUserSubscriptions();
  }, []);

  const popularPlanId = plans.find(
    (p) => p.isPopular || p.planName.toLowerCase().includes("pro")
  )?.planId;

  const confirmBuy = async (plan) => {
    if (!plan?.planId) return;
    if (buyingPlanId) return;
    setBuyingPlanId(plan.planId);
    try {
      const res = await subscriptionService.createUserSubscription({
        planId: plan.planId,
        autoRenew: true,
        confirmUpgrade: true,
      });

      Toast.show({
        type: "success",
        text1: "Subscription Successful 🎉",
        text2: "You have been upgraded to Designer. Please log in again.",
        position: "top",
        visibilityTime: 2500,
        onHide: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      });
    } catch (e) {
      const msg = e.message || "";
      setErrorMessage({ title: "Purchase failed", message: msg });
      if (
        msg.toLowerCase().includes("insufficient wallet balance") ||
        msg.toLowerCase().includes("số dư ví không đủ")
      ) {
        setIsInsufficientFunds(true);
      } else {
        setIsInsufficientFunds(false);
      }
      setShowErrorModal(true);
    } finally {
      setBuyingPlanId(null);
    }
  };

  const handleChoosePlan = async (plan) => {
    if (!plan?.planId) return;
    if (buyingPlanId) return;

    try {
      // Call check upgrade API
      const checkResult = await subscriptionService.checkUpgrade(plan.planId);

      if (checkResult?.result) {
        setUpgradeCheckData(checkResult.result);
        setSelectedPlan(plan);
        setShowConfirmModal(true);
      } else {
        setErrorMessage({
          title: "Cannot proceed",
          message: "Unable to check upgrade eligibility"
        });
        setShowErrorModal(true);
      }
    } catch (e) {
      setErrorMessage({
        title: "Check failed",
        message: e.message
      });
      setShowErrorModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor={styles.iconColor} />
          <Text style={styles.headerTitle}>Subscription Plans</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Unlock Your {"\n"} Full Creative Power
          </Text>
          <Text style={styles.heroSubtitle}>
            Choose the perfect plan to create, sell & grow your sketchnote
            business
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresGrid}>
          {[
            { icon: "auto-awesome", text: "AI Smart Charts" },
            { icon: "4k", text: "8K Export Quality" },
            { icon: "cloud-upload", text: "500GB Cloud" },
            { icon: "groups", text: "Team Collaboration" },
            { icon: "support-agent", text: "24/7 Support" },
            { icon: "library-books", text: "10,000+ Templates" },
          ].map((f, i) => (
            <View key={i} style={styles.featureBox}>
              <LinearGradient
                colors={[styles.featureIconGradientStart, styles.featureIconGradientEnd]}
                style={styles.featureIcon}
              >
                <Icon name={f.icon} size={32} color="#136bb8ff" />
              </LinearGradient>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.plansMainTitle}>Choose Your Perfect Plan</Text>
          <Text style={styles.plansSubTitle}>
            Start free. Scale when you're ready.
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#136bb8ff"
              style={{ marginTop: 40 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              snapToInterval={300} // Vuốt mượt từng card
              decelerationRate="fast"
            >
              <View style={styles.plansGridCompact}>
                {plans.map((plan) => {
                  const isPopular = plan.planId === popularPlanId;
                  const isActivePlan =
                    hasActiveSubscription && plan.planId === activePlanId;

                  let gradientColors = [styles.planCardGradientStart, styles.planCardGradientEnd];
                  if (isActivePlan) {
                    gradientColors = [styles.planCardActiveGradientStart, styles.planCardActiveGradientEnd];
                  } else if (isPopular) {
                    gradientColors = [styles.planCardPopularGradientStart, styles.planCardPopularGradientEnd];
                  }

                  return (
                    <TouchableOpacity
                      key={plan.planId}
                      activeOpacity={0.92}
                      style={styles.planWrapperCompact}
                    >
                      <LinearGradient
                        colors={gradientColors}
                        style={[
                          styles.planCardCompact,
                          isActivePlan
                            ? styles.planCardActiveCompact
                            : isPopular
                              ? styles.planCardPopularCompact
                              : styles.planCardInactiveCompact,
                        ]}
                      >
                        {/* Badge Popular */}
                        {isPopular && (
                          <View style={styles.popularBadgeCompact}>
                            <Text style={styles.popularTextCompact}>
                              MOST POPULAR
                            </Text>
                          </View>
                        )}

                        {isActivePlan && (
                          <View style={styles.activeBadgeCompact}>
                            <Text style={styles.activeTextCompact}>
                              ACTIVE PLAN
                            </Text>
                          </View>
                        )}

                        <Text
                          style={[
                            styles.planNameCompact,
                            (isActivePlan || isPopular) && { color: "#FFF" },
                          ]}
                        >
                          {plan.planName}
                        </Text>

                        <Text
                          style={[
                            styles.planDescCompact,
                            (isActivePlan || isPopular) && { color: "#E0F2FE" },
                          ]}
                        >
                          {plan.description}
                        </Text>

                        <View style={styles.priceBoxCompact}>
                          <Text
                            style={[
                              styles.priceCompact,
                              (isActivePlan || isPopular) && { color: "#FFF" },
                            ]}
                          >
                            {plan.price === 0
                              ? "Free"
                              : `${plan.price.toLocaleString("vi-VN")}đ`}
                          </Text>
                          {plan.price > 0 && (
                            <Text
                              style={[
                                styles.periodCompact,
                                (isActivePlan || isPopular) && {
                                  color: "#BAE6FD",
                                },
                              ]}
                            >
                              /month
                            </Text>
                          )}
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.chooseBtnCompact,
                            isPopular
                              ? styles.chooseBtnPopularCompact
                              : styles.chooseBtnNormalCompact,
                          ]}
                          disabled={!!buyingPlanId}
                          onPress={() => handleChoosePlan(plan)}
                        >
                          <Text
                            style={[
                              styles.chooseBtnTextCompact,
                              { color: isPopular ? "#136bb8ff" : styles.chooseBtnText },
                            ]}
                          >
                            {isActivePlan ? "Manage Plan" : "Choose Plan"}
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.featuresListCompact}>
                          {plan.features?.slice(0, 4).map((feat, i) => (
                            <View key={i} style={styles.featureRowCompact}>
                              <Icon
                                name="check"
                                size={14}
                                color={isPopular ? "#BAE6FD" : "#136bb8ff"}
                              />
                              <Text
                                style={[
                                  styles.featureItemCompact,
                                  isPopular && { color: "#E0F2FE" },
                                ]}
                              >
                                {feat}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Trust Section */}
        <LinearGradient
          colors={[styles.trustGradientStart, styles.trustGradientEnd]}
          style={styles.trustSection}
        >
          <Icon name="verified" size={48} color="#FFFFFF" />
          <Text style={styles.trustTitle}>100% Safe & Secure</Text>
          <Text style={styles.trustText}>
            7-day free trial • Cancel anytime • Full refund in 14 days
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Confirm Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}
          >
            <View style={styles.topAccent} />

            <Text style={styles.modalTitle}>
              {upgradeCheckData?.hasActiveSubscription ? "Upgrade Plan" : "Confirm Purchase"}
            </Text>

            {/* Warning message from API */}
            {upgradeCheckData?.warningMessage && (
              <View style={styles.warningBox}>
                <Icon name="warning" size={24} color="#F59E0B" />
                <Text style={styles.warningText}>
                  {upgradeCheckData.warningMessage}
                </Text>
              </View>
            )}

            {/* Current and new plan details */}
            {upgradeCheckData?.currentSubscription && (
              <View style={styles.planDetailsBox}>
                <Text style={styles.planDetailLabel}>Current Plan:</Text>
                <Text style={styles.planDetailText}>
                  {upgradeCheckData.currentSubscription.planName}
                </Text>
                <Text style={styles.planDetailSubtext}>
                  {upgradeCheckData.currentSubscription.remainingDays} days remaining
                </Text>
              </View>
            )}

            {upgradeCheckData?.newPlan && (
              <View style={styles.planDetailsBox}>
                <Text style={styles.planDetailLabel}>New Plan:</Text>
                <Text style={styles.planDetailText}>
                  {upgradeCheckData.newPlan.planName}
                </Text>
                <Text style={styles.planDetailSubtext}>
                  {upgradeCheckData.newPlan.price.toLocaleString("vi-VN")}đ for {upgradeCheckData.newPlan.durationDays} days
                </Text>
              </View>
            )}

            {/* Default message if no warning */}
            {!upgradeCheckData?.warningMessage && (
              <Text style={styles.modalText}>
                {selectedPlan?.price === 0
                  ? `Activate ${selectedPlan?.planName} plan?`
                  : `Buy ${selectedPlan?.planName} for ${(
                    selectedPlan?.price ?? 0
                  ).toLocaleString("vi-VN")}đ / month?`}
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setShowConfirmModal(false);
                  setUpgradeCheckData(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirm, buyingPlanId && { opacity: 0.7 }]}
                disabled={!!buyingPlanId || !upgradeCheckData?.canUpgrade}
                onPress={async () => {
                  await confirmBuy(selectedPlan);
                  setShowConfirmModal(false);
                  setUpgradeCheckData(null);
                }}
              >
                <Text style={styles.modalConfirmText}>
                  {buyingPlanId ? "Processing..." : upgradeCheckData?.hasActiveSubscription ? "Upgrade" : "Buy"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showErrorModal}
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ scale: errorScaleAnim }] }]}
          >
            <View style={styles.errorIconContainer}>
              <Icon name="error" size={56} color="#EF4444" />
            </View>

            <Text style={styles.errorTitle}>{errorMessage.title}</Text>

            <Text style={styles.errorText}>{errorMessage.message}</Text>

            <View style={{ flexDirection: "row", gap: 12, justifyContent: "center", width: "100%" }}>
              {isInsufficientFunds && (
                <TouchableOpacity
                  style={[styles.errorButton, { backgroundColor: "#3B82F6" }]}
                  onPress={() => {
                    setShowErrorModal(false);
                    navigation.navigate("DesignerWallet");
                  }}
                >
                  <Text style={styles.errorButtonText}>Back to Wallet</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.errorButton,
                  isInsufficientFunds && { backgroundColor: "#E5E7EB" },
                ]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text
                  style={[
                    styles.errorButtonText,
                    isInsufficientFunds && { color: "#374151" },
                  ]}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
