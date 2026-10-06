/**
 * LUNARA - COMPONENT: CART DRAWER (SLIDE-OVER QUICK CART)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * สไลด์เมนูตะกร้าสินค้าด่วน:
 * - เปิด-ปิดเมื่อผู้ใช้กดไอคอนตะกร้าบน Navbar หรือเมื่อเพิ่มสินค้า
 * - แสดงรายการสินค้า ยอดรวม แถบความคืบหน้าจัดส่งฟรี (ครบ ฿500)
 * - ปุ่มดำเนินการสั่งซื้อไปยังหน้า /checkout หรือเปิดดูหน้าตะกร้าเต็ม /cart
 * ============================================================================
 */

import React from 'react';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  onViewProduct?: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onViewProduct,
}) => {
  const { cart, cartCount, subtotal, shippingFee, total, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  const freeShippingThreshold = 500;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col justify-between border-l border-[#EAE3DC] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white border-b border-[#EAE3DC] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#FAF5F0] text-[#7A584A]">
                <ShoppingBag className="w-5 h-5 text-[#C79F5E]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D2420]">
                  ตะกร้าสินค้าของคุณ
                </h3>
                <span className="text-sm text-[#8C7063]">
                  {cartCount} รายการในตะกร้า
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#8C7063] hover:text-[#2D2420] hover:bg-[#FAF5F0] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 sm:px-6 py-3.5 bg-[#FAF5F0] border-b border-[#EAE3DC] text-sm text-[#5A453B] space-y-1.5">
            <div className="flex justify-between items-center font-medium">
              <span>
                {remainingForFree === 0 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C79F5E]" />
                    ยินดีด้วย! คุณได้รับสิทธิ์จัดส่งฟรีแล้ว
                  </span>
                ) : (
                  <span>
                    ซื้อเพิ่มอีก <strong>฿{remainingForFree.toLocaleString()}</strong> เพื่อส่งฟรี
                  </span>
                )}
              </span>
              <span className="font-bold text-[#7A584A]">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-[#EAE3DC] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C79F5E] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                <div className="w-16 h-16 rounded-full bg-[#FAF5F0] text-[#8C7063] flex items-center justify-center">
                  <ShoppingBag className="w-7 h-7 text-[#C79F5E]" />
                </div>
                <h4 className="font-serif text-base font-bold text-[#2D2420]">
                  ตะกร้าของคุณยังว่างอยู่
                </h4>
                <p className="text-xs text-[#8C7063] max-w-[200px]">
                  เลือกชมกำไลหินมงคลหรือคราฟต์กำไลผสมหินที่คุณชอบได้เลย
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/shop');
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#4E3C34] text-white text-xs font-semibold shadow-xs"
                >
                  เลือกชมสินค้า
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="p-3.5 bg-white rounded-2xl border border-[#EAE3DC] shadow-xs flex items-center gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    onClick={() => {
                      onClose();
                      onViewProduct?.(item.product.id);
                    }}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-[#EAE3DC] shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <h5
                      onClick={() => {
                        onClose();
                        onViewProduct?.(item.product.id);
                      }}
                      className="font-semibold text-sm sm:text-base text-[#2D2420] truncate cursor-pointer hover:text-[#7A584A]"
                    >
                      {item.product.name}
                    </h5>
                    <div className="text-xs sm:text-sm text-[#8C7063]">
                      รอบข้อมือ: {item.selectedSize}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#7A584A] mt-1">
                      ฿{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity and Delete */}
                  <div className="flex flex-col items-end justify-between h-16">
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="text-[#8C7063] hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center border border-[#D8C7B8] rounded-full bg-[#FAF8F5] p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, -1)}
                        className="w-6 h-6 flex items-center justify-center text-[#5A453B]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#5A453B]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 sm:p-6 bg-white border-t border-[#EAE3DC] space-y-4">
              <div className="space-y-2 text-sm sm:text-base text-[#5A453B]">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า:</span>
                  <span className="font-semibold text-[#2D2420]">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">ฟรีค่าจัดส่ง</span>
                    ) : (
                      <span>฿{shippingFee}</span>
                    )}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-[#F0EAE4] flex justify-between items-baseline text-[#2D2420]">
                  <span className="font-bold text-base">ยอดชำระสุทธิ:</span>
                  <span className="font-bold text-2xl text-[#7A584A]">
                    ฿{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/cart');
                  }}
                  className="py-3.5 px-4 rounded-xl border border-[#D8C7B8] hover:bg-[#FAF8F5] text-sm font-semibold text-[#4E3C34] text-center"
                >
                  ดูหน้าตะกร้าเต็ม
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/checkout');
                  }}
                  className="py-3.5 px-4 rounded-xl bg-[#4E3C34] hover:bg-[#382B24] text-white text-sm font-semibold text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <span>ชำระเงิน</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-center text-[#8C7063] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>รับประกันหินธรรมชาติแท้ 100% พร้อมกล่องพรีเมียม</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
