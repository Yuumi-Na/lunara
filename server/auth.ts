/**
 * LUNARA - GOOGLE AUTHENTICATION & SESSION
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - Authentication & Authorization]
 *
 * ขั้นตอนการทำงาน:
 * 1. หน้าเว็บใช้ Google Identity Services แสดงปุ่ม "Sign in with Google"
 * 2. Google ส่ง ID Token (JWT) กลับมาให้หน้าเว็บ -> ส่งต่อมาที่ POST /api/auth/google
 * 3. เซิร์ฟเวอร์ตรวจลายเซ็นของ Token กับ Google (google-auth-library)
 *    และตรวจว่า Token ออกให้กับ Client ID ของร้านเราจริง (audience)
 * 4. สร้าง Session Cookie แบบ httpOnly ที่ลงลายเซ็น HMAC (JavaScript อ่านไม่ได้)
 * 5. สิทธิ์ (Role) คำนวณจากอีเมลทุกครั้งที่เรียก API:
 *    - อีเมลที่อยู่ใน ADMIN_EMAILS -> admin
 *    - อีเมลอื่น ๆ -> customer
 * 6. Admin ล็อกอินด้วย Username / Password ได้อีกทาง (POST /api/auth/admin-login)
 *    ลูกค้าทั่วไปไม่มีช่องทางนี้ ใช้ Google เท่านั้น
 * ============================================================================
 */

import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import type { AppUser, UserRole } from '../types/index.ts';
import { findUser, upsertUser } from './db.ts';
import { verifyPassword } from './password.ts';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';

// ตอนนี้ล็อกสิทธิ์ admin ไว้ที่อีเมลเดียว เพิ่มคนอื่นได้ทาง ADMIN_EMAILS (คั่นด้วย ,)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'natpapattep@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const SESSION_COOKIE = 'lunara_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  (() => {
    console.warn('⚠️  SESSION_SECRET is not set — using a random secret (sessions reset on restart).');
    return crypto.randomBytes(32).toString('hex');
  })();

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Admin แบบ Username / Password (ตั้งค่าด้วย npm run admin:password) — ลูกค้าทั่วไปใช้ได้เฉพาะ Google
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || '').trim();
const ADMIN_PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').trim();
export const PASSWORD_LOGIN_ENABLED = !!(ADMIN_USERNAME && ADMIN_PASSWORD_HASH);
// บัญชี admin แบบรหัสผ่านใช้อีเมลภายในโดเมน .local (Google ไม่มีทางออกอีเมลนี้ให้ จึงปลอมไม่ได้)
const PASSWORD_ADMIN_EMAIL = `${ADMIN_USERNAME.toLowerCase()}@admin.local`;

export function roleOf(email: string): UserRole {
  const lower = email.toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return 'admin';
  if (PASSWORD_LOGIN_ENABLED && lower === PASSWORD_ADMIN_EMAIL) return 'admin';
  return 'customer';
}

// ----------------------------------------------------------------------------
// Session token: base64url(payload).base64url(hmac)
// ----------------------------------------------------------------------------
function sign(value: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function createSessionToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: email, exp: Date.now() + SESSION_TTL_MS })).toString(
    'base64url'
  );
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof sub !== 'string' || typeof exp !== 'number' || exp < Date.now()) return null;
    return sub;
  } catch {
    return null;
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  header?.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx > 0) out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function setSessionCookie(res: Response, token: string | null) {
  res.cookie(SESSION_COOKIE, token ?? '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: token ? SESSION_TTL_MS : 0,
    path: '/',
  });
}

// ----------------------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------------------
declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    }
  }
}

// อ่าน Session ทุก request แล้วแนบข้อมูลผู้ใช้ไว้ที่ req.user
export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const email = readSessionToken(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
  if (email) {
    req.user = findUser(email, roleOf) ?? undefined;
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Please sign in first' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Please sign in first' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'Admin only' });
  }
  next();
}

// ป้องกัน CSRF: คำขอที่เปลี่ยนแปลงข้อมูลต้องมี header นี้
// (เว็บไซต์อื่นส่ง custom header ข้ามโดเมนไม่ได้ถ้าไม่ผ่าน CORS)
export function requireAppHeader(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.get('X-Lunara-Client') !== '1') {
    return res.status(403).json({ success: false, code: 'BAD_ORIGIN', message: 'Missing client header' });
  }
  next();
}

// ----------------------------------------------------------------------------
// Handlers
// ----------------------------------------------------------------------------
export async function handleGoogleLogin(req: Request, res: Response) {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ success: false, code: 'NOT_CONFIGURED', message: 'GOOGLE_CLIENT_ID is not set' });
  }

  const credential = req.body?.credential;
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ success: false, code: 'BAD_REQUEST', message: 'Missing credential' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({ success: false, code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' });
    }

    const email = payload.email.toLowerCase();
    upsertUser(email, payload.name || email.split('@')[0], payload.picture);
    setSessionCookie(res, createSessionToken(email));

    res.json({ success: true, user: findUser(email, roleOf) });
  } catch (err) {
    console.warn('Google token verification failed:', err);
    res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid Google credential' });
  }
}

// จำกัดการเดารหัสผ่าน: ผิดได้ 5 ครั้ง ต่อ 15 นาที ต่อ IP
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 5;
const loginFailures = new Map<string, { count: number; resetAt: number }>();

export async function handlePasswordLogin(req: Request, res: Response) {
  if (!PASSWORD_LOGIN_ENABLED) {
    return res.status(404).json({ success: false, code: 'NOT_CONFIGURED', message: 'Password login is not enabled' });
  }

  const ip = req.ip || 'unknown';
  const record = loginFailures.get(ip);
  if (record && record.resetAt > Date.now() && record.count >= LOGIN_MAX_FAILURES) {
    const retryAfter = Math.ceil((record.resetAt - Date.now()) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts', retryAfter });
  }

  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  // ตรวจรหัสผ่านทุกครั้งแม้ชื่อผู้ใช้ผิด เพื่อให้เวลาตอบกลับเท่ากัน
  const passwordOk = password.length > 0 && password.length <= 200 && verifyPassword(password, ADMIN_PASSWORD_HASH);
  const usernameOk = username.toLowerCase() === ADMIN_USERNAME.toLowerCase();

  if (!passwordOk || !usernameOk) {
    const fresh = !record || record.resetAt <= Date.now();
    loginFailures.set(ip, {
      count: fresh ? 1 : record.count + 1,
      resetAt: fresh ? Date.now() + LOGIN_WINDOW_MS : record.resetAt,
    });
    return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' });
  }

  loginFailures.delete(ip);
  upsertUser(PASSWORD_ADMIN_EMAIL, `Admin (${ADMIN_USERNAME})`, undefined);
  setSessionCookie(res, createSessionToken(PASSWORD_ADMIN_EMAIL));
  res.json({ success: true, user: findUser(PASSWORD_ADMIN_EMAIL, roleOf) });
}

export function handleMe(req: Request, res: Response) {
  res.json({ success: true, user: req.user ?? null });
}

export function handleLogout(_req: Request, res: Response) {
  setSessionCookie(res, null);
  res.json({ success: true });
}
