/**
 * LUNARA E-COMMERCE - DATA TYPES & SCHEMAS
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript & TypeScript Data Types]
 * - การกำหนดชนิดข้อมูล (Interface & Type)
 * - Object และ Array Types สำหรับสินค้า, ตะกร้า, คำสั่งซื้อ และตัวกรอง
 * ============================================================================
 */

import { z } from 'zod';

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
export type ColorType =
  | 'Pink'
  | 'Purple'
  | 'Yellow'
  | 'Black'
  | 'White'
  | 'Green';

// สไตล์การออกแบบกำไล (Styles)
export type StyleType = 'Minimal' | 'Cute' | 'Luxury' | 'Everyday';

// ช่วงราคา (Price Ranges)
export type PriceRangeType = 'Under 300' | '300-500' | '500-800' | '800+';

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

// ข้อมูลสินค้ากำไลหินมงคล (Product Interface)
export interface Product {
  id: string;
  name: string;
  englishName?: string;
  price: number;
  originalPrice?: number;
  stone: string; // ชื่อหินหลัก เช่น "Rose Quartz (โรสควอตซ์)"
  stoneType?: string;
  tagline?: string;
  stoneDetails?: string[]; // รายชื่อหินที่เป็นส่วนประกอบ
  stones?: {
    name: string;
    stoneType: string;
    benefit: string;
    intentions: string[];
    color: string;
  }[];
  colors: ColorType[]; // โทนสีของกำไล
  intentions: IntentionType[]; // เสริมด้านใดบ้าง
  style: StyleType; // สไตล์
  image: string; // URL รูปภาพ
  images?: string[];
  description: string; // รายละเอียดสินค้า
  belief: string; // คำอธิบายความเชื่อและความหมายมงคล
  personalBeliefLore?: string; // ตำนานความเชื่อเพิ่มเติม
  mineralDetails?: {
    origin: string;
    hardness: string;
    chakra: string;
    element: string;
  };
  careRitual?: string; // การดูแลรักษาและชำระล้างหิน
  stock: number; // จำนวนสินค้าในคลัง
  beadSize?: string; // ขนาดเม็ดหิน เช่น "หินเจีย ขนาด 3 มิล", "8mm", "10mm"
  beadSizes?: string[];
  isMultiStone?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewCount?: number;
}

// รายการสินค้าในตะกร้า (Cart Item)
export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string; // เช่น "15 ซม.", "16 ซม.", "17 ซม."
}

// สถานะคำสั่งซื้อ (Order Status)
export type OrderStatus = 'Ordered' | 'Preparing' | 'Shipping' | 'Completed';

// ข้อมูลคำสั่งซื้อ (Order Interface)
export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  postalCode: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

// ข้อมูลตัวกรองในหน้า Shop & Find Your Bracelet
export interface FilterState {
  searchQuery: string;
  intentions: IntentionType[];
  colors: ColorType[];
  styles: StyleType[];
  priceRanges: PriceRangeType[];
}

// ผลลัพธ์การค้นหาในหน้า Find Your Bracelet พร้อม Match Score
export interface MatchedProduct {
  product: Product;
  matchScore: number; // คำนวณเป็นร้อยละ 100%, 80%, 60% เป็นต้น
  matchedReasons: string[]; // เหตุผลที่ตรงกับตัวเลือกของผู้ใช้
}

// ผู้ดูแลระบบ / Google OAuth User
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin';
}

/**
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation]
 * - การสร้าง Schema เพื่อตรวจสอบความถูกต้องของฟอร์ม Checkout และ Product CRUD
 * ============================================================================
 */

// Zod Schema สำหรับฟอร์ม Checkout (หน้าชำระเงิน)
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: 'กรุณากรอกชื่อ-นามสกุลอย่างน้อย 3 ตัวอักษร' }),
  phone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, {
      message: 'กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (ขึ้นต้นด้วย 0 ความยาว 9-10 หลัก)',
    }),
  address: z
    .string()
    .min(5, { message: 'กรุณากรอกที่อยู่ เลขที่ ซอย ถนน อย่างละเอียด' }),
  province: z
    .string()
    .min(2, { message: 'กรุณากรอกจังหวัด' }),
  district: z
    .string()
    .min(2, { message: 'กรุณากรอกเขต / อำเภอ' }),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, { message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก' }),
  paymentMethod: z.enum(['promptpay', 'credit_card', 'cod']),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// Zod Schema สำหรับฟอร์มจัดการสินค้า Admin (CRUD)
export const productFormSchema = z.object({
  name: z.string().min(2, { message: 'ชื่อสินค้าต้องมีอย่างน้อย 2 ตัวอักษร' }),
  price: z.number().positive({ message: 'ราคาต้องมากกว่า 0 บาท' }),
  stone: z.string().min(2, { message: 'กรุณาระบุชื่อหินมงคล' }),
  colors: z.array(z.string()).min(1, { message: 'กรุณาเลือกสีอย่างน้อย 1 สี' }),
  intentions: z.array(z.string()).min(1, { message: 'กรุณาเลือกด้านมงคลอย่างน้อย 1 ด้าน' }),
  style: z.enum(['Minimal', 'Cute', 'Luxury', 'Everyday']),
  description: z.string().min(10, { message: 'คำอธิบายสินค้าต้องมีอย่างน้อย 10 ตัวอักษร' }),
  belief: z.string().min(10, { message: 'ความหมาย/ความเชื่อต้องมีอย่างน้อย 10 ตัวอักษร' }),
  image: z.string().min(1, { message: 'กรุณากรอกที่อยู่รูปภาพ' }),
  stock: z.number().int().nonnegative({ message: 'จำนวนสต็อกต้องไม่ติดลบ' }),
  beadSize: z.string(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
