/**
 * LUNARA - COMPONENT: CART DRAWER (SLIDE-OVER QUICK CART)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * - เลือกสินค้าได้โดยไม่ต้องล็อกอิน
 * - กดลบสินค้า -> มีหน้าต่างยืนยันก่อนลบ
 * - กด "ชำระเงิน" -> ถ้ายังไม่ล็อกอิน จะเปิดหน้าต่าง Google Sign-In ก่อน
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Sparkles, Trash2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';
import { FREE_SHIPPING_THRESHOLD, type CartItem as CartItemType } from '../types';
import { ProductImage } from './ProductCard';
import { SaleChip, SalePrice } from './Promotions';
import { Button, ConfirmDialog, IconButton, QuantityStepper, Sheet } from './ui';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  onCheckout: () => void;
  onViewProduct: (id: string) => void;
}

export const FreeShippingProgress: React.FC<{ subtotal: number }> = ({ subtotal }) => {
  const { t, price } = useI18n();
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-2 flex items-center gap-1.5">
        {remaining === 0 ? (
          <>
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-success font-medium">{t('cart.freeShipUnlocked')}</span>
          </>
        ) : (
          <span>{t('cart.freeShipRemaining', { amount: price(remaining) })}</span>
        )}
      </p>
      <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

/** แถวสินค้าในตะกร้า (ใช้ทั้งใน Drawer และหน้าตะกร้า) */
export const CartLine: React.FC<{ item: CartItemType; onViewProduct?: (id: string) => void; large?: boolean }> = ({
  item,
  onViewProduct,
  large,
}) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { t, price } = useI18n();
  const view = useContent().product(item.product);
  const clickable = !item.product.craft && onViewProduct;

  return (
    <div className="flex gap-3 sm:gap-4">
      <button
        type="button"
        disabled={!clickable}
        onClick={() => clickable && onViewProduct!(item.product.id)}
        className={`${large ? 'w-24 h-28 sm:w-28 sm:h-32' : 'w-20 h-24'} shrink-0 rounded-xl overflow-hidden bg-surface-2`}
      >
        <ProductImage src={item.product.image} alt={view.name} className="w-full h-full object-cover" />
      </button>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onViewProduct!(item.product.id)}
              className={`text-left font-medium text-ink leading-snug line-clamp-2 ${large ? 'text-base sm:text-lg' : 'text-sm'} ${clickable ? 'hover:text-gold' : ''}`}
            >
              {view.name}
            </button>
            <p className="text-xs text-ink-3 mt-0.5">
              {t('cart.size', { size: item.selectedSize })}
              {view.beadSize && <span className="hidden sm:inline"> · {view.beadSize}</span>}
            </p>
            {item.product.sale && <SaleChip sale={item.product.sale} className="mt-1" />}
          </div>
          <IconButton
            label={t('cart.remove')}
            onClick={() => setConfirmOpen(true)}
            className="w-8 h-8 -mr-1.5 -mt-1 hover:text-danger"
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={item.product.craft ? 10 : Math.max(1, item.product.stock)}
            onChange={(delta) => updateQuantity(item.product.id, item.selectedSize, delta)}
            labels={{ decrease: t('qty.decrease'), increase: t('qty.increase') }}
          />
          <SalePrice
            size="sm"
            price={item.product.price}
            regularPrice={item.product.sale ? item.product.regularPrice : undefined}
            quantity={item.quantity}
          />
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={t('cart.removeTitle')}
        message={t('cart.removeConfirm')}
        confirmLabel={t('cart.removeYes')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          removeFromCart(item.product.id, item.selectedSize);
        }}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
          <ProductImage src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink line-clamp-2">{view.name}</p>
            <p className="text-xs text-ink-3">
              {t('cart.size', { size: item.selectedSize })} · ×{item.quantity} · {price(item.product.price * item.quantity)}
            </p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onNavigate, onCheckout, onViewProduct }) => {
  const { cart, cartCount, subtotal, shippingFee, total } = useCart();
  const { user } = useAuth();
  const { t, price } = useI18n();

  return (
    <Sheet
      open={isOpen}
      onClose={onClose}
      closeLabel={t('common.close')}
      title={
        <div>
          <h3 className="text-xl text-ink leading-tight">{t('cart.title')}</h3>
          <p className="text-xs text-ink-3">{t('cart.itemCount', { count: cartCount })}</p>
        </div>
      }
      footer={
        cart.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-2">
                <span>{t('cart.subtotal')}</span>
                <span className="tabular-nums text-ink">{price(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>{t('cart.shipping')}</span>
                <span className={shippingFee === 0 ? 'text-success' : 'tabular-nums text-ink'}>
                  {shippingFee === 0 ? t('cart.free') : price(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-line">
                <span className="font-medium text-ink">{t('cart.total')}</span>
                <span className="text-xl font-semibold text-ink tabular-nums">{price(total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  onNavigate('/cart');
                }}
              >
                {t('cart.viewCart')}
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
              >
                {!user && <Lock className="w-4 h-4" />}
                {t('cart.checkout')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            {!user && <p className="text-[11px] text-center text-ink-3">{t('cart.loginHint')}</p>}
          </div>
        )
      }
    >
      {cart.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-8 py-16">
          <div className="w-16 h-16 rounded-full bg-surface-2 text-gold flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h4 className="text-lg text-ink">{t('cart.emptyTitle')}</h4>
          <p className="text-sm text-ink-2">{t('cart.emptyDesc')}</p>
          <Button
            className="mt-2"
            onClick={() => {
              onClose();
              onNavigate('/shop');
            }}
          >
            {t('cart.browse')}
          </Button>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          <FreeShippingProgress subtotal={subtotal} />
          <div className="divide-y divide-line">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="py-4 first:pt-0">
                <CartLine
                  item={item}
                  onViewProduct={(id) => {
                    onClose();
                    onViewProduct(id);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
};
