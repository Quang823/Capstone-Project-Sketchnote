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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
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
    color: "#084F8C",
    letterSpacing: -0.5,
  },

  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
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
    backgroundColor: "#07dec9ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#14b2daff",
  },
  typeBadgeBlue: {
    backgroundColor: "#084F8C",
    borderColor: "#084F8C",
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
  resourceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
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
    backgroundColor: "#084F8C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#084F8C",
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
    backgroundColor: "#084F8C",
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
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addToCartButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#084F8C",
  },
  addToCartButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#084F8C",
  },
  buyNowButton: {
    backgroundColor: "#084F8C",
    borderWidth: 2,
    borderColor: "#084F8C",
  },
  buyNowButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Write Review
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#084F8C",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#084F8C",
  },
  writeReviewText: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // Reviews & Ratings Section
  reviewsSection: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  reviewsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#F1F5F9",
  },
  reviewsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  reviewsSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  // Rating Stats Card
  ratingStatsCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  ratingOverview: {
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    marginRight: 24,
    paddingRight: 24,
    borderRightWidth: 2,
    borderRightColor: "#E2E8F0",
  },
  ratingNumberContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 56,
  },
  ratingMaxText: {
    marginTop: -4,
  },
  ratingOutOf: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  starsContainerSmall: {
    flexDirection: "row",
    marginVertical: 6,
    gap: 2,
  },
  totalReviews: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },

  ratingBars: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    backgroundColor: "#FFC107",
    borderRadius: 5,
  },
  barPercentage: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  starLabel: {
    fontSize: 13,
    color: "#64748B",
    width: 14,
    textAlign: "right",
    fontWeight: "700",
  },

  // Reviews List
  reviewsList: {
    gap: 16,
  },
  reviewsListTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  reviewItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  reviewerInfoContainer: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  reviewComment: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginTop: 4,
  },

  // No Reviews State
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
});
