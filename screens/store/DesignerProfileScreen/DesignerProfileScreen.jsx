import React, { useState, useEffect, useMemo } from "react";
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
import { orderService } from "../../../service/orderService";
import { authService } from "../../../service/authService";
import { useCart } from "../../../context/CartContext";
import { getStyles } from "./DesignerProfileScreen.styles";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import SidebarToggleButton from "../../../components/navigation/SidebarToggleButton";
import { useTheme } from "../../../context/ThemeContext";

const FALLBACK_IMAGES = [
    "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/z1tfsj8jpe6fxsvhvfcx.avif",
    "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185265/lppr96hp3twiesnvjudi.avif",
    "https://res.cloudinary.com/dk3yac2ie/image/upload/v1765185200/wtwko9tms2mmit7kmntt.jpg",
];

const ProductCard = ({ item, onPress, onAddToCart, onBuyNow, index = 0, styles }) => {
    const [imageUri, setImageUri] = useState(
        item.images?.[0]?.imageUrl ||
        item.images?.[0]?.url ||
        FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
    );

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
    };

    const renderStars = (rating = 0) => {
        const filled = rating ? Math.round(Math.max(0, Math.min(rating, 5))) : 0;
        return (
            <View style={styles.ratingContainer}>
                {[...Array(5)].map((_, i) => (
                    <Icon
                        key={i}
                        name={i < filled ? "star" : "star-border"}
                        size={14}
                        color={i < filled ? styles.starFilled : styles.starEmpty}
                    />
                ))}
            </View>
        );
    };

    return (
        <Pressable onPress={onPress} style={styles.productCard}>
            <View style={styles.productImageContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() => {
                        requestAnimationFrame(() => {
                            setImageUri(FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]);
                        });
                    }}
                />

                {/* Type Badge */}
                <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type || "PREMIUM"}</Text>
                </View>

                {/* Owner Badge */}
                {item?.isOwner && (
                    <View style={styles.ownerBadge}>
                        <Icon name="verified" size={12} color="#10B981" />
                        <Text style={styles.ownerBadgeText}>YOURS</Text>
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name || "Premium Resource"}
                </Text>

                <Text style={styles.productDescription} numberOfLines={1}>
                    {item.description || "High-quality resource"}
                </Text>

                {renderStars(item.avgResourceRating)}

                <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>
                        {item.price?.toLocaleString()} ₫
                    </Text>

                    {!item?.isOwner && (
                        <Pressable
                            style={styles.addButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAddToCart();
                            }}
                        >
                            <Icon name="add-shopping-cart" size={16} color="#fff" />
                        </Pressable>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

export default function DesignerProfileScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { designerId } = route.params;
    const { addToCart, cart } = useCart();

    const [designer, setDesigner] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { theme } = useTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);

    useEffect(() => {
        const fetchDesignerData = async () => {
            try {
                setLoading(true);

                // Fetch designer info
                const designerData = await authService.getUserById(designerId);
                setDesigner(designerData);

                // Fetch designer's products
                const productsData = await orderService.getTemplatesByDesigner(
                    designerId,
                    0,
                    20
                );
                setProducts(productsData?.content || []);
            } catch (error) {
                console.warn("Error fetching designer data:", error);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: error.message || "Failed to load designer profile",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDesignerData();
    }, [designerId]);

    const handleAddToCart = (product) => {
        if (product?.isOwner) {
            Toast.show({
                type: "info",
                text1: "This is your resource",
            });
            return;
        }

        const inCart = cart.some((i) => i.id === product.resourceTemplateId);
        if (inCart) {
            Toast.show({
                type: "info",
                text1: "Already in cart",
            });
            return;
        }

        addToCart({
            id: product.resourceTemplateId,
            name: product.name,
            price: product.price,
            image:
                product.images?.[0]?.imageUrl ||
                product.images?.[0]?.url ||
                FALLBACK_IMAGES[0],
            type: product.type,
        });

        Toast.show({
            type: "success",
            text1: "Added to cart",
        });
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <LottieView
                    source={loadingAnimation}
                    autoPlay
                    loop
                    style={{ width: 280, height: 280 }}
                />
            </View>
        );
    }

    if (!designer) {
        return (
            <View style={styles.centerContainer}>
                <Icon name="person-off" size={80} color={styles.emptyIconColor} />
                <Text style={styles.emptyText}>Designer not found</Text>
            </View>
        );
    }

    const designerName = `${designer.firstName || ""} ${designer.lastName || ""
        }`.trim() || "Designer";

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerGradient} />
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <SidebarToggleButton iconSize={28} iconColor={styles.iconColor} />
                        <Text style={styles.headerTitle}>Designer Profile</Text>
                    </View>
                    <Pressable
                        style={styles.cartButton}
                        onPress={() => navigation.navigate("Cart")}
                    >
                        <Icon name="shopping-cart" size={24} color={styles.cartIconColor} />
                        {cart.length > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{cart.length}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Designer Info Section */}
                <View style={styles.designerInfoSection}>
                    <View style={styles.designerHeader}>
                        <Image
                            source={{
                                uri:
                                    designer.avatarUrl ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        designerName
                                    )}&background=4F46E5&color=fff&size=200`,
                            }}
                            style={styles.designerAvatar}
                        />
                        <View style={styles.designerDetails}>
                            <Text style={styles.designerName}>{designerName}</Text>
                            <Text style={styles.designerEmail}>{designer.email}</Text>

                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Icon name="inventory" size={20} color={styles.statIconColor} />
                                    <Text style={styles.statValue}>{products.length}</Text>
                                    <Text style={styles.statLabel}>Products</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Products Section */}
                <View style={styles.productsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Designer's Products</Text>
                        <Text style={styles.productCount}>{products.length} items</Text>
                    </View>

                    {products.length > 0 ? (
                        <View style={styles.productsGrid}>
                            {products.map((item, index) => (
                                <ProductCard
                                    key={item.resourceTemplateId || index}
                                    item={item}
                                    index={index}
                                    styles={styles}
                                    onPress={() =>
                                        navigation.navigate("ResourceDetail", {
                                            resourceId: item.resourceTemplateId,
                                        })
                                    }
                                    onAddToCart={() => handleAddToCart(item)}
                                />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyProducts}>
                            <Icon name="inventory-2" size={64} color={styles.emptyIconColor} />
                            <Text style={styles.emptyProductsText}>
                                No products available yet
                            </Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}
