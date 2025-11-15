import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { designerProductsStyles } from "./DesignerProductsScreen.styles";
import { resourceService } from "../../../service/resourceService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function DesignerProductsScreen() {
  const navigation = useNavigation();
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
      console.log("API Response:", response);
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm");
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
  const matchesFilter =
    filter === "ALL" || product.status === filter;

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
    // Navigate to edit screen or show edit modal
    Alert.alert("Chỉnh sửa", `Chỉnh sửa: ${product.name}`);
  };

  const handleDeleteProduct = (product) => {
    Alert.alert("Xóa sản phẩm", `Bạn có chắc muốn xóa "${product.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
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
    ]);
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
      "Thành công",
      `Sản phẩm đã được ${product.isActive ? "tắt" : "bật"}!`
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
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={designerProductsStyles.headerTitle}>Quản lý sản phẩm</Text>
        <Pressable onPress={() => setShowFilterModal(true)}>
          <Icon name="filter-list" size={24} color="#1F2937" />
        </Pressable>
      </View>

      {/* Stats Cards */}
      <View style={designerProductsStyles.statsContainer}>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>{stats.total}</Text>
          <Text style={designerProductsStyles.statLabel}>Tổng sản phẩm</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>{stats.active}</Text>
          <Text style={designerProductsStyles.statLabel}>Hoạt động</Text>
        </View>
        <View style={designerProductsStyles.statCard}>
          <Text style={designerProductsStyles.statNumber}>
            {stats.inactive}
          </Text>
          <Text style={designerProductsStyles.statLabel}>Không hoạt động</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={designerProductsStyles.searchContainer}>
        <View style={designerProductsStyles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            style={designerProductsStyles.searchInput}
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={designerProductsStyles.filterTabs}>
  {["ALL", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED", "DELETED"].map((status) => (
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
              Đang tải...
            </Text>
          </View>
        ) : filteredProducts.map((product) => (
          <Pressable
            key={product.resourceTemplateId}
            style={designerProductsStyles.productCard}
            onPress={() => handleProductPress(product)}
          >
            {product.images && product.images.length > 0 ? (
              <Image 
                source={{ uri: product.images[0].url || product.images[0].imageUrl }} 
                style={designerProductsStyles.productThumbnail} 
              />
            ) : (
              <View style={[designerProductsStyles.productThumbnail, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                <Icon name="image" size={32} color="#9CA3AF" />
              </View>
            )}
            
            <View style={designerProductsStyles.productInfo}>
              <View style={designerProductsStyles.productHeader}>
                <Text style={designerProductsStyles.productTitle} numberOfLines={1}>
                  {product.name}
                </Text>
                <View style={[
                  designerProductsStyles.statusBadge,
                  { backgroundColor: getStatusColor(product.status) }
                ]}>
                  <Text style={designerProductsStyles.statusText}>
                    {getStatusText(product.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={designerProductsStyles.productDescription} numberOfLines={2}>
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
                  <Text style={designerProductsStyles.statText}>{product.type}</Text>
                </View>
              </View>
              
              <View style={designerProductsStyles.productStats}>
                <View style={designerProductsStyles.statItem}>
                  <Icon name="calendar-today" size={14} color="#6B7280" />
                  <Text style={designerProductsStyles.statText}>
                    Phát hành: {formatDate(product.releaseDate)}
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
        ))}
        
        {!loading && filteredProducts.length === 0 && (
          <View style={designerProductsStyles.emptyState}>
            <Icon name="inventory" size={64} color="#D1D5DB" />
            <Text style={designerProductsStyles.emptyStateTitle}>
              Không có sản phẩm
            </Text>
            <Text style={designerProductsStyles.emptyStateText}>
              {searchQuery
                ? "Không tìm thấy sản phẩm phù hợp"
                : "Bạn chưa có sản phẩm nào"}
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
            <Text style={{ color: "#FFF" }}>Trước</Text>
          </Pressable>

          <Text style={{ fontSize: 16, color: "#374151" }}>
            Trang {currentPage + 1} / {totalPages}
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
            <Text style={{ color: "#FFF" }}>Sau</Text>
          </Pressable>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={designerProductsStyles.modalOverlay}>
          <View style={designerProductsStyles.modalContent}>
            <View style={designerProductsStyles.modalHeader}>
              <Text style={designerProductsStyles.modalTitle}>Bộ lọc</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
            
           <View style={designerProductsStyles.modalBody}>
  <Text style={designerProductsStyles.modalSectionTitle}>Trạng thái</Text>
  {["ALL", "PENDING_REVIEW", "PUBLISHED", "REJECTED", "ARCHIVED", "DELETED"].map((status) => (
    <Pressable
      key={status}
      style={designerProductsStyles.modalOption}
      onPress={() => {
        setFilter(status);
        setShowFilterModal(false);
      }}
    >
      <Text style={designerProductsStyles.modalOptionText}>
        {getStatusText(status)}
      </Text>
      {filter === status && <Icon name="check" size={20} color="#3B82F6" />}
    </Pressable>
  ))}
</View>

          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={designerProductsStyles.modalOverlay}>
          <View style={designerProductsStyles.detailModalContent}>
            <View style={designerProductsStyles.modalHeader}>
              <Text style={designerProductsStyles.modalTitle}>
                Chi tiết sản phẩm
              </Text>
              <Pressable onPress={() => setShowDetailModal(false)}>
                <Icon name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              style={designerProductsStyles.detailModalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedProduct && (
                <>
                  {/* Product Images */}
                  {selectedProduct.images &&
                    selectedProduct.images.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={designerProductsStyles.detailImagesContainer}
                      >
                        {selectedProduct.images.map((img, index) => (
                          <Image
                            key={index}
                            source={{ uri: img.url || img.imageUrl }}
                            style={designerProductsStyles.detailImage}
                          />
                        ))}
                      </ScrollView>
                    )}

                  {/* Product Info */}
                  <View style={designerProductsStyles.detailSection}>
                    <Text style={designerProductsStyles.detailLabel}>
                      Tên sản phẩm
                    </Text>
                    <Text style={designerProductsStyles.detailValue}>
                      {selectedProduct.name}
                    </Text>
                  </View>

                  <View style={designerProductsStyles.detailSection}>
                    <Text style={designerProductsStyles.detailLabel}>
                      Mô tả
                    </Text>
                    <Text style={designerProductsStyles.detailValue}>
                      {selectedProduct.description}
                    </Text>
                  </View>

                  <View style={designerProductsStyles.detailRow}>
                    <View style={designerProductsStyles.detailSection}>
                      <Text style={designerProductsStyles.detailLabel}>
                        Giá
                      </Text>
                      <Text style={designerProductsStyles.detailValue}>
                        {formatCurrency(selectedProduct.price)}
                      </Text>
                    </View>

                    <View style={designerProductsStyles.detailSection}>
                      <Text style={designerProductsStyles.detailLabel}>
                        Loại
                      </Text>
                      <Text style={designerProductsStyles.detailValue}>
                        {selectedProduct.type}
                      </Text>
                    </View>
                  </View>

                  <View style={designerProductsStyles.detailRow}>
                    <View style={designerProductsStyles.detailSection}>
                      <Text style={designerProductsStyles.detailLabel}>
                        Ngày phát hành
                      </Text>
                      <Text style={designerProductsStyles.detailValue}>
                        {formatDate(selectedProduct.releaseDate)}
                      </Text>
                    </View>

                    <View style={designerProductsStyles.detailSection}>
                      <Text style={designerProductsStyles.detailLabel}>
                        Ngày hết hạn
                      </Text>
                      <Text style={designerProductsStyles.detailValue}>
                        {formatDate(selectedProduct.expiredTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={designerProductsStyles.detailSection}>
                    <Text style={designerProductsStyles.detailLabel}>
                      Trạng thái
                    </Text>
                    <View
                      style={[
                        designerProductsStyles.statusBadge,
                        {
                          backgroundColor: getStatusColor(
                            selectedProduct.isActive
                          ),
                          alignSelf: "flex-start",
                        },
                      ]}
                    >
                      <Text style={designerProductsStyles.statusText}>
                        {getStatusText(selectedProduct.isActive)}
                      </Text>
                    </View>
                  </View>

                  {/* Designer Info */}
                  {selectedProduct.designerInfo && (
                    <View style={designerProductsStyles.detailSection}>
                      <Text style={designerProductsStyles.detailLabel}>
                        Thông tin Designer
                      </Text>
                      <Text style={designerProductsStyles.detailValue}>
                        {selectedProduct.designerInfo.firstName}{" "}
                        {selectedProduct.designerInfo.lastName}
                      </Text>
                      <Text style={designerProductsStyles.detailSubValue}>
                        {selectedProduct.designerInfo.email}
                      </Text>
                    </View>
                  )}

                  {/* Items */}
                  {selectedProduct.items &&
                    selectedProduct.items.length > 0 && (
                      <View style={designerProductsStyles.detailSection}>
                        <Text style={designerProductsStyles.detailLabel}>
                          Số lượng items: {selectedProduct.items.length}
                        </Text>
                      </View>
                    )}

                  {/* Action Buttons */}
                  <View style={designerProductsStyles.detailActions}>
                    <Pressable
                      style={[
                        designerProductsStyles.detailButton,
                        { backgroundColor: "#3B82F6" },
                      ]}
                      onPress={() => handleEditProduct(selectedProduct)}
                    >
                      <Icon name="edit" size={20} color="#FFFFFF" />
                      <Text style={designerProductsStyles.detailButtonText}>
                        Chỉnh sửa
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        designerProductsStyles.detailButton,
                        { backgroundColor: "#10B981" },
                      ]}
                      onPress={() => {
                        handleToggleActive(selectedProduct);
                        setShowDetailModal(false);
                      }}
                    >
                      <Icon
                        name={
                          selectedProduct.isActive ? "toggle-off" : "toggle-on"
                        }
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={designerProductsStyles.detailButtonText}>
                        {selectedProduct.isActive ? "Tắt" : "Bật"}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        designerProductsStyles.detailButton,
                        { backgroundColor: "#EF4444" },
                      ]}
                      onPress={() => handleDeleteProduct(selectedProduct)}
                    >
                      <Icon name="delete" size={20} color="#FFFFFF" />
                      <Text style={designerProductsStyles.detailButtonText}>
                        Xóa
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
