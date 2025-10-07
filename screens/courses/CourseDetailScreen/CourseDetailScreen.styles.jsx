import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const courseDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  courseImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
  },
  courseInfoContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructorText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 6,
  },
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 4,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  enrollButton: {
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  enrollButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4B5563",
  },
  includeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  includeText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
  contentMeta: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  moduleContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  moduleHeaderLeft: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  moduleMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  lessonsContainer: {
    backgroundColor: "white",
  },
  lessonItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  lessonInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
    flex: 1,
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  previewButtonText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
  },
  lessonDuration: {
    fontSize: 12,
    color: "#6B7280",
  },
});