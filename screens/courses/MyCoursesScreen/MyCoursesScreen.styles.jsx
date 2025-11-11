import { StyleSheet } from "react-native";

export const myCoursesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#4F46E5",
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 24,
  },
  exploreButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 24,
    marginBottom: 16,
  },

  // Course Card
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  courseImage: {
    width: 110,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E0E7FF",
  },
  courseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },

  // Meta Info
  courseMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },

  // Progress
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  categoryPriceRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 4,
  marginBottom: 6,
},

categoryBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#E0E7FF",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
},
categoryText: {
  color: "#fff",
  fontSize: 12,
  marginLeft: 4,
  fontWeight: "500",
},
priceText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#10B981", // xanh lá
},

// Chỉnh lại metaText đậm hơn chút
metaText: {
  fontSize: 12,
  color: "#374151",
  marginLeft: 4,
  fontWeight: "500",
},

});
