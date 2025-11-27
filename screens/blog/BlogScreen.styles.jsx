import { StyleSheet } from "react-native";

export const blogStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 60,
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },

  categoriesContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },

  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  categoryButtonActive: {
    backgroundColor: "#60A5FA",
    borderColor: "#60A5FA",
  },

  categoryButtonText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },

  categoryButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  blogCard: {
    marginBottom: 16,
    marginHorizontal: 16,
  },

  blogCardInner: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  blogImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    resizeMode: "cover",
    backgroundColor: "#F1F5F9",
  },

  blogContent: {
    padding: 14,
  },

  blogTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    lineHeight: 22,
  },

  blogAuthor: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "500",
  },

  blogDate: {
    marginTop: 10,
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },

  blogMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  blogViews: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 16,
    fontWeight: "500",
  },
});
