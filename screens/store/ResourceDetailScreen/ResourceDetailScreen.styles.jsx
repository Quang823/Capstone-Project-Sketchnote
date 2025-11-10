import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flex: 1,
  },
  mainContent: {
    flexDirection: "row",
    padding: 16,
  },
  leftColumn: {
    flex: 1,
    marginRight: 16,
    alignSelf: "stretch",
  },
  leftColumnContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignSelf: "stretch",
  },
  rightColumnContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingTop: 60,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#60A5FA",
    borderWidth: 1,
    borderColor: "#60A5FA",
  },

  // Image Gallery
  imageGalleryContainer: {
    marginBottom: 20,
  },
  mainImageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailContainer: {
    marginTop: 6,
  },
  thumbnailContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  thumbnailWrapper: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  thumbnailActive: {
    borderColor: "#60A5FA",
    borderWidth: 2,
    backgroundColor: "#EFF6FF",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  typeBadgeContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  typeBadge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // Info Container
  infoContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // Title Section
  titleSection: {
    marginBottom: 16,
  },
  resourceName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // Author Section
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
    fontWeight: "500",
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#60A5FA",
  },

  // Price Section
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },

  // Options
  optionsContainer: {
    marginBottom: 20,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  optionsButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    borderColor: "#60A5FA",
    backgroundColor: "#EFF6FF",
    borderWidth: 2,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  optionButtonTextSelected: {
    color: "#1E293B",
    fontWeight: "700",
  },

  // Quantity
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    width: 120,
    backgroundColor: "#FFFFFF",
  },
  quantityActionButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityActionText: {
    fontSize: 20,
    color: "#1E293B",
    fontWeight: "700",
  },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  // Sections
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionInner: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionInnerLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },

  // Info Grid
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 2,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },

  // Items List
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#60A5FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  addToCartButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#60A5FA",
    borderWidth: 2,
  },
  buyNowButton: {
    backgroundColor: "#60A5FA",
    borderColor: "#60A5FA",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#60A5FA",
  },
  buyNowButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // Reviews & Feedback
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#60A5FA",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#60A5FA",
  },
  writeReviewText: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  ratingStats: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ratingOverview: {
    alignItems: "center",
    width: 90,
    marginRight: 20,
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1E293B",
  },
  starsContainerSmall: {
    flexDirection: "row",
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  ratingBars: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: "#60A5FA",
    borderRadius: 4,
  },
  barPercentage: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    width: 32,
  },
  starLabel: {
    fontSize: 12,
    color: "#64748B",
    width: 12,
    textAlign: "right",
    fontWeight: "600",
  },

  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  reviewerInfoContainer: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewDate: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  reviewComment: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 10,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 16,
  },
  reviewActionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewActionText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 4,
    fontWeight: "600",
  },
  loadMoreButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadMoreText: {
    color: "#1E293B",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 4,
  },
});