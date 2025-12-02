import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const walletStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  historyButton: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },

  // Balance Card (designer-like)
  walletOverview: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    height: 250,
  },

  // Left Card - Balance
  balanceInfoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF", // đổi sang trắng
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#084F8C", // đổi màu chữ
    fontWeight: "700",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#084F8C", // đổi màu chữ
    marginTop: 8,
    letterSpacing: -0.5,
  },
  walletIconLarge: {
    alignItems: "center",
    justifyContent: "center",
  },

  walletLabel: {
    fontSize: 16,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    marginTop: -4,
  },

  miniStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  miniStat: {
    flex: 1,
  },
  miniStatLabel: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 15,
    color: "#084F8C",
    fontWeight: "700",
  },
  miniStatValueNegative: {
    fontSize: 15,
    color: "#EF4444",
    fontWeight: "700",
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.31)", // màu xám nhạt
    marginHorizontal: 12,
    height: "80%", // cho đẹp, không full 100%
    alignSelf: "center",
  },

  depositButtonNew: {
    backgroundColor: "#084F8C", // đổi sang xanh đậm
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#084F8C",
    shadowOpacity: 0.3,
    elevation: 8,
    marginTop: 12,
    width: "50%",
    alignSelf: "center",
  },
  depositButtonTextNew: {
    color: "#FFFFFF", // chữ trắng
    fontSize: 15,
    fontWeight: "700",
  },

  // Right Card - Image
  imageCard: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  decorativeImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(33, 78, 118, 0.65)",
    justifyContent: "flex-end",
    padding: 20,
  },
  imageText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  imageSubtext: {
    fontSize: 15,
    color: "#e5ecffff",
    marginTop: 4,
    fontWeight: "500",
  },

  // Transaction History
  historySection: {
    marginBottom: 20,
  },
  historySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#dcdcdcff",
  },
  viewAllText: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#084F8C",
    letterSpacing: -0.3,
  },
  transactionCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // Transaction Item
  transactionItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
    position: "relative",
  },
  transactionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 4,
  },
  transactionIconText: {
    fontSize: 22,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  depositAmount: {
    color: "#10B981",
  },
  purchaseAmount: {
    color: "#EF4444",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
    borderWidth: 2,
    borderColor: "#E0E7FF",
    shadowColor: "#084F8C",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  modalBody: {
    maxHeight: "100%",
  },
  modalCloseButton: {
    fontSize: 24,
    color: "#64748B",
  },

  // Amount Section
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: "#1E293B",
    fontWeight: "700",
    marginRight: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    backgroundColor: "transparent",
    flex: 1,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickAmountButtonActive: {
    backgroundColor: "#60A5FA",
    borderColor: "#60A5FA",
  },
  quickAmountText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  quickAmountTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Payment Section
  paymentSection: {
    marginBottom: 24,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  selectedPaymentMethod: {
    borderColor: "#60A5FA",
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "700",
    marginBottom: 2,
  },
  paymentFee: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },

  modalFooterNew: {
    flexDirection: "row",
    justifyContent: "center", // canh giữa
    paddingHorizontal: 20,
    gap: 60, // khoảng cách giữa 2 nút
  },

  buttonNew: {
    width: "28%", // mỗi nút khoảng 50%
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonNew: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  confirmButtonNew: {
    backgroundColor: "#084F8C",
    shadowColor: "#084F8C",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonTextNew: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionCode: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 120,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  balanceAfter: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
