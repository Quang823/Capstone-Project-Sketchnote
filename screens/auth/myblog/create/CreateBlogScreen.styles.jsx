import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 40,
    padding:16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
  },
  contentSections: {
    marginTop: 8,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  contentIndex: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  addSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
  },
  addSectionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});