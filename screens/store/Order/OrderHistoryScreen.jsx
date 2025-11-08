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
          <Pressable
            onPress={() => navigation.goBack("Home")}
            style={styles.backBtn}
          >
            <Icon name="arrow-back" size={24} color="#2D2D2D" />
          </Pressable>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#64B5F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color="#2D2D2D" />
          </Pressable>
          <Text style={styles.headerTitle}>Order History</Text>
          <View style={{ width: 40 }} />
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
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#2D2D2D" />
        </Pressable>
        <Text style={styles.headerTitle}>Order History</Text>
        <Pressable onPress={onRefresh}>
          <Icon name="refresh" size={24} color="#2D2D2D" />
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
            {/* Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderHeaderLeft}>
                <Icon name="receipt" size={20} color="#4FC3F7" />
                <Text style={styles.invoiceNumber}>
                  {order.invoiceNumber}
                </Text>
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
                <Text
                  style={[
                    styles.statusText,
                    { color: "#1F2937" },
                  ]}
                >
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
                    { backgroundColor: `${getStatusColor(order.paymentStatus)}80` },
                  ]}
                >
                  <Icon
                    name={
                      order.paymentStatus === "PENDING"
                        ? "payment"
                        : "check-circle"
                    }
                    size={14}
                    color="#1F2937"
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      { color: "#1F2937" },
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
  container: { flex: 1, backgroundColor: "#FFF9E6" },
  header: {
    paddingTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#B3E5FC",
    borderBottomWidth: 2,
    borderBottomColor: "#2D2D2D",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#2D2D2D" },
  content: { flex: 1, padding: 16 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: "#2D2D2D", marginTop: 16 },
  emptyText: { fontSize: 14, color: "#546E7A", marginTop: 8, textAlign: "center" },
  shopBtn: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#81C784",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  shopBtnText: { color: "#1F2937", fontSize: 16, fontWeight: "800" },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    shadowColor: "#90CAF9",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  invoiceNumber: { fontSize: 16, fontWeight: "800", color: "#37474F" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  statusText: { fontSize: 12, fontWeight: "800" },
  orderInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#B3E5FC",
    borderStyle: "dashed",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, color: "#607D8B", fontWeight: "600" },
  itemsContainer: {
    gap: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#B3E5FC",
    borderStyle: "dashed",
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: "800", color: "#2E4053", marginBottom: 4 },
  itemDesc: { fontSize: 12, color: "#546E7A", marginBottom: 6 },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700", color: "#9575CD" },
  itemRight: { alignItems: "flex-end" },
  itemPrice: { fontSize: 14, fontWeight: "800", color: "#2E4053" },
  discountText: { fontSize: 12, color: "#81C784", marginTop: 2 },
  orderFooter: { gap: 12 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 14, fontWeight: "700", color: "#37474F" },
  totalAmount: { fontSize: 18, fontWeight: "900", color: "#E65100" },
  actionRow: { flexDirection: "row", justifyContent: "space-between" },
  paymentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  paymentText: { fontSize: 12, fontWeight: "800" },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#64B5F6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  checkoutBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
};
