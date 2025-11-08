import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const resourceStoreStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6', // Warm cream paper
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2D2D2D',
    fontWeight: '700',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#90CAF9', // Bright blue header
    paddingTop: 60,
    elevation: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2D2D2D',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF9E6',
    marginBottom: 4,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingLeft: 44,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2D2D2D',
    fontWeight: '600',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  // Category
  categoryContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFF9E6',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryButton: {
    backgroundColor: '#6BCF7F', // Green for selected
    shadowColor: '#6BCF7F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '700',
  },
  selectedCategoryText: {
    color: '#2D2D2D',
    fontWeight: '800',
  },

  // Section
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#FFF9E6',
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6B5B95', // Purple for section titles
  },

  // Resource Card
  resourceCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#FFF5CC',
  },
  resourceImage: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6B5B95',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#6B5B95',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  resourceInfo: {
    padding: 16,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2D2D2D',
    marginBottom: 6,
    lineHeight: 22,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#6B5B95',
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6B9D',
    marginBottom: 12,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addToCartButton: {
    backgroundColor: '#FF6B9D', // Pink
  },
  buyNowButton: {
    backgroundColor: '#6BCF7F', // Green
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B5B95',
    fontWeight: '700',
  },
});