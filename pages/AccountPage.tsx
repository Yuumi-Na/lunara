/**
 * LUNARA - PAGE: MY ACCOUNT & ORDERS (บัญชีของฉัน / ประวัติคำสั่งซื้อ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (GET /api/orders)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (useState, useEffect, Tab Filtering)]
 *
 * - แสดงเฉพาะคำสั่งซื้อของบัญชีที่ล็อกอินอยู่ (เซิร์ฟเวอร์กรองตามอีเมล)
 * - แต่ละคำสั่งซื้อแสดง: รหัส, สินค้า, ยอดรวม, วันที่, สถานะ + แถบความคืบหน้า
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, LayoutDashboard, LogOut, Package, Star, Truck, UserRound, XCircle } from 'lucide-react';
import type { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../services/api';
import { Avatar } from '../components/HeaderControls';
import { ProductImage } from '../components/ProductCard';
import { GoogleSignInButton } from '../components/LoginModal';
import { Badge, Button, Container, cx, EmptyState, Skeleton, Spinner, ToggleChip } from '../components/ui';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';

interface AccountPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const STATUS_TONE: Record<OrderStatus, 'info' | 'warn' | 'gold' | 'success' | 'danger'> = {
  Ordered: 'info',
  Preparing: 'warn',
  Shipping: 'gold',
  Completed: 'success',
  Cancelled: 'danger',
};

const STATUS_ICON: Record<OrderStatus, React.FC<{ className?: string }>> = {
  Ordered: Clock,
  Preparing: Package,
  Shipping: Truck,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

const PROGRESS: OrderStatus[] = ['Ordered', 'Preparing', 'Shipping', 'Completed'];

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate, onViewProduct }) => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { t, price, date } = useI18n();
  const content = useContent();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    setOrders(null);
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user]);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <Container className="py-16 sm:py-24">
        <div className="card max-w-md mx-auto p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-gold-soft text-gold flex items-center justify-center">
            <UserRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl text-ink">{t('account.loginTitle')}</h1>
          <p className="text-sm text-ink-2">{t('account.loginDesc')}</p>
          <GoogleSignInButton />
        </div>
      </Container>
    );
  }

  const visible = (orders ?? []).filter((o) => filter === 'all' || o.status === filter);

  return (
    <Container narrow className="py-10 sm:py-14 space-y-8">
      {/* Profile */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Avatar src={user.avatar} name={user.name} size={56} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl text-ink truncate">{user.name}</h1>
              <Badge tone={isAdmin ? 'gold' : 'neutral'}>{isAdmin ? t('role.admin') : t('role.customer')}</Badge>
            </div>
            <p className="text-sm text-ink-3 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={() => onNavigate('/admin')}>
              <LayoutDashboard className="w-4 h-4" />
              {t('nav.admin')}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
            {t('auth.signOut')}
          </Button>
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{t('account.eyebrow')}</p>
            <h2 className="text-2xl sm:text-3xl text-ink">{t('account.ordersTitle')}</h2>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <ToggleChip active={filter === 'all'} onClick={() => setFilter('all')} className="shrink-0">
            {t('account.all')} ({orders?.length ?? 0})
          </ToggleChip>
          {PROGRESS.map((s) => (
            <ToggleChip key={s} active={filter === s} onClick={() => setFilter(s)} className="shrink-0">
              {content.status(s)} ({orders?.filter((o) => o.status === s).length ?? 0})
            </ToggleChip>
          ))}
        </div>

        {orders === null ? (
          <div className="space-y-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Package className="w-7 h-7" />}
            title={t('account.emptyTitle')}
            description={t('account.emptyDesc')}
            action={<Button onClick={() => onNavigate('/shop')}>{t('cart.browse')}</Button>}
          />
        ) : (
          <div className="space-y-4">
            {visible.map((order) => {
              const Icon = STATUS_ICON[order.status];
              const step = PROGRESS.indexOf(order.status);
              return (
                <article key={order.id} className="card p-5 sm:p-6 space-y-5">
                  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink">{order.id}</p>
                      <p className="text-xs text-ink-3">{date(order.createdAt, true)}</p>
                    </div>
                    <Badge tone={STATUS_TONE[order.status]} className="self-start sm:self-auto">
                      <Icon className="w-3.5 h-3.5" />
                      {content.status(order.status)}
                    </Badge>
                  </header>

                  {step >= 0 && (
                    <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                      {PROGRESS.map((s, i) => (
                        <div key={s} className="space-y-1.5">
                          <div className={cx('h-1.5 rounded-full', i <= step ? 'bg-gold' : 'bg-surface-3')} />
                          <p className={cx('text-[10px] sm:text-xs truncate', i <= step ? 'text-ink' : 'text-ink-3')}>
                            {content.status(s)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <ul className="divide-y divide-line">
                    {order.items.map((item, idx) => {
                      const v = content.product(item.product);
                      const clickable = !item.product.craft;
                      return (
                        <li key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                          <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => onViewProduct(item.product.id)}
                            className="shrink-0"
                          >
                            <ProductImage src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink line-clamp-1">{v.name}</p>
                            <p className="text-xs text-ink-3">
                              {t('cart.size', { size: item.selectedSize })} · ×{item.quantity}
                            </p>
                            {clickable && order.status !== 'Cancelled' && (
                              <button
                                type="button"
                                onClick={() => onNavigate(`/product/${encodeURIComponent(item.product.id)}#reviews`)}
                                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline underline-offset-4"
                              >
                                <Star className="w-3.5 h-3.5" />
                                {t('review.writeForItem')}
                              </button>
                            )}
                          </div>
                          <span className="text-sm text-ink tabular-nums">{price(item.product.price * item.quantity)}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-line text-sm">
                    <span className="text-ink-3">
                      {content.payment(order.paymentMethod)} ·{' '}
                      {order.shippingFee === 0 ? t('cart.free') : `${t('cart.shipping')} ${price(order.shippingFee)}`}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="text-ink-3">{t('cart.total')}</span>
                      <span className="text-lg font-semibold text-ink tabular-nums">{price(order.total)}</span>
                    </span>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};
