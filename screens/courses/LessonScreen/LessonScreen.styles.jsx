import { StyleSheet } from 'react-native';

export const lessonStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  // Left Sidebar - Coursera Style
  sidebar: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
  },
  sidebarHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  sidebarScroll: {
    flex: 1,
  },
  overviewItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  overviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sidebarItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  sidebarItemActive: {
    backgroundColor: '#0EA5E9',
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 21,
  },
  sidebarItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sidebarItemLocked: {
    backgroundColor: '#FAFAFA',
  },
  sidebarItemTextLocked: {
    color: '#94A3B8',
  },
  sidebarItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sidebarItemExpanded: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 0,
    backgroundColor: '#F8FAFC',
  },
  sidebarItemContent: {
    fontSize: 13,
    lineHeight: 21,
    color: '#64748B',
    marginBottom: 16,
  },
  sidebarItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sidebarMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarMetaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Progress Circle - Coursera Style
  progressCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressCircleInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    borderWidth: 2.5,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCirclePercent: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  
  // Play Button - Coursera Style
  sidebarPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
  },
  sidebarPlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sidebarPlayButtonLocked: {
    backgroundColor: '#E2E8F0',
  },
  sidebarPlayTextLocked: {
    color: '#94A3B8',
  },

  // Main Content - Coursera Style
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },

  // Progress Bar - Coursera Style
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0EA5E9',
    minWidth: 48,
  },

  // Content Scroll
  contentScroll: {
    flex: 1,
    paddingHorizontal: 28,
  },
  lessonMainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 20,
    lineHeight: 32,
  },

  // Video Player - Coursera Style
  playerWrap: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  noVideoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E293B',
  },
  noVideoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94A3B8',
  },

  // Tabs - Coursera Style
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#0EA5E9',
    marginBottom: -1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },

  // Tab Content
  tabContent: {
    marginBottom: 32,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 26,
    color: '#475569',
  },

  // Navigation Buttons - Coursera Style
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  previousButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0EA5E9',
    minWidth: 140,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previousButtonText: {
    color: '#0EA5E9',
  },
  navButtonTextDisabled: {
    color: '#94A3B8',
  },
  completeButton: {
    backgroundColor: '#0EA5E9',
    flex: 1,
    maxWidth: 220,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Course Completed Banner
  completedBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 28,
    marginBottom: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedBannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  completedBannerText: {
    fontSize: 15,
    color: '#15803D',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Loading & Error - Coursera Style
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
