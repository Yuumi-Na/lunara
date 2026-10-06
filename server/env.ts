// โหลดค่าจาก .env.local ก่อน แล้วตามด้วย .env (ต้อง import ไฟล์นี้เป็นอันดับแรกใน server.ts)
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });
