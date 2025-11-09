import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import { resourceStoreStyles } from "./ResourceStoreScreen.styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resourceService } from "../../../service/resourceService";
import { useCart } from "../../../context/CartContext";
import Toast from "react-native-toast-message";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResourceStoreScreen() {
  const navigation = useNavigation();
  const [allResources, setAllResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [latestResources, setLatestResources] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();

  // ✅ Fetch data riêng biệt - nếu 1 API lỗi thì các API khác vẫn chạy
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch All Resources
      try {
        const resAll = await resourceService.getAllResource(0, 10);
        const allData = resAll?.content || [];
        // console.log("✅ All Resources:", allData);
        setAllResources(allData);

        // 🔹 Sinh danh sách category từ type
        const types = [...new Set(allData.map((r) => r.type))];
        setCategories(["All", ...types]);
      } catch (error) {
        console.error("❌ Fetch All Resources Failed:", error);
        setAllResources([]);
      }

      // Fetch Popular Resources
      try {
        const resPopular = await resourceService.getAllResourcePopular(10);
        const popularData = resPopular || [];
        //console.log("✅ Popular Resources:", popularData);
        setPopularResources(popularData);
      } catch (error) {
        console.error("❌ Fetch Popular Resources Failed:", error);
        setPopularResources([]);
      }

      // Fetch Latest Resources
      try {
        const resLatest = await resourceService.getAllResourceLatest(10);
        const latestData = resLatest || [];
        //  console.log("✅ Latest Resources:", latestData);
        setLatestResources(latestData);
      } catch (error) {
        console.error("❌ Fetch Latest Resources Failed:", error);
        setLatestResources([]);
      }
    } catch (error) {
      console.error("❌ Fetch Resource Failed:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load Resource data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ Add to Cart
  const handleAddToCart = (resource, navigateToCart = false) => {
    const designerName = resource.designerInfo
      ? `${resource.designerInfo.firstName || ""} ${
          resource.designerInfo.lastName || ""
        }`.trim()
      : "Updating...";

    const item = {
      id: resource.resourceTemplateId,
      name: resource.name,
      description: resource.description,
      price: resource.price,
      image: resource.images?.[0]?.imageUrl || resource.images?.[0]?.url,
      designer: {
        name: designerName,
        email: resource.designerInfo?.email || "",
        avatarUrl: resource.designerInfo?.avatarUrl || null,
      },
      releaseDate: resource.releaseDate,
      isActive: resource.isActive,
    };

    addToCart(item);

    if (navigateToCart) navigation.navigate("Cart");
    else
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Added to Cart",
      });
  };

  // ✅ Render resource card - Giao diện đẹp hơn
  const renderResourceItem = (item) => {
    const imageUrl =
      item.images?.[0]?.imageUrl ||
      item.images?.[0]?.url ||
      "https://via.placeholder.com/280x160?text=No+Image";

    return (
      <Shadow
        distance={8}
        startColor="#00000015"
        finalColor="#00000005"
        key={item.resourceTemplateId}
        style={{ marginRight: 16, borderRadius: 16 }}
      >
        <Pressable
          onPress={() =>
            navigation.navigate("ResourceDetail", {
              resourceId: item.resourceTemplateId,
            })
          }
          style={resourceStoreStyles.resourceCard}
        >
          {/* Image Container */}
          <View style={resourceStoreStyles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={resourceStoreStyles.resourceImage}
              resizeMode="cover"
            />
            {/* Type Badge */}
            <View style={resourceStoreStyles.typeBadge}>
              <Text style={resourceStoreStyles.typeBadgeText}>
                {item.type || "OTHER"}
              </Text>
            </View>
          </View>

          {/* Info Container */}
          <View style={resourceStoreStyles.resourceInfo}>
            <Text style={resourceStoreStyles.resourceName} numberOfLines={2}>
              {item.name}
            </Text>

            <Text
              style={resourceStoreStyles.resourceDescription}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            <Text style={resourceStoreStyles.price}>
              {item.price?.toLocaleString() || "0"} VNĐ
            </Text>

            {/* Action Buttons */}
            <View style={resourceStoreStyles.actionButtons}>
              <Pressable
                style={[
                  resourceStoreStyles.actionButton,
                  resourceStoreStyles.addToCartButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item, false);
                }}
              >
                <Icon name="shopping-cart" size={16} color="#fff" />
                <Text style={resourceStoreStyles.actionButtonTextAddtocart}>
                  Add to Cart
                </Text>
              </Pressable>

              <Pressable
                style={[
                  resourceStoreStyles.actionButton,
                  resourceStoreStyles.buyNowButton,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item, true);
                }}
              >
                <Icon name="flash-on" size={16} color="#fff" />
                <Text style={resourceStoreStyles.actionButtonText}>
                  Buy Now
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Shadow>
    );
  };

  // ✅ Filter resources by category and search
  const getFilteredResources = (resources) => {
    let filtered = resources;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((r) => r.type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <View style={resourceStoreStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={resourceStoreStyles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={resourceStoreStyles.container}>
      {/* Header */}
      <View style={resourceStoreStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SidebarToggleButton iconSize={24} iconColor="#1F2937" />
          {/* <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1F2937" />
          </Pressable> */}
        </View>
        <Text style={resourceStoreStyles.headerTitle}>Cửa hàng Resource</Text>
        <Pressable
          style={resourceStoreStyles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Icon name="shopping-cart" size={24} color="#1F2937" />
          {cart.length > 0 && (
            <View style={resourceStoreStyles.cartBadge}>
              <Text style={resourceStoreStyles.cartBadgeText}>
                {cart.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={resourceStoreStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={resourceStoreStyles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#9CA3AF"
            style={resourceStoreStyles.searchIcon}
          />
          <TextInput
            style={resourceStoreStyles.searchInput}
            placeholder="Tìm kiếm resource..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={resourceStoreStyles.categoryContainer}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                resourceStoreStyles.categoryButton,
                selectedCategory === category &&
                  resourceStoreStyles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  resourceStoreStyles.categoryText,
                  selectedCategory === category &&
                    resourceStoreStyles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Latest Resources */}
        {latestResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <View style={resourceStoreStyles.sectionHeader}>
              <Icon name="new-releases" size={24} color="#4F46E5" />
              <Text style={resourceStoreStyles.sectionTitle}>Mới nhất</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {getFilteredResources(latestResources).map(renderResourceItem)}
            </ScrollView>
          </View>
        )}

        {/* Popular Resources */}
        {popularResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <View style={resourceStoreStyles.sectionHeader}>
              <Icon name="trending-up" size={24} color="#F59E0B" />
              <Text style={resourceStoreStyles.sectionTitle}>Phổ biến</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {getFilteredResources(popularResources).map(renderResourceItem)}
            </ScrollView>
          </View>
        )}

        {/* All Resources */}
        {allResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <View style={resourceStoreStyles.sectionHeader}>
              <Icon name="apps" size={24} color="#10B981" />
              <Text style={resourceStoreStyles.sectionTitle}>
                Tất cả Resource
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {getFilteredResources(allResources).map(renderResourceItem)}
            </ScrollView>
          </View>
        )}

        {/* Empty State */}
        {allResources.length === 0 &&
          popularResources.length === 0 &&
          latestResources.length === 0 && (
            <View style={resourceStoreStyles.emptyState}>
              <Icon name="inbox" size={80} color="#D1D5DB" />
              <Text style={resourceStoreStyles.emptyStateText}>
                Không có resource nào
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}
