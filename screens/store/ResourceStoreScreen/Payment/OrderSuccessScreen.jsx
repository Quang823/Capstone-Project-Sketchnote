import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { orderService } from "../../../../service/orderService";
import { styles } from "./OrderSuccessScreen.styles";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../../assets/loading.json";

export default function OrderSuccessScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatVND = (n) => {
    if (n == null) return "-";
    const num = Number(n);
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(num);
    } catch (e) {
      return `${num.toLocaleString("vi-VN")} ₫`;
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setError("No order ID found.");
          return;
        }

        const res = await orderService.getOrderById(orderId);
        if (res) setOrder(res);
        else setError("Order information not found.");
      } catch (err) {
        setError("Error loading order information.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <LinearGradient colors={["#EBF4FF", "#FFFFFF"]} style={styles.center}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 260, height: 200 }}
        />
        <Text style={styles.loadingText}>Loading your order...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={["#EBF4FF", "#FFFFFF"]} style={styles.center}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconCircle}>
            <Text style={styles.errorIcon}>⚠️</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // Check states
  const isPaymentSuccess = ["PAID", "SUCCESS", "COMPLETED"].includes(
    order?.paymentStatus?.toUpperCase()
  );

  const isPaymentFailed =
    ["FAILED", "CANCELLED"].includes(order?.paymentStatus?.toUpperCase()) ||
    order?.orderStatus?.toUpperCase() === "CANCELLED";

  return (
    <LinearGradient
      colors={["#fefefeff", "#fefefeff", "#FFFFFF"]}
      style={styles.gradient}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with animated success/fail icon */}
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <View style={styles.headerCard}>
            <View
              style={[
                styles.iconCircle,
                isPaymentSuccess
                  ? styles.iconCircleSuccess
                  : isPaymentFailed
                    ? styles.iconCircleFailed
                    : styles.iconCirclePending,
              ]}
            >
              <Text style={styles.headerIcon}>
                {isPaymentSuccess ? "✓" : isPaymentFailed ? "✕" : "⏳"}
              </Text>
            </View>

            {isPaymentSuccess ? (
              <Text style={styles.titleSuccess}>Payment Successful!</Text>
            ) : isPaymentFailed ? (
              <Text style={styles.titleFailed}>Payment Failed</Text>
            ) : (
              <Text style={styles.titlePending}>Payment Pending</Text>
            )}

            <Text style={styles.headerSubtitle}>
              {order?.invoiceNumber
                ? `Invoice #${order.invoiceNumber}`
                : `Order #${order?.orderId || orderId}`}
            </Text>

            <View style={styles.divider} />

            <View style={styles.totalAmountBox}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                {formatVND(order?.totalAmount)}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Content Grid */}
        <View style={styles.grid}>
          {/* Left - Order Details */}
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 }}
            style={styles.colLeft}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Order Details</Text>
              </View>

              <View style={styles.infoBox}>
                {/* PAYMENT STATUS */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Payment Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isPaymentSuccess
                        ? styles.statusSuccess
                        : isPaymentFailed
                          ? styles.statusFailed
                          : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isPaymentSuccess
                          ? styles.statusTextSuccess
                          : isPaymentFailed
                            ? styles.statusTextFailed
                            : styles.statusTextPending,
                      ]}
                    >
                      {order?.paymentStatus || "UNKNOWN"}
                    </Text>
                  </View>
                </View>

                {/* ORDER STATUS */}
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Order Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      order?.orderStatus?.toUpperCase() === "CANCELLED"
                        ? styles.statusFailed
                        : order?.orderStatus?.toUpperCase() === "CONFIRMED"
                          ? styles.statusPending
                          : styles.statusSuccess,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        order?.orderStatus?.toUpperCase() === "CANCELLED"
                          ? styles.statusTextFailed
                          : order?.orderStatus?.toUpperCase() === "CONFIRMED"
                            ? styles.statusTextPending
                            : styles.statusTextSuccess,
                      ]}
                    >
                      {order?.orderStatus || "UNKNOWN"}
                    </Text>
                  </View>
                </View>

                {/* CREATED AT */}
                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={styles.label}>Created At</Text>
                  <Text style={styles.value}>
                    {new Date(order?.createdAt).toLocaleDateString("vi-VN", {
                      dateStyle: "medium",
                    })}
                  </Text>
                </View>
              </View>

              {/* Failed Warning */}
              {isPaymentFailed && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 200 }}
                >
                  <View style={styles.warningBox}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                    <Text style={styles.warningText}>
                      Your payment could not be processed. Please check your
                      wallet or try again later.
                    </Text>
                  </View>
                </MotiView>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {isPaymentFailed && (
                  <Pressable
                    style={styles.button}
                    onPress={() => navigation.navigate("DesignerWallet")}
                  >
                    <LinearGradient
                      colors={["#10B981", "#059669"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>💰 Go to Wallet</Text>
                    </LinearGradient>
                  </Pressable>
                )}

                <Pressable
                  style={styles.button}
                  onPress={() => navigation.navigate("Home")}
                >
                  <LinearGradient
                    colors={["#1878ccff", "#084F8C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Back to Home</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </MotiView>

          {/* Right - Order Items */}
          <MotiView
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 200 }}
            style={styles.colRight}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Order Items</Text>
                <Text style={styles.itemCount}>
                  {order?.items?.length || 0}{" "}
                  {order?.items?.length === 1 ? "item" : "items"}
                </Text>
              </View>

              <ScrollView
                style={styles.itemsScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.itemsContainer}>
                  {order?.items?.map((item, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ delay: 300 + index * 80 }}
                    >
                      <View style={styles.itemCard}>
                        <View style={styles.itemHeader}>
                          <View style={styles.itemNumberCircle}>
                            <Text style={styles.itemNumber}>{index + 1}</Text>
                          </View>
                          <Text style={styles.itemName} numberOfLines={2}>
                            {item.templateName}
                          </Text>
                        </View>

                        <Text style={styles.itemDesc} numberOfLines={2}>
                          {item.templateDescription}
                        </Text>

                        <View style={styles.itemFooter}>
                          <View style={styles.priceTag}>
                            <Text style={styles.itemPrice}>
                              {formatVND(item.unitPrice)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </MotiView>
                  ))}
                </View>
              </ScrollView>
            </View>
          </MotiView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
