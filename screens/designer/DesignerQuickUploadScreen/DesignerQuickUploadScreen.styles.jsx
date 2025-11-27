// DesignerQuickUploadScreen.styles.js
import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubmitBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#084F8C",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: -0.5,
  },
  submitText: {
    fontSize: 16,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
  },
  headerSubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  submitTextDisabled: {
    color: "#94A3B8",
  },

  // Content
  content: {
    flex: 1,
  },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 8,
    flex: 1,
  },

  // Input
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0F172A",
  },
  textarea: {
    height: 44,
    textAlignVertical: "center",
  },
  largeInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  largeTextarea: {
    height: 56,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 14,
  },

  // Type Toggle
  typeToggle: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  typeButtonActive: {
    backgroundColor: "#084F8C",
    borderColor: "#084F8C",
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },

  // Price Input
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingRight: 12,
  },
  priceField: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#0F172A",
  },
  priceSuffix: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },

  // Date Button
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 15,
    color: "#0F172A",
  },

  // Badge
  badge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#084F8C",
  },

  // Source Toggle
  sourceToggle: {
    flexDirection: "row",
    gap: 8,
    marginTop: 0,
    alignItems: "center",
    flexWrap: "nowrap",
  },
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    minWidth: 160,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexShrink: 0,
  },
  sourceButtonActive: {
    backgroundColor: "#084F8C",
    borderColor: "#084F8C",
  },
  sourceButtonSelected: {
    transform: [{ scale: 1.06 }],
  },
  sourceButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  sourceButtonTextActive: {
    color: "#FFFFFF",
  },

  // Source Content
  sourceContent: {
    marginTop: 0,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 5,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 12,
  },

  // Project Card
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "#ebf4fcff",
    borderWidth: 1,
    borderColor: "#d1d1d1ff",
  },
  projectCardActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#084F8C",
    borderWidth: 2,
  },
  projectImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },

  // Submit Button
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#084F8C",
    shadowColor: "#084F8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
