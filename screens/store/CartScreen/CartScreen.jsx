import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext";
import { cartStyles } from "./CartScreen.styles";
import Toast from "react-native-toast-message";
import { orderService } from "../../../service/orderService";

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const total = subtotal;

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const applyCoupon = () => {
    if (coupon.trim().toLowerCase() === "sale10") {
      setDiscount(subtotal * 0.1);
      setAppliedCoupon("SALE10");
    } else if (coupon.trim().toLowerCase() === "vip20") {
      setDiscount(subtotal * 0.2);
      setAppliedCoupon("VIP20");
    } else {
      setDiscount(0);
      setAppliedCoupon(null);
      Alert.alert("Invalid Code", "Please enter a valid discount code");
    }
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        subscriptionId: null,
        items: cart.map((item) => ({
          resourceTemplateId: item.id,
          discount: 0,
        })),
      };

      const res = await orderService.createOrder(orderData);
      const orderId = res?.result?.orderId;

      if (!orderId) throw new Error("Unable to get orderId");

      // Clear cart
      cart.forEach((item) => removeFromCart(item.id));

      Toast.show({
        type: "info",
        text1: "Redirecting to payment...",
      });

      // Navigate to OrderSuccess screen with orderId
      navigation.navigate("OrderSuccess", { orderId });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Order creation failed",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = total - discount;

  if (cart.length === 0) {
    return (
      <SafeAreaView style={cartStyles.container}>
        <View style={cartStyles.header}>
          <Pressable onPress={() => navigation.goBack()} style={cartStyles.backBtn}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text style={cartStyles.headerTitle}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={cartStyles.emptyContainer}>
          <Icon name="shopping-cart" size={100} color="#D1D5DB" />
          <Text style={cartStyles.emptyTitle}>Your cart is empty</Text>
          <Text style={cartStyles.emptyText}>
            You haven't added any products yet
          </Text>
          <Pressable
            style={cartStyles.shopNowBtn}
            onPress={() => navigation.navigate("ResourceStore")}
          >
            <Text style={cartStyles.shopNowText}>Shop Now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={cartStyles.container}>
      <View style={cartStyles.header}>
        <Pressable onPress={() => navigation.goBack()} style={cartStyles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={cartStyles.headerTitle}>Cart ({cart.length})</Text>
        <Pressable onPress={() => navigation.navigate("ResourceStore")}>
          <Text style={cartStyles.continueText}>Continue Shopping</Text>
        </Pressable>
      </View>

      <View style={cartStyles.mainRow}>
        <View style={cartStyles.leftColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.id} style={cartStyles.itemCard}>
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/150",
                  }}
                  style={cartStyles.itemImg}
                />

                <View style={cartStyles.itemInfo}>
                  <Text style={cartStyles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {item.description && (
                    <Text style={cartStyles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {item.type && (
                    <View style={cartStyles.typeBadge}>
                      <Text style={cartStyles.typeBadgeText}>{item.type}</Text>
                    </View>
                  )}

                  <View style={cartStyles.itemBottom}>
                    <Text style={cartStyles.itemPrice}>
                      {item.price.toLocaleString()} đ
                    </Text>
                  </View>
                </View>

                <Pressable onPress={() => removeFromCart(item.id)} style={cartStyles.removeBtn}>
                  <Icon name="delete-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={cartStyles.rightColumn}>
          <Text style={cartStyles.summaryTitle}>Order Summary</Text>

          <View style={cartStyles.summaryCard}>
            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.label}>Subtotal</Text>
              <Text style={cartStyles.value}>{subtotal.toLocaleString()} đ</Text>
            </View>

            {appliedCoupon && (
              <View style={[cartStyles.summaryRow, cartStyles.discountRow]}>
                <View style={cartStyles.discountLabelRow}>
                  <Icon name="local-offer" size={16} color="#10B981" />
                  <Text style={cartStyles.discountLabel}>
                    Discount ({appliedCoupon})
                  </Text>
                </View>
                <Text style={cartStyles.discountValue}>
                  -{discount.toLocaleString()} đ
                </Text>
              </View>
            )}

            <View style={cartStyles.divider} />

            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.totalLabel}>Total</Text>
              <Text style={cartStyles.totalValue}>{finalTotal.toLocaleString()} đ</Text>
            </View>
          </View>

          <View style={cartStyles.couponSection}>
            <Text style={cartStyles.couponTitle}>Coupon Code</Text>
            <View style={cartStyles.couponRow}>
              <TextInput
                placeholder="Enter code..."
                style={cartStyles.couponInput}
                value={coupon}
                onChangeText={setCoupon}
                placeholderTextColor="#9CA3AF"
              />
              <Pressable style={cartStyles.applyBtn} onPress={applyCoupon}>
                <Text style={cartStyles.applyText}>Apply</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[cartStyles.checkoutBtn, isCreatingOrder && { opacity: 0.6 }]}
            onPress={createOrder}
            disabled={isCreatingOrder}
          >
            <Icon name="lock" size={20} color="#FFFFFF" />
            <Text style={cartStyles.checkoutText}>
              {isCreatingOrder ? "Creating Order..." : "Checkout Now"}
            </Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
