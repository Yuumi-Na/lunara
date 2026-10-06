/**
 * LUNARA - COMPONENT: PROMOTIONS (โปรโมชั่นฝั่งลูกค้า)
 * ============================================================================
 * - usePromoText()     : ข้อความอธิบายส่วนลด เช่น "ลด ฿150 เมื่อซื้อครบ ฿2,000"
 * - PromoCodeBox       : ช่องกรอกโค้ด + รายการโค้ดที่ใช้ได้ (หน้า Checkout)
 * - PromotionBanner    : การ์ดโปรโมชั่นที่กำลังใช้งาน (หน้าแรก)
 * ============================================================================
 */

import React, { useState } from 'react';
import { Check, Clock, Copy, Sparkles, Tag, TicketPercent, X } from 'lucide-react';
import type { CheckoutQuote, DiscountKind, MemberTier, Promotion } from '../types';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { ProductImage } from './ProductCard';
import { Badge, Button, cx, Input } from './ui';

export function usePromoText() {
  const { t, price, date } = useI18n();

  const discount = (kind: DiscountKind, value: number, maxDiscount?: number | null) =>
    kind === 'percent'
      ? maxDiscount
        ? t('promo.offPercentMax', { percent: value, max: price(maxDiscount) })
        : t('promo.offPercent', { percent: value })
      : t('promo.offAmount', { amount: price(value) });

  const summary = (
    p: Pick<Promotion, 'type' | 'discountKind' | 'discountValue' | 'maxDiscount' | 'minSpend'> &
      Partial<Pick<Promotion, 'productIds' | 'scope'>>
  ) => {
    const off = discount(p.discountKind, p.discountValue, p.maxDiscount);
    if (p.type === 'storewide') return t('promo.storewideSummary', { off });
    const withMin = p.minSpend > 0 ? t('promo.withMinSpend', { off, min: price(p.minSpend) }) : off;
    // ลดรายสินค้า / โค้ดเฉพาะสินค้า: บอกจำนวนสินค้าที่ร่วมรายการ
    if (p.type === 'product' || (p.type === 'code' && p.scope === 'products')) {
      return t('promo.productSummary', { off: withMin, count: p.productIds?.length ?? 0 });
    }
    return p.type === 'new_member' ? t('promo.newMemberSummary', { off: withMin }) : withMin;
  };

  const until = (endAt: string) => t('promo.until', { date: date(endAt) });

  return { discount, summary, until };
}

// ----------------------------------------------------------------------------
// Checkout: promo code box
// ----------------------------------------------------------------------------
export const PromoCodeBox: React.FC<{
  quote: CheckoutQuote | null;
  appliedCode: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
  loading?: boolean;
}> = ({ quote, appliedCode, onApply, onRemove, loading }) => {
  const { t, tk, price } = useI18n();
  const text = usePromoText();
  const [input, setInput] = useState('');

  const applied = quote?.promotion;
  const error = appliedCode && quote?.promoError ? tk(quote.promoError) : null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink flex items-center gap-2">
        <TicketPercent className="w-4 h-4 text-gold" />
        {t('promo.codeLabel')}
      </p>

      {applied ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-success-soft px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-success flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {applied.code}
            </p>
            <p className="text-xs text-ink-2 truncate">
              {applied.name} · −{price(applied.discount)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInput('');
              onRemove();
            }}
            aria-label={t('promo.remove')}
            title={t('promo.remove')}
            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-ink-3 hover:text-danger hover:bg-surface"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) onApply(input.trim().toUpperCase());
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder={t('promo.codePlaceholder')}
            aria-label={t('promo.codeLabel')}
            aria-invalid={!!error}
            className="font-mono uppercase"
            maxLength={32}
          />
          <Button type="submit" variant="secondary" loading={loading} disabled={!input.trim()}>
            {t('promo.apply')}
          </Button>
        </form>
      )}
      {error && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {/* โค้ดที่มีให้ใช้ตอนนี้ */}
      {quote && quote.available.length > 0 && !applied && (
        <ul className="space-y-2">
          {quote.available.map((p) => (
            <li
              key={p.id}
              className={cx(
                'flex items-center gap-3 rounded-2xl border px-3 py-2.5',
                p.eligible ? 'border-gold/50 bg-gold-soft/40' : 'border-line opacity-75'
              )}
            >
              <Tag className="w-4 h-4 text-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-ink-3 truncate">
                  {text.summary(p)} {p.reason && !p.eligible && <span className="text-warn">· {tk(p.reason)}</span>}
                </p>
              </div>
              <Button size="sm" variant={p.eligible ? 'primary' : 'ghost'} disabled={!p.eligible} onClick={() => onApply(p.code)}>
                {t('promo.use')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Home: active promotions
// ----------------------------------------------------------------------------
export const PromotionCard: React.FC<{ promotion: Promotion }> = ({ promotion: p }) => {
  const { t } = useI18n();
  const text = usePromoText();
  const toast = useToast();

  const copy = () =>
    navigator.clipboard
      .writeText(p.code)
      .then(() => toast(t('promo.codeCopied', { code: p.code })))
      .catch(() => toast(p.code, 'info'));

  return (
    <article className="card overflow-hidden flex flex-col sm:flex-row">
      {p.image ? (
        <ProductImage src={p.image} alt="" className="w-full sm:w-44 aspect-[16/9] sm:aspect-auto object-cover shrink-0" />
      ) : (
        <div className="w-full sm:w-44 aspect-[16/9] sm:aspect-auto bg-accent text-on-accent flex items-center justify-center shrink-0">
          <TicketPercent className="w-10 h-10 opacity-80" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={p.type === 'storewide' || p.type === 'product' ? 'rose' : p.type === 'new_member' ? 'info' : 'gold'}>
            {t(`promoType.${p.type}` as const)}
          </Badge>
          <span className="text-xs text-ink-3 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {text.until(p.endAt)}
          </span>
        </div>
        <div>
          <h3 className="text-xl text-ink leading-snug">{p.name}</h3>
          <p className="text-sm text-ink-2 mt-1">{text.summary(p)}</p>
          {p.description && <p className="text-xs text-ink-3 mt-1 line-clamp-2">{p.description}</p>}
        </div>
        {p.type === 'storewide' || p.type === 'product' ? (
          <p className="text-xs text-success mt-auto">{t('promo.autoApplied')}</p>
        ) : (
          <button
            type="button"
            onClick={copy}
            className="mt-auto self-start inline-flex items-center gap-2 rounded-xl border border-dashed border-gold px-3 py-1.5 font-mono text-sm text-ink hover:bg-gold-soft"
            title={t('promo.copyCode')}
          >
            {p.code}
            <Copy className="w-3.5 h-3.5 text-gold" />
          </button>
        )}
      </div>
    </article>
  );
};

/** ป้ายระดับสมาชิก: New member (1 เดือนแรกหลังสมัคร) / Member */
export const MemberBadge: React.FC<{ tier?: MemberTier }> = ({ tier }) => {
  const { t } = useI18n();
  if (!tier) return null;
  return tier === 'new_member' ? (
    <Badge tone="info">
      <Sparkles className="w-3 h-3" />
      {t('member.new')}
    </Badge>
  ) : (
    <Badge>{t('member.member')}</Badge>
  );
};

// ----------------------------------------------------------------------------
// ราคาลดแบบเด่นชัด: ราคาลดสีแดง + ราคาปกติขีดฆ่า + ป้าย % + ชื่อโปรที่ทำให้ลด
// ----------------------------------------------------------------------------
const PRICE_SIZES = {
  sm: { price: 'text-base', regular: 'text-xs', badge: 'text-[10px] px-1.5' },
  md: { price: 'text-lg', regular: 'text-xs', badge: 'text-[11px] px-1.5' },
  lg: { price: 'text-3xl', regular: 'text-lg', badge: 'text-sm px-2.5 py-0.5' },
};

export const SalePrice: React.FC<{
  price: number;
  regularPrice?: number;
  size?: keyof typeof PRICE_SIZES;
  quantity?: number;
  showSavings?: boolean;
}> = ({ price: unit, regularPrice, size = 'md', quantity = 1, showSavings }) => {
  const { t, price } = useI18n();
  const sz = PRICE_SIZES[size];
  const onSale = !!regularPrice && regularPrice > unit;
  const percent = onSale ? Math.round((1 - unit / regularPrice!) * 100) : 0;

  return (
    <span className="inline-flex flex-col">
      <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className={cx(sz.price, 'font-semibold tabular-nums', onSale ? 'text-danger' : 'text-ink')}>{price(unit * quantity)}</span>
        {onSale && (
          <>
            <span className={cx(sz.regular, 'text-ink-3 line-through decoration-danger/70 decoration-2 tabular-nums')}>
              {price(regularPrice! * quantity)}
            </span>
            <span className={cx(sz.badge, 'rounded-md bg-danger text-white font-bold leading-5')}>-{percent}%</span>
          </>
        )}
      </span>
      {onSale && showSavings && (
        <span className="text-xs font-medium text-danger">{t('sale.youSave', { amount: price((regularPrice! - unit) * quantity) })}</span>
      )}
    </span>
  );
};

/** ป้ายบอกว่าราคานี้ลดจากโปรโมชั่นไหน */
export const SaleChip: React.FC<{ sale: { name: string; label: string }; className?: string }> = ({ sale, className }) => {
  const { t } = useI18n();
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 max-w-full rounded-md bg-danger-soft text-danger text-[11px] font-medium px-1.5 py-0.5',
        className
      )}
      title={t('sale.from', { name: sale.name })}
    >
      <Tag className="w-3 h-3 shrink-0" />
      <span className="truncate">{t('sale.from', { name: sale.name })}</span>
    </span>
  );
};

/** ข้อเสนอที่มีเงื่อนไข เช่น "ซื้อครบ ฿2,000 ลด 20%" */
export const OfferChip: React.FC<{ offer: { name: string; label: string; minSpend?: number } }> = ({ offer }) => {
  const { t, price } = useI18n();
  return (
    <span
      className="inline-flex items-center gap-1 max-w-full rounded-md border border-dashed border-gold text-gold text-[11px] font-medium px-1.5 py-0.5"
      title={offer.name}
    >
      <TicketPercent className="w-3 h-3 shrink-0" />
      <span className="truncate">
        {offer.minSpend ? t('sale.offerMin', { min: price(offer.minSpend), label: offer.label }) : offer.label} · {offer.name}
      </span>
    </span>
  );
};
