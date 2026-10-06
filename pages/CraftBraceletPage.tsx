/**
 * LUNARA - PAGE: CRAFT YOUR BRACELET (คราฟต์กำไลผสมหิน / เลือกหินเองได้)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Interactive Customizer)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Algorithms & Dynamic Price Calculation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * ฟีเจอร์เด่นจากชาร์ตหน้าร้าน ("## เลือกหินเองได้ ## หินเจีย ขนาด 3 มิล"):
 * 1. เลือกรวมหินได้ 1 - 4 ชนิดจากหินมงคลแท้ 24 ชนิดของทางร้าน
 * 2. มีตัวจำลองกำไลข้อมือแบบเรียลไทม์ (Live Bracelet Bead Preview)
 * 3. เลือกขนาดเม็ดหิน (หินเจีย 3 มิล, 8mm, 10mm) และขนาดรอบข้อมือ (14 - 18 ซม.)
 * 4. เลือกอะไหล่คั่นทองคำแท้ (14K Gold Charm, 18K White Gold, Rose Gold)
 * 5. คำนวณราคาและพลังงานรวมอัตโนมัติ แล้วเพิ่มลงในตะกร้าสินค้าได้ทันที
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Check, ShoppingBag, Info, RefreshCw, Gem, HelpCircle, ArrowRight } from 'lucide-react';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface CraftBraceletPageProps {
  onNavigate: (url: string) => void;
}

export const CraftBraceletPage: React.FC<CraftBraceletPageProps> = ({ onNavigate }) => {
  const { addToCart } = useCart();

  // 1. [State] Selected Stones (ค่าเริ่มต้นเลือก 3 ชนิด)
  const [selectedStoneIds, setSelectedStoneIds] = useState<string[]>([
    'rose-quartz',
    'citrine',
    'amethyst',
  ]);

  // 2. [State] Bead Size
  const [beadSize, setBeadSize] = useState<string>('หินเจีย ขนาด 3 มิล');

  // 3. [State] Wrist Size
  const [wristSize, setWristSize] = useState<string>('16.0 cm');

  // 4. [State] Charm Accent
  const [charm, setCharm] = useState<string>('14K Gold Charm');

  // 5. [State] Added Animation
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Toggle selection
  const handleToggleStone = (stoneId: string) => {
    if (selectedStoneIds.includes(stoneId)) {
      if (selectedStoneIds.length <= 1) {
        alert('กำไลคราฟต์ควรเลือกหินอย่างน้อย 1 ชนิดค่ะ');
        return;
      }
      setSelectedStoneIds((prev) => prev.filter((id) => id !== stoneId));
    } else {
      if (selectedStoneIds.length >= 4) {
        alert('สามารถเลือกผสมได้สูงสุด 4 ชนิดใน 1 เส้น เพื่อความสมดุลของคลื่นพลังงานค่ะ');
        return;
      }
      setSelectedStoneIds((prev) => [...prev, stoneId]);
    }
  };

  // ดึงรายละเอียดหินที่ถูกเลือก
  const activeStones = LUCKY_STONES_CATALOG.filter((s) => selectedStoneIds.includes(s.id));

  // รวม Intentions ทั้งหมด
  const combinedIntentions = Array.from(
    new Set(activeStones.flatMap((s) => s.category))
  );

  // คำนวณราคาตามขนาดและจำนวนหิน
  const is3mm = beadSize.includes('3 มิล');
  const basePrice = is3mm ? 490 : 1890;
  const extraPricePerStone = is3mm ? 90 : 300;
  const totalPrice = basePrice + Math.max(0, activeStones.length - 1) * extraPricePerStone;

  // เพิ่มลงในตะกร้า
  const handleAddCustomToCart = () => {
    const stoneNames = activeStones.map((s) => `${s.nameTh} (${s.nameEn})`).join(' + ');
    const customProduct: Product = {
      id: `custom-craft-${Date.now()}`,
      name: `กำไลคราฟต์ผสมหิน "${activeStones.map((s) => s.nameTh).join(' & ')}"`,
      englishName: `Custom Multi-Stone Bracelet (${activeStones.map((s) => s.nameEn).join(' & ')})`,
      stone: stoneNames,
      stoneType: activeStones.map((s) => s.nameEn).join(' & '),
      tagline: `กำไลรวมพลังงานพิเศษ เสริม ${combinedIntentions.join(' · ')} ในเส้นเดียว`,
      price: totalPrice,
      originalPrice: totalPrice + (is3mm ? 200 : 500),
      image: 'https://images.unsplash.com/photo-1611591475819-797de0d7269e?auto=format&fit=crop&w=900&q=80',
      intentions: combinedIntentions as any,
      colors: activeStones.map((s) => s.color),
      style: 'Luxury',
      stock: 99,
      beadSize: `${beadSize} (อะไหล่ ${charm})`,
      description: `กำไลคราฟต์เฉพาะบุคคลที่ผสานหินมงคล ${activeStones.length} ชนิด: ${stoneNames} ตกแต่งด้วย ${charm} ขนาดข้อมือ ${wristSize}`,
      belief: `ความเชื่อ: เสริมพลังงานประสาน ${combinedIntentions.join(', ')} ในเส้นเดียว (ความเชื่อส่วนบุคคล)`,
      mineralDetails: {
        origin: 'คัดสรรหินธรรมชาติแท้ 100%',
        hardness: '6.5 - 7.5 Mohs',
        chakra: 'สมดุลหลายจักระเกื้อหนุน',
        element: 'ธาตุผสมสมดุล',
      },
    };

    addToCart(customProduct, 1, wristSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8D3CB]/40 border border-[#E0B8B2] text-[#7A584A] text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#C79F5E]" />
          <span>SIGNATURE CRAFT • เลือกหินเองได้ตามใจปรารถนา</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2420]">
          คราฟต์กำไลผสมหินมงคลเฉพาะคุณ
        </h1>
        <p className="text-sm sm:text-base text-[#6C5B52] leading-relaxed">
          เลือกผสมหินมงคล 1 - 4 ชนิดจากชาร์ตหน้าร้านเพื่อสร้างกำไลเส้นเดียวในโลกที่ตอบโจทย์ชีวิต ความรัก การเงิน และการงานของคุณที่สุด
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Live Interactive Bracelet Visualizer */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3DC] shadow-md space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8C7063]">
              LIVE BRACELET SIMULATOR
            </span>
            <span className="text-xs bg-[#FAF5F0] text-[#7A584A] px-2.5 py-0.5 rounded-full font-bold">
              {activeStones.length} ชนิดผสมกัน
            </span>
          </div>

          {/* Interactive Circular Bracelet Graphic */}
          <div className="relative aspect-square w-full max-w-[320px] mx-auto rounded-full bg-gradient-to-tr from-[#FAF5F0] via-[#FFFFFF] to-[#FAF5F0] border-2 border-dashed border-[#D8C7B8] flex items-center justify-center p-4">
            {/* Center Charm / Brand Logo */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FAF5F0] to-white shadow-inner border border-[#EAE3DC] flex flex-col items-center justify-center text-center p-2 z-10">
              <span className="font-brand text-xs font-bold tracking-widest text-[#4E3C34]">
                LUNARA
              </span>
              <span className="text-[10px] text-[#C79F5E] font-medium mt-0.5">
                {charm.split(' ')[0]}
              </span>
              <span className="text-[9px] text-[#8C7063] mt-0.5">{wristSize}</span>
            </div>

            {/* Circular Beads arranged mathematically around the center */}
            {Array.from({ length: 16 }).map((_, beadIdx) => {
              const stoneIndex = beadIdx % activeStones.length;
              const stone = activeStones[stoneIndex] || activeStones[0];
              const angle = (beadIdx / 16) * 2 * Math.PI;
              const radius = 115; // pixels from center
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              return (
                <div
                  key={beadIdx}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    backgroundColor: stone.hexColor,
                  }}
                  className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md border-2 border-white flex items-center justify-center text-[10px] font-bold transition-all duration-300 hover:scale-125 cursor-pointer`}
                  title={`${stone.nameTh} (${stone.nameEn})`}
                >
                  <span className="opacity-0 hover:opacity-100 bg-black/75 text-white text-[9px] px-1 rounded absolute -top-5 whitespace-nowrap z-20">
                    {stone.nameTh}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected Stones List */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-[#8C7063]">หินที่ร้อยเรียงในกำไลเส้นนี้:</h4>
            <div className="space-y-1.5">
              {activeStones.map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3DC] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs"
                      style={{ backgroundColor: st.hexColor }}
                    />
                    <strong className="text-[#2D2420]">{st.nameTh} ({st.nameEn})</strong>
                  </div>
                  <span className="text-[#7A584A] text-[11px] truncate max-w-[140px] text-right">
                    {st.tagline}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Combined Intentions Synergies */}
          <div className="p-3 bg-[#FAF5F0] rounded-2xl border border-[#E0B8B2]/50 text-xs text-[#5A453B] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#7A584A]">
              <Sparkles className="w-4 h-4 text-[#C79F5E]" />
              <span>พลังงานประสานที่ได้รับ:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {combinedIntentions.map((int) => (
                <span
                  key={int}
                  className="bg-white px-2 py-0.5 rounded-md border border-[#D8C7B8] text-[11px] font-semibold text-[#4E3C34]"
                >
                  ✦ {int}
                </span>
              ))}
            </div>
          </div>

          {/* Price & Add to Cart button */}
          <div className="pt-2 border-t border-[#F0EAE4] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#8C7063]">ราคาคราฟต์สุทธิ:</span>
                <div className="text-2xl font-bold text-[#7A584A]">
                  ฿{totalPrice.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md font-semibold">
                ฟรีค่าร้อย & จัดส่งฟรี
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddCustomToCart}
              className={`w-full py-4 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                isAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-[#4E3C34] hover:bg-[#382B24] text-[#FAF8F5]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>เพิ่มกำไลคราฟต์ลงตะกร้าแล้ว!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>ใส่ตะกร้า (฿{totalPrice.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Stone Selection & Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Bead Size & Wrist Size */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3DC] shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#2D2420] pb-2 border-b border-[#F0EAE4] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#4E3C34] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span>เลือกขนาดเม็ดหินและรอบข้อมือ</span>
            </h3>

            {/* Bead Size Options */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold uppercase tracking-wider text-[#8C7063]">
                ขนาดเม็ดหิน (Bead Size)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'หินเจีย ขนาด 3 มิล', desc: 'มินิมอลระยิบระยับ (ตามชาร์ตร้าน)', priceHint: 'เริ่มต้น ฿490' },
                  { id: '8mm Classic', desc: 'ขนาดลูกปัดมาตรฐาน ใส่สวยทุกวัน', priceHint: 'เริ่มต้น ฿1,890' },
                  { id: '10mm Bold', desc: 'ลูกปัดใหญ่ พลังชัดเจน โดดเด่น', priceHint: 'เริ่มต้น ฿1,890' },
                ].map((bs) => (
                  <button
                    key={bs.id}
                    type="button"
                    onClick={() => setBeadSize(bs.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      beadSize === bs.id
                        ? 'bg-[#4E3C34] text-white border-[#4E3C34] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#2D2420] border-[#EAE3DC] hover:border-[#C79F5E]'
                    }`}
                  >
                    <div className="font-semibold text-base">{bs.id}</div>
                    <div className={`text-xs mt-1 ${beadSize === bs.id ? 'text-white/80' : 'text-[#8C7063]'}`}>
                      {bs.desc}
                    </div>
                    <div className={`text-xs font-bold mt-1.5 ${beadSize === bs.id ? 'text-[#E0B8B2]' : 'text-[#7A584A]'}`}>
                      {bs.priceHint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wrist Size Options */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold uppercase tracking-wider text-[#8C7063]">
                ขนาดรอบข้อมือ (Wrist Size: {wristSize})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['14.5 cm', '15.0 cm', '15.5 cm', '16.0 cm', '16.5 cm', '17.0 cm', '17.5 cm', '18.0 cm'].map((ws) => (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => setWristSize(ws)}
                    className={`py-2.5 px-1.5 rounded-xl text-sm font-semibold border text-center transition-all ${
                      wristSize === ws
                        ? 'bg-[#7A584A] text-white border-[#7A584A] font-bold'
                        : 'bg-[#FAF8F5] text-[#2D2420] border-[#EAE3DC] hover:border-[#C79F5E]'
                    }`}
                  >
                    {ws}
                  </button>
                ))}
              </div>
            </div>

            {/* Charm Selection */}
            <div className="space-y-2.5">
              <label className="text-sm font-bold uppercase tracking-wider text-[#8C7063]">
                อะไหล่คั่นชาร์มเสริมบารมี (Spacer / Charm)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['14K Gold Charm', '18K White Gold', 'Rose Gold Charm', 'หินล้วน (ไม่ใส่อะไหล่)'].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setCharm(ch)}
                    className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold border text-center transition-all ${
                      charm === ch
                        ? 'bg-[#7A584A] text-white border-[#7A584A] font-bold'
                        : 'bg-[#FAF8F5] text-[#2D2420] border-[#EAE3DC] hover:border-[#C79F5E]'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Choose 1-4 Stones from 24 stones chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3DC] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EAE4]">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2420] flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-[#4E3C34] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span>เลือกหินมงคล 1 - 4 ชนิด (จาก 24 ชนิด)</span>
              </h3>
              <span className="text-xs sm:text-sm text-[#8C7063] font-medium">
                เลือกแล้ว: <strong className="text-[#7A584A]">{selectedStoneIds.length} / 4 ชนิด</strong>
              </span>
            </div>

            {/* 24 Stones Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
              {LUCKY_STONES_CATALOG.map((stone) => {
                const isSelected = selectedStoneIds.includes(stone.id);
                return (
                  <div
                    key={stone.id}
                    onClick={() => handleToggleStone(stone.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between select-none relative ${
                      isSelected
                        ? 'bg-[#FAF5F0] border-[#7A584A] shadow-xs ring-1 ring-[#7A584A]'
                        : 'bg-[#FAF8F5] border-[#EAE3DC] hover:border-[#C79F5E]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-4.5 h-4.5 rounded-full border border-black/15 shadow-xs"
                          style={{ backgroundColor: stone.hexColor }}
                        />
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-[#7A584A] text-white'
                              : 'border border-[#D8C7B8]'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                      </div>

                      <h4 className="font-semibold text-sm sm:text-base text-[#2D2420] line-clamp-1">
                        {stone.nameTh}
                      </h4>
                      <p className="text-xs text-[#8C7063] truncate">
                        {stone.nameEn}
                      </p>

                      <p className="text-xs text-[#7A584A] mt-1.5 font-medium line-clamp-2">
                        {stone.tagline}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-[#F0EAE4] flex flex-wrap gap-1">
                      {stone.category.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] sm:text-xs bg-white px-2 py-0.5 rounded text-[#8C7063] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
