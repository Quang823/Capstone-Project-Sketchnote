import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { orderService } from "../../../service/orderService";
import { styles } from "./OrderHistoryScreen.styles";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import loadingAnimation from "../../../assets/loading.json";
import LottieView from "lottie-react-native";
export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderByUserId();
      console.log("response:", response);
      setOrders(response || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleRetryPayment = async (orderId, invoiceNumber, totalAmount) => {
    try {
      setRetryingOrderId(orderId);
      await orderService.createOrderRetry(orderId);

      // Sau khi retry thành công, chuyển đến trang thanh toán
      navigation.navigate("PaymentSuccess", {
        orderId,
        invoiceNumber,
        totalAmount,
      });

      // Refresh lại danh sách orders
      await fetchOrders();
    } catch (error) {
      console.error("Error retrying payment:", error);
      Alert.alert(
        "Retry Failed",
        error.message || "Failed to retry payment. Please try again."
      );
    } finally {
      setRetryingOrderId(null);
    }
  };

  // 🎨 Màu trạng thái pastel đồng nhất
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FFD54F"; // Vàng pastel
      case "COMPLETED":
        return "#81C784"; // Xanh lá dịu
      case "CANCELLED":
        return "#E57373"; // Đỏ nhẹ
      case "CONFIRMED":
        return "#64B5F6"; // Xanh dương sáng
      case "PAID":
        return "#9575CD"; // Tím nhẹ
      case "FAILED":
        return "#FF8A80"; // Đỏ cam nhạt
      default:
        return "#BA68C8"; // Dự phòng
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return "schedule";
      case "COMPLETED":
        return "check-circle";
      case "CANCELLED":
        return "cancel";
      case "CONFIRMED":
        return "check";
      case "FAILED":
        return "error";
      default:
        return "info";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
        {/* <Text style={styles.loadingText}>
          Loading orders...
        </Text> */}
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
            <Text style={styles.headerTitle}>Order History</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="receipt-long" size={100} color="#B0BEC5" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            Start shopping to see your order history
          </Text>
          <Pressable
            style={styles.shopBtn}
            onPress={() => navigation.navigate("ResourceStore")}
          >
            <Text style={styles.shopBtnText}>Shop Now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#1E40AF" />
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders?.map((order) => (
          <View key={order.orderId} style={styles.orderCard}>
            {/* Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Icon name="receipt" size={20} color="#4FC3F7" />
                <Text style={styles.invoiceNumber}>{order.invoiceNumber}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(order.orderStatus)}80` },
                ]}
              >
                <Icon
                  name={getStatusIcon(order.orderStatus)}
                  size={14}
                  color="#1F2937"
                />
                <Text style={[styles.statusText, { color: "#1F2937" }]}>
                  {order.orderStatus}
                </Text>
              </View>
            </View>

            {/* Info */}
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color="#90A4AE" />
                <Text style={styles.infoText}>
                  {formatDate(order.issueDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="shopping-bag" size={16} color="#90A4AE" />
                <Text style={styles.infoText}>
                  {order.items.length} item
                  {order.items.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {/* Items */}
            <View style={styles.itemsContainer}>
              {order?.items?.map((item) => (
                <View key={item.orderDetailId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.templateName}</Text>
                    <Text style={styles.itemDesc}>
                      {item.templateDescription}
                    </Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {item.templateType}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemPrice}>
                      {item.unitPrice.toLocaleString()} đ
                    </Text>
                    {item.discount > 0 && (
                      <Text style={styles.discountText}>
                        -{item.discount.toLocaleString()} đ
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.orderFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  {order.totalAmount.toLocaleString()} đ
                </Text>
              </View>

              <View style={styles.actionRow}>
                <View
                  style={[
                    styles.paymentBadge,
                    {
                      backgroundColor: `${getStatusColor(
                        order.paymentStatus
                      )}80`,
                    },
                  ]}
                >
                  <Icon
                    name={
                      order.paymentStatus === "PENDING"
                        ? "payment"
                        : order.paymentStatus === "FAILED"
                        ? "error"
                        : "check-circle"
                    }
                    size={14}
                    color="#1F2937"
                  />
                  <Text style={[styles.paymentText, { color: "#1F2937" }]}>
                    {order.paymentStatus}
                  </Text>
                </View>

                {/* Nút Pay Now cho PENDING */}
                {order.paymentStatus === "PENDING" && (
                  <Pressable
                    style={styles.checkoutBtn}
                    onPress={() =>
                      navigation.navigate("PaymentSuccess", {
                        orderId: order.orderId,
                        invoiceNumber: order.invoiceNumber,
                        totalAmount: order.totalAmount,
                      })
                    }
                  >
                    <Text style={styles.checkoutBtnText}>Pay Now</Text>
                    <Icon name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>
                )}

                {/* Nút Retry Payment cho FAILED & CANCELLED */}
                {order.paymentStatus === "FAILED" &&
                  order.orderStatus === "CANCELLED" && (
                    <Pressable
                      style={[
                        styles.checkoutBtn,
                        { backgroundColor: "#FF6B6B" },
                        retryingOrderId === order.orderId && { opacity: 0.6 },
                      ]}
                      onPress={() =>
                        handleRetryPayment(
                          order.orderId,
                          order.invoiceNumber,
                          order.totalAmount
                        )
                      }
                      disabled={retryingOrderId === order.orderId}
                    >
                      {retryingOrderId === order.orderId ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Icon name="refresh" size={16} color="#FFFFFF" />
                          <Text style={styles.checkoutBtnText}>
                            Retry Payment
                          </Text>
                        </>
                      )}
                    </Pressable>
                  )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
