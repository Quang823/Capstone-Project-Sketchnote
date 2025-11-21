import { StyleSheet, Dimensions, Platform, StatusBar } from "react-native";

const { width } = Dimensions.get("window");

// --- CONFIG / RESPONSIVE ---
export const CONTENT_PADDING = 28;
export const CARD_GAP = 16;

// Responsive columns - 5 columns for better layout
export const columns =
  width >= 1400 ? 5 : width >= 1000 ? 4 : width >= 700 ? 3 : 2;

// Tính CARD_WIDTH
export const CARD_WIDTH = Math.floor(
  (width - CONTENT_PADDING * 2 - CARD_GAP * (columns - 1)) / columns
);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  main: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: CONTENT_PADDING,
    paddingTop: 60,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E7FF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a1c3efff",
  },
  premiumWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef9c3",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FBBF24",
  },

  premiumLottie: {
    width: 50,
    height: 50,
    marginRight: 4,
  },

  premiumTextBox: {
    flexDirection: "column",
    marginRight: 6,
  },

  premiumTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
  },

  premiumSubtitle: {
    fontSize: 10,
    color: "#B45309",
  },

  arrowLottie: {
    width: 50,
    height: 50,
  },
  createButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Popover
  popoverContainer: {
    position: "absolute",
    right: CONTENT_PADDING,
    top: (StatusBar.currentHeight || 0) + 100,
    zIndex: 100,
  },
  popover: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    minWidth: 220,
    paddingVertical: 6,
    elevation: 20,
    shadowColor: "#1E40AF",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  popoverItem: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  popoverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  popoverLabel: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  badge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  popoverTip: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  popoverTipText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  // Grid & Cards
  gridContainer: {
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E7FF",
    elevation: 2,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    height: CARD_WIDTH * 0.55 + 90, // Fixed height: image height + info section
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.55,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  projectImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  cardInfo: {
    padding: 10,
  },
  projectTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  projectDescription: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    color: "#3B82F6",
    fontWeight: "500",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // States
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 28,
  },
  createFirstButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  paginationButtonDisabled: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  paginationNumbers: {
    flexDirection: "row",
    gap: 8,
  },
  paginationNumber: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paginationNumberActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  paginationNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  paginationNumberTextActive: {
    color: "#FFFFFF",
  },
});
