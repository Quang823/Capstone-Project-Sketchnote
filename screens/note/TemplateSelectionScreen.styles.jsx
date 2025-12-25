import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
    background: "#F8FAFC",
    cardBackground: "#FFFFFF",
    headerBackground: "rgba(255,255,255,0.96)",
    primaryBlue: "#084F8C",
    primaryWhite: "#0F172A",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    borderColor: "#E2E8F0",
    dividerColor: "#E0E7FF",
    shadowColor: "#000",
    filterButtonBg: "#F1F5F9",
    filterButtonBorder: "#E2E8F0",
    filterButtonActiveBg: "#084F8C",
    filterButtonActiveText: "#FFFFFF",
    filterButtonText: "#64748B",
    emptyIconColor: "#CBD5E1",
    loadingColor: "#084F8C",
    cardBorder: "#E2E8F0",
    badgeBg: "#E0F2FE",
    badgeText: "#084F8C",
    creatingOverlay: "rgba(15, 23, 42, 0.7)",
    creatingBoxBg: "#FFFFFF",
    creatingText: "#0F172A",
    creatingSubtext: "#64748B",
};

// Dark theme colors
const darkColors = {
    background: "#0F172A",
    cardBackground: "#1E293B",
    headerBackground: "rgba(30,41,59,0.96)",
    primaryBlue: "#60A5FA",
    primaryWhite: "#FFFFFF",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    borderColor: "#334155",
    dividerColor: "#334155",
    shadowColor: "#000",
    filterButtonBg: "#1E293B",
    filterButtonBorder: "#334155",
    filterButtonActiveBg: "#60A5FA",
    filterButtonActiveText: "#FFFFFF",
    filterButtonText: "#94A3B8",
    emptyIconColor: "#475569",
    loadingColor: "#60A5FA",
    cardBorder: "#334155",
    badgeBg: "#1E3A5F",
    badgeText: "#60A5FA",
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

        // Header
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme === "dark" ? 0.3 : 0.06,
            shadowRadius: 8,
            elevation: 4,
            paddingTop: 40,
        },
        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
            flex: 1,
        },
        headerTitle: {
            fontFamily: "Pacifico-Regular",
            fontSize: 26,
            color: theme === "dark" ? "#FFFFFF" : colors.primaryBlue,
            letterSpacing: -0.5,
        },
        headerRight: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        headerButton: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.filterButtonBg,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.borderColor,
        },

        // Content
        listContent: {
            padding: 16,
            paddingBottom: 100,
        },
        columnWrapper: {
            justifyContent: "space-between",
        },

        // Card
        templateCard: {
            width: (SCREEN_WIDTH - 32 - 3 * 8) / 4,
            marginBottom: 12,
        },
        card: {
            backgroundColor: colors.cardBackground,
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme === "dark" ? 0.3 : 0.08,
            shadowRadius: 8,
            elevation: 3,
        },
        imageContainer: {
            width: "100%",
            height: 140,
            backgroundColor: colors.borderColor,
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

        // Card Content
        cardContent: {
            padding: 8,
        },
        cardTitle: {
            fontSize: 12,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 4,
        },
        cardSubtitle: {
            fontSize: 10,
            color: colors.textSecondary,
            marginBottom: 8,
            lineHeight: 14,
        },

        // Card Footer
        cardFooter: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
        },
        pageCountBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.filterButtonBg,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        itemCountText: {
            fontSize: 9,
            fontWeight: "600",
            color: colors.textSecondary,
        },
        useButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            backgroundColor: colors.primaryBlue,
            paddingHorizontal: 8,
            paddingVertical: 5,
            borderRadius: 8,
        },
        useButtonText: {
            fontSize: 10,
            fontWeight: "700",
            color: "#FFFFFF",
        },

        // Badge
        badge: {
            position: "absolute",
            top: 8,
            right: 8,
            borderRadius: 6,
            overflow: "hidden",
            elevation: 4,
        },
        badgeGradient: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
            backgroundColor: "#F59E0B",
        },
        badgeText: {
            fontSize: 9,
            fontWeight: "800",
            color: "#FFFFFF",
            letterSpacing: 0.5,
        },

        // Loading
        loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        loadingBox: {
            backgroundColor: colors.cardBackground,
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
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: "600",
        },

        // Empty State
        emptyContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
        },
        emptyIconContainer: {
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            backgroundColor: colors.filterButtonBg,
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: "800",
            color: colors.textPrimary,
            marginBottom: 8,
        },
        emptyDescription: {
            fontSize: 14,
            color: colors.textMuted,
            textAlign: "center",
            lineHeight: 20,
            marginBottom: 24,
        },
        storeButton: {
            borderRadius: 12,
            overflow: "hidden",
            elevation: 4,
        },
        storeButtonGradient: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingVertical: 12,
            gap: 8,
            backgroundColor: colors.primaryBlue,
        },
        storeButtonText: {
            fontSize: 14,
            fontWeight: "700",
            color: "#FFFFFF",
        },

        // Creating Overlay
        creatingOverlay: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.creatingOverlay,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        },
        creatingBox: {
            backgroundColor: colors.creatingBoxBg,
            borderRadius: 24,
            padding: 32,
            alignItems: "center",
            minWidth: 260,
            elevation: 10,
        },
        creatingIconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            backgroundColor: colors.primaryBlue,
        },
        creatingText: {
            fontSize: 16,
            fontWeight: "800",
            color: colors.creatingText,
            marginBottom: 4,
        },
        creatingSubtext: {
            fontSize: 12,
            color: colors.creatingSubtext,
            fontWeight: "500",
        },

        colors: colors,
    });
};
