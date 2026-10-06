/**
 * LUNARA - WISHLIST CONTEXT & STATE MANAGEMENT
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event]
 * - จัดการรายการสินค้าที่ถูกใจ (Wishlist)
 * - Event: กดหัวใจเพื่อเพิ่มหรือลบสินค้า
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface WishlistContextType {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'lunara_wishlist_items_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // [State] สินค้าใน Wishlist
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // [Event] สลับสถานะ Favorite (ถ้ามีให้เอาออก ถ้าไม่มีให้เพิ่ม)
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // ตรวจสอบว่าสินค้าอยู่ใน Wishlist หรือไม่
  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
