import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
  Modal,
  Image,
  Animated,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import getStyles from "./DesignerProductsScreen.styles";
import { resourceService } from "../../../service/resourceService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";
import { useTheme } from "../../../context/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerProductsScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("products");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    setActiveNavItem("products");
    setActiveNavItemLocal("products");
  }, [setActiveNavItem]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal states for confirmations
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteVersionModal, setShowDeleteVersionModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [archiveAction, setArchiveAction] = useState(null); // 'archive' or 'unarchive'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // New filter states for API
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const fetchProducts = async (
    page = currentPage,
    size = pageSize,
    search = searchQuery
  ) => {
    try {
      setLoading(true);
      const response = await resourceService.getAllProductBuyDesigner(
        page,
        size,
        sortBy,
        sortDir,
        search || "",
        null // Don't filter by isArchived
      );

      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to load the product list",
        position: "top",
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reload products when screen gains focus (e.g., after creating a new version)
  useFocusEffect(
    useCallback(() => {
      fetchProducts(0, pageSize);
    }, [pageSize])
  );

  // Refetch when search query changes (with debounce effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(0, pageSize, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchProducts(newPage, pageSize, searchQuery);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchProducts(0, newSize, searchQuery);
  };

  // Client-side filtering by status
  const filteredProducts =
    filter === "ALL"
      ? products
      : products.filter((product) => product.status === filter);

  const isSelectedProductArchived = selectedProduct
    ? selectedProduct.isArchived !== undefined
      ? Boolean(selectedProduct.isArchived)
      : selectedProduct.status === "ARCHIVED"
    : false;

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "#3B82F6";
      case "PUBLISHED":
        return "#10B981";
      case "REJECTED":
        return "#EF4444";
      case "ARCHIVED":
        return "#F59E0B";
      case "DELETED":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pending Review";
      case "PUBLISHED":
        return "Published";
      case "REJECTED":
        return "Rejected";
      case "ARCHIVED":
        return "Archived";
      case "DELETED":
        return "Deleted";
      default:
        return "All";
    }
  };

  const formatCurrency = (amount) => {
    return (amount ?? 0).toLocaleString("vi-VN") + " VND";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleCreateVersionNavigation = (product) => {
    if (!product) return;
    setShowDetailModal(false);
    navigation.navigate("CreateVersionScreen", {
      resourceTemplateId: product.resourceTemplateId,
      productName: product.name,
      currentType: product.type,
    });
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      // Add API call here when available
      setProducts(
        products.filter(
          (p) => p.resourceTemplateId !== selectedProduct.resourceTemplateId
        )
      );
      setShowDeleteModal(false);
      setShowDetailModal(false);
      Toast.show({
        type: "success",
        text1: "Product Deleted",
        text2: `"${selectedProduct.name}" has been deleted successfully`,
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete product",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const handleToggleArchive = (product) => {
    if (!product) return;
    const isArchived =
      product.isArchived !== undefined
        ? Boolean(product.isArchived)
        : product.status === "ARCHIVED";
    setArchiveAction(isArchived ? "unarchive" : "archive");
    setSelectedProduct(product);
    setShowArchiveModal(true);
  };

  const confirmArchiveAction = async () => {
    try {
      if (archiveAction === "unarchive") {
        await resourceService.unarchiveResourceTemplate(
          selectedProduct.resourceTemplateId
        );
      } else {
        await resourceService.archiveResourceTemplate(
          selectedProduct.resourceTemplateId
        );
      }
      setShowArchiveModal(false);
      setShowDetailModal(false);
      fetchProducts();
      Toast.show({
        type: "success",
        text1:
          archiveAction === "unarchive"
            ? "Product Unarchived"
            : "Product Archived",
        text2: `"${selectedProduct.name}" has been ${archiveAction}d successfully`,
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || `Unable to ${archiveAction} this product.`,
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const handlePublishVersion = (version) => {
    setSelectedVersion(version);
    setShowPublishModal(true);
  };

  const confirmPublishVersion = async () => {
    try {
      await resourceService.pubicResourceVersion(selectedVersion.versionId);
      setShowPublishModal(false);
      fetchProducts();
      setShowDetailModal(false);
      Toast.show({
        type: "success",
        text1: "Version Published",
        text2: `Version ${selectedVersion.versionNumber} has been published successfully`,
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to publish version",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const handleDeleteVersion = (version) => {
    setSelectedVersion(version);
    setShowDeleteVersionModal(true);
  };

  const confirmDeleteVersion = async () => {
    try {
      await resourceService.deleteResourceVersion(selectedVersion.versionId);
      setShowDeleteVersionModal(false);
      fetchProducts();
      setShowDetailModal(false);
      Toast.show({
        type: "success",
        text1: "Version Deleted",
        text2: `Version ${selectedVersion.versionNumber} has been deleted successfully`,
        position: "top",
        visibilityTime: 3000,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to delete version",
        position: "top",
        visibilityTime: 3000,
      });
    }
  };

  const handleUpdateVersion = (version) => {
    if (!version) return;
    setShowDetailModal(false);
    navigation.navigate("CreateVersionScreen", {
      resourceTemplateId: selectedProduct.resourceTemplateId,
      productName: selectedProduct.name,
      currentType: selectedProduct.type,
      versionId: version.versionId,
      versionData: version,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconColor={isDark ? "#FFFFFF" : "#084F8C"} iconSize={26} />
          <Text style={styles.headerTitle}>Products</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowFilterModal(true)}
            style={styles.headerActionIcon}
          >
            <Icon name="filter-list" size={22} color={isDark ? "#FFFFFF" : "#084F8C"} />
          </Pressable>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalElements}</Text>
          <Text style={styles.statLabel}>Total products</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {currentPage + 1}
          </Text>
          <Text style={styles.statLabel}>Current Page</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPages}</Text>
          <Text style={styles.statLabel}>Total Pages</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={isDark ? "#94A3B8" : "#6B7280"} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {[
          "ALL",
          "PENDING_REVIEW",
          "PUBLISHED",
          "REJECTED",
          "ARCHIVED",
          "DELETED",
        ].map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterTab,
              filter === status && styles.filterTabActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === status && styles.filterTabTextActive,
              ]}
            >
              {getStatusText(status)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Products List */}
      <ScrollView
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              Loading...
            </Text>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const isArchived =
              product.isArchived !== undefined
                ? Boolean(product.isArchived)
                : product.status === "ARCHIVED";
            return (
              <Pressable
                key={product.resourceTemplateId}
                style={[
                  styles.productCardContainer,
                  { borderLeftColor: getStatusColor(product.status) }
                ]}
                onPress={() => handleProductPress(product)}
              >
                <View style={styles.productContentRow}>
                  {/* Thumbnail */}
                  {product.images && product.images.length > 0 ? (
                    <Image
                      source={{
                        uri:
                          product.images[0].url || product.images[0].imageUrl,
                      }}
                      style={styles.productThumbnailImage}
                    />
                  ) : (
                    <View style={styles.productThumbnailPlaceholder}>
                      <Icon name="image" size={32} color={isDark ? "#64748B" : "#9CA3AF"} />
                    </View>
                  )}

                  {/* Content */}
                  <View style={styles.productInfoColumn}>
                    {/* Header Row */}
                    <View style={styles.productHeaderRow}>
                      <Text
                        style={styles.productTitleText}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <View
                        style={[
                          styles.statusBadgeContainer,
                          { backgroundColor: getStatusColor(product.status) }
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {getStatusText(product.status)}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text
                      style={styles.productDescriptionText}
                      numberOfLines={2}
                    >
                      {product.description}
                    </Text>

                    {/* Metrics Grid */}
                    <View style={styles.metricsContainer}>
                      <View style={styles.metricItem}>
                        <Icon name="attach-money" size={14} color="#10B981" />
                        <Text style={styles.metricText}>
                          {formatCurrency(product.price)}
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Icon name="shopping-cart" size={14} color="#3B82F6" />
                        <Text style={styles.metricTextSecondary}>
                          {product.totalPurchases ?? 0} sales
                        </Text>
                      </View>

                      <View style={styles.metricItem}>
                        <Icon name="trending-up" size={14} color="#F59E0B" />
                        <Text style={styles.metricTextSecondary}>
                          {formatCurrency(product.totalRevenue ?? 0)}
                        </Text>
                      </View>

                      {product.averageRating && (
                        <View style={styles.metricItem}>
                          <Icon name="star" size={14} color="#FBBF24" />
                          <Text style={styles.metricTextSecondary}>
                            {product.averageRating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom Row */}
                    <View style={styles.bottomRow}>
                      <View style={styles.typeContainer}>
                        <Icon name="category" size={12} color={isDark ? "#64748B" : "#9CA3AF"} />
                        <Text style={styles.typeText}>
                          {product.type}
                        </Text>
                      </View>

                      <View style={styles.actionButtonsRow}>
                        <Pressable
                          style={styles.actionButtonContainer}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleCreateVersionNavigation(product);
                          }}
                        >
                          <Icon name="post-add" size={16} color={styles.actionButtonText} />
                          <Text style={styles.filterTabText}>
                            New Version
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.archiveButtonContainer,
                            { backgroundColor: isArchived ? styles.unarchiveButtonBg : styles.archiveButtonBg }
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleArchive(product);
                          }}
                        >
                          <Icon
                            name={isArchived ? "unarchive" : "archive"}
                            size={16}
                            color={isArchived ? styles.unarchiveButtonText : styles.archiveButtonText}
                          />
                          <Text
                            style={[
                              styles.archiveButtonText,
                              { color: isArchived ? styles.unarchiveButtonText : styles.archiveButtonText }
                            ]}
                          >
                            {isArchived ? "Unarchive" : "Archive"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        {!loading && filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="inventory" size={64} color={styles.emptyIconColor} />
            <Text style={styles.emptyStateTitle}>
              No products
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "No matching products found"
                : "You haven't added any products yet"}
            </Text>
          </View>
        )}
      </ScrollView>
      {!loading && (
        <View style={styles.paginationContainer}>
          <Pressable
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            style={[
              styles.paginationButtonPrev,
              currentPage === 0 ? styles.paginationButtonDisabled : styles.paginationButtonActive
            ]}
          >
            <Text style={styles.paginationButtonTextPrimary}>Prev</Text>
          </Pressable>

          <Text style={styles.paginationText}>
            Page {currentPage + 1} / {totalPages}
          </Text>

          <Pressable
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages}
            style={[
              styles.paginationButtonNext,
              currentPage + 1 >= totalPages ? styles.paginationButtonDisabled : styles.paginationButtonActive
            ]}
          >
            <Text style={styles.paginationButtonTextPrimary}>Next</Text>
          </Pressable>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
          activeOpacity={1}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrapper}>
                  <Icon name="filter-list" size={22} color={isDark ? "#60A5FA" : "#1E3A8A"} />
                </View>
                <Text style={styles.modalTitle}>
                  Filter Status
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFilterModal(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={22} color={isDark ? "#94A3B8" : "#64748B"} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {[
                { value: "ALL", icon: "apps", color: isDark ? "#94A3B8" : "#64748B" },
                { value: "PENDING_REVIEW", icon: "schedule", color: "#3B82F6" },
                { value: "PUBLISHED", icon: "check-circle", color: "#10B981" },
                { value: "REJECTED", icon: "cancel", color: "#EF4444" },
                { value: "ARCHIVED", icon: "archive", color: "#F59E0B" },
                { value: "DELETED", icon: "delete", color: "#6B7280" },
              ].map((status) => (
                <Pressable
                  key={status.value}
                  style={[
                    styles.modalOption,
                    filter === status && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setFilter(status.value);
                    setShowFilterModal(false);
                  }}
                >
                  <View style={styles.modalOptionLeft}>
                    <View
                      style={[
                        styles.modalOptionIcon,
                        { backgroundColor: status.color + "20" },
                      ]}
                    >
                      <Icon
                        name={status.icon}
                        size={20}
                        color={status.color}
                      />
                    </View>
                    <Text style={styles.modalOptionText}>
                      {getStatusText(status.value)}
                    </Text>
                  </View>
                  {filter === status.value && (
                    <View style={styles.checkIconWrapper}>
                      <Icon name="check" size={16} color="#FFF" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmation Modals */}
      {/* Archive Modal */}
      <Modal
        visible={showArchiveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArchiveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ padding: 24, alignItems: "center" }}>
              <View style={[styles.modalIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Icon name="archive" size={32} color="#D97706" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 12 }]}>
                {archiveAction === "unarchive" ? "Unarchive Product?" : "Archive Product?"}
              </Text>
              <Text style={styles.modalMessage}>
                {archiveAction === "unarchive"
                  ? `Are you sure you want to unarchive "${selectedProduct?.name}"? It will be visible to users again.`
                  : `Are you sure you want to archive "${selectedProduct?.name}"? It will be hidden from users.`}
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowArchiveModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmButton}
                  onPress={confirmArchiveAction}
                >
                  <LinearGradient
                    colors={["#D97706", "#B45309"]}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>
                      {archiveAction === "unarchive" ? "Unarchive" : "Archive"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ padding: 24, alignItems: "center" }}>
              <View style={[styles.modalIconContainer, { backgroundColor: "#FEE2E2" }]}>
                <Icon name="delete-forever" size={32} color="#DC2626" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 12 }]}>
                Delete Product?
              </Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmButton}
                  onPress={confirmDeleteProduct}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Delete</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Publish Version Modal */}
      <Modal
        visible={showPublishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPublishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ padding: 24, alignItems: "center" }}>
              <View style={[styles.modalIconContainer, { backgroundColor: "#D1FAE5" }]}>
                <Icon name="publish" size={32} color="#059669" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 12 }]}>
                Publish Version?
              </Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to publish version {selectedVersion?.versionNumber}? It will become available for purchase.
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowPublishModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmButton}
                  onPress={confirmPublishVersion}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Publish</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Version Modal */}
      <Modal
        visible={showDeleteVersionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteVersionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ padding: 24, alignItems: "center" }}>
              <View style={[styles.modalIconContainer, { backgroundColor: "#FEE2E2" }]}>
                <Icon name="delete" size={32} color="#DC2626" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: "center", marginBottom: 12 }]}>
                Delete Version?
              </Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete version {selectedVersion?.versionNumber}? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteVersionModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmButton}
                  onPress={confirmDeleteVersion}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Delete</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.detailModalOverlay}>
          <Pressable
            style={styles.detailModalOverlay}
            onPress={() => setShowDetailModal(false)}
            activeOpacity={1}
          >
            <Pressable
              style={styles.detailModalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Modal Header */}
              <View style={styles.detailModalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalIconWrapper}>
                    <Icon name="inventory" size={22} color={isDark ? "#60A5FA" : "#1E3A8A"} />
                  </View>
                  <Text style={styles.modalTitle}>Product Details</Text>
                </View>
                <Pressable
                  onPress={() => setShowDetailModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={22} color={isDark ? "#94A3B8" : "#64748B"} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.detailModalBody}
                showsVerticalScrollIndicator={false}
              >
                {selectedProduct && (
                  <View style={styles.detailBodyRow}>
                    <View style={styles.leftPane}>
                      <View style={styles.leftPaneCard}>
                        {/* Image Gallery - Show all images from current version */}
                        {(() => {
                          const currentVersion = selectedProduct.versions?.find(
                            v => v.versionId === selectedProduct.currentPublishedVersionId
                          );
                          const allImages = currentVersion?.images || selectedProduct.images || [];

                          if (allImages.length === 0) {
                            return (
                              <View style={styles.heroPlaceholder}>
                                <Icon name="image" size={48} color={isDark ? "#64748B" : "#9CA3AF"} />
                                <Text style={{ color: isDark ? "#64748B" : "#9CA3AF", fontSize: 12, marginTop: 8 }}>No images</Text>
                              </View>
                            );
                          }

                          return (
                            <View>
                              {/* Main Image */}
                              <Image
                                source={{ uri: allImages[0].imageUrl || allImages[0].url }}
                                style={styles.detailImage}
                              />

                              {/* Thumbnail Gallery */}
                              {allImages.length > 1 && (
                                <View style={{ marginTop: 12 }}>
                                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: styles.textPrimary }}>
                                      All Images
                                    </Text>
                                    <View style={{ backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                                      <Text style={{ fontSize: 10, color: styles.primaryBlue, fontWeight: "600" }}>
                                        {allImages.length} images
                                      </Text>
                                    </View>
                                  </View>
                                  <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ marginHorizontal: -4 }}
                                  >
                                    {allImages.map((img, idx) => (
                                      <View
                                        key={idx}
                                        style={{
                                          marginHorizontal: 4,
                                          borderRadius: 8,
                                          borderWidth: img.isThumbnail ? 2 : 1,
                                          borderColor: img.isThumbnail ? styles.primaryBlue : styles.borderColor,
                                          overflow: "hidden",
                                        }}
                                      >
                                        <Image
                                          source={{ uri: img.imageUrl || img.url }}
                                          style={{
                                            width: 80,
                                            height: 80,
                                            backgroundColor: styles.inputBackground,
                                          }}
                                        />
                                        {img.isThumbnail && (
                                          <View style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            backgroundColor: styles.primaryBlue,
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4
                                          }}>
                                            <Text style={{ color: "#FFFFFF", fontSize: 8, fontWeight: "600" }}>
                                              MAIN
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    ))}
                                  </ScrollView>
                                </View>
                              )}
                            </View>
                          );
                        })()}
                      </View>
                    </View>

                    <View style={styles.rightPane}>
                      <View style={styles.infoCard}>
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>
                            Product name
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedProduct.name}
                          </Text>
                        </View>

                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>
                            Description
                          </Text>
                          <Text style={styles.detailValue}>
                            {selectedProduct.description}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>
                              Price
                            </Text>
                            <Text style={styles.detailValue}>
                              {formatCurrency(selectedProduct.price)}
                            </Text>
                          </View>

                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>
                              Type
                            </Text>
                            <Text style={styles.detailValue}>
                              {selectedProduct.type}
                            </Text>
                          </View>
                        </View>

                        {/* Sales Metrics Cards */}
                        <View style={{ marginVertical: 12 }}>
                          <Text style={{ fontSize: 13, fontWeight: "600", color: styles.textPrimary, marginBottom: 10 }}>
                            Sales Performance
                          </Text>
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <View style={{ flex: 1, backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#3B82F6" }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <Icon name="shopping-cart" size={16} color="#3B82F6" />
                                <Text style={{ fontSize: 11, color: isDark ? "#60A5FA" : "#1E40AF", fontWeight: "600" }}>Purchases</Text>
                              </View>
                              <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#60A5FA" : "#1E3A8A" }}>
                                {selectedProduct.totalPurchases ?? 0}
                              </Text>
                            </View>

                            <View style={{ flex: 1, backgroundColor: isDark ? "#064E3B" : "#D1FAE5", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#10B981" }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <Icon name="attach-money" size={16} color="#10B981" />
                                <Text style={{ fontSize: 11, color: isDark ? "#34D399" : "#065F46", fontWeight: "600" }}>Revenue</Text>
                              </View>
                              <Text style={{ fontSize: 16, fontWeight: "700", color: isDark ? "#34D399" : "#065F46" }}>
                                {formatCurrency(selectedProduct.totalRevenue ?? 0)}
                              </Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                            <View style={{ flex: 1, backgroundColor: isDark ? "#451A03" : "#FEF3C7", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#F59E0B" }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <Icon name="star" size={16} color="#F59E0B" />
                                <Text style={{ fontSize: 11, color: isDark ? "#FCD34D" : "#92400E", fontWeight: "600" }}>Rating</Text>
                              </View>
                              <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#FCD34D" : "#92400E" }}>
                                {selectedProduct.averageRating ? `${selectedProduct.averageRating.toFixed(1)} ⭐` : "N/A"}
                              </Text>
                            </View>

                            <View style={{ flex: 1, backgroundColor: isDark ? "#312E81" : "#E0E7FF", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#6366F1" }}>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <Icon name="layers" size={16} color="#6366F1" />
                                <Text style={{ fontSize: 11, color: isDark ? "#A5B4FC" : "#3730A3", fontWeight: "600" }}>Version</Text>
                              </View>
                              <Text style={{ fontSize: 20, fontWeight: "700", color: isDark ? "#A5B4FC" : "#3730A3" }}>
                                {selectedProduct.currentVersionNumber ?? "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.detailRow}>
                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>
                              Created At
                            </Text>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedProduct.createdAt)}
                            </Text>
                          </View>
                          <View style={styles.detailCol}>
                            <Text style={styles.detailLabel}>
                              Updated At
                            </Text>
                            <Text style={styles.detailValue}>
                              {formatDate(selectedProduct.updatedAt)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>
                            Status
                          </Text>
                          <View
                            style={[
                              styles.statusBadgeLarge,
                              {
                                backgroundColor: getStatusColor(
                                  selectedProduct.status
                                ),
                              },
                            ]}
                          >
                            <Icon name="circle" size={8} color="#FFFFFF" />
                            <Text style={styles.statusTextLarge}>
                              {getStatusText(selectedProduct.status)}
                            </Text>
                          </View>
                        </View>

                        {selectedProduct.isArchived !== null && selectedProduct.isArchived !== undefined && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>
                              Archive Status
                            </Text>
                            <Text style={styles.detailValue}>
                              {selectedProduct.isArchived ? "Archived" : "Active"}
                            </Text>
                          </View>
                        )}

                        {/* Versions Section */}
                        {selectedProduct.versions && selectedProduct.versions.length > 0 && (
                          <View style={styles.detailSection}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <Text style={styles.detailLabel}>
                                Version History
                              </Text>
                              <View style={{ backgroundColor: isDark ? "#1E3A5F" : "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                                <Text style={{ fontSize: 11, color: styles.primaryBlue, fontWeight: "600" }}>
                                  {selectedProduct.versions.length} versions
                                </Text>
                              </View>
                            </View>
                            {selectedProduct.versions.map((version, index) => (
                              <View
                                key={version.versionId}
                                style={{
                                  backgroundColor: version.status === "PUBLISHED" ? (isDark ? "#064E3B" : "#F0FDF4") : styles.cardBackground,
                                  padding: 14,
                                  borderRadius: 10,
                                  marginTop: 10,
                                  borderLeftWidth: 4,
                                  borderLeftColor: version.status === "PUBLISHED" ? "#10B981" : version.status === "PENDING_REVIEW" ? "#3B82F6" : "#6B7280",
                                  shadowColor: styles.shadowColor,
                                  shadowOffset: { width: 0, height: 1 },
                                  shadowOpacity: isDark ? 0.3 : 0.05,
                                  shadowRadius: 2,
                                  elevation: 1,
                                }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                                    {/* Version Thumbnail */}
                                    {(() => {
                                      const thumbnail = version.images?.find(img => img.isThumbnail) || version.images?.[0];
                                      if (thumbnail && thumbnail.imageUrl && thumbnail.imageUrl !== "string") {
                                        return (
                                          <Image
                                            source={{ uri: thumbnail.imageUrl }}
                                            style={{
                                              width: 50,
                                              height: 50,
                                              borderRadius: 8,
                                              backgroundColor: styles.inputBackground,
                                            }}
                                          />
                                        );
                                      }
                                      return (
                                        <View
                                          style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 8,
                                            backgroundColor: styles.inputBackground,
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <Icon name="image" size={24} color={isDark ? "#64748B" : "#9CA3AF"} />
                                        </View>
                                      );
                                    })()}
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                        <View style={{ backgroundColor: styles.cardBackground, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: styles.borderColor }}>
                                          <Text style={{ fontSize: 13, fontWeight: "700", color: styles.textPrimary }}>
                                            v{version.versionNumber}
                                          </Text>
                                        </View>
                                        <View
                                          style={{
                                            backgroundColor: getStatusColor(version.status),
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                          }}
                                        >
                                          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}>
                                            {getStatusText(version.status)}
                                          </Text>
                                        </View>
                                        {version.versionId === selectedProduct.currentPublishedVersionId && (
                                          <View
                                            style={{
                                              backgroundColor: isDark ? "#1E3A5F" : "#DBEAFE",
                                              paddingHorizontal: 8,
                                              paddingVertical: 4,
                                              borderRadius: 6,
                                            }}
                                          >
                                            <Text style={{ color: isDark ? "#60A5FA" : "#1E40AF", fontSize: 10, fontWeight: "600" }}>
                                              CURRENT
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                      <Text style={{ fontSize: 14, color: styles.textPrimary, fontWeight: "600", marginTop: 4 }} numberOfLines={1}>
                                        {version.name}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <Text style={{ fontSize: 12, color: styles.textSecondary, marginBottom: 10, lineHeight: 16 }}>
                                  {version.description}
                                </Text>

                                {/* Metrics Row */}
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Icon name="attach-money" size={14} color="#10B981" />
                                    <Text style={{ fontSize: 11, color: styles.textPrimary, fontWeight: "600" }}>
                                      {formatCurrency(version.price)}
                                    </Text>
                                  </View>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Icon name="shopping-cart" size={14} color="#3B82F6" />
                                    <Text style={{ fontSize: 11, color: styles.textPrimary }}>
                                      {version.purchaseCount} sales
                                    </Text>
                                  </View>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Icon name="star" size={14} color="#FBBF24" />
                                    <Text style={{ fontSize: 11, color: styles.textPrimary }}>
                                      {version.averageRating > 0 ? version.averageRating.toFixed(1) : "N/A"}
                                    </Text>
                                  </View>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: styles.cardBackground, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Icon name="comment" size={14} color="#8B5CF6" />
                                    <Text style={{ fontSize: 11, color: styles.textPrimary }}>
                                      {version.feedbackCount} reviews
                                    </Text>
                                  </View>
                                </View>

                                {/* Dates */}
                                <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Icon name="calendar-today" size={11} color={styles.textMuted} />
                                    <Text style={{ fontSize: 10, color: styles.textMuted }}>
                                      Released: {formatDate(version.releaseDate)}
                                    </Text>
                                  </View>
                                  {version.expiredTime && (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                      <Icon name="event-busy" size={11} color="#EF4444" />
                                      <Text style={{ fontSize: 10, color: "#EF4444" }}>
                                        Expires: {formatDate(version.expiredTime)}
                                      </Text>
                                    </View>
                                  )}
                                </View>

                                {/* Action Buttons */}
                                {version.status === "PUBLISHED" && version.versionId !== selectedProduct.currentPublishedVersionId ? (
                                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: styles.borderColor }}>
                                    <Pressable
                                      style={{
                                        flex: 1,
                                        backgroundColor: "#10B981",
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 8,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                      }}
                                      onPress={() => handlePublishVersion(version)}
                                    >
                                      <Icon name="publish" size={16} color="#FFFFFF" />
                                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                                        Set as Current
                                      </Text>
                                    </Pressable>
                                  </View>
                                ) : version.status !== "PUBLISHED" ? (
                                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: styles.borderColor }}>
                                    {version.status === "PENDING_REVIEW" && (
                                      <Pressable
                                        style={{
                                          flex: 1,
                                          backgroundColor: "#3B82F6",
                                          paddingVertical: 8,
                                          paddingHorizontal: 12,
                                          borderRadius: 8,
                                          flexDirection: "row",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          gap: 6,
                                        }}
                                        onPress={() => handleUpdateVersion(version)}
                                      >
                                        <Icon name="edit" size={16} color="#FFFFFF" />
                                        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                                          Update
                                        </Text>
                                      </Pressable>
                                    )}
                                    <Pressable
                                      style={{ flex: 1, backgroundColor: "#EF4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
                                      onPress={() => handleDeleteVersion(version)}
                                    >
                                      <Icon name="delete" size={16} color="#FFFFFF" />
                                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Delete</Text>
                                    </Pressable>
                                  </View>
                                ) : null}
                              </View>
                            ))}
                          </View>
                        )}

                        {selectedProduct.designerInfo && (
                          <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>
                              Designer info
                            </Text>
                            <View style={styles.designerInfo}>
                              <View style={styles.designerAvatar}>
                                <Icon name="person" size={20} color={styles.primaryBlue} />
                              </View>
                              <View
                                style={styles.designerDetails}
                              >
                                <Text style={styles.designerName}>
                                  {selectedProduct.designerInfo.firstName}{" "}
                                  {selectedProduct.designerInfo.lastName}
                                </Text>
                                <Text
                                  style={styles.designerEmail}
                                >
                                  {selectedProduct.designerInfo.email}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}


                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
