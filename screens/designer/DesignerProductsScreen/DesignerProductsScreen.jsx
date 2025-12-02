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
import { useNavigation } from "@react-navigation/native";
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

  const fetchProducts = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const response = await resourceService.getResourceByUserId(page, size);
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

  useEffect(() => {
    fetchProducts(0, pageSize);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchProducts(newPage, pageSize);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    fetchProducts(0, newSize);
  };

  const filteredProducts = products.filter((product) => {
    const matchesFilter = filter === "ALL" || product.status === filter;

    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

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

  const handleEditProduct = (product) => {
    setShowDetailModal(false);
    Alert.alert("Edit", `Edit: ${product.name}`);
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

  const handleToggleActive = (product) => {
    setProducts(
      products.map((p) =>
        p.resourceTemplateId === product.resourceTemplateId
          ? { ...p, isActive: !p.isActive }
          : p
      )
    );
    Alert.alert(
      "Success",
      `Product has been ${product.isActive ? "disabled" : "enabled"}!`
    );
  };

  const getFilterStats = () => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const inactive = products.filter((p) => !p.isActive).length;
    return { total, active, inactive };
  };

  const stats = getFilterStats();

  return (
    <View style={designerProductsStyles.container}>
      {/* Header */}
      <View style={designerProductsStyles.header}>
        <SidebarToggleButton iconColor="#084F8C" iconSize={24} />
        <Text style={designerProductsStyles.headerTitle}>Products</Text>
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
          <Text style={designerProductsStyles.statNumber}>{stats.total}</Text>
          <Text style={designerProductsStyles.statLabel}>Total products</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>{stats.active}</Text>
          <Text style={designerProductsStyles.statLabel}>Active</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>
            {stats.inactive}
          </Text>
          <Text style={designerProductsStyles.statLabel}>Inactive</Text>
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
          filteredProducts.map((product) => (
            <Pressable
              key={product.resourceTemplateId}
              style={designerProductsStyles.productCard}
              onPress={() => handleProductPress(product)}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  source={{
                    uri: product.images[0].url || product.images[0].imageUrl,
                  }}
                  style={designerProductsStyles.productThumbnail}
                />
              ) : (
                <View
                  style={[
                    designerProductsStyles.productThumbnail,
                    {
                      backgroundColor: "#E5E7EB",
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  <Icon name="image" size={32} color="#9CA3AF" />
                </View>
              )}

              <View style={designerProductsStyles.productInfo}>
                <View style={designerProductsStyles.productHeader}>
                  <Text
                    style={designerProductsStyles.productTitle}
                    numberOfLines={1}
                  >
                    {product.name}
                  </Text>
                  <View
                    style={[
                      designerProductsStyles.statusBadge,
                      { backgroundColor: getStatusColor(product.status) },
                    ]}
                  >
                    <Text style={designerProductsStyles.statusText}>
                      {getStatusText(product.status)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={designerProductsStyles.productDescription}
                  numberOfLines={2}
                >
                  {product.description}
                </Text>

                <View style={designerProductsStyles.productStats}>
                  <View style={designerProductsStyles.statItem}>
                    <Icon name="attach-money" size={16} color="#6B7280" />
                    <Text style={designerProductsStyles.statText}>
                      {formatCurrency(product.price)}
                    </Text>
                  </View>
                  <View style={designerProductsStyles.statItem}>
                    <Icon name="category" size={16} color="#6B7280" />
                    <Text style={designerProductsStyles.statText}>
                      {product.type}
                    </Text>
                  </View>
                </View>

                <View style={designerProductsStyles.productStats}>
                  <View style={designerProductsStyles.statItem}>
                    <Icon name="calendar-today" size={14} color="#6B7280" />
                    <Text style={designerProductsStyles.statText}>
                      Released: {formatDate(product.releaseDate)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={designerProductsStyles.productActions}>
                <Pressable
                  style={designerProductsStyles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditProduct(product);
                  }}
                >
                  <Icon name="edit" size={20} color="#3B82F6" />
                </Pressable>

                <Pressable
                  style={designerProductsStyles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleToggleActive(product);
                  }}
                >
                  <Icon
                    name={product.isActive ? "toggle-on" : "toggle-off"}
                    size={20}
                    color={product.isActive ? "#10B981" : "#6B7280"}
                  />
                </Pressable>

                <Pressable
                  style={designerProductsStyles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(product);
                  }}
                >
                  <Icon name="delete" size={20} color="#EF4444" />
                </Pressable>
              </View>
            </Pressable>
          ))
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
                      {selectedProduct.images?.length > 0 ? (
                        <Image
                          source={{
                            uri:
                              selectedProduct.images[0].url ||
                              selectedProduct.images[0].imageUrl,
                          }}
                          style={designerProductsStyles.detailImage}
                        />
                      ) : (
                        <View style={designerProductsStyles.heroPlaceholder}>
                          <Icon name="image" size={48} color="#9CA3AF" />
                        </View>
                      )}

                      {selectedProduct.images?.length > 1 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={designerProductsStyles.thumbsContainer}
                        >
                          {selectedProduct.images.slice(1).map((img, idx) => (
                            <View
                              key={idx}
                              style={designerProductsStyles.thumbWrapper}
                            >
                              <Image
                                source={{ uri: img.url || img.imageUrl }}
                                style={designerProductsStyles.thumbImage}
                              />
                            </View>
                          ))}
                        </ScrollView>
                      )}
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

                      <View style={designerProductsStyles.detailRow}>
                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Release date
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {formatDate(selectedProduct.releaseDate)}
                          </Text>
                        </View>
                        <View style={designerProductsStyles.detailCol}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Expiration date
                          </Text>
                          <Text style={designerProductsStyles.detailValue}>
                            {formatDate(selectedProduct.expiredTime)}
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
                                selectedProduct.status ??
                                selectedProduct.isActive
                              ),
                            },
                          ]}
                        >
                          <Icon name="circle" size={8} color="#FFFFFF" />
                          <Text style={designerProductsStyles.statusTextLarge}>
                            {getStatusText(
                              selectedProduct.status ?? selectedProduct.isActive
                            )}
                          </Text>
                        </View>
                      </View>

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

                      {selectedProduct.items?.length > 0 && (
                        <View style={designerProductsStyles.detailSection}>
                          <Text style={designerProductsStyles.detailLabel}>
                            Items
                          </Text>
                          <View style={designerProductsStyles.itemsCounter}>
                            <Icon name="inventory" size={18} color="#1E3A8A" />
                            <Text style={designerProductsStyles.itemsCountText}>
                              {selectedProduct.items.length} items
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={designerProductsStyles.detailActions}>
                      <Pressable
                        style={[
                          designerProductsStyles.detailButton,
                          designerProductsStyles.detailButtonEdit,
                        ]}
                        onPress={() => handleEditProduct(selectedProduct)}
                      >
                        <Icon name="edit" size={20} color="#FFFFFF" />
                        <Text style={designerProductsStyles.detailButtonText}>
                          Edit
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          designerProductsStyles.detailButton,
                          designerProductsStyles.detailButtonToggle,
                        ]}
                        onPress={() => {
                          handleToggleActive(selectedProduct);
                          setShowDetailModal(false);
                        }}
                      >
                        <Icon
                          name={
                            selectedProduct.isActive
                              ? "toggle-off"
                              : "toggle-on"
                          }
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={designerProductsStyles.detailButtonText}>
                          {selectedProduct.isActive ? "Deactivate" : "Activate"}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          designerProductsStyles.detailButton,
                          designerProductsStyles.detailButtonDelete,
                        ]}
                        onPress={() => handleDeleteProduct(selectedProduct)}
                      >
                        <Icon name="delete" size={20} color="#FFFFFF" />
                        <Text style={designerProductsStyles.detailButtonText}>
                          Delete
                        </Text>
                      </Pressable>
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
