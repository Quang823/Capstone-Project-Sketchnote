import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DocumentOverviewModal = ({
  visible,
  onClose,
  pages = [],
  activePageId,
  onPageSelect,
  onAddPage,
  resourceItems = [],
}) => {
  const [activeTab, setActiveTab] = useState("pages"); // pages, resources, layers, history

  const tabs = [
    { id: "pages", label: "Pages", icon: "insert-drive-file" },
    { id: "resources", label: "Resources", icon: "collections" },
    { id: "layers", label: "Layers", icon: "layers" },
    { id: "history", label: "History", icon: "history" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "pages":
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Add Page Button */}
            <Pressable style={styles.addPageButton} onPress={onAddPage}>
              <Icon name="add" size={32} color="#3B82F6" />
              <Text style={styles.addPageText}>Add Page</Text>
            </Pressable>

            {/* Pages Grid */}
            <View style={styles.pagesGrid}>
              {pages.map((page, index) => (
                <Pressable
                  key={page.id}
                  style={[
                    styles.pageCard,
                    page.id === activePageId && styles.activePageCard,
                  ]}
                  onPress={() => {
                    onPageSelect?.(page.id);
                    onClose();
                  }}
                >
                  {/* Page Thumbnail */}
                  <View style={styles.pageThumbnail}>
                    {page.thumbnail ? (
                      <Image
                        source={{ uri: page.thumbnail }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.emptyThumbnail}>
                        <Icon name="insert-drive-file" size={40} color="#D1D5DB" />
                      </View>
                    )}
                  </View>

                  {/* Page Number */}
                  <View style={styles.pageInfo}>
                    <Text style={styles.pageNumber}>Page {index + 1}</Text>
                    {page.id === activePageId && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        );

      case "resources":
        return (
          <ScrollView
            style={styles.tabContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resourcesGrid}>
              {resourceItems.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="collections" size={64} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>No resources yet</Text>
                </View>
              ) : (
                resourceItems.map((item, index) => (
                  <View key={index} style={styles.resourceCard}>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.resourceImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.resourceName} numberOfLines={1}>
                      {item.name || `Resource ${index + 1}`}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        );

      case "layers":
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Icon name="layers" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Layers view coming soon</Text>
            </View>
          </View>
        );

      case "history":
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Icon name="history" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>History view coming soon</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Icon
                  name={tab.icon}
                  size={20}
                  color={activeTab === tab.id ? "#3B82F6" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Tab Content */}
          {renderTabContent()}
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
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
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
});

export default DocumentOverviewModal;
