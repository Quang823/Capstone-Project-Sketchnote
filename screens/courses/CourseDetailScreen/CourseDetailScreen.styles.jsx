import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const courseDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  
  // LAYOUT 2 CỘT
  twoColumnContainer: {
    flexDirection: "row",
    padding: 24,
    gap: 24,
    maxWidth: 1400,
    alignSelf: "center",
    width: "100%",
  },
  
  // CỘT TRÁI
  leftColumn: {
    flex: 1.2,
  },
  
  mainCard: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  
  courseImage: {
    width: "100%",
    height: 320,
    resizeMode: "cover",
  },
  
  courseInfo: {
    padding: 32,
  },
  
  courseTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 36,
  },
  
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 22,
  },
  
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  
  metaText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  
  levelBadge: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "600",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  
  descriptionText: {
    marginVertical: 20,
  },
  
  descriptionContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#374151",
  },
  
  includesSection: {
    backgroundColor: "#F9FAFB",
    padding: 20,
    borderRadius: 8,
  },
  
  includesTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  
  includeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  
  includeText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  
  // CỘT PHẢI
  rightColumn: {
    flex: 1,
  },
  
  stickyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  
  priceSection: {
    padding: 24,
    paddingBottom: 20,
  },
  
  priceText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  
  primaryButton: {
    height: 52,
    borderRadius: 8,
    overflow: "hidden",
  },
  
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  
  curriculumSection: {
    padding: 24,
    paddingTop: 20,
    backgroundColor: "#F8FAFC",
    borderTop: 3,
    borderTopColor: "#3B82F6",
    borderTopWidth: 3,
  },
  
  curriculumHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  
  curriculumTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  
  curriculumMeta: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  
  lessonItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  
  lessonHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  
  lessonIndex: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    width: 24,
  },
  
  lessonInfo: {
    flex: 1,
  },
  
  lessonTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 20,
  },
  
  lessonDuration: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  
  lessonContent: {
    paddingLeft: 36,
    paddingRight: 16,
    paddingBottom: 16,
  },
  
  lessonContentText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  
  // LOADING & ERROR
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 32,
  },
  
  errorText: {
    fontSize: 15,
    color: "#DC2626",
    marginTop: 16,
    textAlign: "center",
  },
  
  retryButton: {
    marginTop: 20,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});