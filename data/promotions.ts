/**
 * LUNARA - PROMOTION RULES (ใช้ร่วมกันทั้งหน้าเว็บและเซิร์ฟเวอร์)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Functions & Date Calculation]
 * - สถานะโปรโมชั่น (ยังไม่เริ่ม / กำลังใช้งาน / หมดอายุ / ปิดอยู่ / สิทธิ์หมด)
 * - ระดับสมาชิก: สมัครไม่เกิน 1 เดือน = new member, หลังจากนั้น = member ทั่วไป
 * - คำนวณส่วนลดรายบิล และราคาสินค้าเมื่อมีโปรลดทั้งร้าน
 * - สร้างโค้ดโปรโมชั่นให้สอดคล้องกับประเภทและวันเริ่ม เช่น BILL-261007-K7Q2
 * ============================================================================
 */

import type { DiscountKind, MemberTier, Promotion, PromotionStatus, PromotionType, SaleInfo } from '../types/index.ts';

export const CODE_PREFIX: Record<PromotionType, string> = {
  bill: 'BILL',
  storewide: 'SALE',
  product: 'ITEM',
  code: 'CODE',
  new_member: 'NEW',
};

/** ค่าเริ่มต้นของโปรสมาชิกใหม่: ลด 100 บาท เมื่อซื้อขั้นต่ำ 500 บาท ใช้ได้ 1 ครั้ง */
export const NEW_MEMBER_DEFAULTS = { discountValue: 100, minSpend: 500, perUserLimit: 1 };

// ----------------------------------------------------------------------------
// Membership
// ----------------------------------------------------------------------------
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function memberInfo(createdAt: string | undefined, now = new Date()): { tier: MemberTier; newMemberUntil?: string } {
  if (!createdAt) return { tier: 'member' };
  const until = addMonths(new Date(createdAt), 1);
  return now < until ? { tier: 'new_member', newMemberUntil: until.toISOString() } : { tier: 'member' };
}

// ----------------------------------------------------------------------------
// Status
// ----------------------------------------------------------------------------
export function promotionStatus(p: Promotion, now = new Date()): PromotionStatus {
  if (!p.enabled) return 'disabled';
  if (now < new Date(p.startAt)) return 'scheduled';
  if (now > new Date(p.endAt)) return 'expired';
  if (p.totalLimit != null && (p.usedCount ?? 0) >= p.totalLimit) return 'used_up';
  return 'active';
}

// ----------------------------------------------------------------------------
// Discounts
// ----------------------------------------------------------------------------
export function calcDiscount(kind: DiscountKind, value: number, base: number, maxDiscount?: number | null): number {
  let discount = kind === 'percent' ? Math.round((base * value) / 100) : value;
  if (kind === 'percent' && maxDiscount) discount = Math.min(discount, maxDiscount);
  return Math.max(0, Math.min(discount, base));
}

/** ราคาหลังลดทั้งร้าน (เลือกโปรที่ลดได้มากที่สุดถ้ามีหลายโปรพร้อมกัน, ราคาขั้นต่ำ 1 บาท) */
export function salePrice(price: number, storewide: Promotion[]): { price: number; promotion: Promotion | null } {
  let best = { price, promotion: null as Promotion | null };
  for (const p of storewide) {
    const discounted = Math.max(1, price - calcDiscount(p.discountKind, p.discountValue, price, p.maxDiscount));
    if (discounted < best.price) best = { price: discounted, promotion: p };
  }
  return best;
}

// ----------------------------------------------------------------------------
// Code generator: <ประเภท>-<วันเริ่ม YYMMDD>-<สุ่ม 4 ตัว>
// ----------------------------------------------------------------------------
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ตัด 0 O 1 I ที่อ่านสับสน

export function generatePromoCode(type: PromotionType, startAt: string | Date, random: () => number = Math.random): string {
  const d = new Date(startAt);
  const valid = !Number.isNaN(d.getTime());
  const ymd = valid
    ? `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    : '000000';
  const suffix = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(random() * CODE_CHARS.length)]).join('');
  return `${CODE_PREFIX[type]}-${ymd}-${suffix}`;
}

/** ป้ายส่วนลดสั้น ๆ เช่น "-15%" หรือ "-฿100" */
export function discountLabel(p: Pick<Promotion, 'discountKind' | 'discountValue'>): string {
  return p.discountKind === 'percent' ? `-${p.discountValue}%` : `-฿${p.discountValue.toLocaleString('en-US')}`;
}

export function toSaleInfo(p: Promotion): SaleInfo {
  return { promotionId: p.id, name: p.name, type: p.type, label: discountLabel(p), minSpend: p.minSpend || undefined, endAt: p.endAt };
}

/** โปรที่ใช้กับสินค้าชิ้นนี้ได้หรือไม่ (ลดทั้งร้าน = ทุกชิ้นในร้าน, ลดรายสินค้า = เฉพาะที่เลือก) */
export function appliesToProduct(p: Promotion, productId: string): boolean {
  if (p.type === 'storewide') return true;
  if (p.type === 'product') return !!p.productIds?.includes(productId);
  if (p.type === 'code' && p.scope === 'products') return !!p.productIds?.includes(productId);
  return p.type === 'code' || p.type === 'bill' || p.type === 'new_member';
}
