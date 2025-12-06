import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const myBlogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header with Gradient
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
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

  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginTop: 2,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  createButton: {
    marginTop: 28,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  // Filter Section
  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterBar: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: "#084F8C",
    borderColor: "#084F8C",
  },
  filterChipText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterChipBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  filterChipBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
  },
  filterChipBadgeTextActive: {
    color: "#FFFFFF",
  },

  // Blog List
  listContainer: {
    padding: 20,
  },

  // Blog Card - Modern Design
  blogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // Image Container
  blogImageContainer: {
    position: "relative",
    height: 200,
    width: "100%",
  },
  blogImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  blogImageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Content
  blogContent: {
    padding: 20,
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  blogDesc: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 16,
  },

  // Meta Info
  blogMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  // Actions
  blogActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#084F8C",
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
});