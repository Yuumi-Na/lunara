/**
 * LUNARA - COMPONENT: FILTER SIDEBAR
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Checkbox multi-selection)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design (Drawer บน Mobile / Sidebar บน Desktop)]
 *
 * การทำงานของ Checkbox:
 * - ผู้ใช้สามารถเลือกตัวกรองหลายข้อพร้อมกันได้ (Multiple Checkboxes)
 * - มีฟังก์ชัน toggleCheckbox ช่วยเพิ่มหรือนำค่าออกจาก Array ใน State
 * ============================================================================
 */

import React from 'react';
import { Filter, RotateCcw, Check, Sparkles, Palette, Tag, DollarSign, X } from 'lucide-react';
import { IntentionType, ColorType, StyleType, PriceRangeType } from '../types';

interface FilterSidebarProps {
  selectedIntentions: IntentionType[];
  selectedColors: ColorType[];
  selectedStyles: StyleType[];
  selectedPrices: PriceRangeType[];
  onToggleIntention: (val: IntentionType) => void;
  onToggleColor: (val: ColorType) => void;
  onToggleStyle: (val: StyleType) => void;
  onTogglePrice: (val: PriceRangeType) => void;
  onResetFilters: () => void;
  totalResultsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedIntentions,
  selectedColors,
  selectedStyles,
  selectedPrices,
  onToggleIntention,
  onToggleColor,
  onToggleStyle,
  onTogglePrice,
  onResetFilters,
  totalResultsCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const intentionsList: { id: IntentionType; label: string }[] = [
    { id: 'Love', label: 'ความรัก (Love)' },
    { id: 'Money', label: 'การเงิน (Money)' },
    { id: 'Work', label: 'การงาน (Work)' },
    { id: 'Study', label: 'การเรียน (Study)' },
    { id: 'Luck', label: 'โชคลาภ (Luck)' },
    { id: 'Protection', label: 'แคล้วคลาด (Protection)' },
    { id: 'Calm', label: 'ความสงบ (Calm)' },
    { id: 'Confidence', label: 'ความมั่นใจ (Confidence)' },
  ];

  const colorsList: { id: ColorType; label: string; hex: string }[] = [
    { id: 'Pink', label: 'ชมพู (Pink)', hex: '#FFB6C1' },
    { id: 'Purple', label: 'ม่วง (Purple)', hex: '#9370DB' },
    { id: 'Yellow', label: 'เหลือง/ทอง (Yellow)', hex: '#E6B800' },
    { id: 'Black', label: 'ดำ/เข้ม (Black)', hex: '#2C2C2C' },
    { id: 'White', label: 'ขาว/มุก (White)', hex: '#F0F0F0' },
    { id: 'Green', label: 'เขียว/หยก (Green)', hex: '#2E8B57' },
  ];

  const stylesList: { id: StyleType; label: string }[] = [
    { id: 'Minimal', label: 'Minimal (เรียบง่าย)' },
    { id: 'Cute', label: 'Cute (น่ารักสดใส)' },
    { id: 'Luxury', label: 'Luxury (หรูหราสง่างาม)' },
    { id: 'Everyday', label: 'Everyday (ใส่ได้ทุกวัน)' },
  ];

  const pricesList: { id: PriceRangeType; label: string }[] = [
    { id: 'Under 300', label: 'ต่ำกว่า 300 บาท' },
    { id: '300-500', label: '300 - 500 บาท' },
    { id: '500-800', label: '500 - 800 บาท' },
    { id: '800+', label: '800 บาทขึ้นไป' },
  ];

  const hasAnyFilter =
    selectedIntentions.length > 0 ||
    selectedColors.length > 0 ||
    selectedStyles.length > 0 ||
    selectedPrices.length > 0;

  const content = (
    <div className="space-y-6 text-[#4A3E3D]">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8C5C8]/50">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#8C5258]" />
          <h3 className="font-semibold text-lg text-[#3E2723]">ตัวกรองสินค้า</h3>
          {totalResultsCount !== undefined && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#8C7063]">
              {totalResultsCount} รายการ
            </span>
          )}
        </div>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-[#8C5258] hover:text-[#5C2E33] font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างทั้งหมด</span>
          </button>
        )}
      </div>

      {/* 1. Intentions Multi-Checkbox */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-base font-semibold text-[#8C5258]">
          <Sparkles className="w-4 h-4 text-[#C6A24D]" />
          <span>ความต้องการ / พลังหิน (Intentions)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-1">
          {intentionsList.map((item) => {
            const isChecked = selectedIntentions.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-base transition-all ${
                  isChecked
                    ? 'bg-[#E8C5C8]/30 font-semibold text-[#3E2723]'
                    : 'hover:bg-[#FAF4ED] text-[#5C4D4A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleIntention(item.id)}
                  className="w-4 h-4 rounded text-[#8C5258] accent-[#8C5258] border-gray-300 focus:ring-[#8C5258]"
                />
                <span className="flex-1">{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Colors Multi-Checkbox */}
      <div className="space-y-3 pt-4 border-t border-[#F0E6D8]">
        <div className="flex items-center gap-2 text-base font-semibold text-[#8C5258]">
          <Palette className="w-4 h-4 text-[#C6A24D]" />
          <span>โทนสี (Colors)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {colorsList.map((c) => {
            const isChecked = selectedColors.includes(c.id);
            return (
              <label
                key={c.id}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-sm sm:text-base transition-all ${
                  isChecked
                    ? 'bg-[#E8C5C8]/30 font-semibold text-[#3E2723]'
                    : 'hover:bg-[#FAF4ED] text-[#5C4D4A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleColor(c.id)}
                  className="w-4 h-4 rounded accent-[#8C5258]"
                />
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="truncate">{c.label.split(' ')[0]}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Style Multi-Checkbox */}
      <div className="space-y-3 pt-4 border-t border-[#F0E6D8]">
        <div className="flex items-center gap-2 text-base font-semibold text-[#8C5258]">
          <Tag className="w-4 h-4 text-[#C6A24D]" />
          <span>สไตล์กำไล (Style)</span>
        </div>
        <div className="space-y-1.5 pt-1">
          {stylesList.map((s) => {
            const isChecked = selectedStyles.includes(s.id);
            return (
              <label
                key={s.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-base transition-all ${
                  isChecked
                    ? 'bg-[#E8C5C8]/30 font-semibold text-[#3E2723]'
                    : 'hover:bg-[#FAF4ED] text-[#5C4D4A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleStyle(s.id)}
                  className="w-4 h-4 rounded accent-[#8C5258]"
                />
                <span>{s.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Price Multi-Checkbox */}
      <div className="space-y-3 pt-4 border-t border-[#F0E6D8]">
        <div className="flex items-center gap-2 text-base font-semibold text-[#8C5258]">
          <DollarSign className="w-4 h-4 text-[#C6A24D]" />
          <span>ช่วงราคา (Price)</span>
        </div>
        <div className="space-y-1.5 pt-1">
          {pricesList.map((p) => {
            const isChecked = selectedPrices.includes(p.id);
            return (
              <label
                key={p.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-base transition-all ${
                  isChecked
                    ? 'bg-[#E8C5C8]/30 font-semibold text-[#3E2723]'
                    : 'hover:bg-[#FAF4ED] text-[#5C4D4A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onTogglePrice(p.id)}
                  className="w-4 h-4 rounded accent-[#8C5258]"
                />
                <span>{p.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white rounded-3xl p-6 border border-[#E8C5C8]/40 shadow-xs h-fit sticky top-28">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full overflow-y-auto p-6 shadow-2xl z-10">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 rounded-full text-[#8C7063] hover:bg-[#F3ECE1]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-[#F0E6D8]">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 rounded-full bg-[#8C5258] text-white font-semibold shadow-xs"
              >
                ดูผลลัพธ์ ({totalResultsCount ?? 0} ชิ้น)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
