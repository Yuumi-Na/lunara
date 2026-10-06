/**
 * LUNARA - PRICING & PROMOTIONS (คำนวณราคาฝั่งเซิร์ฟเวอร์)
 * ============================================================================
 * ใช้ฟังก์ชันเดียวกันทั้ง "ดูราคาก่อนสั่งซื้อ" (quote) และ "สร้างคำสั่งซื้อจริง"
 * ราคาจึงตรงกันเสมอ และไม่เชื่อราคาที่ส่งมาจากเบราว์เซอร์
 *
 * ลำดับการคิดราคา:
 * 1. ราคาปกติจากฐานข้อมูล
 * 2. โปรอัตโนมัติรายชิ้น (ไม่ต้องใช้โค้ด) — เลือกโปรที่ลดได้มากที่สุดต่อสินค้า 1 ชิ้น
 *    - ลดทั้งร้าน   : สินค้าทุกชิ้นในร้าน
 *    - ลดรายสินค้า  : เฉพาะสินค้าที่เลือก (มียอดขั้นต่ำของสินค้าที่ร่วมรายการ / สิทธิ์ต่อคนได้)
 *    แต่ละรายการจำไว้ว่าลดจากโปรไหน เพื่อแสดงให้ลูกค้าเห็นชัดเจน
 * 3. โค้ดส่วนลด 1 โค้ดต่อบิล (ลดรายบิล / Code ส่วนลด / สมาชิกใหม่) ตามเงื่อนไขและสิทธิ์
 * 4. ค่าส่งคิดจากยอดสินค้าหลังหักส่วนลด
 * (กำไลคราฟต์ไม่ร่วมโปรลดราคาอัตโนมัติ)
 * ============================================================================
 */

import { appliesToProduct, calcDiscount, promotionStatus, toSaleInfo } from '../data/promotions.ts';
import { calcCraftPrice } from '../data/craft.ts';
import { LUCKY_STONES_CATALOG } from '../data/stones.ts';
import {
  AUTO_PROMOTION_TYPES,
  calcShipping,
  type AppliedPromotion,
  type AppUser,
  type CartItem,
  type CheckoutQuote,
  type CraftSpec,
  type Product,
  type Promotion,
  type SaleInfo,
} from '../types/index.ts';
import * as store from './db.ts';

export interface RequestedItem {
  productId: string;
  quantity: number;
  selectedSize: string;
  craft?: CraftSpec;
}

export class PricingError extends Error {
  constructor(public code: 'NOT_FOUND' | 'OUT_OF_STOCK', public productId: string) {
    super(code);
  }
}

/** โปรลดราคาอัตโนมัติที่กำลังใช้งาน */
export function activeAutoPromotions(now = new Date()): Promotion[] {
  return store
    .listPromotions()
    .filter((p) => AUTO_PROMOTION_TYPES.includes(p.type) && promotionStatus(p, now) === 'active');
}

const unitDiscount = (p: Promotion, price: number) => calcDiscount(p.discountKind, p.discountValue, price, p.maxDiscount);

/** เลือกโปรที่ลดได้มากที่สุดสำหรับสินค้าชิ้นนี้ */
function bestPromotion(product: Product, candidates: Promotion[]): Promotion | null {
  let best: Promotion | null = null;
  let bestDiscount = 0;
  for (const p of candidates) {
    if (!appliesToProduct(p, product.id)) continue;
    const d = Math.min(unitDiscount(p, product.price), product.price - 1);
    if (d > bestDiscount) {
      best = p;
      bestDiscount = d;
    }
  }
  return best;
}

function applyPromotion(product: Product, p: Promotion): Product {
  const price = Math.max(1, product.price - unitDiscount(p, product.price));
  return {
    ...product,
    price,
    // ราคาที่ขีดฆ่า = ราคาปกติ (ส่วนลดที่เห็นตรงกับโปรจริง)
    originalPrice: product.price,
    regularPrice: product.price,
    regularOriginalPrice: product.originalPrice,
    sale: toSaleInfo(p),
  };
}

/**
 * สำหรับแสดงสินค้าในหน้าร้าน:
 * - โปรที่ไม่มียอดขั้นต่ำ -> แสดงราคาลดทันที (sale)
 * - โปรที่มียอดขั้นต่ำ   -> แสดงเป็นข้อเสนอ (offers) เช่น "ซื้อครบ ฿1,000 ลด 10%"
 */
export function withPromotions(product: Product, auto: Promotion[]): Product {
  if (product.craft || auto.length === 0) return product;
  const unconditional = auto.filter((p) => !p.minSpend);
  const offers = auto.filter((p) => p.minSpend > 0 && appliesToProduct(p, product.id)).map(toSaleInfo);
  const best = bestPromotion(product, unconditional);
  const result = best ? applyPromotion(product, best) : product;
  return offers.length ? { ...result, offers } : result;
}

// กำไลคราฟต์: สร้างข้อมูลจากหินที่เลือก ราคาคำนวณใหม่เสมอ
function buildCraftProduct(id: string, craft: CraftSpec): Product {
  const stones = craft.stoneIds.map((sid) => {
    const stone = LUCKY_STONES_CATALOG.find((s) => s.id === sid);
    if (!stone) throw new PricingError('NOT_FOUND', id);
    return stone;
  });
  return {
    id,
    name: `กำไลคราฟต์ผสมหิน "${stones.map((s) => s.nameTh).join(' & ')}"`,
    englishName: `Custom Bracelet (${stones.map((s) => s.nameEn).join(' & ')})`,
    stone: stones.map((s) => `${s.nameTh} (${s.nameEn})`).join(' + '),
    price: calcCraftPrice(craft.beadSize, stones.length),
    image: '/bracelet-placeholder.svg',
    intentions: Array.from(new Set(stones.flatMap((s) => s.category))),
    colors: Array.from(new Set(stones.map((s) => s.color))),
    style: 'Luxury',
    stock: 99,
    description: '',
    belief: '',
    craft,
  };
}

/** สิทธิ์ต่อผู้ใช้ (null = ใช้ได้, ไม่งั้นคืนคีย์เหตุผล) */
function userLimitReason(p: Promotion, user: AppUser | null): string | null {
  const perUser = p.type === 'new_member' ? 1 : p.perUserLimit;
  if (perUser == null || !user) return null;
  return store.countPromotionUseByUser(p.id, user.email) >= perUser ? 'promo.errUserLimit' : null;
}

/** แปลงรายการในตะกร้าเป็นรายการสินค้าพร้อมราคาจริง + โปรอัตโนมัติ */
export function priceItems(requested: RequestedItem[], user: AppUser | null, options: { checkStock: boolean }) {
  // 1) ราคาปกติ
  const base: CartItem[] = requested.map((it) => {
    if (it.craft) return { product: buildCraftProduct(it.productId, it.craft), quantity: it.quantity, selectedSize: it.selectedSize };
    const stored = store.getProduct(it.productId);
    if (!stored) throw new PricingError('NOT_FOUND', it.productId);
    if (options.checkStock && stored.stock < it.quantity) throw new PricingError('OUT_OF_STOCK', it.productId);
    return { product: stored, quantity: it.quantity, selectedSize: it.selectedSize };
  });

  // 2) โปรอัตโนมัติที่เข้าเงื่อนไข (ยอดขั้นต่ำคิดจากราคาปกติของสินค้าที่ร่วมรายการ)
  const eligible: Promotion[] = [];
  const pendingOffers: CheckoutQuote['pendingOffers'] = [];
  for (const p of activeAutoPromotions()) {
    const scoped = base.filter((it) => !it.product.craft && appliesToProduct(p, it.product.id));
    if (scoped.length === 0) continue;
    const scopedRegular = scoped.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const limit = userLimitReason(p, user);
    if (limit) pendingOffers.push({ ...toSaleInfo(p), reason: limit });
    else if (scopedRegular < p.minSpend) pendingOffers.push({ ...toSaleInfo(p), reason: 'promo.errMinSpend' });
    else eligible.push(p);
  }

  // 3) ใส่ราคาลดรายชิ้น (เลือกโปรที่ลดมากที่สุดต่อชิ้น)
  const items: CartItem[] = base.map((it) => {
    if (it.product.craft) return it;
    const best = bestPromotion(it.product, eligible);
    return best ? { ...it, product: applyPromotion(it.product, best) } : it;
  });

  // สรุปส่วนลดแยกตามโปร
  const byPromo = new Map<string, AppliedPromotion>();
  for (const it of items) {
    const sale = it.product.sale;
    if (!sale) continue;
    const p = eligible.find((e) => e.id === sale.promotionId)!;
    const saved = ((it.product.regularPrice ?? it.product.price) - it.product.price) * it.quantity;
    const entry = byPromo.get(p.id) ?? { id: p.id, code: p.code, name: p.name, type: p.type, discount: 0 };
    entry.discount += saved;
    byPromo.set(p.id, entry);
  }

  const regularSubtotal = items.reduce((s, it) => s + (it.product.regularPrice ?? it.product.price) * it.quantity, 0);
  const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
  return {
    items,
    regularSubtotal,
    subtotal,
    saleSavings: regularSubtotal - subtotal,
    autoPromotions: Array.from(byPromo.values()),
    pendingOffers,
  };
}

/** ยอดที่โค้ดนี้คิดส่วนลด: ทั้งบิล หรือเฉพาะสินค้าที่ร่วมรายการ (Code ส่วนลดแบบเลือกสินค้า) */
function codeBase(p: Promotion, items: CartItem[]): number {
  return items
    .filter((it) => appliesToProduct(p, it.product.id) && !(p.scope === 'products' && it.product.craft))
    .reduce((s, it) => s + it.product.price * it.quantity, 0);
}

/** ตรวจสิทธิ์การใช้โค้ด คืนค่า reason เป็นคีย์ข้อความ (null = ใช้ได้) */
export function checkPromotion(p: Promotion, user: AppUser | null, items: CartItem[]): { reason: string | null; discount: number } {
  const status = promotionStatus(p);
  if (AUTO_PROMOTION_TYPES.includes(p.type)) return { reason: 'promo.errAuto', discount: 0 };
  if (status === 'scheduled') return { reason: 'promo.errNotStarted', discount: 0 };
  if (status === 'expired') return { reason: 'promo.errExpired', discount: 0 };
  if (status === 'disabled') return { reason: 'promo.errInvalid', discount: 0 };
  if (status === 'used_up') return { reason: 'promo.errUsedUp', discount: 0 };
  if (!user) return { reason: 'promo.errLogin', discount: 0 };

  if (p.type === 'new_member') {
    const signedUpOk = !p.signupFrom || (user.createdAt && new Date(user.createdAt) >= new Date(p.signupFrom));
    if (user.memberTier !== 'new_member' || !signedUpOk) return { reason: 'promo.errNotNewMember', discount: 0 };
  }

  const limit = userLimitReason(p, user);
  if (limit) return { reason: limit, discount: 0 };

  const base = codeBase(p, items);
  if (p.scope === 'products' && base === 0) return { reason: 'promo.errNoProducts', discount: 0 };
  if (base < p.minSpend) return { reason: 'promo.errMinSpend', discount: 0 };
  return { reason: null, discount: calcDiscount(p.discountKind, p.discountValue, base, p.maxDiscount) };
}

export function buildQuote(requested: RequestedItem[], user: AppUser | null, code: string | null | undefined) {
  const priced = priceItems(requested, user, { checkStock: false });
  let promotion: AppliedPromotion | null = null;
  let promoError: string | null = null;

  if (code?.trim()) {
    const p = store.findPromotionByCode(code);
    if (!p) {
      promoError = 'promo.errInvalid';
    } else {
      const { reason, discount } = checkPromotion(p, user, priced.items);
      if (reason) promoError = reason;
      else promotion = { id: p.id, code: p.code, name: p.name, type: p.type, discount };
    }
  }

  const discount = promotion?.discount ?? 0;
  const afterDiscount = priced.subtotal - discount;
  const shippingFee = calcShipping(afterDiscount);

  // โค้ดที่แนะนำให้ใช้ (ไม่รวม "Code ส่วนลด" ที่ร้านตั้งไว้แจกเฉพาะคน)
  const available = store
    .listPromotions()
    .filter((p) => (p.type === 'bill' || p.type === 'new_member') && promotionStatus(p) === 'active')
    .filter((p) => p.type !== 'new_member' || user?.memberTier === 'new_member')
    .map((p) => {
      const { reason } = checkPromotion(p, user, priced.items);
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        type: p.type,
        discountKind: p.discountKind,
        discountValue: p.discountValue,
        maxDiscount: p.maxDiscount,
        minSpend: p.minSpend,
        endAt: p.endAt,
        image: p.image,
        eligible: !reason,
        reason,
      };
    });

  const quote: CheckoutQuote = {
    lines: priced.items.map((it) => ({
      productId: it.product.id,
      selectedSize: it.selectedSize,
      unitPrice: it.product.price,
      regularPrice: it.product.regularPrice ?? it.product.price,
      quantity: it.quantity,
      promotion: (it.product.sale as SaleInfo | undefined) ?? null,
    })),
    regularSubtotal: priced.regularSubtotal,
    saleSavings: priced.saleSavings,
    autoPromotions: priced.autoPromotions,
    pendingOffers: priced.pendingOffers,
    subtotal: priced.subtotal,
    discount,
    promotion,
    promoError,
    shippingFee,
    total: afterDiscount + shippingFee,
    available,
  };
  return { quote, items: priced.items };
}

