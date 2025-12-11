import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 32) / 4; // 4 columns

export const myCoursesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  containerDark: {
    backgroundColor: "#0F172A",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  centerContainerDark: {
    backgroundColor: "#0F172A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerDark: {
    backgroundColor: "#1E293B",
    borderBottomColor: "#334155",
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
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  headerSubtitleDark: {
    color: "#94A3B8",
  },

  // Hero Banner (Consistent with CoursesScreen)
  heroContainer: {
    height: 300,
    position: "relative",
    marginBottom: 20,
    marginTop: -20,
    marginHorizontal: -20,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroTitle: {
    fontSize: 50,
    fontFamily: "Pacifico-Regular",
    color: "#FFFFFF",
    letterSpacing: -1,
    lineHeight: 50,
    marginLeft: 20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginTop: 8,
    fontFamily: "Poppins-Medium",
    opacity: 0.95,
    marginLeft: 20,
  },

  // Content
  content: {
    flex: 1,
    paddingTop: 20,
  },

  // 2-Column Grid Layout
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  courseCardWrapper: {
    width: cardWidth,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // Premium Course Card
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  courseCardDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
    shadowColor: "#000",
  },

  // Image with Gradient
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#E2E8F0",
  },
  imageContainerDark: {
    backgroundColor: "#334155",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
    justifyContent: "flex-end",
    padding: 12,
  },

  // Category Badge on Top-Left
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8, 79, 140, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Floating Feedback Button
  feedbackButtonFloat: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  feedbackButtonFloatDark: {
    backgroundColor: "rgba(30, 41, 59, 0.95)",
  },

  // Course Info
  courseInfo: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 18,
    letterSpacing: -0.2,
    marginBottom: 5,
    minHeight: 36,
  },
  courseTitleDark: {
    color: "#F1F5F9",
  },
  courseSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
    lineHeight: 14,
  },
  courseSubtitleDark: {
    color: "#94A3B8",
  },

  // Meta Info
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  metaContainerDark: {
    backgroundColor: "#0F172A",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  metaDividerDark: {
    backgroundColor: "#475569",
  },
  metaText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  metaTextDark: {
    color: "#94A3B8",
  },

  // Premium Progress
  progressSection: {
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBarContainerDark: {
    backgroundColor: "#334155",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 10,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    textAlign: "right",
  },
  progressTextDark: {
    color: "#94A3B8",
  },

  // Premium Continue Button
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#084F8C",
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  // Premium Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 120,
    padding: 20,
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyIconContainerDark: {
    backgroundColor: "#1E293B",
    shadowColor: "#000",
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  emptyTitleDark: {
    color: "#FFFFFF",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: "500",
  },
  emptyDescriptionDark: {
    color: "#94A3B8",
  },
  exploreButton: {
    marginTop: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 36,
    paddingVertical: 18,
    backgroundColor: "#084F8C",
    borderRadius: 20,
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  exploreButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // Compact Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: "85%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  modalContentDark: {
    backgroundColor: "#1E293B",
  },

  // Compact Modal Header
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  modalHeaderDark: {
    borderBottomColor: "transparent",
  },
  modalIconContainer: {
    marginBottom: 12,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  modalIconDark: {
    backgroundColor: "#0F172A",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
  },
  modalTitleDark: {
    color: "#FFFFFF",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  modalSubtitleDark: {
    color: "#94A3B8",
  },
  closeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonDark: {
    backgroundColor: "#334155",
  },

  // Compact Section
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  sectionLabelDark: {
    color: "#F1F5F9",
  },

  // Compact Star Rating
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  starsContainerDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  starButton: {
    padding: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    backgroundColor: "#FFF7ED",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "center",
  },
  ratingBadgeDark: {
    backgroundColor: "#7c2d12",
  },
  ratingEmoji: {
    fontSize: 18,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EA580C",
    letterSpacing: 0.2,
  },
  ratingTextDark: {
    color: "#fdba74",
  },

  // Compact Comment Input
  commentInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#0F172A",
    minHeight: 80,
    lineHeight: 18,
    fontWeight: "500",
  },
  commentInputDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    color: "#F1F5F9",
  },
  charCount: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 4,
    fontWeight: "600",
  },

  // Compact Action Buttons
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelButtonDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.2,
  },
  cancelButtonTextDark: {
    color: "#94A3B8",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#084F8C",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonDisabledDark: {
    backgroundColor: "#334155",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});