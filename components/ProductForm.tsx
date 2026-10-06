/**
 * LUNARA - COMPONENT: PRODUCT FORM (ADMIN CRUD)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 6: HTML Form & Validation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form (useForm, register, handleSubmit, errors)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation (productFormSchema)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD (Create & Update Form)]
 *
 * การทำงาน:
 * 1. ใช้ useForm ร่วมกับ zodResolver(productFormSchema)
 * 2. ตรวจสอบข้อมูลก่อนส่ง (Validation) เช่น ชื่อสินค้า, ราคาต้องเป็นตัวเลขบวก, สต็อก
 * 3. ส่งข้อมูลผ่าน onSubmit ไปยัง API เพื่อ Create หรือ Update
 * ============================================================================
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, ProductFormValues, Product, IntentionType, ColorType, StyleType } from '../types';
import { Sparkles, Save, X, Image as ImageIcon, HelpCircle } from 'lucide-react';
import { LUCKY_STONES_CATALOG } from '../data/stones';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // 1. [React Hook Form] กำหนด useForm พร้อม zodResolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || 490,
      stone: initialData?.stone || '',
      colors: initialData?.colors || ['Pink'],
      intentions: initialData?.intentions || ['Love'],
      style: initialData?.style || 'Cute',
      description: initialData?.description || '',
      belief: initialData?.belief || 'ความเชื่อ: เสริมสิริมงคลและความเจริญรุ่งเรือง (ความเชื่อส่วนบุคคล ไม่ใช่ผลทางการแพทย์)',
      image: initialData?.image || 'https://images.unsplash.com/photo-1611591475819-797de0d7269e?auto=format&fit=crop&w=800&q=80',
      stock: initialData?.stock ?? 10,
      beadSize: initialData?.beadSize || 'หินเจีย ขนาด 3 มิล',
    },
  });

  // Watch fields สำหรับแสดงตัวอย่าง (Preview)
  const watchImage = watch('image');
  const watchColors = watch('colors') || [];
  const watchIntentions = watch('intentions') || [];

  // เมื่อ initialData มีการเปลี่ยนแปลง (เช่น กดแก้ไขสินค้าตัวอื่น) ให้ reset form
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        price: initialData.price,
        stone: initialData.stone,
        colors: initialData.colors,
        intentions: initialData.intentions,
        style: initialData.style,
        description: initialData.description,
        belief: initialData.belief,
        image: initialData.image,
        stock: initialData.stock,
        beadSize: initialData.beadSize || 'หินเจีย ขนาด 3 มิล',
      });
    }
  }, [initialData, reset]);

  // ฟังก์ชันช่วย toggle Checkbox ใน RHF
  const toggleCheckboxArray = (
    field: 'colors' | 'intentions',
    currentArr: string[],
    itemVal: string
  ) => {
    if (currentArr.includes(itemVal)) {
      setValue(
        field,
        currentArr.filter((i) => i !== itemVal),
        { shouldValidate: true }
      );
    } else {
      setValue(field, [...currentArr, itemVal], { shouldValidate: true });
    }
  };

  const intentionOptions: IntentionType[] = [
    'Love',
    'Money',
    'Work',
    'Study',
    'Luck',
    'Protection',
    'Calm',
    'Confidence',
  ];

  const colorOptions: ColorType[] = [
    'Pink',
    'Purple',
    'Yellow',
    'Black',
    'White',
    'Green',
  ];

  const styleOptions: StyleType[] = ['Minimal', 'Cute', 'Luxury', 'Everyday'];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/50 shadow-lg space-y-6 max-w-3xl mx-auto"
    >
      {/* Header Form */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F2EBE1]">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3E2723]">
            {initialData ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้ากำไลหินมงคลใหม่'}
          </h3>
          <p className="text-xs sm:text-sm text-[#8C7063]">
            กรอกข้อมูลรายละเอียดสินค้าให้ครบถ้วนเพื่อแสดงผลบนหน้าร้าน LUNARA
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-[#8C7063] hover:text-[#3E2723] hover:bg-[#FAF7F2] rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* 1. Name */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            ชื่อสินค้ากำไล <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="เช่น Sweet Amoré (โรสควอตซ์ & มูนสโตน)"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] focus:ring-2 focus:ring-[#C6A24D]/20 outline-none text-sm text-[#4A3E3D]"
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* 2. Stone type */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            ชนิดหินมงคลที่ใช้ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('stone')}
            placeholder="เช่น Rose Quartz & Moonstone"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.stone && (
            <p className="text-xs text-rose-500 font-medium">{errors.stone.message}</p>
          )}
          {/* Quick picker from 24 stones */}
          <div className="text-[11px] text-[#8C7063] flex items-center gap-1">
            <span>หรือเลือกหิน 24 ชนิด:</span>
            <select
              onChange={(e) => {
                if (e.target.value) setValue('stone', e.target.value, { shouldValidate: true });
              }}
              className="text-[11px] bg-[#FAF7F2] border border-[#D9C8BE] rounded px-1.5 py-0.5"
            >
              <option value="">เลือกหินจากชาร์ต...</option>
              {LUCKY_STONES_CATALOG.map((st) => (
                <option key={st.id} value={`${st.nameTh} (${st.nameEn})`}>
                  {st.nameTh} ({st.nameEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Bead Size */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            ขนาดเม็ดหิน
          </label>
          <input
            type="text"
            {...register('beadSize')}
            placeholder="หินเจีย ขนาด 3 มิล"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.beadSize && (
            <p className="text-xs text-rose-500 font-medium">{errors.beadSize.message}</p>
          )}
        </div>

        {/* 4. Price */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            ราคา (บาท) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            placeholder="490"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.price && (
            <p className="text-xs text-rose-500 font-medium">{errors.price.message}</p>
          )}
        </div>

        {/* 5. Stock */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            จำนวนสต็อก (เส้น) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            {...register('stock', { valueAsNumber: true })}
            placeholder="15"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.stock && (
            <p className="text-xs text-rose-500 font-medium">{errors.stock.message}</p>
          )}
        </div>

        {/* 6. Style */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            สไตล์กำไล <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('style')}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D] bg-white"
          >
            {styleOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          {errors.style && (
            <p className="text-xs text-rose-500 font-medium">{errors.style.message}</p>
          )}
        </div>

        {/* 7. Image URL & Preview */}
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#3E2723]">
              รูปภาพสินค้า (URL หรือ Path) <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-[#8C7063]">
              📸 ใส่ URL รูปภาพ เช่น Unsplash หรือ path รูปของร้าน
            </span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                {...register('image')}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
              />
              {errors.image && (
                <p className="text-xs text-rose-500 font-medium mt-1">
                  {errors.image.message}
                </p>
              )}
            </div>
            {watchImage && (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-[#D9C8BE]">
                <img
                  src={watchImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1611591475819-797de0d7269e?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 8. Intentions Multi-select */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-[#3E2723]">
            หมวดความมงคลที่เสริม (Intentions) <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {intentionOptions.map((opt) => {
              const active = watchIntentions.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleCheckboxArray('intentions', watchIntentions, opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#8C5258] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#5C4D4A] border border-[#D9C8BE] hover:bg-[#F2EBE1]'
                  }`}
                >
                  {opt} {active && '✓'}
                </button>
              );
            })}
          </div>
          {errors.intentions && (
            <p className="text-xs text-rose-500 font-medium">{errors.intentions.message}</p>
          )}
        </div>

        {/* 9. Colors Multi-select */}
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-[#3E2723]">
            โทนสี (Colors) <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((col) => {
              const active = watchColors.includes(col);
              return (
                <button
                  type="button"
                  key={col}
                  onClick={() => toggleCheckboxArray('colors', watchColors, col)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#C6A24D] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#5C4D4A] border border-[#D9C8BE] hover:bg-[#F2EBE1]'
                  }`}
                >
                  {col} {active && '✓'}
                </button>
              );
            })}
          </div>
          {errors.colors && (
            <p className="text-xs text-rose-500 font-medium">{errors.colors.message}</p>
          )}
        </div>

        {/* 10. Description */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            รายละเอียดสินค้า <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="อธิบายเอกลักษณ์ วัสดุ ขนาด และความโดดเด่นของกำไลเส้นนี้..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.description && (
            <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
          )}
        </div>

        {/* 11. Belief & Meaning */}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-sm font-semibold text-[#3E2723]">
            ความเชื่อและความหมายมงคล <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            {...register('belief')}
            placeholder="ความเชื่อ: เสริมสิริมงคล... (ระบุในลักษณะความเชื่อส่วนบุคคล ไม่ใช่ผลทางการแพทย์)"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-sm text-[#4A3E3D]"
          />
          {errors.belief && (
            <p className="text-xs text-rose-500 font-medium">{errors.belief.message}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-[#F2EBE1] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#5C4D4A] hover:bg-[#FAF7F2] transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#8C5258] hover:bg-[#703F44] text-white shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'กำลังบันทึก...' : initialData ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}</span>
        </button>
      </div>
    </form>
  );
};
