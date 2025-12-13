import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Light theme colors
const lightColors = {
  background: "#F8FAFC",
  headerBackground: "#FFFFFF",
  headerTitle: "#084F8C",
  headerSubtitle: "#084F8C",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  cardBackground: "#FFFFFF",
  borderColor: "#E2E8F0",
  shadowColor: "#000",
  inputBackground: "#F8FAFC",
  inputBorder: "#E2E8F0",
  iconWrapperBg: "#EFF6FF",
  sectionHeaderTitle: "#0F172A",
  sectionHeaderSubtitle: "#64748B",
  statBadgeBg: "#F1F5F9",
  statNumber: "#084F8C",
  statLabel: "#084F8C",
  contentCardBorder: "#F1F5F9",
  sectionNumberBadgeBg: "#084F8C",
  sectionNumberText: "#FFFFFF",
  sectionTitle: "#0F172A",
  fieldLabel: "#475569",
  addSectionButtonBg: "#FFFFFF",
  addSectionButtonBorder: "#084F8C",
  addSectionText: "#084F8C",
  backButtonBg: "rgba(255, 255, 255, 0.95)",
  iconColor: "#084F8C",
  iconColor1: "#084F8C",
  placeholderText: "#94A3B8",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  headerBackground: "#1E293B",
  headerTitle: "#FFFFFF",
  headerSubtitle: "#94A3B8",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  cardBackground: "#1E293B",
  borderColor: "#334155",
  shadowColor: "#000",
  inputBackground: "#334155",
  inputBorder: "#475569",
  iconWrapperBg: "#1E3A8A", // Darker blue for icon wrapper
  sectionHeaderTitle: "#F1F5F9",
  sectionHeaderSubtitle: "#94A3B8",
  statBadgeBg: "#334155",
  statNumber: "#60A5FA",
  statLabel: "#60A5FA",
  contentCardBorder: "#334155",
  sectionNumberBadgeBg: "#3B82F6",
  sectionNumberText: "#FFFFFF",
  sectionTitle: "#F1F5F9",
  fieldLabel: "#CBD5E1",
  addSectionButtonBg: "#1E293B",
  addSectionButtonBorder: "#60A5FA",
  addSectionText: "#60A5FA",
  backButtonBg: "rgba(30, 41, 59, 0.95)",
  iconColor: "#60A5FA",
  iconColor1: "#FFFFFF",
  placeholderText: "#64748B",
};

export const getStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Loading State
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 48,
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
    loadingText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginTop: 20,
    },
    loadingSubtext: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 8,
    },

    // Header with Gradient
    headerGradient: {
      paddingTop: 40,
      paddingBottom: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      paddingTop: 40,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
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
      color: colors.headerTitle,
      letterSpacing: -0.5,
    },
    backButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.backButtonBg,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 10,
    },

    headerSubtitle: {
      fontSize: 13,
      color: colors.headerSubtitle,
      marginTop: 2,
      fontWeight: "500",
    },
    headerTextContainer: {
      flexDirection: "column",
    },

    // Scroll View
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 40,
    },

    // Progress Card
    progressCard: {
      flexDirection: "row",
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    progressItem: {
      flex: 1,
      alignItems: "center",
    },
    progressIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    progressDivider: {
      width: 1,
      backgroundColor: colors.borderColor,
      marginHorizontal: 8,
    },

    // Main Content
    mainContent: {
      flexDirection: isTablet ? "row" : "column",
      gap: 20,
      marginBottom: 24,
    },
    leftColumn: {
      flex: isTablet ? 1 : undefined,
      gap: 20,
    },
    rightColumn: {
      flex: isTablet ? 1 : undefined,
    },

    // Input Card
    inputCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    inputHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 10,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.textPrimary,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
    },
    textArea: {
      height: isTablet ? 140 : 120,
      textAlignVertical: "top",
    },
    inputHint: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 8,
      fontWeight: "500",
    },

    // Section Header Card
    sectionHeaderCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      flexDirection: isTablet ? "row" : "column",
      alignItems: isTablet ? "center" : "flex-start",
      justifyContent: "space-between",
      gap: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    sectionHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },
    sectionIconWrapper: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.iconWrapperBg,
      justifyContent: "center",
      alignItems: "center",
    },
    sectionHeaderTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: colors.sectionHeaderTitle,
      marginBottom: 4,
    },
    sectionHeaderSubtitle: {
      fontSize: 13,
      color: colors.sectionHeaderSubtitle,
      fontWeight: "500",
    },
    sectionStats: {
      flexDirection: "row",
      gap: 8,
    },
    statBadge: {
      backgroundColor: colors.statBadgeBg,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: "center",
      minWidth: 60,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: "800",
      color: colors.statNumber,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.statLabel,
      marginTop: 2,
      textTransform: "uppercase",
    },

    // Content Cards Container
    contentCardsContainer: {
      gap: 20,
    },

    // Content Card
    contentCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 24,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 2,
      borderColor: colors.contentCardBorder,
    },
    contentCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    contentCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    sectionNumberBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.sectionNumberBadgeBg,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.sectionNumberBadgeBg,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionNumberText: {
      fontSize: 16,
      fontWeight: "800",
      color: colors.sectionNumberText,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.sectionTitle,
    },
    existingBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme === 'dark' ? '#1E3A8A' : '#DBEAFE',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    existingBadgeText: {
      fontSize: 10,
      color: theme === 'dark' ? '#93C5FD' : '#1E40AF',
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    newBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme === 'dark' ? '#064E3B' : '#D1FAE5',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    newBadgeText: {
      fontSize: 10,
      color: theme === 'dark' ? '#6EE7B7' : '#065F46',
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    deleteButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme === 'dark' ? '#450a0a' : '#FEE2E2',
      justifyContent: "center",
      alignItems: "center",
    },

    // Input Group
    inputGroup: {
      marginBottom: 20,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.fieldLabel,
      marginBottom: 10,
    },

    // Add Section Button
    addSectionButton: {
      backgroundColor: colors.addSectionButtonBg,
      borderRadius: 20,
      padding: 20,
      marginTop: 4,
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.addSectionButtonBorder,
      borderStyle: "dashed",
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    addSectionContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    addSectionText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.addSectionText,
    },

    // Submit Button
    submitContainer: {
      marginTop: 8,
    },
    submitWrapper: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#084F8C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    submitButton: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 16,
    },
    submitContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    submitText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    // Bottom Actions Row - NEW
    bottomActionsContainer: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
      marginBottom: 12,
    },
    addSectionButtonRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.addSectionButtonBg,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.addSectionButtonBorder,
      gap: 8,
    },
    addSectionTextRow: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.addSectionText,
    },
    submitWrapperRow: {
      flex: 1,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#084F8C",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    submitButtonRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      paddingHorizontal: 20,
      gap: 8,
    },
    submitTextRow: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    // Colors for inline usage
    iconColor: colors.iconColor,
    iconColor1: colors.iconColor1,
    placeholderText: colors.placeholderText,
  });
};
