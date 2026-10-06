/**
 * LUNARA - COMPONENT: CART ITEM
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Component]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (ปุ่ม +/- จำนวน และปุ่มลบ)]
 * ============================================================================
 */

import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';

interface CartItemProps {
  item: CartItemType;
  onViewProduct?: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onViewProduct }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity, selectedSize } = item;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-4 sm:px-6 bg-white rounded-2xl border border-[#E8C5C8]/40 shadow-xs hover:border-[#C6A24D]/30 transition-all">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div
          onClick={() => onViewProduct?.(product.id)}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#F5EFE6] shrink-0 cursor-pointer border border-[#E8C5C8]/30 group"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs sm:text-sm font-medium text-[#8C7063] block">
            💎 {product.stone}
          </span>
          <h4
            onClick={() => onViewProduct?.(product.id)}
            className="font-semibold text-base sm:text-lg lg:text-xl text-[#3E2723] hover:text-[#8C5258] cursor-pointer transition-colors line-clamp-1"
          >
            {product.name}
          </h4>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8C7063]">
            <span className="bg-[#FAF4ED] px-2.5 py-0.5 rounded-md border border-[#E8C5C8]/30 font-medium">
              ขนาดรอบข้อมือ: <strong className="text-[#3E2723]">{selectedSize}</strong>
            </span>
            <span>{product.beadSize || 'หินเจีย 3 มิล'}</span>
          </div>
          <div className="sm:hidden text-base font-bold text-[#8C5258] pt-1">
            ฿{product.price.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F2EBE1]">
        {/* Unit Price on desktop */}
        <div className="hidden sm:block text-right">
          <div className="text-base font-bold text-[#8C5258]">
            ฿{product.price.toLocaleString()}
          </div>
          <span className="text-xs text-[#8C7063]">/ เส้น</span>
        </div>

        {/* Counter Button */}
        <div className="flex items-center border border-[#D9C8BE] rounded-full bg-[#FAF7F2] p-1">
          <button
            type="button"
            onClick={() => updateQuantity(product.id, selectedSize, -1)}
            disabled={quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5C4D4A] hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="ลดจำนวน"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-sm font-semibold text-[#3E2723]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(product.id, selectedSize, 1)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#5C4D4A] hover:bg-white transition-colors"
            title="เพิ่มจำนวน"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total for item */}
        <div className="text-right min-w-[70px]">
          <span className="text-xs text-[#8C7063] sm:hidden block">รวม</span>
          <span className="text-base sm:text-lg font-bold text-[#3E2723]">
            ฿{(product.price * quantity).toLocaleString()}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeFromCart(product.id, selectedSize)}
          className="p-2 text-[#9E8B84] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
          title="ลบออกจากตะกร้า"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
