import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { Shadow } from "react-native-shadow-2";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for resource details
const mockResourceDetails = {
  id: '1',
  name: 'imMed|Anatomy',
  category: 'Medical',
  price: 1150000,
  images: [
    'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Anatomy+Card+1',
    'https://via.placeholder.com/600x400/E74C3C/FFFFFF?text=Anatomy+Card+2',
    'https://via.placeholder.com/600x400/27AE60/FFFFFF?text=Anatomy+Card+3',
    'https://via.placeholder.com/600x400/F39C12/FFFFFF?text=Anatomy+Card+4',
  ],
  description: 'Anatomy Flash Cards: Embed the entire core straight into your brain—wield the legendary "anti-forgetting" spell and crush ancient amnesia magic today!',
  author: 'ImMed',
  authorDescription: 'A Glance Medical Knowledge Platform under Yimu Visual, specializing in medical visualization design to make medicine instantly understandable. Medicine could be seen immediately.',
  authorAvatar: 'https://via.placeholder.com/100x100/9B59B6/FFFFFF?text=ImMed',
  rating: 4.8,
  downloads: 134,
  fileSize: '55.75MB',
  quantity: 77,
  paperSize: 'A4',
  instructions: [
    'Tải xuống và giải nén file',
    'In ra giấy A4 hoặc sử dụng trên thiết bị điện tử',
    'Học theo phương pháp spaced repetition để ghi nhớ tốt nhất',
    'Kết hợp với các tài liệu học tập khác để hiệu quả cao nhất'
  ],
  reviews: [
    {
      id: 'r1',
      user: 'Nguyễn Văn A',
      avatar: 'https://via.placeholder.com/50x50/4A90E2/FFFFFF?text=A',
      rating: 5,
      date: '12/05/2023',
      comment: 'Tài liệu rất hữu ích, giúp tôi học giải phẫu dễ dàng hơn nhiều!'
    },
    {
      id: 'r2',
      user: 'Trần Thị B',
      avatar: 'https://via.placeholder.com/50x50/E74C3C/FFFFFF?text=B',
      rating: 4,
      date: '28/04/2023',
      comment: 'Chất lượng hình ảnh tốt, nội dung đầy đủ. Tuy nhiên có một số thuật ngữ chuyên ngành khó hiểu.'
    },
    {
      id: 'r3',
      user: 'Lê Văn C',
      avatar: 'https://via.placeholder.com/50x50/27AE60/FFFFFF?text=C',
      rating: 5,
      date: '15/03/2023',
      comment: 'Đáng đồng tiền bát gạo! Tôi đã thi đậu nhờ bộ flashcard này.'
    },
  ]
};

export default function ResourceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [resource, setResource] = useState(mockResourceDetails);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);

  // Trong thực tế, bạn sẽ lấy resourceId từ route.params và gọi API để lấy chi tiết
  // const { resourceId } = route.params;
  // useEffect(() => {
  //   // Fetch resource details from API
  //   // setResource(data);
  // }, [resourceId]);

  const handleAddToCart = () => {
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    Alert.alert('Thanh toán', `Mua ${resource.name} với giá ${resource.price.toLocaleString()} VNĐ`);
  };

  const renderImageItem = ({ item }) => (
    <Image 
      source={{ uri: item }} 
      style={styles.bannerImage} 
      resizeMode="cover"
    />
  );

  const handleImageChange = (event) => {
    const slideWidth = SCREEN_WIDTH;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    setCurrentImageIndex(index);
  };
 
 

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color="#6B7280" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Banner Slider */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={flatListRef}
            data={resource.images}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleImageChange}
            keyExtractor={(item, index) => index.toString()}
          />
          
          {/* Pagination Dots */}
          <View style={styles.paginationContainer}>
            {resource.images.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.paginationDot, 
                  currentImageIndex === index && styles.paginationDotActive
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Resource Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.resourceName}>{resource.name}</Text>
          <Text style={styles.resourceCategory}>{resource.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>{resource.price.toLocaleString()} đ</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={18} color="#FFC107" />
              <Text style={styles.ratingText}>{resource.rating} ({resource.downloads} lượt mua)</Text>
            </View>
          </View>

          {/* Author Info */}
          <View style={styles.authorContainer}>
            <Image source={{ uri: resource.authorAvatar }} style={styles.authorAvatar} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{resource.author}</Text>
              <Text style={styles.authorDescription} numberOfLines={2}>
                {resource.authorDescription}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </View>

          {/* Product Details */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kích thước file</Text>
                <Text style={styles.detailValue}>{resource.fileSize}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Số lượng</Text>
                <Text style={styles.detailValue}>{resource.quantity}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Kích thước giấy</Text>
                <Text style={styles.detailValue}>{resource.paperSize}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lượt tải</Text>
                <Text style={styles.detailValue}>{resource.downloads}</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>
            {resource.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionBullet}>
                  <Text style={styles.instructionBulletText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Đánh giá từ người dùng</Text>
            {resource.reviews.map((review) => (
              <Shadow distance={5} startColor="#00000010" finalColor="#00000005" key={review.id}>
                <View style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Image source={{ uri: review.avatar }} style={styles.reviewerAvatar} />
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.user}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i} 
                          name="star" 
                          size={16} 
                          color={i < review.rating ? "#FFC107" : "#E5E7EB"} 
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              </Shadow>
            ))}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
    height: 300,
  },
  bannerImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  resourceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  resourceCategory: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28A745',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#6C757D',
    marginLeft: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  authorDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionBulletText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  reviewItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6C757D',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  addToCartButton: {
    backgroundColor: '#3B82F6',
  },
  buyNowButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});