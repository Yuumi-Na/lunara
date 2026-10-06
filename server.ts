/**
 * LUNARA E-COMMERCE - EXPRESS SERVER & REST API
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create, Read, Update, Delete)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (RESTful Endpoints)]
 *
 * สรุป Endpoints:
 * - GET    /api/products      -> ดึงรายการสินค้าทั้งหมด (Read All)
 * - GET    /api/products/:id  -> ดึงข้อมูลสินค้ารายชิ้นตาม ID (Read One)
 * - POST   /api/products      -> เพิ่มสินค้าใหม่ (Create)
 * - PUT    /api/products/:id  -> แก้ไขสินค้าตาม ID (Update)
 * - DELETE /api/products/:id  -> ลบสินค้าตาม ID (Delete)
 * - GET    /api/orders        -> ดึงรายการคำสั่งซื้อทั้งหมด
 * - POST   /api/orders        -> บันทึกคำสั่งซื้อใหม่จาก Checkout
 * - POST   /api/auth/google   -> ตรวจสอบและจำลองการเข้าสู่ระบบ Google OAuth
 * ============================================================================
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS } from './data/products.ts';
import { Product, Order } from './types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory Database สำหรับจำลองการทำงานบนเซิร์ฟเวอร์ (เหมาะสำหรับโปรเจกต์นักศึกษา)
let productsDatabase: Product[] = [...INITIAL_PRODUCTS];
let ordersDatabase: Order[] = [
  {
    id: 'ORD-89214',
    customerName: 'คุณณัฐภัสสร ธนโชติ',
    phone: '0812345678',
    address: '99/12 หมู่บ้านศุภาลัย ซอย 5 ถนนสุขุมวิท',
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    postalCode: '10110',
    paymentMethod: 'พร้อมเพย์ (PromptPay QR)',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedSize: '16 ซม.',
      },
    ],
    subtotal: 450,
    shippingFee: 0,
    total: 450,
    status: 'Shipping',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ORD-89215',
    customerName: 'คุณวรัญญา สุขสมบูรณ์',
    phone: '0899876543',
    address: '15/4 คอนโดลุมพินี พญาไท',
    province: 'กรุงเทพมหานคร',
    district: 'ราชเทวี',
    postalCode: '10400',
    paymentMethod: 'โอนเงิน / พร้อมเพย์',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        selectedSize: '15 ซม.',
      },
    ],
    subtotal: 690,
    shippingFee: 0,
    total: 690,
    status: 'Preparing',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Middleware สำหรับแปลง Body เป็น JSON
  app.use(express.json());

  // --------------------------------------------------------------------------
  // 1. PRODUCTS API (โมดูล 9 & 10: CRUD)
  // --------------------------------------------------------------------------

  // GET /api/products -> Read All (ดึงสินค้าทั้งหมด)
  app.get('/api/products', (req: Request, res: Response) => {
    const { intention, color, style, q } = req.query;
    let filtered = [...productsDatabase];

    if (q && typeof q === 'string') {
      const keyword = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.stone.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword)
      );
    }

    if (intention && typeof intention === 'string') {
      filtered = filtered.filter((p) => p.intentions.includes(intention as any));
    }

    if (color && typeof color === 'string') {
      filtered = filtered.filter((p) => p.colors.includes(color as any));
    }

    if (style && typeof style === 'string') {
      filtered = filtered.filter((p) => p.style === style);
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  });

  // GET /api/products/:id -> Read One (ดึงสินค้ารายชิ้น)
  app.get('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const product = productsDatabase.find((p) => p.id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบสินค้า ID: ${id}`,
      });
    }

    res.json({
      success: true,
      data: product,
    });
  });

  // POST /api/products -> Create (เพิ่มสินค้าใหม่)
  app.post('/api/products', (req: Request, res: Response) => {
    const newProduct: Product = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0,
      beadSize: req.body.beadSize || 'หินเจีย ขนาด 3 มิล',
    };

    productsDatabase.unshift(newProduct);

    res.status(201).json({
      success: true,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: newProduct,
    });
  });

  // PUT /api/products/:id -> Update (แก้ไขสินค้า)
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = productsDatabase.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบสินค้า ID: ${id} สำหรับการแก้ไข`,
      });
    }

    productsDatabase[index] = {
      ...productsDatabase[index],
      ...req.body,
      id, // รักษารหัสเดิม
    };

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลสินค้าสำเร็จ',
      data: productsDatabase[index],
    });
  });

  // DELETE /api/products/:id -> Delete (ลบสินค้า)
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = productsDatabase.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบสินค้า ID: ${id} สำหรับการลบ`,
      });
    }

    const deleted = productsDatabase.splice(index, 1)[0];

    res.json({
      success: true,
      message: 'ลบสินค้าสำเร็จ',
      data: deleted,
    });
  });

  // --------------------------------------------------------------------------
  // 2. ORDERS API (จัดการคำสั่งซื้อ)
  // --------------------------------------------------------------------------

  // GET /api/orders -> ดึงคำสั่งซื้อทั้งหมด
  app.get('/api/orders', (_req: Request, res: Response) => {
    res.json({
      success: true,
      count: ordersDatabase.length,
      data: ordersDatabase,
    });
  });

  // POST /api/orders -> บันทึกคำสั่งซื้อใหม่
  app.post('/api/orders', (req: Request, res: Response) => {
    const newOrder: Order = {
      ...req.body,
      id: req.body.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: req.body.createdAt || new Date().toISOString(),
      status: req.body.status || 'Ordered',
    };

    ordersDatabase.unshift(newOrder);

    res.status(201).json({
      success: true,
      message: 'สร้างคำสั่งซื้อสำเร็จ',
      data: newOrder,
    });
  });

  // --------------------------------------------------------------------------
  // 3. GOOGLE OAUTH AUTHENTICATION ENDPOINT
  // --------------------------------------------------------------------------
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { credential, email, name, avatar } = req.body;
    // ตรวจสอบสิทธิ์ผู้ดูแลระบบ (Admin)
    // สำหรับโปรเจกต์ส่งอาจารย์ สามารถจำลองหรือใช้ Google ID Token จริงได้
    const adminUser = {
      id: 'admin-' + Date.now(),
      email: email || 'natpapattep@gmail.com',
      name: name || 'Admin LUNARA (อาจารย์ / ผู้ตรวจโปรเจกต์)',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'admin',
    };

    res.json({
      success: true,
      message: 'ยืนยันตัวตนด้วย Google OAuth สำเร็จ',
      user: adminUser,
    });
  });

  // --------------------------------------------------------------------------
  // 4. VITE MIDDLEWARE (DEV) & STATIC FILES (PROD)
  // --------------------------------------------------------------------------
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
  });
}

startServer();
