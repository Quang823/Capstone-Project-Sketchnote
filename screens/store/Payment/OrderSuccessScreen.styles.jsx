import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Loading & Error States
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },

  // Main Layout
  gradient: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    padding: 20,
    paddingTop: 80,
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },

  // Success Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 28,
    letterSpacing: -0.5,
  },

  // Info Box
  infoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "700",
    marginBottom: 4,
  },
  statusPaid: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "700",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    overflow: "hidden",
    marginBottom: 4,
  },
  statusConfirmed: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "700",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FDE68A",
    overflow: "hidden",
    marginBottom: 4,
  },

  // Items Section
  itemsSection: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    lineHeight: 22,
  },
  itemDesc: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
    fontWeight: "500",
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#60A5FA",
  },

  // Back Button
  backButton: {
    backgroundColor: "#60A5FA",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#60A5FA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});