/**
 * LUNARA - COMPONENT: PRODUCT CARD
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Component & Props]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (onClick สำหรับ Cart, Wishlist, Navigate)]
 *
 * - การ์ดสินค้าแบบเรียบ อ่านง่าย: รูป, ชื่อหิน, ชื่อสินค้า, ราคา, ปุ่มใส่ตะกร้า
 * - รองรับการแสดง Match Score (%) จากหน้า Find Your Bracelet
 * ============================================================================
 */

import React, { useState } from 'react';
import { Check, Heart, Plus, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';
import { Badge, cx } from './ui';

const FALLBACK_IMAGE =
  '/bracelet-placeholder.svg';

export const ProductImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, className, ...rest }) => {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? FALLBACK_IMAGE : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
};

interface ProductCardProps {
  product: Product;
  onViewDetail: (productId: string) => void;
  matchScore?: number;
  matchedReasons?: string[];
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetail, matchScore, matchedReasons }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();
  const { t, price } = useI18n();
  const content = useContent();
  const view = content.product(product);
  const isFavorite = isInWishlist(product.id);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    toast(t('toast.addedToCart', { name: view.name }));
    setTimeout(() => setAdded(false), 1400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article
      onClick={() => onViewDetail(product.id)}
      className="group card card-hover overflow-hidden flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
        <ProductImage
          src={product.image}
          alt={view.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {matchScore !== undefined && (
            <Badge tone={matchScore >= 80 ? 'success' : matchScore >= 50 ? 'gold' : 'neutral'} className="shadow-sm">
              <Sparkles className="w-3 h-3" />
              {t('find.match', { score: matchScore })}
            </Badge>
          )}
          {product.isBestSeller && <Badge tone="accent">{t('badge.bestSeller')}</Badge>}
          {product.isNewArrival && <Badge tone="gold">{t('badge.new')}</Badge>}
          {soldOut && <Badge tone="danger">{t('badge.soldOut')}</Badge>}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isFavorite ? t('wishlist.remove') : t('wishlist.add')}
          aria-pressed={isFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/90 backdrop-blur flex items-center justify-center shadow-sm text-ink-2 hover:text-rose transition-colors"
        >
          <Heart className={cx('w-4 h-4 transition-transform', isFavorite && 'fill-rose text-rose scale-110')} />
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        <div className="space-y-1 flex-1">
          <p className="text-xs text-ink-3 truncate">{view.stone}</p>
          <h3 className="text-lg sm:text-xl leading-snug text-ink line-clamp-2 group-hover:text-gold transition-colors">
            {view.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {product.intentions.slice(0, 2).map((i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-2 text-ink-2">
                {content.intention(i)}
              </span>
            ))}
          </div>
          {matchedReasons && matchedReasons.length > 0 && (
            <p className="text-xs text-success pt-1 line-clamp-2">✓ {matchedReasons.slice(0, 3).join(' · ')}</p>
          )}
        </div>

        <div className="flex items-end justify-between gap-2 pt-3 border-t border-line">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-lg font-semibold text-ink tabular-nums">{price(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-ink-3 line-through tabular-nums">{price(product.originalPrice)}</span>
              )}
            </div>
            {!soldOut && product.stock <= 5 && (
              <span className="text-[11px] text-warn">{t('product.lowStock', { count: product.stock })}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            aria-label={t('product.addToCart')}
            className={cx(
              'shrink-0 h-10 px-3 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40',
              added ? 'bg-success text-white' : 'bg-accent text-on-accent hover:bg-accent-hover'
            )}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{added ? t('product.added') : t('product.add')}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export const ProductGrid: React.FC<{
  products: Product[];
  onViewDetail: (id: string) => void;
  loading?: boolean;
  /** ใช้ 3 คอลัมน์บนจอใหญ่ (เมื่อมีแถบตัวกรองด้านข้าง) */
  compact?: boolean;
}> = ({ products, onViewDetail, loading, compact }) => {
  const className = compact ? 'grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6' : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6';
  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/5] animate-pulse bg-surface-3" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-1/2 rounded bg-surface-3 animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-surface-3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={className}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onViewDetail={onViewDetail} />
      ))}
    </div>
  );
};
