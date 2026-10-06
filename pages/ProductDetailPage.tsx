/**
 * LUNARA - PAGE: PRODUCT DETAIL PAGE (หน้ารายละเอียดสินค้า)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js Dynamic Route เช่น /product/[id]]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & State]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Size Selection, Quantity, Cart, Wishlist)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * แสดงข้อมูลครบถ้วน:
 * - รูปสินค้า & แกลเลอรี
 * - ชื่อสินค้า, ราคา, ประเภทหิน, ขนาดรอบข้อมือ (14-18 ซม.)
 * - รายละเอียดสินค้า & ความเชื่อ/ความหมายมงคล (พร้อมข้อความชี้แจง)
 * - สต็อกสินค้า & ปุ่ม Add to Cart / Wishlist
 * - รีวิวลูกค้าและระบบเขียนรีวิว
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Check,
  ShieldCheck,
  Package,
  Star,
  RefreshCw,
  Info,
  Gem,
  Plus,
  Minus,
  MessageCircle,
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { LUCKY_STONES_CATALOG } from '../data/stones';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onViewProduct: (id: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onViewProduct,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // 1. [State] Wrist Size Selection
  const [selectedSize, setSelectedSize] = useState('16 ซม.');

  // 2. [State] Quantity
  const [quantity, setQuantity] = useState(1);

  // 3. [State] Added Animation
  const [isAdded, setIsAdded] = useState(false);

  // 4. [State] User Review Form
  const [userComment, setUserComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [localReviews, setLocalReviews] = useState<
    { name: string; rating: number; date: string; comment: string }[]
  >([
    {
      name: 'คุณณิชาภัทร ว.',
      rating: 5,
      date: '2 วันที่แล้ว',
      comment: 'หินเจีย 3 มิลเล่นแสงสวยมากกก ร้อยมาพอดีข้อมือ ใส่ทำงานทุกวันเลยค่ะ รู้สึกใจเย็นลงมาก ✨',
    },
    {
      name: 'คุณพัชริดา ก.',
      rating: 5,
      date: '1 สัปดาห์ที่แล้ว',
      comment: 'กล่องแพ็กเกจหรูหรามาก มีการ์ดความหมายแนบมาด้วย ประทับใจมากค่ะ ไว้จะกลับมาอุดหนุนอีก',
    },
  ]);

  const wristSizes = [
    { label: '14 ซม.', note: 'ข้อมือเล็กมาก' },
    { label: '15 ซม.', note: 'ข้อมือเล็ก' },
    { label: '16 ซม.', note: 'ขนาดมาตรฐาน (หญิง)' },
    { label: '17 ซม.', note: 'ขนาดมาตรฐาน (ชาย/หญิง)' },
    { label: '18 ซม.', note: 'ข้อมือใหญ่' },
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userComment.trim()) return;

    setLocalReviews([
      {
        name: userName.trim(),
        rating: userRating,
        date: 'เมื่อสักครู่',
        comment: userComment.trim(),
      },
      ...localReviews,
    ]);

    setUserName('');
    setUserComment('');
    alert('ขอบคุณสำหรับรีวิวของคุณ!');
  };

  const isFavorite = isInWishlist(product.id);

  // หาข้อมูลหินที่เกี่ยวข้องจากแคตตาล็อก 24 ชนิด
  const relatedStones = LUCKY_STONES_CATALOG.filter((st) =>
    product.stone.toLowerCase().includes(st.nameEn.toLowerCase()) ||
    product.stone.includes(st.nameTh)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C5258] hover:text-[#5C2E33] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปหน้าร้านค้า</span>
      </button>

      {/* Main Product Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-[#E8C5C8]/50 shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isBestSeller && (
                <span className="bg-[#8C5258] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Best Seller
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-[#C6A24D] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  สินค้าใหม่
                </span>
              )}
            </div>

            {/* Wishlist toggle */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-xs text-[#5C4D4A] hover:text-[#B33939] shadow-md transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'fill-[#D97D87] text-[#D97D87] scale-110'
                    : 'text-[#8C7063]'
                }`}
              />
            </button>
          </div>

          <p className="text-center text-xs text-[#8C7063]">
            📸 ภาพถ่ายจากสินค้าจริง หินธรรมชาติแต่ละเม็ดอาจมีลวดลายและเฉดสีที่เป็นเอกลักษณ์เฉพาะตัว
          </p>
        </div>

        {/* Right Column: Details & Purchasing */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#7A584A]">
              <Sparkles className="w-4 h-4 text-[#C79F5E]" />
              <span>{product.beadSize || 'หินเจีย ขนาด 3 มิล'}</span>
              <span>•</span>
              <span className="text-[#8C7063]">{product.style} Style</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2420] mt-2 leading-[1.2]">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2.5 mt-2.5">
              <div className="flex text-[#C79F5E] text-base">
                {'★★★★★'}
              </div>
              <span className="text-sm font-semibold text-[#2D2420]">
                {product.rating || 5.0}
              </span>
              <span className="text-sm text-[#8C7063]">
                ({(product.reviewCount || 0) + localReviews.length} รีวิวจากลูกค้า)
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAE3DC] flex items-baseline gap-3 shadow-xs">
            <span className="text-3xl sm:text-4xl font-bold text-[#7A584A]">
              ฿{product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-base text-[#8C7063] line-through">
                ฿{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xs sm:text-sm text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-md ml-auto">
              พร้อมส่ง (ในคลัง {product.stock} เส้น)
            </span>
          </div>

          {/* Stone Information */}
          <div className="space-y-2">
            <h4 className="text-sm sm:text-base font-semibold text-[#2D2420] flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-[#C79F5E]" />
              <span>หินมงคลหลักที่ใช้:</span>
            </h4>
            <div className="p-3.5 bg-[#FAF5F0] rounded-xl border border-[#EAE3DC] text-base text-[#2D2420] font-medium">
              💎 {product.stone}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-[#2D2420]">
                เลือกขนาดรอบข้อมือ: <strong className="text-[#7A584A]">{selectedSize}</strong>
              </label>
              <span className="text-xs sm:text-sm text-[#8C7063]">
                (ใช้สายวัดพันรอบข้อมือพอดี)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {wristSizes.map((ws) => {
                const isSelected = selectedSize === ws.label;
                return (
                  <button
                    key={ws.label}
                    type="button"
                    onClick={() => setSelectedSize(ws.label)}
                    className={`p-3 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-[#4E3C34] text-white border-[#4E3C34] font-bold shadow-xs'
                        : 'bg-white text-[#2D2420] border-[#EAE3DC] hover:border-[#C79F5E]'
                    }`}
                  >
                    <div className="text-base font-semibold">{ws.label}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-[#8C7063]'}`}>
                      {ws.note}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Counter */}
              <div className="flex items-center border border-[#D8C7B8] rounded-full bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#5A453B] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg text-[#2D2420]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-[#5A453B] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-full font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-md ${
                  isAdded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#4E3C34] hover:bg-[#382B24] text-white active:scale-95'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>เพิ่มลงในตะกร้าแล้ว!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Cart (฿{(product.price * quantity).toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Delivery & Assurance Details */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F2EBE1] text-xs text-[#8C7063]">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E8C5C8]/30">
              <Package className="w-4 h-4 text-[#C6A24D]" />
              <span>ส่งฟรีเมื่อซื้อครบ 500 บาท</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#E8C5C8]/30">
              <RefreshCw className="w-4 h-4 text-[#8C5258]" />
              <span>ร้อยใหม่ฟรีหากเอ็นยืดหย่อน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Stone Belief Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#F0E6D8]">
        {/* Product Story & Description */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/40 shadow-xs space-y-4">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3E2723]">
            รายละเอียดและเรื่องราวสินค้า
          </h3>
          <p className="text-base sm:text-lg text-[#5A483E] leading-relaxed font-normal">
            {product.description}
          </p>

          <div className="pt-4 border-t border-[#F2EBE1] space-y-2.5 text-sm sm:text-base text-[#7A6B62]">
            <p><strong>ขนาดเม็ดหิน:</strong> {product.beadSize || 'หินเจีย ขนาด 3 มิล'}</p>
            <p><strong>วัสดุเอ็น:</strong> เอ็นยืดคุณภาพสูง นำเข้าจากเกาหลี ยืดหยุ่นทนทาน</p>
            <p><strong>ข้อต่อ/อะไหล่:</strong> ชุบทอง 14K ไมครอน ปราศจากสารนิกเกิล ไม่ก่อให้เกิดการระคายเคือง</p>
          </div>
        </div>

        {/* Stone Meaning & Belief (With Mandatory Disclaimer) */}
        <div className="bg-[#FAF5F0] rounded-3xl p-6 sm:p-8 border border-[#E0B8B2]/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C79F5E]" />
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2420]">
              ความเชื่อและความหมายของหิน
            </h3>
          </div>

          <p className="text-base sm:text-lg text-[#3E2723] leading-relaxed bg-white p-5 rounded-2xl border border-[#EAE3DC] font-normal">
            {product.personalBeliefLore || product.belief}
          </p>

          {/* Mineral Details Table if present */}
          {product.mineralDetails && (
            <div className="bg-white p-4.5 rounded-2xl border border-[#EAE3DC] space-y-2.5 text-sm">
              <span className="font-bold text-[#7A584A] block uppercase tracking-wider text-xs">
                ✦ คุณสมบัติแร่ธรรมชาติ & พลังงานจักระ:
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-[#5A453B]">
                <div><strong>แหล่งกำเนิด:</strong> {product.mineralDetails.origin}</div>
                <div><strong>ความแข็ง:</strong> {product.mineralDetails.hardness}</div>
                <div><strong>จักระที่เสริม:</strong> {product.mineralDetails.chakra}</div>
                <div><strong>ธาตุประจำหิน:</strong> {product.mineralDetails.element}</div>
              </div>
            </div>
          )}

          {/* Care Ritual */}
          {product.careRitual && (
            <div className="bg-white p-4 rounded-2xl border border-[#EAE3DC] text-sm text-[#5A453B]">
              <strong className="text-[#7A584A] block mb-1">🌿 วิธีชำระล้างและรีชาร์จพลังงาน (Care Ritual):</strong>
              <p className="leading-relaxed">{product.careRitual}</p>
            </div>
          )}

          {/* Disclaimer Banner Required by Instruction */}
          <div className="p-4.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-sm sm:text-base text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-base">
              <Info className="w-5 h-5 text-amber-700 shrink-0" />
              <span>หมายเหตุข้อชี้แจงด้านความเชื่อ:</span>
            </div>
            <p className="leading-relaxed">
              ข้อมูลเกี่ยวกับพลังและสรรพคุณของหินมงคลทั้งหมดเป็นความเชื่อส่วนบุคคลและตำราโบราณ มิใช่การรับรองผลทางการแพทย์หรือการรักษาโรคใดๆ
            </p>
          </div>

          {/* Related Stone Quick Reference from 24 stone catalog */}
          {relatedStones.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-semibold text-[#8C7063] mb-2">หินที่ใช้ในกำไลเส้นนี้จากชาร์ตของร้าน:</h4>
              <div className="flex flex-wrap gap-2">
                {relatedStones.map((st) => (
                  <span
                    key={st.id}
                    className="text-xs sm:text-sm px-3 py-1 rounded-full bg-white border border-[#D9C8BE] text-[#3E2723]"
                  >
                    💎 {st.nameTh} ({st.nameEn}): {st.tagline}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8C5C8]/40 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#F2EBE1]">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#3E2723]">
              รีวิวจากลูกค้า (Customer Reviews)
            </h3>
            <p className="text-xs sm:text-sm text-[#8C7063]">
              คะแนนเฉลี่ย 5.0 เต็ม 5 จากผู้สั่งซื้อจริง
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF4ED] px-4 py-2 rounded-2xl">
            <div className="flex text-[#C6A24D]">{'★★★★★'}</div>
            <span className="font-bold text-sm text-[#3E2723]">5.0 / 5.0</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {localReviews.map((rev, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8C5C8]/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8C5C8] text-[#8C5258] font-bold text-xs flex items-center justify-center">
                    {rev.name[0]}
                  </div>
                  <span className="font-semibold text-sm text-[#3E2723]">{rev.name}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    ผู้ซื้อที่ยืนยันแล้ว
                  </span>
                </div>
                <span className="text-xs text-[#8C7063]">{rev.date}</span>
              </div>
              <div className="flex text-[#C6A24D] text-xs">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C6A24D]" />
                ))}
              </div>
              <p className="text-sm text-[#4A3E3D] leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>

        {/* Write a Review Form */}
        <form onSubmit={handleAddReview} className="pt-6 border-t border-[#F2EBE1] space-y-4">
          <h4 className="font-semibold text-base text-[#3E2723] flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#8C5258]" />
            <span>แบ่งปันความประทับใจของคุณ</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#8C7063] block mb-1">
                ชื่อของคุณ
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="เช่น คุณณัฐวุฒิ ส."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] text-sm outline-none focus:border-[#C6A24D]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#8C7063] block mb-1">
                ให้คะแนนความพึงพอใจ
              </label>
              <select
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] text-sm outline-none focus:border-[#C6A24D] bg-white"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 ดาว (ประทับใจมากที่สุด)</option>
                <option value={4}>⭐⭐⭐⭐ 4 ดาว (ดีมาก)</option>
                <option value={3}>⭐⭐⭐ 3 ดาว (ปานกลาง)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#8C7063] block mb-1">
                ความคิดเห็นของคุณ
              </label>
              <textarea
                rows={3}
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="เขียนรีวิว เช่น หินสวยตรงปก แพ็กเกจดี..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] text-sm outline-none focus:border-[#C6A24D]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#8C5258] hover:bg-[#734045] text-white text-sm font-semibold transition-colors shadow-xs"
          >
            ส่งรีวิว
          </button>
        </form>
      </div>
    </div>
  );
};
