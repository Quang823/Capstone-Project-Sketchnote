import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
    background: "#F8FAFC",
    cardBackground: "#FFFFFF",
    headerBackground: "rgba(255,255,255,0.96)",
    primaryBlue: "#084F8C",
    accentBlue: "#3B82F6",
    darkBlue: "#1E3A8A",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    borderColor: "#E2E8F0",
    inputBackground: "#F3F4F6",
    shadowColor: "#000",
    productCardBg: "#FFFFFF",
    statCardBg: "#FFFFFF",
    statusBadgeBg: "#EFF6FF",
    infoCardBg: "#FFFFFF",
    leftPaneCardBg: "#F8FAFC",
    designerInfoBg: "#FFFFFF",
    itemsCounterBg: "#FFFFFF",
    iconColor: "#6B7280",
    placeholderBg: "#F3F4F6",
    actionButtonBg: "#E0F2FE",
    actionButtonTextColor: "#084F8C",
};

// Dark theme colors
const darkColors = {
    background: "#0F172A",
    cardBackground: "#1E293B",
    headerBackground: "rgba(30,41,59,0.96)",
    primaryBlue: "#60A5FA",
    accentBlue: "#3B82F6",
    darkBlue: "#60A5FA",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    borderColor: "#334155",
    inputBackground: "#0F172A",
    shadowColor: "#000",
    productCardBg: "#1E293B",
    statCardBg: "#1E293B",
    statusBadgeBg: "#1E3A5F",
    infoCardBg: "#0F172A",
    leftPaneCardBg: "#0F172A",
    designerInfoBg: "#0F172A",
    itemsCounterBg: "#0F172A",
    iconColor: "#94A3B8",
    placeholderBg: "#334155",
    actionButtonBg: "#1E3A5F",
    actionButtonTextColor: "#FFFFFF",
};

const getStyles = (theme = "light") => {
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
            paddingTop: 50,
            paddingBottom: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
            shadowColor: colors.shadowColor,
            shadowOpacity: theme === "dark" ? 0.3 : 0.06,
            shadowRadius: 8,
            elevation: 4,
            zIndex: 10,
        },
        headerLeft: {
            flexDirection: "row",
            alignItems: "center",
            gap: 15,
            flex: 1,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.cardBackground,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.borderColor,
        },
        headerTitle: {
            fontSize: 26,
            fontFamily: "Pacifico-Regular",
            color: theme === "dark" ? "#FFFFFF" : colors.primaryBlue,
            letterSpacing: -0.5,
        },
        headerActions: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        headerActionIcon: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.cardBackground,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: colors.shadowColor,
            shadowOpacity: theme === "dark" ? 0.3 : 0.05,
            shadowRadius: 6,
            elevation: 3,
            borderWidth: theme === "dark" ? 1 : 0,
            borderColor: colors.borderColor,
        },

        // Body
        contentContainer: {
            padding: 20,
        },

        detailBodyRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 20,
        },

        leftPane: {
            flex: 1,
            minWidth: 300,
        },

        rightPane: {
            flex: 1.2,
            minWidth: 300,
        },

        leftPaneCard: {
            backgroundColor: colors.leftPaneCardBg,
            borderRadius: 18,
            padding: 12,
            shadowColor: colors.shadowColor,
            shadowOpacity: theme === "dark" ? 0.3 : 0.06,
            shadowRadius: 10,
            elevation: 3,
            borderWidth: theme === "dark" ? 1 : 0,
            borderColor: colors.borderColor,
            marginBottom: 16,
        },

        /* IMAGES */
        detailImage: {
            width: "100%",
            height: 300,
            borderRadius: 16,
            backgroundColor: colors.inputBackground,
            resizeMode: "cover",
        },

        bannerImage: {
            width: "100%",
            height: 180,
            borderRadius: 16,
            backgroundColor: colors.inputBackground,
            resizeMode: "cover",
        },

        heroPlaceholder: {
            height: 300,
            borderRadius: 16,
            backgroundColor: colors.inputBackground,
            alignItems: "center",
            justifyContent: "center",
        },

        /* ITEMS GALLERY */
        itemsSection: {
            marginTop: 20,
        },
        itemsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: 10,
        },
        itemImageContainer: {
            width: "48%", // 2 columns with gap
            aspectRatio: 1,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.borderColor,
            marginBottom: 10,
        },
        itemImage: {
            width: "100%",
            height: "100%",
            resizeMode: "cover",
        },

        /* INFO CARD */
        infoCard: {
            backgroundColor: colors.infoCardBg,
            borderRadius: 20,
            padding: 20,
            marginBottom: 26,
            shadowColor: colors.shadowColor,
            shadowOpacity: theme === "dark" ? 0.3 : 0.05,
            shadowRadius: 12,
            elevation: 3,
            borderWidth: theme === "dark" ? 1 : 0,
            borderColor: colors.borderColor,
        },

        detailSection: {
            marginBottom: 22,
        },

        detailRow: {
            flexDirection: "row",
            gap: 18,
            marginBottom: 20,
        },

        detailCol: {
            flex: 1,
        },

        detailLabel: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.textSecondary,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 0.6,
        },

        detailValue: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.textPrimary,
            lineHeight: 24,
        },

        productNameText: {
            fontSize: 24,
            fontWeight: "800",
            color: colors.primaryBlue,
            marginBottom: 8,
        },

        descriptionText: {
            fontSize: 15,
            color: colors.textSecondary,
            lineHeight: 22,
            backgroundColor: colors.inputBackground,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.borderColor,
        },

        priceTag: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.primaryBlue,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 14,
            alignSelf: "flex-start",
            gap: 8,
            shadowColor: colors.primaryBlue,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },

        priceText: {
            fontSize: 18,
            fontWeight: "800",
            color: "#FFFFFF",
        },

        typeBadge: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.statusBadgeBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 10,
            alignSelf: "flex-start",
            gap: 6,
            borderWidth: 1,
            borderColor: colors.accentBlue + "40",
        },

        typeText: {
            fontSize: 13,
            fontWeight: "700",
            color: colors.accentBlue,
            textTransform: "uppercase",
        },

        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
        },

        sectionTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.textPrimary,
        },

        infoGrid: {
            flexDirection: "row",
            gap: 12,
            marginBottom: 20,
        },

        infoItem: {
            flex: 1,
            backgroundColor: colors.cardBackground,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.borderColor,
            alignItems: "center",
            gap: 4,
        },

        /* STATUS */
        statusBadgeLarge: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            gap: 6,
        },

        statusTextLarge: {
            fontSize: 13,
            fontWeight: "700",
            color: "#FFFFFF",
        },

        /* DESIGNER */
        designerInfo: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.designerInfoBg,
            padding: 14,
            borderRadius: 14,
            gap: 14,
            borderWidth: 1,
            borderColor: colors.borderColor,
        },

        designerAvatar: {
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: colors.inputBackground,
            justifyContent: "center",
            alignItems: "center",
        },

        designerDetails: {
            flex: 1,
        },

        designerName: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.textPrimary,
        },

        designerEmail: {
            fontSize: 13,
            color: colors.textSecondary,
        },

        // Colors export for inline styles
        colors,
        textPrimary: colors.textPrimary,
        textSecondary: colors.textSecondary,
        primaryBlue: colors.primaryBlue,
        cardBackground: colors.cardBackground,
        inputBackground: colors.inputBackground,
        borderColor: colors.borderColor,
        textMuted: colors.textMuted,
    });
};

export default getStyles;
