/**
 * LUNARA - ADMIN: PRODUCT FORM (CRUD)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 6: HTML Form & Validation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form (useForm, register, handleSubmit, errors, Controller)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation (productFormSchema)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create & Update Form)]
 * ============================================================================
 */

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import {
  COLOR_HEX,
  COLORS,
  INTENTIONS,
  productFormSchema,
  STYLES,
  type Product,
  type ProductFormValues,
} from '../../types';
import { LUCKY_STONES_CATALOG } from '../../data/stones';
import { Button, Field, Input, Select, Textarea, ToggleChip } from '../../components/ui';
import { useI18n } from '../../i18n';
import { useContent } from '../../i18n/content';
import { GalleryPicker, ImagePicker } from './ImagePicker';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

const optionalNumber = (v: unknown) => (v === '' || v === null || Number.isNaN(Number(v)) ? undefined : Number(v));

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t, tk } = useI18n();
  const content = useContent();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      englishName: initialData?.englishName ?? '',
      price: initialData?.price ?? 490,
      originalPrice: initialData?.originalPrice,
      stone: initialData?.stone ?? '',
      colors: initialData?.colors ?? ['Pink'],
      intentions: initialData?.intentions ?? ['Love'],
      style: initialData?.style ?? 'Minimal',
      description: initialData?.description ?? '',
      belief: initialData?.belief ?? 'ความเชื่อ: เสริมสิริมงคลและความเจริญรุ่งเรือง (ความเชื่อส่วนบุคคล ไม่ใช่ผลทางการแพทย์)',
      image: initialData?.image ?? '',
      images: initialData?.images ?? [],
      stock: initialData?.stock ?? 10,
      beadSize: initialData?.beadSize ?? 'หินเจีย ขนาด 3 มิล',
      isBestSeller: initialData?.isBestSeller ?? false,
      isNewArrival: initialData?.isNewArrival ?? !initialData,
    },
  });

  const err = (key: keyof ProductFormValues) => tk(errors[key]?.message as string | undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-7">
      {/* Images */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('pf.images')}</h4>
        <Field label={t('pf.mainImage')} required error={err('image')}>
          <Controller
            control={control}
            name="image"
            render={({ field }) => <ImagePicker value={field.value} onChange={field.onChange} error={err('image')} />}
          />
        </Field>
        <Field label={t('pf.gallery')} hint={t('pf.galleryHint')}>
          <Controller
            control={control}
            name="images"
            render={({ field }) => <GalleryPicker value={field.value ?? []} onChange={field.onChange} />}
          />
        </Field>
      </section>

      {/* Basic info */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('pf.basic')}</h4>
        <Field label={t('pf.name')} required error={err('name')} htmlFor="pf-name">
          <Input id="pf-name" aria-invalid={!!errors.name} placeholder="เช่น Sweet Amoré (โรสควอตซ์ & มูนสโตน)" {...register('name')} />
        </Field>
        <Field label={t('pf.englishName')} hint={t('pf.englishNameHint')} htmlFor="pf-en">
          <Input id="pf-en" placeholder="e.g. Sweet Amoré Bracelet" {...register('englishName')} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label={t('pf.stone')} required error={err('stone')} htmlFor="pf-stone">
            <Input id="pf-stone" aria-invalid={!!errors.stone} {...register('stone')} />
            <Select
              aria-label={t('pf.pickStone')}
              className="mt-2 text-sm"
              defaultValue=""
              onChange={(e) => e.target.value && setValue('stone', e.target.value, { shouldValidate: true })}
            >
              <option value="">{t('pf.pickStone')}</option>
              {LUCKY_STONES_CATALOG.map((s) => (
                <option key={s.id} value={`${s.nameEn} (${s.nameTh})`}>
                  {s.nameTh} — {s.nameEn}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t('pf.beadSize')} htmlFor="pf-bead">
            <Input id="pf-bead" {...register('beadSize')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label={t('pf.price')} required error={err('price')} htmlFor="pf-price">
            <Input id="pf-price" type="number" min={0} inputMode="numeric" aria-invalid={!!errors.price} {...register('price', { valueAsNumber: true })} />
          </Field>
          <Field label={t('pf.originalPrice')} htmlFor="pf-oprice">
            <Input id="pf-oprice" type="number" min={0} inputMode="numeric" {...register('originalPrice', { setValueAs: optionalNumber })} />
          </Field>
          <Field label={t('pf.stock')} required error={err('stock')} htmlFor="pf-stock">
            <Input id="pf-stock" type="number" min={0} inputMode="numeric" aria-invalid={!!errors.stock} {...register('stock', { valueAsNumber: true })} />
          </Field>
          <Field label={t('pf.style')} required htmlFor="pf-style">
            <Select id="pf-style" {...register('style')}>
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {content.style(s)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-ink">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" {...register('isBestSeller')} />
            {t('badge.bestSeller')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" {...register('isNewArrival')} />
            {t('badge.new')}
          </label>
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('pf.tags')}</h4>
        <Field label={t('filter.intention')} required error={err('intentions')}>
          <Controller
            control={control}
            name="intentions"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {INTENTIONS.map((i) => (
                  <ToggleChip
                    key={i}
                    active={field.value.includes(i)}
                    onClick={() => field.onChange(field.value.includes(i) ? field.value.filter((v) => v !== i) : [...field.value, i])}
                  >
                    {content.intention(i)}
                  </ToggleChip>
                ))}
              </div>
            )}
          />
        </Field>
        <Field label={t('filter.color')} required error={err('colors')}>
          <Controller
            control={control}
            name="colors"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <ToggleChip
                    key={c}
                    active={field.value.includes(c)}
                    onClick={() => field.onChange(field.value.includes(c) ? field.value.filter((v) => v !== c) : [...field.value, c])}
                  >
                    <span className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: COLOR_HEX[c] }} />
                    {content.color(c)}
                  </ToggleChip>
                ))}
              </div>
            )}
          />
        </Field>
      </section>

      {/* Content */}
      <section className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t('pf.content')}</h4>
        <Field label={t('pf.description')} required error={err('description')} htmlFor="pf-desc">
          <Textarea id="pf-desc" rows={4} aria-invalid={!!errors.description} {...register('description')} />
        </Field>
        <Field label={t('pf.belief')} required error={err('belief')} hint={t('pf.beliefHint')} htmlFor="pf-belief">
          <Textarea id="pf-belief" rows={3} aria-invalid={!!errors.belief} {...register('belief')} />
        </Field>
      </section>

      <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-surface border-t border-line flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          <Save className="w-4 h-4" />
          {initialData ? t('pf.saveChanges') : t('pf.create')}
        </Button>
      </div>
    </form>
  );
};
