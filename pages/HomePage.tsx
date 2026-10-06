/**
 * LUNARA - PAGE: HOME PAGE (หน้าแรก)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js & React Pages]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Props]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * ดีไซน์ Minimal Luxury ตามสไตล์ของ LUNARA:
 * 1. Hero Section: ข้อความ "FIND YOUR LUCKY STONE / พลังแห่งหินธรรมชาติ ดีไซน์มินิมอลลักชัวรี"
 * 2. หมวดหมู่ตามเจตจำนง (Intentions & Sacred Energies): ความรัก, การเงิน, การงาน, การเรียน, โชคลาภ, การปกป้อง, ความสงบ, ความมั่นใจ
 * 3. Best Seller & New Arrivals: กำไลหินมงคลยอดนิยม
 * 4. Interactive Craft Banner: คราฟต์กำไลผสมหิน 24 ชนิด
 * 5. รีวิวจากลูกค้าจริง (Customer Reviews)
 * ============================================================================
 */

import React from 'react';
import { Sparkles, ArrowRight, Star, Heart, ShieldCheck, Gem, Compass, Package, Award } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CUSTOMER_REVIEWS } from '../data/reviews';

interface HomePageProps {
  products: Product[];
  onNavigate: (url: string) => void;
  onViewProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onNavigate,
  onViewProduct,
}) => {
  // กรองสินค้า Best Seller และ New Products
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newProducts = products.filter((p) => p.isNewArrival || !p.isBestSeller).slice(0, 4);

  const intentionCategories = [
    { name: 'ความรัก', type: 'Love', iconText: '♡', desc: 'เมตตามหานิยม เสน่ห์ดึงดูดใจ และความสัมพันธ์อบอุ่น' },
    { name: 'การเงิน', type: 'Money', iconText: '✦', desc: 'ดูดทรัพย์ เงินทองไหลเวียน การค้าขาย และปิดยอดธุรกิจ' },
    { name: 'การงาน', type: 'Work', iconText: '◈', desc: 'เลื่อนขั้น เลื่อนตำแหน่ง บารมี และความเป็นผู้นำ' },
    { name: 'การเรียน', type: 'Study', iconText: '❖', desc: 'สมาธิลึกซึ้ง ความจำแม่นยำ ปัญญา และความเข้าใจ' },
    { name: 'โชคลาภ', type: 'Luck', iconText: '☼', desc: 'โอกาสทางการเงิน สิ่งดีๆ และความราบรื่นในชีวิต' },
    { name: 'การปกป้อง', type: 'Protection', iconText: '▲', desc: 'ปัดเป่าพลังงานลบ ดูดซับคลื่น EMF และคุ้มครองภัย' },
    { name: 'ความสงบ', type: 'Calm', iconText: '◎', desc: 'คลายกังวล บำบัดจิตใจ คลายเครียด และนอนหลับสบาย' },
    { name: 'ความมั่นใจ', type: 'Confidence', iconText: '★', desc: 'กล้าแสดงออก มีความหวัง และเชื่อมั่นในศักยภาพ' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#F5EFEB] border-b border-[#EAE3DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Call to action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2.5 text-sm sm:text-base font-semibold uppercase tracking-[0.18em] text-[#7A584A]">
                <span>Natural Gemstones & Sacred Craft</span>
                <span aria-hidden="true">·</span>
                <span>Handmade in Bangkok</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2D2420] tracking-tight leading-[1.2]">
                  FIND YOUR LUCKY STONE <br />
                  <span className="italic font-normal text-[#7A584A]">
                    พลังแห่งหินธรรมชาติ ดีไซน์มินิมอลลักชัวรี
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg lg:text-xl text-[#5A483E] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                ค้นพบกำไลหินมงคลที่ร้อยเรียงตามเจตจำนงและความถี่พลังงานของคุณ คัดสรรหินธรรมชาติแท้เกรดพรีเมียมจากแหล่งกำเนิดทั่วโลก ผ่านพิธีชำระล้างพลังงานบริสุทธิ์เพื่อเคียงข้างทุกก้าวในชีวิต
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="px-8 py-4 bg-[#4E3C34] hover:bg-[#382B24] text-[#FAF8F5] text-sm sm:text-base font-semibold tracking-wider uppercase rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <span>SHOP NOW (สำรวจคอลเลกชัน)</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/craft')}
                  className="px-7 py-4 bg-[#FAF5F0] hover:bg-[#F2EBE1] text-[#7A584A] text-sm sm:text-base font-semibold tracking-wider rounded-2xl border border-[#D8C7B8] shadow-xs transition-colors flex items-center justify-center gap-2.5"
                >
                  <Gem className="w-5 h-5 text-[#C79F5E]" />
                  <span>คราฟต์กำไลผสมหิน (เลือกหินเอง)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/find')}
                  className="px-7 py-4 bg-white hover:bg-[#FAF8F5] text-[#5A453B] text-sm sm:text-base font-semibold tracking-wider rounded-2xl border border-[#EAE3DC] shadow-xs transition-colors flex items-center justify-center gap-2.5"
                >
                  <Compass className="w-5 h-5 text-[#C79F5E]" />
                  <span>ค้นหากำไลที่ใช่ (Match Quiz)</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#E4D8CC] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm sm:text-base text-[#7A6B62]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C79F5E]" />
                  <span className="font-medium">หินแท้ธรรมชาติ 100%</span>
                </div>
                <span aria-hidden="true" className="opacity-40">·</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#C79F5E]" />
                  <span className="font-medium">อะไหล่ทองแท้ 14K/18K</span>
                </div>
                <span aria-hidden="true" className="opacity-40">·</span>
                <div>
                  <span className="font-bold text-[#2D2420]">4.95 / 5.0</span> จาก 200+ รีวิว
                </div>
              </div>
            </div>

            {/* Right Column: Featured visual hero banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1611591475819-797de0d7269e?auto=format&fit=crop&w=1000&q=80"
                  alt="LUNARA Handcrafted Crystal Bracelets"
                  className="w-full aspect-4/3 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-4.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#EDE5DC] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#8C7063] font-medium uppercase tracking-wider">
                      Signature Edition
                    </div>
                    <div className="text-base sm:text-lg font-serif font-bold text-[#2D2420]">
                      The Harmonia Tri-Energy Series
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('/shop')}
                    className="text-xs sm:text-sm font-semibold text-[#7A584A] hover:underline"
                  >
                    ดูรายละเอียด →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BY INTENTIONS (เลือกเสริมพลังชีวิตตามเจตจำนง) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A584A]">
            Intentions & Sacred Energies
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2420]">
            เลือกเสริมพลังชีวิตตามเจตจำนงของคุณ
          </h2>
          <p className="text-base sm:text-lg text-[#6C5B52] leading-relaxed font-normal">
            คลิกที่เจตจำนงเพื่อกรองกำไลหินธรรมชาติที่ผ่านการจับคู่คลื่นความถี่เฉพาะด้าน
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {intentionCategories.map((item) => (
            <button
              key={item.name}
              onClick={() => onNavigate(`/shop?intention=${item.type}`)}
              className="group p-5 sm:p-6 bg-white rounded-2xl border border-[#EDE5DC] shadow-xs hover:shadow-md hover:border-[#D4AF37]/50 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#FAF5F0] text-[#7A584A] group-hover:bg-[#4E3C34] group-hover:text-white transition-colors flex items-center justify-center font-serif text-xl mb-3.5">
                  {item.iconText}
                </div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2420] group-hover:text-[#7A584A] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#7A6B62] mt-1.5 line-clamp-2 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[#7A584A] mt-3.5 block group-hover:translate-x-1 transition-transform">
                เลือกชมสินค้า →
              </span>
            </button>
          ))}
        </div>
      </section>
      {/* 3. BEST SELLER SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A584A]">
              POPULAR SELECTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2420] mt-1.5">
              BEST SELLER (กำไลรุ่นยอดนิยม)
            </h2>
            <p className="text-base sm:text-lg text-[#7A6B62] mt-1 font-normal">
              กำไลหินมงคลที่ผ่านการคัดสรรเกรดพรีเมียมและได้รับความไว้วางใจสูงสุด
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="text-sm sm:text-base font-semibold text-[#7A584A] hover:underline flex items-center gap-1.5"
          >
            <span>ดูสินค้าทั้งหมดใน Shop</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={onViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE CRAFT BRACELET CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#4E3C34] via-[#5C483E] to-[#7A584A] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-[#E0B8B2] text-xs sm:text-sm font-semibold">
              <Gem className="w-4 h-4 text-[#C79F5E]" />
              <span>CUSTOM MULTI-STONE CRAFTING</span>
            </div>
            <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              ## เลือกหินเองได้ ## <br />
              คราฟต์กำไลผสมหินมงคลเฉพาะบุคคล
            </h3>
            <p className="text-base sm:text-lg text-[#F3EBE6]/95 leading-relaxed font-normal">
              เลือกหิน 1 - 4 ชนิดจากชาร์ตหน้าร้าน (หินเจีย 3 มิล หรือ หินลูกปัด 8mm / 10mm) พร้อมจำลองเรียงเม็ดหินแบบเรียลไทม์ และคำนวณราคาทันที
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/craft')}
                className="px-8 py-4 rounded-2xl bg-[#C79F5E] hover:bg-[#B38B4B] text-white font-semibold text-base transition-all shadow-md active:scale-95 flex items-center gap-2.5"
              >
                <Sparkles className="w-5 h-5" />
                <span>เริ่มคราฟต์กำไลของคุณตอนนี้</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/stones')}
                className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-all border border-white/30"
              >
                ดูชาร์ตหิน 24 ชนิด
              </button>
            </div>
          </div>

          <div className="absolute -right-8 -bottom-8 w-64 h-64 opacity-15 pointer-events-none flex items-center justify-center">
            <Gem className="w-64 h-64 text-white" />
          </div>
        </div>
      </section>

      {/* 5. NEW PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C79F5E]">
              NEW ARRIVALS
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2420] mt-1.5">
              NEW PRODUCTS (สินค้ามาใหม่)
            </h2>
            <p className="text-base sm:text-lg text-[#7A6B62] mt-1 font-normal">
              กำไลหินมงคลดีไซน์ล่าสุด ร้อยเรียงด้วยความประณีต
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="text-sm sm:text-base font-semibold text-[#7A584A] hover:underline flex items-center gap-1.5"
          >
            <span>ดูทั้งหมดใน Shop</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetail={onViewProduct}
            />
          ))}
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7A584A]">
            Verified Client Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2420]">
            ความประทับใจจากลูกค้าตัวจริง
          </h2>
          <p className="text-base sm:text-lg text-[#7A6B62] font-normal">
            เสียงยืนยันความพึงพอใจในงานกำไลหินธรรมชาติและบริการจาก LUNARA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CUSTOMER_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="luxury-card rounded-2xl p-6 flex flex-col justify-between space-y-4 bg-white"
            >
              <div className="space-y-3">
                <div className="flex text-[#C79F5E] text-base">
                  {'★★★★★'}
                </div>
                <p className="text-sm sm:text-base text-[#3E2723] leading-relaxed italic font-normal">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3.5 border-t border-[#F2EBE1] flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-11 h-11 rounded-full object-cover border border-[#EAE3DC]"
                />
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm sm:text-base text-[#2D2420] truncate">
                    {rev.author}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#7A6B62] truncate">
                    สั่งซื้อ: {rev.productName.split('(')[0]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
