/**
 * LUNARA - COMPONENT: NAVBAR
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Reusability]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * ดีไซน์ Minimal Luxury ตามสไตล์ของ LUNARA:
 * - แถบประกาศด้านบน (Top announcement ribbon)
 * - โลโก้ LUNARA ตัวอักษร Cormorant Garamond / Serif สุดหรู
 * - เมนู: หน้าแรก, สินค้าทั้งหมด, คราฟต์กำไลผสมหิน, ค้นหากำไลที่ใช่, สารานุกรมหินมงคล, คำสั่งซื้อ, จัดการร้าน
 * - ปุ่ม Wishlist, ปุ่ม Quick Cart Drawer, และสถานะ Google OAuth Admin
 * ============================================================================
 */

import React, { useState } from 'react';
import { ShoppingBag, Heart, Menu, X, ShieldCheck, Gem, User, Compass, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (url: string) => void;
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { adminUser, isAdmin } = useAuth();

  const navLinks = [
    { label: 'หน้าแรก', path: '/' },
    { label: 'สินค้าทั้งหมด', path: '/shop' },
    { label: 'คราฟต์กำไลผสมหิน', path: '/craft', highlight: true },
    { label: 'ค้นหากำไลที่ใช่', path: '/find' },
    { label: 'สารานุกรมหินมงคล', path: '/stones' },
    { label: 'ประวัติคำสั่งซื้อ', path: '/orders' },
    { label: 'จัดการร้าน (Admin)', path: '/admin' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner: Minimal Luxury announcement matching lunara-2 */}
      <div className="bg-[#4E3C34] text-[#F3EBE6] text-sm sm:text-base py-2.5 px-4 text-center font-normal tracking-wide flex items-center justify-center gap-3">
        <span>คราฟต์จากหินธรรมชาติแท้ 100% ปรับขนาดตามข้อมือฟรีทุกเส้น</span>
        <span aria-hidden="true" className="opacity-40">·</span>
        <span className="hidden sm:inline">ส่งฟรีทั่วไทยเมื่อช้อปครบ ฿500</span>
        <span aria-hidden="true" className="hidden sm:inline opacity-40">·</span>
        <span className="text-[#E0B8B2] font-semibold">โค้ด LUNARA10 ลด 10%</span>
      </div>

      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAE3DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          {/* 1. Mobile Menu Button & Brand */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 text-[#4E3C34] hover:text-[#2D2420] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo: LUNARA */}
            <button
              onClick={() => handleLinkClick('/')}
              className="text-left group focus:outline-none"
            >
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.25em] font-semibold text-[#2D2420] group-hover:text-[#7A584A] transition-colors">
                LUNARA
              </span>
            </button>
          </div>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8 text-base xl:text-lg font-medium tracking-wide text-[#5A4B43]">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`transition-colors relative py-2 ${
                    isActive
                      ? 'text-[#2D2420] font-semibold'
                      : 'hover:text-[#2D2420]'
                  } ${link.highlight ? 'text-[#7A584A] font-semibold flex items-center gap-1.5' : ''}`}
                >
                  {link.highlight && (
                    <Sparkles className="w-4 h-4 text-[#C79F5E]" />
                  )}
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7A584A] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* 3. Action Buttons (Wishlist, Cart Drawer, Admin) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist Button */}
            <button
              onClick={() => handleLinkClick('/wishlist')}
              className="relative p-2.5 rounded-full text-[#5A4B43] hover:text-[#B33939] hover:bg-[#FAF5F0] transition-all"
              title="รายการที่ชอบ (Wishlist)"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D97D87] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button with Slide-over Drawer trigger */}
            <button
              onClick={() => onOpenCart ? onOpenCart() : handleLinkClick('/cart')}
              className="relative p-2.5 rounded-full bg-[#FAF5F0] hover:bg-[#F2EBE1] text-[#2D2420] transition-all flex items-center gap-2 px-3 sm:px-4 border border-[#EAE3DC]"
              title="ตะกร้าสินค้า"
            >
              <ShoppingBag className="w-5 h-5 text-[#7A584A]" />
              <span className="text-sm sm:text-base font-semibold hidden sm:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span className="bg-[#C79F5E] text-white text-xs sm:text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Badge */}
            {isAdmin ? (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-[#7A584A] bg-[#FAF5F0] px-3 py-1.5 rounded-xl border border-[#EAE3DC] font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="max-w-[85px] truncate">{adminUser?.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => handleLinkClick('/admin')}
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-[#8C7063] hover:text-[#2D2420] px-3 py-1.5 rounded-xl border border-[#EAE3DC] font-medium"
                title="เข้าสู่ระบบ Admin"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#EAE3DC] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-lg font-medium flex items-center justify-between ${
                  isActive
                    ? 'bg-[#EAE3DC] text-[#2D2420] font-semibold'
                    : 'text-[#5A4B43] hover:bg-[#FAF5F0]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {link.highlight && <Sparkles className="w-5 h-5 text-[#C79F5E]" />}
                  {link.label}
                </span>
                {link.highlight && (
                  <span className="text-xs bg-[#7A584A] text-white px-2.5 py-1 rounded-full font-bold">
                    เลือกหินเอง
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};
