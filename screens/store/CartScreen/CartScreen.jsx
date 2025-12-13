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
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext";
import getStyles from "./CartScreen.styles";
import Toast from "react-native-toast-message";
import { orderService } from "../../../service/orderService";
import LottieView from "lottie-react-native";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useTheme } from "../../../context/ThemeContext";

export default function CartScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isDark = theme === "dark";

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Icon
                  name="shopping-cart"
                  size={32}
                  color={isDark ? "#60A5FA" : "#1E40AF"}
                />
              </View>
              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <Text style={styles.modalSubtitle}>
                Please review your order before confirming
              </Text>
            </View>

            {/* Order Summary */}
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Items Summary */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Order Items</Text>
                <View style={styles.itemsListContainer}>
                  {cart.map((item, index) => (
                    <View key={item.id} style={styles.modalItemRow}>
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemName}>{item.name}</Text>
                        {item.type && (
                          <Text style={styles.modalItemType}>{item.type}</Text>
                        )}
                      </View>
                      <Text style={styles.modalItemPrice}>
                        {item.price.toLocaleString()} đ
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Price Breakdown */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Price Details</Text>
                <View style={styles.priceBreakdown}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Subtotal</Text>
                    <Text style={styles.priceValue}>
                      {subtotal.toLocaleString()} đ
                    </Text>
                  </View>

                  {appliedCoupon && (
                    <View style={[styles.priceRow, styles.discountPriceRow]}>
                      <View style={styles.discountPriceLabel}>
                        <Icon
                          name="local-offer"
                          size={14}
                          color={isDark ? "#34D399" : "#10B981"}
                        />
                        <Text style={styles.discountPriceText}>
                          Discount ({appliedCoupon})
                        </Text>
                      </View>
                      <Text style={styles.discountPriceValue}>
                        -{discount.toLocaleString()} đ
                      </Text>
                    </View>
                  )}

                  <View style={styles.priceDivider} />

                  <View style={styles.totalPriceRow}>
                    <Text style={styles.totalPriceLabel}>Total Amount</Text>
                    <Text style={styles.totalPriceValue}>
                      {finalTotal.toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              </View>

              {/* Payment Method Info */}
              <View style={styles.modalSection}>
                <View style={styles.paymentMethodBox}>
                  <Icon
                    name="account-balance-wallet"
                    size={20}
                    color="#8B5CF6"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.paymentMethodTitle}>
                      Payment Method
                    </Text>
                    <Text style={styles.paymentMethodText}>
                      Payment via Digital Wallet
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.cancelBtn, isCreatingOrder && { opacity: 0.6 }]}
                onPress={() => setShowConfirmModal(false)}
                disabled={isCreatingOrder}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.confirmBtn, isCreatingOrder && { opacity: 0.6 }]}
                onPress={handleCreateOrder}
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="lock" size={18} color="#FFFFFF" />
                    <Text style={styles.confirmBtnText}>Confirm Payment</Text>
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
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
        />
        <View style={styles.header}>
          <SidebarToggleButton
            iconSize={26}
            iconColor={isDark ? "#FFFFFF" : "#084F8C"}
          />
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../../../assets/cart.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />

          <Text style={styles.emptyTitle}>Your cart is empty</Text>

          <Text style={styles.emptyText}>
            You haven't added any products yet
          </Text>

          <Pressable
            style={styles.shopNowBtn}
            onPress={() => navigation.navigate("ResourceStore")}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
      />
      <View style={styles.header}>
        {/* Left side: Back icon + Cart */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <SidebarToggleButton
            iconSize={26}
            iconColor={isDark ? "#60A5FA" : "#084F8C"}
          />
          <Text style={[styles.headerTitle, { textAlign: "center", flex: 1 }]}>
            Cart ({cart.length})
          </Text>
        </View>

        {/* Right side: Continue Shopping */}
        <Pressable onPress={() => navigation.navigate("ResourceStore")}>
          <Text style={styles.continueText}>Continue Shopping</Text>
        </Pressable>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.leftColumn}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{
                    uri: item.image || "https://via.placeholder.com/150",
                  }}
                  style={styles.itemImg}
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  {item.description && (
                    <Text style={styles.itemDesc} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {item.type && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                  )}

                  <View style={styles.itemBottom}>
                    <Text style={styles.itemPrice}>
                      {item.price.toLocaleString()} đ
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeBtn}
                >
                  <Icon name="delete-outline" size={20} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{subtotal.toLocaleString()} đ</Text>
            </View>

            {appliedCoupon && (
              <View style={[styles.summaryRow, styles.discountRow]}>
                <View style={styles.discountLabelRow}>
                  <Icon
                    name="local-offer"
                    size={16}
                    color={isDark ? "#34D399" : "#10B981"}
                  />
                  <Text style={styles.discountLabel}>
                    Discount ({appliedCoupon})
                  </Text>
                </View>
                <Text style={styles.discountValue}>
                  -{discount.toLocaleString()} đ
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {finalTotal.toLocaleString()} đ
              </Text>
            </View>
          </View>

          <View style={styles.couponSection}>
            <Text style={styles.couponTitle}>Coupon Code</Text>
            <View style={styles.couponRow}>
              <TextInput
                placeholder="Enter code..."
                style={styles.couponInput}
                value={coupon}
                onChangeText={setCoupon}
                placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              />
              <Pressable style={styles.applyBtn} onPress={applyCoupon}>
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.checkoutBtn}
            onPress={createOrder}
            disabled={isCreatingOrder}
          >
            <Icon name="lock" size={20} color="#FFFFFF" />
            <Text style={styles.checkoutText}>Checkout Now</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ConfirmPaymentModal />
    </SafeAreaView>
  );
}
