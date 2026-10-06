/**
 * LUNARA - ADMIN PORTAL (หลังร้าน)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: REST API Integration]
 *
 * แยกส่วนจากหน้าร้านของลูกค้าชัดเจน เข้าได้เฉพาะบัญชี Google ที่มีสิทธิ์ admin
 * (ตรวจทั้งหน้าเว็บ และทุก API ฝั่งเซิร์ฟเวอร์ผ่าน requireAdmin)
 *
 * เมนูหลังร้าน:
 * - ภาพรวม     : ยอดขาย, คำสั่งซื้อรอดำเนินการ, สินค้าใกล้หมด
 * - สินค้า      : เพิ่ม / แก้ไข / ลบ (CRUD) พร้อมอัปโหลดรูป
 * - คำสั่งซื้อ   : ดูทุกคำสั่งซื้อ + เปลี่ยนสถานะการจัดส่ง
 * - รีวิว       : ดูรีวิวทั้งหมด ตอบกลับลูกค้า ซ่อน/แสดง และลบ
 * - คลังรูปภาพ  : อัปโหลด / คัดลอกลิงก์ / ลบรูปในฐานข้อมูล
 * - ลูกค้า      : รายชื่อผู้ใช้ที่ล็อกอินด้วย Google
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  ShoppingCart,
  Store,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import type { AppUser, Order, OrderStatus, Product, ProductFormValues } from '../../types';
import { ORDER_STATUSES } from '../../types';
import type { AdminSection } from '../../hooks/useAppRouter';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as api from '../../services/api';
import { Avatar } from '../../components/HeaderControls';
import { ProductImage } from '../../components/ProductCard';
import { GoogleSignInButton } from '../../components/LoginModal';
import { Badge, Button, cx, EmptyState, Field, Input, Modal, Select, Skeleton, Spinner } from '../../components/ui';
import { STATUS_TONE } from '../AccountPage';
import { useI18n, type TKey } from '../../i18n';
import { useContent } from '../../i18n/content';
import { ProductForm } from './ProductForm';
import { ReviewsSection } from './ReviewsSection';
import { FolderBrowser } from './ImagePicker';

interface AdminPageProps {
  section: AdminSection;
  products: Product[];
  onProductsChange: (products: Product[]) => void;
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

const SECTIONS: { id: AdminSection; label: TKey; icon: React.FC<{ className?: string }> }[] = [
  { id: 'overview', label: 'admin.overview', icon: LayoutDashboard },
  { id: 'products', label: 'admin.products', icon: Package },
  { id: 'orders', label: 'admin.orders', icon: ShoppingCart },
  { id: 'reviews', label: 'admin.reviews', icon: MessageSquareText },
  { id: 'media', label: 'admin.media', icon: Images },
  { id: 'customers', label: 'admin.customers', icon: Users },
];

export const AdminPage: React.FC<AdminPageProps> = (props) => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner />
      </div>
    );
  }

  // ---------------------------------------------------------------- access gate
  if (!user || !isAdmin) {
    return (
      <div className="px-4 py-16 sm:py-24">
        <div className="card max-w-md mx-auto p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-danger-soft text-danger flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl text-ink">{t('admin.gateTitle')}</h1>
          {user ? (
            <>
              <p className="text-sm text-ink-2">{t('admin.notAllowed', { email: user.email })}</p>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  {t('admin.switchAccount')}
                </Button>
                <Button variant="ghost" onClick={() => props.onNavigate('/')}>
                  {t('common.backHome')}
                </Button>
              </div>
            </>
          ) : (
            <AdminLoginOptions />
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- layout
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <aside className="lg:w-60 shrink-0 lg:sticky lg:top-28 lg:self-start space-y-4">
          <div className="hidden lg:flex items-center gap-3 p-3 rounded-2xl bg-surface border border-line">
            <Avatar src={user.avatar} name={user.name} size={40} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user.name}</p>
              <Badge tone="gold">{t('role.admin')}</Badge>
            </div>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => props.onNavigate(id === 'overview' ? '/admin' : `/admin/${id}`)}
                aria-current={props.section === id ? 'page' : undefined}
                className={cx(
                  'shrink-0 flex items-center gap-3 h-11 px-4 rounded-xl text-sm transition-colors',
                  props.section === id ? 'bg-accent text-on-accent font-medium' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                )}
              >
                <Icon className="w-4 h-4" />
                {t(label)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => props.onNavigate('/')}
              className="shrink-0 flex items-center gap-3 h-11 px-4 rounded-xl text-sm text-ink-3 hover:bg-surface-2 hover:text-ink lg:mt-4"
            >
              <Store className="w-4 h-4" />
              {t('admin.viewStore')}
            </button>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {props.section === 'overview' && <Overview onNavigate={props.onNavigate} />}
          {props.section === 'products' && <ProductsSection {...props} />}
          {props.section === 'orders' && <OrdersSection />}
          {props.section === 'reviews' && <ReviewsSection onViewProduct={props.onViewProduct} />}
          {props.section === 'media' && <MediaSection />}
          {props.section === 'customers' && <CustomersSection />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN LOGIN: Google หรือ Username / Password (ช่องทางรหัสผ่านมีเฉพาะหน้านี้ ลูกค้าทั่วไปใช้ Google)
// ============================================================================
const AdminLoginOptions: React.FC = () => {
  const { passwordLoginEnabled, loginAdmin } = useAuth();
  const { t } = useI18n();
  const [method, setMethod] = useState<'password' | 'google'>(passwordLoginEnabled ? 'password' : 'google');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await loginAdmin(username.trim(), password);
    } catch (err) {
      const apiErr = err instanceof api.ApiError ? err : null;
      setError(
        apiErr?.code === 'TOO_MANY_ATTEMPTS'
          ? t('admin.loginLocked')
          : apiErr?.code === 'INVALID_CREDENTIALS'
            ? t('admin.loginInvalid')
            : t('auth.errGeneric')
      );
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 text-left">
      <p className="text-sm text-ink-2 text-center">{t('admin.gateDesc')}</p>

      {passwordLoginEnabled && (
        <div role="tablist" className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2">
          {(['password', 'google'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={method === m}
              onClick={() => setMethod(m)}
              className={cx(
                'h-10 rounded-xl text-sm font-medium transition-colors',
                method === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink'
              )}
            >
              {m === 'password' ? t('admin.methodPassword') : 'Google'}
            </button>
          ))}
        </div>
      )}

      {method === 'password' && passwordLoginEnabled ? (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label={t('admin.username')} htmlFor="admin-username">
            <Input
              id="admin-username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field>
          <Field label={t('admin.password')} htmlFor="admin-password">
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t('admin.hidePassword') : t('admin.showPassword')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-ink"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" block loading={submitting} disabled={!username.trim() || !password}>
            <KeyRound className="w-4 h-4" />
            {t('auth.signIn')}
          </Button>
        </form>
      ) : (
        <GoogleSignInButton />
      )}
    </div>
  );
};

const SectionTitle: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div>
      <p className="eyebrow">{useI18n().t('admin.eyebrow')}</p>
      <h1 className="text-3xl text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-ink-2 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ============================================================================
// OVERVIEW
// ============================================================================
const Overview: React.FC<{ onNavigate: (url: string) => void }> = ({ onNavigate }) => {
  const { t, price, date } = useI18n();
  const content = useContent();
  const [stats, setStats] = useState<api.AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api.fetchAdminStats().then(setStats).catch(console.error);
    api.fetchAllOrders().then((o) => setOrders(o.slice(0, 5))).catch(() => setOrders([]));
  }, []);

  const cards: { label: TKey; value: string | number | undefined; icon: React.FC<{ className?: string }>; to: string }[] = [
    { label: 'admin.revenue', value: stats ? price(stats.revenue) : undefined, icon: Wallet, to: '/admin/orders' },
    { label: 'admin.pending', value: stats?.pendingCount, icon: ShoppingCart, to: '/admin/orders' },
    { label: 'admin.productCount', value: stats?.productCount, icon: Package, to: '/admin/products' },
    { label: 'admin.customerCount', value: stats?.customerCount, icon: Users, to: '/admin/customers' },
    { label: 'ar.unanswered', value: stats?.unansweredReviews, icon: MessageSquareText, to: '/admin/reviews' },
  ];

  return (
    <div className="space-y-8">
      <SectionTitle title={t('admin.overview')} subtitle={t('admin.overviewDesc')} />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <button key={label} type="button" onClick={() => onNavigate(to)} className="card card-hover p-5 text-left">
            <Icon className="w-5 h-5 text-gold mb-4" />
            <p className="text-xs text-ink-3">{t(label)}</p>
            {value === undefined ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums mt-0.5">{value}</p>
            )}
          </button>
        ))}
      </div>

      <div className="grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-ink">{t('admin.recentOrders')}</h2>
            <button type="button" onClick={() => onNavigate('/admin/orders')} className="text-sm text-ink-2 hover:text-gold">
              {t('common.viewAll')} →
            </button>
          </div>
          {orders === null ? (
            <Skeleton className="h-40" />
          ) : orders.length === 0 ? (
            <p className="text-sm text-ink-3 py-8 text-center">{t('admin.noOrders')}</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-mono font-medium text-ink">{o.id}</p>
                    <p className="text-xs text-ink-3 truncate">
                      {o.customerName} · {date(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={STATUS_TONE[o.status]}>{content.status(o.status)}</Badge>
                    <span className="font-medium text-ink tabular-nums hidden sm:inline">{price(o.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="xl:col-span-2 card p-5 sm:p-6">
          <h2 className="text-xl text-ink mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warn" />
            {t('admin.lowStock')}
          </h2>
          {!stats ? (
            <Skeleton className="h-32" />
          ) : stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink-3 py-6 text-center">{t('admin.stockOk')}</p>
          ) : (
            <ul className="space-y-2">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink truncate">{p.name}</span>
                  <Badge tone={p.stock === 0 ? 'danger' : 'warn'}>{t('admin.units', { count: p.stock })}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRODUCTS (CRUD)
// ============================================================================
const ProductsSection: React.FC<AdminPageProps> = ({ products, onProductsChange, onViewProduct }) => {
  const { t, price } = useI18n();
  const content = useContent();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = ปิดฟอร์ม, null = เพิ่มใหม่
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase().trim();
    return !q || [p.name, p.englishName, p.stone, p.id].join(' ').toLowerCase().includes(q);
  });

  // CREATE / UPDATE
  const handleSubmit = async (values: ProductFormValues) => {
    try {
      if (editing) {
        const updated = await api.updateProduct(editing.id, values);
        onProductsChange(products.map((p) => (p.id === updated.id ? updated : p)));
        toast(t('admin.productUpdated', { name: updated.name }));
      } else {
        const created = await api.createProduct(values);
        onProductsChange([created, ...products]);
        toast(t('admin.productCreated', { name: created.name }));
      }
      setEditing(undefined);
    } catch (err) {
      console.error(err);
      toast(t('admin.saveFailed'), 'error');
    }
  };

  // DELETE
  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteProduct(deleting.id);
      onProductsChange(products.filter((p) => p.id !== deleting.id));
      toast(t('admin.productDeleted', { name: deleting.name }));
      setDeleting(null);
    } catch {
      toast(t('admin.deleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SectionTitle
        title={t('admin.products')}
        subtitle={t('admin.productsDesc', { count: products.length })}
        action={
          <Button onClick={() => setEditing(null)}>
            <Plus className="w-4 h-4" />
            {t('admin.addProduct')}
          </Button>
        }
      />

      <div className="relative max-w-sm mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.searchProducts')}
          className="input pl-10"
        />
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {filtered.map((p) => (
            <li key={p.id} className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
              <button type="button" onClick={() => onViewProduct(p.id)} className="shrink-0">
                <ProductImage src={p.image} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink text-sm sm:text-base line-clamp-1">{p.name}</p>
                <p className="text-xs text-ink-3 truncate">{p.stone}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <Badge>{content.style(p.style)}</Badge>
                  {p.isBestSeller && <Badge tone="accent">{t('badge.bestSeller')}</Badge>}
                  {p.isNewArrival && <Badge tone="gold">{t('badge.new')}</Badge>}
                </div>
              </div>
              <div className="hidden sm:block text-right shrink-0 w-28">
                <p className="font-semibold text-ink tabular-nums">{price(p.price)}</p>
                <p className={cx('text-xs', p.stock <= 5 ? 'text-warn' : 'text-ink-3')}>{t('admin.units', { count: p.stock })}</p>
              </div>
              <div className="flex shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  aria-label={t('common.edit')}
                  title={t('common.edit')}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-ink-2 hover:bg-surface-2 hover:text-gold"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(p)}
                  aria-label={t('common.delete')}
                  title={t('common.delete')}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-ink-2 hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="p-10 text-center text-sm text-ink-3">{t('shop.emptyTitle')}</li>}
        </ul>
      </div>

      <Modal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing ? t('admin.editProduct') : t('admin.addProduct')}
        closeLabel={t('common.close')}
        size="lg"
      >
        {editing !== undefined && (
          <ProductForm key={editing?.id ?? 'new'} initialData={editing} onSubmit={handleSubmit} onCancel={() => setEditing(undefined)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('admin.deleteTitle')}
        message={t('admin.deleteConfirm', { name: deleting?.name ?? '' })}
        confirmLabel={t('common.delete')}
        busy={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
};

const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title, message, confirmLabel, busy, onConfirm, onClose }) => {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={title} closeLabel={t('common.close')} size="sm">
      <p className="text-sm text-ink-2 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

// ============================================================================
// ORDERS
// ============================================================================
const OrdersSection: React.FC = () => {
  const { t, price, date } = useI18n();
  const content = useContent();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [open, setOpen] = useState<Order | null>(null);

  useEffect(() => {
    api.fetchAllOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(order.id, status);
      setOrders((prev) => prev?.map((o) => (o.id === updated.id ? updated : o)) ?? null);
      setOpen((o) => (o?.id === updated.id ? updated : o));
      toast(t('admin.statusUpdated', { id: order.id, status: content.status(status) }));
    } catch {
      toast(t('admin.saveFailed'), 'error');
    }
  };

  const visible = (orders ?? []).filter((o) => filter === 'all' || o.status === filter);

  return (
    <div>
      <SectionTitle title={t('admin.orders')} subtitle={t('admin.ordersDesc')} />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['all', ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cx(
              'shrink-0 h-9 px-3.5 rounded-full text-sm border transition-colors',
              filter === s ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line text-ink-2 hover:border-gold'
            )}
          >
            {s === 'all' ? t('account.all') : content.status(s)} ({(orders ?? []).filter((o) => s === 'all' || o.status === s).length})
          </button>
        ))}
      </div>

      {orders === null ? (
        <Skeleton className="h-64" />
      ) : visible.length === 0 ? (
        <EmptyState icon={<ShoppingCart className="w-7 h-7" />} title={t('admin.noOrders')} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-left text-xs uppercase tracking-wider text-ink-3 bg-surface-2">
              <tr>
                <th className="px-4 py-3 font-medium">{t('order.id')}</th>
                <th className="px-4 py-3 font-medium">{t('admin.customer')}</th>
                <th className="px-4 py-3 font-medium">{t('order.date')}</th>
                <th className="px-4 py-3 font-medium text-right">{t('cart.total')}</th>
                <th className="px-4 py-3 font-medium">{t('order.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((o) => (
                <tr key={o.id} className="hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setOpen(o)} className="font-mono font-medium text-ink hover:text-gold">
                      {o.id}
                    </button>
                    <p className="text-xs text-ink-3">{t('admin.itemCount', { count: o.items.reduce((s, i) => s + i.quantity, 0) })}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink">{o.customerName}</p>
                    <p className="text-xs text-ink-3">{o.userEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-2 whitespace-nowrap">{date(o.createdAt, true)}</td>
                  <td className="px-4 py-3 text-right font-medium text-ink tabular-nums">{price(o.total)}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                      aria-label={t('order.status')}
                      className="h-9 py-1 text-sm w-40"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {content.status(s)}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.id} closeLabel={t('common.close')}>
        {open && (
          <div className="space-y-5 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <Info label={t('order.recipient')} value={`${open.customerName} · ${open.phone}`} />
              <Info label={t('admin.account')} value={open.userEmail} />
              <Info label={t('order.address')} value={`${open.address}, ${open.district}, ${open.province} ${open.postalCode}`} />
              <Info label={t('order.payment')} value={content.payment(open.paymentMethod)} />
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {open.items.map((item, idx) => (
                <li key={idx} className="py-3 flex items-center gap-3">
                  <ProductImage src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-ink line-clamp-1">{content.product(item.product).name}</p>
                    <p className="text-xs text-ink-3">
                      {t('cart.size', { size: item.selectedSize })} · ×{item.quantity}
                    </p>
                  </div>
                  <span className="tabular-nums text-ink">{price(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between">
              <span className="text-ink-2">{t('cart.shipping')}</span>
              <span className="text-ink tabular-nums">{open.shippingFee === 0 ? t('cart.free') : price(open.shippingFee)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-medium text-ink">{t('cart.total')}</span>
              <span className="text-xl font-semibold text-ink tabular-nums">{price(open.total)}</span>
            </div>
            <Select value={open.status} onChange={(e) => changeStatus(open, e.target.value as OrderStatus)} aria-label={t('order.status')}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {content.status(s)}
                </option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-ink-3">{label}</p>
    <p className="text-ink">{value}</p>
  </div>
);

// ============================================================================
// MEDIA LIBRARY (โฟลเดอร์ img/)
// ============================================================================
const MediaSection: React.FC = () => {
  const { t } = useI18n();
  return (
    <div>
      <SectionTitle title={t('admin.media')} subtitle={t('media.sectionDesc')} />
      <div className="card p-4 sm:p-6">
        <FolderBrowser mode="manage" />
      </div>
    </div>
  );
};

// ============================================================================
// CUSTOMERS
// ============================================================================
const CustomersSection: React.FC = () => {
  const { t, date } = useI18n();
  const [users, setUsers] = useState<(AppUser & { orderCount: number })[] | null>(null);

  useEffect(() => {
    api.fetchCustomers().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <SectionTitle title={t('admin.customers')} subtitle={t('admin.customersDesc')} />
      {users === null ? (
        <Skeleton className="h-64" />
      ) : users.length === 0 ? (
        <EmptyState icon={<Users className="w-7 h-7" />} title={t('admin.noCustomers')} />
      ) : (
        <div className="card divide-y divide-line">
          {users.map((u) => (
            <div key={u.email} className="p-4 flex items-center gap-4">
              <Avatar src={u.avatar} name={u.name} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink truncate">{u.name}</p>
                  {u.role === 'admin' && <Badge tone="gold">{t('role.admin')}</Badge>}
                </div>
                <p className="text-xs text-ink-3 truncate">{u.email}</p>
              </div>
              <div className="text-right text-xs text-ink-3 shrink-0">
                <p className="text-ink text-sm">{t('admin.orderCount', { count: u.orderCount })}</p>
                {u.lastLoginAt && <p>{t('admin.lastLogin', { date: date(u.lastLoginAt) })}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
