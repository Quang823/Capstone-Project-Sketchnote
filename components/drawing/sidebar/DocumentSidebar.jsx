import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DocumentSidebar = ({
  visible,
  onToggle,
  pages = [],
  activePageId,
  onPageSelect,
  onAddPage,
  resourceItems = [],
}) => {
  // ✅ Đảm bảo activePageId luôn là string hợp lệ
  const safeActivePageId = activePageId != null ? String(activePageId) : null;
  const [activeTab, setActiveTab] = useState("pages");
  const [slideAnim] = useState(new Animated.Value(visible ? 0 : -280));

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -280,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  const tabs = [
    { id: "pages", icon: "insert-drive-file" },
    { id: "resources", icon: "collections" },
    { id: "layers", icon: "layers" },
    { id: "history", icon: "history" },
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
              <Icon name="add" size={24} color="#3B82F6" />
              <Text style={styles.addPageText}>Add Page</Text>
            </Pressable>

            {/* Pages List */}
            <View style={styles.pagesList}>
              {pages.map((page, index) => {
                // Dùng id làm key (id là unique từ MultiPageCanvas)
                // ✅ Đảm bảo pageId luôn là string hợp lệ
                const pageId =
                  typeof page.id !== "undefined" && page.id !== null
                    ? String(page.id)
                    : typeof page.pageId !== "undefined" && page.pageId !== null
                    ? String(page.pageId)
                    : `page-${index}`;
                return (
                  <Pressable
                    key={pageId}
                    style={[
                      styles.pageCard,
                      pageId === safeActivePageId && styles.activePageCard,
                    ]}
                    onPress={() => {
                      // console.log(`[DocumentSidebar] onPageSelect called with pageId: ${pageId}`);
                      onPageSelect?.(pageId);
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
                          <Icon
                            name="insert-drive-file"
                            size={32}
                            color="#D1D5DB"
                          />
                        </View>
                      )}
                    </View>

                    {/* Page Number */}
                    <View style={styles.pageInfo}>
                      <Text style={styles.pageNumber}>
                        {typeof page.pageNumber === "number"
                          ? page.pageNumber
                          : index + 1}
                      </Text>
                      {pageId === safeActivePageId && (
                        <View style={styles.activeDot} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
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
                  <Icon name="collections" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>No resources</Text>
                </View>
              ) : (
                resourceItems.map((item, index) => (
                  <View key={index} style={styles.resourceCard}>
                    <Image
                      source={{ uri: item.url }}
                      style={styles.resourceImage}
                      resizeMode="cover"
                    />
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
              <Icon name="layers" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Coming soon</Text>
            </View>
          </View>
        );

      case "history":
        return (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Icon name="history" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Coming soon</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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
          <Text style={styles.headerTitle}>Pages</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? "#3B82F6" : "#9CA3AF"}
              />
            </Pressable>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
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
    marginBottom: 6,
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
});

export default DocumentSidebar;
