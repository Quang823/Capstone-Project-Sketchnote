import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { orderService } from "../../../service/orderService";
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
          setError("Không có mã đơn hàng.");
          return;
        }
        const res = await orderService.getOrderById(orderId);
        if (res) setOrder(res);
        else setError("Không tìm thấy thông tin đơn hàng.");
      } catch (err) {
        setError("Lỗi khi tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Đang xác nhận thanh toán...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#E0EAFC", "#CFDEF3"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 800 }}
          style={styles.card}
        >
          <Text style={styles.title}>Thanh toán thành công 🎉</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Mã đơn hàng:</Text>
            <Text style={styles.value}>{order?.invoiceNumber}</Text>

            <Text style={styles.label}>Tổng tiền:</Text>
            <Text style={styles.value}>{order?.totalAmount} VND</Text>

            <Text style={styles.label}>Trạng thái thanh toán:</Text>
            <Text style={styles.statusPaid}>{order?.paymentStatus}</Text>

            <Text style={styles.label}>Trạng thái đơn hàng:</Text>
            <Text style={styles.statusConfirmed}>{order?.orderStatus}</Text>

            <Text style={styles.label}>Ngày tạo:</Text>
            <Text style={styles.value}>
              {new Date(order?.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </MotiView>

        <MotiView
          from={{ translateY: 30, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={{ delay: 300 }}
          style={styles.itemsSection}
        >
          <Text style={styles.subTitle}>🛍️ Danh sách sản phẩm:</Text>
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
              <Text style={styles.itemPrice}>{item.unitPrice} VND</Text>
            </MotiView>
          ))}
        </MotiView>

        <Pressable style={styles.backButton} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.backText}>Về trang chủ</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
