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
import { feedbackService } from "../../../service/feedbackService";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
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
  const [galleryImages, setGalleryImages] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await resourceService.getResourceById(resourceId);
        setResource(data);

        // 🖼 Combine images and items for gallery
        const mainImages = data.images || [];
        const itemImages = data.items
          ? data.items
            .filter((item) => item.imageUrl)
            .map((item) => ({ imageUrl: item.imageUrl }))
          : [];

        setGalleryImages([...mainImages, ...itemImages]);

        const feedbackData = await feedbackService.getAllFeedbackResource(
          resourceId
        );

        setFeedback(feedbackData || []);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Load resource failed",
          text2: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [resourceId]);



  // ✅ Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (!resource) return;

    if (resource.isOwner) {
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
    if (resource.isOwner) {
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
        text1: "Resource already in cart",
        text2: `${resource.name} is waiting for payment.`,
      });
      return;
    }

    const designerName = resource.designerInfo
      ? `${resource.designerInfo.firstName || ""} ${resource.designerInfo.lastName || ""
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
  const renderStars = (rating = 0) => {
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
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LottieView
          source={loadingAnimation}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
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
        <View style={styles.headerLeft}>
          <SidebarToggleButton iconSize={26} iconColor="#084F8C" />
          <Text style={styles.headerTitle}>Resource Detail</Text>
        </View>
        <Pressable
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Icon name="shopping-cart" size={24} color="#084F8C" />
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
                        galleryImages[currentImageIndex]?.imageUrl ||
                        "https://via.placeholder.com/400x300",
                    }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Thumbnail Images */}
                {galleryImages.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.thumbnailContainer}
                    contentContainerStyle={styles.thumbnailContent}
                  >
                    {galleryImages.map((item, index) => (
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
              <Pressable
                style={styles.authorContainer}
                onPress={() => {
                  if (resource.designerId) {
                    navigation.navigate("DesignerProfile", {
                      designerId: resource.designerId,
                    });
                  } else {
                    Toast.show({
                      type: "info",
                      text1: "Designer information unavailable",
                    });
                  }
                }}
              >
                <Image
                  source={{
                    uri:
                      resource.designerInfo?.avatarUrl ||
                      "https://ui-avatars.com/api/?name=Designer&background=4F46E5&color=fff",
                  }}
                  style={styles.authorAvatar}
                />

                <View style={styles.authorInfo}>
                  <Text style={styles.authorLabel}>Designer</Text>
                  <Text style={styles.authorName}>
                    {resource.designerInfo
                      ? `${resource.designerInfo.firstName || ""} ${resource.designerInfo.lastName || ""}`.trim()
                      : "Designer Studio"}
                  </Text>
                </View>

                {/* Icon chỉ hiển thị, không bắt onPress */}
                <View style={styles.followButton}>
                  <Icon name="person-add" size={16} color="#FFFFFF" />
                </View>
              </Pressable>

            </View>
          </View>

          {/* Right Side: Details */}
          <View style={styles.rightColumn}>
            <View style={styles.rightColumnContainer}>
              <View style={styles.resourceHeaderRow}>
                <Text style={styles.resourceName}>{resource.name?.toUpperCase()}</Text>
                {resource.type && (
                  <View style={[
                    styles.typeBadge,
                    resource.type === 'TEMPLATES' && styles.typeBadgeBlue
                  ]}>
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
                  <View style={styles.starsContainer}>{renderStars(resource.averageRating || 0)}</View>
                  <Text style={styles.ratingText}>{(resource.averageRating || 0).toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({resource.feedbackCount || 0} feedbacks)</Text>
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

                  {/* File Size
                  <View style={styles.infoItem}>
                    <Icon name="storage" size={18} color="#10B981" />
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>File Size</Text>
                      <Text style={styles.infoValue}>
                        {resource.size ? `${resource.size} MB` : "15 MB"}
                      </Text>
                    </View>
                  </View> */}
                </View>
              </View>

              <View style={styles.actionButtonsContainer}>
                {resource.isOwner ? (
                  <View style={{ flex: 1, flexDirection: "row", gap: 12 }}>
                    <View
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: "#E5E7EB",
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Text
                        style={[styles.actionButtonText, { color: "#374151" }]}
                      >
                        ✓ Purchased
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: "#3B82F6",
                          flex: 1,
                          flexDirection: "row",
                          gap: 8,
                        },
                      ]}
                      onPress={() => {
                        // Handle open resource
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon",
                          text2: "Open resource feature is under development",
                        });
                      }}
                    >
                      <Icon name="folder-open" size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Open Resource</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <Pressable
                      style={[styles.actionButton, styles.addToCartButton]}
                      onPress={handleAddToCart}
                    >
                      <Icon name="shopping-cart" size={18} color="#1E40AF" />
                      <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.actionButton, styles.buyNowButton]}
                      onPress={handleBuyNow}
                    >
                      <Icon name="flash-on" size={18} color="#FFFFFF" />
                      <Text style={styles.buyNowButtonText}>
                        Buy Now
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 🟣 Reviews & Ratings Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsContainer}>
            {/* Header with icon */}
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsHeaderLeft}>
                <View style={styles.reviewsIconContainer}>
                  <Icon name="star" size={24} color="#FFC107" />
                </View>
                <Text style={styles.reviewsTitle}>Reviews & Ratings</Text>
              </View>
              <Text style={styles.reviewsSubtitle}>
                {feedback?.totalFeedbacks || 0} reviews
              </Text>
            </View>

            {/* ⭐ Rating Overview with gradient background */}
            <View style={styles.ratingStatsCard}>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingNumberContainer}>
                  <Text style={styles.ratingNumber}>
                    {(feedback?.averageRating || 0).toFixed(1)}
                  </Text>
                  <View style={styles.ratingMaxText}>
                    <Text style={styles.ratingOutOf}>out of 5</Text>
                  </View>
                </View>
                <View style={styles.starsContainerSmall}>
                  {renderStars(feedback?.averageRating || 0)}
                </View>
                <Text style={styles.totalReviews}>
                  Based on {feedback?.totalFeedbacks || 0} reviews
                </Text>
              </View>

              <View style={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = feedback?.ratingDistribution?.[star] || 0;
                  const total = feedback?.totalFeedbacks || 1;
                  const percentage = Math.round((count / total) * 100);

                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.starLabel}>{star}</Text>
                      <Icon name="star" size={16} color="#FFC107" />
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
              <Text style={styles.reviewsListTitle}>Customer Reviews</Text>
              {feedback?.feedbacks?.length > 0 ? (
                feedback.feedbacks.map((item, index) => (
                  <View key={item.id} style={styles.reviewItemCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={{
                          uri:
                            item.userAvatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.userFullName || "User"
                            )}&background=4F46E5&color=fff`,
                        }}
                        style={styles.reviewerAvatar}
                      />
                      <View style={styles.reviewerInfoContainer}>
                        <Text style={styles.reviewerName}>
                          {item.userFullName || "Anonymous"}
                        </Text>
                        <View style={styles.reviewRatingRow}>
                          <View style={styles.reviewRating}>
                            {renderStars(item.rating)}
                          </View>
                          <Text style={styles.reviewDate}>
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.reviewComment}>{item.comment}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noReviewsContainer}>
                  <Icon name="rate-review" size={48} color="#CBD5E1" />
                  <Text style={styles.noReviewsText}>
                    No reviews yet
                  </Text>
                  <Text style={styles.noReviewsSubtext}>
                    Be the first to review this resource!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
