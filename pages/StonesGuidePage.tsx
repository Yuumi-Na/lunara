/**
 * LUNARA - PAGE: 24 LUCKY STONES GUIDE (สารานุกรมหินมงคล 24 ชนิด)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array & Objects]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * แสดงข้อมูลหินเจีย ขนาด 3 มิล ครบถ้วนทั้ง 24 ชนิดตามภาพชาร์ตของทางร้าน
 * ============================================================================
 */

import React, { useState } from 'react';
import { Sparkles, Gem, Search, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import { LuckyStoneDetail } from '../types';

interface StonesGuidePageProps {
  onSelectStoneForShop: (stoneName: string) => void;
  onNavigate: (url: string) => void;
}

export const StonesGuidePage: React.FC<StonesGuidePageProps> = ({
  onSelectStoneForShop,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredStones = LUCKY_STONES_CATALOG.filter((stone) => {
    const matchSearch =
      stone.nameTh.toLowerCase().includes(search.toLowerCase()) ||
      stone.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      stone.tagline.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (activeCategory === 'all') return true;
    return stone.category.includes(activeCategory as any);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3.5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8C5C8]/30 border border-[#E8C5C8]/60 text-[#8C5258] text-xs sm:text-sm font-semibold">
          <Gem className="w-4 h-4 text-[#C6A24D]" />
          <span>หินเจีย ขนาด 3 มิล • เลือกหินเองได้ตามความหมาย</span>
        </div>
        <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3E2723]">
          ชาร์ตหินมงคล 24 ชนิด (LUNARA)
        </h1>
        <p className="text-base sm:text-lg text-[#5C4D4A] leading-relaxed">
          รวมรายชื่อ ความหมาย และพลังความเชื่อของหินมงคลทั้ง 24 ชนิดที่มีจำหน่ายในร้าน สามารถเลือกหินที่ต้องชะตากับคุณเพื่อสั่งร้อยเป็นกำไลเส้นโปรดได้ทันที
        </p>

        {/* Medical disclaimer note */}
        <div className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80 text-xs sm:text-sm">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>ข้อมูลพลังและความหมายของหินเป็นความเชื่อส่วนบุคคล ไม่ใช่การรับรองผลทางการแพทย์</span>
        </div>
      </div>

      {/* Controls: Search & Category tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8C7063]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหิน เช่น โรสควอตซ์, ซิทริน, ความรัก..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#D9C8BE] text-base text-[#4A3E3D] outline-none focus:border-[#C6A24D] shadow-xs"
          />
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'Love', 'Money', 'Work', 'Study', 'Luck', 'Protection', 'Calm'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#8C5258] text-white shadow-xs'
                  : 'bg-white text-[#5C4D4A] border border-[#D9C8BE] hover:bg-[#FAF7F2]'
              }`}
            >
              {cat === 'all' ? 'หินทั้งหมด (24 ชนิด)' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 24 Stones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
        {filteredStones.map((stone, index) => (
          <div
            key={stone.id}
            className="luxury-card rounded-2xl p-6 bg-white flex flex-col justify-between space-y-4 relative overflow-hidden group"
          >
            {/* Top Index & Color Pill */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#7A584A]">
                #{index + 1}
              </span>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8C7063]">
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: stone.hexColor }}
                />
                <span className="font-medium text-[#2D2420]">{stone.color}</span>
              </div>
            </div>

            {/* Stone Header */}
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2420] group-hover:text-[#7A584A] transition-colors">
                {stone.nameTh}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-[#7A584A]">
                {stone.nameEn}
              </p>

              {/* Tagline from the chart */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF5F0] text-xs sm:text-sm font-semibold text-[#7A584A] border border-[#EAE3DC]">
                ✨ {stone.tagline}
              </div>

              {/* Full meaning */}
              <p className="text-sm text-[#5C4D4A] mt-3 leading-relaxed line-clamp-3">
                {stone.meaning}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3.5 border-t border-[#F0EAE4] flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {stone.category.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-[#FAF8F5] text-[#7A584A] px-2 py-0.5 rounded-md border border-[#EAE3DC]"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onSelectStoneForShop(stone.nameTh)}
                className="text-xs sm:text-sm font-semibold text-[#7A584A] hover:text-[#4E3C34] flex items-center gap-1"
                title="ค้นหากำไลที่มีหินนี้"
              >
                <span>ดูสินค้า</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="text-center p-8 bg-[#FAF4ED] rounded-3xl border border-[#E8C5C8]/50 max-w-2xl mx-auto space-y-3">
        <Sparkles className="w-8 h-8 mx-auto text-[#C6A24D]" />
        <h3 className="font-brand text-2xl font-bold text-[#3E2723]">
          ต้องการร้อยกำไลตามหินที่คุณเลือก?
        </h3>
        <p className="text-sm text-[#5C4D4A]">
          เลือกหินจากชาร์ตนี้และใช้ฟีเจอร์ <strong>Find Your Bracelet</strong> เพื่อหาแบบที่ตรงกับความชอบของคุณมากที่สุด
        </p>
        <button
          onClick={() => onNavigate('/find')}
          className="px-6 py-3 rounded-full bg-[#8C5258] text-white text-sm font-semibold shadow-xs hover:bg-[#734045] transition-colors"
        >
          เริ่มค้นหากำไลของคุณ
        </button>
      </div>
    </div>
  );
};
