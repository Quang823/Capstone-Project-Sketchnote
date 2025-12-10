import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

export const courseDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
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
    color: "white",
    marginBottom: 12,
    fontFamily: "Pacifico-Regular",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 52,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
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
    color: "white",
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
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    padding: 32,
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
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
    borderBottomColor: "#F3F4F6",
  },
  instructorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  instructorInitial: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3B82F6",
  },
  instructorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  instructorRole: {
    fontSize: 14,
    color: "#6B7280",
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
    color: "#4B5563",
  },

  includesSection: {
    backgroundColor: "#F8FAFC",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  includesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
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
    color: "#4B5563",
    flex: 1,
  },

  // CỘT PHẢI
  rightColumn: {
    flex: 1,
  },

  stickyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardGlowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#3B82F6",
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
    color: "#6B7280",
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
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    textDecorationColor: "#9CA3AF",
  },

  discountPrice: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111827",
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
    shadowColor: "#2563EB",
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
    borderTopColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  trustText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  curriculumSection: {
    padding: 24,
    backgroundColor: "white",
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
    color: "#111827",
  },

  curriculumMeta: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  lessonItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonIndex: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },

  lessonInfo: {
    flex: 1,
  },

  lessonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },

  lessonDuration: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  lessonContent: {
    paddingLeft: 40,
    paddingRight: 16,
    paddingBottom: 16,
  },

  lessonContentText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  // FEEDBACK SECTION
  feedbackCard: {
    backgroundColor: "white",
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
    borderRightColor: "#F3F4F6",
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
    color: "#1F2937",
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
    color: "#6B7280",
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
    backgroundColor: "#F3F4F6",
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
    color: "#6B7280",
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
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#E5E7EB",
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
    color: "#1F2937",
  },

  reviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  reviewDate: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  reviewComment: {
    fontSize: 15,
    lineHeight: 24,
    color: "#4B5563",
  },
  noReviews: {
    textAlign: "center",
    fontSize: 15,
    color: "#9CA3AF",
    paddingVertical: 40,
    fontStyle: "italic",
  },

  // LOADING & ERROR
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
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
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#2563EB",
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: "Poppins-Medium",
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});