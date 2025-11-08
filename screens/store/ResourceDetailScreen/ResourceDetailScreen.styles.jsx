import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: "#FFF9E6", // Warm cream paper color
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D", // Hand-drawn dark border
    shadowColor: "#FFD93D",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 2,
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    alignSelf: "stretch",
  },
  rightColumnContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 2,
    flex: 1,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2D2D2D",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B5B95",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#90CAF9", // Bright yellow
    borderBottomWidth: 3,
    borderBottomColor: "#2D2D2D",
    paddingTop: 60,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D2D2D",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF6B9D", // Pink accent
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },

  // Image Gallery
  imageGalleryContainer: {
    marginBottom: 16,
  },
  mainImageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D2D2D",
    shadowColor: "#6BCF7F",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
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
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    overflow: "hidden",
    backgroundColor: "#FFF9E6",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 2,
  },
  thumbnailActive: {
    borderColor: "#FF6B9D",
    shadowColor: "#FF6B9D",
    shadowOpacity: 0.5,
    backgroundColor: "#FFE5EE",
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
    backgroundColor: "#6B5B95", // Purple
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
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
    marginBottom: 12,
  },
  resourceName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2D2D2D",
    marginBottom: 6,
    lineHeight: 28,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6B9D",
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: "#6B5B95",
    fontWeight: "600",
  },

  // Author Section
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F8FF", 
    padding: 12,
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 11,
    color: "#6B5B95",
    marginBottom: 2,
    fontWeight: "600",
  },
  authorName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D2D2D",
  },
  followButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6BCF7F", // Green
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },

  // Price Section
  price: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FF6B9D",
    marginBottom: 12,
  },

  // Options
  optionsContainer: {
    marginBottom: 16,
  },
  optionsLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 8,
  },
  optionsButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    borderColor: "#2D2D2D",
    backgroundColor: "#FFD93D",
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2D2D2D",
  },
  optionButtonTextSelected: {
    color: "#2D2D2D",
    fontWeight: "800",
  },

  // Quantity
  quantityContainer: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 8,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2D2D2D",
    borderRadius: 12,
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
    color: "#2D2D2D",
    fontWeight: "800",
  },
  quantityValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#2D2D2D",
  },

  // Sections
  section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  sectionInner: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#FFD93D",
    borderStyle: "dashed",
  },
  sectionInnerLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#6B5B95",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: "#2D2D2D",
    lineHeight: 20,
  },

  // Info Grid
  infoGrid: {
    gap: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5CC", // Light yellow
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B5B95",
    marginBottom: 2,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D2D2D",
  },

  // Items List
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#E5F8FF",
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  itemBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B9D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  itemBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    color: "#2D2D2D",
    lineHeight: 18,
    fontWeight: "600",
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  addToCartButton: {
    backgroundColor: "#FF6B9D",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  buyNowButton: {
    borderWidth: 2,
    borderColor: "#2D2D2D",
    backgroundColor: "#6BCF7F",
    shadowColor: "#6BCF7F",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  buyNowButtonText: {
    color: "#2D2D2D",
    fontWeight: "800",
  },

  // 🔵 Reviews & Feedback
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6B5B95",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  writeReviewText: {
    marginLeft: 4,
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  ratingStats: {
    flexDirection: "row",
    backgroundColor: "#FFF5CC",
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  ratingOverview: {
    alignItems: "center",
    width: 90,
    marginRight: 16,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF6B9D",
  },
  starsContainerSmall: {
    flexDirection: "row",
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 12,
    color: "#6B5B95",
    fontWeight: "600",
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
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#2D2D2D",
  },
  barFill: {
    height: 6,
    backgroundColor: "#FFD93D",
    borderRadius: 3,
  },
  barPercentage: {
    fontSize: 12,
    color: "#2D2D2D",
    fontWeight: "700",
  },
  starLabel: {
    fontSize: 12,
    color: "#2D2D2D",
    width: 12,
    textAlign: "right",
    fontWeight: "700",
  },

  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    borderWidth: 2,
    borderColor: "#2D2D2D",
    shadowColor: "#6BCF7F",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  reviewerInfoContainer: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2D2D2D",
  },
  reviewRating: {
    flexDirection: "row",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B5B95",
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 14,
    color: "#2D2D2D",
    lineHeight: 22,
    marginBottom: 8,
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
    color: "#6B5B95",
    marginLeft: 4,
    fontWeight: "600",
  },
  loadMoreButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#E5F8FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2D2D2D",
  },
  loadMoreText: {
    color: "#2D2D2D",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 4,
  },
});