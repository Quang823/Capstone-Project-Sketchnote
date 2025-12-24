import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  headerBackground: "rgba(255,255,255,0.96)",
  primaryBlue: "#084F8C",
  primaryWhite: "#0F172A",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  borderColor: "#E2E8F0",
  dividerColor: "#E0E7FF",
  shadowColor: "#000",
  filterButtonBg: "#F1F5F9",
  filterButtonBorder: "#E2E8F0",
  filterButtonActiveBg: "#084F8C",
  filterButtonActiveText: "#FFFFFF",
  filterButtonText: "#64748B",
  emptyIconColor: "#CBD5E1",
  loadingColor: "#084F8C",
  cardBorder: "#E2E8F0",
  badgeBg: "#E0F2FE",
  badgeText: "#084F8C",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  headerBackground: "rgba(30,41,59,0.96)",
  primaryBlue: "#60A5FA",
  primaryWhite: "#FFFFFF",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderColor: "#334155",
  dividerColor: "#334155",
  shadowColor: "#000",
  filterButtonBg: "#1E293B",
  filterButtonBorder: "#334155",
  filterButtonActiveBg: "#60A5FA",
  filterButtonActiveText: "#FFFFFF",
  filterButtonText: "#94A3B8",
  emptyIconColor: "#475569",
  loadingColor: "#60A5FA",
  cardBorder: "#334155",
  badgeBg: "#1E3A5F",
  badgeText: "#60A5FA",
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
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.06,
      shadowRadius: 8,
      elevation: 4,
      paddingTop: 40,
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
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.filterButtonBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    // Filter Section
    filterContainer: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    filterScroll: {
      flexDirection: "row",
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.filterButtonBg,
      borderWidth: 1,
      borderColor: colors.filterButtonBorder,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    filterButtonActive: {
      backgroundColor: colors.filterButtonActiveBg,
      borderColor: colors.filterButtonActiveBg,
    },
    filterButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.filterButtonText,
    },
    filterButtonTextActive: {
      color: colors.filterButtonActiveText,
    },

    // Content
    content: {
      flex: 1,
      padding: 16,
    },
    scrollContent: {
      paddingBottom: 20,
    },

    // Grid
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      gap: 12,
    },

    // Card
    card: {
      width: (SCREEN_WIDTH - 80) / 4,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardImage: {
      width: "100%",
      height: 180,
      backgroundColor: colors.borderColor,
    },
    cardContent: {
      padding: 12,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 2,
    },
    cardSubtitle: {
      fontSize: 10,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardDate: {
      fontSize: 11,
      color: colors.textMuted,
    },
    cardBadge: {
      backgroundColor: colors.badgeBg,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    cardBadgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.badgeText,
    },
    cardActions: {
      flexDirection: "row",
      gap: 4,
      marginTop: 6,
    },
    cardActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: colors.filterButtonBg,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    cardActionButtonPrimary: {
      backgroundColor: colors.primaryBlue,
      borderColor: colors.primaryBlue,
    },
    cardActionText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    cardActionTextPrimary: {
      color: "#FFFFFF",
    },

    // Empty State
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
    emptyIconColor: colors.emptyIconColor,

    // Loading
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 12,
    },
    loadingColor: colors.loadingColor,

    // Stats Section
    statsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.borderColor,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.primaryWhite,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
    },

    // Colors for inline use
    primaryBlue: colors.primaryBlue,
    textMuted: colors.textMuted,
    textSecondary: colors.textSecondary,

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContainer: {
      width: "95%",
      maxWidth: 900,
      maxHeight: "90%",
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    modalContent: {
      padding: 24,
    },
    modalImage: {
      width: "100%",
      height: 200,
      borderRadius: 16,
      marginBottom: 20,
      backgroundColor: colors.borderColor,
    },
    modalSection: {
      marginBottom: 20,
    },
    modalSectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    modalDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    modalInfoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    modalInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.filterButtonBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    modalInfoText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    modalFooter: {
      flexDirection: "row",
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    modalButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.filterButtonBg,
    },
    modalButtonPrimary: {
      backgroundColor: colors.primaryBlue,
    },
    modalButtonText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    modalButtonTextPrimary: {
      color: "#FFFFFF",
    },
    itemsScroll: {
      marginTop: 12,
    },
    itemThumbnail: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 10,
      backgroundColor: colors.borderColor,
    },
  });
};

export default getStyles;
