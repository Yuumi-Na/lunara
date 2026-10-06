/**
 * LUNARA - PAGE: FIND YOUR BRACELET (ฟีเจอร์หลักของเว็บไซต์)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Algorithms & Math.round]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Checkbox multi-selection & Submit Event)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * คุณสมบัติสำคัญ:
 * 1. ไม่ใช่ Quiz และไม่ถามทีละข้อ: แสดงตัวเลือก Checkbox ทุกกลุ่มพร้อมกันบนหน้าเดียว
 * 2. ลูกค้าสามารถเลือก Checkbox ได้หลายข้อพร้อมกันในทุกคำถาม
 * 3. มีปุ่ม "Find My Bracelet" เมื่อกดจะคำนวณ Match Score (%)
 * 4. Match Score คำนวณจากสัดส่วนของเงื่อนไขที่ตรงกับสินค้าที่เลือก (เช่น 100% Match, 80% Match)
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import { Sparkles, Compass, Check, RotateCcw, Heart, ArrowDown, Award } from 'lucide-react';
import {
  Product,
  IntentionType,
  ColorType,
  StyleType,
  PriceRangeType,
  MatchedProduct,
} from '../types';
import { ProductCard } from '../components/ProductCard';

interface FindYourBraceletPageProps {
  products: Product[];
  onViewProduct: (productId: string) => void;
}

export const FindYourBraceletPage: React.FC<FindYourBraceletPageProps> = ({
  products,
  onViewProduct,
}) => {
  // 1. [State] Checkbox Selections
  const [lookingFor, setLookingFor] = useState<IntentionType[]>(['Love']);
  const [colors, setColors] = useState<ColorType[]>(['Pink']);
  const [styles, setStyles] = useState<StyleType[]>(['Cute']);
  const [budget, setBudget] = useState<PriceRangeType[]>(['300-500']);

  // 2. [State] Search Results & Submitted Flag
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedResults, setMatchedResults] = useState<MatchedProduct[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Checkbox Lists
  const intentionChoices: { id: IntentionType; label: string; desc: string }[] = [
    { id: 'Love', label: 'Love', desc: 'ความรัก & เสน่ห์เมตตา' },
    { id: 'Money', label: 'Money', desc: 'การเงิน & โชคลาภร่ำรวย' },
    { id: 'Work', label: 'Work', desc: 'การงาน & ความก้าวหน้า' },
    { id: 'Study', label: 'Study', desc: 'การเรียน & สติปัญญา' },
    { id: 'Luck', label: 'Luck', desc: 'ดวงชะตา & โชคดี' },
    { id: 'Protection', label: 'Protection', desc: 'คุ้มครอง & ป้องกันพลังลบ' },
    { id: 'Calm', label: 'Calm', desc: 'ความสงบ & สบายใจ คลายเครียด' },
    { id: 'Confidence', label: 'Confidence', desc: 'ความมั่นใจ & ความกล้า' },
  ];

  const colorChoices: { id: ColorType; label: string; hex: string }[] = [
    { id: 'Pink', label: 'Pink (ชมพู)', hex: '#FFB6C1' },
    { id: 'Purple', label: 'Purple (ม่วง)', hex: '#9370DB' },
    { id: 'Yellow', label: 'Yellow (เหลือง/ทอง)', hex: '#E6B800' },
    { id: 'Black', label: 'Black (ดำ/เข้ม)', hex: '#2C2C2C' },
    { id: 'White', label: 'White (ขาว/มุก)', hex: '#EAEAEA' },
    { id: 'Green', label: 'Green (เขียว)', hex: '#2E8B57' },
  ];

  const styleChoices: { id: StyleType; label: string; desc: string }[] = [
    { id: 'Minimal', label: 'Minimal', desc: 'เรียบง่าย มินิมอล' },
    { id: 'Cute', label: 'Cute', desc: 'น่ารัก หวานละมุน' },
    { id: 'Luxury', label: 'Luxury', desc: 'หรูหรา โดดเด่น' },
    { id: 'Everyday', label: 'Everyday', desc: 'ใส่ได้ทุกวัน สบายๆ' },
  ];

  const budgetChoices: { id: PriceRangeType; label: string }[] = [
    { id: 'Under 300', label: 'Under 300 (ต่ำกว่า 300 บาท)' },
    { id: '300-500', label: '300-500 บาท' },
    { id: '500-800', label: '500-800 บาท' },
    { id: '800+', label: '800+ บาทขึ้นไป' },
  ];

  // Helper toggle functions
  const toggleLookingFor = (item: IntentionType) => {
    setLookingFor((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleColor = (item: ColorType) => {
    setColors((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleStyle = (item: StyleType) => {
    setStyles((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleBudget = (item: PriceRangeType) => {
    setBudget((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const resetAll = () => {
    setLookingFor([]);
    setColors([]);
    setStyles([]);
    setBudget([]);
    setHasSearched(false);
    setMatchedResults([]);
  };

  // --------------------------------------------------------------------------
  // [เนื้อหาที่เรียนรู้ - JavaScript Match Score Algorithm]
  // คำนวณความตรงกันของเงื่อนไข (Match Score)
  // --------------------------------------------------------------------------
  const handleFindMyBracelet = () => {
    // นับจำนวนเงื่อนไขที่ผู้ใช้เลือกทั้งหมด
    const totalSelectedCount =
      lookingFor.length + colors.length + styles.length + budget.length;

    if (totalSelectedCount === 0) {
      alert('กรุณาเลือกความต้องการอย่างน้อย 1 รายการเพื่อค้นหากำไล');
      return;
    }

    const calculated: MatchedProduct[] = products.map((prod) => {
      let matchedCount = 0;
      const matchedReasons: string[] = [];

      // 1. ตรวจสอบ Intentions ที่ตรง
      lookingFor.forEach((int) => {
        if (prod.intentions.includes(int)) {
          matchedCount += 1;
          matchedReasons.push(`พลัง ${int}`);
        }
      });

      // 2. ตรวจสอบ Colors ที่ตรง
      colors.forEach((col) => {
        if (prod.colors.includes(col)) {
          matchedCount += 1;
          matchedReasons.push(`โทนสี ${col}`);
        }
      });

      // 3. ตรวจสอบ Style ที่ตรง
      styles.forEach((st) => {
        if (prod.style === st) {
          matchedCount += 1;
          matchedReasons.push(`สไตล์ ${st}`);
        }
      });

      // 4. ตรวจสอบ Budget ที่ตรง
      budget.forEach((b) => {
        let isMatch = false;
        if (b === 'Under 300' && prod.price < 300) isMatch = true;
        else if (b === '300-500' && prod.price >= 300 && prod.price <= 500) isMatch = true;
        else if (b === '500-800' && prod.price > 500 && prod.price <= 800) isMatch = true;
        else if (b === '800+' && prod.price > 800) isMatch = true;

        if (isMatch) {
          matchedCount += 1;
          matchedReasons.push(`งบประมาณ ${b}`);
        }
      });

      // คำนวณเปอร์เซ็นต์ Match Score
      const rawScore = (matchedCount / totalSelectedCount) * 100;
      const matchScore = Math.min(100, Math.round(rawScore));

      return {
        product: prod,
        matchScore,
        matchedReasons,
      };
    });

    // เรียงลำดับจากสินค้าที่ตรงมากที่สุดไปหาน้อยที่สุด
    calculated.sort((a, b) => b.matchScore - a.matchScore);

    setMatchedResults(calculated);
    setHasSearched(true);

    // Scroll to results smoothly
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const totalSelectedCount =
    lookingFor.length + colors.length + styles.length + budget.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Title & Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8D3CB]/40 border border-[#E0B8B2] text-[#7A584A] text-xs sm:text-sm font-semibold">
          <Compass className="w-4 h-4 text-[#C79F5E]" />
          <span>SIGNATURE FEATURE • ค้นหากำไลประจำตัวคุณ</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2420]">
          FIND YOUR BRACELET
        </h1>
        <p className="text-base sm:text-lg text-[#5C4D4A] leading-relaxed">
          เลือกความต้องการ สี สไตล์ และงบประมาณที่คุณชื่นชอบด้านล่างนี้ได้ตามใจ
          (เลือกได้หลายข้อพร้อมกัน) ระบบจะค้นหากำไลและคำนวณ <strong>Match Score (%)</strong> ที่ตรงกับคุณมากที่สุด
        </p>
      </div>

      {/* Checkbox Selections Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3DC] shadow-md space-y-10">
        {/* 1. What are you looking for? */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#4E3C34] text-white text-base font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2420]">
                “What are you looking for?” (คุณต้องการเสริมพลังด้านใด?)
              </h3>
            </div>
            <span className="text-sm sm:text-base text-[#7A584A] font-semibold hidden sm:inline">
              เลือกได้หลายข้อ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {intentionChoices.map((item) => {
              const isChecked = lookingFor.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex flex-col p-4.5 rounded-2xl cursor-pointer border transition-all ${
                    isChecked
                      ? 'bg-[#FAF5F0] border-[#7A584A] shadow-xs ring-1 ring-[#7A584A]'
                      : 'bg-[#FAF8F5] border-[#EAE3DC] hover:border-[#C79F5E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg sm:text-xl text-[#2D2420]">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLookingFor(item.id)}
                      className="w-5 h-5 rounded accent-[#4E3C34]"
                    />
                  </div>
                  <span className="text-sm sm:text-base text-[#7A584A] mt-2 line-clamp-1 font-normal">
                    {item.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. What colors do you like? */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#4E3C34] text-white text-base font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2420]">
                “What colors do you like?” (โทนสีที่คุณชอบ?)
              </h3>
            </div>
            <span className="text-sm sm:text-base text-[#7A584A] font-semibold hidden sm:inline">
              เลือกได้หลายข้อ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {colorChoices.map((item) => {
              const isChecked = colors.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-4.5 rounded-2xl cursor-pointer border transition-all ${
                    isChecked
                      ? 'bg-[#FAF5F0] border-[#7A584A] shadow-xs ring-1 ring-[#7A584A]'
                      : 'bg-[#FAF8F5] border-[#EAE3DC] hover:border-[#C79F5E]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColor(item.id)}
                    className="w-5 h-5 rounded accent-[#4E3C34]"
                  />
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: item.hex }}
                    />
                    <span className="font-semibold text-base sm:text-lg text-[#2D2420] truncate">
                      {item.id}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 3. What style do you like? */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#4E3C34] text-white text-base font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2420]">
                “What style do you like?” (สไตล์ที่คุณชื่นชอบ?)
              </h3>
            </div>
            <span className="text-sm sm:text-base text-[#7A584A] font-semibold hidden sm:inline">
              เลือกได้หลายข้อ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {styleChoices.map((item) => {
              const isChecked = styles.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex flex-col p-4.5 rounded-2xl cursor-pointer border transition-all ${
                    isChecked
                      ? 'bg-[#FAF5F0] border-[#7A584A] shadow-xs ring-1 ring-[#7A584A]'
                      : 'bg-[#FAF8F5] border-[#EAE3DC] hover:border-[#C79F5E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg sm:text-xl text-[#2D2420]">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleStyle(item.id)}
                      className="w-5 h-5 rounded accent-[#4E3C34]"
                    />
                  </div>
                  <span className="text-sm sm:text-base text-[#7A584A] mt-2 font-normal">
                    {item.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 4. Budget */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE4]">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#4E3C34] text-white text-base font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2420]">
                “Budget” (งบประมาณของคุณ?)
              </h3>
            </div>
            <span className="text-sm sm:text-base text-[#7A584A] font-semibold hidden sm:inline">
              เลือกได้หลายข้อ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {budgetChoices.map((item) => {
              const isChecked = budget.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center justify-between p-4.5 rounded-2xl cursor-pointer border transition-all ${
                    isChecked
                      ? 'bg-[#FAF5F0] border-[#7A584A] shadow-xs ring-1 ring-[#7A584A]'
                      : 'bg-[#FAF8F5] border-[#EAE3DC] hover:border-[#C79F5E]'
                  }`}
                >
                  <span className="font-semibold text-base sm:text-lg text-[#2D2420]">
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleBudget(item.id)}
                    className="w-5 h-5 rounded accent-[#4E3C34]"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit & Reset Buttons */}
        <div className="pt-6 border-t border-[#F0EAE4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-base sm:text-lg text-[#7A584A]">
            เลือกแล้วทั้งหมด: <strong className="text-[#2D2420]">{totalSelectedCount} เงื่อนไข</strong>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {totalSelectedCount > 0 && (
              <button
                type="button"
                onClick={resetAll}
                className="px-6 py-4 rounded-full text-base text-[#7A584A] hover:text-[#2D2420] hover:bg-[#FAF8F5] transition-colors"
              >
                ล้างตัวเลือก
              </button>
            )}

            <button
              type="button"
              onClick={handleFindMyBracelet}
              className="flex-1 sm:flex-none px-10 py-4.5 rounded-full bg-[#4E3C34] hover:bg-[#382B24] text-white font-bold text-lg sm:text-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-[#C79F5E]" />
              <span>Find My Bracelet</span>
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* RESULTS SECTION WITH MATCH SCORE */}
      {/* ------------------------------------------------------------------ */}
      <div ref={resultsRef} className="space-y-6 pt-4">
        {hasSearched && (
          <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="text-center max-w-xl mx-auto space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
                <Award className="w-4 h-4" />
                <span>คำนวณ Match Score เรียบร้อยแล้ว</span>
              </div>
              <h2 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723]">
                ผลลัพธ์กำไลที่เหมาะกับคุณที่สุด
              </h2>
              <p className="text-base sm:text-lg text-[#7A6B62]">
                เรียงตามความตรงกับเงื่อนไข ({matchedResults.length} รายการ)
              </p>
            </div>

            {/* Results Grid with Match Score Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matchedResults.map((item) => (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  onViewDetail={onViewProduct}
                  matchScore={item.matchScore}
                  matchedReasons={item.matchedReasons}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
