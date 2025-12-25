import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Animated, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";
import DocumentBrowserContent from "../document/DocumentBrowserContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DocumentSidebar = ({
  visible,
  onToggle,
  pages = [],
  activePageId,
  onPageSelect,
  onAddPage,
  onResourceSelect,
  onOpenOverview,
  isViewOnly = false,
  paperSize,
}) => {
  const [slideAnim] = useState(new Animated.Value(visible ? 0 : -280));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -280,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Toggle Button */}
      <Pressable style={styles.toggleButton} onPress={onToggle}>
        <Icon
          name={visible ? "chevron-left" : "chevron-right"}
          size={24}
          color="#6B7280"
        />
      </Pressable>

      {/* Sidebar Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Document</Text>

          {/* Nút Overview */}
          <Pressable onPress={() => onOpenOverview?.()} style={{ padding: 4 }}>
            <Icon name="grid-view" size={22} color="#3B82F6" />
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
          pageLayout="list"
          isViewOnly={isViewOnly}
          paperSize={paperSize}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleButton: {
    position: "absolute",
    right: -40,
    top: "50%",
    width: 40,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
  },
  tabContent: {
    flex: 1,
    padding: 12,
  },
  addPageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    marginBottom: 12,
    gap: 6,
  },
  addPageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  pagesList: {
    gap: 8,
  },
  pageCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
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
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  resourcesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resourceCard: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    overflow: "hidden",
  },
  resourceImage: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 8,
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

export default DocumentSidebar;
