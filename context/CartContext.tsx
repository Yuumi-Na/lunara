/**
 * LUNARA - CART CONTEXT & STATE MANAGEMENT
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (useState, useEffect, Context)]
 * - จัดการรายการสินค้าในตะกร้า (Cart Items)
 * - คำนวณราคารวม (Subtotal, Shipping, Total)
 * - Event: เพิ่มสินค้า, ลดจำนวน, ลบออกจากตะกร้า
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  updateQuantity: (productId: string, selectedSize: string, delta: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'lunara_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. [State] รายการสินค้าในตะกร้า
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    return [];
  });

  // บันทึกลง LocalStorage ทุกครั้งที่ cart เปลี่ยนแปลง (useEffect)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  // 2. [Event & Action] ฟังก์ชันเพิ่มสินค้าลงตะกร้า
  const addToCart = (product: Product, quantity: number = 1, selectedSize: string = '16 ซม.') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        // หากมีสินค้านี้และไซส์นี้อยู่แล้ว ให้เพิ่มจำนวน
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        // เพิ่มเป็นรายการใหม่
        return [...prev, { product, quantity, selectedSize }];
      }
    });
  };

  // 3. [Event & Action] ฟังก์ชันปรับจำนวนสินค้า (+1 หรือ -1)
  const updateQuantity = (productId: string, selectedSize: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === selectedSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // 4. [Event & Action] ฟังก์ชันลบสินค้าออกจากตะกร้า
  const removeFromCart = (productId: string, selectedSize: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  // 5. [Event & Action] ล้างตะกร้าเมื่อสั่งซื้อเสร็จ
  const clearCart = () => {
    setCart([]);
  };

  // 6. [Calculations] คำนวณจำนวนชิ้นและยอดรวม
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  // ค่าจัดส่ง: ฟรีค่าจัดส่งเมื่อสั่งซื้อครบ 500 บาทขึ้นไป (หากไม่ถึง ค่าส่ง 45 บาท)
  const shippingFee = subtotal > 0 && subtotal >= 500 ? 0 : subtotal > 0 ? 45 : 0;
  const total = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
