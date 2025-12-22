import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  headerBackground: "rgba(255,255,255,0.96)",
  primaryBlue: "#084F8C",
  accentBlue: "#3B82F6",
  darkBlue: "#1E3A8A",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  borderColor: "#E2E8F0",
  inputBackground: "#F3F4F6",
  inputBorder: "#E5E7EB",
  shadowColor: "#000",
  filterTabBg: "#F3F4F6",
  filterTabActiveBg: "#084F8C",
  modalOverlay: "rgba(15, 23, 42, 0.6)",
  modalBackground: "#FFFFFF",
  modalHeaderBg: "#F8FAFC",
  modalOptionBg: "#F8FAFC",
  modalOptionActiveBg: "#DBEAFE",
  modalIconWrapperBg: "#DBEAFE",
  checkIconBg: "#1E3A8A",
  dragHandleColor: "#CBD5E1",
  emptyIconColor: "#D1D5DB",
  paginationBg: "#E5E7EB",
  paginationActiveBg: "#3B82F6",
  productCardBg: "#FFFFFF",
  statCardBg: "#FFFFFF",
  statusBadgeBg: "#EFF6FF",
  infoCardBg: "#FFFFFF",
  leftPaneCardBg: "#F8FAFC",
  designerInfoBg: "#FFFFFF",
  itemsCounterBg: "#FFFFFF",
  cancelButtonBg: "#F9FAFB",
  cancelButtonBorder: "#E5E7EB",
  cancelButtonText: "#6B7280",
  iconColor: "#6B7280",
  iconColorActive: "#084F8C",
  placeholderBg: "#F3F4F6",
  actionButtonBg: "#E0F2FE",
  actionButtonText: "#0284C7",
  actionButtonTextColor: "#084F8C",
  archiveButtonBg: "#FEF3C7",
  archiveButtonText: "#B45309",
  unarchiveButtonBg: "#E0E7FF",
  unarchiveButtonText: "#4338CA",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  headerBackground: "rgba(30,41,59,0.96)",
  primaryBlue: "#60A5FA",
  accentBlue: "#3B82F6",
  darkBlue: "#60A5FA",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderColor: "#334155",
  inputBackground: "#0F172A",
  inputBorder: "#334155",
  shadowColor: "#000",
  filterTabBg: "#1E293B",
  filterTabActiveBg: "#3B82F6",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  modalBackground: "#1E293B",
  modalHeaderBg: "#0F172A",
  modalOptionBg: "#0F172A",
  modalOptionActiveBg: "#1E3A5F",
  modalIconWrapperBg: "#1E3A5F",
  checkIconBg: "#3B82F6",
  dragHandleColor: "#475569",
  emptyIconColor: "#475569",
  paginationBg: "#334155",
  paginationActiveBg: "#3B82F6",
  productCardBg: "#1E293B",
  statCardBg: "#1E293B",
  statusBadgeBg: "#1E3A5F",
  infoCardBg: "#0F172A",
  leftPaneCardBg: "#0F172A",
  designerInfoBg: "#0F172A",
  itemsCounterBg: "#0F172A",
  cancelButtonBg: "#334155",
  cancelButtonBorder: "#475569",
  cancelButtonText: "#94A3B8",
  iconColor: "#94A3B8",
  iconColorActive: "#60A5FA",
  placeholderBg: "#334155",
  actionButtonBg: "#1E3A5F",
  actionButtonText: "#60A5FA",
  actionButtonTextColor: "#FFFFFF",
  archiveButtonBg: "#451a03",
  archiveButtonText: "#fbbf24",
  unarchiveButtonBg: "#1e1b4b",
  unarchiveButtonText: "#818cf8",
};

const getStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 4,
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
      color: theme === "dark" ? "#FFFFFF" : colors.primaryBlue,
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
      backgroundColor: colors.cardBackground,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
    },

    // Stats Container
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      marginHorizontal: 6,
      backgroundColor: colors.statCardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primaryBlue,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "center",
    },

    // Search
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.cardBackground,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
    },
    searchInput: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: colors.textPrimary,
    },

    // Filter Tabs
    filterTabs: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    filterTab: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 12,
      backgroundColor: colors.filterTabBg,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    filterTabActive: {
      backgroundColor: colors.filterTabActiveBg,
      borderColor: colors.filterTabActiveBg,
      shadowOpacity: theme === "dark" ? 0.4 : 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
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
    productCardContainer: {
      backgroundColor: colors.productCardBg,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 4,
    },
    productContentRow: {
      flexDirection: "row",
      gap: 12,
    },
    productThumbnailImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: colors.placeholderBg,
    },
    productThumbnailPlaceholder: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: colors.placeholderBg,
      alignItems: "center",
      justifyContent: "center",
    },
    productInfoColumn: {
      flex: 1,
    },
    productHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    productTitleText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    statusBadgeContainer: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    statusBadgeText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "600",
    },
    productDescriptionText: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 18,
    },
    metricsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metricItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    metricText: {
      fontSize: 12,
      color: colors.textPrimary,
      fontWeight: "600",
    },
    metricTextSecondary: {
      fontSize: 12,
      color: colors.textPrimary,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    typeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    typeText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    actionButtonsRow: {
      flexDirection: "row",
      gap: 8,
    },
    actionButtonContainer: {
      backgroundColor: colors.actionButtonBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionButtonText: {
      fontSize: 11,
      color: colors.actionButtonTextColor,
      fontWeight: "600",
    },
    archiveButtonContainer: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    archiveButtonText: {
      fontSize: 11,
      fontWeight: "600",
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
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
    },
    emptyIconColor: colors.emptyIconColor,

    // =============== FILTER MODAL ===============
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.modalBackground,
      borderRadius: 20,
      width: "100%",
      maxWidth: 400,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme === "dark" ? 0.5 : 0.25,
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
      borderBottomColor: colors.borderColor,
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
      backgroundColor: colors.modalIconWrapperBg,
      justifyContent: "center",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primaryBlue,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
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
      backgroundColor: colors.modalOptionBg,
    },
    modalOptionActive: {
      backgroundColor: colors.modalOptionActiveBg,
      borderWidth: 1.5,
      borderColor: colors.primaryBlue,
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
      color: colors.textPrimary,
    },
    checkIconWrapper: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.checkIconBg,
      justifyContent: "center",
      alignItems: "center",
    },

    detailModalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },

    detailModalContent: {
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: "92%",
      paddingTop: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: theme === "dark" ? 0.5 : 0.18,
      shadowRadius: 18,
      elevation: 14,
      width: "100%",
    },

    dragHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.dragHandleColor,
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
      borderBottomColor: colors.borderColor,
      backgroundColor: colors.modalHeaderBg,
    },

    detailModalBody: {
      flexShrink: 1,
      flexGrow: 0,
    },

    detailModalContentContainer: {
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
      backgroundColor: colors.leftPaneCardBg,
      borderRadius: 18,
      padding: 12,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.06,
      shadowRadius: 10,
      elevation: 3,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
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
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.4 : 0.12,
      shadowRadius: 10,
      elevation: 4,
    },

    detailImage: {
      width: "100%",
      height: 240,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
    },

    thumbsContainer: {
      marginTop: 12,
    },

    thumbWrapper: {
      marginRight: 10,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    thumbImage: {
      width: 72,
      height: 72,
      backgroundColor: colors.inputBackground,
    },

    heroPlaceholder: {
      height: 240,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      alignItems: "center",
      justifyContent: "center",
    },

    /* INFO CARD */
    infoCard: {
      backgroundColor: colors.infoCardBg,
      borderRadius: 20,
      padding: 18,
      marginBottom: 26,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
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
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },

    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
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
      backgroundColor: colors.designerInfoBg,
      padding: 14,
      borderRadius: 14,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    designerAvatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.modalIconWrapperBg,
      justifyContent: "center",
      alignItems: "center",
    },

    designerDetails: {
      flex: 1,
    },

    designerName: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textPrimary,
    },

    designerEmail: {
      fontSize: 13,
      color: colors.textSecondary,
    },

    /* ITEMS */
    itemsCounter: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.itemsCounterBg,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      gap: 8,
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    itemsCountText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primaryBlue,
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
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme === "dark" ? 0.4 : 0.18,
      shadowRadius: 8,
    },

    detailButtonEdit: {
      backgroundColor: colors.primaryBlue,
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

    // =============== CONFIRMATION MODAL STYLES ===============
    modalIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.statusBadgeBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.4 : 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    modalMessage: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
      paddingHorizontal: 8,
    },
    modalButtons: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      paddingTop: 8,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.cancelButtonBorder,
      alignItems: "center",
      backgroundColor: colors.cancelButtonBg,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.cancelButtonText,
    },
    confirmButton: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.4 : 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    confirmButtonGradient: {
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: "white",
      letterSpacing: 0.3,
    },

    // Pagination
    paginationContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 16,
    },
    paginationButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginHorizontal: 4,
    },
    paginationButtonDisabled: {
      backgroundColor: colors.paginationBg,
    },
    paginationButtonActive: {
      backgroundColor: colors.paginationActiveBg,
    },
    paginationText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    paginationButtonText: {
      color: "#FFFFFF",
    },
    paginationButtonPrev: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.paginationBg,
      borderRadius: 8,
      marginRight: 8,
    },
    paginationButtonNext: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.paginationBg,
      borderRadius: 8,
      marginLeft: 8,
    },
    paginationButtonTextPrimary: {
      color: "#FFFFFF",
    },

    // =============== DETAIL MODAL STYLES ===============
    detailImageGallery: {
      marginBottom: 20,
    },
    imageGalleryScroll: {
      marginBottom: 8,
    },
    detailGalleryImage: {
      width: 280,
      height: 200,
      borderRadius: 16,
      marginRight: 12,
      backgroundColor: colors.inputBackground,
    },
    detailProductName: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    detailStatusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    detailSectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    detailText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    detailGridItem: {
      width: "48%",
      marginBottom: 12,
    },

    // Version Card Styles
    versionCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    versionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    versionNumber: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    versionStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
    },
    versionStatusText: {
      color: "#FFF",
      fontSize: 11,
      fontWeight: "600",
    },
    versionDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    versionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 12,
      lineHeight: 18,
    },
    versionActions: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    versionActionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    versionActionText: {
      fontSize: 12,
      fontWeight: "600",
    },

    // Detail Action Buttons
    detailActionButton: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme === "dark" ? 0.4 : 0.15,
      shadowRadius: 8,
      elevation: 3,
    },
    detailActionGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      gap: 8,
    },
    detailActionText: {
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.3,
    },

    // Colors for inline use
    primaryBlue: colors.primaryBlue,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textMuted: colors.textMuted,
    borderColor: colors.borderColor,
    cardBackground: colors.cardBackground,
    inputBackground: colors.inputBackground,
    iconColor: colors.iconColor,
    iconColorActive: colors.iconColorActive,
    actionButtonText: colors.actionButtonText,
    actionButtonTextColor: colors.actionButtonTextColor,
    archiveButtonText: colors.archiveButtonText,
    unarchiveButtonText: colors.unarchiveButtonText,
    archiveButtonBg: colors.archiveButtonBg,
    unarchiveButtonBg: colors.unarchiveButtonBg,
  });
};

export default getStyles;
