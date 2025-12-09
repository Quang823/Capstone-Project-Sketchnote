// ResourceStoreScreen.styles.js
import { StyleSheet, Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const resourceStoreStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },

  // Header
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#3B82F6",
    opacity: 0.05,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
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
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(146, 146, 146, 1)",
    fontWeight: "500",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  cartBadgeText: { color: "#FFF", fontWeight: "900", fontSize: 12 },

  // Promo Banner
  promoBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    height: 300, // Tăng chiều cao để chứa search bar
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  promoContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center", // Canh giữa nội dung
    paddingHorizontal: 20,
  },
  promoTitle: {
    fontSize: 32,
    fontFamily: "Pacifico-Regular",
    color: "#FFF",
    letterSpacing: -0.5,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promoSubtitle: {
    fontSize: 17,
    fontFamily: "Pacifico-Regular",
    color: "#E0E7FF",
    marginTop: 6,
    fontWeight: "600",
  },
  promoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 12,
  },
  promoBadgeText: { color: "#FFF", fontWeight: "900", fontSize: 13 },

  // Search inside Banner
  bannerSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginTop: 24,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1E293B",
    height: 44,
  },
  bannerSearchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#084F8C", // Màu xanh giống hình
    justifyContent: "center",
    alignItems: "center",
  },

  // CATEGORY STYLE ĐẸP
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginRight: 12,

    borderWidth: 1.5,
    borderColor: "#E2E8F0",

    // Shadow nhẹ premium
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,

    position: "relative",
    overflow: "hidden",
  },

  selectedCategoryButton: {
    backgroundColor: "#0A66C2",
    borderColor: "#0a5ab0",

    shadowColor: "#0A66C2",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  categoryGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#60A5FA",
    opacity: 0.25,
  },

  categoryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },

  // Section
  sectionContainer: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Card
  resourceCard: {
    width: 320,
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  imageContainer: {
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  resourceImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  // Badge gọn nhẹ, đẹp mắt
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backdropFilter: "blur(4px)",
  },
  typeBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ownerBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  ownerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  trendingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendingBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "800",
  },
  // Thông tin ngày
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  resourceInfo: { padding: 20 },
  resourceName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1E293B",
    lineHeight: 26,
  },
  resourceDescription: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1E293B",
  },
  originalPrice: {
    fontSize: 13,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#059669",
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
  },
  openResourceButton: {
    backgroundColor: "#10B981",
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  openResourceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 2,
  },

  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },

  dateContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  datePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  buyNowButton: {
    flex: 1.4,
    backgroundColor: "#084F8C",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    shadowColor: "rgba(34, 112, 238, 1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
