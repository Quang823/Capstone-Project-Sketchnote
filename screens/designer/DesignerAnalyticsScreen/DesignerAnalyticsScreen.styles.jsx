// DesignerAnalyticsScreen.styles.js
import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    letterSpacing: -0.3,
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
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Time Range
  timeRangeContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  timeRangeTabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  timeRangeTabActive: {
    backgroundColor: "#6366F1",
  },
  timeRangeTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  timeRangeTabTextActive: {
    color: "#FFFFFF",
  },

  // Overview Grid
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  overviewCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  overviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  overviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  overviewGrowth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },
  overviewSubtext: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // Chart
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },
  chartBarValue: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  chartBarFill: {
    width: "80%",
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    color: "#9CA3AF",
  },

  // Top Products
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productRankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6366F1",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  productStats: {
    flexDirection: "row",
    gap: 12,
  },
  productStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productStatText: {
    fontSize: 12,
    color: "#6B7280",
  },
  productGrowth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 12,
  },
  productGrowthText: {
    fontSize: 12,
    fontWeight: "600",
  },
});