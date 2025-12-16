import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

const lightColors = {
  background: "#F8FAFC",
  text: "#1F2937",
  textSecondary: "#6B7280",
  cardBackground: "#FFFFFF",
  borderColor: "#E5E7EB",
  iconColor: "#374151",
  primary: "#2563EB",
  secondary: "#F3F4F6",
  shadowColor: "#000",
  heroOverlayStart: "rgba(0,0,0,0.3)",
  heroOverlayEnd: "rgba(0,0,0,0.8)",
  heroText: "white",
  heroTextSecondary: "rgba(255, 255, 255, 0.9)",
  sectionHeader: "#1F2937",
  instructorName: "#111827",
  instructorRole: "#6B7280",
  includesBg: "#F8FAFC",
  includesBorder: "#E2E8F0",
  includesTitle: "#111827",
  includesText: "#4B5563",
  priceLabel: "#6B7280",
  originalPrice: "#9CA3AF",
  discountPrice: "#111827",
  trustText: "#374151",
  curriculumTitle: "#111827",
  curriculumMeta: "#6B7280",
  lessonTitle: "#374151",
  lessonDuration: "#9CA3AF",
  lessonContentText: "#6B7280",
  averageRating: "#1F2937",
  totalReviews: "#6B7280",
  ratingBarBg: "#F3F4F6",
  ratingBarText: "#6B7280",
  reviewItemBg: "#F8FAFC",
  reviewerName: "#1F2937",
  reviewDate: "#9CA3AF",
  reviewComment: "#4B5563",
  noReviews: "#9CA3AF",
  modalOverlay: "rgba(0, 0, 0, 0.6)",
  modalContent: "white",
  modalTitle: "#1F2937",
  modalMessage: "#6B7280",
  cancelButtonBg: "white",
  cancelButtonText: "#4B5563",
  cancelButtonBorder: "#E5E7EB",
  modalIconBg: "#EFF6FF",
  star: "#F59E0B",
  success: "#10B981",
  error: "#EF4444",
  white: "#3B82F6",
  bestValueIcon: "#DC2626",
  arrowIcon: "#9CA3AF",
  shoppingCartIcon: "#2348bfff",
};

const darkColors = {
  background: "#0F172A",
  text: "#F3F4F6",
  textSecondary: "#9CA3AF",
  cardBackground: "#1E293B",
  borderColor: "#334155",
  iconColor: "#D1D5DB",
  primary: "#3B82F6",
  secondary: "#334155",
  shadowColor: "#000",
  heroOverlayStart: "rgba(0,0,0,0.5)",
  heroOverlayEnd: "rgba(0,0,0,0.9)",
  heroText: "#F9FAFB",
  heroTextSecondary: "rgba(255, 255, 255, 0.8)",
  sectionHeader: "#F3F4F6",
  instructorName: "#F9FAFB",
  instructorRole: "#9CA3AF",
  includesBg: "#1E293B",
  includesBorder: "#334155",
  includesTitle: "#F3F4F6",
  includesText: "#D1D5DB",
  priceLabel: "#9CA3AF",
  originalPrice: "#6B7280",
  discountPrice: "#F3F4F6",
  trustText: "#D1D5DB",
  curriculumTitle: "#F3F4F6",
  curriculumMeta: "#9CA3AF",
  lessonTitle: "#E5E7EB",
  lessonDuration: "#6B7280",
  lessonContentText: "#9CA3AF",
  averageRating: "#F3F4F6",
  totalReviews: "#9CA3AF",
  ratingBarBg: "#334155",
  ratingBarText: "#9CA3AF",
  reviewItemBg: "#0F172A",
  reviewerName: "#F3F4F6",
  reviewDate: "#6B7280",
  reviewComment: "#D1D5DB",
  noReviews: "#6B7280",
  modalOverlay: "rgba(0, 0, 0, 0.8)",
  modalContent: "#1E293B",
  modalTitle: "#F3F4F6",
  modalMessage: "#D1D5DB",
  cancelButtonBg: "#334155",
  cancelButtonText: "#E5E7EB",
  cancelButtonBorder: "#475569",
  modalIconBg: "#1E293B",
  star: "#F59E0B",
  success: "#34D399",
  error: "#F87171",
  white: "#FFFFFF",
  bestValueIcon: "#F87171",
  arrowIcon: "#9CA3AF",
  shoppingCartIcon: "#60A5FA",
};

export const getStyles = (theme = "light") => {
  const colors = theme === "dark" ? darkColors : lightColors;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },

    // HERO SECTION
    heroContainer: {
      height: 400,
      width: "100%",
      position: "relative",
      justifyContent: "flex-end",
    },
    heroImage: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    heroHeader: {
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      zIndex: 10,
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 30,
      width: 50,
      height: 50,
      borderRadius: 22,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 10,
    },
    heroContent: {
      paddingHorizontal: 32,
      paddingBottom: 48,
      maxWidth: 1300,
      width: "100%",
      alignSelf: "center",
    },
    heroBadges: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    levelBadge: {
      backgroundColor: "rgba(37, 99, 235, 0.9)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    levelBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    categoryBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    categoryBadgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    heroTitle: {
      fontSize: 42,
      fontWeight: "800",
      color: colors.heroText,
      marginBottom: 12,
      fontFamily: "Pacifico-Regular",
      textShadowColor: "rgba(0, 0, 0, 0.3)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      lineHeight: 52,
    },
    heroSubtitle: {
      fontSize: 18,
      color: colors.heroTextSecondary,
      marginBottom: 24,
      maxWidth: 800,
      lineHeight: 28,
      fontFamily: "Poppins-Medium",
    },
    heroMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    heroMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    heroMetaText: {
      color: colors.heroText,
      fontSize: 14,
      fontWeight: "600",
    },
    heroDivider: {
      width: 1,
      height: 16,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
    },

    // LAYOUT 2 CỘT
    twoColumnContainer: {
      flexDirection: "row",
      padding: 32,
      gap: 32,
      maxWidth: 1300,
      alignSelf: "center",
      width: "100%",
      justifyContent: "space-between",
      marginTop: -40, // Overlap hero section
    },

    // CỘT TRÁI
    leftColumn: {
      flex: 1.5,
    },

    mainCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      overflow: "hidden",
      padding: 32,
    },
    sectionHeaderTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.sectionHeader,
      marginBottom: 24,
      fontFamily: "Poppins-Medium",
    },
    instructorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 24,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    instructorAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    instructorInitial: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.primary,
    },
    instructorName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.instructorName,
    },
    instructorRole: {
      fontSize: 14,
      color: colors.instructorRole,
    },

    courseInfo: {
      // padding handled by mainCard
    },

    descriptionText: {
      marginBottom: 32,
    },

    descriptionContent: {
      fontSize: 16,
      lineHeight: 28,
      color: colors.includesText,
    },

    includesSection: {
      backgroundColor: colors.includesBg,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.includesBorder,
    },

    includesTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.includesTitle,
      marginBottom: 16,
    },
    includesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    includeItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "48%", // 2 columns
    },

    includeText: {
      fontSize: 14,
      color: colors.includesText,
      flex: 1,
    },

    // CỘT PHẢI
    rightColumn: {
      flex: 1,
    },

    stickyCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 28,
      overflow: "hidden",
      marginHorizontal: 20,
      marginVertical: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 32,
      elevation: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
    },

    cardGlowTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: colors.primary,
    },

    priceSection: {
      padding: 28,
      paddingTop: 20,
    },

    bestValueBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: "#FEE2E2",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
      gap: 6,
    },
    bestValueText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#DC2626",
    },

    priceLabel: {
      fontSize: 15,
      color: colors.priceLabel,
      fontWeight: "600",
      marginBottom: 8,
    },

    priceRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 12,
      marginBottom: 8,
    },

    originalPrice: {
      fontSize: 22,
      color: colors.originalPrice,
      textDecorationLine: "line-through",
      textDecorationColor: colors.originalPrice,
    },

    discountPrice: {
      fontSize: 42,
      fontWeight: "900",
      color: colors.discountPrice,
      letterSpacing: -1,
    },

    discountBadge: {
      backgroundColor: "#DC2626",
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 20,
    },
    discountText: {
      color: "white",
      fontSize: 14,
      fontWeight: "800",
    },

    primaryButton: {
      height: 62,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },

    buttonGradient: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },

    buttonText: {
      fontSize: 18,
      fontWeight: "800",
      color: "white",
      letterSpacing: 0.5,
    },

    trustRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },

    trustItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    trustText: {
      fontSize: 13,
      color: colors.trustText,
      fontWeight: "600",
    },

    curriculumSection: {
      padding: 24,
      backgroundColor: colors.cardBackground,
    },

    curriculumHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    curriculumTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.curriculumTitle,
    },

    curriculumMeta: {
      fontSize: 13,
      color: colors.curriculumMeta,
      fontWeight: "500",
    },

    lessonItem: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      marginBottom: 8,
    },

    lessonHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },

    lessonHeaderLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    lessonIndexBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    lessonIndex: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },

    lessonInfo: {
      flex: 1,
    },

    lessonTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.lessonTitle,
      marginBottom: 2,
    },

    lessonDuration: {
      fontSize: 12,
      color: colors.lessonDuration,
    },

    lessonContent: {
      paddingLeft: 40,
      paddingRight: 16,
      paddingBottom: 16,
    },

    lessonContentText: {
      fontSize: 14,
      color: colors.lessonContentText,
      lineHeight: 20,
    },

    // FEEDBACK SECTION
    feedbackCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 24,
      padding: 32,
    },
    feedbackContent: {
      flexDirection: "row",
      gap: 40,
    },

    // Left Side: Rating Summary
    ratingSummaryColumn: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: colors.borderColor,
      paddingRight: 40,
    },

    ratingOverview: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },

    averageRating: {
      fontSize: 72,
      fontWeight: "800",
      color: colors.averageRating,
      lineHeight: 72,
      marginBottom: 8,
    },
    starsWrapper: {
      marginBottom: 8,
      transform: [{ scale: 1.2 }],
    },

    starsContainer: {
      flexDirection: "row",
      gap: 4,
    },

    totalReviews: {
      fontSize: 14,
      color: colors.totalReviews,
      fontWeight: "500",
    },

    ratingDistribution: {
      gap: 12,
      width: "100%",
    },

    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    ratingStars: {
      flexDirection: "row",
      gap: 2,
      minWidth: 80,
    },

    ratingBarContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    ratingBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.ratingBarBg,
      borderRadius: 4,
      overflow: "hidden",
    },

    ratingBarFill: {
      height: "100%",
      backgroundColor: "#F59E0B",
      borderRadius: 4,
    },

    ratingBarText: {
      fontSize: 13,
      color: colors.ratingBarText,
      fontWeight: "500",
      minWidth: 30,
      textAlign: "right",
    },

    // Right Side: Reviews List
    reviewsListColumn: {
      flex: 2,
    },

    reviewsList: {
      gap: 24,
    },

    reviewItem: {
      backgroundColor: colors.reviewItemBg,
      borderRadius: 16,
      padding: 24,
      gap: 16,
    },

    reviewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },

    reviewerInfo: {
      flexDirection: "row",
      gap: 16,
      flex: 1,
    },

    reviewerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.secondary,
    },

    reviewerAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#BFDBFE",
      alignItems: "center",
      justifyContent: "center",
    },

    reviewerInitial: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1D4ED8",
    },

    reviewerDetails: {
      flex: 1,
      gap: 4,
    },

    reviewerName: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.reviewerName,
    },

    reviewMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    reviewDate: {
      fontSize: 13,
      color: colors.reviewDate,
    },

    reviewComment: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.reviewComment,
    },
    noReviews: {
      textAlign: "center",
      fontSize: 15,
      color: colors.noReviews,
      paddingVertical: 40,
      fontStyle: "italic",
    },

    // LOADING & ERROR
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },

    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: 32,
    },

    errorText: {
      fontSize: 16,
      color: "#DC2626",
      marginTop: 16,
      textAlign: "center",
      fontWeight: "500",
    },

    retryButton: {
      marginTop: 24,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },

    retryButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
    },

    // MODALS
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backdropFilter: "blur(4px)",
    },
    modalContent: {
      backgroundColor: colors.modalContent,
      borderRadius: 24,
      padding: 32,
      alignItems: "center",
      width: "100%",
      maxWidth: 420,
      shadowColor: colors.shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    modalIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.modalIconBg,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.modalTitle,
      marginBottom: 12,
      fontFamily: "Poppins-Medium",
    },
    modalMessage: {
      fontSize: 16,
      color: colors.modalMessage,
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 32,
    },
    modalButtons: {
      flexDirection: "row",
      gap: 16,
      width: "100%",
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.cancelButtonBorder,
      alignItems: "center",
      backgroundColor: colors.cancelButtonBg,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.cancelButtonText,
    },
    confirmButton: {
      flex: 1,
      borderRadius: 14,
      overflow: "hidden",
    },
    confirmButtonGradient: {
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "white",
    },
    // Expose colors for component usage
    colors: colors,
  });
};