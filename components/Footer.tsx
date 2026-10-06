/**
 * LUNARA - COMPONENT: FOOTER
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Consistent Layout]
 * - ดีไซน์สไตล์ Minimal Luxury ด้วยโทนสี Cream, Dusty Pink, Light Brown, Gold
 * - มีข้อความชี้แจงด้านความเชื่อ (Disclaimer) อย่างถูกต้อง
 * ============================================================================
 */

import React from 'react';
import { Sparkles, Heart, Shield, Package, RefreshCw, Send } from 'lucide-react';

interface FooterProps {
  onNavigate: (url: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#4A3E3D] text-[#FAF7F2] border-t border-[#8C7063]/30 mt-20">
      {/* 4 Feature Highlights */}
      <div className="border-b border-[#5E4E4C] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#8C7063]/40 text-[#E7C97C]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-[#FAF7F2]">หินแท้เกรดพรีเมียม</h4>
                <p className="text-xs sm:text-sm text-[#D9C8BE] mt-0.5">คัดสรรหินธรรมชาติ 100% หินเจีย 3 มิล</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#8C7063]/40 text-[#E8C5C8]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-[#FAF7F2]">กล่องแพ็กเกจหรูหรา</h4>
                <p className="text-xs sm:text-sm text-[#D9C8BE] mt-0.5">พร้อมการ์ดความหมายและถุงผ้ากำมะหยี่</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#8C7063]/40 text-[#E7C97C]">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-[#FAF7F2]">ปรับไซส์ฟรีตามขนาดข้อมือ</h4>
                <p className="text-xs sm:text-sm text-[#D9C8BE] mt-0.5">เลือกขนาดได้ 14-18 ซม. ร้อยด้วยเอ็นยืดทนทาน</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <div className="p-2.5 rounded-full bg-[#8C7063]/40 text-[#E8C5C8]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-base sm:text-lg text-[#FAF7F2]">พิสูจน์ได้ทุกขั้นตอน</h4>
                <p className="text-xs sm:text-sm text-[#D9C8BE] mt-0.5">ตรวจสอบสินค้าก่อนส่งและรับประกันความพึงพอใจ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-brand text-2xl sm:text-3xl font-bold tracking-[0.25em] text-[#FAF7F2]">
                LUNARA
              </span>
              <span className="w-2 h-2 rounded-full bg-[#C6A24D]"></span>
            </div>
            <p className="text-sm sm:text-base text-[#D9C8BE] leading-relaxed max-w-sm">
              ร้านกำไลหินมงคลสไตล์ Minimal Luxury เสริมพลังบวก เสริมสิริมงคลให้ชีวิตรัก การเงิน การงาน และความสงบในจิตใจ ดีไซน์เรียบหรูที่ใส่ได้ในทุกๆ วัน
            </p>
            <div className="pt-2 text-xs sm:text-sm text-[#D9C8BE]/90 border-t border-[#8C7063]/40">
              <p className="font-medium text-[#E7C97C] mb-1">🕊️ ข้อความชี้แจง (Disclaimer):</p>
              <p className="leading-relaxed">
                ข้อมูลเกี่ยวกับพลัง ความหมาย หรือสรรพคุณของหินมงคลทั้งหมดบนเว็บไซต์นี้ เป็นความเชื่อส่วนบุคคลและตำราโบราณ มิใช่การรับรองผลทางการแพทย์หรือวิทยาศาสตร์ โปรดใช้วิจารณญาณ
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm sm:text-base uppercase tracking-wider text-[#E7C97C]">
              เมนูหลัก
            </h4>
            <ul className="space-y-2.5 text-sm sm:text-base text-[#D9C8BE]">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-[#E8C5C8] transition-colors">
                  หน้าแรก
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-[#E8C5C8] transition-colors">
                  สินค้าทั้งหมด (Shop)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/find')} className="hover:text-[#E8C5C8] transition-colors">
                  ค้นหากำไลของคุณ (Find My Bracelet)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/stones')} className="hover:text-[#E8C5C8] transition-colors">
                  คู่มือหินมงคล 24 ชนิด
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/wishlist')} className="hover:text-[#E8C5C8] transition-colors">
                  รายการที่ชอบ (Wishlist)
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#E7C97C]">
              หมวดความมงคล
            </h4>
            <ul className="space-y-2 text-sm text-[#D9C8BE]">
              <li>
                <button onClick={() => onNavigate('/shop?intention=Love')} className="hover:text-[#E8C5C8] transition-colors">
                  ความรัก & เสน่ห์ (Love)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?intention=Money')} className="hover:text-[#E8C5C8] transition-colors">
                  การเงิน & โชคลาภ (Money)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?intention=Work')} className="hover:text-[#E8C5C8] transition-colors">
                  การงาน & ความก้าวหน้า (Work)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?intention=Study')} className="hover:text-[#E8C5C8] transition-colors">
                  การเรียน & ปัญญา (Study)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?intention=Calm')} className="hover:text-[#E8C5C8] transition-colors">
                  ความสงบ & สบายใจ (Calm)
                </button>
              </li>
            </ul>
          </div>

          {/* Student & Course Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-[#E7C97C]">
              สำหรับนำเสนอผลงาน
            </h4>
            <div className="text-xs text-[#D9C8BE] space-y-2">
              <p>โปรเจกต์วิชา Web Development</p>
              <p>ระบบ E-Commerce ด้วย Next.js / React, RHF, Zod, REST API & Google OAuth</p>
              <button
                onClick={() => onNavigate('/admin')}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8C7063] hover:bg-[#A37F2C] text-[#FAF7F2] text-xs font-medium transition-colors"
              >
                เข้าสู่ระบบผู้ดูแล (Admin CRUD)
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#5E4E4C] flex flex-col sm:flex-row items-center justify-between text-xs text-[#D9C8BE]/70 gap-4">
          <p>© {new Date().getFullYear()} LUNARA Lucky Stone Bracelets. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-[#E8C5C8] fill-[#E8C5C8]" /> for University Coursework
          </p>
        </div>
      </div>
    </footer>
  );
};
