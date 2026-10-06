/**
 * LUNARA - MAIN APPLICATION COMPONENT (App.tsx)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ที่ครอบคลุมทั้งหมด 10 โมดูล]:
 *
 * 1. JavaScript:
 *    - ตัวแปร, ฟังก์ชัน, Object, Array, Array Methods (.filter, .map, .reduce, .find)
 * 2. Next.js & Routing / Pages:
 *    - การแบ่งหน้าเว็บ (Home, Shop, Craft Bracelet, Find Your Bracelet, Product Detail, Cart, Checkout, Orders, Wishlist, Admin, Stones Guide)
 *    - Dynamic Route เช่น /product/:id ด้วย Browser History API
 * 3. React / Components:
 *    - การแยก Component, การส่ง Props, การนำ Component กลับมาใช้ซ้ำ (Navbar, Footer, ProductCard, CartDrawer, etc.)
 * 4. State & Event:
 *    - useState, useEffect, onClick, onChange, Form Submit, Multi-checkbox, Cart quantity, Slide-over Drawer
 * 5. Responsive Design:
 *    - Tailwind CSS รองรับ Desktop, Tablet, และ Mobile ครบทุกหน้า
 * 6. Form:
 *    - การสร้างแบบฟอร์ม, การรับข้อมูล, Form Submit, Validation
 * 7. React Hook Form (RHF):
 *    - useForm, register, handleSubmit, errors
 * 8. Zod:
 *    - Schema Validation ตรวจสอบความถูกต้องของข้อมูล (checkoutSchema, productFormSchema)
 * 9. CRUD:
 *    - Create (เพิ่มสินค้า), Read (ดูสินค้า), Update (แก้ไข), Delete (ลบสินค้า)
 * 10. API:
 *    - RESTful Endpoints (GET, POST, PUT, DELETE /api/products, /api/orders, /api/auth/google)
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { useAppRouter } from './hooks/useAppRouter';
import { fetchProducts } from './services/api';
import { Product } from './types';
import { INITIAL_PRODUCTS } from './data/products';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CraftBraceletPage } from './pages/CraftBraceletPage';
import { FindYourBraceletPage } from './pages/FindYourBraceletPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminProductPage } from './pages/AdminProductPage';
import { StonesGuidePage } from './pages/StonesGuidePage';

function MainAppContent() {
  const router = useAppRouter();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // [โมดูล 10: API] โหลดข้อมูลสินค้าจาก REST API ตอนเริ่มต้น
  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Using initial product data fallback:', err);
      }
    }
    loadData();
  }, []);

  // Handlers สำหรับการเปลี่ยนหน้า
  const handleNavigate = (url: string) => {
    router.push(url);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleSelectStoneForShop = (stoneName: string) => {
    router.push(`/shop?q=${encodeURIComponent(stoneName)}`);
  };

  // ดึงสินค้าชิ้นที่กำลังดู (กรณี Dynamic Route /product/:id)
  const currentDetailProduct = router.params.id
    ? products.find((p) => p.id === router.params.id) || null
    : null;

  // [โมดูล 2: Next.js Routing / Pages] เรนเดอร์หน้าตาม URL
  const renderCurrentPage = () => {
    switch (router.page) {
      case 'home':
        return (
          <HomePage
            products={products}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'shop':
        return (
          <ShopPage
            products={products}
            onViewProduct={handleViewProduct}
            initialIntention={router.query.get('intention')}
          />
        );

      case 'craft':
        return (
          <CraftBraceletPage
            onNavigate={handleNavigate}
          />
        );

      case 'find':
        return (
          <FindYourBraceletPage
            products={products}
            onViewProduct={handleViewProduct}
          />
        );

      case 'product-detail':
        if (!currentDetailProduct) {
          return (
            <div className="max-w-xl mx-auto py-20 text-center space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#2D2420]">
                ไม่พบข้อมูลสินค้าที่ระบุ
              </h2>
              <button
                onClick={() => handleNavigate('/shop')}
                className="px-6 py-2.5 rounded-full bg-[#4E3C34] text-white text-sm font-semibold"
              >
                กลับไปหน้าร้านค้า
              </button>
            </div>
          );
        }
        return (
          <ProductDetailPage
            product={currentDetailProduct}
            onBack={() => handleNavigate('/shop')}
            onViewProduct={handleViewProduct}
          />
        );

      case 'cart':
        return (
          <CartPage
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'orders':
        return (
          <OrdersPage
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'wishlist':
        return (
          <WishlistPage
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'admin':
        return (
          <AdminProductPage
            products={products}
            onProductsChange={setProducts}
            onViewProduct={handleViewProduct}
          />
        );

      case 'stones':
        return (
          <StonesGuidePage
            onSelectStoneForShop={handleSelectStoneForShop}
            onNavigate={handleNavigate}
          />
        );

      default:
        return (
          <HomePage
            products={products}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D2420]">
      {/* Navbar ใช้รูปแบบเดียวกันทุกหน้า */}
      <Navbar
        currentPath={router.pathname}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Slide-over Quick Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={handleNavigate}
        onViewProduct={handleViewProduct}
      />

      {/* Footer ใช้รูปแบบเดียวกันทุกหน้า */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
