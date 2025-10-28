import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext";
import { cartStyles } from "./CartScreen.styles";

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, updateQuantity, removeFromCart } = useCart();

  // 🧮 Totals (no tax, no shipping)
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal; // simplified total

  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

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
      alert("Invalid discount code");
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
      {/* Header */}
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
        {/* Left Column: Product List */}
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

                  {/* 🔹 Designer Info */}
                  {/* {item.designer && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      {item.designer.avatarUrl ? (
                        <Image
                          source={{ uri: item.designer.avatarUrl }}
                          style={{ width: 26, height: 26, borderRadius: 13, marginRight: 6 }}
                        />
                      ) : (
                        <Icon name="person" size={22} color="#6B7280" style={{ marginRight: 6 }} />
                      )}
                      <Text style={{ color: "#4B5563", fontSize: 13 }}>
                        {item.designer.name}
                      </Text>
                    </View>
                  )} */}

                  <View style={cartStyles.itemBottom}>
                    <View style={cartStyles.qtyRow}>
                      <Pressable
                        onPress={() => updateQuantity(item.id, -1)}
                        style={cartStyles.qtyBtn}
                      >
                        <Icon name="remove" size={18} color="#6B7280" />
                      </Pressable>

                      <Text style={cartStyles.qtyText}>{item.quantity}</Text>

                      <Pressable
                        onPress={() => updateQuantity(item.id, 1)}
                        style={cartStyles.qtyBtn}
                      >
                        <Icon name="add" size={18} color="#6B7280" />
                      </Pressable>
                    </View>

                    <Text style={cartStyles.itemPrice}>
                      {(item.price * item.quantity).toLocaleString()} đ
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => removeFromCart(item.id)}
                  style={cartStyles.removeBtn}
                >
                  <Icon name="delete-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Right Column: Order Summary */}
        <View style={cartStyles.rightColumn}>
          <Text style={cartStyles.summaryTitle}>Order Summary</Text>

          <View style={cartStyles.summaryCard}>
            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.label}>
                Subtotal ({cart.length} items)
              </Text>
              <Text style={cartStyles.value}>
                {subtotal.toLocaleString()} đ
              </Text>
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
              <Text style={cartStyles.totalValue}>
                {finalTotal.toLocaleString()} đ
              </Text>
            </View>
          </View>

          {/* Coupon Section */}
          <View style={cartStyles.couponSection}>
            <Text style={cartStyles.couponTitle}>
              <Icon name="local-offer" size={16} color="#6B7280" /> Discount Code
            </Text>
            <View style={cartStyles.couponRow}>
              <TextInput
                placeholder="Enter coupon code"
                style={cartStyles.couponInput}
                value={coupon}
                onChangeText={setCoupon}
                placeholderTextColor="#9CA3AF"
              />
              <Pressable style={cartStyles.applyBtn} onPress={applyCoupon}>
                <Text style={cartStyles.applyText}>Apply</Text>
              </Pressable>
            </View>
            <Text style={cartStyles.couponHint}>
              💡 Try: SALE10 (10% off) or VIP20 (20% off)
            </Text>
          </View>

          {/* Checkout Button */}
          <Pressable
            style={cartStyles.checkoutBtn}
            onPress={() =>
              navigation.navigate("Checkout", {
                cartItems: cart,
                totalAmount: finalTotal,
              })
            }
          >
            <Icon name="lock" size={20} color="#FFFFFF" />
            <Text style={cartStyles.checkoutText}>Checkout Now</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>

          {/* Payment Methods */}
          <View style={cartStyles.paymentMethods}>
            <Text style={cartStyles.paymentTitle}>Payment Methods</Text>
            <View style={cartStyles.paymentIcons}>
              <Icon name="account-balance-wallet" size={24} color="#6B7280" />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
