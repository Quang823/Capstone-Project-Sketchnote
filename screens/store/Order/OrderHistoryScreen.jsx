import React, { useState, useEffect } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { orderService } from "../../../service/orderService";
import { styles } from "./OrderHistoryScreen.styles";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import loadingAnimation from "../../../assets/loading.json";
import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";
import { feedbackService } from "../../../service/feedbackService";

const ITEMS_PER_PAGE = 5;

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [order, setOrder] = useState(null);

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
      setOrder(response);

      // Sắp xếp orders theo ngày mới nhất lên trên
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
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Comment Required", "Please write a comment about your experience.");
      return;
    }

    try {
      setSubmittingFeedback(true);
      
   
      const payload = {
        resourceId: selectedItem.resourceTemplateId, // hoặc selectedItem.resourceId nếu có
        rating: rating,
        comment: comment.trim(),
        validTarget: true,
      };

      console.log('Feedback payload:', payload); // Debug log

      await feedbackService.postFeedbackResource(payload);

      Alert.alert(
        "Success!",
        "Thank you for your feedback!",
        [{ text: "OK", onPress: closeFeedbackModal }]
      );

      Toast.show({
        type: "success",
        text1: "Feedback Submitted",
        text2: "Thank you for sharing your experience!",
      });

    } catch (error) {
      console.error("Error creating feedback:", error.message);
      Alert.alert(
        "Error",
        error.message || "Failed to submit feedback. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRetryPayment = async (orderId, invoiceNumber, totalAmount) => {
    try {
      setRetryingOrderId(orderId);
      await orderService.createOrderRetry(orderId);
      await fetchOrders();

      Alert.alert(
        "Retry Successful",
        "Payment has been retried successfully.",
        [{ text: "OK" }],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert(
        "Retry Failed",
        error.message || "Insufficient balance in wallet",
        [{ text: "OK" }],
        { cancelable: true }
      );
    } finally {
      setRetryingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#FFD54F";
      case "COMPLETED":
        return "#81C784";
      case "CANCELLED":
        return "#E57373";
      case "CONFIRMED":
        return "#64B5F6";
      case "PAID":
        return "#9575CD";
      case "FAILED":
        return "#FF8A80";
      default:
        return "#BA68C8";
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

  const renderStars = () => {
    return (
      <View style={feedbackStyles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => setRating(star)}
            style={feedbackStyles.starButton}
          >
            <Icon
              name={star <= rating ? "star" : "star-border"}
              size={40}
              color={star <= rating ? "#FFB300" : "#BDC3C7"}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(allOrders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const ordersToDisplay = allOrders.slice(startIdx, endIdx);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  if (allOrders.length === 0) {
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
        {ordersToDisplay?.map((order) => (
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
                  {new Date(order.issueDate).toLocaleDateString()}
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
              {order?.items?.map((item) => {
              
                
                // Check điều kiện hiển thị feedback button
                const canShowFeedback = 
                  (order.orderStatus === "COMPLETED" || order.orderStatus === "SUCCESS") && 
                  order.paymentStatus === "PAID" &&
                  item.resourceTemplateId;

                return (
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
                      
                      {/* Feedback Button */}
                      {canShowFeedback && (
                        <Pressable
                          style={feedbackStyles.feedbackButton}
                          onPress={() => openFeedbackModal(item)}
                        >
                          <Icon name="rate-review" size={16} color="#1E40AF" />
                          <Text style={feedbackStyles.feedbackButtonText}>
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
                color={currentPage === 1 ? "#BDC3C7" : "#1E40AF"}
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
                color={currentPage === totalPages ? "#BDC3C7" : "#1E40AF"}
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
          style={feedbackStyles.modalOverlay}
        >
          <Pressable
            style={feedbackStyles.modalBackdrop}
            onPress={closeFeedbackModal}
          />
          <View style={feedbackStyles.modalContent}>
            {/* Header */}
            <View style={feedbackStyles.modalHeader}>
              <View>
                <Text style={feedbackStyles.modalTitle}>Write a Review</Text>
                <Text style={feedbackStyles.modalSubtitle}>
                  {selectedItem?.templateName}
                </Text>
              </View>
              <Pressable onPress={closeFeedbackModal}>
                <Icon name="close" size={24} color="#64748B" />
              </Pressable>
            </View>

            {/* Rating */}
            <View style={feedbackStyles.section}>
              <Text style={feedbackStyles.sectionTitle}>Your Rating</Text>
              {renderStars()}
              {rating > 0 && (
                <Text style={feedbackStyles.ratingText}>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View style={feedbackStyles.section}>
              <Text style={feedbackStyles.sectionTitle}>Your Comment</Text>
              <TextInput
                style={feedbackStyles.commentInput}
                placeholder="Share your experience with this resource..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                value={comment}
                onChangeText={setComment}
                textAlignVertical="top"
              />
              <Text style={feedbackStyles.charCount}>
                {comment.length} characters
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={feedbackStyles.buttonRow}>
              <Pressable
                style={feedbackStyles.cancelButton}
                onPress={closeFeedbackModal}
              >
                <Text style={feedbackStyles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  feedbackStyles.submitButton,
                  (submittingFeedback || rating === 0 || !comment.trim()) &&
                    feedbackStyles.submitButtonDisabled,
                ]}
                onPress={createFeedback}
                disabled={submittingFeedback || rating === 0 || !comment.trim()}
              >
                {submittingFeedback ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={feedbackStyles.submitButtonText}>
                      Submit Review
                    </Text>
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

// Feedback Modal Styles
const feedbackStyles = {
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignSelf: "flex-start",
  },
  feedbackButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E40AF",
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFB300",
    marginTop: 8,
  },
  commentInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#1F2937",
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1E40AF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
};