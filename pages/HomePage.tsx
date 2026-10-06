/**
 * LUNARA - PAGE: HOME PAGE (หน้าแรก)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js & React Pages]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Props]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * 1. Hero Section          : ข้อความหลัก + ปุ่มไปร้านค้า / คราฟต์กำไล
 * 2. เลือกตามเจตจำนง       : ความรัก, การเงิน, การงาน, การเรียน, โชคลาภ, ปกป้อง, ความสงบ, ความมั่นใจ
 * 3. Best Seller           : กำไลรุ่นยอดนิยม
 * 4. Craft Banner          : คราฟต์กำไลผสมหินเอง
 * 5. New Arrivals          : สินค้ามาใหม่
 * 6. Customer Reviews      : รีวิวจริงล่าสุดจากฐานข้อมูล (แสดงเมื่อมีรีวิวแล้วเท่านั้น)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { ArrowRight, Compass, Gem, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { IntentionType, Product } from '../types';
import { INTENTIONS } from '../types';
import { ProductGrid } from '../components/ProductCard';
import { Button, Container, SectionHeader } from '../components/ui';
import { fetchFeaturedReviews, type FeaturedReview } from '../services/api';
import { ReviewBadge, Stars } from '../components/ProductReviews';
import { Avatar } from '../components/HeaderControls';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';

interface HomePageProps {
  products: Product[];
  loading: boolean;
  onNavigate: (url: string) => void;
  onViewProduct: (productId: string) => void;
}

const INTENTION_ICONS: Record<IntentionType, string> = {
  Love: '♡',
  Money: '✦',
  Work: '◈',
  Study: '❖',
  Luck: '☼',
  Protection: '△',
  Calm: '◎',
  Confidence: '★',
};

export const HomePage: React.FC<HomePageProps> = ({ products, loading, onNavigate, onViewProduct }) => {
  const { t, lang } = useI18n();
  const [featured, setFeatured] = useState<{ reviews: FeaturedReview[]; stats: { rating: number; count: number } } | null>(null);

  useEffect(() => {
    fetchFeaturedReviews().then(setFeatured).catch(() => setFeatured(null));
  }, []);
  const content = useContent();

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const newProducts = products.filter((p) => p.isNewArrival || !p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-line bg-surface-2">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-rose-soft blur-3xl opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-24 w-[26rem] h-[26rem] rounded-full bg-gold-soft blur-3xl opacity-70"
        />
        <Container className="relative py-14 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left animate-fade-up">
              <p className="eyebrow">{t('home.eyebrow')}</p>
              <h1 className="text-[2.6rem] leading-[1.1] sm:text-6xl lg:text-[4.25rem] text-ink">
                {t('home.title1')}
                <span className="block italic text-gold-gradient">{t('home.title2')}</span>
              </h1>
              <p className="text-base sm:text-lg text-ink-2 max-w-xl mx-auto lg:mx-0">{t('home.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" onClick={() => onNavigate('/shop')}>
                  {t('home.ctaShop')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => onNavigate('/find')}>
                  <Compass className="w-4 h-4 text-gold" />
                  {t('home.ctaFind')}
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 pt-2 text-sm text-ink-2">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  {t('home.trustGenuine')}
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" />
                  {t('home.trustGold')}
                </span>
                {featured && featured.stats.count > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <strong className="text-ink">{featured.stats.rating.toFixed(1)}</strong> ·{' '}
                    {t('home.trustReviews', { count: featured.stats.count })}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-line">
                  <img
                    src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1100&q=80"
                    alt="LUNARA handcrafted crystal bracelets"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('/craft')}
                  className="absolute -bottom-5 left-4 right-4 sm:left-auto sm:-left-6 sm:right-auto sm:w-72 card p-4 flex items-center gap-3 text-left shadow-xl hover:border-gold transition-colors"
                >
                  <span className="w-11 h-11 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0">
                    <Gem className="w-5 h-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{t('home.craftCardTitle')}</span>
                    <span className="block text-xs text-ink-3">{t('home.craftCardDesc')}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-ink-3 ml-auto shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. INTENTIONS */}
      <Container>
        <SectionHeader eyebrow={t('home.intentEyebrow')} title={t('home.intentTitle')} subtitle={t('home.intentSubtitle')} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {INTENTIONS.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => onNavigate(`/shop?intention=${i}`)}
              className="group card card-hover p-4 sm:p-5 text-left flex flex-col gap-3"
            >
              <span className="w-10 h-10 rounded-xl bg-surface-2 text-gold group-hover:bg-accent group-hover:text-on-accent transition-colors flex items-center justify-center font-display text-lg">
                {INTENTION_ICONS[i]}
              </span>
              <span>
                <span className="block font-display text-lg sm:text-xl text-ink">{content.intention(i)}</span>
                <span className="block text-xs sm:text-sm text-ink-3 mt-1 line-clamp-2">{content.intentionDesc(i)}</span>
              </span>
            </button>
          ))}
        </div>
      </Container>

      {/* 3. BEST SELLERS */}
      <Container>
        <SectionHeader
          eyebrow={t('home.bestEyebrow')}
          title={t('home.bestTitle')}
          subtitle={t('home.bestSubtitle')}
          action={<ViewAll label={t('common.viewAll')} onClick={() => onNavigate('/shop')} />}
        />
        <ProductGrid products={bestSellers} loading={loading} onViewDetail={onViewProduct} />
      </Container>

      {/* 4. CRAFT BANNER */}
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-accent text-on-accent px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <Gem aria-hidden="true" className="absolute -right-10 -bottom-12 w-72 h-72 opacity-10" />
          <div className="relative max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {t('home.craftEyebrow')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl">{t('home.craftTitle')}</h2>
            <p className="opacity-85 text-base sm:text-lg">{t('home.craftDesc')}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" variant="gold" onClick={() => onNavigate('/craft')}>
                <Sparkles className="w-4 h-4" />
                {t('home.craftCta')}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-on-accent hover:text-on-accent hover:bg-white/10 border border-current/30"
                onClick={() => onNavigate('/stones')}
              >
                {t('home.craftChart')}
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* 5. NEW ARRIVALS */}
      <Container>
        <SectionHeader
          eyebrow={t('home.newEyebrow')}
          title={t('home.newTitle')}
          subtitle={t('home.newSubtitle')}
          action={<ViewAll label={t('common.viewAll')} onClick={() => onNavigate('/shop')} />}
        />
        <ProductGrid products={newProducts} loading={loading} onViewDetail={onViewProduct} />
      </Container>

      {/* 6. REVIEWS — รีวิวจริงล่าสุดจากลูกค้า (ซ่อนส่วนนี้ถ้ายังไม่มีรีวิว) */}
      {featured && featured.reviews.length > 0 && (
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <p className="eyebrow">{t('home.reviewsEyebrow')}</p>
            <h2 className="text-2xl sm:text-3xl text-ink">{t('home.reviewsTitle')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featured.reviews.map((rev) => (
              <figure key={rev.id} className="card p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={rev.rating} />
                  <ReviewBadge review={rev} />
                </div>
                <blockquote className="text-sm text-ink-2 leading-relaxed flex-1 line-clamp-6">“{rev.comment}”</blockquote>
                <figcaption className="flex items-center gap-3 pt-4 border-t border-line">
                  <Avatar src={rev.avatar} name={rev.name} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{rev.name}</p>
                    <button
                      type="button"
                      onClick={() => onViewProduct(rev.productId)}
                      className="block text-xs text-ink-3 hover:text-gold truncate max-w-full text-left"
                    >
                      {lang !== 'th' && rev.productEnglishName ? rev.productEnglishName : rev.productName}
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      )}
    </div>
  );
};

const ViewAll: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-gold transition-colors self-start sm:self-auto"
  >
    {label}
    <ArrowRight className="w-4 h-4" />
  </button>
);
