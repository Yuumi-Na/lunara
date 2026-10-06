/**
 * LUNARA - IMAGE FOLDER (คลังรูปภาพแบบโฟลเดอร์)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD + จัดการไฟล์บนเซิร์ฟเวอร์]
 *
 * - รูปทั้งหมดเก็บเป็นไฟล์ในโฟลเดอร์ img/ ของโปรเจกต์ (มีโฟลเดอร์ย่อยได้)
 *   ใส่รูปเองในโฟลเดอร์นี้ หรืออัปโหลดจากหน้า Admin ก็ได้ ผลลัพธ์เหมือนกัน
 * - แสดงรูปที่ URL /img/<โฟลเดอร์>/<ชื่อไฟล์>
 * - รองรับเฉพาะ JPG / PNG / WEBP (ตรวจจากเนื้อไฟล์จริง ไม่ใช่แค่นามสกุล)
 * - ป้องกันการเข้าถึงไฟล์นอกโฟลเดอร์ img/ (path traversal)
 * ============================================================================
 */

import crypto from 'crypto';
import express, { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { requireAdmin } from './auth.ts';
import { listProducts } from './db.ts';

export const IMG_ROOT = path.resolve(process.env.LUNARA_IMG_DIR || path.join(process.cwd(), 'img'));
if (!existsSync(IMG_ROOT)) mkdirSync(IMG_ROOT, { recursive: true });

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const TYPES = {
  jpg: { mime: 'image/jpeg', ext: ['.jpg', '.jpeg'] },
  png: { mime: 'image/png', ext: ['.png'] },
  webp: { mime: 'image/webp', ext: ['.webp'] },
} as const;
type ImageKind = keyof typeof TYPES;

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/** ตรวจชนิดไฟล์จาก "magic bytes" ตอนต้นไฟล์ */
function detectKind(buf: Buffer): ImageKind | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

/** แปลง path ที่ส่งมาจากหน้าเว็บ (เช่น "หินมงคล 777") เป็น path จริง และต้องอยู่ใน img/ เท่านั้น */
function resolveInside(rel: unknown): string | null {
  const clean = typeof rel === 'string' ? rel.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') : '';
  if (clean.split('/').some((seg) => seg === '..' || seg.startsWith('.'))) return null;
  const abs = path.resolve(IMG_ROOT, clean);
  return abs === IMG_ROOT || abs.startsWith(IMG_ROOT + path.sep) ? abs : null;
}

const toRel = (abs: string) => path.relative(IMG_ROOT, abs).split(path.sep).join('/');
export const toUrl = (rel: string) => '/img/' + rel.split('/').map(encodeURIComponent).join('/');

/** ชื่อไฟล์/โฟลเดอร์ที่ปลอดภัย: เก็บตัวอักษรทุกภาษา ตัวเลข ช่องว่าง - _ ( ) */
function sanitizeName(name: string): string {
  return name
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N} _\-()]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

async function uniquePath(dir: string, base: string, ext: string): Promise<string> {
  let candidate = path.join(dir, base + ext);
  for (let i = 1; existsSync(candidate); i++) candidate = path.join(dir, `${base}-${i}${ext}`);
  return candidate;
}

/** นับว่ารูปนี้ถูกใช้ในสินค้ากี่ชิ้น (เทียบแบบถอดรหัส URL แล้ว) */
function usageMap(): Map<string, number> {
  const map = new Map<string, number>();
  const add = (url?: string) => {
    if (!url?.startsWith('/img/')) return;
    const key = decodeURIComponent(url);
    map.set(key, (map.get(key) ?? 0) + 1);
  };
  listProducts().forEach((p) => new Set([p.image, ...(p.images ?? [])]).forEach(add));
  return map;
}

const fail = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, code, message });

export const media = Router();

// GET /api/media?dir=<โฟลเดอร์ย่อย> -> รายการโฟลเดอร์และรูปภาพ
media.get('/', requireAdmin, async (req, res) => {
  const dir = resolveInside(req.query.dir);
  if (!dir || !existsSync(dir)) return fail(res, 404, 'NOT_FOUND', 'Folder not found');

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const usage = usageMap();
  const folders = [];
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    const rel = toRel(abs);
    if (entry.isDirectory()) {
      const inner = await fs.readdir(abs).catch(() => []);
      folders.push({ name: entry.name, path: rel, count: inner.filter((n) => EXT_TO_MIME[path.extname(n).toLowerCase()]).length });
    } else if (EXT_TO_MIME[path.extname(entry.name).toLowerCase()]) {
      const stat = await fs.stat(abs);
      files.push({
        name: entry.name,
        path: rel,
        url: toUrl(rel),
        size: stat.size,
        mime: EXT_TO_MIME[path.extname(entry.name).toLowerCase()],
        modifiedAt: stat.mtime.toISOString(),
        usedBy: usage.get(decodeURIComponent(toUrl(rel))) ?? 0,
      });
    }
  }

  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'th');
  res.json({ success: true, data: { dir: toRel(dir), folders: folders.sort(byName), files: files.sort(byName) } });
});

// POST /api/media/upload?dir=<โฟลเดอร์> -> อัปโหลดรูป 1 ไฟล์ (body = ไฟล์รูป, ชื่อไฟล์ใน header X-File-Name)
media.post(
  '/upload',
  requireAdmin,
  express.raw({ type: () => true, limit: MAX_IMAGE_BYTES }),
  async (req: Request, res: Response) => {
    const dir = resolveInside(req.query.dir);
    if (!dir || !existsSync(dir)) return fail(res, 404, 'NOT_FOUND', 'Folder not found');
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) return fail(res, 400, 'EMPTY', 'Empty file');

    const kind = detectKind(req.body);
    if (!kind) return fail(res, 415, 'UNSUPPORTED_TYPE', 'Only JPG, PNG and WEBP images are allowed');

    // ใช้นามสกุลตามชนิดไฟล์จริง (กันไฟล์ปลอมนามสกุล)
    const original = decodeURIComponent(req.get('X-File-Name') || 'image');
    const originalExt = path.extname(original).toLowerCase();
    const ext = (TYPES[kind].ext as readonly string[]).includes(originalExt) ? originalExt : TYPES[kind].ext[0];
    const base = sanitizeName(path.basename(original, path.extname(original))) || `image-${crypto.randomBytes(3).toString('hex')}`;

    const target = await uniquePath(dir, base, ext);
    await fs.writeFile(target, req.body, { flag: 'wx' });
    const rel = toRel(target);
    res.status(201).json({
      success: true,
      data: { name: path.basename(target), path: rel, url: toUrl(rel), size: req.body.length, mime: TYPES[kind].mime },
    });
  }
);

// POST /api/media/folder { dir, name } -> สร้างโฟลเดอร์ใหม่
media.post('/folder', requireAdmin, async (req, res) => {
  const parent = resolveInside(req.body?.dir);
  const name = sanitizeName(String(req.body?.name ?? ''));
  if (!parent || !existsSync(parent)) return fail(res, 404, 'NOT_FOUND', 'Folder not found');
  if (!name) return fail(res, 400, 'VALIDATION', 'Invalid folder name');
  const target = path.join(parent, name);
  if (existsSync(target)) return fail(res, 409, 'EXISTS', 'Folder already exists');
  await fs.mkdir(target);
  res.status(201).json({ success: true, data: { name, path: toRel(target) } });
});

// DELETE /api/media?path=<ไฟล์หรือโฟลเดอร์ว่าง>
media.delete('/', requireAdmin, async (req, res) => {
  const target = resolveInside(req.query.path);
  if (!target || target === IMG_ROOT || !existsSync(target)) return fail(res, 404, 'NOT_FOUND', 'Not found');

  const stat = await fs.stat(target);
  if (stat.isDirectory()) {
    const inner = await fs.readdir(target);
    if (inner.length > 0) return fail(res, 409, 'NOT_EMPTY', 'Folder is not empty');
    await fs.rmdir(target);
  } else {
    if (!EXT_TO_MIME[path.extname(target).toLowerCase()]) return fail(res, 400, 'VALIDATION', 'Not an image');
    await fs.unlink(target);
  }
  res.json({ success: true });
});

/** ใช้ใน server.ts: แสดงไฟล์รูปจาก img/ ที่ /img/... (เฉพาะไฟล์รูปเท่านั้น) */
export const serveImages = Router();
serveImages.use((req, res, next) => {
  const ext = path.extname(decodeURIComponent(req.path)).toLowerCase();
  if (!EXT_TO_MIME[ext]) return res.status(404).end();
  next();
});
serveImages.use(
  express.static(IMG_ROOT, {
    dotfiles: 'deny',
    index: false,
    maxAge: '7d',
    setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
  })
);
serveImages.use((_req, res) => res.status(404).end());

/** นับจำนวนรูปทั้งหมดในโฟลเดอร์ img/ (สำหรับหน้าภาพรวม) */
export async function countImages(dir = IMG_ROOT): Promise<number> {
  let count = 0;
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) count += await countImages(path.join(dir, entry.name));
    else if (EXT_TO_MIME[path.extname(entry.name).toLowerCase()]) count++;
  }
  return count;
}
