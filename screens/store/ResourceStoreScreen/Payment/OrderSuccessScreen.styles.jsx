import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const styles = StyleSheet.create({
  // Loading & Error States
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    alignItems: "center",
    maxWidth: 400,
  },
  errorIconCircle: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    backgroundColor: "#FEF2F2",
    borderWidth: 3,
    borderColor: "#FCA5A5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: isTablet ? 50 : 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: isTablet ? 18 : 16,
    color: "#1E40AF",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: isTablet ? 18 : 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "600",
    lineHeight: 24,
  },

  // Main layout
  gradient: {
    flex: 1,
  },
  container: {
    padding: isTablet ? 28 : 16,
    paddingTop: isTablet ? 32 : 24,
    maxWidth: isTablet ? 1200 : 700,
    alignSelf: "center",
    width: "100%",
  },

  // Header Card - Redesigned
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: "center",
  },
  iconCircle: {
    width: isTablet ? 70 : 56,
    height: isTablet ? 70 : 56,
    borderRadius: isTablet ? 35 : 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
  },
  iconCircleSuccess: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  iconCircleFailed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  iconCirclePending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  headerIcon: {
    fontSize: isTablet ? 35 : 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Titles
  titleSuccess: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: "800",
    color: "#059669",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  titleFailed: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: "800",
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  titlePending: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: "800",
    color: "#D97706",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: isTablet ? 15 : 13,
    color: "#64748B",
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E0F2FE",
    marginVertical: 12,
  },

  // Total Amount Box
  totalAmountBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: isTablet ? 16 : 14,
    padding: isTablet ? 14 : 12,
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: isTablet ? 13 : 11,
    color: "#0369A1",
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  totalAmount: {
    fontSize: isTablet ? 30 : 26,
    color: "#0C4A6E",
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // Grid layout
  grid: {
    flexDirection: isTablet ? "row" : "column",
    gap: isTablet ? 20 : 12,
  },
  colLeft: {
    flex: 1,
  },
  colRight: {
    flex: 1,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 22 : 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#F0F9FF",
  },
  cardTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: "800",
    color: "#0C4A6E",
    letterSpacing: 0.3,
  },
  itemCount: {
    fontSize: isTablet ? 15 : 13,
    color: "#0369A1",
    fontWeight: "700",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },

  // Info Box
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: isTablet ? 18 : 16,
    padding: isTablet ? 18 : 14,
    borderWidth: 1.5,
    borderColor: "#BAE6FD",
  },
  infoRow: {
    flexDirection: isTablet ? "row" : "column",
    justifyContent: isTablet ? "space-between" : "flex-start",
    alignItems: isTablet ? "center" : "flex-start",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "DBEAFE",
  },
  infoRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  label: {
    fontSize: isTablet ? 15 : 14,
    color: "#0369A1",
    fontWeight: "700",
    marginBottom: isTablet ? 0 : 6,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: isTablet ? 17 : 16,
    color: "#0C4A6E",
    fontWeight: "800",
  },

  // Status
  statusBadge: {
    paddingHorizontal: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1.5,
    alignSelf: "flex-start",
  },
  statusSuccess: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  statusFailed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  statusPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  statusText: {
    fontWeight: "800",
    fontSize: isTablet ? 15 : 14,
    letterSpacing: 0.5,
  },
  statusTextSuccess: { color: "#059669" },
  statusTextFailed: { color: "#DC2626" },
  statusTextPending: { color: "#D97706" },

  // Warning Box
  warningBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: isTablet ? 18 : 16,
    padding: isTablet ? 16 : 12,
    borderWidth: 1.5,
    borderColor: "FDE68A",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningIcon: {
    fontSize: isTablet ? 28 : 24,
  },
  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  // Items section
  itemsScroll: {
    maxHeight: isTablet ? 520 : 400,
  },
  itemsContainer: {
    gap: 12,
  },

  // Item Card - Redesigned
  itemCard: {
    backgroundColor: "#FAFEFF",
    borderRadius: isTablet ? 18 : 16,
    padding: isTablet ? 16 : 12,
    borderWidth: 1.5,
    borderColor: "#E0F2FE",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  itemNumberCircle: {
    width: isTablet ? 32 : 28,
    height: isTablet ? 32 : 28,
    borderRadius: isTablet ? 16 : 14,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  itemNumber: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  itemName: {
    flex: 1,
    fontSize: isTablet ? 18 : 16,
    fontWeight: "700",
    color: "#0C4A6E",
    lineHeight: isTablet ? 24 : 22,
  },
  itemDesc: {
    fontSize: isTablet ? 14 : 13,
    color: "#64748B",
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: isTablet ? 40 : 36,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  priceTag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: isTablet ? 12 : 10,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: isTablet ? 10 : 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  itemPrice: {
    fontSize: isTablet ? 18 : 16,
    color: "#1E40AF",
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // Buttons
  buttonContainer: {
    flexDirection: isTablet ? "row" : "column",
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: isTablet ? 16 : 14,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  buttonGradient: {
    paddingVertical: isTablet ? 14 : 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: isTablet ? 17 : 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
