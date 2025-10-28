import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const designerAnalyticsStyles = StyleSheet.create({
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Time Range
  timeRangeContainer: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  timeRangeTabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  timeRangeTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRangeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  timeRangeTabTextActive: {
    color: "#1F2937",
  },

  // Overview
  overviewContainer: {
    marginBottom: 32,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  overviewCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  overviewGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  overviewNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  overviewLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",
  },

  // Metrics
  metricsContainer: {
    marginBottom: 32,
  },
  metricCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 8,
  },
  metricGrowth: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricGrowthText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  metricPrevious: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Top Products
  topProductsContainer: {
    marginBottom: 32,
  },
  topProductCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  topProductRankText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
  },
  topProductInfo: {
    flex: 1,
  },
  topProductTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  topProductStats: {
    flexDirection: "row",
  },
  topProductStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  topProductStatText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  topProductGrowth: {
    flexDirection: "row",
    alignItems: "center",
  },
  topProductGrowthText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Chart
  chartContainer: {
    marginBottom: 32,
  },
  chart: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
  },
  chartBarFill: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
    minHeight: 20,
  },
  chartBarLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  chartBarValue: {
    fontSize: 10,
    color: "#1F2937",
    fontWeight: "600",
  },
});
