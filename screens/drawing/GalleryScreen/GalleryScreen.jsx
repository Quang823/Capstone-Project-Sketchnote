import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import LazyImage from "../../../common/LazyImage";
import { orderService } from "../../../service/orderService";
import { resourceService } from "../../../service/resourceService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./GalleryScreen.styles";
import NotificationButton from "../../../components/common/NotificationButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const isImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const u = url.trim().replace(/^`|`$/g, "");
  return /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(u);
};

const FILTERS = [
  { key: "ALL", label: "All", icon: "grid-view" },
  { key: "TEMPLATES", label: "Templates", icon: "dashboard" },
  { key: "ICONS", label: "Icons", icon: "category" },
  { key: "RECENT", label: "Recent", icon: "schedule" },
];

export default function GalleryScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  // Get styles based on theme
  const styles = getStyles(theme);

  // Theme colors for inline styles
  const isDark = theme === "dark";
  const colors = {
    primaryBlue: isDark ? "#60A5FA" : "#084F8C",
    primaryWhite: isDark ? "#FFFFFF" : "#0F172A",
    textMuted: isDark ? "#64748B" : "#94A3B8",
    textSecondary: isDark ? "#94A3B8" : "#475569",
    emptyIconColor: isDark ? "#475569" : "#CBD5E1",
    loadingColor: isDark ? "#60A5FA" : "#084F8C",
    filterButtonText: isDark ? "#94A3B8" : "#64748B",
  };

  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Upgrade modal state
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedUpgradeTemplate, setSelectedUpgradeTemplate] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Tab state for version comparison modal
  const [activeVersionTab, setActiveVersionTab] = useState("current"); // "current" or "new"

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [templates]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Fetch both purchased templates and designer's own templates
      const [purchasedResponse, designerResponse] = await Promise.all([
        orderService.getPurchasedTemplatesV2().catch(() => []),
        resourceService.getDesignerPublicTemplate().catch(() => []),
      ]);

      const purchasedData = purchasedResponse?.content || purchasedResponse || [];
      const designerData = designerResponse || [];



      // Map purchased templates (with version info)
      const mappedPurchased = (Array.isArray(purchasedData) ? purchasedData : []).map((template) => {
        const currentVersion = template.availableVersions?.find(
          (v) => v.versionId === template.currentVersionId
        );

        const latestVersion = template.availableVersions?.find(
          (v) => v.versionId === template.latestVersionId
        );

        return {
          ...template,
          name: currentVersion?.name || template.name,
          description: currentVersion?.description || template.description,
          items: currentVersion?.items || template.items || [],
          images: currentVersion?.images || template.images || [],
          versionNumber: template.currentVersionNumber || currentVersion?.versionNumber,
          hasNewerVersion: template.hasNewerVersion,
          latestVersionNumber: template.latestVersionNumber,
          currentVersionNumber: template.currentVersionNumber,
          latestVersion: latestVersion ? {
            name: latestVersion.name,
            description: latestVersion.description,
            items: latestVersion.items || [],
            images: latestVersion.images || [],
            price: latestVersion.price,
            releaseDate: latestVersion.releaseDate,
          } : null,
          isDesignerOwned: false,
        };
      });

      // Map designer's own templates (no version info, mark as owned)
      const mappedDesigner = (Array.isArray(designerData) ? designerData : []).map((template) => ({
        ...template,
        items: template.items || [],
        images: template.images || [],
        hasNewerVersion: false,
        isDesignerOwned: true,
        isOwner: true,
      }));

      // Merge and deduplicate by resourceTemplateId
      const allTemplates = [...mappedPurchased, ...mappedDesigner];
      const uniqueTemplates = allTemplates.filter((template, index, self) =>
        index === self.findIndex((t) => t.resourceTemplateId === template.resourceTemplateId)
      );

      setTemplates(uniqueTemplates);
    } catch (error) {
      console.warn("Error fetching templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle upgrade
  const handleUpgradePress = (template) => {
    setSelectedUpgradeTemplate(template);
    setUpgradeModalVisible(true);
  };

  const handleUpgradeConfirm = async () => {
    if (!selectedUpgradeTemplate) return;

    setIsUpgrading(true);
    try {
      await orderService.upgradeTemplateVersionLatest(selectedUpgradeTemplate.resourceTemplateId);
      Alert.alert(
        "Upgrade Successful! 🎉",
        `Your "${selectedUpgradeTemplate.name}" has been upgraded to the latest version.`,
        [{ text: "OK" }]
      );
      setUpgradeModalVisible(false);
      setSelectedUpgradeTemplate(null);

      // Refresh templates
      fetchTemplates();
    } catch (error) {
      console.warn("Failed to upgrade template:", error);
      Alert.alert(
        "Upgrade Failed",
        error.message || "Failed to upgrade to the latest version. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  const filteredTemplates = templates.filter((item) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "TEMPLATES") return item.type === "TEMPLATES";
    if (activeFilter === "ICONS") return item.type === "ICONS";
    if (activeFilter === "RECENT") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(item.purchaseDate || item.createdAt) >= oneWeekAgo;
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getImageUrl = (item) => {
    if (!item) return "https://via.placeholder.com/400x300";
    if (item.bannerUrl) return item.bannerUrl;
    if (item.images && item.images.length > 0) {
      const thumbnail = item.images.find((img) => img.isThumbnail);
      return thumbnail?.imageUrl || item.images[0]?.imageUrl;
    }
    return item.imageUrl || item.thumbnailUrl || "https://via.placeholder.com/400x300";
  };

  const renderCard = (item, index) => {
    const imageUrl = getImageUrl(item);

    return (
      <Animated.View
        key={item.id || item.resourceTemplateId || index}
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={{ position: "relative" }}>
          <LazyImage
            source={{ uri: imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {/* Version Badge */}
          {item.versionNumber && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                backgroundColor: "rgba(0,0,0,0.6)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#FFFFFF" }}>
                v{item.versionNumber}
              </Text>
            </View>
          )}
          {/* New Version Badge */}
          {item.hasNewerVersion && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#F59E0B",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Icon name="new-releases" size={12} color="#FFFFFF" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#FFFFFF" }}>
                New Version
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name || "Untitled"}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.description || "No description"}
          </Text>

          <View style={styles.cardActions}>
            <Pressable
              style={styles.cardActionButton}
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            >
              <Icon name="visibility" size={12} color={colors.textSecondary} />
              <Text style={styles.cardActionText}>View</Text>
            </Pressable>
            <Pressable
              style={[styles.cardActionButton, styles.cardActionButtonPrimary]}
              onPress={() => {
                navigation.navigate("Home");
                Toast.show({
                  type: "success",
                  text1: "Template Selected",
                  text2: "Please enter a project to use this resource.",
                });
              }}
            >
              <Icon name="edit" size={12} color="#FFFFFF" />
              <Text
                style={[styles.cardActionText, styles.cardActionTextPrimary]}
              >
                Use
              </Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    );
  };

  const DetailModal = () => {
    // Get the version data to display based on active tab
    const getVersionData = () => {
      if (!selectedItem?.hasNewerVersion || activeVersionTab === "current") {
        return {
          name: selectedItem?.name,
          description: selectedItem?.description,
          items: selectedItem?.items || [],
          images: selectedItem?.images || [],
          price: selectedItem?.price,
          versionNumber: selectedItem?.currentVersionNumber,
          purchaseDate: selectedItem?.purchaseDate || selectedItem?.createdAt,
        };
      } else {
        return {
          name: selectedItem?.latestVersion?.name,
          description: selectedItem?.latestVersion?.description,
          items: selectedItem?.latestVersion?.items || [],
          images: selectedItem?.latestVersion?.images || [],
          price: selectedItem?.latestVersion?.price,
          versionNumber: selectedItem?.latestVersionNumber,
          releaseDate: selectedItem?.latestVersion?.releaseDate,
        };
      }
    };

    const versionData = getVersionData();

    const getVersionImageUrl = () => {
      if (!selectedItem?.hasNewerVersion || activeVersionTab === "current") {
        return getImageUrl(selectedItem);
      } else {
        const latestVersion = selectedItem?.latestVersion;
        if (latestVersion?.images && latestVersion.images.length > 0) {
          const thumbnail = latestVersion.images.find((img) => img.isThumbnail);
          return thumbnail?.imageUrl || latestVersion.images[0]?.imageUrl;
        }
        return getImageUrl(selectedItem);
      }
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                <Text style={styles.modalTitle}>Item Details</Text>
                {selectedItem?.hasNewerVersion && (
                  <View style={{ backgroundColor: "#10B981", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon name="new-releases" size={14} color="#FFFFFF" />
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>NEW VERSION</Text>
                  </View>
                )}
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Version Tabs - Only show when has newer version */}
              {selectedItem?.hasNewerVersion && (
                <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
                  {/* Tab Buttons */}
                  <View style={{ flexDirection: "row", backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderRadius: 12, padding: 4 }}>
                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        backgroundColor: activeVersionTab === "current" ? (isDark ? "#334155" : "#FFFFFF") : "transparent",
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                      onPress={() => setActiveVersionTab("current")}
                    >
                      <Icon
                        name="history"
                        size={18}
                        color={activeVersionTab === "current" ? colors.primaryBlue : (isDark ? "#94A3B8" : "#64748B")}
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: activeVersionTab === "current" ? colors.primaryBlue : (isDark ? "#94A3B8" : "#64748B"),
                      }}>
                        Current (v{selectedItem?.currentVersionNumber})
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        backgroundColor: activeVersionTab === "new" ? "#10B981" : "transparent",
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                      onPress={() => setActiveVersionTab("new")}
                    >
                      <Icon
                        name="upgrade"
                        size={18}
                        color={activeVersionTab === "new" ? "#FFFFFF" : "#10B981"}
                      />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: activeVersionTab === "new" ? "#FFFFFF" : "#10B981",
                      }}>
                        New (v{selectedItem?.latestVersionNumber})
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Main Image */}
              <LazyImage
                source={{ uri: getVersionImageUrl() }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              {/* Title Section */}
              <View style={styles.modalSection}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[styles.modalTitle, { flex: 1 }]}>{versionData.name}</Text>
                  <View style={{
                    backgroundColor: activeVersionTab === "new" && selectedItem?.hasNewerVersion ? "#10B981" : (isDark ? "#334155" : "#E5E7EB"),
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: activeVersionTab === "new" && selectedItem?.hasNewerVersion ? "#FFFFFF" : (isDark ? "#94A3B8" : "#374151")
                    }}>
                      v{versionData.versionNumber}
                    </Text>
                  </View>
                </View>
                <View style={[styles.cardBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                  <Text style={styles.cardBadgeText}>
                    {selectedItem?.type === "ICONS" ? "Icon Collection" : "Template"}
                  </Text>
                </View>
              </View>

              {/* Description Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalDescription}>
                  {versionData.description || "No description available for this item."}
                </Text>
              </View>

              {/* Information Section */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Information</Text>
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Icon name="payments" size={16} color={colors.primaryBlue} />
                    <Text style={styles.modalInfoText}>
                      {versionData.price?.toLocaleString()} đ
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Icon name="event" size={16} color={colors.primaryBlue} />
                    <Text style={styles.modalInfoText}>
                      {activeVersionTab === "new" && selectedItem?.hasNewerVersion
                        ? `Release: ${formatDate(versionData.releaseDate)}`
                        : `Purchased: ${formatDate(versionData.purchaseDate)}`
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Included Items Section */}
              {versionData.items && versionData.items.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Included Items ({versionData.items.length})</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.itemsScroll}
                  >
                    {versionData.items.map((item, idx) => (
                      <LazyImage
                        key={idx}
                        source={{ uri: item.imageUrl || item.itemUrl }}
                        style={styles.itemThumbnail}
                        resizeMode="contain"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </Pressable>

              {/* Show Upgrade button when has newer version */}
              {selectedItem?.hasNewerVersion && (
                <Pressable
                  style={[styles.modalButton, { backgroundColor: "#10B981", borderColor: "#10B981" }]}
                  onPress={() => {
                    setModalVisible(false);
                    handleUpgradePress(selectedItem);
                  }}
                >
                  <Icon name="upgrade" size={18} color="#FFFFFF" />
                  <Text style={[styles.modalButtonText, { color: "#FFFFFF" }]}>
                    Upgrade
                  </Text>
                </Pressable>
              )}

              {/* Show Use Now button */}
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Home");
                  Toast.show({
                    type: "success",
                    text1: "Template Selected",
                    text2: "Please enter a project to use this resource.",
                  });
                }}
              >
                <Icon name="edit" size={18} color="#FFFFFF" />
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  Use Now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#1E293B" : "#FFFFFF"}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconColor={colors.primaryWhite} iconSize={26} />
          <Text style={styles.headerTitle}>My Gallery</Text>
        </View>
        <View style={styles.headerRight}>
          <NotificationButton />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{templates.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {templates.filter((t) => t.type === "TEMPLATES").length}
          </Text>
          <Text style={styles.statLabel}>Templates</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {templates.filter((t) => t.type === "ICONS").length}
          </Text>
          <Text style={styles.statLabel}>Icons</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterButton,
                activeFilter === filter.key && styles.filterButtonActive,
              ]}
            >
              <Icon
                name={filter.icon}
                size={16}
                color={
                  activeFilter === filter.key
                    ? "#FFFFFF"
                    : colors.filterButtonText
                }
              />
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.key && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.loadingColor} />
          <Text style={styles.loadingText}>Loading your gallery...</Text>
        </View>
      ) : filteredTemplates.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="collections"
            size={64}
            color={colors.emptyIconColor}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Items Found</Text>
          <Text style={styles.emptyText}>
            {activeFilter === "ALL"
              ? "Your gallery is empty.\nPurchase templates to see them here."
              : `No ${activeFilter.toLowerCase()} found.\nTry a different filter.`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridContainer}>
            {filteredTemplates.map((item, index) => renderCard(item, index))}
          </View>
        </ScrollView>
      )}

      <DetailModal />

      {/* Upgrade Modal */}
      <Modal
        visible={upgradeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUpgradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Icon name="upgrade" size={32} color="#3B82F6" />
                <Text style={[styles.modalTitle, { marginTop: 12 }]}>New Version Available!</Text>
              </View>
              <Pressable
                onPress={() => setUpgradeModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {selectedUpgradeTemplate && (
              <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: isDark ? "#F1F5F9" : "#374151", textAlign: "center", marginBottom: 16 }}>
                  {selectedUpgradeTemplate.name}
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                  <View style={{ backgroundColor: isDark ? "#334155" : "#F3F4F6", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: "center", minWidth: 80 }}>
                    <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 4 }}>Current</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: isDark ? "#F1F5F9" : "#374151" }}>v{selectedUpgradeTemplate.currentVersionNumber}</Text>
                  </View>
                  <Icon name="arrow-forward" size={20} color="#9CA3AF" style={{ marginHorizontal: 12 }} />
                  <View style={{ backgroundColor: "#ECFDF5", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, alignItems: "center", minWidth: 80, borderWidth: 2, borderColor: "#10B981" }}>
                    <Text style={{ fontSize: 11, color: "#6B7280", fontWeight: "500", marginBottom: 4 }}>Latest</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#059669" }}>v{selectedUpgradeTemplate.latestVersionNumber}</Text>
                  </View>
                </View>

                <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20 }}>
                  Upgrade to get the latest features and improvements for this resource.
                </Text>
              </View>
            )}

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setUpgradeModalVisible(false);
                  setSelectedUpgradeTemplate(null);
                }}
                disabled={isUpgrading}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, isUpgrading && { opacity: 0.6 }]}
                onPress={handleUpgradeConfirm}
                disabled={isUpgrading}
              >
                {isUpgrading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="upgrade" size={18} color="#FFFFFF" />
                    <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                      Upgrade Now
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
