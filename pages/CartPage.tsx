/**
 * LUNARA - PAGE: CART PAGE (หน้าตะกร้าสินค้า)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Cart Context Management)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * - เลือกสินค้า / ปรับจำนวน / ลบ ได้โดยไม่ต้องล็อกอิน (ลบ / ล้างตะกร้า มีหน้าต่างยืนยันก่อน)
 * - ปุ่ม Checkout: ถ้ายังไม่ล็อกอินจะให้ล็อกอินด้วย Google ก่อน
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartLine, FreeShippingProgress } from '../components/CartDrawer';
import { Button, ConfirmDialog, Container, EmptyState, PageHeader } from '../components/ui';
import { useI18n } from '../i18n';

interface CartPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
  onCheckout: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate, onViewProduct, onCheckout }) => {
  const { cart, clearCart, subtotal, shippingFee, total, cartCount } = useCart();
  const { user } = useAuth();
  const [confirmClear, setConfirmClear] = useState(false);
  const { t, price } = useI18n();

  if (cart.length === 0) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" />}
          title={t('cart.emptyTitle')}
          description={t('cart.emptyDesc')}
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => onNavigate('/shop')}>{t('cart.browse')}</Button>
              <Button variant="secondary" onClick={() => onNavigate('/find')}>
                {t('home.ctaFind')}
              </Button>
            </div>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14 space-y-8">
      <PageHeader
        eyebrow={t('cart.eyebrow')}
        title={t('cart.title')}
        subtitle={t('cart.itemCount', { count: cartCount })}
        action={
          <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)} className="self-start sm:self-auto hover:text-danger">
            <Trash2 className="w-4 h-4" />
            {t('cart.clear')}
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="card divide-y divide-line">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="p-4 sm:p-6">
                <CartLine item={item} onViewProduct={onViewProduct} large />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('cart.continue')}
          </button>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-28 card p-6 space-y-5">
          <h2 className="text-xl text-ink">{t('cart.summary')}</h2>
          <FreeShippingProgress subtotal={subtotal} />
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between text-ink-2">
              <dt>{t('cart.subtotal')}</dt>
              <dd className="text-ink tabular-nums">{price(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-ink-2">
              <dt>{t('cart.shipping')}</dt>
              <dd className={shippingFee === 0 ? 'text-success' : 'text-ink tabular-nums'}>
                {shippingFee === 0 ? t('cart.free') : price(shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-line">
              <dt className="font-medium text-ink">{t('cart.total')}</dt>
              <dd className="text-2xl font-semibold text-ink tabular-nums">{price(total)}</dd>
            </div>
          </dl>
          <Button size="lg" block onClick={onCheckout}>
            {!user && <Lock className="w-4 h-4" />}
            {t('cart.checkout')}
            <ArrowRight className="w-4 h-4" />
          </Button>
          {!user && <p className="text-xs text-center text-ink-3 -mt-2">{t('cart.loginHint')}</p>}
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-3">
            <ShieldCheck className="w-4 h-4 text-success" />
            {t('cart.secure')}
          </p>
        </aside>
      </div>
      <ConfirmDialog
        open={confirmClear}
        title={t('cart.clearTitle')}
        message={t('cart.clearConfirm', { count: cartCount })}
        confirmLabel={t('cart.clear')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          clearCart();
        }}
      />
    </Container>
  );
};
