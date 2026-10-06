/**
 * LUNARA - COMPONENT: SEARCH BAR
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (onChange & Search Input)]
 * ============================================================================
 */

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'ค้นหาชื่อกำไล, หินมงคล, หรือความหมาย...',
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8C7063]">
        <Search className="w-5 h-5 text-[#8C7063]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-[#E8C5C8]/50 focus:border-[#C6A24D] focus:ring-2 focus:ring-[#C6A24D]/20 outline-none text-base text-[#4A3E3D] placeholder-[#9E8B84] transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9E8B84] hover:text-[#4A3E3D]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
