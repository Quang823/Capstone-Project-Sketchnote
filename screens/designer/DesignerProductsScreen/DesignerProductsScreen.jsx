import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  Image,
  Animated,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { designerProductsStyles } from "./DesignerProductsScreen.styles";
import { resourceService } from "../../../service/resourceService";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useNavigation as useNavContext } from "../../../context/NavigationContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerProductsScreen() {
  const navigation = useNavigation();
  const { setActiveNavItem } = useNavContext();
  const [activeNavItemLocal, setActiveNavItemLocal] = useState("products");

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
        null  // Don't filter by isArchived
      );

      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Unable to load the product list");
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
  const filteredProducts = filter === "ALL"
    ? products
    : products.filter(product => product.status === filter);

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
    Alert.alert(
      "Delete product",
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setProducts(
              products.filter(
                (p) => p.resourceTemplateId !== product.resourceTemplateId
              )
            );
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handleToggleArchive = (product) => {
    if (!product) return;
    const isArchived =
      product.isArchived !== undefined
        ? Boolean(product.isArchived)
        : product.status === "ARCHIVED";
    const actionVerb = isArchived ? "unarchive" : "archive";

    Alert.alert(
      isArchived ? "Unarchive product?" : "Archive product?",
      `Are you sure you want to ${actionVerb} "${product.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: isArchived ? "Unarchive" : "Archive",
          onPress: async () => {
            try {
              if (isArchived) {
                await resourceService.unarchiveResourceTemplate(product.resourceTemplateId);
                Alert.alert("Success", "Product is unarchive susscess.");
              } else {
                await resourceService.archiveResourceTemplate(product.resourceTemplateId);
                Alert.alert("Success", "Product moved to archive.");
              }
              fetchProducts();
            } catch (error) {
              console.error(`Error trying to ${actionVerb} product:`, error);
              Alert.alert(
                "Error",
                error.message || `Unable to ${actionVerb} this product.`
              );
            }
          },
        },
      ]
    );
  };

  const handlePublishVersion = (version) => {
    Alert.alert(
      "Publish Version",
      `Are you sure you want to publish version ${version.versionNumber}?\n\nThis will make it the current published version.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Publish",
          onPress: async () => {
            try {
              await resourceService.pubicResourceVersion(version.versionId);
              Alert.alert("Success", `Version ${version.versionNumber} published!`);
              fetchProducts();
              setShowDetailModal(false);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to publish version");
            }
          },
        },
      ]
    );
  };

  const handleDeleteVersion = (version) => {
    Alert.alert(
      "Delete Version",
      `Are you sure you want to delete version ${version.versionNumber}?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await resourceService.deleteResourceVersion(version.versionId);
              Alert.alert("Success", `Version ${version.versionNumber} deleted!`);
              fetchProducts();
              setShowDetailModal(false);
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to delete version");
            }
          },
        },
      ]
    );
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
    <View style={designerProductsStyles.container}>
      {/* Header */}
      <View style={designerProductsStyles.header}>
        <View style={designerProductsStyles.headerLeft}>
          <SidebarToggleButton iconColor="#084F8C" iconSize={26} />
          <Text style={designerProductsStyles.headerTitle}>Products</Text>
        </View>
        <View style={designerProductsStyles.headerActions}>
          <Pressable
            onPress={() => setShowFilterModal(true)}
            style={designerProductsStyles.headerActionIcon}
          >
            <Icon name="filter-list" size={22} color="#084F8C" />
          </Pressable>
        </View>
      </View>


      {/* Stats Cards */}
      <View style={designerProductsStyles.statsContainer}>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>{totalElements}</Text>
          <Text style={designerProductsStyles.statLabel}>Total products</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>{currentPage + 1}</Text>
          <Text style={designerProductsStyles.statLabel}>Current Page</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>
            {totalPages}
          </Text>
          <Text style={designerProductsStyles.statLabel}>Total Pages</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={designerProductsStyles.searchContainer}>
        <View style={designerProductsStyles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={designerProductsStyles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={designerProductsStyles.filterTabs}>
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
              designerProductsStyles.filterTab,
              filter === status && designerProductsStyles.filterTabActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                designerProductsStyles.filterTabText,
                filter === status && designerProductsStyles.filterTabTextActive,
              ]}
            >
              {getStatusText(status)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Products List */}
      <ScrollView
        style={designerProductsStyles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={designerProductsStyles.emptyState}>
            <Text style={designerProductsStyles.emptyStateTitle}>
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
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  marginHorizontal: 16,
                  marginBottom: 16,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  borderLeftWidth: 4,
                  borderLeftColor: getStatusColor(product.status),
                }}
                onPress={() => handleProductPress(product)}
              >
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {/* Thumbnail */}
                  {product.images && product.images.length > 0 ? (
                    <Image
                      source={{
                        uri: product.images[0].url || product.images[0].imageUrl,
                      }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 8,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="image" size={32} color="#9CA3AF" />
                    </View>
                  )}

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    {/* Header Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#1F2937",
                          flex: 1,
                          marginRight: 8,
                        }}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <View
                        style={{
                          backgroundColor: getStatusColor(product.status),
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "600" }}>
                          {getStatusText(product.status)}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 8,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {product.description}
                    </Text>

                    {/* Metrics Grid */}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Icon name="attach-money" size={14} color="#10B981" />
                        <Text style={{ fontSize: 12, color: "#374151", fontWeight: "600" }}>
                          {formatCurrency(product.price)}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Icon name="shopping-cart" size={14} color="#3B82F6" />
                        <Text style={{ fontSize: 12, color: "#374151" }}>
                          {product.totalPurchases ?? 0} sales
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Icon name="trending-up" size={14} color="#F59E0B" />
                        <Text style={{ fontSize: 12, color: "#374151" }}>
                          {formatCurrency(product.totalRevenue ?? 0)}
                        </Text>
                      </View>

                      {product.averageRating && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Icon name="star" size={14} color="#FBBF24" />
                          <Text style={{ fontSize: 12, color: "#374151" }}>
                            {product.averageRating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Bottom Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Icon name="category" size={12} color="#9CA3AF" />
                        <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {product.type}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <Pressable
                          style={{
                            backgroundColor: "#E0F2FE",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleCreateVersionNavigation(product);
                          }}
                        >
                          <Icon name="post-add" size={16} color="#0284C7" />
                          <Text style={{ fontSize: 11, color: "#0284C7", fontWeight: "600" }}>
                            New Version
                          </Text>
                        </Pressable>

                        <Pressable
                          style={{
                            backgroundColor: isArchived ? "#E0E7FF" : "#FEF3C7",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleArchive(product);
                          }}
                        >
                          <Icon
                            name={isArchived ? "unarchive" : "archive"}
                            size={16}
                            color={isArchived ? "#4338CA" : "#B45309"}
                          />
                          <Text style={{ fontSize: 11, color: isArchived ? "#4338CA" : "#B45309", fontWeight: "600" }}>
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
          <View style={designerProductsStyles.emptyState}>
            <Icon name="inventory" size={64} color="#D1D5DB" />
            <Text style={designerProductsStyles.emptyStateTitle}>
              No products
            </Text>
            <Text style={designerProductsStyles.emptyStateText}>
              {searchQuery
                ? "No matching products found"
                : "You haven't added any products yet"}
            </Text>
          </View>
        )}
      </ScrollView>
      {!loading && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginVertical: 16,
          }}
        >
          <Pressable
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: currentPage === 0 ? "#E5E7EB" : "#3B82F6",
              borderRadius: 8,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "#FFF" }}>Prev</Text>
          </Pressable>

          <Text style={{ fontSize: 16, color: "#374151" }}>
            Page {currentPage + 1} / {totalPages}
          </Text>

          <Pressable
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage + 1 >= totalPages}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor:
                currentPage + 1 >= totalPages ? "#E5E7EB" : "#3B82F6",
              borderRadius: 8,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: "#FFF" }}>Next</Text>
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
          style={designerProductsStyles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
          activeOpacity={1}
        >
          <Pressable
            style={designerProductsStyles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={designerProductsStyles.modalHeader}>
              <View style={designerProductsStyles.modalHeaderLeft}>
                <View style={designerProductsStyles.modalIconWrapper}>
                  <Icon name="filter-list" size={22} color="#1E3A8A" />
                </View>
                <Text style={designerProductsStyles.modalTitle}>
                  Filter Status
                </Text>
              </View>
              <Pressable
                onPress={() => setShowFilterModal(false)}
                style={designerProductsStyles.modalCloseBtn}
              >
                <Icon name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <View style={designerProductsStyles.modalBody}>
              {[
                { value: "ALL", icon: "apps", color: "#64748B" },
                { value: "PENDING_REVIEW", icon: "schedule", color: "#3B82F6" },
                { value: "PUBLISHED", icon: "check-circle", color: "#10B981" },
                { value: "REJECTED", icon: "cancel", color: "#EF4444" },
                { value: "ARCHIVED", icon: "archive", color: "#F59E0B" },
                { value: "DELETED", icon: "delete", color: "#6B7280" },
              ].map((status) => (
                <Pressable
                  key={status.value}
                  style={[
                    designerProductsStyles.modalOption,
                    filter === status.value &&
                    designerProductsStyles.modalOptionActive,
                  ]}
                  onPress={() => {
                    setFilter(status.value);
                    setShowFilterModal(false);
                  }}
                >
                  <View style={designerProductsStyles.modalOptionLeft}>
                    <View
                      style={[
                        designerProductsStyles.modalOptionIcon,
                        { backgroundColor: status.color + "20" },
                      ]}
                    >
                      <Icon name={status.icon} size={20} color={status.color} />
                    </View>
                    <Text style={designerProductsStyles.modalOptionText}>
                      {getStatusText(status.value)}
                    </Text>
                  </View>
                  {filter === status.value && (
                    <View style={designerProductsStyles.checkIconWrapper}>
                      <Icon name="check" size={20} color="#1E3A8A" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Pressable
          style={designerProductsStyles.detailModalOverlay}
          onPress={() => setShowDetailModal(false)}
          activeOpacity={1}
        >
          <Pressable
            style={designerProductsStyles.detailModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle (drag indicator) */}
            <View style={designerProductsStyles.dragHandle} />

            {/* HEADER */}
            <View style={designerProductsStyles.detailModalHeader}>
              <View style={designerProductsStyles.modalHeaderLeft}>
                <View style={designerProductsStyles.modalIconWrapper}>
                  <Icon name="inventory-2" size={22} color="#1E3A8A" />
                </View>
                <Text style={designerProductsStyles.modalTitle}>
                  Product Details
                </Text>
              </View>

              <Pressable
                onPress={() => setShowDetailModal(false)}
                style={designerProductsStyles.modalCloseBtn}
              >
                <Icon name="close" size={22} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              style={designerProductsStyles.detailModalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedProduct && (
                <View style={designerProductsStyles.detailBodyRow}>
                  <View style={designerProductsStyles.leftPane}>
                    <View style={designerProductsStyles.leftPaneCard}>
                      {/* Image Gallery - Show all images from current version */}
                      {(() => {
                        const currentVersion = selectedProduct.versions?.find(
                          v => v.versionId === selectedProduct.currentPublishedVersionId
                        );
                        const allImages = currentVersion?.images || selectedProduct.images || [];

                        if (allImages.length === 0) {
                          return (
                            <View style={designerProductsStyles.heroPlaceholder}>
                              <Icon name="image" size={48} color="#9CA3AF" />
                              <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 8 }}>No images</Text>
                            </View>
                          );
                        }

                        return (
                          <View>
                            {/* Main Image */}
                            <Image
                              source={{ uri: allImages[0].imageUrl || allImages[0].url }}
                              style={designerProductsStyles.detailImage}
                            />

                            {/* Thumbnail Gallery */}
                            {allImages.length > 1 && (
                              <View style={{ marginTop: 12 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>
                                    All Images
                                  </Text>
                                  <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 10, color: "#3B82F6", fontWeight: "600" }}>
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
                                        borderColor: img.isThumbnail ? "#3B82F6" : "#E5E7EB",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <Image
                                        source={{ uri: img.imageUrl || img.url }}
                                        style={{
                                          width: 80,
                                          height: 80,
                                          backgroundColor: "#F3F4F6",
                                        }}
                                      />
                                      {img.isThumbnail && (
                                        <View style={{
                                          position: "absolute",
                                          top: 4,
                                          right: 4,
                                          backgroundColor: "#3B82F6",
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

                  <View style={designerProductsStyles.rightPane}>
                    <View style={designerProductsStyles.infoCard}>
                      <View style={designerProductsStyles.detailSection}>
                        <Text style={designerProductsStyles.detailLabel}>
                          Product name
                        </Text>
                        <Text style={designerProductsStyles.detailValue}>
                          {selectedProduct.name}
                        </Text>
                      </View>

                      <View style={designerProductsStyles.detailSection}>
                        <Text style={designerProductsStyles.detailLabel}>
                          Description
                        </Text>
                        <Text style={designerProductsStyles.detailValue}>
                          {selectedProduct.description}
                        </Text>
                      </View>

                      <View style={designerProductsStyles.detailRow}>
                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Price
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {formatCurrency(selectedProduct.price)}
                          </Text>
                        </View>

                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Type
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {selectedProduct.type}
                          </Text>
                        </View>
                      </View>

                      {/* Sales Metrics Cards */}
                      <View style={{ marginVertical: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 10 }}>
                          Sales Performance
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <View style={{ flex: 1, backgroundColor: "#DBEAFE", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#3B82F6" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Icon name="shopping-cart" size={16} color="#3B82F6" />
                              <Text style={{ fontSize: 11, color: "#1E40AF", fontWeight: "600" }}>Purchases</Text>
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1E3A8A" }}>
                              {selectedProduct.totalPurchases ?? 0}
                            </Text>
                          </View>

                          <View style={{ flex: 1, backgroundColor: "#D1FAE5", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#10B981" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Icon name="attach-money" size={16} color="#10B981" />
                              <Text style={{ fontSize: 11, color: "#065F46", fontWeight: "600" }}>Revenue</Text>
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: "#065F46" }}>
                              {formatCurrency(selectedProduct.totalRevenue ?? 0)}
                            </Text>
                          </View>
                        </View>

                        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                          <View style={{ flex: 1, backgroundColor: "#FEF3C7", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#F59E0B" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Icon name="star" size={16} color="#F59E0B" />
                              <Text style={{ fontSize: 11, color: "#92400E", fontWeight: "600" }}>Rating</Text>
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#92400E" }}>
                              {selectedProduct.averageRating ? `${selectedProduct.averageRating.toFixed(1)} ⭐` : "N/A"}
                            </Text>
                          </View>

                          <View style={{ flex: 1, backgroundColor: "#E0E7FF", padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: "#6366F1" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <Icon name="layers" size={16} color="#6366F1" />
                              <Text style={{ fontSize: 11, color: "#3730A3", fontWeight: "600" }}>Version</Text>
                            </View>
                            <Text style={{ fontSize: 20, fontWeight: "700", color: "#3730A3" }}>
                              {selectedProduct.currentVersionNumber ?? "N/A"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={designerProductsStyles.detailRow}>
                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Created At
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {formatDate(selectedProduct.createdAt)}
                          </Text>
                        </View>
                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Updated At
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {formatDate(selectedProduct.updatedAt)}
                          </Text>
                        </View>
                      </View>

                      <View style={designerProductsStyles.detailSection}>
                        <Text style={designerProductsStyles.detailLabel}>
                          Status
                        </Text>
                        <View
                          style={[
                            designerProductsStyles.statusBadgeLarge,
                            {
                              backgroundColor: getStatusColor(
                                selectedProduct.status
                              ),
                            },
                          ]}
                        >
                          <Icon name="circle" size={8} color="#FFFFFF" />
                          <Text style={designerProductsStyles.statusTextLarge}>
                            {getStatusText(selectedProduct.status)}
                          </Text>
                        </View>
                      </View>

                      {selectedProduct.isArchived !== null && selectedProduct.isArchived !== undefined && (
                        <View style={designerProductsStyles.detailSection}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Archive Status
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {selectedProduct.isArchived ? "Archived" : "Active"}
                          </Text>
                        </View>
                      )}


                      {/* Versions Section */}
                      {selectedProduct.versions && selectedProduct.versions.length > 0 && (
                        <View style={designerProductsStyles.detailSection}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text style={designerProductsStyles.detailLabel}>
                              Version History
                            </Text>
                            <View style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                              <Text style={{ fontSize: 11, color: "#3B82F6", fontWeight: "600" }}>
                                {selectedProduct.versions.length} versions
                              </Text>
                            </View>
                          </View>
                          {selectedProduct.versions.map((version, index) => (
                            <View
                              key={version.versionId}
                              style={{
                                backgroundColor: version.status === "PUBLISHED" ? "#F0FDF4" : "#F9FAFB",
                                padding: 14,
                                borderRadius: 10,
                                marginTop: 10,
                                borderLeftWidth: 4,
                                borderLeftColor: version.status === "PUBLISHED" ? "#10B981" : version.status === "PENDING_REVIEW" ? "#3B82F6" : "#6B7280",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
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
                                            backgroundColor: "#F3F4F6",
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
                                          backgroundColor: "#F3F4F6",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Icon name="image" size={24} color="#9CA3AF" />
                                      </View>
                                    );
                                  })()}
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                      <View style={{ backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#E5E7EB" }}>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>
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
                                            backgroundColor: "#DBEAFE",
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                          }}
                                        >
                                          <Text style={{ color: "#1E40AF", fontSize: 10, fontWeight: "600" }}>
                                            CURRENT
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                    <Text style={{ fontSize: 14, color: "#1F2937", fontWeight: "600", marginTop: 4 }} numberOfLines={1}>
                                      {version.name}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 10, lineHeight: 16 }}>
                                {version.description}
                              </Text>

                              {/* Metrics Row */}
                              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  <Icon name="attach-money" size={14} color="#10B981" />
                                  <Text style={{ fontSize: 11, color: "#374151", fontWeight: "600" }}>
                                    {formatCurrency(version.price)}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  <Icon name="shopping-cart" size={14} color="#3B82F6" />
                                  <Text style={{ fontSize: 11, color: "#374151" }}>
                                    {version.purchaseCount} sales
                                  </Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  <Icon name="star" size={14} color="#FBBF24" />
                                  <Text style={{ fontSize: 11, color: "#374151" }}>
                                    {version.averageRating > 0 ? version.averageRating.toFixed(1) : "N/A"}
                                  </Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                  <Icon name="comment" size={14} color="#8B5CF6" />
                                  <Text style={{ fontSize: 11, color: "#374151" }}>
                                    {version.feedbackCount} reviews
                                  </Text>
                                </View>
                              </View>

                              {/* Dates */}
                              <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                  <Icon name="calendar-today" size={11} color="#9CA3AF" />
                                  <Text style={{ fontSize: 10, color: "#9CA3AF" }}>
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
                              <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
                                {version.status === "PENDING_REVIEW" ? (
                                  <>
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
                                    <Pressable
                                      style={{ flex: 1, backgroundColor: "#EF4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
                                      onPress={() => handleDeleteVersion(version)}
                                    >
                                      <Icon name="delete" size={16} color="#FFFFFF" />
                                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Delete</Text>
                                    </Pressable>
                                  </>
                                ) : (
                                  <>
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
                                        Publish
                                      </Text>
                                    </Pressable>
                                    <Pressable
                                      style={{ flex: 1, backgroundColor: "#EF4444", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
                                      onPress={() => handleDeleteVersion(version)}
                                    >
                                      <Icon name="delete" size={16} color="#FFFFFF" />
                                      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>Delete</Text>
                                    </Pressable>
                                  </>
                                )}
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {selectedProduct.designerInfo && (
                        <View style={designerProductsStyles.detailSection}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Designer info
                          </Text>
                          <View style={designerProductsStyles.designerInfo}>
                            <View style={designerProductsStyles.designerAvatar}>
                              <Icon name="person" size={20} color="#1E3A8A" />
                            </View>
                            <View
                              style={designerProductsStyles.designerDetails}
                            >
                              <Text style={designerProductsStyles.designerName}>
                                {selectedProduct.designerInfo.firstName}{" "}
                                {selectedProduct.designerInfo.lastName}
                              </Text>
                              <Text
                                style={designerProductsStyles.designerEmail}
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
      </Modal>
    </View>
  );
}
