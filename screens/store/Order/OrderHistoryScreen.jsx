import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { orderService } from "../../../service/orderService";
import getStyles from "./OrderHistoryScreen.styles";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import loadingAnimation from "../../../assets/loading.json";
import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";
import { feedbackService } from "../../../service/feedbackService";
import { useToast } from "../../../hooks/use-toast";
import { useTheme } from "../../../context/ThemeContext";

const ITEMS_PER_PAGE = 10;
const screenWidth = Dimensions.get("window").width;
const TABS = ["All", "Pending", "Completed", "Cancelled"];

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isDark = theme === "dark";

  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState("All");
  const translateX = useRef(new Animated.Value(0)).current;

  // Feedback Modal States
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderByUserId();

      const sortedOrders = (response || []).sort((a, b) => {
        const dateA = new Date(a.issueDate);
        const dateB = new Date(b.issueDate);
        return dateB - dateA;
      });

      setAllOrders(sortedOrders);
      setCurrentPage(1);
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

  const handleTabPress = (tab, index) => {
    setActiveTab(tab);
    setCurrentPage(1);
    Animated.spring(translateX, {
      toValue: ((screenWidth - 40) / 4) * index,
      useNativeDriver: true,
    }).start();
  };

  const getFilteredOrders = () => {
    if (activeTab === "All") return allOrders;
    if (activeTab === "Pending")
      return allOrders.filter(
        (o) => o.orderStatus === "PENDING" || o.paymentStatus === "PENDING"
      );
    if (activeTab === "Completed")
      return allOrders.filter(
        (o) => o.orderStatus === "COMPLETED" || o.orderStatus === "SUCCESS"
      );
    if (activeTab === "Cancelled")
      return allOrders.filter(
        (o) => o.orderStatus === "CANCELLED" || o.orderStatus === "FAILED"
      );
    return allOrders;
  };

  const filteredOrders = getFilteredOrders();

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const ordersToDisplay = filteredOrders.slice(startIdx, endIdx);

  const totalSpent = allOrders
    .filter((o) => o.paymentStatus === "PAID" || o.paymentStatus === "SUCCESS")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingCount = allOrders.filter(
    (o) => o.orderStatus === "PENDING"
  ).length;
  const completedCount = allOrders.filter(
    (o) => o.orderStatus === "COMPLETED" || o.orderStatus === "SUCCESS"
  ).length;

  const openFeedbackModal = (item) => {
    setSelectedItem(item);
    setRating(0);
    setComment("");
    setFeedbackModalVisible(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setSelectedItem(null);
    setRating(0);
    setComment("");
  };

  const createFeedback = async () => {
    if (rating === 0) {
      toast({
        type: "error",
        text1: "Rating Required",
        text2: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        type: "error",
        text1: "Comment Required",
        text2: "Please write a comment about your experience.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingFeedback(true);

      const payload = {
        resourceId: selectedItem.resourceTemplateId,
        rating: rating,
        comment: comment.trim(),
        validTarget: true,
      };

      await feedbackService.postFeedbackResource(payload);

      toast({
        type: "success",
        text1: "Feedback Submitted",
        text2: "Thank you for sharing your experience!",
        variant: "destructive",
      });

      closeFeedbackModal();
    } catch (error) {
      console.error("Error creating feedback:", error.message);
      toast({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRetryPayment = async (orderId, invoiceNumber, totalAmount) => {
    try {
      setRetryingOrderId(orderId);
      await orderService.createOrderRetry(orderId);
      await fetchOrders();

      toast({
        type: "success",
        text1: "Retry Successful",
        text2: "Payment has been retried successfully.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        type: "error",
        text1: "Retry Failed",
        text2: error.message || "Insufficient balance in wallet",
        variant: "destructive",
      });
    } finally {
      setRetryingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B";
      case "COMPLETED":
        return "#10B981";
      case "SUCCESS":
        return "#10B981";
      case "CANCELLED":
        return "#EF4444";
      case "CONFIRMED":
        return "#3B82F6";
      case "PAID":
        return "#8B5CF6";
      case "FAILED":
        return "#EF4444";
      default:
        return "#64748B";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return "schedule";
      case "COMPLETED":
        return "check-circle";
      case "SUCCESS":
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

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon
              name={star <= rating ? "star" : "star-border"}
              size={40}
              color={
                star <= rating ? "#FFB300" : isDark ? "#64748B" : "#BDC3C7"
              }
            />
          </Pressable>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={isDark ? "#0F172A" : "#F8FAFC"}
        />
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton
            iconSize={26}
            iconColor={isDark ? "#FFFFFF" : "#084F8C"}
          />
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
      </View>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Icon
            name="shopping-bag"
            size={20}
            color={isDark ? "#60A5FA" : "#084F8C"}
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: isDark ? "#60A5FA" : "#084F8C" },
            ]}
          >
            {totalSpent.toLocaleString()} đ
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon
            name="check-circle"
            size={20}
            color="#10B981"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Completed</Text>
          <Text style={[styles.summaryValue, { color: "#10B981" }]}>
            {completedCount}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Icon
            name="schedule"
            size={20}
            color="#F59E0B"
            style={{ marginBottom: 4 }}
          />
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
            {pendingCount}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Animated.View
          style={[styles.tabIndicator, { transform: [{ translateX }] }]}
        />
        {TABS.map((tab, index) => (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => handleTabPress(tab, index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? "#60A5FA" : "#084F8C"}
          />
        }
      >
        {ordersToDisplay.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require("../../../assets/transaction.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyText}>
              {activeTab === "All"
                ? "Start shopping to see your order history"
                : `No ${activeTab.toLowerCase()} orders found`}
            </Text>
            {activeTab === "All" && (
              <Pressable
                style={styles.shopBtn}
                onPress={() => navigation.navigate("ResourceStore")}
              >
                <Text style={styles.shopBtnText}>Shop Now</Text>
              </Pressable>
            )}
          </View>
        ) : (
          ordersToDisplay.map((order) => (
            <View key={order.orderId} style={styles.orderCard}>
              {/* Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <View style={styles.iconWrap}>
                    <Icon
                      name="receipt"
                      size={20}
                      color={isDark ? "#60A5FA" : "#084F8C"}
                    />
                  </View>
                  <View>
                    <Text style={styles.invoiceNumber}>
                      #{order.invoiceNumber}
                    </Text>
                    <Text style={styles.cardDate}>
                      {new Date(order.issueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: `${getStatusColor(order.orderStatus)}15`,
                      borderColor: `${getStatusColor(order.orderStatus)}30`,
                    },
                  ]}
                >
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

              {/* Items */}
              <View style={styles.itemsContainer}>
                {order?.items?.map((item) => {
                  const canShowFeedback =
                    (order.orderStatus === "COMPLETED" ||
                      order.orderStatus === "SUCCESS") &&
                    order.paymentStatus === "PAID" &&
                    item.resourceTemplateId;

                  return (
                    <View key={item.orderDetailId} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.templateName}
                        </Text>
                        <Text style={styles.itemDesc} numberOfLines={1}>
                          {item.templateType}
                        </Text>

                        {canShowFeedback && (
                          <Pressable
                            style={styles.feedbackButton}
                            onPress={() => openFeedbackModal(item)}
                          >
                            <Icon
                              name="rate-review"
                              size={14}
                              color={isDark ? "#60A5FA" : "#1E40AF"}
                            />
                            <Text style={styles.feedbackButtonText}>
                              Write Review
                            </Text>
                          </Pressable>
                        )}
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
                  );
                })}
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
                        backgroundColor:
                          order.paymentStatus === "PAID"
                            ? isDark
                              ? "#064E3B"
                              : "#ECFDF5"
                            : isDark
                            ? "#334155"
                            : "#F1F5F9",
                        borderColor:
                          order.paymentStatus === "PAID"
                            ? isDark
                              ? "#10B981"
                              : "#A7F3D0"
                            : isDark
                            ? "#475569"
                            : "#E2E8F0",
                        borderWidth: 1,
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
                      color={
                        order.paymentStatus === "PAID"
                          ? "#10B981"
                          : isDark
                          ? "#94A3B8"
                          : "#64748B"
                      }
                    />
                    <Text
                      style={[
                        styles.paymentText,
                        {
                          color:
                            order.paymentStatus === "PAID"
                              ? "#10B981"
                              : isDark
                              ? "#94A3B8"
                              : "#64748B",
                        },
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

                  {order.paymentStatus === "FAILED" &&
                    order.orderStatus === "CANCELLED" && (
                      <Pressable
                        style={[
                          styles.checkoutBtn,
                          { backgroundColor: "#EF4444" },
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
          ))
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.paginationContainer}>
            <Pressable
              style={[
                styles.paginationBtn,
                currentPage === 1 && styles.paginationBtnDisabled,
              ]}
              onPress={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon
                name="chevron-left"
                size={20}
                color={
                  currentPage === 1
                    ? isDark
                      ? "#475569"
                      : "#BDC3C7"
                    : isDark
                    ? "#60A5FA"
                    : "#084F8C"
                }
              />
            </Pressable>

            <View style={styles.pageIndicator}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Pressable
                    key={page}
                    style={[
                      styles.pageDot,
                      currentPage === page && styles.pageDotActive,
                    ]}
                    onPress={() => setCurrentPage(page)}
                  >
                    <Text
                      style={[
                        styles.pageNumber,
                        currentPage === page && styles.pageNumberActive,
                      ]}
                    >
                      {page}
                    </Text>
                  </Pressable>
                )
              )}
            </View>

            <Pressable
              style={[
                styles.paginationBtn,
                currentPage === totalPages && styles.paginationBtnDisabled,
              ]}
              onPress={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Icon
                name="chevron-right"
                size={20}
                color={
                  currentPage === totalPages
                    ? isDark
                      ? "#475569"
                      : "#BDC3C7"
                    : isDark
                    ? "#60A5FA"
                    : "#084F8C"
                }
              />
            </Pressable>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFeedbackModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeFeedbackModal}
          />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedItem?.templateName}
                </Text>
              </View>
              <Pressable onPress={closeFeedbackModal}>
                <Icon
                  name="close"
                  size={24}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
              </Pressable>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              {renderStars()}
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Comment</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your experience with this resource..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{comment.length} characters</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeFeedbackModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.submitButton,
                  (submittingFeedback || rating === 0 || !comment.trim()) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={createFeedback}
                disabled={submittingFeedback || rating === 0 || !comment.trim()}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
