import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Main Content
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header với thiết kế mới
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  welcomeContainer: {
    alignItems: 'flex-start',
  },
  greetingText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: "#4B5563",
    fontStyle: 'italic',
  },
  
  // Quick Actions
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickActionButton: {
    width: (width - 60) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  
  // Section Containers
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  viewAllText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "500",
  },
  
  // Courses với thiết kế mới
  coursesContainer: {
    marginTop: 16,
  },
  courseCard: {
     width: 300,      
  marginRight: 16,
  borderRadius: 16,
  overflow: "hidden",
  
  },
  courseCardInner: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  courseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 160,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
    flexDirection: 'row',
  },
  courseLevelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseLevelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
   fontSize: 14,
  fontWeight: "600",
  color: "#111",
  marginBottom: 6,
  flexShrink: 1,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  courseDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
    minWidth: 35,
  },
  
  // Projects Grid với thiết kế mới
  
  projectCard: {
  marginRight: 16,
  
  },
  projectCardInner: {
    width: 200,    
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#fff",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
  },
  projectPreview: {
    width: "100%",
    height: 80,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
     height: 160, 
  },
  projectFooter: {
 flex: 1,
  padding: 16,
  justifyContent: 'space-between',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    flexShrink: 1, 
  },
  projectTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDate: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  
  // Create Project Card với thiết kế cải tiến
  createProjectCard: {
    width: (width - 52) / 2,
    marginBottom: 16,
  },
  createProjectCardInner: {
    borderRadius: 20,
    padding: 16,
    height: 180,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createProjectIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  createProjectText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    textAlign: 'center',
    marginBottom: 4,
  },
  createProjectSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});