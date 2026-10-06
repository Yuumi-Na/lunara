/**
 * LUNARA E-COMMERCE - EXPRESS SERVER
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (RESTful Endpoints)]
 *
 * โครงสร้างฝั่งเซิร์ฟเวอร์:
 * - server/env.ts  -> โหลดค่าจาก .env.local / .env
 * - server/db.ts   -> ฐานข้อมูล SQLite (สินค้า, คำสั่งซื้อ, ผู้ใช้)
 * - server/media.ts -> คลังรูปภาพจากโฟลเดอร์ img/ (แสดงที่ /img/...)
 * - server/auth.ts -> Google Sign-In + Session Cookie + สิทธิ์ admin / customer
 * - server/api.ts  -> REST API ทั้งหมดภายใต้ /api
 * ============================================================================
 */

import './server/env.ts';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { attachUser, GOOGLE_CLIENT_ID, PASSWORD_LOGIN_ENABLED, requireAppHeader } from './server/auth.ts';
import { api } from './server/api.ts';
import { serveImages } from './server/media.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.disable('x-powered-by');
  app.use('/img', serveImages);
  app.use('/api', express.json({ limit: '1mb' }), requireAppHeader, attachUser, api);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ LUNARA Server is running at http://localhost:${PORT}`);
    // แจ้งสิ่งที่ยังไม่ได้ตั้งค่า (เช่น เพิ่ง clone โปรเจกต์มา)
    if (!PASSWORD_LOGIN_ENABLED) {
      console.log('🔑 Admin password is not set. Run: npm run admin:password -- admin <your-password>');
    }
    if (!GOOGLE_CLIENT_ID) {
      console.log('ℹ️  GOOGLE_CLIENT_ID is not set in .env.local — Google Sign-In is disabled.');
    }
  });
}

startServer();
