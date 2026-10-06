/**
 * LUNARA - DATA: CRAFT BRACELET OPTIONS & PRICING
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Functions & Calculation]
 * - ตัวเลือกขนาดเม็ดหิน / อะไหล่ชาร์ม / รอบข้อมือ ของกำไลคราฟต์
 * - ฟังก์ชันคำนวณราคา ใช้ร่วมกันทั้งหน้าเว็บและเซิร์ฟเวอร์
 *   (เซิร์ฟเวอร์คำนวณราคาซ้ำเอง ไม่เชื่อราคาที่ส่งมาจากเบราว์เซอร์)
 * ============================================================================
 */

export const CRAFT_BEAD_SIZES = [
  { id: '3mm', basePrice: 490, extraPerStone: 90 },
  { id: '8mm', basePrice: 1890, extraPerStone: 300 },
  { id: '10mm', basePrice: 1890, extraPerStone: 300 },
] as const;

export type CraftBeadSizeId = (typeof CRAFT_BEAD_SIZES)[number]['id'];

export const CRAFT_CHARMS = ['gold14k', 'whiteGold18k', 'roseGold', 'none'] as const;
export type CraftCharmId = (typeof CRAFT_CHARMS)[number];

export const CRAFT_WRIST_SIZES = [
  '14.5 cm', '15.0 cm', '15.5 cm', '16.0 cm', '16.5 cm', '17.0 cm', '17.5 cm', '18.0 cm',
];

export const PRODUCT_WRIST_SIZES = ['14 cm', '15 cm', '16 cm', '17 cm', '18 cm'];
export const DEFAULT_WRIST_SIZE = '16 cm';

export const CRAFT_MIN_STONES = 1;
export const CRAFT_MAX_STONES = 4;

export function calcCraftPrice(beadSize: string, stoneCount: number): number {
  const size = CRAFT_BEAD_SIZES.find((b) => b.id === beadSize) ?? CRAFT_BEAD_SIZES[0];
  return size.basePrice + Math.max(0, stoneCount - 1) * size.extraPerStone;
}
