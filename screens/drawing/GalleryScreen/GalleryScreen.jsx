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
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useTheme } from "../../../context/ThemeContext";
import getStyles from "./GalleryScreen.styles";

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
      const response = await orderService.getPurchasedTemplatesV2();
      const data = response?.content || response || [];

      // Map templates to use current version's items and images
      const mappedTemplates = (Array.isArray(data) ? data : []).map((template) => {
        const currentVersion = template.availableVersions?.find(
          (v) => v.versionId === template.currentVersionId
        );

        // Get latest version for preview
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
          // Latest version data for preview
          latestVersion: latestVersion ? {
            name: latestVersion.name,
            description: latestVersion.description,
            items: latestVersion.items || [],
            images: latestVersion.images || [],
            price: latestVersion.price,
            releaseDate: latestVersion.releaseDate,
          } : null,
        };
      });

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
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
      console.error("Failed to upgrade template:", error);
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

  const DetailModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Item Details</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <LazyImage
              source={{ uri: getImageUrl(selectedItem) }}
              style={styles.modalImage}
              resizeMode="cover"
            />

            <View style={styles.modalSection}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={[styles.modalTitle, { flex: 1 }]}>{selectedItem?.name}</Text>
                {selectedItem?.currentVersionNumber && (
                  <View style={{ backgroundColor: isDark ? "#334155" : "#E5E7EB", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: isDark ? "#94A3B8" : "#374151" }}>
                      v{selectedItem.currentVersionNumber}
                    </Text>
                  </View>
                )}
              </View>
              <View style={[styles.cardBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={styles.cardBadgeText}>
                  {selectedItem?.type === "ICONS" ? "Icon Collection" : "Template"}
                </Text>
              </View>
            </View>

            {/* New Version Available Section - At TOP */}
            {selectedItem?.hasNewerVersion && (
              <View style={[styles.modalSection, { backgroundColor: "#FEF3C7", borderRadius: 12, padding: 16 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <Icon name="new-releases" size={24} color="#F59E0B" />
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#B45309", marginLeft: 8, flex: 1 }}>
                    New Version Available!
                  </Text>
                  <View style={{ backgroundColor: "#10B981", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
                      v{selectedItem?.latestVersionNumber}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 12 }}>
                  <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: "center", minWidth: 80 }}>
                    <Text style={{ fontSize: 10, color: "#6B7280", fontWeight: "500" }}>Your Version</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#374151" }}>v{selectedItem?.currentVersionNumber}</Text>
                  </View>
                  <Icon name="arrow-forward" size={20} color="#D97706" style={{ marginHorizontal: 12 }} />
                  <View style={{ backgroundColor: "#10B981", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: "center", minWidth: 80 }}>
                    <Text style={{ fontSize: 10, color: "#FFFFFF", fontWeight: "500" }}>Latest</Text>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF" }}>v{selectedItem?.latestVersionNumber}</Text>
                  </View>
                </View>

                {/* Latest Version Preview */}
                {selectedItem?.latestVersion && (
                  <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: "#D1FAE5" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      <View style={{ backgroundColor: "#10B981", width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Icon name="fiber-new" size={18} color="#FFFFFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#059669" }}>
                          Preview: Version {selectedItem?.latestVersionNumber}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151" }}>
                          {selectedItem.latestVersion.name}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 13, color: "#6B7280", marginBottom: 12, lineHeight: 18 }} numberOfLines={3}>
                      {selectedItem.latestVersion.description || "No description available"}
                    </Text>

                    {/* Latest Version Items Preview */}
                    {selectedItem.latestVersion.items?.length > 0 && (
                      <View>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                          📦 Included Items ({selectedItem.latestVersion.items.length}):
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                          {selectedItem.latestVersion.items.map((item, idx) => (
                            <View key={idx} style={{ marginHorizontal: 4, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB" }}>
                              <LazyImage
                                source={{ uri: item.imageUrl || item.itemUrl }}
                                style={{ width: 80, height: 80, backgroundColor: "#F9FAFB" }}
                                resizeMode="contain"
                              />
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                <Text style={{ fontSize: 13, color: "#92400E", textAlign: "center", lineHeight: 18, marginTop: 12, marginBottom: 12 }}>
                  Upgrade to get the latest features and improvements. This upgrade is FREE!
                </Text>

                <Pressable
                  style={{ backgroundColor: "#10B981", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                  onPress={() => {
                    setModalVisible(false);
                    handleUpgradePress(selectedItem);
                  }}
                >
                  <Icon name="upgrade" size={18} color="#FFFFFF" />
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>Upgrade Now</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Description</Text>
              <Text style={styles.modalDescription}>
                {selectedItem?.description || "No description available for this item."}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Information</Text>
              <View style={styles.modalInfoGrid}>
                <View style={styles.modalInfoItem}>
                  <Icon name="payments" size={16} color={colors.primaryBlue} />
                  <Text style={styles.modalInfoText}>
                    {selectedItem?.price?.toLocaleString()} đ
                  </Text>
                </View>
                <View style={styles.modalInfoItem}>
                  <Icon name="event" size={16} color={colors.primaryBlue} />
                  <Text style={styles.modalInfoText}>
                    Purchased: {formatDate(selectedItem?.purchaseDate || selectedItem?.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            {selectedItem?.items && selectedItem.items.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Included Items ({selectedItem.items.length})</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.itemsScroll}
                >
                  {selectedItem.items.map((item, idx) => (
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

            {/* Show Use Now button for current version */}
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
          <Pressable style={styles.headerButton} onPress={fetchTemplates}>
            <Icon name="refresh" size={22} color={colors.primaryWhite} />
          </Pressable>
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
