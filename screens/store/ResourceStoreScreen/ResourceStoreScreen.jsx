import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { Shadow } from "react-native-shadow-2";
import { useNavigation } from '@react-navigation/native';
import { resourceStoreStyles } from './ResourceStoreScreen.styles';
import Icon from "react-native-vector-icons/MaterialIcons";
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data for resources
const mockResources = [
  {
    id: '1',
    name: 'Brush Set Pro',
    category: 'Brushes',
    price: 50000,
    image: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=Brush',
    description: 'Bộ cọ vẽ chuyên nghiệp với nhiều kích thước',
    rating: 4.8,
    downloads: 1250,
    isPremium: true,
  },
  {
    id: '2',
    name: 'Color Palette Modern',
    category: 'Colors',
    price: 25000,
    image: 'https://via.placeholder.com/150x150/E74C3C/FFFFFF?text=Colors',
    description: 'Bảng màu hiện đại cho thiết kế',
    rating: 4.6,
    downloads: 890,
    isPremium: false,
  },
  {
    id: '3',
    name: 'Texture Pack',
    category: 'Textures',
    price: 75000,
    image: 'https://via.placeholder.com/150x150/27AE60/FFFFFF?text=Texture',
    description: 'Bộ texture đa dạng cho background',
    rating: 4.9,
    downloads: 2100,
    isPremium: true,
  },
  {
    id: '4',
    name: 'Icon Set Minimal',
    category: 'Icons',
    price: 30000,
    image: 'https://via.placeholder.com/150x150/F39C12/FFFFFF?text=Icons',
    description: 'Bộ icon tối giản cho sketchnote',
    rating: 4.7,
    downloads: 1560,
    isPremium: false,
  },
  {
    id: '5',
    name: 'Typography Kit',
    category: 'Fonts',
    price: 60000,
    image: 'https://via.placeholder.com/150x150/9B59B6/FFFFFF?text=Fonts',
    description: 'Bộ font chữ đẹp cho sketchnote',
    rating: 4.5,
    downloads: 980,
    isPremium: true,
  },
  {
    id: '6',
    name: 'Sticker Collection',
    category: 'Stickers',
    price: 40000,
    image: 'https://via.placeholder.com/150x150/1ABC9C/FFFFFF?text=Stickers',
    description: 'Bộ sticker dễ thương cho sketchnote',
    rating: 4.8,
    downloads: 1780,
    isPremium: false,
  },
];

const categories = ['All', 'Brushes', 'Colors', 'Textures', 'Icons', 'Fonts', 'Stickers'];

export default function ResourceStoreScreen() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState(mockResources);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    filterResources();
  }, [selectedCategory, searchQuery]);

  const filterResources = () => {
    let filtered = mockResources;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const addToCart = (resource) => {
    const existingItem = cart.find(item => item.id === resource.id);
    if (existingItem) {
      Alert.alert('Thông báo', 'Sản phẩm đã có trong giỏ hàng');
      return;
    }

    setCart([...cart, { ...resource, quantity: 1 }]);
    Alert.alert('Thành công', 'Đã thêm vào giỏ hàng');
  };

  const goToCart = () => {
    navigation.navigate('Cart');
  };

  const goToWallet = () => {
    navigation.navigate('Wallet');
  };

 const renderResourceItem = (item) => (
  <Shadow distance={8} startColor="#00000015" finalColor="#00000005" key={item.id}>
    <View style={resourceStoreStyles.resourceCardInner}>
      <Image source={{ uri: item.image }} style={resourceStoreStyles.resourceImage} />

      <View style={resourceStoreStyles.resourceInfo}>
        <Text style={resourceStoreStyles.resourceName} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={resourceStoreStyles.resourceDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={resourceStoreStyles.resourceMeta}>
          <Text style={resourceStoreStyles.rating}>⭐ {item.rating}</Text>
          <Text style={resourceStoreStyles.downloads}>⬇ {item.downloads}</Text>
        </View>

        <Text style={resourceStoreStyles.price}>{item.price.toLocaleString()} VNĐ</Text>

        <View style={resourceStoreStyles.actionButtons}>
          <Pressable
            style={[resourceStoreStyles.actionButton, { backgroundColor: "#3B82F6" }]}
            onPress={() => addToCart(item)}
          >
            <View style={resourceStoreStyles.actionButtonContent}>
              
              <Text style={resourceStoreStyles.actionButtonText}>Thêm vào giỏ</Text>
            </View>
          </Pressable>

          <Pressable
            style={[resourceStoreStyles.actionButton, { backgroundColor: "#10B981" }]}
            onPress={() => Alert.alert("Thanh toán", `Mua ${item.name} với giá ${item.price.toLocaleString()} VNĐ`)}
          >
            <View style={resourceStoreStyles.actionButtonContent}>
             
              <Text style={resourceStoreStyles.actionButtonText}>Mua ngay</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  </Shadow>
);



  return (
    <View style={resourceStoreStyles.container}>
      <View style={resourceStoreStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        <Text style={resourceStoreStyles.headerTitle}>Cửa hàng Resource</Text>
        <View style={resourceStoreStyles.headerActions}>
          <Pressable style={resourceStoreStyles.cartButton} onPress={goToCart}>
            <Icon name="shopping-cart" size={24} color="#6B7280" />
            {cart.length > 0 && (
              <View style={resourceStoreStyles.cartBadge}>
                <Text style={resourceStoreStyles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </Pressable>
         
        </View>
      </View>

      <ScrollView style={resourceStoreStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={resourceStoreStyles.searchContainer}>
          <TextInput
            style={resourceStoreStyles.searchInput}
            placeholder="Tìm kiếm resource..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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

        <View style={resourceStoreStyles.sectionContainer}>
          <Text style={resourceStoreStyles.sectionTitle}>Resources phổ biến</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={resourceStoreStyles.resourcesList}
          >
            {filteredResources.map(renderResourceItem)}
          </ScrollView>
        </View>
        <View style={resourceStoreStyles.sectionContainer}>
  <Text style={resourceStoreStyles.sectionTitle}>Resource mới ra mắt</Text>
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false} 
    style={resourceStoreStyles.resourcesList}
  >
    {mockResources
      .slice()
      .reverse()
      .map(renderResourceItem)}
  </ScrollView>
</View>

      </ScrollView>
    </View>
  );
}
