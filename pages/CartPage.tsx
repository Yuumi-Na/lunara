/**
 * LUNARA - PAGE: CART PAGE (หน้าตะกร้าสินค้า)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Cart Context Management)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * แสดงรายการสินค้าในตะกร้า:
 * - รูป, ชื่อ, ราคา, ขนาดข้อมือที่เลือก, จำนวน (+/-)
 * - ปุ่มลบออกจากตะกร้า
 * - ยอดรวมสินค้า (Subtotal)
 * - ค่าจัดส่ง (Shipping Fee - ฟรีเมื่อยอดครบ 500 บาท)
 * - ยอดชำระสุทธิ (Total)
 * - ปุ่ม Checkout นำทางไปยังหน้าชำระเงิน
 * ============================================================================
 */

import React from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CartItem } from '../components/CartItem';

interface CartPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onViewProduct }) => {
  const { cart, clearCart, subtotal, shippingFee, total, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 mx-auto rounded-full bg-[#F5EFE6] text-[#8C7063] flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-[#C6A24D]" />
        </div>
        <div className="space-y-2">
          <h2 className="font-brand text-2xl sm:text-3xl font-bold text-[#3E2723]">
            ตะกร้าสินค้าของคุณยังว่างอยู่
          </h2>
          <p className="text-sm sm:text-base text-[#8C7063] max-w-md mx-auto">
            คุณยังไม่มีกำไลหินมงคลในตะกร้า เริ่มต้นค้นหากำไลเส้นโปรดที่เหมาะกับคุณได้เลย
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-semibold text-base transition-all shadow-md"
          >
            ไปหน้าร้านค้า (Shop)
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/find')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#E8C5C8] text-[#4A3E3D] font-semibold text-base transition-all hover:bg-[#FAF7F2]"
          >
            ค้นหากำไลที่เหมาะกับคุณ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8C5C8]/40">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C5258]">
            <Sparkles className="w-4 h-4 text-[#C6A24D]" />
            <span>YOUR SHOPPING BAG</span>
          </div>
          <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723] mt-1">
            ตะกร้าสินค้า ({cartCount} รายการ)
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#9E8B84] hover:text-rose-600 flex items-center gap-1.5 self-start sm:self-auto font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ล้างตะกร้าทั้งหมด</span>
        </button>
      </div>

      {/* Main Cart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <CartItem
              key={`${item.product.id}-${item.selectedSize}`}
              item={item}
              onViewProduct={onViewProduct}
            />
          ))}

          {/* Continue Shopping Link */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C5258] hover:text-[#5C2E33]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>เลือกชมกำไลเส้นอื่นเพิ่มเติม</span>
            </button>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/50 shadow-md space-y-6 sticky top-28">
          <h3 className="font-serif text-2xl font-bold text-[#3E2723] pb-3 border-b border-[#F2EBE1]">
            สรุปยอดคำสั่งซื้อ
          </h3>

          <div className="space-y-3.5 text-base">
            <div className="flex justify-between text-[#5C4D4A]">
              <span>ยอดรวมสินค้า ({cartCount} เส้น):</span>
              <span className="font-semibold text-[#3E2723]">฿{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-[#5C4D4A]">
              <span>ค่าจัดส่ง:</span>
              <span>
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md text-sm">
                    ฟรีค่าจัดส่ง
                  </span>
                ) : (
                  <span className="font-semibold text-[#3E2723]">฿{shippingFee}</span>
                )}
              </span>
            </div>

            {subtotal < 500 && (
              <p className="text-sm text-[#C6A24D] bg-[#FAF4ED] p-3 rounded-xl border border-[#E8C5C8]/30">
                💡 ซื้อเพิ่มอีก <strong>฿{(500 - subtotal).toLocaleString()}</strong> เพื่อรับสิทธิ์จัดส่งฟรีทั่วประเทศ!
              </p>
            )}

            <div className="pt-3.5 border-t border-[#F2EBE1] flex justify-between items-baseline text-[#3E2723]">
              <span className="font-bold text-lg">ยอดชำระสุทธิ:</span>
              <span className="font-bold text-3xl text-[#8C5258]">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={() => onNavigate('/checkout')}
            className="w-full py-4.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-bold text-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 active:scale-95"
          >
            <span>ดำเนินการสั่งซื้อ (Checkout)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Guarantee Badges */}
          <div className="pt-2 text-center text-xs sm:text-sm text-[#8C7063] space-y-1">
            <p className="flex items-center justify-center gap-1.5 font-medium text-[#4A3E3D]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ชำระเงินปลอดภัย 100% พร้อมรับประกันสินค้า</span>
            </p>
            <p>แพ็กเกจกล่องหรูหราพร้อมการ์ดความหมายหินทุกเส้น</p>
          </div>
        </div>
      </div>
    </div>
  );
};
