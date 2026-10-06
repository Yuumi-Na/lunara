/**
 * LUNARA - APP ROUTING HOOK (Next.js Pages Simulation)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js & Routing / Pages]
 * - การจัดการเส้นทาง URL (Routing) และ Dynamic Route เช่น /product/:id
 * - ทำงานด้วย Browser History API (pushState & popstate)
 * - รองรับ query string และ dynamic parameters
 *
 * เส้นทางหลัก:
 *   ฝั่งลูกค้า : /, /shop, /craft, /find, /stones, /product/:id, /cart, /checkout, /wishlist, /account
 *   ฝั่งร้าน   : /admin, /admin/products, /admin/orders, /admin/promotions, /admin/reviews, /admin/media, /admin/customers
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

export type PageName =
  | 'home'
  | 'shop'
  | 'craft'
  | 'find'
  | 'stones'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'wishlist'
  | 'account'
  | 'admin'
  | 'not-found';

export type AdminSection = 'overview' | 'products' | 'orders' | 'promotions' | 'reviews' | 'media' | 'customers';
const ADMIN_SECTIONS: AdminSection[] = ['overview', 'products', 'orders', 'promotions', 'reviews', 'media', 'customers'];

const STATIC_ROUTES: Record<string, PageName> = {
  '/': 'home',
  '/shop': 'shop',
  '/craft': 'craft',
  '/craft-bracelet': 'craft',
  '/find': 'find',
  '/find-bracelet': 'find',
  '/stones': 'stones',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/wishlist': 'wishlist',
  '/account': 'account',
  '/orders': 'account',
};

export function useAppRouter() {
  const [location, setLocation] = useState(() => ({
    path: window.location.pathname || '/',
    search: window.location.search || '',
  }));

  // ฟัง event ปุ่มย้อนกลับ/ไปข้างหน้าของบราวเซอร์
  useEffect(() => {
    const handlePopState = () =>
      setLocation({ path: window.location.pathname || '/', search: window.location.search || '' });
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ฟังก์ชันนำทางไปยังหน้าต่างๆ คล้าย router.push() ใน Next.js
  // รองรับ #anchor เช่น /product/prod-01#reviews -> เลื่อนไปยังส่วนรีวิวหลังเปลี่ยนหน้า
  const navigate = useCallback((url: string, replace = false) => {
    if (replace) window.history.replaceState({}, '', url);
    else window.history.pushState({}, '', url);
    const [beforeHash, hash] = url.split('#');
    const [path, search] = beforeHash.split('?');
    setLocation({ path: path || '/', search: search ? `?${search}` : '' });
    if (hash) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    } else if (!replace) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // วิเคราะห์ Dynamic Route
  const path = location.path.replace(/\/+$/, '') || '/';
  let page: PageName = STATIC_ROUTES[path] ?? 'not-found';
  let productId: string | null = null;
  let adminSection: AdminSection = 'overview';

  if (path.startsWith('/product/')) {
    page = 'product-detail';
    productId = decodeURIComponent(path.slice('/product/'.length));
  } else if (path === '/admin' || path.startsWith('/admin/')) {
    page = 'admin';
    const section = path.split('/')[2] as AdminSection | undefined;
    adminSection = section && ADMIN_SECTIONS.includes(section) ? section : 'overview';
  }

  return {
    pathname: path,
    page,
    productId,
    adminSection,
    query: new URLSearchParams(location.search),
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, true),
  };
}
