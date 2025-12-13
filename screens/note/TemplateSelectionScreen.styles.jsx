import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// 👉 Card nhỏ hơn và khoảng cách vừa phải
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2.2;

const lightColors = {
    background: "#F8FAFC",
    gradient: ["#F0F9FF", "#E0F2FE", "#BAE6FD"],
    headerTitle: "#0F172A",
    headerSubtitle: "#64748B",
    backButtonBg: "#FFFFFF",
    backButtonShadow: "#0C4A6E",
    backButtonIcon: "#0C4A6E",
    cardBg: "#FFFFFF",
    cardShadow: "#000",
    imageBg: "#F1F5F9",
    imagePlaceholderIcon: "#93C5FD",
    imagePlaceholderGradient: ["#EFF6FF", "#DBEAFE"],
    title: "#0F172A",
    description: "#64748B",
    badgeText: "#FFFFFF",
    badgeGradient: ["#F59E0B", "#D97706"],
    pageCountBadgeBg: "#EFF6FF",
    pageCountText: "#3B82F6",
    useButtonBg: "#EFF6FF",
    useButtonText: "#3B82F6",
    loadingBoxBg: "#FFFFFF",
    loadingText: "#475569",
    emptyIconGradient: ["#EFF6FF", "#DBEAFE"],
    emptyIcon: "#3B82F6",
    emptyTitle: "#0F172A",
    emptyDescription: "#64748B",
    storeButtonText: "#FFFFFF",
    creatingOverlay: "rgba(15, 23, 42, 0.7)",
    creatingBoxBg: "#FFFFFF",
    creatingText: "#0F172A",
    creatingSubtext: "#64748B",
};

const darkColors = {
    background: "#0F172A",
    gradient: ["#0F172A", "#1E293B", "#334155"],
    headerTitle: "#FFFFFF",
    headerSubtitle: "#94A3B8",
    backButtonBg: "#1E293B",
    backButtonShadow: "#000",
    backButtonIcon: "#F1F5F9",
    cardBg: "#1E293B",
    cardShadow: "#000",
    imageBg: "#334155",
    imagePlaceholderIcon: "#60A5FA",
    imagePlaceholderGradient: ["#1E293B", "#334155"],
    title: "#F1F5F9",
    description: "#94A3B8",
    badgeText: "#FFFFFF",
    badgeGradient: ["#D97706", "#B45309"],
    pageCountBadgeBg: "#1E293B",
    pageCountText: "#60A5FA",
    useButtonBg: "#1E293B",
    useButtonText: "#60A5FA",
    loadingBoxBg: "#1E293B",
    loadingText: "#94A3B8",
    emptyIconGradient: ["#1E293B", "#334155"],
    emptyIcon: "#60A5FA",
    emptyTitle: "#F1F5F9",
    emptyDescription: "#94A3B8",
    storeButtonText: "#FFFFFF",
    creatingOverlay: "rgba(0, 0, 0, 0.8)",
    creatingBoxBg: "#1E293B",
    creatingText: "#F1F5F9",
    creatingSubtext: "#94A3B8",
};

export const getStyles = (theme = "light") => {
    const colors = theme === "dark" ? darkColors : lightColors;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },

        background: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 40,
            paddingBottom: 20,
            backgroundColor: "transparent",
        },

        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.backButtonBg,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.backButtonShadow,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 4,
        },

        headerTitleContainer: {
            alignItems: "left",
            flex: 1,
        },

        headerTitle: {
            fontSize: 30,
            fontFamily: "Pacifico-Regular",
            color: colors.headerTitle,
            marginLeft: 20,
            letterSpacing: -0.6,
        },

        headerSubtitle: {
            fontSize: 12,
            fontWeight: "500",
            marginLeft: 20,
            color: colors.headerSubtitle,
            marginTop: 2,
        },

        listContent: {
            padding: CARD_GAP,
            paddingBottom: 100,
        },

        columnWrapper: {
            justifyContent: "space-between",
        },

        templateCard: {
            width: CARD_WIDTH,
            marginBottom: CARD_GAP,
        },

        card: {
            backgroundColor: colors.cardBg,
            borderRadius: 16,
            overflow: "hidden",

            // 👉 Giảm shadow cho nhẹ – premium look
            shadowColor: colors.cardShadow,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
        },

        imageContainer: {
            width: "100%",
            height: CARD_WIDTH * 0.65, // nhỏ gọn hơn
            backgroundColor: colors.imageBg,
            position: "relative",
        },

        templateImage: {
            width: "100%",
            height: "100%",
        },

        placeholderImage: {
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
        },

        imageGradient: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "50%",
        },

        badge: {
            position: "absolute",
            top: 10,
            right: 10,
            borderRadius: 8,
            overflow: "hidden",
            elevation: 4,
        },

        badgeGradient: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
        },

        badgeText: {
            fontSize: 9,
            fontWeight: "800",
            color: colors.badgeText,
            letterSpacing: 0.7,
        },

        cardInfo: {
            padding: 10,
            gap: 4,
        },

        templateTitle: {
            fontSize: 14,
            fontWeight: "800",
            color: colors.title,
            letterSpacing: -0.3,
        },

        templateDescription: {
            fontSize: 11,
            color: colors.description,
            lineHeight: 16,
            marginBottom: 2,
        },

        cardFooter: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
        },

        pageCountBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            backgroundColor: colors.pageCountBadgeBg,
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 6,
        },

        itemCountText: {
            fontSize: 10,
            fontWeight: "700",
            color: colors.pageCountText,
            letterSpacing: 0.2,
        },

        useButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            backgroundColor: colors.useButtonBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },

        useButtonText: {
            fontSize: 11,
            fontWeight: "700",
            color: colors.useButtonText,
        },

        loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 32,
        },

        loadingBox: {
            backgroundColor: colors.loadingBoxBg,
            borderRadius: 20,
            padding: 32,
            alignItems: "center",
            gap: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 8,
            minWidth: 200,
        },

        loadingText: {
            fontSize: 15,
            color: colors.loadingText,
            fontWeight: "600",
        },

        emptyContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
        },

        emptyIconContainer: {
            width: 110,
            height: 110,
            borderRadius: 55,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 14,
            elevation: 8,
        },

        emptyTitle: {
            fontSize: 26,
            fontWeight: "800",
            color: colors.emptyTitle,
            marginBottom: 10,
        },

        emptyDescription: {
            fontSize: 15,
            color: colors.emptyDescription,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 28,
        },

        storeButton: {
            borderRadius: 14,
            overflow: "hidden",
            elevation: 8,
        },

        storeButtonGradient: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 28,
            paddingVertical: 14,
            gap: 10,
        },

        storeButtonText: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.storeButtonText,
        },

        creatingOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.creatingOverlay,
            alignItems: "center",
            justifyContent: "center",
        },

        creatingBox: {
            backgroundColor: colors.creatingBoxBg,
            borderRadius: 24,
            padding: 36,
            alignItems: "center",
            minWidth: 260,
            elevation: 10,
        },

        creatingIconContainer: {
            width: 70,
            height: 70,
            borderRadius: 35,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
        },

        creatingText: {
            fontSize: 18,
            fontWeight: "800",
            color: colors.creatingText,
            marginBottom: 6,
        },

        creatingSubtext: {
            fontSize: 13,
            color: colors.creatingSubtext,
            fontWeight: "500",
        },
        colors: colors,
    });
};
