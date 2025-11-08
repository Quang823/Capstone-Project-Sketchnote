import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Loading & Error States
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B5B95",
    fontWeight: "700",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B9D",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "700",
  },

  // Main Layout
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 60,
  },

  // Success Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 24,
    marginBottom: 20,
    
    borderColor: "#2D2D2D",
    shadowColor: "#6BCF7F",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#6BCF7F",
    textAlign: "center",
    marginBottom: 24,
  },

  // Info Box
  infoBox: {
    backgroundColor: "#FFF5CC",
    borderRadius: 15,
    padding: 16,
    borderWidth: 2, // Nhẹ hơn
    borderColor: "#2D2D2D",
  },
  label: {
    fontSize: 13,
    color: "#6B5B95",
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#2D2D2D",
    fontWeight: "800",
  },
  statusPaid: {
    fontSize: 15,
    color: "#6BCF7F",
    fontWeight: "900",
    backgroundColor: "#E8F9ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
    borderWidth: 2, // Nhẹ hơn
    borderColor: "#2D2D2D",
    overflow: "hidden",
  },
  statusConfirmed: {
    fontSize: 15,
    color: "#FFD93D",
    fontWeight: "900",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: "flex-start",
    borderWidth: 2, // Nhẹ hơn
    borderColor: "#2D2D2D",
    overflow: "hidden",
  },

  // Items Section
  itemsSection: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#6B5B95",
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2, // Nhẹ hơn
    borderColor: "#2D2D2D",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 2, height: 2 }, // Shadow nhẹ hơn
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 13,
    color: "#6B5B95",
    marginBottom: 8,
    fontWeight: "600",
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FF6B9D",
  },

  // Back Button
  backButton: {
    backgroundColor: "#FFD93D",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 2, // Nhẹ hơn
    borderColor: "#2D2D2D",
    shadowColor: "#FFD93D",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 3,
  },
  backText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2D2D2D",
  },
});