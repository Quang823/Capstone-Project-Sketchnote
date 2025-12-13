import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Light theme colors
const lightColors = {
    background: "#F8FAFC",
    cardBackground: "#FFFFFF",
    headerBackground: "rgba(255,255,255,0.96)",
    primaryBlue: "#084F8C",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    borderColor: "#E2E8F0",
    inputBackground: "#F8FAFC",
    inputBorder: "#E2E8F0",
    shadowColor: "#000",
    badgeBg: "#E0F2FE",
    badgeText: "#084F8C",
    typeButtonBg: "#F8FAFC",
    typeButtonBorder: "#E2E8F0",
    typeButtonText: "#64748B",
    projectCardBg: "#ebf4fcff",
    projectCardBorder: "#d1d1d1ff",
    projectCardActiveBg: "#E0F2FE",
    emptyIconColor: "#CBD5E1",
    placeholderText: "#94A3B8",
    headerTitleColor: "#0F172A",
    headerIconColor: "#084F8C",
};

// Dark theme colors
const darkColors = {
    background: "#0F172A",
    cardBackground: "#1E293B",
    headerBackground: "rgba(30,41,59,0.96)",
    primaryBlue: "#60A5FA",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    borderColor: "#334155",
    inputBackground: "#0F172A",
    inputBorder: "#334155",
    shadowColor: "#000",
    badgeBg: "#1E3A5F",
    badgeText: "#60A5FA",
    typeButtonBg: "#0F172A",
    typeButtonBorder: "#334155",
    typeButtonText: "#94A3B8",
    projectCardBg: "#1E293B",
    projectCardBorder: "#334155",
    projectCardActiveBg: "#1E3A5F",
    emptyIconColor: "#475569",
    placeholderText: "#64748B",
    headerTitleColor: "#FFFFFF",
    headerIconColor: "#FFFFFF",
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
            paddingBottom: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderColor,
            shadowColor: colors.shadowColor,
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
        headerButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
        },
        headerSubmitBtn: {
            height: 36,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: colors.primaryBlue,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            shadowColor: colors.primaryBlue,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 4,
            elevation: 3,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.headerTitleColor,
        },
        submitText: {
            fontSize: 16,
            fontFamily: "Pacifico-Regular",
            color: colors.primaryBlue,
        },
        headerSubmitText: {
            fontSize: 14,
            fontWeight: "700",
            color: "#FFFFFF",
            letterSpacing: 0.3,
        },
        submitTextDisabled: {
            color: colors.textMuted,
        },

        // Content
        content: {
            flex: 1,
        },

        // Section
        section: {
            backgroundColor: colors.cardBackground,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.borderColor,
            shadowColor: colors.shadowColor,
            shadowOpacity: theme === "dark" ? 0.3 : 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
        },
        rowSection: {
            flexDirection: "row",
            marginHorizontal: 16,
            marginTop: 16,
            gap: 12,
        },
        halfSection: {
            flex: 1,
            marginHorizontal: 0,
            marginTop: 0,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 17,
            fontWeight: "700",
            color: colors.textPrimary,
            marginLeft: 8,
            flex: 1,
        },

        // Input
        inputGroup: {
            marginBottom: 14,
        },
        label: {
            fontSize: 13,
            fontWeight: "500",
            color: colors.textSecondary,
            marginBottom: 6,
        },
        input: {
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.textPrimary,
        },
        textarea: {
            height: 44,
            textAlignVertical: "center",
        },
        largeInput: {
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.textPrimary,
        },
        largeTextarea: {
            height: 56,
            textAlignVertical: "top",
            paddingTop: 12,
        },
        row: {
            flexDirection: "row",
            gap: 12,
        },
        halfInput: {
            flex: 1,
            marginBottom: 14,
        },

        // Type Toggle
        typeToggle: {
            flexDirection: "row",
            gap: 8,
        },
        typeButton: {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.typeButtonBg,
            borderWidth: 1,
            borderColor: colors.typeButtonBorder,
        },
        typeButtonActive: {
            backgroundColor: colors.primaryBlue,
            borderColor: colors.primaryBlue,
        },
        typeButtonText: {
            fontSize: 13,
            fontWeight: "500",
            color: colors.typeButtonText,
        },
        typeButtonTextActive: {
            color: "#FFFFFF",
        },

        // Price Input
        priceInput: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            paddingRight: 12,
        },
        priceField: {
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.textPrimary,
        },
        priceSuffix: {
            fontSize: 14,
            fontWeight: "500",
            color: colors.textSecondary,
        },

        // Date Button
        dateButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        dateText: {
            fontSize: 15,
            color: colors.textPrimary,
        },

        // Badge
        badge: {
            backgroundColor: colors.badgeBg,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 10,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.badgeText,
        },

        // Source Toggle
        sourceToggle: {
            flexDirection: "row",
            gap: 8,
            marginTop: 0,
            alignItems: "center",
            flexWrap: "nowrap",
        },
        sourceButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            height: 36,
            minWidth: 160,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: colors.typeButtonBg,
            borderWidth: 1,
            borderColor: colors.typeButtonBorder,
            flexShrink: 0,
        },
        sourceButtonActive: {
            backgroundColor: colors.primaryBlue,
            borderColor: colors.primaryBlue,
        },
        sourceButtonSelected: {
            transform: [{ scale: 1.06 }],
        },
        sourceButtonText: {
            fontSize: 13,
            fontWeight: "500",
            color: colors.typeButtonText,
        },
        sourceButtonTextActive: {
            color: "#FFFFFF",
        },
        sourceContent: {
            marginTop: 0,
        },
        projectListScroll: {
            maxHeight: 300,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            padding: 6,
            backgroundColor: colors.cardBackground,
        },
        itemHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        itemTitle: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: 5,
        },

        // Empty State
        emptyState: {
            alignItems: "center",
            paddingVertical: 40,
        },
        emptyText: {
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 12,
        },
        emptyIconColor: colors.emptyIconColor,

        // Project Card
        projectCard: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            marginBottom: 10,
            borderRadius: 12,
            backgroundColor: colors.projectCardBg,
            borderWidth: 1,
            borderColor: colors.projectCardBorder,
        },
        projectCardActive: {
            backgroundColor: colors.projectCardActiveBg,
            borderColor: colors.primaryBlue,
            borderWidth: 2,
        },
        projectImage: {
            width: 56,
            height: 56,
            borderRadius: 10,
            backgroundColor: colors.borderColor,
        },
        projectInfo: {
            flex: 1,
            marginLeft: 12,
        },
        projectName: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: 4,
        },
        projectDesc: {
            fontSize: 12,
            color: colors.textSecondary,
            lineHeight: 16,
        },

        // Submit Button
        submitButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
            alignSelf: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.primaryBlue,
            shadowColor: colors.primaryBlue,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        },
        verticalDivider: {
            width: 1,
            backgroundColor: colors.borderColor,
            marginHorizontal: 6,
        },
        submitButtonDisabled: {
            backgroundColor: colors.textMuted,
            shadowOpacity: 0,
            elevation: 0,
        },
        submitButtonText: {
            fontSize: 16,
            fontWeight: "600",
            color: "#FFFFFF",
        },

        // Colors for inline use
        primaryBlue: colors.primaryBlue,
        textMuted: colors.textMuted,
        textSecondary: colors.textSecondary,
        placeholderText: colors.placeholderText,
        headerIconColor: colors.headerIconColor,
    });
};

export default getStyles;
