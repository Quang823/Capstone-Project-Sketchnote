import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { checkoutStyles } from "./CheckoutScreen.styles";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cartItems = [], totalAmount = 0 } = route.params || {};

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("wallet");

  // 📦 Format helpers
  const formatCurrency = (amount) =>
    (amount ?? 0).toLocaleString("vi-VN") + " VND";

  // 💳 Payment methods
  const paymentMethods = [
    {
      id: "wallet",
      name: "Ví điện tử",
      icon: "💎",
      description: "Thanh toán bằng ví Skatenote",
      fee: "Miễn phí",
    },
    {
      id: "card",
      name: "Thẻ tín dụng",
      icon: "💳",
      description: "Visa, Mastercard",
      fee: "2.5% phí",
    },
  ];

  // 🛒 Handle payment
  const handlePayment = () => {
    if (selectedPaymentMethod === "wallet") {
      // Thanh toán bằng ví
      Alert.alert(
        "Xác nhận thanh toán",
        `Bạn sẽ thanh toán ${formatCurrency(totalAmount)} từ ví Skatenote?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            onPress: () => {
              Alert.alert("Thành công", "Đơn hàng đã được xử lý!");
              navigation.navigate("Home");
            },
          },
        ]
      );
    } else {
      // Thanh toán bằng thẻ
      Alert.alert(
        "Thông báo",
        "Tính năng thanh toán bằng thẻ đang được phát triển"
      );
    }
  };

  return (
    <View style={checkoutStyles.container}>
      {/* Header */}
      <View style={checkoutStyles.header}>
        <View style={checkoutStyles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#084F8C" />
          <Text style={checkoutStyles.headerTitle}>Checkout</Text>
        </View>
      </View>

      <ScrollView style={checkoutStyles.content} showsVerticalScrollIndicator={false}>
        {/* 💳 Payment Card */}
        <LinearGradient
          colors={["#667EEA", "#764BA2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={checkoutStyles.paymentCard}
        >
          <View style={checkoutStyles.cardHeader}>
            <Text style={checkoutStyles.cardTitle}>Payment</Text>
            <View style={checkoutStyles.cardIconContainer}>
              <Text style={checkoutStyles.cardIcon}>💳</Text>
            </View>
          </View>

          <Text style={checkoutStyles.totalAmount}>
            {formatCurrency(totalAmount)}
          </Text>

          <Text style={checkoutStyles.cardSubtitle}>
            {cartItems.length} sản phẩm trong giỏ hàng
          </Text>
        </LinearGradient>

        {/* 🛒 Order Summary */}
        <View style={checkoutStyles.summarySection}>
          <Text style={checkoutStyles.sectionTitle}>Order summary</Text>

          {cartItems.map((item, index) => (
            <View key={index} style={checkoutStyles.orderItem}>
              <View style={checkoutStyles.orderItemInfo}>
                <Text style={checkoutStyles.orderItemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={checkoutStyles.orderItemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
              <Text style={checkoutStyles.orderItemQuantity}>
                x{item.quantity}
              </Text>
            </View>
          ))}

          <View style={checkoutStyles.orderTotal}>
            <Text style={checkoutStyles.orderTotalLabel}>Total</Text>
            <Text style={checkoutStyles.orderTotalAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* 💰 Payment Methods */}
        <View style={checkoutStyles.paymentSection}>
          <Text style={checkoutStyles.sectionTitle}>Payment methods</Text>

          {paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              style={[
                checkoutStyles.paymentMethod,
                selectedPaymentMethod === method.id && checkoutStyles.selectedPaymentMethod,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={checkoutStyles.paymentMethodLeft}>
                <Text style={checkoutStyles.paymentIcon}>{method.icon}</Text>
                <View style={checkoutStyles.paymentInfo}>
                  <Text style={checkoutStyles.paymentName}>{method.name}</Text>
                  <Text style={checkoutStyles.paymentDescription}>
                    {method.description}
                  </Text>
                </View>
              </View>

              <View style={checkoutStyles.paymentMethodRight}>
                <Text style={checkoutStyles.paymentFee}>{method.fee}</Text>
                {selectedPaymentMethod === method.id && (
                  <Icon name="check-circle" size={24} color="#3B82F6" />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* 📱 Digital Delivery Notice */}
        <View style={checkoutStyles.deliveryNotice}>
          <View style={checkoutStyles.deliveryIconContainer}>
            <Icon name="cloud-download" size={24} color="#10B981" />
          </View>
          <View style={checkoutStyles.deliveryTextContainer}>
            <Text style={checkoutStyles.deliveryTitle}>Giao hàng số</Text>
            <Text style={checkoutStyles.deliveryDescription}>
              Sản phẩm sẽ được giao trực tiếp vào tài khoản của bạn sau khi thanh toán thành công
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 💳 Payment Button */}
      <View style={checkoutStyles.paymentButtonContainer}>
        <Pressable style={checkoutStyles.paymentButton} onPress={handlePayment}>
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={checkoutStyles.paymentButtonGradient}
          >
            <Icon name="payment" size={20} color="#FFFFFF" />
            <Text style={checkoutStyles.paymentButtonText}>
              Thanh toán {formatCurrency(totalAmount)}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
