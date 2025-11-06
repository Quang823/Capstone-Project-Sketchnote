import { StyleSheet, Dimensions } from "react-native";
const screenWidth = Dimensions.get("window").width;

export const cartStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Header
  header: {
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  continueText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  shopNowBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopNowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignSelf: "flex-start",
    width: screenWidth > 800 ? "auto" : "100%",
  },

  // Cart Item
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 16,
    position: "relative",
  },
  itemImg: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 18,
  },
  typeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4F46E5",
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
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#10B981",
  },
  removeBtn: {
    position: "absolute",
    top: 16,
    right: 0,
    padding: 8,
  },

  // Order Summary
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4F46E5",
  },

  // Discount
  discountRow: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  discountLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
  },
  discountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
  },

  // Coupon
  couponSection: {
    marginBottom: 20,
  },
  couponTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  applyBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  applyText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  couponHint: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    fontStyle: "italic",
  },

  // Checkout Button
  checkoutBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Payment Methods
  paymentMethods: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  paymentTitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center",
  },
  paymentIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
});