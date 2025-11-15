import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const styles = StyleSheet.create({
  // Loading & Error States
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: isTablet ? 18 : 16,
    color: "#64748B",
    fontWeight: "600",
  },
  errorText: {
    fontSize: isTablet ? 18 : 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    maxWidth: 500,
  },

  // Main Layout
  gradient: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  container: {
    padding: isTablet ? 40 : 20,
    paddingTop: isTablet ? 60 : 40,
    maxWidth: isTablet ? 900 : 600,
    alignSelf: "center",
    width: "100%",
  },

  // Success Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 24 : 16,
    padding: isTablet ? 40 : 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  
  // Dynamic Titles
  titleSuccess: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: "700",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  titleFailed: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: "700",
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  titlePending: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: "700",
    color: "#F59E0B",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  // Info Box
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 28 : 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoRow: {
    flexDirection: isTablet ? "row" : "column",
    justifyContent: isTablet ? "space-between" : "flex-start",
    alignItems: isTablet ? "center" : "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2FE",
  },
  label: {
    fontSize: isTablet ? 16 : 14,
    color: "#475569",
    fontWeight: "600",
    marginBottom: isTablet ? 0 : 6,
    minWidth: isTablet ? 160 : "auto",
  },
  value: {
    fontSize: isTablet ? 18 : 16,
    color: "#1E293B",
    fontWeight: "700",
  },

  // Status Badges
  statusBadge: {
    paddingHorizontal: isTablet ? 20 : 14,
    paddingVertical: isTablet ? 10 : 8,
    borderRadius: isTablet ? 10 : 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    marginTop: isTablet ? 0 : 4,
  },
  statusSuccess: {
    backgroundColor: "#D1FAE5",
    borderColor: "#6EE7B7",
  },
  statusFailed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
  },
  statusText: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: "700",
  },
  statusTextSuccess: {
    color: "#059669",
  },
  statusTextFailed: {
    color: "#DC2626",
  },
  statusTextPending: {
    color: "#D97706",
  },

  // Warning Box
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: isTablet ? 14 : 12,
    padding: isTablet ? 20 : 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  warningText: {
    fontSize: isTablet ? 16 : 14,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: isTablet ? 24 : 20,
    textAlign: "center",
  },

  // Items Section
  itemsSection: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: isTablet ? 26 : 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  itemsGrid: {
    flexDirection: isTablet ? "row" : "column",
    flexWrap: isTablet ? "wrap" : "nowrap",
    gap: isTablet ? 16 : 0,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 24 : 18,
    marginBottom: isTablet ? 0 : 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? "45%" : "100%",
    maxWidth: isTablet ? "48%" : "100%",
  },
  itemName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    lineHeight: isTablet ? 26 : 22,
  },
  itemDesc: {
    fontSize: isTablet ? 15 : 13,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
    lineHeight: isTablet ? 22 : 18,
  },
  itemPrice: {
    fontSize: isTablet ? 20 : 17,
    fontWeight: "700",
    color: "#3B82F6",
  },

  // Buttons
  buttonContainer: {
    flexDirection: isTablet ? "row" : "column",
    gap: isTablet ? 16 : 12,
    marginTop: 8,
  },
  button: {
    paddingVertical: isTablet ? 18 : 16,
    borderRadius: isTablet ? 14 : 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    flex: isTablet ? 1 : undefined,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
  },
  retryButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  buttonText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});