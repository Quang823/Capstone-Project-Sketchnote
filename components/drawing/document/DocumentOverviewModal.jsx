import React from "react";
import { View, Text, Modal, Pressable, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";
import DocumentBrowserContent from "./DocumentBrowserContent";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DocumentOverviewModal = ({
  visible,
  onClose,
  pages = [],
  activePageId,
  onPageSelect,
  onAddPage,
  onResourceSelect,
  isViewOnly = false,
  paperSize,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Document Overview</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* Shared Browser Content */}
          <DocumentBrowserContent
            visible={visible}
            pages={pages}
            activePageId={activePageId}
            onPageSelect={onPageSelect}
            onAddPage={onAddPage}
            onResourceSelect={onResourceSelect}
            pageLayout="grid"
            onClose={onClose}
            showTabLabels={true}
            isViewOnly={isViewOnly}
            paperSize={paperSize}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 600,
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  addPageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    marginBottom: 16,
    gap: 8,
  },
  addPageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  pagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  pageCard: {
    width: (SCREEN_WIDTH * 0.9 - 64) / 2,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activePageCard: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  pageThumbnail: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  emptyThumbnail: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  pageInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  activeBadge: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  resourceCard: {
    width: (SCREEN_WIDTH * 0.9 - 64) / 3,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 8,
  },
  resourceImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 6,
  },
  resourceName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 12,
  },
  templateSection: {
    marginBottom: 16,
  },
  templateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
});

export default DocumentOverviewModal;
