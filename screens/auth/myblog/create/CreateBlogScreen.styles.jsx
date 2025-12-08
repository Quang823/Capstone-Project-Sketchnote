import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 48,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
  },

  // Header with Gradient
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
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
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#084F8C",
    marginTop: 2,
    fontWeight: "500",
  },
  headerTextContainer: {
    flexDirection: "column",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Progress Card
  progressCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  progressItem: {
    flex: 1,
    alignItems: "center",
  },
  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  progressDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 8,
  },

  // Main Content
  mainContent: {
    flexDirection: isTablet ? "row" : "column",
    gap: 20,
    marginBottom: 24,
  },
  leftColumn: {
    flex: isTablet ? 1 : undefined,
    gap: 20,
  },
  rightColumn: {
    flex: isTablet ? 1 : undefined,
  },

  // Input Card
  inputCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  textArea: {
    height: isTablet ? 140 : 120,
    textAlignVertical: "top",
  },
  inputHint: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 8,
    fontWeight: "500",
  },

  // Section Header Card
  sectionHeaderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: isTablet ? "row" : "column",
    alignItems: isTablet ? "center" : "flex-start",
    justifyContent: "space-between",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  sectionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  sectionStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 60,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#084F8C",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#084F8C",
    marginTop: 2,
    textTransform: "uppercase",
  },

  // Content Cards Container
  contentCardsContainer: {
    gap: 20,
  },

  // Content Card
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  contentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  contentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sectionNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#084F8C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  existingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  existingBadgeText: {
    fontSize: 10,
    color: "#1E40AF",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newBadgeText: {
    fontSize: 10,
    color: "#065F46",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  // Input Group
  inputGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
  },

  // Add Section Button
  addSectionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#084F8C",
    borderStyle: "dashed",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  addSectionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  addSectionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#084F8C",
  },

  // Submit Button
  submitContainer: {
    marginTop: 8,
  },
  submitWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Bottom Actions Row - NEW
  bottomActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  addSectionButtonRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#084F8C",
    gap: 8,
  },
  addSectionTextRow: {
    fontSize: 15,
    fontWeight: "700",
    color: "#084F8C",
  },
  submitWrapperRow: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
  },
  submitTextRow: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
