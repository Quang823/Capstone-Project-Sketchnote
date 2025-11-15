import { StyleSheet } from 'react-native';

export const lessonStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },

  // Left Sidebar
  sidebar: {
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingTop: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sidebarHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sidebarScroll: {
    flex: 1,
  },
  overviewItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  overviewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarItemActive: {
    backgroundColor: '#374151',
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  sidebarItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sidebarItemLocked: {
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  sidebarItemTextLocked: {
    color: '#9CA3AF',
  },
  sidebarItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sidebarItemExpanded: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sidebarItemContent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
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
    gap: 6,
  },
  sidebarMetaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Progress Circle
  progressCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressCircleInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#22C55E', // xanh lá - hoàn thành
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCirclePercent: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  
  // Play Button
  sidebarPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFB347',
    borderRadius: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sidebarPlayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sidebarPlayButtonLocked: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sidebarPlayTextLocked: {
    color: '#9CA3AF',
  },

  // Main Content
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
   
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E', // xanh lá = tiến độ
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    minWidth: 40,
  },

  // Content Scroll
  contentScroll: {
    flex: 1,
    paddingHorizontal: 32,
  },
  lessonMainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginBottom: 20,
  },

  // Video Player
  playerWrap: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  noVideoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  noVideoText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  // Tab Content
  tabContent: {
    marginBottom: 32,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  previousButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 120,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previousButtonText: {
    color: '#2563EB',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  completeButton: {
    backgroundColor: '#22C55E', // xanh lá cho nút hoàn thành
    flex: 1,
    maxWidth: 200,
  },
  completeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444', // đỏ cho lỗi
    marginTop: 16,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#F59E0B', // cam cho cảnh báo
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
