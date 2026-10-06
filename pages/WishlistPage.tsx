/**
 * LUNARA - PAGE: WISHLIST PAGE (หน้ารายการที่ชอบ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Wishlist Context)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 * ============================================================================
 */

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { Button, Container, EmptyState, PageHeader } from '../components/ui';
import { useI18n } from '../i18n';

interface WishlistPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onViewProduct }) => {
  const { wishlist, wishlistCount } = useWishlist();
  const { t } = useI18n();

  if (wishlistCount === 0) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyState
          icon={<Heart className="w-7 h-7" />}
          title={t('wishlist.emptyTitle')}
          description={t('wishlist.emptyDesc')}
          action={<Button onClick={() => onNavigate('/shop')}>{t('cart.browse')}</Button>}
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14 space-y-8">
      <PageHeader
        eyebrow={t('wishlist.eyebrow')}
        title={t('wishlist.title')}
        subtitle={t('wishlist.count', { count: wishlistCount })}
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetail={onViewProduct} />
        ))}
      </div>
    </Container>
  );
};
