import { StyleSheet } from "react-native";

// Light theme colors
const lightColors = {
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  headerBackground: "#FFFFFF",
  primaryBlue: "#084F8C",
  primaryWhite: "#084F8C",
  accentBlue: "#3B82F6",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  borderColor: "#E2E8F0",
  dividerColor: "#E0E7FF",
  inputBackground: "#F8FAFF",
  shadowColor: "#000",
  actionCircleBg: "#EFF6FF",
  actionItemBg: "#F8FAFF",
  quickAmountBg: "#F1F5FF",
  quickAmountBorder: "#E0E7FF",
  noteBackground: "#F1F5FF",
  noteBorder: "#E0E7FF",
  modalOverlay: "rgba(0,0,0,0.45)",
  modalBackground: "#FFFFFF",
  modalHeaderBorder: "#E6E9F5",
  bankSelectorBg: "#F8FAFC",
  bankItemBg: "#FFFFFF",
  bankItemSelectedBg: "#DBEAFE",
  bankItemBorder: "#E2E8F0",
  bankItemSelectedBorder: "#3B82F6",
  searchInputBg: "#FFFFFF",
  searchInputBorder: "#E2E8F0",
  tabActiveBg: "#3B82F6",
  tabInactiveBg: "#F1F5F9",
  tabActiveText: "#FFFFFF",
  tabInactiveText: "#64748B",
  emptyIconColor: "#CBD5E1",
  viewAllBg: "#F1F5F9",
  viewAllBorder: "#dcdcdcff",
  alertOverlay: "rgba(0, 0, 0, 0.5)",
  alertBackground: "#FFFFFF",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  headerBackground: "#1E293B",
  primaryBlue: "#60A5FA",
  primaryWhite: "#FFFFFF",
  accentBlue: "#3B82F6",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderColor: "#334155",
  dividerColor: "#334155",
  inputBackground: "#0F172A",
  shadowColor: "#000",
  actionCircleBg: "#1E3A5F",
  actionItemBg: "#1E293B",
  quickAmountBg: "#1E3A5F",
  quickAmountBorder: "#334155",
  noteBackground: "#1E3A5F",
  noteBorder: "#334155",
  modalOverlay: "rgba(0,0,0,0.7)",
  modalBackground: "#1E293B",
  modalHeaderBorder: "#334155",
  bankSelectorBg: "#0F172A",
  bankItemBg: "#1E293B",
  bankItemSelectedBg: "#1E3A5F",
  bankItemBorder: "#334155",
  bankItemSelectedBorder: "#3B82F6",
  searchInputBg: "#0F172A",
  searchInputBorder: "#334155",
  tabActiveBg: "#3B82F6",
  tabInactiveBg: "#334155",
  tabActiveText: "#FFFFFF",
  tabInactiveText: "#94A3B8",
  emptyIconColor: "#475569",
  viewAllBg: "#334155",
  viewAllBorder: "#475569",
  alertOverlay: "rgba(0, 0, 0, 0.7)",
  alertBackground: "#1E293B",
};

const getStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      paddingTop: 40,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
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
      color: colors.primaryWhite,
      letterSpacing: -0.5,
    },

    /* TOP 2 COLUMNS */
    topWrapper: { padding: 20 },
    topWrapperRow: {
      flexDirection: "row",
      gap: 20,
    },
    topWrapperLimit: {
      width: "100%",
      alignSelf: "center",
    },

    leftCol: { flex: 1 },
    rightCol: { flex: 1, maxWidth: 450 },

    /* BALANCE CARD */
    balanceCardNew: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 24,
      shadowColor: colors.primaryBlue,
      shadowOpacity: theme === "dark" ? 0.3 : 0.12,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 2,
      borderColor: colors.dividerColor,
      flex: 1,
    },

    balanceLabelNew: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: "600",
    },

    balanceAmountNew: {
      fontSize: 38,
      fontWeight: "800",
      color: colors.primaryWhite,
      marginTop: 6,
    },
    statsRowNew: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.dividerColor,
    },
    statBox: {
      alignItems: "center",
      flex: 1,
      paddingHorizontal: 8,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.dividerColor,
    },
    statValueNew: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primaryWhite,
    },

    balanceHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    walletIconLarge: {
      alignItems: "center",
      justifyContent: "center",
    },

    walletLabel: {
      fontSize: 16,
      fontFamily: "Pacifico-Regular",
      color: colors.primaryWhite,
      marginTop: -4,
    },

    miniStats: {
      flexDirection: "row",
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor:
        theme === "dark" ? colors.borderColor : "rgba(8, 79, 140, 0.1)",
    },

    miniStat: {
      flex: 1,
    },

    miniStatLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },

    miniStatValue: {
      fontSize: 15,
      color: colors.primaryWhite,
      fontWeight: "700",
    },

    miniStatValueNegative: {
      fontSize: 15,
      color: "#EF4444",
      fontWeight: "700",
    },

    miniStatDivider: {
      width: 1,
      backgroundColor:
        theme === "dark" ? colors.borderColor : "rgba(8, 79, 140, 0.15)",
      marginHorizontal: 12,
      height: "80%",
      alignSelf: "center",
    },

    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },

    withdrawButtonNew: {
      flex: 1,
      backgroundColor: colors.primaryBlue,
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      shadowColor: colors.primaryBlue,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },

    withdrawButtonTextNew: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    depositButtonNew: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingVertical: 14,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      borderWidth: 2,
      borderColor: colors.primaryBlue,
      shadowColor: colors.primaryBlue,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },

    depositButtonTextNew: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.primaryWhite,
    },

    /* ACTION CARD */
    actionCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 24,
      shadowColor: colors.primaryBlue,
      shadowOpacity: theme === "dark" ? 0.3 : 0.12,
      shadowRadius: 20,
      elevation: 8,
      borderWidth: 2,
      borderColor: colors.dividerColor,
    },
    actionCardTitle: {
      fontSize: 15,
      color: colors.primaryWhite,
      fontWeight: "600",
      marginBottom: 16,
    },

    actionList: { gap: 16 },
    oneActionItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 5,
      paddingHorizontal: 5,
      borderRadius: 16,
      backgroundColor: colors.actionItemBg,
      shadowColor: colors.shadowColor,
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 2,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
    },

    actionCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.actionCircleBg,
      alignItems: "center",
      justifyContent: "center",
    },
    actionName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primaryWhite,
    },

    /* RECENT TRANSACTIONS */
    historySection: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    historySectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    recentCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      shadowColor: colors.shadowColor,
      shadowOpacity: theme === "dark" ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    recentCardLimit: {
      alignSelf: "center",
      width: "100%",
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primaryWhite,
    },
    transactionCount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "500",
      marginTop: 4,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.viewAllBg,
      borderWidth: 1,
      borderColor: colors.viewAllBorder,
    },
    viewAllText: {
      color: colors.primaryWhite,
      fontSize: 13,
      fontWeight: "600",
      marginRight: 4,
    },

    transactionItemNew: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    transIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      borderWidth: 3,
      borderColor: colors.borderColor,
    },
    transactionTitleNew: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    transactionDateNew: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    transactionAmountNew: {
      fontSize: 16,
      fontWeight: "700",
    },
    transactionRightNew: {
      alignItems: "flex-end",
    },
    transactionBalanceNew: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    statusBadgeNew: {
      marginTop: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    statusTextNew: {
      fontSize: 11,
      fontWeight: "600",
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
    },

    modalContent: {
      backgroundColor: colors.modalBackground,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      maxHeight: "92%",
      paddingBottom: 10,
      shadowColor: colors.primaryBlue,
      shadowOpacity: 0.15,
      shadowRadius: 25,
      elevation: 12,
      borderWidth: 1,
      borderColor: colors.dividerColor,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.modalHeaderBorder,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.primaryWhite,
    },

    modalBody: {
      padding: 15,
      paddingBottom: 0,
    },

    /* INPUT LABEL */
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 6,
    },

    /* AMOUNT INPUT */
    amountInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 56,
      paddingHorizontal: 18,
      borderWidth: 1.5,
      borderColor: colors.borderColor,
      backgroundColor: colors.inputBackground,
      borderRadius: 16,
    },
    currencySymbol: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.textPrimary,
      marginRight: 10,
    },
    amountInput: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      padding: 0,
    },

    /* QUICK AMOUNTS */
    quickAmountsNew: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 4,
    },
    quickAmountButtonNew: {
      backgroundColor: colors.quickAmountBg,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.quickAmountBorder,
    },
    quickAmountTextNew: {
      color: colors.primaryWhite,
      fontWeight: "700",
      fontSize: 14,
    },

    /* BANK GRID */
    bankGrid: {
      flexDirection: "row",
      gap: 12,
      marginTop: 12,
    },
    bankGridItem: {
      flex: 1,
    },
    bankInfoLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 6,
      fontWeight: "600",
    },
    bankInfoInputNew: {
      backgroundColor: colors.inputBackground,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1.5,
      borderColor: colors.borderColor,
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    /* NOTE BOX */
    noteContainerNew: {
      flexDirection: "row",
      backgroundColor: colors.noteBackground,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.noteBorder,
    },
    noteTextNew: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      fontWeight: "500",
    },

    /* FOOTER */
    modalFooterNew: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 24,
      gap: 60,
      borderTopWidth: 1,
      borderTopColor: colors.modalHeaderBorder,
      backgroundColor: colors.modalBackground,
    },

    buttonNew: {
      width: "28%",
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    cancelButtonNew: {
      backgroundColor: colors.viewAllBg,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    confirmButtonNew: {
      backgroundColor: colors.primaryBlue,
      shadowColor: colors.primaryBlue,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 6,
    },

    buttonTextNew: {
      fontSize: 16,
      fontWeight: "700",
    },

    // Deposit Modal Styles
    amountSection: {
      marginBottom: 24,
    },
    amountLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 10,
    },
    quickAmounts: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    quickAmountButton: {
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    quickAmountButtonActive: {
      backgroundColor: colors.accentBlue,
      borderColor: colors.accentBlue,
    },
    quickAmountText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    quickAmountTextActive: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    paymentSection: {
      marginBottom: 24,
    },
    paymentLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
    },
    paymentMethod: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderColor,
      backgroundColor: colors.cardBackground,
    },
    selectedPaymentMethod: {
      borderColor: colors.accentBlue,
      backgroundColor: theme === "dark" ? "#1E3A5F" : "#EFF6FF",
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
      color: colors.textPrimary,
      fontWeight: "700",
      marginBottom: 2,
    },
    paymentFee: {
      fontSize: 12,
      color: "#10B981",
      fontWeight: "600",
    },

    // Bank selector styles for JSX
    bankSelectorContainer: {
      backgroundColor: colors.bankSelectorBg,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      maxHeight: 300,
    },
    bankSearchInput: {
      backgroundColor: colors.searchInputBg,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.searchInputBorder,
      marginBottom: 8,
      color: colors.textPrimary,
    },
    bankItemContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.bankItemBg,
      borderRadius: 8,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: colors.bankItemBorder,
    },
    bankItemSelected: {
      backgroundColor: colors.bankItemSelectedBg,
      borderColor: colors.bankItemSelectedBorder,
    },
    bankItemName: {
      fontWeight: "600",
      fontSize: 14,
      color: colors.textPrimary,
    },
    bankItemFullName: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    tabContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    tabButtonActive: {
      backgroundColor: colors.tabActiveBg,
    },
    tabButtonInactive: {
      backgroundColor: colors.tabInactiveBg,
    },
    tabButtonText: {
      fontWeight: "600",
      fontSize: 13,
    },
    tabButtonTextActive: {
      color: colors.tabActiveText,
    },
    tabButtonTextInactive: {
      color: colors.tabInactiveText,
    },
    savedAccountEmpty: {
      textAlign: "center",
      color: colors.textMuted,
      padding: 20,
    },
    // Save bank account checkbox styles
    saveAccountOption: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.accentBlue,
      marginRight: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxChecked: {
      backgroundColor: colors.accentBlue,
      borderColor: colors.accentBlue,
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.textPrimary,
      flex: 1,
      fontWeight: "500",
    },
  });
};

// Alert Modal Styles - exported separately
export const getAlertStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    alertOverlay: {
      flex: 1,
      backgroundColor: colors.alertOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    alertContainer: {
      backgroundColor: colors.alertBackground,
      borderRadius: 24,
      padding: 32,
      width: "100%",
      maxWidth: 400,
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: theme === "dark" ? 1 : 0,
      borderColor: colors.borderColor,
    },
    alertIconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    alertTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 12,
      textAlign: "center",
    },
    alertMessage: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 28,
    },
    alertButton: {
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 12,
      width: "100%",
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    alertButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });
};

export default getStyles;
