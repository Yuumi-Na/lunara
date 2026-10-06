/**
 * LUNARA - PAGE: CHECKOUT PAGE (หน้าชำระเงินและสั่งซื้อ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 6: Form & Input Validation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form (useForm, register, handleSubmit, errors)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation (checkoutSchema)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (POST /api/orders)]
 *
 * - ต้องล็อกอินด้วย Google ก่อนเท่านั้น (ทั้งหน้าเว็บ และ API ฝั่งเซิร์ฟเวอร์ตรวจซ้ำ)
 * - ราคาสุทธิคำนวณใหม่ที่เซิร์ฟเวอร์จากฐานข้อมูล ไม่เชื่อราคาจากเบราว์เซอร์
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, CreditCard, Lock, QrCode, ShieldCheck, Truck } from 'lucide-react';
import { checkoutSchema, type CheckoutFormValues, type Order, type PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError, createOrder } from '../services/api';
import { ProductImage } from '../components/ProductCard';
import { GoogleSignInButton } from '../components/LoginModal';
import { Badge, Button, Container, cx, EmptyState, Field, Input, PageHeader, Spinner, Textarea } from '../components/ui';
import { useI18n, type TKey } from '../i18n';
import { useContent } from '../i18n/content';

interface CheckoutPageProps {
  onNavigate: (url: string) => void;
  onOrderPlaced: () => void;
}

const PAYMENTS: { id: PaymentMethod; icon: React.FC<{ className?: string }>; desc: TKey }[] = [
  { id: 'promptpay', icon: QrCode, desc: 'pay.promptpayDesc' },
  { id: 'credit_card', icon: CreditCard, desc: 'pay.credit_cardDesc' },
  { id: 'cod', icon: Truck, desc: 'pay.codDesc' },
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderPlaced }) => {
  const { cart, subtotal, shippingFee, total, clearCart, removeFromCart } = useCart();
  const { user, isLoading } = useAuth();
  const toast = useToast();
  const { t, tk, price } = useI18n();
  const content = useContent();
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      phone: '',
      address: '',
      province: '',
      district: '',
      postalCode: '',
      paymentMethod: 'promptpay',
    },
  });

  const payment = watch('paymentMethod');

  // ล็อกอินจากหน้านี้แล้ว -> เติมชื่อจากบัญชี Google ให้อัตโนมัติ
  useEffect(() => {
    if (user && !getValues('fullName')) setValue('fullName', user.name);
  }, [user, getValues, setValue]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitting(true);
    try {
      const order = await createOrder(values, cart);
      clearCart();
      setCompleted(order);
      onOrderPlaced();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'OUT_OF_STOCK') {
        toast(t('checkout.outOfStock'), 'error');
      } else if (err instanceof ApiError && err.code === 'NOT_FOUND' && err.productId) {
        removeFromCart(err.productId, cart.find((c) => c.product.id === err.productId)?.selectedSize ?? '');
        toast(t('checkout.productGone'), 'error');
      } else if (err instanceof ApiError && err.status === 401) {
        toast(t('checkout.sessionExpired'), 'error');
      } else {
        toast(t('checkout.failed'), 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------- success
  if (completed) {
    return (
      <Container narrow className="py-14 sm:py-20">
        <div className="max-w-xl mx-auto text-center space-y-6 animate-fade-up">
          <div className="w-20 h-20 mx-auto rounded-full bg-success-soft text-success flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <p className="eyebrow">{t('checkout.successEyebrow')}</p>
            <h1 className="text-3xl sm:text-4xl text-ink">{t('checkout.successTitle')}</h1>
            <p className="text-ink-2">{t('checkout.successDesc')}</p>
          </div>
          <div className="card p-6 text-left space-y-3 text-sm">
            <Row label={t('order.id')} value={<span className="font-mono font-semibold">{completed.id}</span>} />
            <Row label={t('order.recipient')} value={`${completed.customerName} · ${completed.phone}`} />
            <Row
              label={t('order.address')}
              value={`${completed.address}, ${completed.district}, ${completed.province} ${completed.postalCode}`}
            />
            <Row label={t('order.payment')} value={content.payment(completed.paymentMethod)} />
            <Row label={t('order.status')} value={<Badge tone="info">{content.status(completed.status)}</Badge>} />
            <div className="flex justify-between items-baseline pt-3 border-t border-line">
              <span className="font-medium text-ink">{t('cart.total')}</span>
              <span className="text-2xl font-semibold text-ink tabular-nums">{price(completed.total)}</span>
            </div>
            {completed.paymentMethod === 'promptpay' && (
              <div className="rounded-2xl bg-surface-2 p-5 text-center space-y-2 mt-2">
                <p className="text-sm font-medium text-ink">{t('checkout.scanToPay')}</p>
                <div className="w-36 h-36 mx-auto bg-white rounded-xl p-3 flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>
                <p className="text-xs text-ink-3">{t('checkout.payTo', { amount: price(completed.total) })}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => onNavigate('/account')}>{t('checkout.viewOrders')}</Button>
            <Button variant="secondary" onClick={() => onNavigate('/shop')}>
              {t('cart.continue')}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // ---------------------------------------------------------------- login gate
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl text-ink">{t('checkout.loginTitle')}</h1>
          <p className="text-sm text-ink-2">{t('checkout.loginDesc')}</p>
          <GoogleSignInButton />
          <button type="button" onClick={() => onNavigate('/cart')} className="text-sm text-ink-3 hover:text-ink">
            ← {t('checkout.backToCart')}
          </button>
        </div>
      </Container>
    );
  }

  if (cart.length === 0) {
    return (
      <Container className="py-16 sm:py-24">
        <EmptyState
          icon={<Truck className="w-7 h-7" />}
          title={t('checkout.emptyTitle')}
          description={t('checkout.emptyDesc')}
          action={<Button onClick={() => onNavigate('/shop')}>{t('cart.browse')}</Button>}
        />
      </Container>
    );
  }

  // ---------------------------------------------------------------- form
  const err = (key: keyof CheckoutFormValues) => tk(errors[key]?.message);

  return (
    <Container className="py-10 sm:py-14 space-y-8">
      <button type="button" onClick={() => onNavigate('/cart')} className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft className="w-4 h-4" />
        {t('checkout.backToCart')}
      </button>
      <PageHeader eyebrow={t('checkout.eyebrow')} title={t('checkout.title')} />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="lg:col-span-7 space-y-6">
          <Section n={1} title={t('checkout.contact')}>
            <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-ink-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success shrink-0" />
              {t('checkout.signedInAs', { email: user.email })}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={t('checkout.fullName')} required error={err('fullName')} htmlFor="fullName">
                <Input id="fullName" autoComplete="name" aria-invalid={!!errors.fullName} {...register('fullName')} />
              </Field>
              <Field label={t('checkout.phone')} required error={err('phone')} htmlFor="phone">
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0812345678" aria-invalid={!!errors.phone} {...register('phone')} />
              </Field>
            </div>
          </Section>

          <Section n={2} title={t('checkout.shippingAddress')}>
            <Field label={t('checkout.address')} required error={err('address')} htmlFor="address">
              <Textarea id="address" rows={2} autoComplete="street-address" aria-invalid={!!errors.address} {...register('address')} />
            </Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label={t('checkout.district')} required error={err('district')} htmlFor="district">
                <Input id="district" aria-invalid={!!errors.district} {...register('district')} />
              </Field>
              <Field label={t('checkout.province')} required error={err('province')} htmlFor="province">
                <Input id="province" autoComplete="address-level1" aria-invalid={!!errors.province} {...register('province')} />
              </Field>
              <Field label={t('checkout.postalCode')} required error={err('postalCode')} htmlFor="postalCode">
                <Input id="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} aria-invalid={!!errors.postalCode} {...register('postalCode')} />
              </Field>
            </div>
          </Section>

          <Section n={3} title={t('checkout.payment')}>
            <div className="space-y-2.5">
              {PAYMENTS.map(({ id, icon: Icon, desc }) => (
                <label
                  key={id}
                  className={cx(
                    'flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-colors',
                    payment === id ? 'border-gold bg-gold-soft/50 ring-1 ring-gold' : 'border-line hover:border-gold'
                  )}
                >
                  <input type="radio" value={id} {...register('paymentMethod')} className="w-4 h-4" />
                  <Icon className="w-5 h-5 text-gold shrink-0" />
                  <span className="flex-1">
                    <span className="block font-medium text-ink">{content.payment(id)}</span>
                    <span className="block text-xs text-ink-3">{t(desc)}</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Button type="submit" size="lg" block loading={submitting}>
            {submitting ? t('checkout.placing') : t('checkout.place', { amount: price(total) })}
          </Button>
        </form>

        <aside className="lg:col-span-5 lg:sticky lg:top-28 card p-6 space-y-5">
          <h2 className="text-xl text-ink">{t('checkout.orderSummary', { count: cart.length })}</h2>
          <ul className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => {
              const v = content.product(item.product);
              return (
                <li key={`${item.product.id}-${item.selectedSize}`} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <ProductImage src={item.product.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-on-accent text-[10px] font-semibold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink line-clamp-1">{v.name}</p>
                    <p className="text-xs text-ink-3">{t('cart.size', { size: item.selectedSize })}</p>
                  </div>
                  <span className="text-sm font-medium text-ink tabular-nums">{price(item.product.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="space-y-2 text-sm pt-4 border-t border-line">
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
        </aside>
      </div>
    </Container>
  );
};

const Section: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <section className="card p-5 sm:p-7 space-y-4">
    <h2 className="flex items-center gap-3 text-xl text-ink">
      <span className="w-7 h-7 rounded-full bg-accent text-on-accent text-xs font-sans font-semibold flex items-center justify-center">
        {n}
      </span>
      {title}
    </h2>
    {children}
  </section>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="text-ink-3 shrink-0">{label}</span>
    <span className="text-ink text-right">{value}</span>
  </div>
);
