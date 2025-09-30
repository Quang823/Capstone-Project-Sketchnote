import { StyleSheet } from "react-native";

export const blogDetailStyles = StyleSheet.create({
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

  scrollContent: { padding: 16 },
  blogImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  blogTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  blogInfo: {
    marginBottom: 16,
  },
  blogAuthor: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  blogMeta: { flexDirection: "row", alignItems: "center" },
  blogViews: { fontSize: 12, color: "#6B7280", marginLeft: 4 },

  blogContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },
});
