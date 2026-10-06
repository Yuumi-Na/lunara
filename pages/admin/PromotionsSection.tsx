/**
 * LUNARA - ADMIN: PROMOTIONS (โปรโมชั่น)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form] [โมดูลที่ 8: Zod] [โมดูลที่ 9: CRUD]
 *
 * ทุกโปรโมชั่นกำหนดได้: ชื่อ, รูป, วันเริ่ม–วันหมดอายุ, เปิด/ปิด และโค้ดที่สร้างอัตโนมัติ
 * ตามประเภท + วันเริ่ม (เช่น BILL-261007-K7Q2)
 *
 * ประเภท:
 * 1. ลดรายบิล     : ซื้อครบ X บาท ลด Y บาท / Y% (ใช้โค้ด)
 *                    สิทธิ์: จำกัดต่อผู้ใช้ (เช่น 1 คน 1 ครั้งต่อแคมเปญ) และ/หรือ จำกัดทั้งแคมเปญ (เช่น ใช้ได้รวม 1 ครั้ง)
 * 2. ลดทั้งร้าน    : ลดราคาสินค้าทุกชิ้นอัตโนมัติตามช่วงเวลา (บาท หรือ %)
 * 3. ลดรายสินค้า   : เลือกสินค้าที่ร่วมรายการ ลดอัตโนมัติ (บาท / %) มียอดขั้นต่ำและสิทธิ์ได้
 * 4. Code ส่วนลด    : ตั้งโค้ดเอง เช่น NEW ใช้ทั้งร้านหรือเฉพาะสินค้า มียอดขั้นต่ำและสิทธิ์ได้ (ไม่แสดงบนหน้าเว็บ)
 * 5. สมาชิกใหม่    : ผู้ที่สมัครตั้งแต่วันที่กำหนด และยังอยู่ใน 1 เดือนแรก (New member)
 *                    ลด 100 บาท เมื่อซื้อขั้นต่ำ 500 บาท ใช้ได้ 1 ครั้งต่อคน
 * ============================================================================
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Check, Copy, KeyRound, Package, Pencil, Plus, RefreshCw, Search, Store, TicketPercent, Trash2, UserPlus, Users } from 'lucide-react';
import {
  promotionFormSchema,
  type Product,
  type Promotion,
  type PromotionFormValues,
  type PromotionStatus,
  type PromotionType,
} from '../../types';
import { generatePromoCode, NEW_MEMBER_DEFAULTS } from '../../data/promotions';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { usePromoText } from '../../components/Promotions';
import { ProductImage } from '../../components/ProductCard';
import { Badge, Button, ConfirmDialog, cx, EmptyState, Field, Input, Modal, Skeleton, Textarea } from '../../components/ui';
import { useI18n, type TKey } from '../../i18n';
import { ImagePicker } from './ImagePicker';

const TYPE_META: Record<PromotionType, { icon: React.FC<{ className?: string }>; label: TKey; desc: TKey }> = {
  bill: { icon: TicketPercent, label: 'promoType.bill', desc: 'promoType.billDesc' },
  storewide: { icon: Store, label: 'promoType.storewide', desc: 'promoType.storewideDesc' },
  product: { icon: Package, label: 'promoType.product', desc: 'promoType.productDesc' },
  code: { icon: KeyRound, label: 'promoType.code', desc: 'promoType.codeDesc' },
  new_member: { icon: UserPlus, label: 'promoType.new_member', desc: 'promoType.new_memberDesc' },
};

const STATUS_TONE: Record<PromotionStatus, 'success' | 'info' | 'neutral' | 'warn' | 'danger'> = {
  active: 'success',
  scheduled: 'info',
  expired: 'neutral',
  disabled: 'warn',
  used_up: 'danger',
};

/** ISO -> ค่าสำหรับ <input type="datetime-local"> (เวลาท้องถิ่น) */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultValues(p?: Promotion | null): PromotionFormValues {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 30 * 86400e3);
  const type = p?.type ?? 'bill';
  return {
    name: p?.name ?? '',
    description: p?.description ?? '',
    image: p?.image ?? '',
    code: p?.code ?? generatePromoCode(type, start),
    type,
    startAt: toLocalInput(p?.startAt ?? start.toISOString()),
    endAt: toLocalInput(p?.endAt ?? end.toISOString()),
    enabled: p?.enabled ?? true,
    discountKind: p?.discountKind ?? 'amount',
    discountValue: p?.discountValue ?? 100,
    maxDiscount: p?.maxDiscount ?? null,
    minSpend: p?.minSpend ?? 500,
    perUserLimit: p ? p.perUserLimit : 1,
    totalLimit: p ? p.totalLimit : null,
    signupFrom: p?.signupFrom ? toLocalInput(p.signupFrom).slice(0, 10) : new Date().toISOString().slice(0, 10),
    scope: p?.scope ?? 'all',
    productIds: p?.productIds ?? [],
  };
}

export const PromotionsSection: React.FC<{ products: Product[]; onChanged: () => void }> = ({ products, onChanged }) => {
  const { t, price, date } = useI18n();
  const toast = useToast();
  const text = usePromoText();
  const [promotions, setPromotions] = useState<api.AdminPromotion[] | null>(null);
  const [editing, setEditing] = useState<Promotion | null | undefined>(undefined); // undefined = ปิด, null = สร้างใหม่
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.fetchAdminPromotions().then(setPromotions).catch(() => setPromotions([]));
  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (values: PromotionFormValues) => {
    try {
      if (editing) {
        await api.updatePromotion(editing.id, values);
        toast(t('promo.updated', { name: values.name }));
      } else {
        const created = await api.createPromotion(values);
        toast(t('promo.created', { code: created.code }));
      }
      setEditing(undefined);
      await load();
      onChanged();
    } catch (err) {
      const reason = err instanceof api.ApiError ? err.message : '';
      toast(reason === 'err.promoCodeTaken' ? t('err.promoCodeTaken') : t('admin.saveFailed'), 'error');
    }
  };

  const toggleEnabled = async (p: api.AdminPromotion) => {
    try {
      await api.updatePromotion(p.id, { ...defaultValues(p), startAt: p.startAt, endAt: p.endAt, signupFrom: p.signupFrom ?? null, enabled: !p.enabled });
      toast(p.enabled ? t('promo.disabledToast') : t('promo.enabledToast'));
      await load();
      onChanged();
    } catch {
      toast(t('admin.saveFailed'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deletePromotion(deleting.id);
      toast(t('promo.deleted'));
      setDeleting(null);
      await load();
      onChanged();
    } catch {
      toast(t('admin.deleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = (code: string) =>
    navigator.clipboard
      .writeText(code)
      .then(() => toast(t('promo.codeCopied', { code })))
      .catch(() => toast(code, 'info'));

  const counts = useMemo(() => {
    const list = promotions ?? [];
    return {
      active: list.filter((p) => p.status === 'active').length,
      scheduled: list.filter((p) => p.status === 'scheduled').length,
      used: list.reduce((s, p) => s + (p.usedCount ?? 0), 0),
    };
  }, [promotions]);

  const limitText = (p: Promotion) => {
    if (p.type === 'storewide') return t('promo.limitAuto');
    const parts = [
      p.perUserLimit ? t('promo.perUserShort', { count: p.perUserLimit }) : t('promo.perUserUnlimited'),
      p.totalLimit ? t('promo.totalShort', { used: p.usedCount ?? 0, count: p.totalLimit }) : t('promo.usedShort', { used: p.usedCount ?? 0 }),
    ];
    return parts.join(' · ');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="eyebrow">{t('admin.eyebrow')}</p>
          <h1 className="text-3xl text-ink">{t('admin.promotions')}</h1>
          <p className="text-sm text-ink-2 mt-1">{t('promo.sectionDesc')}</p>
        </div>
        <Button onClick={() => setEditing(null)}>
          <Plus className="w-4 h-4" />
          {t('promo.add')}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {(
          [
            ['promoStatus.active', counts.active],
            ['promoStatus.scheduled', counts.scheduled],
            ['promo.totalUsed', counts.used],
          ] as [TKey, number][]
        ).map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ink-3">{t(label)}</p>
            {promotions === null ? <Skeleton className="h-7 w-12 mt-1" /> : <p className="text-2xl font-semibold text-ink mt-0.5">{value}</p>}
          </div>
        ))}
      </div>

      {promotions === null ? (
        <div className="space-y-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={<TicketPercent className="w-7 h-7" />}
          title={t('promo.empty')}
          description={t('promo.emptyDesc')}
          action={
            <Button onClick={() => setEditing(null)}>
              <Plus className="w-4 h-4" />
              {t('promo.add')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {promotions.map((p) => {
            const Icon = TYPE_META[p.type].icon;
            return (
              <article key={p.id} className={cx('card overflow-hidden flex flex-col sm:flex-row', p.status !== 'active' && 'opacity-85')}>
                {p.image ? (
                  <ProductImage src={p.image} alt="" className="w-full sm:w-40 aspect-[16/9] sm:aspect-auto object-cover shrink-0" />
                ) : (
                  <div className="w-full sm:w-40 aspect-[16/9] sm:aspect-auto bg-surface-2 flex items-center justify-center shrink-0">
                    <Icon className="w-10 h-10 text-gold" />
                  </div>
                )}
                <div className="flex-1 p-5 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONE[p.status]}>{t(`promoStatus.${p.status}` as TKey)}</Badge>
                    <Badge>
                      <Icon className="w-3 h-3" />
                      {t(TYPE_META[p.type].label)}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => copy(p.code)}
                      className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 rounded-md border border-dashed border-gold text-ink hover:bg-gold-soft"
                      title={t('promo.copyCode')}
                    >
                      {p.code}
                      <Copy className="w-3 h-3 text-gold" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg text-ink leading-snug">{p.name}</h3>
                    <p className="text-sm text-ink-2">{text.summary(p)}</p>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-3">
                    <span className="flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" />
                      {date(p.startAt, true)} – {date(p.endAt, true)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {limitText(p)}
                    </span>
                    {p.type === 'new_member' && p.signupFrom && <span>{t('promo.signupFromShort', { date: date(p.signupFrom) })}</span>}
                    {p.type === 'code' && <span>{p.scope === 'products' ? t('promo.scopeProductsShort', { count: p.productIds?.length ?? 0 }) : t('promo.scopeAllShort')}</span>}
                    {p.type === 'code' && <span className="text-info">{t('promo.privateCode')}</span>}
                    {p.minSpend > 0 && p.type !== 'storewide' && <span>{t('promo.minShort', { amount: price(p.minSpend) })}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                      <Pencil className="w-4 h-4" />
                      {t('common.edit')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleEnabled(p)}>
                      {p.enabled ? t('promo.disable') : t('promo.enable')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleting(p)} className="hover:text-danger ml-auto">
                      <Trash2 className="w-4 h-4" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing ? t('promo.edit') : t('promo.add')}
        closeLabel={t('common.close')}
        size="lg"
      >
        {editing !== undefined && (
          <PromotionForm
            key={editing?.id ?? 'new'}
            initial={editing}
            products={products}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(undefined)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={t('promo.deleteTitle')}
        message={t('promo.deleteConfirm', { name: deleting?.name ?? '' })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        closeLabel={t('common.close')}
        busy={busy}
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
};

// ============================================================================
// FORM
// ============================================================================
const numberOrNull = (v: unknown) => (v === '' || v === null || Number.isNaN(Number(v)) ? null : Number(v));

const PromotionForm: React.FC<{
  initial: Promotion | null;
  products: Product[];
  onSubmit: (values: PromotionFormValues) => Promise<void>;
  onCancel: () => void;
}> = ({ initial, products, onSubmit, onCancel }) => {
  const { t, tk } = useI18n();
  const text = usePromoText();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues>({ resolver: zodResolver(promotionFormSchema), defaultValues: defaultValues(initial) });

  const type = watch('type');
  const kind = watch('discountKind');
  const scope = watch('scope');
  const usesProducts = type === 'product' || (type === 'code' && scope === 'products');
  const values = watch();
  const err = (key: keyof PromotionFormValues) => tk(errors[key]?.message as string | undefined);

  const regenerate = () => setValue('code', generatePromoCode(getValues('type'), getValues('startAt')), { shouldValidate: true });

  const chooseType = (next: PromotionType) => {
    setValue('type', next);
    if (next === 'new_member') {
      setValue('discountKind', 'amount');
      setValue('discountValue', NEW_MEMBER_DEFAULTS.discountValue);
      setValue('minSpend', NEW_MEMBER_DEFAULTS.minSpend);
      setValue('perUserLimit', NEW_MEMBER_DEFAULTS.perUserLimit);
      setValue('totalLimit', null);
    }
    if (next === 'storewide') {
      setValue('discountKind', 'percent');
      setValue('discountValue', 10);
    }
    // โค้ดใหม่ให้สอดคล้องกับประเภท (เฉพาะโปรใหม่) — Code ส่วนลด ให้ผู้ดูแลตั้งเอง
    if (!initial) setValue('code', next === 'code' ? '' : generatePromoCode(next, getValues('startAt')));
    if (next === 'product' || next === 'code') setValue('minSpend', 0);
  };

  const setDuration = (days: number) => {
    const start = new Date(getValues('startAt') || Date.now());
    setValue('endAt', toLocalInput(new Date(start.getTime() + days * 86400e3).toISOString()), { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          ...v,
          // datetime-local -> ISO (เวลาท้องถิ่นของผู้ดูแล)
          startAt: new Date(v.startAt).toISOString(),
          endAt: new Date(v.endAt).toISOString(),
          signupFrom: v.type === 'new_member' && v.signupFrom ? new Date(`${v.signupFrom}T00:00`).toISOString() : null,
        })
      )}
      noValidate
      className="space-y-7"
    >
      {/* Type */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.type')}</h4>
        <div className="grid sm:grid-cols-3 gap-2.5">
          {(Object.keys(TYPE_META) as PromotionType[]).map((key) => {
            const meta = TYPE_META[key];
            const Icon = meta.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseType(key)}
                aria-pressed={type === key}
                className={cx(
                  'text-left rounded-2xl border p-4 transition-colors',
                  type === key ? 'border-gold bg-gold-soft/60 ring-1 ring-gold' : 'border-line hover:border-gold'
                )}
              >
                <Icon className="w-5 h-5 text-gold mb-2" />
                <span className="block font-medium text-ink text-sm">{t(meta.label)}</span>
                <span className="block text-xs text-ink-3 mt-1">{t(meta.desc)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Basic */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.basic')}</h4>
        <Field label={t('promo.name')} required error={err('name')} htmlFor="promo-name">
          <Input id="promo-name" aria-invalid={!!errors.name} placeholder={t('promo.namePlaceholder')} {...register('name')} />
        </Field>
        {type === 'code' ? (
          <Field label={t('promo.customCode')} required error={err('code')} hint={t('promo.customCodeHint')} htmlFor="promo-code">
            <Input
              id="promo-code"
              className="font-mono uppercase text-lg tracking-wider"
              placeholder="NEW"
              aria-invalid={!!errors.code}
              {...register('code')}
            />
          </Field>
        ) : (
          <Field label={t('promo.code')} error={err('code')} hint={t(type === 'product' || type === 'storewide' ? 'promo.codeHintAuto' : 'promo.codeHint')} htmlFor="promo-code">
            <div className="flex gap-2">
              <Input id="promo-code" className="font-mono uppercase" aria-invalid={!!errors.code} {...register('code')} />
              <Button variant="secondary" onClick={regenerate} title={t('promo.regenerate')}>
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('promo.regenerate')}</span>
              </Button>
            </div>
          </Field>
        )}
        <Field label={t('promo.image')} hint={t('promo.imageHint')}>
          <Controller
            control={control}
            name="image"
            render={({ field }) => <ImagePicker value={field.value ?? ''} onChange={field.onChange} />}
          />
        </Field>
        <Field label={t('promo.description')} htmlFor="promo-desc">
          <Textarea id="promo-desc" rows={2} maxLength={500} {...register('description')} />
        </Field>
      </section>

      {/* Period */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.period')}</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t('promo.startAt')} required error={err('startAt')} htmlFor="promo-start">
            <Input id="promo-start" type="datetime-local" {...register('startAt')} />
          </Field>
          <Field label={t('promo.endAt')} required error={err('endAt')} htmlFor="promo-end">
            <Input id="promo-end" type="datetime-local" aria-invalid={!!errors.endAt} {...register('endAt')} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className="h-8 px-3 rounded-full border border-line text-xs text-ink-2 hover:border-gold hover:text-ink"
            >
              {t('promo.durationDays', { count: d })}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input type="checkbox" className="w-4 h-4" {...register('enabled')} />
          {t('promo.enabledLabel')}
        </label>
      </section>

      {/* Discount */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.discount')}</h4>
        {type !== 'new_member' && (
          <Controller
            control={control}
            name="discountKind"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2 max-w-sm">
                {(['amount', 'percent'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => field.onChange(k)}
                    aria-pressed={field.value === k}
                    className={cx('h-9 rounded-xl text-sm', field.value === k ? 'bg-surface text-ink shadow-sm font-medium' : 'text-ink-3')}
                  >
                    {k === 'amount' ? t('promo.kindAmount') : t('promo.kindPercent')}
                  </button>
                ))}
              </div>
            )}
          />
        )}
        <div className="grid sm:grid-cols-3 gap-4">
          <Field
            label={kind === 'percent' && type !== 'new_member' ? t('promo.valuePercent') : t('promo.valueAmount')}
            required
            error={err('discountValue')}
            htmlFor="promo-value"
          >
            <Input id="promo-value" type="number" min={1} inputMode="numeric" {...register('discountValue', { valueAsNumber: true })} />
          </Field>
          {kind === 'percent' && type !== 'new_member' && (
            <Field label={t('promo.maxDiscount')} hint={t('promo.optional')} htmlFor="promo-max">
              <Input id="promo-max" type="number" min={1} inputMode="numeric" {...register('maxDiscount', { setValueAs: numberOrNull })} />
            </Field>
          )}
          {type !== 'storewide' && (
            <Field
              label={usesProducts ? t('promo.minSpendProducts') : t('promo.minSpend')}
              required
              error={err('minSpend')}
              hint={t('promo.minSpendHint')}
              htmlFor="promo-min"
            >
              <Input id="promo-min" type="number" min={0} inputMode="numeric" {...register('minSpend', { valueAsNumber: true })} />
            </Field>
          )}
        </div>
        <p className="text-sm text-ink-2 rounded-xl bg-surface-2 px-4 py-3">
          {t('promo.preview')}: <strong className="text-ink">{text.summary({ ...values, discountValue: Number(values.discountValue) || 0, minSpend: Number(values.minSpend) || 0 })}</strong>
        </p>
      </section>

      {/* Eligibility & limits */}
      {type === 'new_member' && (
        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.eligibility')}</h4>
          <Field label={t('promo.signupFrom')} required error={err('signupFrom')} hint={t('promo.signupFromHint')} htmlFor="promo-signup">
            <Input id="promo-signup" type="date" {...register('signupFrom')} />
          </Field>
          <p className="text-sm text-info bg-info-soft rounded-xl px-4 py-3">{t('promo.newMemberRule')}</p>
        </section>
      )}

      {/* สินค้าที่ร่วมรายการ */}
      {(type === 'product' || type === 'code') && (
        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.products')}</h4>
          {type === 'code' && (
            <Controller
              control={control}
              name="scope"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2 max-w-md">
                  {(['all', 'products'] as const).map((sc) => (
                    <button
                      key={sc}
                      type="button"
                      onClick={() => field.onChange(sc)}
                      aria-pressed={(field.value ?? 'all') === sc}
                      className={cx('h-9 rounded-xl text-sm', (field.value ?? 'all') === sc ? 'bg-surface text-ink shadow-sm font-medium' : 'text-ink-3')}
                    >
                      {sc === 'all' ? t('promo.scopeAll') : t('promo.scopeProducts')}
                    </button>
                  ))}
                </div>
              )}
            />
          )}
          {usesProducts && (
            <Controller
              control={control}
              name="productIds"
              render={({ field }) => (
                <Field label={t('promo.pickProducts')} required error={err('productIds')}>
                  <ProductPicker products={products} value={field.value ?? []} onChange={field.onChange} />
                </Field>
              )}
            />
          )}
        </section>
      )}

      {(type === 'bill' || type === 'product' || type === 'code') && (
        <section className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('promo.limits')}</h4>
          <LimitField control={control} name="perUserLimit" label={t('promo.perUserLimit')} hint={t('promo.perUserHint')} error={err('perUserLimit')} />
          <LimitField control={control} name="totalLimit" label={t('promo.totalLimit')} hint={t('promo.totalHint')} error={err('totalLimit')} />
        </section>
      )}

      {type === 'storewide' && <p className="text-sm text-ink-2 rounded-xl bg-surface-2 px-4 py-3">{t('promo.storewideRule')}</p>}

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-surface border-t border-line flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {initial ? t('pf.saveChanges') : t('promo.create')}
        </Button>
      </div>
    </form>
  );
};

/** ช่องกำหนดสิทธิ์: ไม่จำกัด หรือ จำนวนครั้ง */
const LimitField: React.FC<{
  control: Control<PromotionFormValues>;
  name: 'perUserLimit' | 'totalLimit';
  label: string;
  hint: string;
  error?: string;
}> = ({ control, name, label, hint, error }) => {
  const { t } = useI18n();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const unlimited = field.value === null || field.value === undefined;
        return (
          <Field label={label} hint={hint} error={error}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-2">
                <button
                  type="button"
                  onClick={() => field.onChange(null)}
                  aria-pressed={unlimited}
                  className={cx('h-9 px-4 rounded-xl text-sm', unlimited ? 'bg-surface text-ink shadow-sm font-medium' : 'text-ink-3')}
                >
                  {t('promo.unlimited')}
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange(unlimited ? 1 : field.value)}
                  aria-pressed={!unlimited}
                  className={cx('h-9 px-4 rounded-xl text-sm', !unlimited ? 'bg-surface text-ink shadow-sm font-medium' : 'text-ink-3')}
                >
                  {t('promo.limited')}
                </button>
              </div>
              {!unlimited && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    className="w-24"
                    value={field.value ?? 1}
                    onChange={(e) => field.onChange(e.target.value === '' ? 1 : Math.max(1, Math.floor(Number(e.target.value))))}
                    aria-label={label}
                  />
                  <span className="text-sm text-ink-2">{t('promo.times')}</span>
                </div>
              )}
            </div>
          </Field>
        );
      }}
    />
  );
};

/** เลือกสินค้าที่ร่วมรายการ (ค้นหา + ติ๊กเลือกหลายชิ้น) */
const ProductPicker: React.FC<{ products: Product[]; value: string[]; onChange: (ids: string[]) => void }> = ({
  products,
  value,
  onChange,
}) => {
  const { t, price } = useI18n();
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();
  const visible = products.filter((p) => !q || [p.name, p.englishName, p.stone].join(' ').toLowerCase().includes(q));
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="rounded-2xl border border-line overflow-hidden">
      <div className="flex items-center gap-2 p-2 border-b border-line bg-surface-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('admin.searchProducts')}
            className="input h-9 pl-9 text-sm"
          />
        </div>
        <span className="text-xs text-ink-2 shrink-0 px-1">{t('promo.selectedProducts', { count: value.length })}</span>
        <button
          type="button"
          onClick={() => onChange(value.length === products.length ? [] : products.map((p) => p.id))}
          className="text-xs text-gold hover:underline shrink-0 px-1"
        >
          {value.length === products.length ? t('promo.clearSelection') : t('promo.selectAll')}
        </button>
      </div>
      <ul className="max-h-64 overflow-y-auto divide-y divide-line">
        {visible.map((p) => {
          const checked = value.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-pressed={checked}
                className={cx('w-full flex items-center gap-3 px-3 py-2 text-left transition-colors', checked ? 'bg-gold-soft/50' : 'hover:bg-surface-2')}
              >
                <span
                  className={cx(
                    'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                    checked ? 'bg-accent border-accent text-on-accent' : 'border-line-strong'
                  )}
                >
                  {checked && <Check className="w-3.5 h-3.5" />}
                </span>
                <ProductImage src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-ink truncate">{p.name}</span>
                  <span className="block text-xs text-ink-3 truncate">{p.stone}</span>
                </span>
                <span className="text-sm text-ink-2 tabular-nums shrink-0">{price(p.regularPrice ?? p.price)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
