// ResourceStoreScreen.js - FULL VERSION HOÀN CHỈNH
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Dimensions,
  ImageBackground,
  Animated,
  StyleSheet,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import { resourceStoreStyles } from "./ResourceStoreScreen.styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resourceService } from "../../../service/resourceService";
import { useCart } from "../../../context/CartContext";
import Toast from "react-native-toast-message";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DEFAULT_RESOURCE_IMAGE =
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765187483/lvwf1e5mwhofmekgw7xq.webp";

// Danh sách ảnh đẹp làm fallback (Cloudinary → load cực nhanh)
const FALLBACK_IMAGES = [
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/z1tfsj8jpe6fxsvhvfcx.avif",
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185265/lppr96hp3twiesnvjudi.avif",
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/wtwko9tms2mmit7kmntt.jpg",
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/zfv54eir3ipw5apv4ydo.jpg",
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/ha5fdgmt0u2qibk1dbl5.jpg",
  "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185266/m5hl24cfn305uwxbg5ox.avif",
];

// Animated Card siêu đẹp + fallback ảnh + sao 0 sao + ngày chung hàng
const AnimatedResourceCard = ({
  item,
  onPress,
  onAddToCart,
  onBuyNow,
  index = 0,
}) => {
  const scaleValue = new Animated.Value(1);
  const translateY = new Animated.Value(0);
  const [imageUri, setImageUri] = useState(
    item.images?.[0]?.imageUrl ||
      item.images?.[0]?.url ||
      FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  );

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: -6, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
  };

  const renderStars = (rating = 0) => {
    const filled = rating ? Math.round(Math.max(0, Math.min(rating, 5))) : 0;
    return (
      <View style={resourceStoreStyles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name={i < filled ? "star" : "star-border"}
            size={15}
            color={i < filled ? "#FBBF24" : "#CBD5E1"}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }, { translateY }],
        marginRight: 20,
      }}
    >
      <Shadow
        distance={16}
        startColor="#00000010"
        offset={[0, 8]}
        style={{ borderRadius: 24 }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={resourceStoreStyles.resourceCard}
        >
          {/* Ảnh + fallback + xử lý lỗi */}
          <View style={resourceStoreStyles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={resourceStoreStyles.resourceImage}
              resizeMode="cover"
              onError={() => setImageUri(DEFAULT_RESOURCE_IMAGE)}
            />

            {/* Badge loại */}
            <View style={resourceStoreStyles.typeBadge}>
              <Text style={resourceStoreStyles.typeBadgeText}>
                {item.type || "PREMIUM"}
              </Text>
            </View>

            {/* Badge của bạn */}
            {item?.isOwner && (
              <View style={resourceStoreStyles.ownerBadge}>
                <Icon name="verified" size={14} color="#10B981" />
                <Text style={resourceStoreStyles.ownerBadgeText}>YOURS</Text>
              </View>
            )}

            {/* Badge HOT */}
            {(item.isTrending || Math.random() > 0.65) && (
              <View style={resourceStoreStyles.trendingBadge}>
                <Icon name="local-fire-department" size={16} color="#FFF" />
                <Text style={resourceStoreStyles.trendingBadgeText}>HOT</Text>
              </View>
            )}
          </View>

          {/* Nội dung */}
          <View style={resourceStoreStyles.resourceInfo}>
            <Text style={resourceStoreStyles.resourceName} numberOfLines={2}>
              {item.name || "Premium Resource Pack"}
            </Text>

            <Text
              style={resourceStoreStyles.resourceDescription}
              numberOfLines={2}
            >
              {item.description ||
                "High-quality assets for professional creators"}
            </Text>

            {renderStars(item.avgResourceRating)}
            <View style={resourceStoreStyles.infoRow}>
              <View style={resourceStoreStyles.dateContainer}>
                {item.releaseDate && (
                  <View style={resourceStoreStyles.datePill}>
                    <Icon name="event" size={12} color="#64748B" />
                    <Text style={resourceStoreStyles.datePillText}>
                      {formatDate(item.releaseDate)}
                    </Text>
                  </View>
                )}
                {item.expiredTime && (
                  <View
                    style={[
                      resourceStoreStyles.datePill,
                      { backgroundColor: "#FEE2E2" },
                    ]}
                  >
                    <Icon name="schedule" size={12} color="#EF4444" />
                    <Text
                      style={[
                        resourceStoreStyles.datePillText,
                        { color: "#991B1B" },
                      ]}
                    >
                      {formatDate(item.expiredTime)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Giá */}
            {!item?.isOwner && (
              <View style={resourceStoreStyles.priceContainer}>
                <Text style={resourceStoreStyles.price}>
                  {item.price?.toLocaleString()} ₫
                </Text>
                {item.originalPrice && (
                  <Text style={resourceStoreStyles.originalPrice}>
                    {item.originalPrice.toLocaleString()} ₫
                  </Text>
                )}
              </View>
            )}

            {/* Nút hành động */}
            {item?.isOwner ? (
              <Pressable
                style={resourceStoreStyles.openResourceButton}
                onPress={onPress}
              >
                <Icon name="folder-open" size={18} color="#fff" />
                <Text style={resourceStoreStyles.openResourceText}>
                  Open Resource
                </Text>
              </Pressable>
            ) : (
              <View style={resourceStoreStyles.actionButtons}>
                <Pressable
                  style={resourceStoreStyles.addToCartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart();
                  }}
                >
                  <Icon name="add-shopping-cart" size={16} color="#059669" />
                  <Text style={resourceStoreStyles.addToCartText}>
                    Add to cart
                  </Text>
                </Pressable>
                <Pressable
                  style={resourceStoreStyles.buyNowButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onBuyNow();
                  }}
                >
                  <Icon name="bolt" size={18} color="#fff" />
                  <Text style={resourceStoreStyles.buyNowText}>Buy Now</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Shadow>
    </Animated.View>
  );
};

const PromoBanner = ({ searchQuery, setSearchQuery }) => {
  const images = FALLBACK_IMAGES;

  const fadeCurrent = useRef(new Animated.Value(1)).current;
  const fadeNext = useRef(new Animated.Value(0)).current;

  const currentIndex = useRef(0);
  const [currentImage, setCurrentImage] = useState(images[0]);
  const [nextImage, setNextImage] = useState(images[1]);

  // không dùng setInterval → dùng loop để không bị overlap animation
  useEffect(() => {
    let isMounted = true;

    const loop = async () => {
      while (isMounted) {
        await new Promise((res) => setTimeout(res, 3000));

        const nextIdx = (currentIndex.current + 1) % images.length;
        const uri = images[nextIdx];

        // preload + decode ảnh (cache thật)
        await Image.prefetch(uri);

        if (!isMounted) return;

        setNextImage(uri); // chỉ update NEXT

        // crossfade
        fadeNext.setValue(0);
        fadeCurrent.setValue(1);

        await new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(fadeCurrent, {
              toValue: 0,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(fadeNext, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
          ]).start(resolve);
        });

        // đổi current sau khi animation hoàn tất → KHÔNG GIẬT
        currentIndex.current = nextIdx;
        setCurrentImage(uri);
      }
    };

    loop();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={[resourceStoreStyles.promoBanner, { overflow: "hidden" }]}>
      {/* current */}
      <Animated.Image
        source={{ uri: currentImage }}
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 24,
          opacity: fadeCurrent,
        }}
        resizeMode="cover"
      />

      {/* next */}
      <Animated.Image
        source={{ uri: nextImage }}
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: 24,
          opacity: fadeNext,
        }}
        resizeMode="cover"
      />

      <View style={resourceStoreStyles.promoOverlay} />

      <View style={resourceStoreStyles.promoContent}>
        <Text style={resourceStoreStyles.promoTitle}>
          Change your wardrobe.
        </Text>
        <Text style={resourceStoreStyles.promoTitle}>Find exciting goods.</Text>

        {/* Search Bar inside Banner */}
        <View style={resourceStoreStyles.bannerSearchContainer}>
          <Icon
            name="search"
            size={24}
            color="#64748B"
            style={{ marginLeft: 16 }}
          />
          <TextInput
            style={resourceStoreStyles.bannerSearchInput}
            placeholder="What are you looking for?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          <Pressable style={resourceStoreStyles.bannerSearchButton}>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default function ResourceStoreScreen() {
  const navigation = useNavigation();
  const [allResources, setAllResources] = useState([]);
  const [popularResources, setPopularResources] = useState([]);
  const [latestResources, setLatestResources] = useState([]);
  const [ownedResources, setOwnedResources] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { cart, addToCart } = useCart();
  const [userResources, setUserResources] = useState([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      let ownedAccumulator = [];

      try {
        const resUser = await resourceService.getResourceProjectByUserId(0, 20);
        setUserResources(Array.isArray(resUser.content) ? resUser.content : []);
      } catch (e) {
        console.error(e);
      }

      try {
        const resAll = await resourceService.getAllResource(0, 10);
        const allRaw = resAll?.content || [];
        const owned = allRaw.filter((r) => r?.isOwner);
        const notOwned = allRaw.filter((r) => !r?.isOwner);
        setAllResources(notOwned);
        ownedAccumulator.push(...owned);

        // FIX: LẤY TYPE TỪ TẤT CẢ RESOURCE (CẢ OWNED + NOT OWNED)
        const allFetchedResources = [
          ...allRaw,
          ...popularResources,
          ...latestResources,
        ]; // hoặc thêm ownedAccumulator

        const types = [
          ...new Set(
            allFetchedResources
              .map((r) => r.type)
              .filter(Boolean)
              .map((t) => t.trim().toUpperCase())
          ),
        ];

        // Định dạng tên đẹp
        const formatCategoryName = (str) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        setCategories(["All", ...types.map(formatCategoryName)]);
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await resourceService.getAllResourcePopular(10);
        const data = res?.result || res?.content || res || [];
        const notOwned = data.filter((r) => !r?.isOwner);
        setPopularResources(notOwned);
        ownedAccumulator.push(...data.filter((r) => r?.isOwner));
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await resourceService.getAllResourceLatest(10);
        const data = res?.result || res?.content || res || [];
        const notOwned = data.filter((r) => !r?.isOwner);
        setLatestResources(notOwned);
        ownedAccumulator.push(...data.filter((r) => r?.isOwner));
      } catch (e) {
        console.error(e);
      }

      const map = new Map();
      ownedAccumulator.forEach((item) => {
        const key = item.resourceTemplateId || item.id;
        if (key && !map.has(key)) map.set(key, { ...item, isOwner: true });
      });
      setOwnedResources(Array.from(map.values()));
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddToCart = (resource, goToCart = false) => {
    if (resource?.isOwner)
      return Toast.show({ type: "info", text1: "This is your resource" });

    const alreadyOwned = userResources.some(
      (r) => r.resourceTemplateId === resource.resourceTemplateId
    );
    if (alreadyOwned)
      return Toast.show({
        type: "info",
        text1: "You already own this resource",
      });

    const inCart = cart.some((i) => i.id === resource.resourceTemplateId);
    if (inCart) {
      if (goToCart) navigation.navigate("Cart");
      return Toast.show({ type: "info", text1: "Already in cart" });
    }

    addToCart({
      id: resource.resourceTemplateId,
      name: resource.name,
      price: resource.price,
      image:
        resource.images?.[0]?.imageUrl ||
        resource.images?.[0]?.url ||
        FALLBACK_IMAGES[0],
      type: resource.type,
    });

    Toast.show({ type: "success", text1: "Success", text2: "Added to cart" });
    if (goToCart) navigation.navigate("Cart");
  };

  const getFiltered = (arr) => {
    let filtered = arr;
    if (selectedCategory !== "All")
      filtered = filtered.filter((r) => r.type === selectedCategory);
    if (searchQuery)
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return filtered;
  };

  if (loading) {
    return (
      <View style={resourceStoreStyles.centerContainer}>
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 280, height: 280 }}
        />
      </View>
    );
  }

  return (
    <View style={resourceStoreStyles.container}>
      <View style={resourceStoreStyles.header}>
        <View style={resourceStoreStyles.headerGradient} />
        <View style={resourceStoreStyles.headerContent}>
          <View style={resourceStoreStyles.headerLeft}>
            <SidebarToggleButton iconSize={28} iconColor="#1E40AF" />
            <View>
              <Text style={resourceStoreStyles.headerTitle}>
                Resource Store
              </Text>
              <Text style={resourceStoreStyles.headerSubtitle}>
                Premium resources for creators
              </Text>
            </View>
          </View>
          <Pressable
            style={resourceStoreStyles.cartButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Icon name="shopping-cart" size={24} color="#084F8C" />
            {cart.length > 0 && (
              <View style={resourceStoreStyles.cartBadge}>
                <Text style={resourceStoreStyles.cartBadgeText}>
                  {cart.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PromoBanner
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              style={[
                resourceStoreStyles.categoryButton,
                selectedCategory === cat &&
                  resourceStoreStyles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              {selectedCategory === cat && (
                <View style={resourceStoreStyles.categoryGlow} />
              )}

              <Text
                style={[
                  resourceStoreStyles.categoryText,
                  selectedCategory === cat &&
                    resourceStoreStyles.selectedCategoryText,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {ownedResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={resourceStoreStyles.sectionTitle}>Your resources</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {ownedResources.map((item, i) => (
                <AnimatedResourceCard
                  key={i}
                  item={item}
                  index={i}
                  onPress={() =>
                    navigation.navigate("ResourceDetail", {
                      resourceId: item.resourceTemplateId,
                      owned: true,
                    })
                  }
                  onAddToCart={() => {}}
                  onBuyNow={() => {}}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {latestResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={resourceStoreStyles.sectionTitle}>Newest</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {getFiltered(latestResources).map((item, i) => (
                <AnimatedResourceCard
                  key={i}
                  item={item}
                  index={i}
                  onPress={() =>
                    navigation.navigate("ResourceDetail", {
                      resourceId: item.resourceTemplateId,
                    })
                  }
                  onAddToCart={() => handleAddToCart(item)}
                  onBuyNow={() => handleAddToCart(item, true)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {popularResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={resourceStoreStyles.sectionTitle}>
              Popular this week
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {getFiltered(popularResources).map((item, i) => (
                <AnimatedResourceCard
                  key={i}
                  item={item}
                  index={i}
                  onPress={() =>
                    navigation.navigate("ResourceDetail", {
                      resourceId: item.resourceTemplateId,
                    })
                  }
                  onAddToCart={() => handleAddToCart(item)}
                  onBuyNow={() => handleAddToCart(item, true)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {allResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={resourceStoreStyles.sectionTitle}>All resources</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {getFiltered(allResources).map((item, i) => (
                <AnimatedResourceCard
                  key={i}
                  item={item}
                  index={i}
                  onPress={() =>
                    navigation.navigate("ResourceDetail", {
                      resourceId: item.resourceTemplateId,
                    })
                  }
                  onAddToCart={() => handleAddToCart(item)}
                  onBuyNow={() => handleAddToCart(item, true)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
