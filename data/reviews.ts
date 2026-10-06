/**
 * LUNARA - DATA: REVIEWS & CATEGORIES
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Objects & Arrays]
 * - ข้อมูลรีวิวลูกค้าจริง และข้อมูลหมวดหมู่ความหมายหินมงคล
 * ============================================================================
 */

import { IntentionType } from '../types';

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  productName: string;
  verifiedPurchase: boolean;
  avatar: string;
}

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'คุณพิมลดา ร.',
    rating: 5,
    date: 'เมื่อวานนี้',
    comment: 'งานจริงสวยมากกก หินเจีย 3 มิลเล่นแสงวิบวับ เส้นเล็กเรียบหรูใส่คู่กับนาฬิกาได้สบายเลยค่ะ ตั้งแต่ใส่เส้นนี้มาปิดยอดขายได้ตลอดเลย ขอบคุณ LUNARA นะคะ ✨',
    productName: 'Golden Prosperity (ซิทริน & ไพไรต์)',
    verifiedPurchase: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-2',
    author: 'คุณณิชาภัทร ว.',
    rating: 5,
    date: '3 วันที่แล้ว',
    comment: 'แพ็กเกจน่ารักมาก มีการ์ดความหมายหินและการดูแลแนบมาด้วย โรสมูนสโตนหวานละมุนสุดๆ แฟนยังทักว่ากำไลน่ารักค่ะ แนะนำเลย 💖',
    productName: 'Sweet Amoré (โรสควอตซ์ & มูนสโตน)',
    verifiedPurchase: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-3',
    author: 'คุณธนภัทร ส.',
    rating: 5,
    date: '1 สัปดาห์ที่แล้ว',
    comment: 'สั่ง Midnight Shield มาใส่ตอนทำงาน ลายหินเท่มาก ไม่ดูมูเตลูจนเกินไป เหมาะกับผู้ชายด้วย ใส่แล้วรู้สึกมีสมาธิตัดสินใจงานคล่องขึ้นครับ',
    productName: 'Midnight Shield (นิลดำ & ไทเกอร์อายเหลือง)',
    verifiedPurchase: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'rev-4',
    author: 'คุณกัญญาณัฐ ป.',
    rating: 5,
    date: '2 สัปดาห์ที่แล้ว',
    comment: 'ใช้ฟีเจอร์ Find Your Bracelet ค้นหา ได้ Match Score 100% ตรงใจมากค่ะ ได้ของตรงปก ส่งไว ประทับใจมาก จะอุดหนุนเส้นที่สองแน่นอนค่ะ 🌸',
    productName: 'Royal Wisdom (ลาพิส ลาซูลี & อเมทิสต์)',
    verifiedPurchase: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
];

export interface IntentionCategoryInfo {
  type: IntentionType;
  labelTh: string;
  description: string;
  icon: string;
  colorBg: string;
  accentColor: string;
}

export const INTENTION_CATEGORIES: IntentionCategoryInfo[] = [
  {
    type: 'Love',
    labelTh: 'ความรัก & เสน่ห์',
    description: 'ดึงดูดคนดีๆ เมตตามหานิยม ความรักสมหวัง อบอุ่น',
    icon: 'Heart',
    colorBg: 'bg-[#FDF2F4]',
    accentColor: '#DDA0A5',
  },
  {
    type: 'Money',
    labelTh: 'การเงิน & โชคลาภ',
    description: 'เรียกทรัพย์ ค้าขายร่ำรวย เงินทองไหลมาเทมา',
    icon: 'Coins',
    colorBg: 'bg-[#FEF9E7]',
    accentColor: '#D4AF37',
  },
  {
    type: 'Work',
    labelTh: 'การงาน & ความก้าวหน้า',
    description: 'เลื่อนขั้น โอกาสใหม่ๆ ธุรกิจราบรื่น ได้รับการยอมรับ',
    icon: 'Briefcase',
    colorBg: 'bg-[#F0F4F8]',
    accentColor: '#4A6572',
  },
  {
    type: 'Study',
    labelTh: 'การเรียน & ปัญญา',
    description: 'สมาธิแน่วแน่ ความจำเป็นเลิศ สมองปลอดโปร่งยามสอบ',
    icon: 'GraduationCap',
    colorBg: 'bg-[#F3EFF8]',
    accentColor: '#7E57C2',
  },
  {
    type: 'Luck',
    labelTh: 'ดวงชะตา & โชคดี',
    description: 'เปิดรับพลังบวก เสริมดวงชะตา พลิกเรื่องร้ายให้กลายเป็นดี',
    icon: 'Sparkles',
    colorBg: 'bg-[#F2F9F3]',
    accentColor: '#4CAF50',
  },
  {
    type: 'Protection',
    labelTh: 'ปกป้อง & แคล้วคลาด',
    description: 'ปัดเป่าพลังงานลบ ป้องกันสิ่งไม่ดี เดินทางปลอดภัย',
    icon: 'Shield',
    colorBg: 'bg-[#F4F4F6]',
    accentColor: '#424242',
  },
  {
    type: 'Calm',
    labelTh: 'ความสงบ & สบายใจ',
    description: 'คลายเครียด ปรับสมดุลอารมณ์ หลับสบาย จิตใจนิ่งสุขุม',
    icon: 'Moon',
    colorBg: 'bg-[#F0F7F9]',
    accentColor: '#00ACC1',
  },
  {
    type: 'Confidence',
    labelTh: 'ความมั่นใจ & พลังใจ',
    description: 'กล้าแสดงออก มีความมั่นคงในตนเอง ปลุกพลังผู้นำ',
    icon: 'Zap',
    colorBg: 'bg-[#FFF3E0]',
    accentColor: '#FB8C00',
  },
];
