import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 🔹 Load cart từ AsyncStorage khi app khởi động
  useEffect(() => {
    (async () => {
      try {
        const storedCart = await AsyncStorage.getItem("cart");
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } catch (error) {
        console.warn("❌ Error loading cart:", error);
      }
    })();
  }, []);

  // 🔹 Lưu cart mỗi khi có thay đổi
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        console.warn("❌ Error saving cart:", error);
      }
    })();
  }, [cart]);

  // ✅ Thêm vào giỏ - Lưu đầy đủ thông tin
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((p) => p.id === item.id);

      if (existing) {
        return prevCart.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }

      // Chuẩn hóa thông tin designer
      const designerData = item.designer
        ? {
          name:
            item.designer.name ||
            `${item.designer.firstName || ""} ${item.designer.lastName || ""
              }`.trim(),
          email: item.designer.email || "",
          avatarUrl: item.designer.avatarUrl || null,
        }
        : null;

      const newItem = {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: item.image || "",
        type: item.type || "OTHER",
        quantity: 1,
        designer: designerData,
        releaseDate: item.releaseDate || null,
        isActive: item.isActive !== undefined ? item.isActive : true,
      };

      return [...prevCart, newItem];
    });
  };

  // ✅ Xóa sản phẩm khỏi giỏ
  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const filtered = prevCart.filter((p) => p.id !== id);

      return filtered;
    });
  };

  // ✅ Cập nhật số lượng
  const updateQuantity = (id, delta) => {
    setCart(
      (prevCart) =>
        prevCart
          .map((p) => {
            if (p.id === id) {
              const newQuantity = p.quantity + delta;
              // Nếu số lượng = 0, xóa khỏi giỏ
              if (newQuantity <= 0) {
                return null;
              }

              return { ...p, quantity: newQuantity };
            }
            return p;
          })
          .filter(Boolean) // Loại bỏ items có giá trị null
    );
  };

  // ✅ Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
  };

  // ✅ Tính tổng giá trị giỏ hàng
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ✅ Đếm tổng số sản phẩm (theo quantity)
  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
