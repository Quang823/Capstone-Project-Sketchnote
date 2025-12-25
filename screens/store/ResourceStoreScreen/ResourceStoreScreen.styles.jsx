import { StyleSheet, Dimensions } from "react-native";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_GAP = 12;
export const CARD_WIDTH = (SCREEN_WIDTH - 40 - 4 * CARD_GAP) / 5;

export const resourceStoreStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAFAFA" },
    containerDark: { backgroundColor: "#0F172A" },

    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
    },
    centerContainerDark: {
        backgroundColor: "#0F172A",
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
    headerDark: {
        backgroundColor: "#1E293B",
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
    headerTitleDark: {
        color: "#F8FAFC",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "rgba(146, 146, 146, 1)",
        fontWeight: "500",
    },
    headerSubtitleDark: {
        color: "#94A3B8",
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
    cartButtonDark: {
        backgroundColor: "#334155",
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
        height: 300,
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
    bannerSearchContainerDark: {
        backgroundColor: "#334155",
    },
    bannerSearchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: "#1E293B",
        height: 44,
    },
    bannerSearchInputDark: {
        color: "#F8FAFC",
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
    categoryButtonDark: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
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
    categoryTextDark: {
        color: "#CBD5E1",
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
    sectionTitleDark: {
        color: "#F8FAFC",
    },

    // Card
    resourceCard: {
        width: CARD_WIDTH,
        backgroundColor: "#FFF",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    resourceCardDark: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
    },
    imageContainer: {
        height: CARD_WIDTH * 0.65, // Maintain aspect ratio
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#F1F5F9",
    },
    imageContainerDark: {
        backgroundColor: "#334155",
    },
    resourceImage: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
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
        fontSize: 9,
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
        fontSize: 9,
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
    resourceInfo: { padding: 10 },
    resourceName: {
        fontSize: 11,
        fontWeight: "900",
        color: "#1E293B",
        lineHeight: 14,
        minHeight: 24,
    },
    resourceNameDark: {
        color: "#F8FAFC",
    },
    resourceDescription: {
        fontSize: 9,
        color: "#64748B",
        marginTop: 2,
        lineHeight: 11,
        minHeight: 20, // Ensure at least 2 lines of space
    },
    resourceDescriptionDark: {
        color: "#CBD5E1",
    },

    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    price: {
        fontSize: 11,
        fontWeight: "900",
        color: "#1E293B",
    },
    priceDark: {
        color: "#F8FAFC",
    },
    originalPrice: {
        fontSize: 9,
        color: "#94A3B8",
        textDecorationLine: "line-through",
        fontWeight: "600",
    },
    originalPriceDark: {
        color: "#64748B",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: "#ECFDF5",
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    addToCartButtonDark: {
        backgroundColor: "#064E3B",
        borderColor: "#059669",
    },
    addToCartText: {
        fontSize: 8,
        fontWeight: "800",
        color: "#059669",
    },
    addToCartTextDark: {
        color: "#6EE7B7",
    },
    buyNowText: {
        fontSize: 8,
        fontWeight: "800",
        color: "#FFF",
    },
    openResourceButton: {
        backgroundColor: "#10B981",
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        marginTop: 14,
    },
    openResourceText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#FFF",
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        paddingHorizontal: 2,
        minHeight: 24, // Ensure space for dates even if empty
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
    datePillDark: {
        backgroundColor: "#334155",
    },

    datePillText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#475569",
    },
    datePillTextDark: {
        color: "#CBD5E1",
    },

    buyNowButton: {
        flex: 1.4,
        backgroundColor: "#084F8C",
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        shadowColor: "rgba(34, 112, 238, 1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loadMoreCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.5, // Approximate height
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: CARD_GAP,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    loadMoreCardDark: {
        backgroundColor: "#1E293B",
        borderColor: "#334155",
    },
    loadMoreContent: {
        alignItems: "center",
        gap: 8,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#084F8C",
    },
    loadMoreTextDark: {
        color: "#60A5FA",
    },
});
