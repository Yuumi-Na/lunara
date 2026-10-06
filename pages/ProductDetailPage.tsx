/**
 * LUNARA - PAGE: PRODUCT DETAIL PAGE (หน้ารายละเอียดสินค้า)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js Dynamic Route เช่น /product/[id]]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Size Selection, Quantity, Cart, Wishlist)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * - แกลเลอรีรูป (รูปหลัก + รูปเพิ่มเติมจากคลังรูปภาพ)
 * - ชื่อ ราคา ขนาดรอบข้อมือ จำนวน ปุ่มใส่ตะกร้า / Wishlist
 * - รายละเอียด ความเชื่อ (พร้อมข้อความชี้แจง) วิธีดูแล และรีวิว
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Gem, Heart, Info, Package, RefreshCw, ShoppingBag, Tag, TicketPercent } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import { ProductReviews, Stars } from '../components/ProductReviews';
import { SalePrice } from '../components/Promotions';
import { DEFAULT_WRIST_SIZE, PRODUCT_WRIST_SIZES } from '../data/craft';
import { ProductCard, ProductImage } from '../components/ProductCard';
import { Badge, Button, Container, cx, QuantityStepper } from '../components/ui';
import { useI18n, type TKey } from '../i18n';
import { useContent } from '../i18n/content';

interface ProductDetailPageProps {
  product: Product;
  products: Product[];
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
  onOpenCart: () => void;
}

const SIZE_NOTES: Record<string, TKey> = {
  '14 cm': 'size.xs',
  '15 cm': 'size.s',
  '16 cm': 'size.m',
  '17 cm': 'size.l',
  '18 cm': 'size.xl',
};

type Tab = 'details' | 'belief' | 'care';

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  products,
  onNavigate,
  onViewProduct,
  onOpenCart,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();
  const { t, price, date } = useI18n();
  const content = useContent();
  const view = content.product(product);

  const gallery = useMemo(() => Array.from(new Set([product.image, ...(product.images ?? [])])).filter(Boolean), [product]);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(DEFAULT_WRIST_SIZE);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<Tab>('details');

  // คะแนนรีวิวจริง (อัปเดตเมื่อมีรีวิวใหม่)
  const [reviewStats, setReviewStats] = useState({ rating: product.rating ?? 0, count: product.reviewCount ?? 0 });

  const soldOut = product.stock <= 0;
  const isFavorite = isInWishlist(product.id);

  const relatedStones = LUCKY_STONES_CATALOG.filter(
    (s) => product.stone.toLowerCase().includes(s.nameEn.toLowerCase()) || product.stone.includes(s.nameTh)
  );

  const related = products
    .filter((p) => p.id !== product.id && p.intentions.some((i) => product.intentions.includes(i)))
    .slice(0, 4);

  const handleAdd = () => {
    addToCart(product, quantity, size);
    setAdded(true);
    toast(t('toast.addedToCart', { name: view.name }));
    setTimeout(() => setAdded(false), 1800);
  };

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'details', label: t('pd.tabDetails'), show: true },
    { id: 'belief', label: t('pd.tabBelief'), show: !!view.belief },
    { id: 'care', label: t('pd.tabCare'), show: !!(view.careRitual || view.mineralDetails) },
  ];

  return (
    <Container className="py-8 sm:py-12 space-y-16">
      <button
        type="button"
        onClick={() => onNavigate('/shop')}
        className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.backToShop')}
      </button>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start -mt-8">
        {/* Gallery */}
        <div className="space-y-3 lg:sticky lg:top-28">
          <div className="relative aspect-square rounded-[1.75rem] overflow-hidden bg-surface-2 border border-line">
            <ProductImage src={gallery[activeImage]} alt={view.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
              {product.isBestSeller && <Badge tone="accent">{t('badge.bestSeller')}</Badge>}
              {product.isNewArrival && <Badge tone="gold">{t('badge.new')}</Badge>}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {gallery.map((src, idx) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  aria-label={t('pd.image', { n: idx + 1 })}
                  className={cx(
                    'w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors',
                    idx === activeImage ? 'border-gold' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                >
                  <ProductImage src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-ink-3 text-center">{t('pd.photoNote')}</p>
        </div>

        {/* Info */}
        <div className="space-y-7">
          <div className="space-y-3">
            <p className="eyebrow">
              {content.style(product.style)}
              {view.beadSize && <span className="text-ink-3 normal-case tracking-normal font-normal"> · {view.beadSize}</span>}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] text-ink">{view.name}</h1>
            {view.tagline && <p className="text-ink-2">{view.tagline}</p>}
            {reviewStats.count > 0 ? (
              <a href="#reviews" className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4">
                <Stars value={reviewStats.rating} />
                <span className="font-medium text-ink">{reviewStats.rating.toFixed(1)}</span>
                <span className="text-ink-3">{t('pd.reviewCount', { count: reviewStats.count })}</span>
              </a>
            ) : (
              <a href="#reviews" className="text-sm text-ink-3 hover:text-ink">{t('review.noneYet')}</a>
            )}
          </div>

          <div className="space-y-3">
            <SalePrice price={product.price} regularPrice={product.sale ? product.regularPrice : undefined} size="lg" showSavings />
            {/* ที่มาของส่วนลด: ชื่อโปร + วันหมดเขต */}
            {product.sale && (
              <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3">
                <Tag className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-danger">{t('sale.from', { name: product.sale.name })}</p>
                  <p className="text-xs text-ink-2">
                    {t('badge.sale')} {product.sale.label.replace(/^-/, '')}
                    {product.sale.endAt && ` · ${t('sale.endsOn', { date: date(product.sale.endAt) })}`}
                  </p>
                </div>
              </div>
            )}
            {product.offers?.map((o) => (
              <div key={o.promotionId} className="flex items-start gap-3 rounded-2xl border border-dashed border-gold px-4 py-3">
                <TicketPercent className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-ink">{o.name}</p>
                  <p className="text-xs text-ink-2">
                    {o.minSpend ? t('sale.offerMinLong', { min: price(o.minSpend), label: o.label }) : o.label}
                    {o.endAt && ` · ${t('sale.endsOn', { date: date(o.endAt) })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-surface-2 p-4 flex items-start gap-3">
            <Gem className="w-5 h-5 text-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-ink-3">{t('pd.mainStone')}</p>
              <p className="text-ink font-medium">{view.stone}</p>
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">
                {t('pd.wristSize')}: <span className="text-gold">{size}</span>
              </span>
              <span className="text-xs text-ink-3">{t('pd.sizeHint')}</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PRODUCT_WRIST_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={cx(
                    'rounded-xl border py-2.5 text-center transition-colors',
                    size === s ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line hover:border-gold'
                  )}
                >
                  <span className="block text-sm font-semibold">{s}</span>
                  <span className={cx('block text-[10px]', size === s ? 'opacity-75' : 'text-ink-3')}>
                    {t(SIZE_NOTES[s])}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                max={Math.max(1, product.stock)}
                onChange={(d) => setQuantity((q) => Math.min(Math.max(1, product.stock), Math.max(1, q + d)))}
                labels={{ decrease: t('qty.decrease'), increase: t('qty.increase') }}
              />
              <Button size="lg" className="flex-1" onClick={handleAdd} disabled={soldOut} variant={added ? 'secondary' : 'primary'}>
                {added ? <Check className="w-5 h-5 text-success" /> : <ShoppingBag className="w-5 h-5" />}
                {soldOut ? t('badge.soldOut') : added ? t('product.addedLong') : `${t('product.addToCart')} · ${price(product.price * quantity)}`}
              </Button>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? t('wishlist.remove') : t('wishlist.add')}
                className="w-13 h-13 shrink-0 rounded-2xl border border-line-strong flex items-center justify-center hover:border-rose transition-colors"
              >
                <Heart className={cx('w-5 h-5', isFavorite ? 'fill-rose text-rose' : 'text-ink-2')} />
              </button>
            </div>
            {added && (
              <button type="button" onClick={onOpenCart} className="text-sm text-gold hover:underline underline-offset-4">
                {t('pd.viewCart')} →
              </button>
            )}
            {!soldOut && product.stock <= 5 && <p className="text-sm text-warn">{t('product.lowStock', { count: product.stock })}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-ink-2">
            <div className="flex items-center gap-2 rounded-xl border border-line p-3">
              <Package className="w-4 h-4 text-gold shrink-0" />
              {t('pd.freeShip')}
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-line p-3">
              <RefreshCw className="w-4 h-4 text-gold shrink-0" />
              {t('pd.restring')}
            </div>
          </div>

          {/* Tabs */}
          <div className="pt-2">
            <div role="tablist" className="flex gap-1 border-b border-line">
              {tabs
                .filter((x) => x.show)
                .map((x) => (
                  <button
                    key={x.id}
                    role="tab"
                    type="button"
                    aria-selected={tab === x.id}
                    onClick={() => setTab(x.id)}
                    className={cx(
                      'px-4 h-11 text-sm -mb-px border-b-2 transition-colors',
                      tab === x.id ? 'border-gold text-ink font-medium' : 'border-transparent text-ink-3 hover:text-ink'
                    )}
                  >
                    {x.label}
                  </button>
                ))}
            </div>
            <div className="pt-5 text-[0.95rem] text-ink-2 leading-relaxed space-y-4" role="tabpanel">
              {tab === 'details' && (
                <>
                  <p>{view.description}</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-ink-3">{t('pd.beadSize')}</dt>
                    <dd className="text-ink">{view.beadSize || '—'}</dd>
                    <dt className="text-ink-3">{t('pd.cord')}</dt>
                    <dd className="text-ink">{t('pd.cordValue')}</dd>
                    <dt className="text-ink-3">{t('pd.parts')}</dt>
                    <dd className="text-ink">{t('pd.partsValue')}</dd>
                  </dl>
                </>
              )}
              {tab === 'belief' && (
                <>
                  <p>{view.belief}</p>
                  {relatedStones.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {relatedStones.map((s) => {
                        const sv = content.stone(s);
                        return (
                          <span key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 text-xs text-ink">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.hexColor }} />
                            {sv.name} · {sv.tagline}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <Disclaimer />
                </>
              )}
              {tab === 'care' && (
                <>
                  {view.careRitual && <p>{view.careRitual}</p>}
                  {view.mineralDetails && (
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      {(
                        [
                          ['pd.origin', view.mineralDetails.origin],
                          ['pd.hardness', view.mineralDetails.hardness],
                          ['pd.chakra', view.mineralDetails.chakra],
                          ['pd.element', view.mineralDetails.element],
                        ] as [TKey, string][]
                      ).map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-surface-2 p-3">
                          <dt className="text-xs text-ink-3">{t(label)}</dt>
                          <dd className="text-ink mt-0.5">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews (รีวิวจริงจากฐานข้อมูล) */}
      <ProductReviews productId={product.id} onStatsChange={setReviewStats} />

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl text-ink mb-6">{t('pd.related')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onViewDetail={onViewProduct} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
};

export const Disclaimer: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-warn-soft text-warn p-4 text-sm">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <p>{t('disclaimer.short')}</p>
    </div>
  );
};
