import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useCart } from "../../../context/CartContext";
import { resourceService } from "../../../service/resourceService";
import { styles } from "./ResourceDetailScreen.styles";
import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResourceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const flatListRef = useRef(null);
  const autoSlideTimer = useRef(null);
  const { addToCart } = useCart();

  const { resourceId } = route.params;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);




  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getResourceById(resourceId);
        console.log("📦 Resource Detail:", data);
        setResource(data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Lỗi tải dữ liệu",
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resourceId]);

  // ✅ Auto slide images
  useEffect(() => {
    if (!resource?.images || resource.images.length <= 1) return;

    autoSlideTimer.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % resource.images.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);

    return () => {
      if (autoSlideTimer.current) {
        clearInterval(autoSlideTimer.current);
      }
    };
  }, [resource]);

  // ✅ Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!resource) return;

    const newItem = {
      id: resource.resourceTemplateId,
      name: resource.name,
      price: resource.price,
      image:
        resource.images?.find((img) => img.isThumbnail)?.imageUrl ||
        resource.images?.[0]?.imageUrl ||
        "https://via.placeholder.com/150",
         designer: resource.designer,
    releaseDate: resource.releaseDate,
    expiredTime: resource.expiredTime,
    isActive: resource.isActive,
    };
    

    addToCart(newItem);

    Toast.show({
      type: "success",
      text1: "🛒 Đã thêm vào giỏ hàng",
      text2: `${resource.name} đã được thêm thành công!`,
    });
  };

  // 🟡 Mua ngay
  const handleBuyNow = () => {
    if (!resource) return;
    navigation.navigate("Checkout", {
      cartItems: [
        {
          id: resource.resourceTemplateId,
          name: resource.name,
          price: resource.price,
          quantity: 1,
          image:
            resource.images?.find((img) => img.isThumbnail)?.imageUrl ||
            resource.images?.[0]?.imageUrl,
        },
      ],
      totalAmount: resource.price,
    });
  };

  const handleImageChange = (event) => {
    const slideWidth = SCREEN_WIDTH;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    setCurrentImageIndex(index);
  };

  // ✅ Render stars
  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={18} color="#FFC107" />);
    }
    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size={18} color="#FFC107" />);
    }
    while (stars.length < 5) {
      stars.push(<Icon key={stars.length} name="star-border" size={18} color="#D1D5DB" />);
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="inbox" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>Không tìm thấy tài nguyên.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <Pressable
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Icon name="shopping-cart" size={24} color="#1F2937" />
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          <FlatList
            ref={flatListRef}
            data={resource.images || []}
            renderItem={({ item }) => (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item.imageUrl || "https://via.placeholder.com/400x300" }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              </View>
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageChange}
            onScrollBeginDrag={() => {
              if (autoSlideTimer.current) {
                clearInterval(autoSlideTimer.current);
              }
            }}
            keyExtractor={(item, index) => index.toString()}
          />
          
          {/* Image Indicators */}
          <View style={styles.indicatorContainer}>
            {(resource.images || []).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Type Badge */}
          <View style={styles.typeBadgeContainer}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{resource.type}</Text>
            </View>
          </View>
        </View>

        {/* Info Container */}
        <View style={styles.infoContainer}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.resourceName}>{resource.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>{renderStars(4.5)}</View>
              <Text style={styles.ratingText}>4.5</Text>
              <Text style={styles.reviewCount}>(128 đánh giá)</Text>
            </View>
          </View>

          {/* Author Info */}
          <View style={styles.authorContainer}>
            <Image
              source={{
                uri: resource.designer?.avatar || "https://ui-avatars.com/api/?name=Designer&background=4F46E5&color=fff",
              }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorLabel}>Tác giả</Text>
              <Text style={styles.authorName}>
                {resource.designer?.fullName || "Designer Studio"}
              </Text>
            </View>
            <Pressable style={styles.followButton}>
              <Icon name="person-add" size={18} color="#4F46E5" />
            </Pressable>
          </View>

          {/* Price & Release Date */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Giá bán</Text>
              <Text style={styles.price}>{resource.price.toLocaleString()} đ</Text>
            </View>
            <View style={styles.releaseDateContainer}>
              <Icon name="calendar-today" size={16} color="#6B7280" />
              <Text style={styles.releaseDate}>
                {new Date(resource.releaseDate).toLocaleDateString("vi-VN")}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </View>

          {/* Product Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Icon name="check-circle" size={20} color="#10B981" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Trạng thái</Text>
                  <Text style={styles.infoValue}>
                    {resource.isActive ? "Đang hoạt động" : "Ngừng bán"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Icon name="event" size={20} color="#F59E0B" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Hạn sử dụng</Text>
                  <Text style={styles.infoValue}>
                    {new Date(resource.expiredTime).toLocaleDateString("vi-VN")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Items List */}
          {resource.items && resource.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung bao gồm</Text>
              {resource.items.map((item) => (
                <View key={item.resourceItemId} style={styles.itemRow}>
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>{item.itemIndex}</Text>
                  </View>
                  <Text style={styles.itemText}>{item.itemUrl}</Text>
                </View>
              ))}
            </View>
          )}

        {/* 🟣 Reviews & Ratings Section */}
<View style={styles.section}>
  <View style={styles.reviewsHeader}>
    <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
    <Pressable style={styles.writeReviewButton}>
      <Icon name="rate-review" size={18} color="#4F46E5" />
      <Text style={styles.writeReviewText}>Viết đánh giá</Text>
    </Pressable>
  </View>

  {/* ⭐ Rating Overview */}
  <View style={styles.ratingStats}>
    <View style={styles.ratingOverview}>
      <Text style={styles.ratingNumber}>4.5</Text>
      <View style={styles.starsContainerSmall}>{renderStars(4.5)}</View>
      <Text style={styles.totalReviews}>128 đánh giá</Text>
    </View>

    <View style={styles.ratingBars}>
      {[5, 4, 3, 2, 1].map((star) => {
        const percentage = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2;
        return (
          <View key={star} style={styles.ratingBarRow}>
            <Text style={styles.starLabel}>{star}</Text>
            <Icon name="star" size={14} color="#FFC107" />
            <View style={styles.barContainer}>
              <View style={[styles.barFill, { width: `${percentage}%` }]} />
            </View>
            <Text style={styles.barPercentage}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  </View>

  {/* 🧠 Reviews List */}
  <View style={styles.reviewsList}>
    {reviews.map((review, index) => (
      <View key={index} style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Image
            source={{
              uri:
                review.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=4F46E5&color=fff`,
            }}
            style={styles.reviewerAvatar}
          />
          <View style={styles.reviewerInfoContainer}>
            <Text style={styles.reviewerName}>{review.name}</Text>
            <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
          </View>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>

        <Text style={styles.reviewComment}>{review.comment}</Text>

        <View style={styles.reviewActions}>
          <Pressable style={styles.reviewActionButton}>
            <Icon name="thumb-up-off-alt" size={16} color="#6B7280" />
            <Text style={styles.reviewActionText}>Hữu ích ({review.likes})</Text>
          </Pressable>
          <Pressable style={styles.reviewActionButton}>
            <Icon name="reply" size={16} color="#6B7280" />
            <Text style={styles.reviewActionText}>Trả lời</Text>
          </Pressable>
        </View>
      </View>
    ))}

    {/* Load More */}
    <Pressable style={styles.loadMoreButton}>
      <Text style={styles.loadMoreText}>Xem thêm đánh giá</Text>
      <Icon name="keyboard-arrow-down" size={20} color="#4F46E5" />
    </Pressable>
  </View>
</View>

        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Icon name="shopping-cart" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Thêm vào giỏ</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
        >
          <Icon name="flash-on" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Mua ngay</Text>
        </Pressable>
      </View>

      <Toast />
    </View>
  );
}