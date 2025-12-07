// DesignerAnalyticsScreen.styles.js
import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
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
  // Content
  content: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "500",
  },

  // Filter Section với glass effect
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  filterButtons: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    gap: 6,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "#0c5da4ff",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
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
    color: "#94A3B8",
    marginTop: 12,
    fontWeight: "500",
  },

  // Date Range Picker với blue accent
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E1E8ED",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  // Overview Grid với gradient cards
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 24,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - 54) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    color: "#64748B",
    letterSpacing: 0.2,
  },
  overviewNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
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
    color: "#94A3B8",
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
    color: "#1E293B",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Chart Card với enhanced shadow
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E1E8ED",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    backgroundColor: "#EFF6FF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
  },
  chartInsightCardSecondary: {
    backgroundColor: "#F0F9FF",
    borderColor: "#E0F2FE",
  },
  chartInsightLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0c5da4ff",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chartInsightLabelSecondary: {
    color: "#0369A1",
  },
  chartInsightValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  chartInsightSub: {
    fontSize: 12,
    color: "#64748B",
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
    borderBottomColor: "#F1F5F9",
  },
  chartLegendLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chartLegendLabel: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  chartLegendValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
  },

  // Top Products với modern design
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8ED",
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  productRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#DBEAFE",
  },
  productRankText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3B82F6",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
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
    color: "#64748B",
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

  // Custom colors cho overview cards
  cardOrange: {
    backgroundColor: "#0c5da4ff",
  },
  cardGreen: {
    backgroundColor: "#1983e1ff",
  },
});