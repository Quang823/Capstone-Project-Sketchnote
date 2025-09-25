import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const PADDING = 16;
const NUM_COLUMNS = 5;
const CARD_WIDTH = (width - PADDING * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export const coursesStyles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#4F46E5",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#4B5563",
  },
  categoryButtonTextActive: {
    color: "white",
    fontWeight: "500",
  },
  coursesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  courseRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  courseCard: {
    flex: 1,
  margin: 8,
  maxWidth: "45%",
  },
  courseCardInner: {
    borderRadius: 16,
    backgroundColor: "white",
    overflow: "hidden",
  },
  courseImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  courseContent: {
    padding: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    height: 40,
  },
  courseInstructor: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  courseMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  courseRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseRatingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    marginLeft: 4,
  },
  courseLevel: {
    fontSize: 10,
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  coursePriceContainer: {
    marginTop: 4,
  },
  coursePrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4F46E5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
});