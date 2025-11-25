import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext";
import { cartStyles } from "./CartScreen.styles";
import Toast from "react-native-toast-message";
import { orderService } from "../../../service/orderService";
import LottieView from "lottie-react-native";

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  const handleCreateOrder = async () => {
    try {
      setIsCreatingOrder(true);
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

      setShowConfirmModal(false);

      Toast.show({
        type: "success",
        text1: "Order created successfully",
        text2: "Redirecting to payment...",
      });

      // Navigate to OrderSuccess screen with orderId
      setTimeout(() => {
        navigation.navigate("OrderSuccess", { orderId });
      }, 500);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Order creation failed",
        text2: err.message,
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const createOrder = () => {
    setShowConfirmModal(true);
  };

  const finalTotal = total - discount;

  const ConfirmPaymentModal = () => {
    return (
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isCreatingOrder && setShowConfirmModal(false)}
      >
        <View style={cartStyles.modalOverlay}>
          <View style={cartStyles.modalContent}>
            {/* Header */}
            <View style={cartStyles.modalHeader}>
              <View style={cartStyles.iconContainer}>
                <Icon name="shopping-cart" size={32} color="#1E40AF" />
              </View>
              <Text style={cartStyles.modalTitle}>Confirm Payment</Text>
              <Text style={cartStyles.modalSubtitle}>
                Please review your order before confirming
              </Text>
            </View>

            {/* Order Summary */}
            <ScrollView
              style={cartStyles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Items Summary */}
              <View style={cartStyles.modalSection}>
                <Text style={cartStyles.modalSectionTitle}>Order Items</Text>
                <View style={cartStyles.itemsListContainer}>
                  {cart.map((item, index) => (
                    <View key={item.id} style={cartStyles.modalItemRow}>
                      <View style={cartStyles.modalItemInfo}>
                        <Text style={cartStyles.modalItemName}>
                          {item.name}
                        </Text>
                        {item.type && (
                          <Text style={cartStyles.modalItemType}>
                            {item.type}
                          </Text>
                        )}
                      </View>
                      <Text style={cartStyles.modalItemPrice}>
                        {item.price.toLocaleString()} đ
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={cartStyles.modalSection}>
                <Text style={cartStyles.modalSectionTitle}>Price Details</Text>
                <View style={cartStyles.priceBreakdown}>
                  <View style={cartStyles.priceRow}>
                    <Text style={cartStyles.priceLabel}>Subtotal</Text>
                    <Text style={cartStyles.priceValue}>
                      {subtotal.toLocaleString()} đ
                    </Text>
                  </View>

                  {appliedCoupon && (
                    <View
                      style={[cartStyles.priceRow, cartStyles.discountPriceRow]}
                    >
                      <View style={cartStyles.discountPriceLabel}>
                        <Icon name="local-offer" size={14} color="#10B981" />
                        <Text style={cartStyles.discountPriceText}>
                          Discount ({appliedCoupon})
                        </Text>
                      </View>
                      <Text style={cartStyles.discountPriceValue}>
                        -{discount.toLocaleString()} đ
                      </Text>
                    </View>
                  )}

                  <View style={cartStyles.priceDivider} />

                  <View style={cartStyles.totalPriceRow}>
                    <Text style={cartStyles.totalPriceLabel}>Total Amount</Text>
                    <Text style={cartStyles.totalPriceValue}>
                      {finalTotal.toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment Method Info */}
              <View style={cartStyles.modalSection}>
                <View style={cartStyles.paymentMethodBox}>
                  <Icon
                    name="account-balance-wallet"
                    size={20}
                    color="#8B5CF6"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={cartStyles.paymentMethodTitle}>
                      Payment Method
                    </Text>
                    <Text style={cartStyles.paymentMethodText}>
                      Payment via Digital Wallet
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={cartStyles.modalFooter}>
              <Pressable
                style={[
                  cartStyles.cancelBtn,
                  isCreatingOrder && { opacity: 0.6 },
                ]}
                onPress={() => setShowConfirmModal(false)}
                disabled={isCreatingOrder}
              >
                <Text style={cartStyles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  cartStyles.confirmBtn,
                  isCreatingOrder && { opacity: 0.6 },
                ]}
                onPress={handleCreateOrder}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="lock" size={18} color="#FFFFFF" />
                    <Text style={cartStyles.confirmBtnText}>
                      Confirm Payment
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={cartStyles.container}>
        <View style={cartStyles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={cartStyles.backBtn}
          >
            <Icon name="arrow-back" size={24} color="#084F8C" />
          </Pressable>
          <Text style={cartStyles.headerTitle}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={cartStyles.emptyContainer}>
          <LottieView
            source={require("../../../assets/cart.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />

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
        {/* Left side: Back icon + Cart */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={cartStyles.backBtn}
          >
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text
            style={[cartStyles.headerTitle, { textAlign: "center", flex: 1 }]}
          >
            Cart ({cart.length})
          </Text> 
        </View>

        {/* Right side: Continue Shopping */}
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

        <View style={cartStyles.rightColumn}>
          <Text style={cartStyles.summaryTitle}>Order Summary</Text>

          <View style={cartStyles.summaryCard}>
            <View style={cartStyles.summaryRow}>
              <Text style={cartStyles.label}>Subtotal</Text>
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
            style={cartStyles.checkoutBtn}
            onPress={createOrder}
            disabled={isCreatingOrder}
          >
            <Icon name="lock" size={20} color="#FFFFFF" />
            <Text style={cartStyles.checkoutText}>Checkout Now</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ConfirmPaymentModal />
    </SafeAreaView>
  );
}
