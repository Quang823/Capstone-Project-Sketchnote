import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const blogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  containerDark: {
    backgroundColor: "#0F172A",
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
  headerDark: {
    backgroundColor: "#1E293B",
    borderBottomColor: "#334155",
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
  headerTitleDark: {
    color: "#F8FAFC",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainerDark: {
    backgroundColor: "#0F172A",
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 50,
  },

  heroTitle: {
    fontSize: isTablet ? 48 : 36,
    fontFamily: "Pacifico-Regular",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  heroSubtitle: {
    fontSize: 16,
    color: "#E0F2FE",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  heroSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },
  heroSearchContainerDark: {
    backgroundColor: "#334155",
  },

  heroSearchIcon: {
    marginRight: 12,
  },

  heroSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  heroSearchInputDark: {
    color: "#F8FAFC",
  },

  // Featured Section
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontFamily: "Pacifico-Regular",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionTitleDark: {
    color: "#F8FAFC",
  },

  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#136bb8ff",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },

  featuredGradient: {
    borderRadius: 24,
  },

  featuredImage: {
    width: "100%",
    height: isTablet ? 450 : 280,
    backgroundColor: "#E2E8F0",
  },

  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 28,
  },

  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
    gap: 6,
  },

  featuredBadgeText: {
    color: "#FCD34D",
    fontSize: 12,
    fontWeight: "700",
  },

  featuredTitle: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: isTablet ? 40 : 32,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  featuredMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  featuredAuthor: {
    color: "#E0F2FE",
    fontSize: 14,
    fontWeight: "600",
  },

  featuredDate: {
    color: "#E0F2FE",
    fontSize: 14,
    fontWeight: "500",
  },

  // Recent Posts Section
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  blogListContainer: {
    gap: 20,
  },

  // Horizontal Card (Medium-style)
  horizontalCard: {
    marginBottom: 20,
  },

  horizontalCardInner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  horizontalCardInnerDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },

  horizontalImage: {
    width: isTablet ? 280 : 140,
    height: isTablet ? 200 : 160,
    backgroundColor: "#F1F5F9",
  },
  horizontalImageDark: {
    backgroundColor: "#334155",
  },

  horizontalContent: {
    flex: 1,
    padding: isTablet ? 20 : 16,
    justifyContent: "space-between",
  },

  categoryBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  categoryBadgeDark: {
    backgroundColor: "#1e3a8a",
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#136bb8ff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryTextDark: {
    color: "#60A5FA",
  },

  horizontalTitle: {
    fontSize: isTablet ? 20 : 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    lineHeight: isTablet ? 28 : 24,
  },
  horizontalTitleDark: {
    color: "#F8FAFC",
  },

  horizontalSummary: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 21,
    marginBottom: 12,
    flex: 1,
  },
  horizontalSummaryDark: {
    color: "#CBD5E1",
  },

  horizontalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#136bb8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarDark: {
    backgroundColor: "#3B82F6",
  },

  authorName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    maxWidth: 100,
  },
  authorNameDark: {
    color: "#CBD5E1",
  },

  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 4,
  },
  metaDividerDark: {
    backgroundColor: "#475569",
  },

  metaText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  metaTextDark: {
    color: "#94A3B8",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainerDark: {
    backgroundColor: "#1E293B",
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  emptyTextDark: {
    color: "#F8FAFC",
  },

  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
