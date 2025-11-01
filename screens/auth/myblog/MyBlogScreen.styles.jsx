import { StyleSheet } from "react-native";

export const myBlogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 6,
  },
  headerButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#070707ff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 4,
  },
  createButton: {
    marginTop: 20,
    borderRadius: 50,
    overflow: "hidden",
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  blogItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  blogImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  blogInfo: {
    flex: 1,
    justifyContent: "center",
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  blogDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  blogDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  actionColumn: {
    alignItems: "center",
    justifyContent: "space-around",
    height: 70,
    gap: 10,
  },
});
