import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { useCart } from "../../../context/CartContext";
import { resourceService } from "../../../service/resourceService";
import { styles } from "./ResourceDetailScreen.styles";

export default function ResourceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { addToCart, cart } = useCart();

  const { resourceId } = route.params;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Blindbox");
  const [userResources, setUserResources] = useState([]);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getResourceById(resourceId);
        console.log(data)
        setResource(data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Load resource failed",
          text2: error.message,
        });
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resourceId]);

  // Fetch Resource By User Id
  useEffect(() => {
    const fetchUserResources = async () => {
      try {
        const resUser = await resourceService.getResourceProjectByUserId();
        //  console.log(resUser);
        const userData = Array.isArray(resUser) ? resUser : [];
        // console.log("✅ Resource By User Id:", userData);
        setUserResources(userData);
      } catch (error) {
        console.error("❌ Fetch Resource By User Id Failed:", error);
        setUserResources([]);
      }
    };
    fetchUserResources();
  }, []);

  // ✅ Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!resource) return;
    const alreadyOwned =
      Array.isArray(userResources) &&
      userResources.some(
        (r) => r.resourceTemplateId === resource.resourceTemplateId
      );

    if (alreadyOwned) {
      Toast.show({
        type: "info",
        text1: "You already own this resource",
        text2: "You cannot buy it again.",
      });
      return;
    }

    const alreadyInCart = cart?.some(
      (item) => item.id === resource.resourceTemplateId
    );

    if (alreadyInCart) {
      Toast.show({
        type: "info",
        text1: "Resource already in cart",
        text2: `${resource.name} is waiting for payment.`,
      });
      return;
    }
    const newItem = {
      id: resource.resourceTemplateId,
      name: resource.name,
      price: resource.price,
      type: resource.type,
      image:
        resource.images?.find((img) => img.isThumbnail)?.imageUrl ||
        resource.images?.[0]?.imageUrl ||
        "https://via.placeholder.com/150",
      designer: resource.designer,
      releaseDate: resource.releaseDate,
      expiredTime: resource.expiredTime,
      isActive: resource.isActive,
      quantity: quantity,
      option: selectedOption,
    };

    addToCart(newItem, quantity);

    Toast.show({
      type: "success",
      text1: "🛒 added to cart",
      text2: `${resource.name} added to cart!`,
    });
  };

  // 🟡 Mua ngay - Add to cart and navigate to cart screen
  const handleBuyNow = () => {
    // Check if user already owns the resource
    const alreadyOwned =
      Array.isArray(userResources) &&
      userResources.some(
        (r) => r.resourceTemplateId === resource.resourceTemplateId
      );

    if (alreadyOwned) {
      Toast.show({
        type: "info",
        text1: "You already own this resource",
        text2: "You cannot buy it again.",
      });
      return;
    }

    if (!resource) return;

    const alreadyInCart = cart?.some(
      (item) => item.id === resource.resourceTemplateId
    );

    if (alreadyInCart) {
      navigation.navigate("Cart");
      Toast.show({
        type: "info",
        text1: "Resource đã có trong giỏ",
        text2: `${resource.name} đang chờ thanh toán.`,
      });
      return;
    }

    const designerName = resource.designerInfo
      ? `${resource.designerInfo.firstName || ""} ${
          resource.designerInfo.lastName || ""
        }`.trim()
      : "Unknown Designer";

    const item = {
      id: resource.resourceTemplateId,
      name: resource.name,
      description: resource.description,
      price: resource.price,
      type: resource.type,
      image:
        resource.images?.find((img) => img.isThumbnail)?.imageUrl ||
        resource.images?.[0]?.imageUrl,
      designer: designerName,
      releaseDate: resource.releaseDate,
      isActive: resource.isActive,
      quantity: quantity,
      option: selectedOption,
    };

    // Add to cart and navigate to cart screen
    addToCart(item);
    navigation.navigate("Cart");

    Toast.show({
      type: "success",
      text1: "🛒 go to cart",
      text2: `${resource.name} added to cart!`,
    });
  };

  // ✅ Render stars
  const renderStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size={16} color="#FFC107" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#FFC107" />
      );
    }
    while (stars.length < 5) {
      stars.push(
        <Icon key={stars.length} name="star-border" size={16} color="#D1D5DB" />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading resource details...</Text>
      </View>
    );
  }

  if (!resource) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="inbox" size={80} color="#D1D5DB" />
        <Text style={styles.emptyText}>Not found resource.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Resource Detail</Text>
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
        <View style={styles.mainContent}>
          {/* Left Side: Image Gallery */}
          <View style={styles.leftColumn}>
            <View style={styles.leftColumnContainer}>
              <View style={styles.imageGalleryContainer}>
                {/* Main Image */}
                <View style={styles.mainImageContainer}>
                  <Image
                    source={{
                      uri:
                        resource.images?.[currentImageIndex]?.imageUrl ||
                        "https://via.placeholder.com/400x300",
                    }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Thumbnail Images */}
                {resource.images && resource.images.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailContainer}
                    contentContainerStyle={styles.thumbnailContent}
                  >
                    {resource.images.map((item, index) => (
                      <Pressable
                        key={index}
                        onPress={() => setCurrentImageIndex(index)}
                        style={[
                          styles.thumbnailWrapper,
                          currentImageIndex === index && styles.thumbnailActive,
                        ]}
                      >
                        <Image
                          source={{
                            uri:
                              item.imageUrl ||
                              "https://via.placeholder.com/100",
                          }}
                          style={styles.thumbnailImage}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Author Info */}
              <View style={styles.authorContainer}>
                <Image
                  source={{
                    uri:
                      resource.designer?.avatar ||
                      "https://ui-avatars.com/api/?name=Designer&background=4F46E5&color=fff",
                  }}
                  style={styles.authorAvatar}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorLabel}>Designer</Text>
                  <Text style={styles.authorName}>
                    {resource.designer?.fullName || "Designer Studio"}
                  </Text>
                </View>
                <Pressable style={styles.followButton}>
                  <Icon name="person-add" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Right Side: Details */}
          <View style={styles.rightColumn}>
            <View style={styles.rightColumnContainer}>
              <View style={styles.resourceHeaderRow}>
              <Text style={styles.resourceName}>{resource.name}</Text>
              {resource.type && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{resource.type}</Text>
                </View>
              )}
            </View>
              <Text style={styles.price}>
                {resource.price.toLocaleString()} đ
              </Text>

              {/* Title & Rating */}
              <View style={styles.titleSection}>
                <View style={styles.ratingRow}>
                  <View style={styles.starsContainer}>{renderStars(4.5)}</View>
                  <Text style={styles.ratingText}>4.5</Text>
                  <Text style={styles.reviewCount}>(128 đánh giá)</Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.sectionInner}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {resource.description}
                </Text>
              </View>

              {/* Product Info */}
              <View style={[styles.sectionInner, styles.sectionInnerLast]}>
                <Text style={styles.sectionTitle}>Product Info</Text>

                <View style={styles.infoGrid}>
                  {/* Expired Time */}
                  <View style={styles.infoItem}>
                    <Icon name="event-busy" size={18} color="#F59E0B" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Expired Time</Text>
                      <Text style={styles.infoValue}>
                        {new Date(resource.expiredTime).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Release Date */}
                  <View style={styles.infoItem}>
                    <Icon name="event-available" size={18} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Release Date</Text>
                      <Text style={styles.infoValue}>
                        {new Date(resource.releaseDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Download Count */}
                  <View style={styles.infoItem}>
                    <Icon name="file-download" size={18} color="#3B82F6" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Download Count</Text>
                      <Text style={styles.infoValue}>
                        {resource.downloadCount ?? 120}
                      </Text>
                    </View>
                  </View>

                  {/* File Size */}
                  <View style={styles.infoItem}>
                    <Icon name="storage" size={18} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>File Size</Text>
                      <Text style={styles.infoValue}>
                        {resource.size ? `${resource.size} MB` : "15 MB"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                <Pressable
                  style={[styles.actionButton, styles.addToCartButton]}
                  onPress={handleAddToCart}
                >
                  <Text style={styles.actionButtonText}>Add to Cart</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.buyNowButton]}
                  onPress={handleBuyNow}
                >
                  <Icon name="flash-on" size={16} color="#FFFFFF" />
                  <Text
                    style={[styles.actionButtonText, styles.buyNowButtonText]}
                  >
                   Buy now
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 🟣 Reviews & Ratings Section */}
        <View style={styles.infoContainer}>
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {/* <Pressable style={styles.writeReviewButton}>
                <Icon name="rate-review" size={16} color="#FFFFFF" />
                <Text style={styles.writeReviewText}>Write a Review</Text>
              </Pressable> */}
            </View>

            {/* ⭐ Rating Overview */}
            <View style={styles.ratingStats}>
              <View style={styles.ratingOverview}>
                <Text style={styles.ratingNumber}>4.5</Text>
                <View style={styles.starsContainerSmall}>
                  {renderStars(4.5)}
                </View>
                <Text style={styles.totalReviews}>(128 reviews)</Text>
              </View>

              <View style={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage =
                    star === 5
                      ? 70
                      : star === 4
                      ? 20
                      : star === 3
                      ? 5
                      : star === 2
                      ? 3
                      : 2;
                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.starLabel}>{star}</Text>
                      <Icon name="star" size={14} color="#FFC107" />
                      <View style={styles.barContainer}>
                        <View
                          style={[styles.barFill, { width: `${percentage}%` }]}
                        />
                      </View>
                      <Text style={styles.barPercentage}>{percentage}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 🧠 Reviews List */}
            <View style={styles.reviewsList}>
              {/* {reviews.map((review, index) => (
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
    ))} */}

              {/* Load More */}
              <Pressable style={styles.loadMoreButton}>
                <Text style={styles.loadMoreText}>Load more reviews</Text>
                <Icon name="keyboard-arrow-down" size={20} color="#3B82F6" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
