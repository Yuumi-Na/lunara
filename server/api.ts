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
 * 🛡️ GET    /api/admin/users          -> รายชื่อลูกค้า
 * 🛡️ GET    /api/admin/stats          -> สรุปภาพรวมร้าน
 * ============================================================================
 */

import crypto from 'crypto';
import { Response, Router } from 'express';
import { z } from 'zod';
import { calcCraftPrice, CRAFT_MAX_STONES, CRAFT_MIN_STONES } from '../data/craft.ts';
import { LUCKY_STONES_CATALOG } from '../data/stones.ts';
import {
  calcShipping,
  CartItem,
  checkoutSchema,
  Order,
  ORDER_STATUSES,
  Product,
  productFormSchema,
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
function withReviewStats(products: Product[]): Product[] {
  const stats = store.reviewStats();
  return products.map((p) => ({ ...p, rating: stats.get(p.id)?.rating ?? 0, reviewCount: stats.get(p.id)?.count ?? 0 }));
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

const orderRequestSchema = checkoutSchema.extend({
  items: z
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
    .min(1),
});

// สร้างข้อมูลกำไลคราฟต์ฝั่งเซิร์ฟเวอร์จากหินที่เลือก (ราคาคำนวณใหม่เสมอ)
function buildCraftProduct(id: string, craft: { stoneIds: string[]; beadSize: string; charm: string }): Product {
  const stones = craft.stoneIds.map((sid) => {
    const stone = LUCKY_STONES_CATALOG.find((s) => s.id === sid);
    if (!stone) throw new Error(`Unknown stone: ${sid}`);
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

api.post('/orders', requireAuth, (req, res) => {
  const parsed = orderRequestSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, 'VALIDATION', parsed.error.issues[0]?.message ?? 'Invalid');
  const { items: requested, fullName, ...shipping } = parsed.data;

  try {
    const order = store.transaction(() => {
      const items: CartItem[] = requested.map((it) => {
        if (it.craft) {
          return { product: buildCraftProduct(it.productId, it.craft), quantity: it.quantity, selectedSize: it.selectedSize };
        }
        const product = store.getProduct(it.productId);
        if (!product) throw Object.assign(new Error('NOT_FOUND'), { code: 'NOT_FOUND', productId: it.productId });
        if (product.stock < it.quantity) {
          throw Object.assign(new Error('OUT_OF_STOCK'), { code: 'OUT_OF_STOCK', productId: it.productId });
        }
        store.saveProduct({ ...product, stock: product.stock - it.quantity });
        return { product, quantity: it.quantity, selectedSize: it.selectedSize };
      });

      // ราคาคำนวณจากฐานข้อมูลเท่านั้น
      const subtotal = items.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
      const shippingFee = calcShipping(subtotal);

      const newOrder: Order = {
        ...shipping,
        customerName: fullName,
        id: `ORD-${Date.now().toString(36).toUpperCase()}${crypto.randomInt(100, 999)}`,
        userEmail: req.user!.email,
        items,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        status: 'Ordered',
        createdAt: new Date().toISOString(),
      };
      return store.insertOrder(newOrder);
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
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
      unansweredReviews: store.listAllReviews().filter((r) => !r.reply && !r.hidden).length,
      imageCount: await countImages(),
    },
  });
});

// API ที่ไม่มีอยู่จริง
api.use((_req, res) => fail(res, 404, 'NOT_FOUND', 'Unknown API endpoint'));
