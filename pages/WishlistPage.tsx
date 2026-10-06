/**
 * LUNARA - PAGE: WISHLIST PAGE (หน้ารายการที่ชอบ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Wishlist Context)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * คุณสมบัติ:
 * - แสดงรายการสินค้าทั้งหมดที่ผู้ใช้กดถูกใจไว้ (Heart Icon)
 * - สามารถลบสินค้าออกจาก Wishlist ได้ทันที
 * - สามารถกดเพิ่มลงตะกร้า (Add to Cart) ได้โดยตรงจากหน้านี้
 * ============================================================================
 */

import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';

interface WishlistPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onNavigate,
  onViewProduct,
}) => {
  const { wishlist, wishlistCount, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-[#FDF2F4] text-[#8C5258] flex items-center justify-center">
          <Heart className="w-10 h-10 text-[#D97D87]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-brand text-2xl sm:text-3xl font-bold text-[#3E2723]">
            ยังไม่มีสินค้าในรายการที่ชอบ
          </h2>
          <p className="text-sm sm:text-base text-[#8C7063] max-w-md mx-auto">
            กดไอคอนรูปหัวใจที่สินค้าที่คุณสนใจ เพื่อบันทึกไว้ดูในภายหลังได้สะดวก
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="px-8 py-3.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-semibold text-base transition-all shadow-md"
          >
            เลือกชมกำไลหินมงคลใน Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C5C8]/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C5258]">
            <Sparkles className="w-4 h-4 text-[#C6A24D]" />
            <span>MY FAVORITES</span>
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723] mt-1">
            รายการที่ชอบ (Wishlist)
          </h1>
          <p className="text-sm text-[#8C7063]">
            คุณได้บันทึกกำไลหินมงคลไว้ทั้งหมด {wishlistCount} รายการ
          </p>
        </div>

        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs sm:text-sm font-semibold text-[#8C5258] hover:text-[#5C2E33] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>ค้นหาเพิ่มเติมใน Shop</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetail={onViewProduct}
          />
        ))}
      </div>
    </div>
  );
};
