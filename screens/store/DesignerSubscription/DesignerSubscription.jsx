import React, { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
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

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function SubscriptionPlansScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
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
        console.error(err);
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
      {/* Header - Xanh da trời nhẹ */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
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
                colors={["#E0F2FE", "#BAE6FD"]}
                style={styles.featureIcon}
              >
                <Icon name={f.icon} size={32} color="#136bb8ff" />
              </LinearGradient>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Plans - ĐẸP NHẤT TỪ TRƯỚC ĐẾN NAY */}
        {/* Thay toàn bộ phần Pricing Plans bằng đoạn này */}
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
                  return (
                    <TouchableOpacity
                      key={plan.planId}
                      activeOpacity={0.92}
                      style={styles.planWrapperCompact}
                    >
                      <LinearGradient
                        colors={
                          isActivePlan
                            ? ["#136bb8ff", "#0251c7ff"]
                            : isPopular
                              ? ["#5eadf2ff", "#1d7accff"]
                              : ["#E0F2FE", "#BAE6FD"]
                        }
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
                              { color: "#136bb8ff" },
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
          colors={["#136bb8ff", "#0251c7ff"]}
          style={styles.trustSection}
        >
          <Icon name="verified" size={48} color="#FFFFFF" />
          <Text style={styles.trustTitle}>100% Safe & Secure</Text>
          <Text style={styles.trustText}>
            7-day free trial • Cancel anytime • Full refund in 14 days
          </Text>
        </LinearGradient>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  scrollContent: { paddingBottom: 40 },
  hero: {
    alignItems: "center",
    padding: 32,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: isTablet ? 58 : 50,
    fontFamily: "Pacifico-Regular",
    color: "#136bb8ff",
    textAlign: "center",
    lineHeight: isTablet ? 58 : 48,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#475569",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 28,
    maxWidth: 700,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginVertical: 32,
  },
  featureBox: {
    width: isTablet ? 180 : (width - 56) / 2,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369A1",
    textAlign: "center",
  },
  plansContainer: { paddingHorizontal: 20, alignItems: "center" },
  plansMainTitle: {
    fontSize: 32,
    fontFamily: "Pacifico-Regular",
    color: "#136bb8ff",
    textAlign: "center",
    marginBottom: 8,
  },
  plansSubTitle: {
    fontSize: 18,
    color: "#475569",
    marginBottom: 40,
    fontWeight: "500",
  },
  plansGridCompact: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  planWrapperCompact: {
    width: 280, // Đúng kích thước để 4 card vừa màn hình
    marginHorizontal: 8,
  },
  planCardCompact: {
    borderRadius: 24,
    padding: 20,
    height: 350,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    justifyContent: "space-between",
  },
  planCardPopularCompact: {
    borderColor: "#1887e8ff",
    shadowColor: "#136bb8ff",
    shadowOpacity: 0.25,
    elevation: 16,
    transform: [{ scale: 1.04 }],
  },
  planCardActiveCompact: {
    borderColor: "#1887e8ff",
    shadowColor: "#136bb8ff",
    shadowOpacity: 0.25,
    elevation: 16,
    transform: [{ scale: 1.05 }],
  },
  planCardInactiveCompact: {
    opacity: 1,
  },
  popularBadgeCompact: {
    position: "absolute",
    top: 4,
    alignSelf: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  popularTextCompact: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  activeBadgeCompact: {
    position: "absolute",
    top: 8,
    right: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
  },
  activeTextCompact: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  planNameCompact: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#084F8C",
    marginTop: 16,
  },
  planDescCompact: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    flex: 1,
    marginVertical: 8,
  },
  priceBoxCompact: {
    alignItems: "center",
    marginVertical: 16,
  },
  priceCompact: {
    fontSize: 30,
    fontWeight: "900",
    color: "#084F8C",
  },
  periodCompact: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  chooseBtnCompact: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  chooseBtnPopularCompact: {
    backgroundColor: "#FFFFFF",
  },
  chooseBtnNormalCompact: {
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#084F8C",
  },
  chooseBtnDisabledCompact: {
    backgroundColor: "#E5E7EB",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  chooseBtnTextCompact: {
    fontSize: 16,
    fontWeight: "800",
  },
  featuresListCompact: {
    marginTop: 20,
    gap: 10,
  },
  featureRowCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureItemCompact: {
    fontSize: 12.5,
    color: "#475569",
    flex: 1,
  },
  trustSection: {
    marginHorizontal: 20,
    marginTop: 60,

    padding: 20,
    borderRadius: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 15,
  },
  trustTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
    fontFamily: "Pacifico-Regular",
  },
  trustText: {
    color: "#E0F2FE",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContent: {
    width: "92%",
    maxWidth: 450,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 22,

    // shadow mịn kiểu iOS
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },

  topAccent: {
    height: 4,
    width: "25%",
    alignSelf: "center",
    borderRadius: 50,
    marginBottom: 12,
    backgroundColor: "#3B82F6",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "#0F172A",
    marginBottom: 12,
  },

  modalText: {
    fontSize: 15,
    textAlign: "center",
    color: "#475569",
    lineHeight: 22,
    marginBottom: 25,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
  },

  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  modalCancelText: {
    color: "#1E293B",
    fontWeight: "600",
    fontSize: 15,
  },

  modalConfirm: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#245edbff",
  },

  modalConfirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },

  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },

  planDetailsBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  planDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },

  planDetailText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "700",
  },

  planDetailSubtext: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
  },

  errorIconContainer: {
    alignSelf: "center",
    marginBottom: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    color: "#DC2626",
    marginBottom: 12,
  },

  errorText: {
    fontSize: 15,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
  },

  errorButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignSelf: "center",
    minWidth: 120,
  },

  errorButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});
