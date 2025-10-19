import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FAFF", // gradient background handled in LinearGradient
  },

  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header
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
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  welcomeContainer: {
    alignItems: "flex-start",
  },
  greetingText: {
    fontSize: 16,
    color: "#1E40AF",
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 16,
    color: "#1E3A8A",
    fontStyle: "italic",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A8A",
    flex: 1,
  },

  // Section
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
    fontWeight: "700",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },

  // Courses
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
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  courseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 160,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    flexDirection: "row",
  },
  courseLevelBadge: {
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseLevelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 6,
    flexShrink: 1,
  },
  courseMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 6,
  },
  courseDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  courseDuration: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E0F2FE",
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    minWidth: 35,
  },

  // Projects
  projectCard: {
    marginRight: 16,
  },
  projectCardInner: {
    width: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  projectPreview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 0,
  },
  projectFooter: {
    padding: 16,
    justifyContent: "space-between",
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    flexShrink: 1,
  },
  projectTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDate: {
    fontSize: 12,
    color: "#1E40AF",
    marginLeft: 4,
  },
});
