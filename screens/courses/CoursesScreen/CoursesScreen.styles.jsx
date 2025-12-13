import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const coursesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerDark: {
    backgroundColor: "#0F172A",
  },
  scrollContainer: {
    flex: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingContainerDark: {
    backgroundColor: "#0F172A",
  },

  // Header - Enhanced with gradient
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerDark: {
    // Gradient handling will be done in component
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -1,
  },
  headerTitleDark: {
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#64748B",
  },
  headerSubtitleDark: {
    color: "#94A3B8",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationButtonDark: {
    backgroundColor: "#1E293B",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeDark: {
    borderColor: "#1E293B",
  },

  // Search - Enhanced design
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#F8FAFC",
  },
  searchWrapperDark: {
    backgroundColor: "#0F172A",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  searchContainerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  searchInputDark: {
    color: "#F1F5F9",
  },
  clearButton: {
    padding: 4,
  },

  // Hot New Releases Section - Stunning redesign
  hotReleasesWrapper: {
    marginBottom: 32,
  },
  hotReleasesGradient: {
    paddingVertical: 32,
    position: "relative",
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    top: -80,
    right: -60,
    borderWidth: 12,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  decorCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(100, 150, 255, 0.15)",
    bottom: -50,
    left: -40,
    borderWidth: 10,
    borderColor: "rgba(100, 180, 255, 0.2)",
  },
  hotReleasesSection: {
    position: "relative",
    zIndex: 1,
  },
  hotReleasesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  hotReleasesHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fireIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  hotReleasesTitle: {
    fontSize: 28,
    fontFamily: "Pacifico-Regular",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  hotReleasesSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  exploreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Featured Course Card - Premium design
  featuredCard: {
    width: 320,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
  },
  featuredGradient: {
    flex: 1,
    position: "relative",
  },
  patternOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -30,
    right: 20,
  },
  patternCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: 20,
    left: 20,
  },
  featuredImageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    zIndex: 2,
  },
  featuredTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  featuredNewBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  featuredNewBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  featuredBottom: {
    gap: 8,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    lineHeight: 26,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  featuredSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  featuredMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },

  // Category - Enhanced
  categoryContainer: {
    paddingVertical: 20,
    backgroundColor: "#F8FAFC",
  },
  categoryContainerDark: {
    backgroundColor: "#0F172A",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  categoryButtonDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  selectedCategoryButton: {
    backgroundColor: "#1c3f8fff",
    borderColor: "#2348bfff",
  },
  categoryText: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },
  categoryTextDark: {
    color: "#94A3B8",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },

  // Section
  sectionContainer: {
    marginBottom: 20,
    backgroundColor: "#F8FAFC",
  },
  sectionContainerDark: {
    backgroundColor: "#0F172A",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  sectionTitleDark: {
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  sectionSubtitleDark: {
    color: "#94A3B8",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },
  filterButtonDark: {
    backgroundColor: "#1E293B",
  },

  courseCard: {
    width: 300,
    height: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: "space-between",
  },
  courseCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },

  courseInfo: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
    backgroundColor: "#F1F5F9",
  },
  imageContainerDark: {
    backgroundColor: "#334155",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  badgesContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelBadge: {
    backgroundColor: "rgba(47, 83, 174, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(239, 68, 68, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  courseTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  courseTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    lineHeight: 24,
  },
  courseTitleDark: {
    color: "#F1F5F9",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingBadgeDark: {
    backgroundColor: "#78350f",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#F59E0B",
  },
  courseSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: "500",
  },
  courseSubtitleDark: {
    color: "#94A3B8",
  },

  // Meta Info - Enhanced
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  metaRowDark: {
    borderBottomColor: "#334155",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  metaTextDark: {
    color: "#94A3B8",
  },

  // Price Row - Enhanced
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#254477ff",
  },
  priceDark: {
    color: "#60A5FA",
  },
  currency: {
    fontSize: 14,
    fontWeight: "700",
    color: "#254477ff",
  },
  currencyDark: {
    color: "#60A5FA",
  },
  enrollButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#264cc9ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Empty State - Enhanced
  emptyState: {
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
  },
  emptyStateText: {
    marginTop: 20,
    fontSize: 18,
    color: "#475569",
    fontWeight: "700",
  },
  emptyStateTextDark: {
    color: "#94A3B8",
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "600",
  },
  emptyStateSubtextDark: {
    color: "#64748B",
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 32,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#2348bfff",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#1E40AF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Đã đẹp và chuẩn rồi, thêm vào cuối file styles
  heroContainer: {
    height: 360,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontSize: 50,
    fontFamily: "Pacifico-Regular",
    color: "#FFFFFF",
    letterSpacing: -1,
    lineHeight: 50,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    fontFamily: "Poppins-Medium",
    opacity: 0.95,
  },
  searchCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#F8FAFC",
  },
  searchCategoryRowDark: {
    backgroundColor: "#0F172A",
  },
  // === Ô SEARCH DÀI HƠN, ĐẸP HƠN ===
  searchCompactWrapper: {
    paddingHorizontal: 16,
  },
  searchCompactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 250,
  },
  searchCompactContainerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
    shadowColor: "#000",
  },
  searchCompactInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  searchCompactInputDark: {
    color: "#F1F5F9",
  },
});
