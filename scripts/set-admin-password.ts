/**
 * ตั้งค่า / เปลี่ยน Username และ Password ของ Admin
 * ใช้งาน:  npm run admin:password -- <username> <password>
 * ผลลัพธ์: บันทึก ADMIN_USERNAME และ ADMIN_PASSWORD_HASH ลงไฟล์ .env.local (เก็บเฉพาะค่า hash)
 * จากนั้นรีสตาร์ทเซิร์ฟเวอร์
 */

import fs from 'fs';
import path from 'path';
import { hashPassword } from '../server/password.ts';

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error('Usage: npm run admin:password -- <username> <password>');
  process.exit(1);
}
if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username)) {
  console.error('Username must be 3–32 characters: letters, numbers, . _ -');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters');
  process.exit(1);
}

const envPath = path.resolve(process.cwd(), '.env.local');
let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

function setVar(name: string, value: string) {
  const line = `${name}="${value}"`;
  const pattern = new RegExp(`^${name}=.*$`, 'm');
  content = pattern.test(content) ? content.replace(pattern, () => line) : `${content.trimEnd()}\n${line}\n`;
}

if (!/ADMIN_USERNAME=/.test(content)) content = `${content.trimEnd()}\n# Admin ล็อกอินด้วย Username / Password (ตั้งค่าด้วย npm run admin:password)\n`;
setVar('ADMIN_USERNAME', username);
setVar('ADMIN_PASSWORD_HASH', hashPassword(password));
fs.writeFileSync(envPath, content);

console.log(`✔ Saved admin "${username}" to .env.local — restart the server to apply.`);
