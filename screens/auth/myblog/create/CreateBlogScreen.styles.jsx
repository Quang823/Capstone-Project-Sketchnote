import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: isTablet ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isTablet ? 40 : 16,
    marginBottom: isTablet ? 32 : 20,
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 16,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: isTablet ? 40 : 16,
  },
  
  // Main Content Container - 2 columns on tablet
  mainContent: {
    flexDirection: isTablet ? "row" : "column",
    gap: isTablet ? 24 : 0,
    marginBottom: 24,
  },
  
  // Left column - Basic info
  leftColumn: {
    flex: isTablet ? 1 : undefined,
  },
  
  // Right column - Image
  rightColumn: {
    flex: isTablet ? 1 : undefined,
  },
  
  input: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    fontSize: isTablet ? 18 : 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  
  inputFocused: {
    borderColor: "#4F46E5",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.1,
  },
  
  imageSection: {
    marginBottom: 24,
  },
  
  sectionLabel: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  
  imageLabel: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
  },
  
  // Content Sections Header
  contentSectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: isTablet ? 32 : 24,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  
  contentSections: {
    marginTop: 8,
  },
  
  // Content Cards - Grid layout on tablet
  contentCardsContainer: {
    flexDirection: isTablet ? "row" : "column",
    flexWrap: "wrap",
    gap: isTablet ? 20 : 0,
  },
  
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: isTablet ? 24 : 16,
    marginBottom: isTablet ? 0 : 20,
    width: isTablet ? "48%" : "100%",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  contentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  
  contentIndex: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: "700",
    color: "#4F46E5",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  
  deleteButton: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 12,
  },
  
  addSectionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  
  addSectionText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "700",
    color: "#4F46E5",
    marginLeft: 10,
  },
  
  // Submit Button - Fixed at bottom center on tablet
  submitButtonContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  
  submitButton: {
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    alignItems: "center",
    width: isTablet ? 400 : "100%",
    maxWidth: isTablet ? 400 : undefined,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  submitText: {
    color: "#fff",
    fontSize: isTablet ? 20 : 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: isTablet ? 32 : 24,
  },
});