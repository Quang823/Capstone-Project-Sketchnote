import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Light theme colors
const lightColors = {
  background: "#F0F9FF",
  cardBackground: "#FFFFFF",
  headerBackground: "#FFFFFF",
  primaryBlue: "#2196F3",
  darkBlue: "#0D47A1",
  darkWhite: "#1E40AF",
  mediumBlue: "#1976D2",
  lightBlue: "#E3F2FD",
  accentBlue: "#BBDEFB",
  textPrimary: "#0D47A1",
  textSecondary: "#546E7A",
  textMuted: "#90A4AE",
  borderColor: "#E3F2FD",
  pointBackground: "#F1F8FF",
  shadowColor: "#2196F3",
};

// Dark theme colors
const darkColors = {
  background: "#0F172A",
  cardBackground: "#1E293B",
  headerBackground: "#1E293B",
  primaryBlue: "#3B82F6",
  darkBlue: "#93C5FD",
  darkWhite: "#FFFFFF",
  mediumBlue: "#60A5FA",
  lightBlue: "#1E3A5F",
  accentBlue: "#2563EB",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  borderColor: "#334155",
  pointBackground: "#1E3A5F",
  shadowColor: "#000000",
};

const getStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: 40,
    },

    header: {
      backgroundColor: colors.headerBackground,
      paddingTop: 60,
      paddingBottom: 50,
      paddingHorizontal: 25,
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 15 },
          shadowOpacity: theme === "dark" ? 0.5 : 0.25,
          shadowRadius: 25,
        },
        android: {
          elevation: 15,
        },
      }),
    },

    headerBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    menuButtonWrapper: {
      position: "absolute",
      top: 50,
      left: 20,
      zIndex: 10,
    },

    headerImage: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      opacity: theme === "dark" ? 0.1 : 0.2,
    },

    blob: {
      position: "absolute",
      borderRadius: 1000,
      opacity: theme === "dark" ? 0.1 : 0.15,
    },

    blob1: {
      width: 280,
      height: 280,
      backgroundColor: colors.primaryBlue,
      top: -100,
      left: -80,
    },

    blob2: {
      width: 220,
      height: 220,
      backgroundColor: theme === "dark" ? "#2563EB" : "#03A9F4",
      bottom: -90,
      right: -70,
    },

    blob3: {
      width: 180,
      height: 180,
      backgroundColor: theme === "dark" ? "#1D4ED8" : "#4FC3F7",
      top: "45%",
      left: "55%",
    },

    headerContent: {
      alignItems: "center",
      zIndex: 2,
    },

    iconContainer: {
      width: 90,
      height: 90,
      backgroundColor: colors.lightBlue,
      borderRadius: 45,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
      borderWidth: 3,
      borderColor: colors.accentBlue,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    headerIcon: {
      fontSize: 50,
    },

    headerTitle: {
      fontSize: 42,
      fontFamily: "Pacifico-Regular",
      color: colors.darkWhite,
      marginBottom: 2,
      letterSpacing: -0.5,
    },

    divider: {
      width: 60,
      height: 4,
      backgroundColor: colors.primaryBlue,
      borderRadius: 2,
      marginBottom: 12,
    },

    headerSubtitle: {
      fontSize: 25,
      color: colors.darkWhite,
      fontWeight: "600",
      marginBottom: 15,
    },

    badge: {
      backgroundColor: colors.lightBlue,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.accentBlue,
    },

    badgeText: {
      fontSize: 12,
      color: colors.mediumBlue,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    contentContainer: {
      padding: 20,
    },

    introBoxWrapper: {
      marginBottom: 25,
      borderRadius: 24,
      padding: 3,
      backgroundColor: colors.primaryBlue,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme === "dark" ? 0.5 : 0.25,
          shadowRadius: 15,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    introBox: {
      backgroundColor: colors.cardBackground,
      borderRadius: 22,
      padding: 28,
    },

    introHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 18,
    },

    introBadge: {
      width: 50,
      height: 50,
      backgroundColor: colors.lightBlue,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    introBadgeText: {
      fontSize: 24,
    },

    introTitle: {
      flex: 1,
      fontSize: 22,
      fontWeight: "800",
      color: colors.textPrimary,
    },

    introText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.textSecondary,
      letterSpacing: 0.2,
    },

    sectionsContainer: {
      marginBottom: 25,
    },

    sectionCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 22,
      marginBottom: 16,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.borderColor,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: theme === "dark" ? 0.4 : 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },

    sectionButton: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 22,
    },

    sectionLeft: {
      marginRight: 16,
    },

    sectionIconContainer: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },

    sectionIconGlow: {
      position: "absolute",
      width: 60,
      height: 60,
      backgroundColor: colors.primaryBlue,
      borderRadius: 18,
      opacity: theme === "dark" ? 0.2 : 0.12,
    },

    sectionIconText: {
      fontSize: 32,
      zIndex: 1,
    },

    sectionTextContainer: {
      flex: 1,
      paddingRight: 12,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 4,
      letterSpacing: 0.2,
    },

    sectionContent: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textSecondary,
      marginTop: 12,
      letterSpacing: 0.2,
    },

    sectionArrow: {
      justifyContent: "center",
    },

    arrowCircle: {
      width: 36,
      height: 36,
      backgroundColor: colors.lightBlue,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },

    arrowText: {
      fontSize: 12,
      color: colors.mediumBlue,
      fontWeight: "bold",
    },

    keyPointsWrapper: {
      marginBottom: 25,
      borderRadius: 24,
      padding: 3,
      backgroundColor: colors.primaryBlue,
    },

    keyPointsContainer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 22,
      padding: 28,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme === "dark" ? 0.4 : 0.2,
          shadowRadius: 15,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    keyPointsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 25,
    },

    keyPointsIconBg: {
      width: 48,
      height: 48,
      backgroundColor: theme === "dark" ? "#422006" : "#FFF3E0",
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
      borderWidth: 2,
      borderColor: theme === "dark" ? "#854d0e" : "#FFE0B2",
    },

    keyPointsIcon: {
      fontSize: 24,
    },

    keyPointsTitle: {
      flex: 1,
      fontSize: 24,
      fontWeight: "800",
      color: colors.textPrimary,
      letterSpacing: 0.2,
    },

    pointsGrid: {
      gap: 14,
    },

    pointItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.pointBackground,
      padding: 18,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    pointCheckWrapper: {
      marginRight: 14,
      paddingTop: 2,
    },

    pointCheck: {
      width: 32,
      height: 32,
      backgroundColor: colors.primaryBlue,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 4,
        },
      }),
    },

    pointCheckText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold",
    },

    pointText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 21,
      color: theme === "dark" ? "#CBD5E1" : "#37474F",
      fontWeight: "500",
      letterSpacing: 0.2,
    },

    footerWrapper: {
      borderRadius: 24,
      padding: 3,
      backgroundColor: colors.primaryBlue,
    },

    footer: {
      backgroundColor: colors.cardBackground,
      borderRadius: 22,
      padding: 35,
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme === "dark" ? 0.4 : 0.2,
          shadowRadius: 15,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    footerIconBg: {
      width: 70,
      height: 70,
      backgroundColor: colors.lightBlue,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      borderWidth: 3,
      borderColor: colors.accentBlue,
    },

    footerIcon: {
      fontSize: 36,
    },

    footerTitle: {
      fontSize: 24,
      fontFamily: "Pacifico-Regular",
      color: colors.textPrimary,
      marginBottom: 5,
    },

    footerText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 25,
      lineHeight: 22,
      paddingHorizontal: 10,
    },

    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryBlue,
      paddingVertical: 18,
      paddingHorizontal: 35,
      borderRadius: 50,
      marginBottom: 25,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },

    contactButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginRight: 8,
    },

    contactButtonIcon: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold",
    },

    footerCopyright: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
    },
  });
};

export default getStyles;
