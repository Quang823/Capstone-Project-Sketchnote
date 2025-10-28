import { StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const designerQuickUploadStyles = StyleSheet.create({
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
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  uploadButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  uploadButtonDisabled: {
    color: "#9CA3AF",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Quick Actions
  quickActionsSection: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
  },
  quickActionGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtext: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },

  // Image Upload Section
  imageUploadSection: {
    marginBottom: 24,
  },
  uploadedImagesContainer: {
    marginTop: 16,
  },
  uploadedImagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  uploadedImageItem: {
    position: "relative",
    marginRight: 12,
  },
  uploadedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  thumbnailBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbnailText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  removeUploadedImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Items Section
  itemsSection: {
    marginBottom: 24,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    gap: 4,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
  },
  itemInputContainer: {
    flex: 1,
  },
  removeItemButton: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    marginBottom: 8,
  },

  // Info Section
  infoSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  // Price Options
  priceOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceOptionActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  priceOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  priceOptionTextActive: {
    color: "#FFFFFF",
  },

  // Tags
  tagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addTagButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  noTagsText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
  },

  // Upload Button
  uploadButtonContainer: {
    marginBottom: 32,
  },
  uploadButtonContainerDisabled: {
    opacity: 0.6,
  },
  uploadButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tagOptionActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  tagOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tagOptionTextActive: {
    color: "#FFFFFF",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
