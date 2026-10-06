/**
 * LUNARA - PAGE: SHOP PAGE (หน้ารวมสินค้าทั้งหมด)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Methods (filter, includes, some)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (useState, onChange, multi-checkboxes)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design (Filter Drawer บนมือถือ)]
 *
 * การทำงานของตัวกรองหลายเงื่อนไข (Multi-checkbox Filter):
 * 1. Intentions: สินค้าต้องมี intention อย่างน้อย 1 รายการที่ตรงกับที่ติ๊ก
 * 2. Colors: สินค้าต้องมี color อย่างน้อย 1 สีที่ตรงกับที่ติ๊ก
 * 3. Style: สินค้าต้องมีสไตล์ตรงกับที่เลือก
 * 4. Price: สินค้าต้องอยู่ในช่วงราคาที่ติ๊ก (Under 300, 300-500, 500-800, 800+)
 * 5. Search Bar: ค้นหาจากชื่อสินค้า, ชื่อหิน, หรือคำอธิบาย
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { Product, IntentionType, ColorType, StyleType, PriceRangeType } from '../types';
import { SearchBar } from '../components/SearchBar';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductGrid } from '../components/ProductGrid';

interface ShopPageProps {
  products: Product[];
  onViewProduct: (productId: string) => void;
  initialIntention?: string | null;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onViewProduct,
  initialIntention,
}) => {
  // 1. [State] Search Bar
  const [searchQuery, setSearchQuery] = useState('');

  // 2. [State] Multi-checkbox Filters
  const [selectedIntentions, setSelectedIntentions] = useState<IntentionType[]>(() => {
    if (initialIntention) {
      return [initialIntention as IntentionType];
    }
    return [];
  });
  const [selectedColors, setSelectedColors] = useState<ColorType[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<StyleType[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceRangeType[]>([]);

  // 3. [State] Sorting
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'popular'>('featured');

  // 4. [State] Mobile Drawer Open
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // --------------------------------------------------------------------------
  // Toggle Checkbox Handlers
  // --------------------------------------------------------------------------
  const toggleIntention = (val: IntentionType) => {
    setSelectedIntentions((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const toggleColor = (val: ColorType) => {
    setSelectedColors((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const toggleStyle = (val: StyleType) => {
    setSelectedStyles((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const togglePrice = (val: PriceRangeType) => {
    setSelectedPrices((prev) =>
      prev.includes(val) ? prev.filter((p) => p !== val) : [...prev, val]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedIntentions([]);
    setSelectedColors([]);
    setSelectedStyles([]);
    setSelectedPrices([]);
  };

  // --------------------------------------------------------------------------
  // [เนื้อหาที่เรียนรู้ - JavaScript Array Filtering]
  // ตรวจสอบเงื่อนไขหลายข้อพร้อมกัน
  // --------------------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. ตรวจสอบคำค้นหา (Search Query)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesStone = product.stone.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesName && !matchesStone && !matchesDesc) {
          return false;
        }
      }

      // 2. ตรวจสอบ Intentions (ถ้ามีการเลือก ต้องมีอย่างน้อย 1 ข้อที่ตรง)
      if (selectedIntentions.length > 0) {
        const hasMatchingIntention = product.intentions.some((int) =>
          selectedIntentions.includes(int)
        );
        if (!hasMatchingIntention) return false;
      }

      // 3. ตรวจสอบ Colors (ถ้ามีการเลือก ต้องมีอย่างน้อย 1 สีที่ตรง)
      if (selectedColors.length > 0) {
        const hasMatchingColor = product.colors.some((col) =>
          selectedColors.includes(col)
        );
        if (!hasMatchingColor) return false;
      }

      // 4. ตรวจสอบ Style (ถ้ามีการเลือก ต้องตรงกับสไตล์ที่เลือก)
      if (selectedStyles.length > 0) {
        if (!selectedStyles.includes(product.style)) {
          return false;
        }
      }

      // 5. ตรวจสอบ Price Ranges
      if (selectedPrices.length > 0) {
        const matchesPrice = selectedPrices.some((range) => {
          if (range === 'Under 300') return product.price < 300;
          if (range === '300-500') return product.price >= 300 && product.price <= 500;
          if (range === '500-800') return product.price > 500 && product.price <= 800;
          if (range === '800+') return product.price > 800;
          return false;
        });
        if (!matchesPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
      return 0; // featured
    });
  }, [
    products,
    searchQuery,
    selectedIntentions,
    selectedColors,
    selectedStyles,
    selectedPrices,
    sortBy,
  ]);

  const totalActiveFilters =
    selectedIntentions.length +
    selectedColors.length +
    selectedStyles.length +
    selectedPrices.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#8C5258]">
          <Sparkles className="w-4 h-4 text-[#C6A24D]" />
          <span>LUNARA SHOP CATALOG</span>
        </div>
        <h1 className="font-brand text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3E2723]">
          กำไลหินมงคลทั้งหมด
        </h1>
        <p className="text-base sm:text-lg text-[#6C5B52]">
          เลือกชมกำไลหินเจีย 3 มิล เสริมดวง เสริมพลังบวก พร้อมตัวกรองตามความต้องการ
        </p>
      </div>

      {/* Search & Bar Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ค้นหาชื่อกำไล เช่น Sweet Amoré, โรสควอตซ์, ซิทริน, เรียกเงิน..."
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-[#E8C5C8]/60 text-base font-semibold text-[#4A3E3D] shadow-xs hover:border-[#C6A24D]"
          >
            <Filter className="w-5 h-5 text-[#8C5258]" />
            <span>ตัวกรอง</span>
            {totalActiveFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8C5258] text-white text-xs flex items-center justify-center font-bold">
                {totalActiveFilters}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-[#E8C5C8]/60 shadow-xs">
            <ArrowUpDown className="w-4 h-4 text-[#8C7063] shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm sm:text-base font-medium text-[#4A3E3D] bg-transparent outline-none cursor-pointer"
            >
              <option value="featured">สินค้าแนะนำ</option>
              <option value="popular">ยอดนิยม / รีวิวสูงสุด</option>
              <option value="price-asc">ราคา: น้อยไปมาก</option>
              <option value="price-desc">ราคา: มากไปน้อย</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Bar */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1 pb-2">
          <span className="text-sm font-semibold text-[#7A584A]">ตัวกรองที่เลือก:</span>
          {selectedIntentions.map((int) => (
            <span
              key={int}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium bg-[#E8C5C8]/40 text-[#5C2E33]"
            >
              <span>{int}</span>
              <button onClick={() => toggleIntention(int)} className="hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {selectedColors.map((col) => (
            <span
              key={col}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF4ED] text-[#8C7063] border border-[#D9C8BE]"
            >
              <span>สี {col}</span>
              <button onClick={() => toggleColor(col)} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedStyles.map((sty) => (
            <span
              key={sty}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF4ED] text-[#8C7063] border border-[#D9C8BE]"
            >
              <span>สไตล์ {sty}</span>
              <button onClick={() => toggleStyle(sty)} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedPrices.map((pr) => (
            <span
              key={pr}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FAF4ED] text-[#8C7063] border border-[#D9C8BE]"
            >
              <span>฿ {pr}</span>
              <button onClick={() => togglePrice(pr)} className="hover:opacity-75">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={resetAllFilters}
            className="text-xs text-[#8C5258] underline font-medium ml-2 hover:text-[#5C2E33]"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}

      {/* Main Content Layout: Sidebar + Product Grid */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <FilterSidebar
          selectedIntentions={selectedIntentions}
          selectedColors={selectedColors}
          selectedStyles={selectedStyles}
          selectedPrices={selectedPrices}
          onToggleIntention={toggleIntention}
          onToggleColor={toggleColor}
          onToggleStyle={toggleStyle}
          onTogglePrice={togglePrice}
          onResetFilters={resetAllFilters}
          totalResultsCount={filteredProducts.length}
          isOpenMobile={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        {/* Product Grid */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#8C7063] px-1">
            <span>
              แสดง <strong>{filteredProducts.length}</strong> จากทั้งหมด {products.length} สินค้า
            </span>
          </div>

          <ProductGrid
            products={filteredProducts}
            onViewDetail={onViewProduct}
            onResetFilter={resetAllFilters}
          />
        </div>
      </div>
    </div>
  );
};
