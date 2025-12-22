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
      const response = await orderService.getPurchasedTemplates();
      const data = response?.content || response || [];
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplates([]);
    } finally {
      setLoading(false);
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
        key={item.id || index}
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
        <LazyImage
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
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
              <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              <View style={[styles.cardBadge, { alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={styles.cardBadgeText}>
                  {selectedItem?.type === "ICONS" ? "Icon Collection" : "Template"}
                </Text>
              </View>
            </View>

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
    </View>
  );
}
