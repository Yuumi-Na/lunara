/**
 * LUNARA - DATABASE LAYER (SQLite ในตัวของ Node.js)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD + ฐานข้อมูลจริง]
 *
 * ใช้ node:sqlite (มีมากับ Node.js 22.5+ ไม่ต้องติดตั้งเพิ่ม) เก็บข้อมูลลงไฟล์
 *   storage/lunara.db  -> ข้อมูลไม่หายเมื่อรีสตาร์ทเซิร์ฟเวอร์
 *
 * ตาราง:
 * - products : สินค้า (เก็บเป็น JSON ทั้งก้อน + คอลัมน์ไว้เรียงลำดับ)
 * - orders   : คำสั่งซื้อ ผูกกับอีเมลผู้สั่ง (user_email)
 * - users    : ผู้ใช้ที่ล็อกอินด้วย Google (หรือ admin แบบรหัสผ่าน)
 * - reviews  : รีวิวสินค้าจากผู้ซื้อจริง
 * - promotions : โปรโมชั่น (ลดรายบิล / ลดทั้งร้าน / สมาชิกใหม่)
 *
 * รูปภาพเก็บเป็นไฟล์ในโฟลเดอร์ img/ (ดู server/media.ts)
 * ============================================================================
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../data/products.ts';
import { PRODUCT_TRANSLATIONS } from '../data/productTranslations.ts';
import type { AppUser, Order, OrderStatus, Product, Promotion, Review, UserRole } from '../types/index.ts';
import { memberInfo } from '../data/promotions.ts';

const STORAGE_DIR = process.env.LUNARA_STORAGE_DIR || path.resolve(process.cwd(), 'storage');
fs.mkdirSync(STORAGE_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(STORAGE_DIR, 'lunara.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS products (
    id         TEXT PRIMARY KEY,
    data       TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    email         TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    avatar        TEXT,
    created_at    TEXT NOT NULL,
    last_login_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id         TEXT PRIMARY KEY,
    user_email TEXT NOT NULL REFERENCES users(email),
    status     TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_email, created_at);

`);

const now = () => new Date().toISOString();

// ----------------------------------------------------------------------------
// Seed: ใส่สินค้าเริ่มต้นครั้งแรกที่ฐานข้อมูลยังว่าง
// ----------------------------------------------------------------------------
const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number };
if (productCount.c === 0) {
  const insert = db.prepare(
    'INSERT INTO products (id, data, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  );
  INITIAL_PRODUCTS.forEach((p, index) => {
    const withTranslations: Product = { ...p, translations: PRODUCT_TRANSLATIONS[p.id] };
    insert.run(p.id, JSON.stringify(withTranslations), index, now(), now());
  });
}

// ----------------------------------------------------------------------------
// PRODUCTS
// ----------------------------------------------------------------------------
export function listProducts(): Product[] {
  const rows = db.prepare('SELECT data FROM products ORDER BY sort_order ASC, created_at DESC').all() as {
    data: string;
  }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function getProduct(id: string): Product | null {
  const row = db.prepare('SELECT data FROM products WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function insertProduct(product: Product): Product {
  // สินค้าใหม่แสดงก่อนสินค้าเดิม (sort_order ติดลบ)
  const min = db.prepare('SELECT MIN(sort_order) AS m FROM products').get() as { m: number | null };
  db.prepare('INSERT INTO products (id, data, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(
    product.id,
    JSON.stringify(product),
    (min.m ?? 0) - 1,
    now(),
    now()
  );
  return product;
}

export function saveProduct(product: Product): Product {
  db.prepare('UPDATE products SET data = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify(product),
    now(),
    product.id
  );
  return product;
}

export function removeProduct(id: string): boolean {
  return db.prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0;
}

// ----------------------------------------------------------------------------
// USERS
// ----------------------------------------------------------------------------
interface UserRow {
  email: string;
  name: string;
  avatar: string | null;
  created_at: string;
  last_login_at: string;
}

function toUser(row: UserRow, role: UserRole): AppUser {
  const member = memberInfo(row.created_at);
  return {
    memberTier: member.tier,
    newMemberUntil: member.newMemberUntil,
    email: row.email,
    name: row.name,
    avatar: row.avatar ?? undefined,
    role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export function upsertUser(email: string, name: string, avatar: string | undefined): void {
  db.prepare(
    `INSERT INTO users (email, name, avatar, created_at, last_login_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET name = excluded.name, avatar = excluded.avatar,
       last_login_at = excluded.last_login_at`
  ).run(email, name, avatar ?? null, now(), now());
}

export function findUser(email: string, roleOf: (email: string) => UserRole): AppUser | null {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  return row ? toUser(row, roleOf(row.email)) : null;
}

export function listUsers(roleOf: (email: string) => UserRole): (AppUser & { orderCount: number })[] {
  const rows = db
    .prepare(
      `SELECT u.*, (SELECT COUNT(*) FROM orders o WHERE o.user_email = u.email) AS order_count
       FROM users u ORDER BY u.last_login_at DESC`
    )
    .all() as unknown as (UserRow & { order_count: number })[];
  return rows.map((r) => ({ ...toUser(r, roleOf(r.email)), orderCount: r.order_count }));
}

// ----------------------------------------------------------------------------
// ORDERS
// ----------------------------------------------------------------------------
export function listOrders(userEmail?: string): Order[] {
  const rows = (
    userEmail
      ? db.prepare('SELECT data FROM orders WHERE user_email = ? ORDER BY created_at DESC').all(userEmail)
      : db.prepare('SELECT data FROM orders ORDER BY created_at DESC').all()
  ) as { data: string }[];
  return rows.map((r) => JSON.parse(r.data));
}

export function getOrder(id: string): Order | null {
  const row = db.prepare('SELECT data FROM orders WHERE id = ?').get(id) as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
}

export function insertOrder(order: Order): Order {
  db.prepare('INSERT INTO orders (id, user_email, status, data, created_at) VALUES (?, ?, ?, ?, ?)').run(
    order.id,
    order.userEmail,
    order.status,
    JSON.stringify(order),
    order.createdAt
  );
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = getOrder(id);
  if (!order) return null;
  const updated = { ...order, status };
  db.prepare('UPDATE orders SET status = ?, data = ? WHERE id = ?').run(status, JSON.stringify(updated), id);
  return updated;
}

// ทำงานหลายคำสั่งให้สำเร็จพร้อมกันทั้งหมด หรือยกเลิกทั้งหมด (Transaction)
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ----------------------------------------------------------------------------
// REVIEWS (รีวิวจริงจากลูกค้าที่ซื้อสินค้าแล้ว หรือ admin ทดสอบระบบ)
// ----------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    product_id  TEXT NOT NULL,
    user_email  TEXT NOT NULL REFERENCES users(email),
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT NOT NULL,
    order_id    TEXT,
    is_test     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE (product_id, user_email)
  );
  CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, created_at);
`);

// เพิ่มคอลัมน์สำหรับการจัดการรีวิวของ admin (ฐานข้อมูลเดิมที่สร้างไว้ก่อนจะได้คอลัมน์ใหม่อัตโนมัติ)
{
  const cols = (db.prepare('PRAGMA table_info(reviews)').all() as { name: string }[]).map((c) => c.name);
  const add = (name: string, def: string) => !cols.includes(name) && db.exec(`ALTER TABLE reviews ADD COLUMN ${name} ${def}`);
  add('reply', 'TEXT');
  add('reply_by', 'TEXT');
  add('reply_at', 'TEXT');
  add('hidden', 'INTEGER NOT NULL DEFAULT 0');
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_email: string;
  rating: number;
  comment: string;
  order_id: string | null;
  is_test: number;
  reply: string | null;
  reply_by: string | null;
  reply_at: string | null;
  hidden: number;
  created_at: string;
  updated_at: string;
  name: string;
  avatar: string | null;
}

// ชื่อและรูปผู้รีวิวดึงจากบัญชีผู้ใช้เสมอ (ผู้รีวิวแก้ชื่อเองไม่ได้)
const REVIEW_SELECT = `
  SELECT r.*, u.name, u.avatar FROM reviews r JOIN users u ON u.email = r.user_email`;

const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  productId: r.product_id,
  userEmail: r.user_email,
  name: r.name,
  avatar: r.avatar ?? undefined,
  rating: r.rating,
  comment: r.comment,
  verifiedPurchase: !!r.order_id,
  isTest: !!r.is_test,
  hidden: !!r.hidden,
  reply: r.reply ? { text: r.reply, by: r.reply_by ?? 'LUNARA', at: r.reply_at ?? r.updated_at } : null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export function listReviews(productId: string): Review[] {
  const rows = db.prepare(`${REVIEW_SELECT} WHERE r.product_id = ? AND r.hidden = 0 ORDER BY r.created_at DESC`).all(productId);
  return (rows as unknown as ReviewRow[]).map(toReview);
}

export function latestReviews(limit: number, minRating = 4): Review[] {
  const rows = db
    .prepare(`${REVIEW_SELECT} WHERE r.hidden = 0 AND r.rating >= ? AND length(r.comment) >= 10 ORDER BY r.created_at DESC LIMIT ?`)
    .all(minRating, limit);
  return (rows as unknown as ReviewRow[]).map(toReview);
}

export function findReview(id: string): Review | null {
  const row = db.prepare(`${REVIEW_SELECT} WHERE r.id = ?`).get(id) as unknown as ReviewRow | undefined;
  return row ? toReview(row) : null;
}

export function findUserReview(productId: string, email: string): Review | null {
  const row = db.prepare(`${REVIEW_SELECT} WHERE r.product_id = ? AND r.user_email = ?`).get(productId, email) as unknown as
    | ReviewRow
    | undefined;
  return row ? toReview(row) : null;
}

/** 1 บัญชี รีวิวได้ 1 ครั้งต่อสินค้า (ส่งซ้ำ = แก้ไขรีวิวเดิม) */
export function saveReview(input: {
  productId: string;
  email: string;
  rating: number;
  comment: string;
  orderId: string | null;
  isTest: boolean;
}): Review {
  db.prepare(
    `INSERT INTO reviews (id, product_id, user_email, rating, comment, order_id, is_test, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(product_id, user_email) DO UPDATE SET rating = excluded.rating, comment = excluded.comment,
       order_id = excluded.order_id, is_test = excluded.is_test, updated_at = excluded.updated_at`
  ).run(
    `rev-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    input.productId,
    input.email,
    input.rating,
    input.comment,
    input.orderId,
    input.isTest ? 1 : 0,
    now(),
    now()
  );
  return findUserReview(input.productId, input.email)!;
}

export function removeReview(id: string): boolean {
  return db.prepare('DELETE FROM reviews WHERE id = ?').run(id).changes > 0;
}

/** คะแนนเฉลี่ยและจำนวนรีวิวจริงของสินค้าทุกชิ้น */
export function reviewStats(): Map<string, { rating: number; count: number }> {
  const rows = db
    .prepare('SELECT product_id, AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE hidden = 0 GROUP BY product_id')
    .all() as unknown as { product_id: string; avg: number; count: number }[];
  return new Map(rows.map((r) => [r.product_id, { rating: Math.round(r.avg * 10) / 10, count: r.count }]));
}

export function overallReviewStats(): { rating: number; count: number } {
  const row = db.prepare('SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE hidden = 0').get() as { avg: number | null; count: number };
  return { rating: row.avg ? Math.round(row.avg * 100) / 100 : 0, count: row.count };
}

/** หาคำสั่งซื้อ (ที่ไม่ถูกยกเลิก) ล่าสุดของผู้ใช้ที่มีสินค้านี้ — ใช้ยืนยันว่า "ซื้อจริง" */
export function findPurchase(email: string, productId: string): Order | null {
  return (
    listOrders(email).find(
      (o) => o.status !== 'Cancelled' && o.items.some((item) => item.product.id === productId)
    ) ?? null
  );
}

// ----------------------------------------------------------------------------
// ADMIN: จัดการรีวิว (ดูทั้งหมดรวมที่ซ่อนไว้, ตอบกลับลูกค้า, ซ่อน/แสดง)
// ----------------------------------------------------------------------------
export function listAllReviews(): Review[] {
  const rows = db.prepare(`${REVIEW_SELECT} ORDER BY r.created_at DESC`).all();
  return (rows as unknown as ReviewRow[]).map(toReview);
}

export function setReviewReply(id: string, text: string | null, by: string): Review | null {
  db.prepare('UPDATE reviews SET reply = ?, reply_by = ?, reply_at = ? WHERE id = ?').run(
    text,
    text ? by : null,
    text ? now() : null,
    id
  );
  return findReview(id);
}

export function setReviewHidden(id: string, hidden: boolean): Review | null {
  db.prepare('UPDATE reviews SET hidden = ? WHERE id = ?').run(hidden ? 1 : 0, id);
  return findReview(id);
}

// ----------------------------------------------------------------------------
// PROMOTIONS
// ----------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS promotions (
    id         TEXT PRIMARY KEY,
    code       TEXT NOT NULL UNIQUE,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

/** โปรที่คำสั่งซื้อนี้ใช้ (โค้ดส่วนลด + โปรอัตโนมัติ) — นับ 1 ครั้งต่อคำสั่งซื้อ */
function promotionIdsOf(order: Order): string[] {
  const ids = [order.promotion?.id, ...(order.autoPromotions ?? []).map((p) => p.id)].filter((id): id is string => !!id);
  return Array.from(new Set(ids));
}

/** จำนวนครั้งที่โปรถูกใช้ (นับจากคำสั่งซื้อที่ไม่ถูกยกเลิก) */
function promotionUsage(): Map<string, number> {
  const usage = new Map<string, number>();
  for (const order of listOrders()) {
    if (order.status === 'Cancelled') continue;
    for (const id of promotionIdsOf(order)) usage.set(id, (usage.get(id) ?? 0) + 1);
  }
  return usage;
}

export function countPromotionUseByUser(promotionId: string, email: string): number {
  return listOrders(email).filter((o) => o.status !== 'Cancelled' && promotionIdsOf(o).includes(promotionId)).length;
}

export function listPromotions(): Promotion[] {
  const usage = promotionUsage();
  const rows = db.prepare('SELECT data FROM promotions ORDER BY created_at DESC').all() as { data: string }[];
  return rows.map((r) => {
    const p = JSON.parse(r.data) as Promotion;
    return { ...p, usedCount: usage.get(p.id) ?? 0 };
  });
}

export function getPromotion(id: string): Promotion | null {
  return listPromotions().find((p) => p.id === id) ?? null;
}

export function findPromotionByCode(code: string): Promotion | null {
  return listPromotions().find((p) => p.code.toUpperCase() === code.trim().toUpperCase()) ?? null;
}

export function promoCodeExists(code: string, exceptId?: string): boolean {
  const row = db.prepare('SELECT id FROM promotions WHERE code = ?').get(code.toUpperCase()) as { id: string } | undefined;
  return !!row && row.id !== exceptId;
}

export function savePromotion(p: Promotion): Promotion {
  const { usedCount: _ignored, ...data } = p;
  db.prepare(
    `INSERT INTO promotions (id, code, data, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET code = excluded.code, data = excluded.data`
  ).run(p.id, p.code, JSON.stringify(data), p.createdAt);
  return getPromotion(p.id)!;
}

export function removePromotion(id: string): boolean {
  return db.prepare('DELETE FROM promotions WHERE id = ?').run(id).changes > 0;
}
