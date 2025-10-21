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
  const [cart, setCart] = useState([]);

  // ✅ Fetch tất cả các loại resource
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Promise.all để gọi song song 3 API
      const [resAll, resPopular, resLatest] = await Promise.all([
        resourceService.getAllResource(0, 10),
        resourceService.getAllResourcePopular(10),
        resourceService.getAllResourceLatest(10),
      ]);

      // Gán dữ liệu
      const allData = resAll?.content || [];
      const popularData = resPopular || [];
const latestData = resLatest || [];

      setAllResources(allData);
      setPopularResources(popularData);
      setLatestResources(latestData);

      // 🔹 Sinh danh sách category từ type
      const types = [...new Set(allData.map((r) => r.type))];
      setCategories(["All", ...types]);
    } catch (error) {
      console.error("❌ Fetch Resource Failed:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu Resource.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ Add to Cart
  const addToCart = (resource) => {
    const existingItem = cart.find((item) => item.id === resource.resourceTemplateId);
    if (existingItem) {
      Alert.alert("Thông báo", "Sản phẩm đã có trong giỏ hàng");
      return;
    }
    setCart([...cart, { ...resource, id: resource.resourceTemplateId, quantity: 1 }]);
    Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
  };

  // ✅ Render resource card
  const renderResourceItem = (item) => (
    <Shadow
      distance={8}
      startColor="#00000015"
      finalColor="#00000005"
      key={item.resourceTemplateId}
    >
      <Pressable
        onPress={() =>
          navigation.navigate("ResourceDetail", {
            resourceId: item.resourceTemplateId,
          })
        }
      >
        <View style={resourceStoreStyles.resourceCardInner}>
          <Image
            source={{
              uri:
                item.images?.[0]?.url ||
                "https://via.placeholder.com/150x150?text=Resource",
            }}
            style={resourceStoreStyles.resourceImage}
          />

          <View style={resourceStoreStyles.resourceInfo}>
            <Text style={resourceStoreStyles.resourceName} numberOfLines={2}>
              {item.name}
            </Text>

            <Text style={resourceStoreStyles.resourceDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <Text style={resourceStoreStyles.price}>
              {item.price.toLocaleString()} VNĐ
            </Text>

            <View style={resourceStoreStyles.actionButtons}>
              <Pressable
                style={[resourceStoreStyles.actionButton, { backgroundColor: "#3B82F6" }]}
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart(item);
                }}
              >
                <Text style={resourceStoreStyles.actionButtonText}>Thêm vào giỏ</Text>
              </Pressable>

              <Pressable
                style={[resourceStoreStyles.actionButton, { backgroundColor: "#10B981" }]}
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert(
                    "Thanh toán",
                    `Mua ${item.name} với giá ${item.price.toLocaleString()} VNĐ`
                  );
                }}
              >
                <Text style={resourceStoreStyles.actionButtonText}>Mua ngay</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    </Shadow>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={resourceStoreStyles.container}>
      {/* Header */}
      <View style={resourceStoreStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={resourceStoreStyles.headerTitle}>Cửa hàng Resource</Text>
        <View style={resourceStoreStyles.headerActions}>
          <Pressable style={resourceStoreStyles.cartButton}>
            <Icon name="shopping-cart" size={24} color="#6B7280" />
            {cart.length > 0 && (
              <View style={resourceStoreStyles.cartBadge}>
                <Text style={resourceStoreStyles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Body */}
      <ScrollView style={resourceStoreStyles.scrollContainer}>
        {/* Search */}
        <View style={resourceStoreStyles.searchContainer}>
          <TextInput
            style={resourceStoreStyles.searchInput}
            placeholder="Tìm kiếm resource..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={resourceStoreStyles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                resourceStoreStyles.categoryButton,
                selectedCategory === category && resourceStoreStyles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  resourceStoreStyles.categoryText,
                  selectedCategory === category && resourceStoreStyles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 🔹 Section 1: Resource mới nhất */}
        <View style={resourceStoreStyles.sectionContainer}>
          <Text style={resourceStoreStyles.sectionTitle}>Mới nhất</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={resourceStoreStyles.resourcesList}
          >
            {latestResources.map(renderResourceItem)}
          </ScrollView>
        </View>

        {/* 🔹 Section 2: Phổ biến */}
        <View style={resourceStoreStyles.sectionContainer}>
          <Text style={resourceStoreStyles.sectionTitle}>Phổ biến</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={resourceStoreStyles.resourcesList}
          >
            {popularResources.map(renderResourceItem)}
          </ScrollView>
        </View>

        {/* 🔹 Section 3: Tất cả Resource */}
        <View style={resourceStoreStyles.sectionContainer}>
          <Text style={resourceStoreStyles.sectionTitle}>Tất cả Resource</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={resourceStoreStyles.resourcesList}
          >
            {allResources.map(renderResourceItem)}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
