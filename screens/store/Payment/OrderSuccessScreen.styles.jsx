import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 420,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 15,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 18,
  },
  label: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusPaid: {
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 16,
  },
  statusConfirmed: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 30,
    color: "#1F2937",
  },
  itemsSection: {
    width: "100%",
    maxWidth: 420,
    marginTop: 10,
  },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  itemDesc: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 6,
  },
  backButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 25,
  },
  backText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 10,
    color: "#4B5563",
    fontSize: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    marginBottom: 10,
  },
});
