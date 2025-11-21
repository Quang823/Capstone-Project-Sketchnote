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

export default function OrderSuccessScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Confirming payment...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Check if payment was successful
  const isPaymentSuccess =
    order?.paymentStatus?.toUpperCase() === "PAID" ||
    order?.paymentStatus?.toUpperCase() === "SUCCESS" ||
    order?.paymentStatus?.toUpperCase() === "COMPLETED";

  const isPaymentFailed =
    order?.paymentStatus?.toUpperCase() === "FAILED" ||
    order?.orderStatus?.toUpperCase() === "CANCELLED";

  return (
    <LinearGradient colors={["#EFF6FF", "#DBEAFE"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 800 }}
          style={styles.card}
        >
          {/* Dynamic Title based on payment status */}
          {isPaymentSuccess ? (
            <Text style={styles.titleSuccess}>Payment Successful 🎉</Text>
          ) : isPaymentFailed ? (
            <Text style={styles.titleFailed}>Payment Failed ❌</Text>
          ) : (
            <Text style={styles.titlePending}>Payment Pending ⏳</Text>
          )}

          <View style={styles.infoBox}>
           

            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Amount:</Text>
              <Text style={styles.value}>
                {order?.totalAmount?.toLocaleString()} VND
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Payment Status:</Text>
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

            <View style={styles.infoRow}>
              <Text style={styles.label}>Order Status:</Text>
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

            <View style={styles.infoRow}>
              <Text style={styles.label}>Created At:</Text>
              <Text style={styles.value}>
  {new Date(order?.createdAt).toLocaleDateString("vi-VN", {
  dateStyle: "medium",
})
}
</Text>

            </View>
          </View>

          {/* Warning message for failed payments */}
          {isPaymentFailed && (
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 }}
              style={styles.warningBox}
            >
              <Text style={styles.warningText}>
               ⚠️ Your payment could not be processed. Please try again in your order history or check your wallet.
              </Text>
            </MotiView>
          )}
        </MotiView>

        <MotiView
          from={{ translateY: 30, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.itemsSection}
        >
          <Text style={styles.subTitle}>🛍️ Order </Text>
          <View style={styles.itemsGrid}>
            {order?.items?.map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100 }}
                style={styles.itemCard}
              >
                <Text style={styles.itemName}>{item.templateName}</Text>
                <Text style={styles.itemDesc}>{item.templateDescription}</Text>
                <Text style={styles.itemPrice}>
                  {item.unitPrice?.toLocaleString()} VND
                </Text>
              </MotiView>
            ))}
          </View>
        </MotiView>

        <View style={styles.buttonContainer}>
          {isPaymentFailed && (
            <Pressable
              style={[styles.button, styles.retryButton]}
              onPress={() => navigation.navigate("Wallet")}
            >
              <Text style={styles.buttonText}>Go to Wallet</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.button, styles.backButton]}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
