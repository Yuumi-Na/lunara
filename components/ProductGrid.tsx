/**
 * LUNARA - COMPONENT: PRODUCT GRID
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Grid Layout]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design (1 col mobile, 2 tablet, 3-4 desktop)]
 * ============================================================================
 */

import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { Sparkles, PackageSearch } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onViewDetail: (productId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onResetFilter?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onViewDetail,
  isLoading = false,
  emptyMessage = 'ไม่พบสินค้ากำไลหินมงคลที่ตรงกับเงื่อนไขการค้นหา',
  onResetFilter,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="luxury-card rounded-2xl overflow-hidden p-4 space-y-4 animate-pulse bg-white/60"
          >
            <div className="aspect-square bg-[#EAE2D7] rounded-xl w-full" />
            <div className="h-4 bg-[#EAE2D7] rounded w-2/3" />
            <div className="h-3 bg-[#EAE2D7] rounded w-1/2" />
            <div className="h-6 bg-[#EAE2D7] rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white/70 rounded-3xl border border-[#E8C5C8]/40 shadow-xs max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF4ED] text-[#8C7063] flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-[#C6A24D]" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[#4A3E3D] mb-2">
          ไม่พบสินค้าตามที่ค้นหา
        </h3>
        <p className="text-sm text-[#8C7063] mb-6">
          {emptyMessage}
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="px-5 py-2.5 rounded-full bg-[#8C5258] text-white text-sm font-semibold hover:bg-[#734045] transition-colors shadow-xs"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
};
