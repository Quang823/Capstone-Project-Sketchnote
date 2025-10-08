import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { cartStyles } from './CartScreen.styles';
import Icon from "react-native-vector-icons/MaterialIcons";
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for cart items
const mockCartItems = [
  {
    id: '1',
    name: 'Brush Set Pro',
    category: 'Brushes',
    price: 50000,
    image: 'https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=Brush',
    quantity: 1,
    isPremium: true,
  },
  {
    id: '2',
    name: 'Color Palette Modern',
    category: 'Colors',
    price: 25000,
    image: 'https://via.placeholder.com/80x80/E74C3C/FFFFFF?text=Colors',
    quantity: 2,
    isPremium: false,
  },
  {
    id: '3',
    name: 'Typography Kit',
    category: 'Fonts',
    price: 60000,
    image: 'https://via.placeholder.com/80x80/9B59B6/FFFFFF?text=Fonts',
    quantity: 1,
    isPremium: true,
  },
];

// Mock data for courses
const mockCourseItems = [
  {
    id: 'c1',
    name: 'Sketchnote Cơ Bản',
    instructor: 'Nguyễn Văn A',
    price: 299000,
    image: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=Course',
    duration: '8 giờ',
    lessons: 24,
  },
  {
    id: 'c2',
    name: 'Visual Thinking Nâng Cao',
    instructor: 'Trần Thị B',
    price: 499000,
    image: 'https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=Course',
    duration: '12 giờ',
    lessons: 36,
  },
];

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [courseItems, setCourseItems] = useState(mockCourseItems);
  const [selectedTab, setSelectedTab] = useState('resources'); // 'resources' or 'courses'

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setCartItems(items => items.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const removeCourse = (id) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setCourseItems(items => items.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const calculateTotal = () => {
    const resourcesTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const coursesTotal = courseItems.reduce(
      (sum, item) => sum + item.price,
      0
    );
    return resourcesTotal + coursesTotal;
  };

  const handleCheckout = () => {
    const total = calculateTotal();
    if (total === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }
    Alert.alert(
      'Thanh toán',
      `Tổng tiền: ${total.toLocaleString()} VNĐ\nBạn có muốn tiếp tục thanh toán?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Thanh toán',
          onPress: () => {
            // Navigate to payment or show payment options
            Alert.alert('Thành công', 'Đang chuyển đến trang thanh toán...');
          },
        },
      ]
    );
  };

  const goToWallet = () => {
    navigation.navigate('Wallet');
  };

  const renderResourceItem = (item) => (
    <View key={item.id} style={cartStyles.cartItem}>
      <Image source={{ uri: item.image }} style={cartStyles.itemImage} />
      <View style={cartStyles.itemInfo}>
        <View style={cartStyles.itemHeader}>
          <Text style={cartStyles.itemName}>{item.name}</Text>
          {item.isPremium && (
            <View style={cartStyles.premiumBadge}>
              <Text style={cartStyles.premiumText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={cartStyles.itemCategory}>{item.category}</Text>
        <Text style={cartStyles.itemPrice}>
          {item.price.toLocaleString()} VNĐ
        </Text>
        <View style={cartStyles.quantityContainer}>
          <Pressable
            style={cartStyles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={cartStyles.quantityButtonText}>-</Text>
          </Pressable>
          <Text style={cartStyles.quantityText}>{item.quantity}</Text>
          <Pressable
            style={cartStyles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={cartStyles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
      <View style={cartStyles.itemActions}>
        <Text style={cartStyles.itemTotal}>
          {(item.price * item.quantity).toLocaleString()} VNĐ
        </Text>
        <Pressable
          style={cartStyles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={cartStyles.removeButtonText}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderCourseItem = (item) => (
    <View key={item.id} style={cartStyles.cartItem}>
      <Image source={{ uri: item.image }} style={cartStyles.itemImage} />
      <View style={cartStyles.itemInfo}>
        <Text style={cartStyles.itemName}>{item.name}</Text>
        <Text style={cartStyles.itemCategory}>Khóa học • {item.instructor}</Text>
        <Text style={cartStyles.courseMeta}>
          {item.duration} • {item.lessons} bài học
        </Text>
        <Text style={cartStyles.itemPrice}>
          {item.price.toLocaleString()} VNĐ
        </Text>
      </View>
      <View style={cartStyles.itemActions}>
        <Text style={cartStyles.itemTotal}>
          {item.price.toLocaleString()} VNĐ
        </Text>
        <Pressable
          style={cartStyles.removeButton}
          onPress={() => removeCourse(item.id)}
        >
          <Text style={cartStyles.removeButtonText}>🗑️</Text>
        </Pressable>
      </View>
    </View>
  );

  const total = calculateTotal();

  return (
    <View style={cartStyles.container}>
      <View style={cartStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={cartStyles.headerTitle}>Giỏ hàng</Text>
        <Pressable style={cartStyles.walletButton} onPress={goToWallet}>
          <Text style={cartStyles.walletIcon}>💰</Text>
        </Pressable>
      </View>

      <View style={cartStyles.tabContainer}>
        <Pressable
          style={[
            cartStyles.tabButton,
            selectedTab === 'resources' && cartStyles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('resources')}
        >
          <Text
            style={[
              cartStyles.tabText,
              selectedTab === 'resources' && cartStyles.activeTabText,
            ]}
          >
            Resources ({cartItems.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            cartStyles.tabButton,
            selectedTab === 'courses' && cartStyles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('courses')}
        >
          <Text
            style={[
              cartStyles.tabText,
              selectedTab === 'courses' && cartStyles.activeTabText,
            ]}
          >
            Khóa học ({courseItems.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={cartStyles.content}>
        {selectedTab === 'resources' ? (
          cartItems.length > 0 ? (
            cartItems.map(renderResourceItem)
          ) : (
            <View style={cartStyles.emptyContainer}>
              <Text style={cartStyles.emptyIcon}>🛒</Text>
              <Text style={cartStyles.emptyText}>Giỏ hàng trống</Text>
              <Pressable
                style={cartStyles.browseButton}
                onPress={() => navigation.navigate('ResourceStore')}
              >
                <Text style={cartStyles.browseButtonText}>Mua sắm ngay</Text>
              </Pressable>
            </View>
          )
        ) : (
          courseItems.length > 0 ? (
            courseItems.map(renderCourseItem)
          ) : (
            <View style={cartStyles.emptyContainer}>
              <Text style={cartStyles.emptyIcon}>📚</Text>
              <Text style={cartStyles.emptyText}>Chưa có khóa học nào</Text>
              <Pressable
                style={cartStyles.browseButton}
                onPress={() => navigation.navigate('Courses')}
              >
                <Text style={cartStyles.browseButtonText}>Xem khóa học</Text>
              </Pressable>
            </View>
          )
        )}
      </ScrollView>

      {total > 0 && (
        <View style={cartStyles.footer}>
          <View style={cartStyles.totalContainer}>
            <Text style={cartStyles.totalLabel}>Tổng cộng:</Text>
            <Text style={cartStyles.totalAmount}>
              {total.toLocaleString()} VNĐ
            </Text>
          </View>
          <Pressable style={cartStyles.checkoutButton} onPress={handleCheckout}>
            <Text style={cartStyles.checkoutButtonText}>Thanh toán</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
