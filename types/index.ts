/**
 * LUNARA E-COMMERCE - DATA TYPES & SCHEMAS
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript & TypeScript Data Types]
 * - การกำหนดชนิดข้อมูล (Interface & Type)
 * - Object และ Array Types สำหรับสินค้า, ตะกร้า, คำสั่งซื้อ, ผู้ใช้ และรูปภาพ
 * ============================================================================
 */

import { z } from 'zod';

// ภาษาที่รองรับ (ไทย / อังกฤษ)
export type Lang = 'th' | 'en';

// หมวดหมู่ความต้องการ / พลังหินมงคล (Intentions)
export type IntentionType =
  | 'Love'
  | 'Money'
  | 'Work'
  | 'Study'
  | 'Luck'
  | 'Protection'
  | 'Calm'
  | 'Confidence';

// หมวดหมู่โทนสี (Colors)
export type ColorType = 'Pink' | 'Purple' | 'Yellow' | 'Black' | 'White' | 'Green';

// สไตล์การออกแบบกำไล (Styles)
export type StyleType = 'Minimal' | 'Cute' | 'Luxury' | 'Everyday';

// ช่วงราคา (Price Ranges)
export type PriceRangeType = 'Under 300' | '300-500' | '500-800' | '800+';

export const INTENTIONS: IntentionType[] = [
  'Love', 'Money', 'Work', 'Study', 'Luck', 'Protection', 'Calm', 'Confidence',
];
export const COLORS: ColorType[] = ['Pink', 'Purple', 'Yellow', 'Black', 'White', 'Green'];
export const STYLES: StyleType[] = ['Minimal', 'Cute', 'Luxury', 'Everyday'];
export const PRICE_RANGES: PriceRangeType[] = ['Under 300', '300-500', '500-800', '800+'];

export const COLOR_HEX: Record<ColorType, string> = {
  Pink: '#F2B8C0',
  Purple: '#9B7FD1',
  Yellow: '#E2B33C',
  Black: '#2C2C2C',
  White: '#EFEDEA',
  Green: '#3E8E63',
};

export function matchesPriceRange(price: number, range: PriceRangeType): boolean {
  if (range === 'Under 300') return price < 300;
  if (range === '300-500') return price >= 300 && price <= 500;
  if (range === '500-800') return price > 500 && price <= 800;
  return price > 800;
}

// ข้อมูลหินมงคล 24 ชนิด (จากชาร์ตหน้าร้าน)
export interface LuckyStoneDetail {
  id: string;
  nameTh: string;
  nameEn: string;
  meaning: string;
  category: IntentionType[];
  color: ColorType;
  hexColor: string;
  tagline: string;
}

// ข้อความสินค้าที่แปลแล้วในแต่ละภาษา (ภาษาไทยคือข้อมูลหลักของสินค้า)
export interface ProductTranslation {
  name?: string;
  tagline?: string;
  stone?: string;
  beadSize?: string;
  description?: string;
  belief?: string;
  careRitual?: string;
  mineralDetails?: Partial<Product['mineralDetails']>;
}

// ข้อมูลกำไลคราฟต์ (ใช้คำนวณราคาซ้ำฝั่งเซิร์ฟเวอร์)
export interface CraftSpec {
  stoneIds: string[];
  beadSize: string;
  charm: string;
}

// ข้อมูลสินค้ากำไลหินมงคล (Product Interface)
export interface Product {
  id: string;
  name: string;
  englishName?: string;
  price: number;
  originalPrice?: number;
  stone: string;
  stoneType?: string;
  tagline?: string;
  stoneDetails?: string[];
  colors: ColorType[];
  intentions: IntentionType[];
  style: StyleType;
  image: string; // URL รูปภาพหลัก (ภายนอก หรือ /api/images/:id จากคลังรูปภาพ)
  images?: string[]; // แกลเลอรีรูปเพิ่มเติม
  description: string;
  belief: string;
  personalBeliefLore?: string;
  mineralDetails?: {
    origin: string;
    hardness: string;
    chakra: string;
    element: string;
  };
  careRitual?: string;
  stock: number;
  beadSize?: string;
  beadSizes?: string[];
  isMultiStone?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewCount?: number;
  translations?: Partial<Record<Lang, ProductTranslation>>;
  craft?: CraftSpec;
  /** ราคาปกติก่อนลด (เซิร์ฟเวอร์ใส่ให้เมื่อสินค้ามีโปรลดราคาอัตโนมัติ) */
  regularPrice?: number;
  regularOriginalPrice?: number;
  /** โปรที่ทำให้ราคานี้ลดลง (ลดทั้งร้าน / ลดรายสินค้า) */
  sale?: SaleInfo;
  /** โปรที่มีเงื่อนไข เช่น "ซื้อครบ ฿1,000 ลด 10%" (ลดตอน checkout เมื่อถึงเงื่อนไข) */
  offers?: SaleInfo[];
}

export interface SaleInfo {
  promotionId: string;
  name: string;
  type: PromotionType;
  /** ป้ายส่วนลด เช่น "-15%" หรือ "-฿100" */
  label: string;
  minSpend?: number;
  endAt?: string;
}

// รายการสินค้าในตะกร้า (Cart Item)
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string; // เช่น "16 cm"
}

// สถานะคำสั่งซื้อ (Order Status)
export type OrderStatus = 'Ordered' | 'Preparing' | 'Shipping' | 'Completed' | 'Cancelled';
export const ORDER_STATUSES: OrderStatus[] = ['Ordered', 'Preparing', 'Shipping', 'Completed', 'Cancelled'];

export type PaymentMethod = 'promptpay' | 'credit_card' | 'cod';

// ข้อมูลคำสั่งซื้อ (Order Interface)
export interface Order {
  id: string;
  userEmail: string;
  customerName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number; // ยอดสินค้า (หลังหักโปรลดราคาอัตโนมัติแล้ว)
  saleSavings?: number; // ส่วนลดรวมจากโปรอัตโนมัติ (ลดทั้งร้าน / ลดรายสินค้า)
  autoPromotions?: AppliedPromotion[]; // แยกตามโปรแต่ละตัว
  discount?: number; // ส่วนลดจากโค้ดโปรโมชั่น
  promotion?: AppliedPromotion | null;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

// ผู้ใช้งานที่ล็อกอินด้วย Google (แยกสิทธิ์ admin / customer)
export type UserRole = 'admin' | 'customer';

export interface AppUser {
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt?: string;
  lastLoginAt?: string;
  /** new_member = สมัครไม่เกิน 1 เดือน, member = สมาชิกทั่วไป */
  memberTier?: MemberTier;
  newMemberUntil?: string;
}

export type MemberTier = 'new_member' | 'member';

// รีวิวสินค้า — ชื่อ/รูปผู้รีวิวมาจากบัญชีที่ล็อกอิน (แก้ไขเองไม่ได้)
export interface Review {
  id: string;
  productId: string;
  userEmail: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean; // ผู้รีวิวมีคำสั่งซื้อสินค้านี้จริง
  isTest: boolean; // admin รีวิวเพื่อทดสอบระบบ
  hidden: boolean; // admin ซ่อนรีวิวนี้จากหน้าร้าน
  reply: { text: string; by: string; at: string } | null; // คำตอบจากร้าน (แสดงใต้รีวิว)
  createdAt: string;
  updatedAt: string;
}

/** สิทธิ์การรีวิวของผู้ใช้ปัจจุบัน */
export type ReviewEligibility = 'login' | 'purchase' | 'eligible';

// ผลลัพธ์การค้นหาในหน้า Find Your Bracelet พร้อม Match Score
export interface MatchedProduct {
  product: Product;
  matchScore: number;
  matchedReasons: string[];
}

// ค่าจัดส่ง: ฟรีเมื่อยอดสั่งซื้อครบ 500 บาท (ใช้ร่วมกันทั้ง Client และ Server)
export const FREE_SHIPPING_THRESHOLD = 500;
export const SHIPPING_FEE = 45;

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

// ============================================================================
// PROMOTIONS (โปรโมชั่น)
// ============================================================================
// bill       = ลดรายบิล (โค้ดสร้างอัตโนมัติ แสดงบนหน้าเว็บ) กำหนดยอดขั้นต่ำและส่วนลด
// storewide  = ลดสินค้าทั้งร้านอัตโนมัติตามช่วงเวลา
// product    = ลดรายสินค้า: เลือกสินค้าที่ร่วมรายการ ลดอัตโนมัติ (มียอดขั้นต่ำ / สิทธิ์ได้)
// code       = Code ส่วนลด: ตั้งโค้ดเอง (เช่น NEW) ใช้ทั้งร้านหรือเฉพาะสินค้า ไม่แสดงบนหน้าเว็บ
// new_member = ส่วนลดสมาชิกใหม่ (สมัครไม่เกิน 1 เดือน) ใช้ได้ 1 ครั้งต่อคน
export type PromotionType = 'bill' | 'storewide' | 'product' | 'code' | 'new_member';
export const PROMOTION_TYPES: PromotionType[] = ['bill', 'storewide', 'product', 'code', 'new_member'];
/** ประเภทที่ลดราคาสินค้าอัตโนมัติ (ไม่ต้องกรอกโค้ด) */
export const AUTO_PROMOTION_TYPES: PromotionType[] = ['storewide', 'product'];
export type PromotionScope = 'all' | 'products';
export type DiscountKind = 'amount' | 'percent';
export type PromotionStatus = 'scheduled' | 'active' | 'expired' | 'disabled' | 'used_up';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  image?: string;
  type: PromotionType;
  startAt: string;
  endAt: string;
  enabled: boolean;
  discountKind: DiscountKind;
  discountValue: number;
  maxDiscount?: number | null; // เพดานส่วนลด (เฉพาะแบบเปอร์เซ็นต์)
  minSpend: number;
  perUserLimit: number | null; // ผู้ใช้ 1 คนใช้ได้กี่ครั้งต่อแคมเปญ (null = ไม่จำกัด)
  totalLimit: number | null; // ทั้งแคมเปญใช้ได้รวมกี่ครั้ง (null = ไม่จำกัด)
  signupFrom?: string | null; // new_member: สมัครตั้งแต่วันที่
  scope?: PromotionScope; // code: ใช้ทั้งร้าน หรือเฉพาะสินค้าที่เลือก
  productIds?: string[]; // product / code(scope=products): สินค้าที่ร่วมรายการ
  createdAt: string;
  updatedAt: string;
  usedCount?: number; // คำนวณจากคำสั่งซื้อ
}

export interface AppliedPromotion {
  id: string;
  code: string;
  name: string;
  type: PromotionType;
  discount: number;
}

/** ผลการคำนวณราคา (จากเซิร์ฟเวอร์) สำหรับหน้า Checkout */
export interface CheckoutQuote {
  lines: {
    productId: string;
    selectedSize: string;
    unitPrice: number;
    regularPrice: number;
    quantity: number;
    /** โปรอัตโนมัติที่ลดรายการนี้ */
    promotion: SaleInfo | null;
  }[];
  regularSubtotal: number;
  saleSavings: number;
  autoPromotions: AppliedPromotion[];
  /** โปรอัตโนมัติที่ยังไม่ถึงเงื่อนไข (เช่น ยอดยังไม่ถึงขั้นต่ำ) */
  pendingOffers: (SaleInfo & { reason: string })[];
  subtotal: number;
  discount: number;
  promotion: AppliedPromotion | null;
  promoError: string | null;
  shippingFee: number;
  total: number;
  available: (Pick<Promotion, 'id' | 'code' | 'name' | 'type' | 'discountKind' | 'discountValue' | 'maxDiscount' | 'minSpend' | 'endAt' | 'image'> & {
    eligible: boolean;
    reason: string | null;
  })[];
}

/**
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation]
 * - message ของ Zod เป็น "คีย์ภาษา" (เช่น err.fullName) แล้วแปลตอนแสดงผล
 *   ทำให้ข้อความแจ้งเตือนรองรับทั้ง 5 ภาษา
 * - Schema เดียวกันใช้ตรวจสอบทั้งฝั่งหน้าเว็บและฝั่ง API
 * ============================================================================
 */

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, { message: 'err.fullName' }),
  phone: z.string().trim().regex(/^0[0-9]{8,9}$/, { message: 'err.phone' }),
  address: z.string().trim().min(5, { message: 'err.address' }),
  province: z.string().trim().min(2, { message: 'err.province' }),
  district: z.string().trim().min(2, { message: 'err.district' }),
  postalCode: z.string().trim().regex(/^[0-9]{5}$/, { message: 'err.postalCode' }),
  paymentMethod: z.enum(['promptpay', 'credit_card', 'cod']),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const productFormSchema = z.object({
  name: z.string().trim().min(2, { message: 'err.productName' }),
  englishName: z.string().trim().optional(),
  price: z.number({ message: 'err.price' }).positive({ message: 'err.price' }),
  originalPrice: z.number().nonnegative().optional(),
  stone: z.string().trim().min(2, { message: 'err.stone' }),
  colors: z.array(z.enum(COLORS as [ColorType, ...ColorType[]])).min(1, { message: 'err.colors' }),
  intentions: z
    .array(z.enum(INTENTIONS as [IntentionType, ...IntentionType[]]))
    .min(1, { message: 'err.intentions' }),
  style: z.enum(['Minimal', 'Cute', 'Luxury', 'Everyday']),
  description: z.string().trim().min(10, { message: 'err.description' }),
  belief: z.string().trim().min(10, { message: 'err.belief' }),
  image: z.string().trim().min(1, { message: 'err.image' }),
  images: z.array(z.string()).optional(),
  stock: z.number({ message: 'err.stock' }).int().nonnegative({ message: 'err.stock' }),
  beadSize: z.string(),
  isBestSeller: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// Zod Schema สำหรับฟอร์มรีวิว (ไม่มีช่องชื่อ — ใช้ชื่อจากบัญชีผู้ใช้)
export const reviewSchema = z.object({
  rating: z.number().int().min(1, { message: 'err.rating' }).max(5, { message: 'err.rating' }),
  comment: z.string().trim().min(5, { message: 'err.reviewComment' }).max(1000, { message: 'err.reviewTooLong' }),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

// Zod Schema สำหรับ admin ตอบกลับรีวิว
export const reviewReplySchema = z.object({
  reply: z.string().trim().min(1, { message: 'err.replyEmpty' }).max(1000, { message: 'err.reviewTooLong' }),
});

// Zod Schema สำหรับฟอร์มโปรโมชั่น (admin)
const optionalLimit = z.number().int().min(1, { message: 'err.limit' }).nullable();

export const promotionFormSchema = z
  .object({
    name: z.string().trim().min(2, { message: 'err.promoName' }).max(100),
    description: z.string().trim().max(500).optional(),
    image: z.string().trim().optional(),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9-]{3,32}$/, { message: 'err.promoCode' })
      .optional()
      .or(z.literal('')),
    type: z.enum(['bill', 'storewide', 'product', 'code', 'new_member']),
    startAt: z.string().min(1, { message: 'err.promoStart' }),
    endAt: z.string().min(1, { message: 'err.promoEnd' }),
    enabled: z.boolean(),
    discountKind: z.enum(['amount', 'percent']),
    discountValue: z.number({ message: 'err.discountValue' }).positive({ message: 'err.discountValue' }),
    maxDiscount: z.number().positive().nullable().optional(),
    minSpend: z.number({ message: 'err.minSpend' }).min(0, { message: 'err.minSpend' }),
    perUserLimit: optionalLimit,
    totalLimit: optionalLimit,
    signupFrom: z.string().nullable().optional(),
    scope: z.enum(['all', 'products']).optional(),
    productIds: z.array(z.string()).max(200).optional(),
  })
  .refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), { message: 'err.promoRange', path: ['endAt'] })
  .refine((v) => v.discountKind !== 'percent' || v.discountValue <= 90, { message: 'err.percentMax', path: ['discountValue'] })
  .refine((v) => v.type !== 'new_member' || !!v.signupFrom, { message: 'err.signupFrom', path: ['signupFrom'] })
  .refine((v) => v.type !== 'code' || !!v.code?.trim(), { message: 'err.customCode', path: ['code'] })
  .refine(
    (v) => !(v.type === 'product' || (v.type === 'code' && v.scope === 'products')) || (v.productIds?.length ?? 0) > 0,
    { message: 'err.productIds', path: ['productIds'] }
  );

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;
