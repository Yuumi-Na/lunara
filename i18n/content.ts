/**
 * LUNARA - LOCALIZED CONTENT HELPERS
 * ============================================================================
 * แปลงข้อมูลสินค้า / หินมงคล / ป้ายกำกับ ให้เป็นภาษาที่ผู้ใช้เลือก
 * ลำดับการเลือกข้อความสินค้า: คำแปลภาษานั้น -> ชื่อภาษาอังกฤษ (ถ้าไม่ใช่ภาษาไทย) -> ข้อมูลหลัก
 * ============================================================================
 */

import { useCallback, useMemo } from 'react';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import { STONE_TRANSLATIONS } from '../data/stoneTranslations';
import type {
  ColorType,
  IntentionType,
  LuckyStoneDetail,
  OrderStatus,
  PaymentMethod,
  PriceRangeType,
  Product,
  StyleType,
} from '../types';
import { useI18n, type TKey } from './index';

export interface ProductView {
  name: string;
  tagline?: string;
  stone: string;
  beadSize?: string;
  description: string;
  belief: string;
  careRitual?: string;
  mineralDetails?: Product['mineralDetails'];
}

export interface StoneView {
  name: string;
  /** ชื่อรอง (ภาษาอังกฤษ หรือภาษาไทยเมื่ออยู่ในโหมดภาษาอังกฤษ) */
  subName: string;
  tagline: string;
  meaning: string;
}

const PRICE_KEYS: Record<PriceRangeType, TKey> = {
  'Under 300': 'price.under300',
  '300-500': 'price.300to500',
  '500-800': 'price.500to800',
  '800+': 'price.over800',
};

export function useContent() {
  const { lang, t } = useI18n();

  const stone = useCallback(
    (s: LuckyStoneDetail): StoneView => {
      if (lang === 'th') return { name: s.nameTh, subName: s.nameEn, tagline: s.tagline, meaning: s.meaning };
      const tr = STONE_TRANSLATIONS[s.id]?.[lang];
      return {
        name: tr?.name ?? s.nameEn,
        subName: lang === 'en' ? s.nameTh : s.nameEn,
        tagline: tr?.tagline ?? s.tagline,
        meaning: tr?.meaning ?? s.meaning,
      };
    },
    [lang]
  );

  const product = useCallback(
    (p: Product): ProductView => {
      // กำไลคราฟต์: สร้างชื่อจากชื่อหินในภาษาที่เลือก
      if (p.craft) {
        const names = p.craft.stoneIds
          .map((id) => LUCKY_STONES_CATALOG.find((s) => s.id === id))
          .filter((s): s is LuckyStoneDetail => !!s)
          .map((s) => stone(s).name);
        return {
          name: t('craft.productName', { stones: names.join(' & ') }),
          stone: names.join(' + '),
          beadSize: `${t(`craft.bead.${p.craft.beadSize}` as TKey)} · ${t(`craft.charm.${p.craft.charm}` as TKey)}`,
          description: t('craft.productDesc', { count: names.length }),
          belief: '',
        };
      }

      const tr = lang === 'th' ? undefined : p.translations?.[lang];
      const fallbackName = lang !== 'th' && p.englishName ? p.englishName : p.name;
      return {
        name: tr?.name ?? fallbackName,
        tagline: tr?.tagline ?? (lang === 'th' ? p.tagline : undefined),
        stone: tr?.stone ?? p.stone,
        beadSize: tr?.beadSize ?? p.beadSize,
        description: tr?.description ?? p.description,
        belief: tr?.belief ?? (lang === 'th' ? p.personalBeliefLore || p.belief : p.belief),
        careRitual: tr?.careRitual ?? p.careRitual,
        mineralDetails: p.mineralDetails && { ...p.mineralDetails, ...tr?.mineralDetails },
      };
    },
    [lang, stone, t]
  );

  return useMemo(
    () => ({
      product,
      stone,
      intention: (i: IntentionType) => t(`intent.${i}` as TKey),
      intentionDesc: (i: IntentionType) => t(`intentDesc.${i}` as TKey),
      color: (c: ColorType) => t(`color.${c}` as TKey),
      style: (s: StyleType) => t(`style.${s}` as TKey),
      styleDesc: (s: StyleType) => t(`styleDesc.${s}` as TKey),
      priceRange: (r: PriceRangeType) => t(PRICE_KEYS[r]),
      status: (s: OrderStatus) => t(`status.${s}` as TKey),
      payment: (m: PaymentMethod | string) =>
        ['promptpay', 'credit_card', 'cod'].includes(m) ? t(`pay.${m}` as TKey) : m,
    }),
    [product, stone, t]
  );
}
