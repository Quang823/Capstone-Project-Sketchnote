import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const walletStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    fontSize: 16,
    color: "#60A5FA",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
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
    gap: 16,
    marginBottom: 24,
    height: 220,
  },

  // Left Card - Balance
  balanceInfoCard: {
    flex: 1,
    backgroundColor: "#084F8C",
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  balanceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#E0E7FF",
    fontWeight: "600",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 8,
    letterSpacing: -0.5,
  },
  walletIconLarge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backdropFilter: "blur(10px)",
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
    color: "#C8D7FF",
    marginBottom: 4,
  },
  miniStatValue: {
    fontSize: 15,
    color: "#A5F3FC",
    fontWeight: "700",
  },
  miniStatValueNegative: {
    fontSize: 15,
    color: "#FCA5A5",
    fontWeight: "700",
  },
  miniStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 12,
  },

  depositButtonNew: {
    backgroundColor: "#60A5FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
    gap: 8,
    shadowColor: "#60A5FA",
    shadowOpacity: 0.4,
    elevation: 8,
  },
  depositButtonTextNew: {
    color: "#FFFFFF",
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
    backgroundColor: "rgba(8, 79, 140, 0.65)",
    justifyContent: "flex-end",
    padding: 20,
  },
  imageText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  imageSubtext: {
    fontSize: 12,
    color: "#C8D7FF",
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  // Empty State
  emptyState: {
    alignItems: "center",
    padding: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyStateIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
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
  amountInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#1E293B",
    fontWeight: "600",
    backgroundColor: "#F8FAFC",
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

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "700",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#60A5FA",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#60A5FA",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
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
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3B82F6",
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
