import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import LazyImage from "../../../common/LazyImage.js";
import { orderService } from "../../../service/orderService.js";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// This is the new shared component that contains all the logic.
const DocumentBrowserContent = ({
  visible,
  pages = [],
  activePageId,
  onPageSelect,
  onAddPage,
  onResourceSelect,
  pageLayout = "grid", // 'grid' or 'list'
  onClose, // For modal's page selection
  showTabLabels = false, // To show labels in modal tabs
}) => {
  const safeActivePageId = activePageId != null ? String(activePageId) : null;
  const [activeTab, setActiveTab] = useState("pages");
  const [purchasedTemplates, setPurchasedTemplates] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Debounce logic from DocumentOverviewModal
  const pageSelectTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (activeTab === "resources" && visible) {
      const fetchTemplates = async () => {
        setIsLoadingResources(true);
        try {
          const templates = await orderService.getPurchasedTemplates();
          setPurchasedTemplates(templates);
        } catch (error) {
          console.error("Failed to fetch purchased templates:", error);
        } finally {
          setIsLoadingResources(false);
        }
      };
      fetchTemplates();
    }
  }, [activeTab, visible]);

  // Cleanup timeout from DocumentOverviewModal
  useEffect(() => {
    if (!visible) {
      if (pageSelectTimeoutRef.current) {
        clearTimeout(pageSelectTimeoutRef.current);
        pageSelectTimeoutRef.current = null;
      }
      isProcessingRef.current = false;
    }
    return () => {
      if (pageSelectTimeoutRef.current) {
        clearTimeout(pageSelectTimeoutRef.current);
      }
    };
  }, [visible]);

  const handlePageSelect = (pageId) => {
    if (pageLayout === "grid") {
      // Modal behavior with debounce
      if (isProcessingRef.current) return;
      if (pageSelectTimeoutRef.current) {
        clearTimeout(pageSelectTimeoutRef.current);
      }
      isProcessingRef.current = true;
      pageSelectTimeoutRef.current = setTimeout(() => {
        try {
          onPageSelect?.(pageId);
          setTimeout(() => {
            onClose?.();
            isProcessingRef.current = false;
            pageSelectTimeoutRef.current = null;
          }, 100);
        } catch (error) {
          console.error(`[DocumentBrowser] Error in pageSelect:`, error);
          isProcessingRef.current = false;
          pageSelectTimeoutRef.current = null;
          onClose?.();
        }
      }, 200);
    } else {
      // Sidebar behavior
      onPageSelect?.(pageId);
    }
  };

  const tabs = [
    { id: "pages", label: "Pages", icon: "insert-drive-file" },
    { id: "resources", label: "Resources", icon: "collections" },
    { id: "layers", label: "Layers", icon: "layers" },
    { id: "history", label: "History", icon: "history" },
  ];

  const renderPages = () => {
    const isListLayout = pageLayout === "list";

    return (
      <View style={{ flex: 1 }}>
        {/* Floating Add Page button */}
        <Pressable onPress={onAddPage} style={styles.floatingAddButton}>
          <Icon name="add" size={20} color="#3B82F6" />
          <Text style={{ color: "#3B82F6", marginLeft: 6, fontWeight: "600" }}>
            Add Page
          </Text>
        </Pressable>

        {/* Scrollable list of pages */}
        <ScrollView
          style={[styles.tabContent, { paddingTop: 60 }]} // chừa chỗ cho nút
          contentContainerStyle={{ paddingBottom: 60 }} // Thêm padding ở dưới
          showsVerticalScrollIndicator={false}
        >
          <View style={isListLayout ? styles.pagesList : styles.pagesGrid}>
            {pages.map((page, index) => {
              const pageId =
                page.id != null
                  ? String(page.id)
                  : page.pageId != null
                  ? String(page.pageId)
                  : `page-${index}`;

              return (
                <Pressable
                  key={pageId}
                  style={[
                    isListLayout ? styles.pageCardList : styles.pageCardGrid,
                    pageId === safeActivePageId &&
                      (isListLayout
                        ? styles.activePageCardList
                        : styles.activePageCardGrid),
                  ]}
                  onPress={() => handlePageSelect(pageId)}
                >
                  <View style={styles.pageThumbnail}>
                    {page.snapshotUrl ? (
                      <LazyImage
                        source={{ uri: page.snapshotUrl }}
                        style={styles.thumbnailImage}
                      />
                    ) : (
                      <View style={styles.emptyThumbnail}>
                        <Icon
                          name="insert-drive-file"
                          size={isListLayout ? 32 : 40}
                          color="#D1D5DB"
                        />
                      </View>
                    )}
                  </View>

                  <View
                    style={
                      isListLayout ? styles.pageInfoList : styles.pageInfoGrid
                    }
                  >
                    <Text style={styles.pageNumber}>
                      {isListLayout
                        ? page.pageNumber ?? index + 1
                        : `Page ${page.pageNumber ?? index + 1}`}
                    </Text>

                    {pageId === safeActivePageId &&
                      (isListLayout ? (
                        <View style={styles.activeDot} />
                      ) : (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderResources = () => {
    if (isLoadingResources) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }
    return (
      <ScrollView
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
      >
        {purchasedTemplates.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="collections" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No purchased resources</Text>
          </View>
        ) : (
          purchasedTemplates.map((template) => (
            <View
              key={template.resourceTemplateId}
              style={styles.templateSection}
            >
              <Text style={styles.templateName}>{template.name}</Text>
              <View
                style={
                  pageLayout === "list"
                    ? styles.resourcesGridList
                    : styles.resourcesGridModal
                }
              >
                {template.items.map((item) => (
                  <Pressable
                    key={item.resourceItemId}
                    style={
                      pageLayout === "list"
                        ? styles.resourceCardList
                        : styles.resourceCardModal
                    }
                    onPress={() => onResourceSelect?.(item.itemUrl)}
                  >
                    <LazyImage
                      source={{ uri: item.itemUrl }}
                      style={styles.resourceImage}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "pages":
        return renderPages();
      case "resources":
        return renderResources();
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
    <>
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
            {showTabLabels && (
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
      {renderTabContent()}
    </>
  );
};

// Merged and adapted styles from both files
const styles = StyleSheet.create({
  // Common
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
    flexDirection: "row", // For modal
    gap: 6, // For modal
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
  floatingAddButton: {
    position: "absolute",
    top: 8,
    left: 12,
    right: 12,
    zIndex: 999,

    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 10,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,

    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  pageThumbnail: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
    position: "relative", // <--- CẦN THIẾT ĐỂ OVERLAY HOẠT ĐỘNG
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
  pageNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
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
  resourceImage: {
    width: "100%",
    height: "100%",
  },
  tabText: {
    // From Modal
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    // From Modal
    color: "#3B82F6",
    fontWeight: "600",
  },

  // List Layout (from Sidebar)
  addPageButtonList: {
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
  addPageTextList: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  pagesList: {
    gap: 8,
  },
  pageCardList: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activePageCardList: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  pageInfoList: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  resourcesGridList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  resourceCardList: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    overflow: "hidden",
  },

  // Grid Layout (from Modal)
  addPageButtonGrid: {
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
  addPageTextGrid: {
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
  pageCardGrid: {
    width: "45%", // đẹp và auto responsive
    maxWidth: 220, // tránh thumbnail quá to
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
    alignSelf: "center",
  },

  activePageCardGrid: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  pageInfoGrid: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 6,
    marginHorizontal: 6,
    paddingVertical: 2,
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
  resourcesGridModal: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  resourceCardModal: {
    width: (SCREEN_WIDTH * 0.9 - 64) / 3,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 8,
  },
});

export default DocumentBrowserContent;
