import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 60,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Image Gallery
  imageGalleryContainer: {
    height: 280,
    backgroundColor: '#000',
    position: 'relative',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  typeBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  typeBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Info Container
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  
  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resourceName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Author Section
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Price Section
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981',
  },
  releaseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  releaseDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },

  // Info Grid
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  // Items List
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },
  itemBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
  },
  buyNowButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // 🔵 Reviews & Feedback
reviewsHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},
writeReviewButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#EEF2FF',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
},
writeReviewText: {
  marginLeft: 6,
  color: '#4F46E5',
  fontWeight: '600',
  fontSize: 14,
},

ratingStats: {
  flexDirection: 'row',
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
},
ratingOverview: {
  alignItems: 'center',
  width: 90,
  marginRight: 16,
},
ratingNumber: {
  fontSize: 36,
  fontWeight: '800',
  color: '#111827',
},
starsContainerSmall: {
  flexDirection: 'row',
  marginVertical: 4,
},
totalReviews: {
  fontSize: 12,
  color: '#6B7280',
},

ratingBars: {
  flex: 1,
  justifyContent: 'center',
  gap: 6,
},
ratingBarRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
barContainer: {
  flex: 1,
  height: 6,
  backgroundColor: '#E5E7EB',
  borderRadius: 4,
  marginHorizontal: 6,
},
barFill: {
  height: 6,
  backgroundColor: '#4F46E5',
  borderRadius: 4,
},
barPercentage: {
  fontSize: 12,
  color: '#6B7280',
},
starLabel: {
  fontSize: 12,
  color: '#111827',
  width: 12,
  textAlign: 'right',
},

reviewsList: {
  gap: 16,
},
reviewItem: {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 1,
},
reviewHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
reviewerAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 10,
},
reviewerInfoContainer: {
  flex: 1,
},
reviewerName: {
  fontSize: 15,
  fontWeight: '600',
  color: '#111827',
},
reviewRating: {
  flexDirection: 'row',
},
reviewDate: {
  fontSize: 12,
  color: '#9CA3AF',
},
reviewComment: {
  fontSize: 14,
  color: '#374151',
  lineHeight: 22,
  marginBottom: 8,
},
reviewActions: {
  flexDirection: 'row',
  gap: 16,
},
reviewActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
},
reviewActionText: {
  fontSize: 13,
  color: '#6B7280',
  marginLeft: 4,
},
loadMoreButton: {
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
},
loadMoreText: {
  color: '#4F46E5',
  fontWeight: '600',
  fontSize: 14,
  marginRight: 4,
},

  });