import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const designerProductsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  // Stats Container
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#084F8C",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  // Search
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: "#084F8C",
    borderColor: "#084F8C",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },

  // Products List
  productsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  productThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#084F8C",
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  productDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 21,
  },
  productStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  productActions: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  // =============== FILTER MODAL ===============
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#084F8C",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
  },
  modalOptionActive: {
    backgroundColor: "#DBEAFE",
    borderWidth: 1.5,
    borderColor: "#1E3A8A",
  },
  modalOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  checkIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
  },

  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "flex-end",
  },

  detailModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingTop: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
  },

  dragHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 10,
  },

  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.3,
  },

  modalCloseBtn: {
    padding: 6,
  },

  detailModalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  detailBodyRow: {
    flexDirection: "row",
    gap: 16,
  },

  leftPane: {
    flex: 0.4,
  },

  rightPane: {
    flex: 0.6,
  },

  leftPaneCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  /* IMAGES */
  imageSection: {
    marginBottom: 20,
  },

  detailImagesContainer: {
    marginBottom: 4,
  },

  imageWrapper: {
    marginRight: 14,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },

  detailImage: {
    width: "100%",
    height: 240,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },

  thumbsContainer: {
    marginTop: 12,
  },

  thumbWrapper: {
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  thumbImage: {
    width: 72,
    height: 72,
    backgroundColor: "#F3F4F6",
  },

  heroPlaceholder: {
    height: 240,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  /* INFO CARD */
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 26,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  detailSection: {
    marginBottom: 22,
  },

  detailRow: {
    flexDirection: "row",
    gap: 18,
    marginBottom: 20,
  },

  detailCol: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 22,
  },

  /* STATUS */
  statusBadgeLarge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },

  statusTextLarge: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  /* DESIGNER */
  designerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  designerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  designerDetails: {
    flex: 1,
  },

  designerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  designerEmail: {
    fontSize: 13,
    color: "#64748B",
  },

  /* ITEMS */
  itemsCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  itemsCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  /* ACTION BUTTONS */
  detailActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  detailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
    elevation: 3,

    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },

  detailButtonEdit: {
    backgroundColor: "#1E3A8A",
  },

  detailButtonToggle: {
    backgroundColor: "#0D9488",
  },

  detailButtonDelete: {
    backgroundColor: "#DC2626",
  },

  detailButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
