import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { orderService } from "../../../service/orderService";


export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderByUserId();
      setOrders(response || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B";
      case "COMPLETED":
        return "#10B981";
      case "CANCELLED":
        return "#EF4444";
      default:
        return "#6B7280";
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack('Home')} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="receipt-long" size={100} color="#D1D5DB" />
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
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Order History</Text>
        <Pressable onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#3B82F6" />
        </Pressable>
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
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Icon name="receipt" size={20} color="#3B82F6" />
                <Text style={styles.invoiceNumber}>{order.invoiceNumber}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(order.orderStatus)}15` },
                ]}
              >
                <Icon
                  name={getStatusIcon(order.orderStatus)}
                  size={14}
                  color={getStatusColor(order.orderStatus)}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(order.orderStatus) },
                  ]}
                >
                  {order.orderStatus}
                </Text>
              </View>
            </View>

            {/* Order Info */}
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Icon name="event" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  {formatDate(order.issueDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="shopping-bag" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.itemsContainer}>
              {order?.items?.map((item) => (
                <View key={item.orderDetailId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.templateName}
                    </Text>
                    <Text style={styles.itemDesc} numberOfLines={1}>
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

            {/* Order Footer */}
            <View style={styles.orderFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalAmount}>
                  {order.totalAmount.toLocaleString()} đ
                </Text>
              </View>

              {/* Payment Status & Checkout Button */}
              <View style={styles.actionRow}>
                <View
                  style={[
                    styles.paymentBadge,
                    {
                      backgroundColor: `${getStatusColor(
                        order.paymentStatus
                      )}15`,
                    },
                  ]}
                >
                  <Icon
                    name={
                      order.paymentStatus === "PENDING"
                        ? "payment"
                        : "check-circle"
                    }
                    size={14}
                    color={getStatusColor(order.paymentStatus)}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      { color: getStatusColor(order.paymentStatus) },
                    ]}
                  >
                    {order.paymentStatus}
                  </Text>
                </View>

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
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  shopBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  shopBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#3B82F6",
  },
  itemRight: {
    alignItems: "flex-end",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  discountText: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 2,
  },
  orderFooter: {
    gap: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
};