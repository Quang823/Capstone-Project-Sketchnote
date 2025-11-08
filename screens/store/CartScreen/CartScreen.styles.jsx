import { StyleSheet, Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

export const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6", // Warm cream paper
  },

  // Header
  header: {
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFD93D", // Bright yellow
    borderBottomWidth: 3,
    borderBottomColor: "#2D2D2D",
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2D2D2D",
  },
  continueText: {
    fontSize: 14,
    color: "#2D2D2D",
    fontWeight: "700",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2D2D2D",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B5B95",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "600",
  },
  shopNowBtn: {
    backgroundColor: "#6BCF7F", // Green
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#2D2D2D",
    shadowColor: "#6BCF7F",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  shopNowText: {
    color: "#2D2D2D",
    fontSize: 16,
    fontWeight: "800",
  },

  // Main Layout
  mainRow: {
    flexDirection: screenWidth > 800 ? "row" : "column",
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
    flex: 1,
  },
  leftColumn: {
    flex: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 3,
    borderColor: "#2D2D2D",
    shadowColor: "#FFD93D",
    shadowOpacity: 0.4,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 3,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: "#2D2D2D",
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.4,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 3,
    alignSelf: "flex-start",
    width: screenWidth > 800 ? "auto" : "100%",
  },

  // Cart Item
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#FFD93D",
    borderStyle: "dashed",
    paddingVertical: 16,
    position: "relative",
  },
  itemImg: {
    width: 100,
    height: 100,
    borderRadius: 15,
    backgroundColor: "#FFF5CC",
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDesc: {
    fontSize: 13,
    color: "#6B5B95",
    marginBottom: 8,
    lineHeight: 18,
    fontWeight: "600",
  },
  typeBadge: {
    backgroundColor: "#E5F8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6B5B95",
    letterSpacing: 0.5,
  },
  itemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5CC",
    borderRadius: 10,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2D2D2D",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FF6B9D",
  },
  removeBtn: {
    position: "absolute",
    top: 16,
    right: 0,
    padding: 8,
    backgroundColor: "#FFE5EE",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },

  // Order Summary
  summaryTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
    color: "#6B5B95",
  },
  summaryCard: {
    backgroundColor: "#FFF5CC",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B5B95",
    fontWeight: "700",
  },
  value: {
    fontSize: 15,
    color: "#2D2D2D",
    fontWeight: "800",
  },
  divider: {
    height: 2,
    backgroundColor: "#FFD93D",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D2D2D",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FF6B9D",
  },

  // Discount
  discountRow: {
    backgroundColor: "#E8F9ED",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  discountLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6BCF7F",
  },
  discountValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6BCF7F",
  },

  // Coupon
  couponSection: {
    marginBottom: 20,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 12,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2D2D2D",
    backgroundColor: "#FFFFFF",
    fontWeight: "600",
  },
  applyBtn: {
    backgroundColor: "#6B5B95",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  applyText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  couponHint: {
    fontSize: 12,
    color: "#6B5B95",
    marginTop: 8,
    fontStyle: "italic",
    fontWeight: "600",
  },

  // Checkout Button
  checkoutBtn: {
    backgroundColor: "#FF6B9D",
    paddingVertical: 16,
    borderRadius: 15,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 3,
    borderColor: "#2D2D2D",
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.5,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  // Payment Methods
  paymentMethods: {
    borderTopWidth: 2,
    borderTopColor: "#FFD93D",
    borderStyle: "dashed",
    paddingTop: 16,
  },
  paymentTitle: {
    fontSize: 13,
    color: "#6B5B95",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  paymentIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
});