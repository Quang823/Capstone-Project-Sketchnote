import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { cartStyles } from './CartScreen.styles';
import Icon from "react-native-vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for cart items
const mockCartItems = [
  {
    id: '1',
    name: 'Màn Hình Máy Tính PC Xiaomi Monitor A24i',
    shopName: 'Xiaomi Official Store Vietnam',
    price: 1880000,
    originalPrice: 2590000,
    image: 'https://res.cloudinary.com/dturncvxv/image/upload/v1759586743/sketchnote_avatars/ioplgtgchgy2ndm75zwx.jpg',
    quantity: 1,
    selected: true,
  },
  {
    id: '2',
    name: 'Màn hình Asus 23.8 inch VG249',
    shopName: 'PHONG VU Digital Store',
    price: 2459000,
    originalPrice: 3090000,
    image: 'https://res.cloudinary.com/dturncvxv/image/upload/v1759586743/sketchnote_avatars/ioplgtgchgy2ndm75zwx.jpg',
    quantity: 1,
    selected: true,
  },
  {
    id: '3',
    name: 'Brush Set Pro Premium',
    shopName: 'Art Supplies VN',
    price: 350000,
    originalPrice: 500000,
    image: 'https://res.cloudinary.com/dturncvxv/image/upload/v1759586743/sketchnote_avatars/ioplgtgchgy2ndm75zwx.jpg',
    quantity: 2,
    selected: false,
  },
];

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
    setSelectAll(allSelected);
  }, [cartItems]);

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCartItems(items =>
      items.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  const toggleSelectItem = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

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
      'Xóa sản phẩm',
      'Bạn có chắc muốn xóa sản phẩm này?',
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

  const calculateTotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getSelectedCount = () => {
    return cartItems.filter(item => item.selected).length;
  };

  const getTotalSavings = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm để mua hàng');
      return;
    }
    const total = calculateTotal();
    Alert.alert(
      'Mua hàng',
      `Tổng thanh toán: ${total.toLocaleString()}đ\nBạn có muốn tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            Alert.alert('Thành công', 'Đang xử lý đơn hàng...');
          },
        },
      ]
    );
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={cartStyles.shopContainer}>
      {/* Shop header */}
      <View style={cartStyles.shopHeader}>
        <Pressable 
          style={cartStyles.checkbox}
          onPress={() => toggleSelectItem(item.id)}
        >
          <View style={[cartStyles.checkboxBox, item.selected && cartStyles.checkboxBoxChecked]}>
            {item.selected && <Icon name="check" size={16} color="#fff" />}
          </View>
        </Pressable>
        <Icon name="store" size={18} color="#ee4d2d" />
        <Text style={cartStyles.shopName}>{item.shopName}</Text>
      </View>

      {/* Product item */}
      <View style={cartStyles.productItem}>
        <Pressable 
          style={cartStyles.checkbox}
          onPress={() => toggleSelectItem(item.id)}
        >
          <View style={[cartStyles.checkboxBox, item.selected && cartStyles.checkboxBoxChecked]}>
            {item.selected && <Icon name="check" size={16} color="#fff" />}
          </View>
        </Pressable>

        <Image source={{ uri: item.image }} style={cartStyles.productImage} />

        <View style={cartStyles.productInfo}>
          <Text style={cartStyles.productName} numberOfLines={2}>{item.name}</Text>
          
          <View style={cartStyles.priceRow}>
            <Text style={cartStyles.productPrice}>₫{item.price.toLocaleString()}</Text>
            <Text style={cartStyles.originalPrice}>₫{item.originalPrice.toLocaleString()}</Text>
          </View>

          <View style={cartStyles.bottomRow}>
            <View style={cartStyles.quantityControls}>
              <Pressable
                style={cartStyles.qtyButton}
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Icon name="remove" size={14} color="#888" />
              </Pressable>
              <Text style={cartStyles.qtyText}>{item.quantity}</Text>
              <Pressable
                style={cartStyles.qtyButton}
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Icon name="add" size={14} color="#888" />
              </Pressable>
            </View>

            <Pressable onPress={() => removeItem(item.id)}>
              <Text style={cartStyles.deleteText}>Xóa</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={cartStyles.emptyContainer}>
      <Icon name="shopping-cart" size={80} color="#ddd" />
      <Text style={cartStyles.emptyText}>Giỏ hàng trống</Text>
      <Pressable
        style={cartStyles.shopNowButton}
        onPress={() => navigation.navigate('ResourceStore')}
      >
        <Text style={cartStyles.shopNowText}>Mua sắm ngay</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={cartStyles.container}>
      {/* Header */}
      <View style={cartStyles.header}>
        <Pressable onPress={() => navigation.goBack()} style={cartStyles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={cartStyles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        <Pressable style={cartStyles.moreButton}>
          <Icon name="more-horiz" size={24} color="#000" />
        </Pressable>
      </View>

      {/* Cart Content */}
      <ScrollView 
        style={cartStyles.scrollContent}
        contentContainerStyle={cartStyles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length > 0 ? (
          cartItems.map(renderCartItem)
        ) : (
          renderEmptyCart()
        )}
        {/* Bottom padding to prevent content from being hidden behind fixed footer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Footer - Checkout Bar */}
      {cartItems.length > 0 && (
        <View style={cartStyles.checkoutBar}>
          <View style={cartStyles.checkoutTop}>
            <Pressable 
              style={cartStyles.selectAllContainer}
              onPress={toggleSelectAll}
            >
              <View style={[cartStyles.checkboxBox, selectAll && cartStyles.checkboxBoxChecked]}>
                {selectAll && <Icon name="check" size={16} color="#fff" />}
              </View>
              <Text style={cartStyles.selectAllText}>Tất cả</Text>
            </Pressable>

            <View style={cartStyles.totalContainer}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={cartStyles.totalLabel}>Tổng thanh toán: </Text>
                  <Text style={cartStyles.totalPrice}>₫{calculateTotal().toLocaleString()}</Text>
                </View>
                
              </View>

              <Pressable 
                style={[
                  cartStyles.checkoutButton,
                  getSelectedCount() === 0 && cartStyles.checkoutButtonDisabled
                ]}
                onPress={handleCheckout}
                disabled={getSelectedCount() === 0}
              >
                <Text style={cartStyles.checkoutButtonText}>
                  Mua hàng ({getSelectedCount()})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}