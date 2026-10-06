/**
 * LUNARA - COMPONENT: PRODUCT CARD
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Component & Props]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (onClick สำหรับ Cart, Wishlist, Navigate)]
 *
 * คุณสมบัติ:
 * - ดีไซน์ Minimal Luxury พร้อมมุมโค้งมนและเงามิติ
 * - ปุ่ม Add to Cart, ปุ่ม Wishlist, ปุ่มดูรายละเอียด
 * - แสดงชนิดหินมงคล ขนาดหินเจีย 3 มิล
 * - รองรับการแสดง Match Score (%) จากหน้า Find Your Bracelet
 * ============================================================================
 */

import React from 'react';
import { Heart, ShoppingBag, Eye, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onViewDetail: (productId: string) => void;
  matchScore?: number; // สำหรับหน้า Find Your Bracelet
  matchedReasons?: string[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetail,
  matchScore,
  matchedReasons,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);
  const [addedAnim, setAddedAnim] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, '16 ซม.');
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => onViewDetail(product.id)}
      className="group relative luxury-card rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5EFE6]/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {/* Match Score Badge (ถ้ามี) */}
          {matchScore !== undefined && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm flex items-center gap-1 ${
              matchScore >= 80
                ? 'bg-emerald-600 text-white'
                : matchScore >= 50
                ? 'bg-[#C6A24D] text-white'
                : 'bg-[#8C7063] text-white'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{matchScore}% Match</span>
            </div>
          )}

          {/* Best Seller / New Arrival */}
          {product.isBestSeller && (
            <span className="bg-[#8C5258] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#C6A24D] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
              สินค้าใหม่
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label="บันทึกรายการโปรด"
          className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/90 backdrop-blur-xs text-[#5C4D4A] hover:text-[#B33939] hover:bg-white shadow-xs transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavorite
                ? 'fill-[#D97D87] text-[#D97D87] scale-110'
                : 'text-[#8C7063]'
            }`}
          />
        </button>

        {/* Quick View Floating Hint */}
        <div className="absolute bottom-3 left-3 right-3 hidden group-hover:flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/95 backdrop-blur-xs text-xs sm:text-sm font-medium text-[#4A3E3D] shadow-sm transition-all">
          <Eye className="w-4 h-4 text-[#C6A24D]" />
          <span>คลิกเพื่อดูรายละเอียด</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Stone Name & Bead Size */}
          <div className="flex items-center justify-between text-sm sm:text-base text-[#7A584A] mb-2 font-medium">
            <span className="truncate max-w-[200px]" title={product.stone}>
              💎 {product.stone}
            </span>
            <span className="bg-[#FAF5F0] text-[#7A584A] px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap border border-[#EAE3DC]">
              {product.beadSize || 'หินเจีย 3 มิล'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[#2D2420] group-hover:text-[#7A584A] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Intention Tag Badges */}
          <div className="flex flex-wrap gap-2 mt-2.5">
            {product.intentions.slice(0, 2).map((int) => (
              <span
                key={int}
                className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-[#FAF5F0] text-[#5A453B] border border-[#EAE3DC] font-medium"
              >
                {int}
              </span>
            ))}
            <span className="text-xs sm:text-sm px-3 py-1 rounded-lg bg-white text-[#7A584A] border border-[#EAE3DC]">
              {product.style}
            </span>
          </div>

          {/* Matched reasons pills for Find Your Bracelet */}
          {matchedReasons && matchedReasons.length > 0 && (
            <div className="mt-2.5 text-xs sm:text-sm text-emerald-800 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200">
              <span className="font-bold">ตรงตามเงื่อนไข:</span> {matchedReasons.slice(0, 2).join(', ')}
            </div>
          )}
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-3.5 border-t border-[#F0EAE4] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#7A584A]">
                ฿{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-sm sm:text-base text-[#8C7063] line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm text-[#8C7063] block mt-0.5">
              คงเหลือ {product.stock} เส้น
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-2 transition-all shadow-xs ${
              addedAnim
                ? 'bg-emerald-700 text-white'
                : 'bg-[#4E3C34] hover:bg-[#382B24] text-white active:scale-95'
            }`}
            title="เพิ่มลงตะกร้า"
          >
            {addedAnim ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">ใส่แล้ว</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>+ ตะกร้า</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
