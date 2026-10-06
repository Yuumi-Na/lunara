/**
 * LUNARA - REST API ROUTES
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create, Read, Update, Delete)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (RESTful Endpoints)]
 *
 * สรุป Endpoints (🔓 = ทุกคน, 👤 = ต้องล็อกอิน, 🛡️ = admin เท่านั้น):
 * 🔓 GET    /api/config               -> ค่าตั้งค่าสาธารณะ (Google Client ID)
 * 🔓 POST   /api/auth/google          -> ล็อกอินด้วย Google ID Token
 * 🔓 GET    /api/auth/me              -> ข้อมูลผู้ใช้ปัจจุบัน
 * 🔓 POST   /api/auth/logout          -> ออกจากระบบ
 * 🔓 POST   /api/auth/admin-login     -> Admin ล็อกอินด้วย Username / Password
 * 🔓 GET    /api/products             -> ดึงสินค้าทั้งหมด
 * 🔓 GET    /api/products/:id         -> ดึงสินค้าตาม ID
 * 🛡️ POST   /api/products             -> เพิ่มสินค้า
 * 🛡️ PUT    /api/products/:id         -> แก้ไขสินค้า
 * 🛡️ DELETE /api/products/:id         -> ลบสินค้า
 * 👤 GET    /api/orders               -> คำสั่งซื้อของฉัน (admin ใช้ ?scope=all ดูทั้งหมด)
 * 👤 POST   /api/orders               -> สร้างคำสั่งซื้อ (Checkout)
 * 🛡️ PATCH  /api/orders/:id/status    -> เปลี่ยนสถานะคำสั่งซื้อ
 * 🛡️ GET    /api/media?dir=           -> โฟลเดอร์และรูปในโฟลเดอร์ img/
 * 🛡️ POST   /api/media/upload?dir=    -> อัปโหลดรูป JPG / PNG / WEBP จากเครื่อง
 * 🛡️ POST   /api/media/folder         -> สร้างโฟลเดอร์ใหม่
 * 🛡️ DELETE /api/media?path=          -> ลบรูป หรือโฟลเดอร์ว่าง
 * 🔓 GET    /img/...                  -> แสดงไฟล์รูป (server.ts)
 * 🔓 GET    /api/products/:id/reviews -> รีวิวของสินค้า + สิทธิ์รีวิวของผู้ใช้ปัจจุบัน
 * 👤 POST   /api/products/:id/reviews -> เขียน/แก้รีวิว (ต้องซื้อสินค้านี้แล้ว หรือเป็น admin ทดสอบ)
 * 👤 DELETE /api/reviews/:id          -> ลบรีวิว (เจ้าของรีวิว หรือ admin)
 * 🔓 GET    /api/reviews/featured     -> รีวิวล่าสุดสำหรับหน้าแรก
 * 🛡️ GET    /api/admin/reviews        -> รีวิวทั้งหมด (รวมที่ซ่อน) สำหรับหลังร้าน
 * 🛡️ PATCH  /api/admin/reviews/:id    -> ตอบกลับลูกค้า / ซ่อน / แสดงรีวิว
 * 🔓 GET    /api/promotions           -> โปรโมชั่นที่กำลังใช้งาน (หน้าแรก)
 * 🔓 POST   /api/checkout/quote       -> คำนวณราคา + ส่วนลด ก่อนสั่งซื้อ
 * 🛡️ GET    /api/admin/promotions     -> โปรโมชั่นทั้งหมด
 * 🛡️ POST   /api/admin/promotions     -> สร้างโปรโมชั่น (ลดรายบิล / ลดทั้งร้าน / ลดรายสินค้า / Code ส่วนลด / สมาชิกใหม่)
 * 🛡️ PUT    /api/admin/promotions/:id -> แก้ไขโปรโมชั่น
 * 🛡️ DELETE /api/admin/promotions/:id -> ลบโปรโมชั่น
 * 🛡️ GET    /api/admin/users          -> รายชื่อลูกค้า
 * 🛡️ GET    /api/admin/stats          -> สรุปภาพรวมร้าน
 * ============================================================================
 */

import crypto from 'crypto';
import { Response, Router } from 'express';
import { z } from 'zod';
import { CRAFT_MAX_STONES, CRAFT_MIN_STONES } from '../data/craft.ts';
import { generatePromoCode, promotionStatus } from '../data/promotions.ts';
import {
  calcShipping as calcShippingAfter,
  checkoutSchema,
  Order,
  ORDER_STATUSES,
  Product,
  productFormSchema,
  promotionFormSchema,
  Promotion,
  reviewReplySchema,
  reviewSchema,
} from '../types/index.ts';
import {
  GOOGLE_CLIENT_ID,
  handleGoogleLogin,
  handleLogout,
  handleMe,
  handlePasswordLogin,
  PASSWORD_LOGIN_ENABLED,
  requireAdmin,
  requireAuth,
  roleOf,
} from './auth.ts';
import * as store from './db.ts';
import { countImages, media } from './media.ts';
import { activeAutoPromotions, buildQuote, checkPromotion, priceItems, PricingError, withPromotions } from './pricing.ts';

export const api = Router();

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, code, message });

// ----------------------------------------------------------------------------
// 0. CONFIG & AUTH
// ----------------------------------------------------------------------------
api.get('/config', (_req, res) => {
  res.json({ success: true, googleClientId: GOOGLE_CLIENT_ID, passwordLogin: PASSWORD_LOGIN_ENABLED });
});

api.post('/auth/google', handleGoogleLogin);
api.get('/auth/me', handleMe);
api.post('/auth/logout', handleLogout);
api.post('/auth/admin-login', handlePasswordLogin);

// ----------------------------------------------------------------------------
// 1. PRODUCTS API (โมดูล 9 & 10: CRUD)
// ----------------------------------------------------------------------------
// คะแนนรีวิวคำนวณจากรีวิวจริงในฐานข้อมูลเท่านั้น
// และราคาลด/ข้อเสนอจากโปรอัตโนมัติ (ลดทั้งร้าน / ลดรายสินค้า)
function withReviewStats(products: Product[]): Product[] {
  const stats = store.reviewStats();
  const auto = activeAutoPromotions();
  return products.map((p) =>
    withPromotions({ ...p, rating: stats.get(p.id)?.rating ?? 0, reviewCount: stats.get(p.id)?.count ?? 0 }, auto)
  );
}

api.get('/products', (_req, res) => {
  const products = withReviewStats(store.listProducts());
  res.json({ success: true, count: products.length, data: products });
});

api.get('/products/:id', (req, res) => {
  const product = store.getProduct(req.params.id);
  if (!product) return fail(res, 404, 'NOT_FOUND', `Product not found: ${req.params.id}`);
  res.json({ success: true, data: withReviewStats([product])[0] });
});

api.post('/products', requireAdmin, (req, res) => {
  const parsed = productFormSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');

  const product: Product = {
    ...parsed.data,
    id: `prod-${crypto.randomUUID().slice(0, 8)}`,
  };
  res.status(201).json({ success: true, data: store.insertProduct(product) });
});

// ช่องที่มีคำแปล: ถ้าแก้ภาษาไทย ให้ลบคำแปลเก่าของช่องนั้นทิ้ง (จะแสดงข้อความใหม่แทนคำแปลที่ล้าสมัย)
const TRANSLATED_FIELDS = ['name', 'stone', 'beadSize', 'description', 'belief'] as const;

api.put('/products/:id', requireAdmin, (req, res) => {
  const existing = store.getProduct(req.params.id);
  if (!existing) return fail(res, 404, 'NOT_FOUND', `Product not found: ${req.params.id}`);

  const parsed = productFormSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');

  const translations = structuredClone(existing.translations ?? {});
  for (const field of TRANSLATED_FIELDS) {
    if (parsed.data[field] !== existing[field]) {
      Object.values(translations).forEach((tr) => tr && delete tr[field]);
      if (field === 'belief') delete existing.personalBeliefLore;
    }
  }

  const updated: Product = { ...existing, ...parsed.data, id: existing.id, translations };
  res.json({ success: true, data: store.saveProduct(updated) });
});

api.delete('/products/:id', requireAdmin, (req, res) => {
  if (!store.removeProduct(req.params.id)) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// 1.1 REVIEWS (รีวิวจริงเท่านั้น: ผู้ซื้อสินค้าแล้ว หรือ admin ทดสอบระบบ)
// ----------------------------------------------------------------------------
api.get('/products/:id/reviews', (req, res) => {
  const reviews = store.listReviews(req.params.id);
  const user = req.user;
  let eligibility: 'login' | 'purchase' | 'eligible' = 'login';
  if (user) {
    eligibility = user.role === 'admin' || store.findPurchase(user.email, req.params.id) ? 'eligible' : 'purchase';
  }
  res.json({
    success: true,
    data: {
      reviews,
      me: { eligibility, review: user ? store.findUserReview(req.params.id, user.email) : null },
    },
  });
});

api.post('/products/:id/reviews', requireAuth, (req, res) => {
  const product = store.getProduct(req.params.id);
  if (!product) return fail(res, 404, 'NOT_FOUND', 'Product not found');

  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');

  const user = req.user!;
  const purchase = store.findPurchase(user.email, product.id);
  const isAdmin = user.role === 'admin';
  if (!purchase && !isAdmin) return fail(res, 403, 'NOT_PURCHASED', 'Only customers who bought this product can review it');

  const review = store.saveReview({
    productId: product.id,
    email: user.email,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    orderId: purchase?.id ?? null,
    isTest: isAdmin && !purchase,
  });
  res.status(201).json({ success: true, data: review });
});

api.delete('/reviews/:id', requireAuth, (req, res) => {
  const review = store.findReview(req.params.id);
  if (!review) return fail(res, 404, 'NOT_FOUND', 'Review not found');
  if (review.userEmail !== req.user!.email && req.user!.role !== 'admin') return fail(res, 403, 'FORBIDDEN', 'Not allowed');
  store.removeReview(review.id);
  res.json({ success: true });
});

api.get('/reviews/featured', (_req, res) => {
  const products = new Map(store.listProducts().map((p) => [p.id, p]));
  const reviews = store
    .latestReviews(8)
    .filter((r) => products.has(r.productId))
    .slice(0, 4)
    .map((r) => ({ ...r, productName: products.get(r.productId)!.name, productEnglishName: products.get(r.productId)!.englishName }));
  res.json({ success: true, data: { reviews, stats: store.overallReviewStats() } });
});

// ----------------------------------------------------------------------------
// 2. ORDERS API (คำสั่งซื้อ — ต้องล็อกอินด้วย Google ก่อน)
// ----------------------------------------------------------------------------
api.get('/orders', requireAuth, (req, res) => {
  const all = req.query.scope === 'all';
  if (all && req.user!.role !== 'admin') return fail(res, 403, 'FORBIDDEN', 'Admin only');
  const orders = store.listOrders(all ? undefined : req.user!.email);
  res.json({ success: true, count: orders.length, data: orders });
});

const itemsSchema = z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(20),
        selectedSize: z.string().min(1).max(20),
        craft: z
          .object({
            stoneIds: z.array(z.string()).min(CRAFT_MIN_STONES).max(CRAFT_MAX_STONES),
            beadSize: z.string(),
            charm: z.string(),
          })
          .optional(),
      })
    )
    .min(1)
    .max(50);

const promoCodeSchema = z.string().trim().max(40).optional().nullable();

const orderRequestSchema = checkoutSchema.extend({
  items: itemsSchema,
  promoCode: promoCodeSchema,
});

// คำนวณราคา + ส่วนลด (ใช้ในหน้า Checkout ก่อนกดสั่งซื้อ)
api.post('/checkout/quote', (req, res) => {
  const parsed = z.object({ items: itemsSchema, promoCode: promoCodeSchema }).safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');
  try {
    res.json({ success: true, data: buildQuote(parsed.data.items, req.user ?? null, parsed.data.promoCode).quote });
  } catch (err) {
    if (err instanceof PricingError) {
      return res.status(409).json({ success: false, code: err.code, productId: err.productId, message: err.code });
    }
    throw err;
  }
});

api.post('/orders', requireAuth, (req, res) => {
  const parsed = orderRequestSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');
  const { items: requested, fullName, promoCode, ...shipping } = parsed.data;
  const user = req.user!;

  try {
    // ทำทั้งหมดใน transaction: ตรวจสต็อก -> ตัดสต็อก -> ตรวจโค้ด/สิทธิ์ -> บันทึกคำสั่งซื้อ
    const order = store.transaction(() => {
      const { items, subtotal, saleSavings, autoPromotions } = priceItems(requested, user, { checkStock: true });
      for (const it of items) {
        if (it.product.craft) continue;
        const stored = store.getProduct(it.product.id)!;
        store.saveProduct({ ...stored, stock: stored.stock - it.quantity });
      }

      let promotion: Order['promotion'] = null;
      if (promoCode) {
        const p = store.findPromotionByCode(promoCode);
        const check = p ? checkPromotion(p, user, items) : { reason: 'promo.errInvalid', discount: 0 };
        if (!p || check.reason) throw Object.assign(new Error('PROMO'), { code: 'PROMO_REJECTED', reason: check.reason });
        promotion = { id: p.id, code: p.code, name: p.name, type: p.type, discount: check.discount };
      }

      const discount = promotion?.discount ?? 0;
      const shippingFee = calcShippingAfter(subtotal - discount);
      const newOrder: Order = {
        ...shipping,
        customerName: fullName,
        id: `ORD-${Date.now().toString(36).toUpperCase()}${crypto.randomInt(100, 999)}`,
        userEmail: user.email,
        items,
        subtotal,
        saleSavings,
        autoPromotions,
        discount,
        promotion,
        shippingFee,
        total: subtotal - discount + shippingFee,
        status: 'Ordered',
        createdAt: new Date().toISOString(),
      };
      return store.insertOrder(newOrder);
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    if (err?.code === 'PROMO_REJECTED') {
      return res.status(409).json({ success: false, code: err.code, reason: err.reason, message: err.reason });
    }
    if (err?.code === 'OUT_OF_STOCK' || err?.code === 'NOT_FOUND') {
      return res.status(409).json({ success: false, code: err.code, productId: err.productId, message: err.code });
    }
    console.error('Create order failed:', err);
    fail(res, 500, 'SERVER_ERROR', 'Could not create order');
  }
});

api.patch('/orders/:id/status', requireAdmin, (req, res) => {
  const status = req.body?.status;
  if (!ORDER_STATUSES.includes(status)) return fail(res, 400, 'VALIDATION', 'Invalid status');
  const order = store.updateOrderStatus(req.params.id, status);
  if (!order) return fail(res, 404, 'NOT_FOUND', 'Order not found');
  res.json({ success: true, data: order });
});

// ----------------------------------------------------------------------------
// 3. IMAGE FOLDER (โฟลเดอร์ img/) — ดู server/media.ts
// ----------------------------------------------------------------------------
api.use('/media', media);

// ----------------------------------------------------------------------------
// 4. ADMIN: CUSTOMERS & DASHBOARD
// ----------------------------------------------------------------------------
// รีวิวทั้งหมดพร้อมชื่อ/รูปสินค้า
api.get('/admin/reviews', requireAdmin, (_req, res) => {
  const products = new Map(store.listProducts().map((p) => [p.id, p]));
  const data = store.listAllReviews().map((r) => ({
    ...r,
    productName: products.get(r.productId)?.name ?? null,
    productImage: products.get(r.productId)?.image ?? null,
  }));
  res.json({ success: true, data });
});

// body: { reply: "ข้อความ" } ตอบกลับ, { reply: null } ลบคำตอบ, { hidden: true/false } ซ่อน/แสดง
api.patch('/admin/reviews/:id', requireAdmin, (req, res) => {
  const review = store.findReview(req.params.id);
  if (!review) return fail(res, 404, 'NOT_FOUND', 'Review not found');

  let updated = review;
  if ('reply' in (req.body ?? {})) {
    if (req.body.reply === null) {
      updated = store.setReviewReply(review.id, null, req.user!.name)!;
    } else {
      const parsed = reviewReplySchema.safeParse(req.body);
      if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');
      updated = store.setReviewReply(review.id, parsed.data.reply, 'LUNARA')!;
    }
  }
  if (typeof req.body?.hidden === 'boolean') {
    updated = store.setReviewHidden(review.id, req.body.hidden)!;
  }
  res.json({ success: true, data: updated });
});

// ----------------------------------------------------------------------------
// 5. PROMOTIONS (โปรโมชั่น)
// ----------------------------------------------------------------------------
// สาธารณะ: โปรที่กำลังใช้งาน (ไม่เปิดเผยจำนวนการใช้)
api.get('/promotions', (_req, res) => {
  const data = store
    .listPromotions()
    // "Code ส่วนลด" เป็นโค้ดที่ร้านแจกเอง ไม่แสดงบนหน้าเว็บ
    .filter((p) => p.type !== 'code' && promotionStatus(p) === 'active')
    .map(({ usedCount: _used, totalLimit: _total, ...p }) => p);
  res.json({ success: true, data });
});

api.get('/admin/promotions', requireAdmin, (_req, res) => {
  res.json({ success: true, data: store.listPromotions().map((p) => ({ ...p, status: promotionStatus(p) })) });
});

function normalizePromotion(input: unknown, existing: Promotion | null): { error?: string; promotion?: Promotion } {
  const parsed = promotionFormSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid' };
  const v = parsed.data;

  // สินค้าที่ร่วมรายการต้องมีอยู่จริง
  const usesProducts = v.type === 'product' || (v.type === 'code' && v.scope === 'products');
  const productIds = usesProducts ? Array.from(new Set(v.productIds ?? [])).filter((id) => store.getProduct(id)) : [];
  if (usesProducts && productIds.length === 0) return { error: 'err.productIds' };

  // ไม่ระบุโค้ด -> สร้างให้อัตโนมัติตามประเภทและวันเริ่ม (ไม่ซ้ำกับโค้ดเดิม)
  // "Code ส่วนลด" ผู้ดูแลตั้งโค้ดเอง เช่น NEW
  let code = v.code?.trim().toUpperCase() || (v.type === 'code' ? '' : existing?.code) || '';
  if (!code && v.type === 'code') return { error: 'err.customCode' };
  if (!code) {
    do code = generatePromoCode(v.type, v.startAt);
    while (store.promoCodeExists(code));
  } else if (store.promoCodeExists(code, existing?.id)) {
    return { error: 'err.promoCodeTaken' };
  }

  const now = new Date().toISOString();
  return {
    promotion: {
      id: existing?.id ?? `promo-${crypto.randomUUID().slice(0, 8)}`,
      code,
      name: v.name,
      description: v.description || undefined,
      image: v.image || undefined,
      type: v.type,
      startAt: new Date(v.startAt).toISOString(),
      endAt: new Date(v.endAt).toISOString(),
      enabled: v.enabled,
      discountKind: v.type === 'new_member' ? 'amount' : v.discountKind,
      discountValue: v.discountValue,
      maxDiscount: v.discountKind === 'percent' ? v.maxDiscount ?? null : null,
      // ลดทั้งร้าน: ใช้อัตโนมัติกับทุกคน ไม่มียอดขั้นต่ำและสิทธิ์การใช้
      // ลดรายสินค้า / Code ส่วนลด / ลดรายบิล: กำหนดยอดขั้นต่ำและสิทธิ์ได้
      minSpend: v.type === 'storewide' ? 0 : v.minSpend,
      perUserLimit: v.type === 'storewide' ? null : v.type === 'new_member' ? 1 : v.perUserLimit,
      totalLimit: v.type === 'storewide' ? null : v.totalLimit,
      signupFrom: v.type === 'new_member' && v.signupFrom ? new Date(v.signupFrom).toISOString() : null,
      scope: v.type === 'code' ? v.scope ?? 'all' : undefined,
      productIds: usesProducts ? productIds : undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    },
  };
}

api.post('/admin/promotions', requireAdmin, (req, res) => {
  const { error, promotion } = normalizePromotion(req.body, null);
  if (error) return fail(res, 400, 'VALIDATION', error);
  res.status(201).json({ success: true, data: store.savePromotion(promotion!) });
});

api.put('/admin/promotions/:id', requireAdmin, (req, res) => {
  const existing = store.getPromotion(req.params.id);
  if (!existing) return fail(res, 404, 'NOT_FOUND', 'Promotion not found');
  const { error, promotion } = normalizePromotion(req.body, existing);
  if (error) return fail(res, 400, 'VALIDATION', error);
  res.json({ success: true, data: store.savePromotion(promotion!) });
});

api.delete('/admin/promotions/:id', requireAdmin, (req, res) => {
  if (!store.removePromotion(req.params.id)) return fail(res, 404, 'NOT_FOUND', 'Promotion not found');
  res.json({ success: true });
});

api.get('/admin/users', requireAdmin, (_req, res) => {
  res.json({ success: true, data: store.listUsers(roleOf) });
});

api.get('/admin/stats', requireAdmin, async (_req, res) => {
  const orders = store.listOrders();
  const products = store.listProducts();
  const active = orders.filter((o) => o.status !== 'Cancelled');
  res.json({
    success: true,
    data: {
      revenue: active.reduce((sum, o) => sum + o.total, 0),
      orderCount: orders.length,
      pendingCount: orders.filter((o) => o.status === 'Ordered' || o.status === 'Preparing').length,
      productCount: products.length,
      lowStock: products.filter((p) => p.stock <= 5).map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
      customerCount: store.listUsers(roleOf).length,
      activePromotions: store.listPromotions().filter((p) => promotionStatus(p) === 'active').length,
      unansweredReviews: store.listAllReviews().filter((r) => !r.reply && !r.hidden).length,
      imageCount: await countImages(),
    },
  });
});

// API ที่ไม่มีอยู่จริง
api.use((_req, res) => fail(res, 404, 'NOT_FOUND', 'Unknown API endpoint'));
