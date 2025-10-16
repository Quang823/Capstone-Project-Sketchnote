import { StyleSheet } from "react-native";

export const blogStyles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  headerRight: { width: 40 },

  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#1F2937" },

  categoriesContainer: { paddingLeft: 16, marginBottom: 16 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 8,
  },
  categoryButtonActive: { backgroundColor: "#4F46E5" },
  categoryButtonText: { fontSize: 14, color: "#4B5563" },
  categoryButtonTextActive: { color: "white", fontWeight: "500" },

  blogCard: { marginBottom: 12 },
  blogCardInner: {
    borderRadius: 12,
    backgroundColor: "white",
    overflow: "hidden",
  },
  blogImage: { width: "100%", height: 100, resizeMode: "cover" }, // 👈 giữ nguyên image
  blogContent: { padding: 8 },
  blogTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  blogAuthor: { fontSize: 11, color: "#6B7280", marginBottom: 6 },
  blogMeta: { flexDirection: "row", alignItems: "center" },
  blogViews: {
    fontSize: 11,
    color: "#6B7280",
    marginLeft: 4,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 16, color: "#6B7280", marginTop: 16 },
});
