// ResourceStoreScreen.js - FULL VERSION HOÀN CHỈNH
import React, { useState, useEffect, useRef, useContext } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from "@react-navigation/native";
import { resourceStoreStyles, CARD_GAP, CARD_WIDTH } from "./ResourceStoreScreen.styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import { resourceService } from "../../../service/resourceService";
import { orderService } from "../../../service/orderService";
import { useCart } from "../../../context/CartContext";
import Toast from "react-native-toast-message";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { useTheme } from "../../../context/ThemeContext";
import NotificationButton from "../../../components/common/NotificationButton";
import { AuthContext } from "../../../context/AuthContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
            size={8}
            color={i < filled ? "#FBBF24" : (isDark ? "#475569" : "#CBD5E1")}
          />
        ))}
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }, { translateY }],
        marginRight: CARD_GAP,
      }}
    >
      <Shadow
        distance={8}
        startColor="#00000010"
        offset={[0, 4]}
        style={{ borderRadius: 12 }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[resourceStoreStyles.resourceCard, isDark && resourceStoreStyles.resourceCardDark]}
        >
          {/* Ảnh + fallback + xử lý lỗi */}
          <View style={[resourceStoreStyles.imageContainer, isDark && resourceStoreStyles.imageContainerDark]}>
            <Image
              source={{ uri: imageUri }}
              style={resourceStoreStyles.resourceImage}
              resizeMode="cover"
              onError={() => {
                requestAnimationFrame(() => {
                  setImageUri(DEFAULT_RESOURCE_IMAGE);
                });
              }}
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
                <Icon name="verified" size={12} color="#10B981" />
                <Text style={resourceStoreStyles.ownerBadgeText}>YOURS</Text>
              </View>
            )}

            {/* Badge HOT */}
            {(item.isTrending || Math.random() > 0.65) && (
              <View style={resourceStoreStyles.trendingBadge}>
                <Icon name="local-fire-department" size={12} color="#FFF" />
                <Text style={resourceStoreStyles.trendingBadgeText}>HOT</Text>
              </View>
            )}
          </View>

          {/* Nội dung */}
          <View style={resourceStoreStyles.resourceInfo}>
            <Text style={[resourceStoreStyles.resourceName, isDark && resourceStoreStyles.resourceNameDark]} numberOfLines={2}>
              {item.name || "Premium Resource Pack"}
            </Text>

            <Text
              style={[resourceStoreStyles.resourceDescription, isDark && resourceStoreStyles.resourceDescriptionDark]}
              numberOfLines={2}
            >
              {item.description ||
                "High-quality assets for professional creators"}
            </Text>

            {renderStars(item.avgResourceRating)}
            <View style={resourceStoreStyles.infoRow}>
              <View style={resourceStoreStyles.dateContainer}>
                {item.releaseDate && (
                  <View style={[resourceStoreStyles.datePill, isDark && resourceStoreStyles.datePillDark]}>
                    <Icon name="event" size={10} color={isDark ? "#94A3B8" : "#64748B"} />
                    <Text style={[resourceStoreStyles.datePillText, isDark && resourceStoreStyles.datePillTextDark]}>
                      {formatDate(item.releaseDate)}
                    </Text>
                  </View>
                )}
                {item.expiredTime && (
                  <View
                    style={[
                      resourceStoreStyles.datePill,
                      { backgroundColor: isDark ? "#450a0a" : "#FEE2E2" },
                    ]}
                  >
                    <Icon name="schedule" size={10} color="#EF4444" />
                    <Text
                      style={[
                        resourceStoreStyles.datePillText,
                        { color: isDark ? "#fca5a5" : "#991B1B" },
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
                <Text style={[resourceStoreStyles.price, isDark && resourceStoreStyles.priceDark]}>
                  {item.price?.toLocaleString()} ₫
                </Text>
                {item.originalPrice && (
                  <Text style={[resourceStoreStyles.originalPrice, isDark && resourceStoreStyles.originalPriceDark]}>
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
                <Icon name="folder-open" size={16} color="#fff" />
                <Text style={resourceStoreStyles.openResourceText}>
                  Open Resource
                </Text>
              </Pressable>
            ) : (
              <View style={resourceStoreStyles.actionButtons}>
                <Pressable
                  style={[resourceStoreStyles.addToCartButton, isDark && resourceStoreStyles.addToCartButtonDark]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddToCart();
                  }}
                >
                  <Icon name="add-shopping-cart" size={14} color={isDark ? "#6EE7B7" : "#059669"} />
                  <Text style={[resourceStoreStyles.addToCartText, isDark && resourceStoreStyles.addToCartTextDark]}>
                    Add
                  </Text>
                </Pressable>
                <Pressable
                  style={resourceStoreStyles.buyNowButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onBuyNow();
                  }}
                >
                  <Icon name="bolt" size={16} color="#fff" />
                  <Text style={resourceStoreStyles.buyNowText}>Buy</Text>
                </Pressable>
              </View>
            )}
          </View>
        </Pressable>
      </Shadow>
    </Animated.View>
  );
};

const LoadMoreCard = ({ onPress, loading, isDark }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={[
        resourceStoreStyles.loadMoreCard,
        isDark && resourceStoreStyles.loadMoreCardDark,
      ]}
    >
      <View style={resourceStoreStyles.loadMoreContent}>
        {loading ? (
          <ActivityIndicator size="small" color={isDark ? "#60A5FA" : "#084F8C"} />
        ) : (
          <>
            <Icon
              name="add-circle-outline"
              size={24}
              color={isDark ? "#60A5FA" : "#084F8C"}
            />
            <Text
              style={[
                resourceStoreStyles.loadMoreText,
                isDark && resourceStoreStyles.loadMoreTextDark,
                { fontSize: 10 }
              ]}
            >
              More
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const PromoBanner = ({ searchQuery, setSearchQuery }) => {
  const images = FALLBACK_IMAGES;
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          opacity: fadeCurrent,
        }}
        resizeMode="cover"
      />

      {/* next */}
      <Animated.Image
        source={{ uri: nextImage }}
        style={{
          ...StyleSheet.absoluteFillObject,
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
        <View style={[resourceStoreStyles.bannerSearchContainer, isDark && resourceStoreStyles.bannerSearchContainerDark]}>
          <Icon
            name="search"
            size={24}
            color={isDark ? "#94A3B8" : "#64748B"}
            style={{ marginLeft: 16 }}
          />
          <TextInput
            style={[resourceStoreStyles.bannerSearchInput, isDark && resourceStoreStyles.bannerSearchInputDark]}
            placeholder="What are you looking for?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={isDark ? "#94A3B8" : "#94A3B8"}
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
  const [filteredByType, setFilteredByType] = useState([]);
  const [isFilteringByType, setIsFilteringByType] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useContext(AuthContext);

  // Pagination states
  const [pages, setPages] = useState({
    all: 0,
    popular: 0,
    latest: 0,
    filtered: 0,
  });
  const [hasMore, setHasMore] = useState({
    all: true,
    popular: true,
    latest: true,
    filtered: true,
  });
  const [loadingMore, setLoadingMore] = useState({
    all: false,
    popular: false,
    latest: false,
    filtered: false,
  });

  const PAGE_SIZE = 10;

  const fetchResourcesByType = async (type, page = 0) => {
    try {
      if (page === 0) {
        setLoading(true);
        setIsFilteringByType(true);
      } else {
        setLoadingMore(prev => ({ ...prev, filtered: true }));
      }

      const response = await orderService.getTemplatesByType(type, page, PAGE_SIZE);
      const data = response?.content || response || [];
      const items = Array.isArray(data) ? data : [];

      if (page === 0) {
        setFilteredByType(items);
      } else {
        setFilteredByType(prev => [...prev, ...items]);
      }

      setHasMore(prev => ({ ...prev, filtered: items.length === PAGE_SIZE }));
      setPages(prev => ({ ...prev, filtered: page }));
    } catch (error) {
      console.warn("Error fetching resources by type:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load resources by type",
      });
    } finally {
      setLoading(false);
      setLoadingMore(prev => ({ ...prev, filtered: false }));
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Reset pagination
      setPages({ all: 0, popular: 0, latest: 0, filtered: 0 });
      setHasMore({ all: true, popular: true, latest: true, filtered: true });

      if (user) {
        try {
          const resUser = await resourceService.getResourceProjectByUserId(0, 20);
          setUserResources(Array.isArray(resUser.content) ? resUser.content : []);
        } catch (e) {
          console.warn(e);
        }
      }

      try {
        const resAll = await resourceService.getAllResource(0, PAGE_SIZE, !!user);
        const allRaw = resAll?.content || resAll || [];
        const items = Array.isArray(allRaw) ? allRaw : [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setAllResources(notOwned);
        setHasMore(prev => ({ ...prev, all: items.length === PAGE_SIZE }));

        const types = [
          ...new Set(
            items
              .map((r) => r.type)
              .filter(Boolean)
              .map((t) => t.trim().toUpperCase())
          ),
        ];

        const formatCategoryName = (str) =>
          str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        setCategories(["All", ...types.map(formatCategoryName)]);
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = await resourceService.getAllResourcePopular(PAGE_SIZE, !!user);
        const data = res?.result || res?.content || res || [];
        const items = Array.isArray(data) ? data : [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setPopularResources(notOwned);
        setHasMore(prev => ({ ...prev, popular: items.length === PAGE_SIZE }));
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = await resourceService.getAllResourceLatest(PAGE_SIZE, !!user);
        const data = res?.result || res?.content || res || [];
        const items = Array.isArray(data) ? data : [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setLatestResources(notOwned);
        setHasMore(prev => ({ ...prev, latest: items.length === PAGE_SIZE }));
      } catch (e) {
        console.warn(e);
      }

      // Fetch owned resources with V2 API for latest version info
      if (user) {
        try {
          const purchasedRes = await orderService.getPurchasedTemplatesV2();
          const data = purchasedRes?.content || purchasedRes || [];
          const mappedOwned = (Array.isArray(data) ? data : []).map((template) => {
            const currentVersion = template.availableVersions?.find(
              (v) => v.versionId === template.currentVersionId
            );
            const latestVersion = template.availableVersions?.find(
              (v) => v.versionId === template.latestVersionId
            );
            return {
              ...template,
              isOwner: true,
              name: currentVersion?.name || template.name,
              description: currentVersion?.description || template.description,
              items: currentVersion?.items || template.items || [],
              images: currentVersion?.images || template.images || [],
              versionNumber: template.currentVersionNumber,
              hasNewerVersion: template.hasNewerVersion,
              latestVersionNumber: template.latestVersionNumber,
              currentVersionNumber: template.currentVersionNumber,
              latestVersion: latestVersion ? {
                name: latestVersion.name,
                description: latestVersion.description,
                items: latestVersion.items || [],
                images: latestVersion.images || [],
              } : null,
            };
          });
          setOwnedResources(mappedOwned);
        } catch (e) {
          console.warn("Error fetching purchased templates:", e);
          setOwnedResources([]);
        }
      }
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

  const handleLoadMore = async (section) => {
    if (loadingMore[section] || !hasMore[section]) return;

    const nextPage = pages[section] + 1;
    setLoadingMore(prev => ({ ...prev, [section]: true }));

    try {
      let items = [];
      if (section === 'all') {
        const res = await resourceService.getAllResource(nextPage, PAGE_SIZE, !!user);
        items = res?.content || res || [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setAllResources(prev => [...prev, ...notOwned]);
      } else if (section === 'popular') {
        // Note: Popular and Latest might not support page-based pagination in current API
        // but we'll try to use the same logic if they support it or just limit
        const res = await resourceService.getAllResourcePopular(PAGE_SIZE * (nextPage + 1), !!user);
        items = res?.result || res?.content || res || [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setPopularResources(notOwned); // Replace for limit-based
      } else if (section === 'latest') {
        const res = await resourceService.getAllResourceLatest(PAGE_SIZE * (nextPage + 1), !!user);
        items = res?.result || res?.content || res || [];
        const notOwned = items.filter((r) => !r?.isOwner);
        setLatestResources(notOwned); // Replace for limit-based
      } else if (section === 'filtered') {
        await fetchResourcesByType(selectedCategory.toUpperCase(), nextPage);
        return; // fetchResourcesByType handles state
      }

      setHasMore(prev => ({ ...prev, [section]: items.length >= PAGE_SIZE * (nextPage + 1) || items.length === PAGE_SIZE }));
      setPages(prev => ({ ...prev, [section]: nextPage }));
    } catch (error) {
      console.warn(`Error loading more ${section}:`, error);
    } finally {
      setLoadingMore(prev => ({ ...prev, [section]: false }));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddToCart = (resource, goToCart = false) => {
    if (!user) {
      return Toast.show({
        type: "info",
        text1: "Please login",
        text2: "You need to login to buy resources",
      });
    }

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
      <View style={[resourceStoreStyles.centerContainer, isDark && resourceStoreStyles.centerContainerDark]}>
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
    <View style={[resourceStoreStyles.container, isDark && resourceStoreStyles.containerDark]}>
      <View style={[resourceStoreStyles.header, isDark && resourceStoreStyles.headerDark]}>
        <View style={resourceStoreStyles.headerGradient} />
        <View style={resourceStoreStyles.headerContent}>
          <View style={resourceStoreStyles.headerLeft}>
            <SidebarToggleButton iconSize={28} iconColor={isDark ? "#FFFFFF" : "#1E40AF"} />
            <View>
              <Text style={[resourceStoreStyles.headerTitle, isDark && resourceStoreStyles.headerTitleDark]}>
                Resource Store
              </Text>
              <Text style={[resourceStoreStyles.headerSubtitle, isDark && resourceStoreStyles.headerSubtitleDark]}>
                Premium resources for creators
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <NotificationButton />
            <Pressable
              style={[resourceStoreStyles.cartButton, isDark && resourceStoreStyles.cartButtonDark]}
              onPress={() => navigation.navigate("Cart")}
            >
              <Icon name="shopping-cart" size={24} color={isDark ? "#FFFFFF" : "#084F8C"} />
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
                isDark && resourceStoreStyles.categoryButtonDark,
                selectedCategory === cat &&
                resourceStoreStyles.selectedCategoryButton,
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                if (cat === "All") {
                  setIsFilteringByType(false);
                  setFilteredByType([]);
                } else {
                  fetchResourcesByType(cat.toUpperCase());
                }
              }}
            >
              {selectedCategory === cat && (
                <View style={resourceStoreStyles.categoryGlow} />
              )}

              <Text
                style={[
                  resourceStoreStyles.categoryText,
                  isDark && resourceStoreStyles.categoryTextDark,
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
            <Text style={[resourceStoreStyles.sectionTitle, isDark && resourceStoreStyles.sectionTitleDark]}>Your resources</Text>
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
                  onAddToCart={() => { }}
                  onBuyNow={() => { }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {latestResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={[resourceStoreStyles.sectionTitle, isDark && resourceStoreStyles.sectionTitleDark]}>Newest</Text>
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
              {hasMore.latest && (
                <LoadMoreCard
                  onPress={() => handleLoadMore('latest')}
                  loading={loadingMore.latest}
                  isDark={isDark}
                />
              )}
            </ScrollView>
          </View>
        )}

        {popularResources.length > 0 && (
          <View style={resourceStoreStyles.sectionContainer}>
            <Text style={[resourceStoreStyles.sectionTitle, isDark && resourceStoreStyles.sectionTitleDark]}>
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
              {hasMore.popular && (
                <LoadMoreCard
                  onPress={() => handleLoadMore('popular')}
                  loading={loadingMore.popular}
                  isDark={isDark}
                />
              )}
            </ScrollView>
          </View>
        )}

        {isFilteringByType ? (
          filteredByType.length > 0 && (
            <View style={resourceStoreStyles.sectionContainer}>
              <Text style={[resourceStoreStyles.sectionTitle, isDark && resourceStoreStyles.sectionTitleDark]}>
                {selectedCategory} Resources
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {filteredByType.map((item, i) => (
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
                {hasMore.filtered && (
                  <LoadMoreCard
                    onPress={() => handleLoadMore('filtered')}
                    loading={loadingMore.filtered}
                    isDark={isDark}
                  />
                )}
              </ScrollView>
            </View>
          )
        ) : (
          allResources.length > 0 && (
            <View style={resourceStoreStyles.sectionContainer}>
              <Text style={[resourceStoreStyles.sectionTitle, isDark && resourceStoreStyles.sectionTitleDark]}>All resources</Text>
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
                {hasMore.all && (
                  <LoadMoreCard
                    onPress={() => handleLoadMore('all')}
                    loading={loadingMore.all}
                    isDark={isDark}
                  />
                )}
              </ScrollView>
            </View>
          )
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View >
  );
}
