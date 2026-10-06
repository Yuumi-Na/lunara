/**
 * LUNARA - MAIN APPLICATION COMPONENT (App.tsx)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ที่ครอบคลุมทั้งหมด 10 โมดูล]:
 *
 * 1. JavaScript      : ตัวแปร, ฟังก์ชัน, Object, Array Methods (.filter, .map, .reduce, .find)
 * 2. Routing / Pages : แบ่งหน้าเว็บ + Dynamic Route /product/:id ด้วย Browser History API
 * 3. Components      : Navbar, Footer, ProductCard, CartDrawer, LoginModal, UI primitives
 * 4. State & Event   : useState, useEffect, Context (Cart, Wishlist, Auth, Theme, Language)
 * 5. Responsive      : Tailwind CSS ทุกหน้า + Bottom Tab Bar บนมือถือ
 * 6. Form            : Checkout, Product Form, Review Form
 * 7. React Hook Form : useForm, register, handleSubmit, errors
 * 8. Zod             : checkoutSchema, productFormSchema (ใช้ทั้งหน้าเว็บและ API)
 * 9. CRUD            : เพิ่ม / ดู / แก้ไข / ลบ สินค้า + คลังรูปภาพ (SQLite)
 * 10. API            : REST API + Google Sign-In + สิทธิ์ admin / customer
 * ============================================================================
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { I18nProvider, useI18n } from './i18n';
import { useAppRouter } from './hooks/useAppRouter';
import { fetchActivePromotions, fetchProducts } from './services/api';
import type { Product, Promotion } from './types';
import { INITIAL_PRODUCTS } from './data/products';

import { Navbar, MobileTabBar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { LoginModal } from './components/LoginModal';
import { Button, EmptyState } from './components/ui';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CraftBraceletPage } from './pages/CraftBraceletPage';
import { FindYourBraceletPage } from './pages/FindYourBraceletPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/admin/AdminPage';
import { StonesGuidePage } from './pages/StonesGuidePage';
import { Compass } from 'lucide-react';

function MainAppContent() {
  const router = useAppRouter();
  const { user, openLogin } = useAuth();
  const { syncProducts } = useCart();
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // โปรโมชั่นที่กำลังใช้งาน (แถบประกาศ + หน้าแรก)
  const reloadPromotions = useCallback(() => {
    fetchActivePromotions().then(setPromotions).catch(() => setPromotions([]));
  }, []);
  useEffect(reloadPromotions, [reloadPromotions]);

  // [โมดูล 10: API] โหลดข้อมูลสินค้าจาก REST API (ฐานข้อมูล SQLite)
  const reloadProducts = useCallback(async () => {
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      console.warn('Using initial product data fallback:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // ราคาในตะกร้าตามราคาล่าสุด (เช่น ช่วงโปรลดทั้งร้าน)
  useEffect(() => {
    if (!productsLoading) syncProducts(products);
  }, [products, productsLoading, syncProducts]);

  const navigate = router.push;
  const viewProduct = (id: string) => navigate(`/product/${encodeURIComponent(id)}`);

  // Checkout ต้องล็อกอินด้วย Google ก่อน — ถ้ายังไม่ล็อกอินจะเปิดหน้าต่างล็อกอิน แล้วไปต่อให้อัตโนมัติ
  const goCheckout = () => {
    if (user) navigate('/checkout');
    else openLogin(() => navigate('/checkout'));
  };

  const renderPage = () => {
    switch (router.page) {
      case 'home':
        return (
          <HomePage products={products} promotions={promotions} loading={productsLoading} onNavigate={navigate} onViewProduct={viewProduct} />
        );
      case 'shop':
        return (
          <ShopPage
            key={router.query.toString()}
            products={products}
            loading={productsLoading}
            onViewProduct={viewProduct}
            initialIntention={router.query.get('intention')}
            initialQuery={router.query.get('q')}
          />
        );
      case 'craft':
        return <CraftBraceletPage onOpenCart={() => setIsCartOpen(true)} />;
      case 'find':
        return <FindYourBraceletPage products={products} onViewProduct={viewProduct} />;
      case 'stones':
        return <StonesGuidePage onNavigate={navigate} />;
      case 'product-detail': {
        const product = products.find((p) => p.id === router.productId);
        if (!product) {
          return productsLoading ? null : (
            <NotFound title={t('product.notFound')} onBack={() => navigate('/shop')} backLabel={t('common.backToShop')} />
          );
        }
        return (
          <ProductDetailPage
            key={product.id}
            product={product}
            products={products}
            onNavigate={navigate}
            onViewProduct={viewProduct}
            onOpenCart={() => setIsCartOpen(true)}
          />
        );
      }
      case 'cart':
        return <CartPage onNavigate={navigate} onViewProduct={viewProduct} onCheckout={goCheckout} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigate} onOrderPlaced={reloadProducts} />;
      case 'account':
        return <AccountPage onNavigate={navigate} onViewProduct={viewProduct} />;
      case 'wishlist':
        return <WishlistPage onNavigate={navigate} onViewProduct={viewProduct} />;
      case 'admin':
        return (
          <AdminPage
            section={router.adminSection}
            products={products}
            onProductsChange={setProducts}
            onPromotionsChange={() => {
              reloadPromotions();
              reloadProducts();
            }}
            onNavigate={navigate}
            onViewProduct={viewProduct}
          />
        );
      default:
        return <NotFound title={t('notFound.title')} onBack={() => navigate('/')} backLabel={t('common.backHome')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Navbar currentPath={router.pathname} promotions={promotions} onNavigate={navigate} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1 pb-16 lg:pb-0">{renderPage()}</main>

      {router.page !== 'admin' && <Footer onNavigate={navigate} />}
      <MobileTabBar currentPath={router.pathname} onNavigate={navigate} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={navigate}
        onCheckout={goCheckout}
        onViewProduct={viewProduct}
      />
      <LoginModal />
    </div>
  );
}

const NotFound: React.FC<{ title: string; onBack: () => void; backLabel: string }> = ({ title, onBack, backLabel }) => (
  <div className="px-4 py-20">
    <EmptyState icon={<Compass className="w-7 h-7" />} title={title} action={<Button onClick={onBack}>{backLabel}</Button>} />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <MainAppContent />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
