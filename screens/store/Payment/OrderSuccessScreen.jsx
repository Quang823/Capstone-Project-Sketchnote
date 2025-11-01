import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, Pressable, Animated, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, invoiceNumber, totalAmount } = route.params || {};
const [progress] = useState(new Animated.Value(0));
  const [countdown, setCountdown] = useState(10);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
const isFocused = useIsFocused();
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing animation for success icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

  

    return () => {
      clearInterval(timer);
      pulse.stop();
    };
  }, []);
  useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        if (isFocused) navigation.navigate("Home"); 
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [isFocused]);
useEffect(() => {
  Animated.timing(progress, {
    toValue: 1,
    duration: 3000,
    useNativeDriver: false, 
  }).start();
}, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Success Icon */}
        <Animated.View
          style={[
            styles.header,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
          ]}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.successCircle}>
              <Icon name="check" size={72} color="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.successTitle}>Order Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your items are on their way!
          </Text>
        </Animated.View>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="receipt" size={20} color="#6B7280" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Invoice #{invoiceNumber || "N/A"}</Text>
              <Text style={styles.detailValue}>{orderId ? `#${orderId}` : "Order ID"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Icon name="payments" size={20} color="#6B7280" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Total Paid</Text>
              <Text style={styles.totalAmount}>
                {totalAmount?.toLocaleString() || "0"} đ
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
           <Animated.View
  style={[
    styles.progressFill,
    {
      width: progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    },
  ]}
/>

          </View>
          <Text style={styles.progressText}>Preparing your order...</Text>
        </View>

        {/* Countdown */}
        <Animated.View
          style={[
            styles.countdownContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Icon name="schedule" size={20} color="#F59E0B" />
          <Text style={styles.countdownText}>
            Redirecting in {countdown}s
          </Text>
          <Pressable style={styles.cancelCountdown} onPress={() => setCountdown(0)}>
            <Icon name="close" size={16} color="#EF4444" />
          </Pressable>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryBtn}
             onPress={() => {
    setCountdown(0); 
    navigation.navigate("OrderHistory");
  }}
          >
            <Icon name="history" size={20} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Track Order</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryBtn}
              onPress={() => {
    setCountdown(0); 
    navigation.navigate("Home");
  }}
          >
            <Icon name="home" size={20} color="#FFFFFF" />
            <Text style={styles.secondaryBtnText}>Continue Browsing</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.tertiaryBtn}
          onPress={() => navigation.navigate("ResourceStore")}
        >
          <Text style={styles.tertiaryBtnText}>Shop More Items</Text>
          <Icon name="shopping-cart" size={18} color="#6B7280" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 20,
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    color: "#10B981",
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: 24,
  },
  countdownText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  cancelCountdown: {
    padding: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  tertiaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  tertiaryBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
};