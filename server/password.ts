/**
 * LUNARA - PASSWORD HASHING (สำหรับ Admin ที่ล็อกอินด้วย Username / Password)
 * ============================================================================
 * - ไม่เก็บรหัสผ่านจริง เก็บเฉพาะค่า hash แบบ scrypt + salt สุ่ม
 * - รูปแบบ: scrypt$<N>$<salt hex>$<hash hex>
 * - เปรียบเทียบด้วย timingSafeEqual ป้องกันการเดารหัสจากเวลาตอบกลับ
 * ============================================================================
 */

import crypto from 'crypto';

const KEY_LENGTH = 64;
const COST = 16384;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, { N: COST });
  return `scrypt$${COST}$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, cost, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !cost || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length, { N: Number(cost) });
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
