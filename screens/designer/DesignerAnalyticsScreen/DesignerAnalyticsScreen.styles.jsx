import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
  background: "#F0F4F8",
  cardBackground: "#FFFFFF",
  headerBackground: "#FFFFFF",
  primaryBlue: "#084F8C",
  accentBlue: "#3B82F6",
  darkBlue: "#1E40AF",
  lightBlue: "#0c5da4ff",
  skyBlue: "#1983e1ff",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  borderColor: "#E2E8F0",
  inputBorder: "#E1E8ED",
  shadowColor: "#000",
  shadowBlue: "#1E40AF",
  filterButtonBg: "transparent",
  filterButtonActiveBg: "#0c5da4ff",
  chartLabelColor: "rgba(71, 85, 105, 1)",
  chartLineColor: "#E2E8F0",
  insightCardBg: "#EFF6FF",
  insightCardBorder: "#DBEAFE",
  insightCardSecondaryBg: "#F0F9FF",
  insightCardSecondaryBorder: "#E0F2FE",
  insightLabelColor: "#0c5da4ff",
  insightLabelSecondaryColor: "#0369A1",
  legendBorderColor: "#F1F5F9",
  productRankBg: "#EFF6FF",
  productRankBorder: "#DBEAFE",
  productRankText: "#3B82F6",
  emptyIconColor: "#CBD5E1",
  loadingColor: "#3B82F6",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  headerBackground: "#1E293B",
  primaryBlue: "#60A5FA",
  accentBlue: "#3B82F6",
  darkBlue: "#60A5FA",
  lightBlue: "#3B82F6",
  skyBlue: "#0EA5E9",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderColor: "#334155",
  inputBorder: "#334155",
  shadowColor: "#000",
  shadowBlue: "#000",
  filterButtonBg: "transparent",
  filterButtonActiveBg: "#3B82F6",
  chartLabelColor: "rgba(148, 163, 184, 1)",
  chartLineColor: "#334155",
  insightCardBg: "#1E3A5F",
  insightCardBorder: "#2563EB",
  insightCardSecondaryBg: "#0F172A",
  insightCardSecondaryBorder: "#334155",
  insightLabelColor: "#60A5FA",
  insightLabelSecondaryColor: "#38BDF8",
  legendBorderColor: "#334155",
  productRankBg: "#1E3A5F",
  productRankBorder: "#3B82F6",
  productRankText: "#60A5FA",
  emptyIconColor: "#475569",
  loadingColor: "#60A5FA",
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
      color: theme === "dark" ? "#FFFFFF" : colors.primaryBlue,
      letterSpacing: -0.5,
    },

    // Content
    content: {
      flex: 1,
    },

    // Loading
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 12,
      fontWeight: "500",
    },
    loadingColor: colors.loadingColor,

    // Filter Section
    filterSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
    },
    filterLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 12,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    filterButtons: {
      flexDirection: "row",
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 6,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      gap: 6,
      shadowColor: colors.shadowBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.03,
      shadowRadius: 4,
      elevation: 2,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      backgroundColor: colors.filterButtonBg,
    },
    filterButtonActive: {
      backgroundColor: colors.filterButtonActiveBg,
      shadowColor: colors.primaryBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    filterButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: "#FFFFFF",
    },

    // Chart States
    chartLoading: {
      height: 240,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyChart: {
      height: 240,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyChartText: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 12,
      fontWeight: "500",
    },
    emptyIconColor: colors.emptyIconColor,

    // Date Range Picker
    dateRangeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    dateButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.cardBackground,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      shadowColor: colors.shadowBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    dateButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
    },

    // Overview Grid
    overviewGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 20,
      gap: 14,
      marginBottom: 24,
    },
    overviewCard: {
      width: (SCREEN_WIDTH - 54) / 2,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      shadowColor: colors.shadowBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    overviewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 8,
    },
    overviewLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      letterSpacing: 0.2,
    },
    overviewNumber: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    overviewFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    overviewGrowth: {
      fontSize: 13,
      fontWeight: "700",
      color: "#10B981",
    },
    overviewSubtext: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: "500",
    },

    // Section
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 16,
      letterSpacing: -0.3,
    },

    // Chart Card
    chartCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      shadowColor: colors.shadowBlue,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    chartInsightRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 16,
    },
    chartInsightCard: {
      flex: 1,
      backgroundColor: colors.insightCardBg,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1.5,
      borderColor: colors.insightCardBorder,
    },
    chartInsightCardSecondary: {
      backgroundColor: colors.insightCardSecondaryBg,
      borderColor: colors.insightCardSecondaryBorder,
    },
    chartInsightLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.insightLabelColor,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    chartInsightLabelSecondary: {
      color: colors.insightLabelSecondaryColor,
    },
    chartInsightValue: {
      fontSize: 19,
      fontWeight: "800",
      color: colors.textPrimary,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    chartInsightSub: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    chartLegendList: {
      marginTop: 16,
      gap: 2,
    },
    chartLegendItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.legendBorderColor,
    },
    chartLegendLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    chartLegendLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "600",
    },
    chartLegendValue: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.darkBlue,
    },

    // Top Products
    productCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.inputBorder,
      shadowColor: colors.shadowBlue,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === "dark" ? 0.3 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    productRank: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.productRankBg,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
      borderWidth: 2,
      borderColor: colors.productRankBorder,
    },
    productRankText: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.productRankText,
    },
    productInfo: {
      flex: 1,
    },
    productTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    productStats: {
      flexDirection: "row",
      gap: 14,
    },
    productStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    productStatText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    productGrowth: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: 12,
    },
    productGrowthText: {
      fontSize: 12,
      fontWeight: "700",
    },

    // Custom colors for overview cards
    cardOrange: {
      backgroundColor: colors.lightBlue,
    },
    cardGreen: {
      backgroundColor: colors.skyBlue,
    },

    // Chart config colors
    chartLabelColor: colors.chartLabelColor,
    chartLineColor: colors.chartLineColor,
    accentBlue: colors.accentBlue,
    primaryBlue: colors.primaryBlue,
    textMuted: colors.textMuted,
    textSecondary: colors.textSecondary,
  });
};

export default getStyles;
