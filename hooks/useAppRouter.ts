/**
 * LUNARA - APP ROUTING HOOK (Next.js Pages Simulation)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 2: Next.js & Routing / Pages]
 * - การจัดการเส้นทาง URL (Routing) และ Dynamic Route เช่น /product/:id
 * - ทำงานด้วย Browser History API (pushState & popstate)
 * - รองรับ query string และ dynamic parameters
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

export function useAppRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [currentSearch, setCurrentSearch] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search || '';
    }
    return '';
  });

  // ฟัง event ปุ่มย้อนกลับ/ไปข้างหน้าของบราวเซอร์
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ฟังก์ชันนำทางไปยังหน้าต่างๆ คล้าย router.push() ใน Next.js
  const push = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', url);
      const [path, search] = url.split('?');
      setCurrentPath(path || '/');
      setCurrentSearch(search ? `?${search}` : '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // วิเคราะห์ Dynamic Route เช่น /product/prod-01
  let page = 'home';
  let dynamicId: string | null = null;

  if (currentPath === '/' || currentPath === '') {
    page = 'home';
  } else if (currentPath === '/shop') {
    page = 'shop';
  } else if (currentPath === '/craft' || currentPath === '/craft-bracelet') {
    page = 'craft';
  } else if (currentPath === '/find' || currentPath === '/find-bracelet') {
    page = 'find';
  } else if (currentPath.startsWith('/product/')) {
    page = 'product-detail';
    dynamicId = currentPath.replace('/product/', '');
  } else if (currentPath === '/cart') {
    page = 'cart';
  } else if (currentPath === '/checkout') {
    page = 'checkout';
  } else if (currentPath === '/orders') {
    page = 'orders';
  } else if (currentPath === '/wishlist') {
    page = 'wishlist';
  } else if (currentPath === '/admin') {
    page = 'admin';
  } else if (currentPath === '/stones') {
    page = 'stones';
  }

  // ดึง Query Parameters
  const queryParams = new URLSearchParams(currentSearch);

  return {
    pathname: currentPath,
    page,
    params: { id: dynamicId },
    query: queryParams,
    push,
  };
}
