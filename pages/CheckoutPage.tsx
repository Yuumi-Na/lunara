/**
 * LUNARA - PAGE: CHECKOUT PAGE (หน้าชำระเงินและสั่งซื้อ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 6: Form & Input Validation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form (useForm, register, handleSubmit, errors)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 8: Zod Schema Validation (checkoutSchema)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 10: API (POST /api/orders)]
 *
 * ฟิลด์ข้อมูลในแบบฟอร์ม:
 * 1. Full name (ชื่อ-นามสกุล)
 * 2. Phone (เบอร์โทรศัพท์)
 * 3. Address (ที่อยู่จัดส่ง)
 * 4. Province (จังหวัด)
 * 5. District (เขต / อำเภอ)
 * 6. Postal code (รหัสไปรษณีย์ 5 หลัก)
 * 7. Payment method (ช่องทางชำระเงิน เช่น พร้อมเพย์, บัตรเครดิต, เก็บเงินปลายทาง)
 * ============================================================================
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormValues, Order } from '../types';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';
import { CheckCircle2, ShieldCheck, QrCode, CreditCard, Truck, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (url: string) => void;
  onViewProduct: (id: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, subtotal, shippingFee, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // 1. [React Hook Form + Zod]
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      province: 'กรุงเทพมหานคร',
      district: '',
      postalCode: '',
      paymentMethod: 'promptpay',
    },
  });

  const selectedPayment = watch('paymentMethod');

  // 2. [Form Submit Event]
  const onFormSubmit = async (values: CheckoutFormValues) => {
    if (cart.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า');
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentLabels: Record<string, string> = {
        promptpay: 'พร้อมเพย์ (PromptPay QR Code)',
        credit_card: 'บัตรเครดิต / เดบิต',
        cod: 'เก็บเงินปลายทาง (Cash on Delivery)',
      };

      const newOrder = await createOrder({
        customerName: values.fullName,
        phone: values.phone,
        address: values.address,
        province: values.province,
        district: values.district,
        postalCode: values.postalCode,
        paymentMethod: paymentLabels[values.paymentMethod] || values.paymentMethod,
        items: cart,
        subtotal,
        shippingFee,
        total,
        status: 'Ordered',
      });

      // ล้างตะกร้าสินค้าหลังจากสั่งซื้อสำเร็จ
      clearCart();
      setCompletedOrder(newOrder);
    } catch (err) {
      console.error('Order creation failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // ORDER SUCCESS STATE
  // --------------------------------------------------------------------------
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#8C5258] font-bold">
            ORDER CONFIRMED
          </span>
          <h2 className="font-brand text-3xl font-bold text-[#3E2723]">
            สั่งซื้อสำเร็จเรียบร้อยแล้ว!
          </h2>
          <p className="text-sm text-[#8C7063]">
            ขอบคุณที่ไว้วางใจร้านกำไลหินมงคล <strong>LUNARA</strong> ทางร้านกำลังจัดเตรียมสินค้าด้วยความประณีต
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/50 shadow-md text-left space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#F2EBE1]">
            <span className="text-xs font-semibold text-[#8C7063]">รหัสคำสั่งซื้อ:</span>
            <span className="text-sm font-bold text-[#8C5258] font-mono">
              {completedOrder.id}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-[#4A3E3D] space-y-2">
            <p><strong>ผู้สั่งซื้อ:</strong> {completedOrder.customerName} ({completedOrder.phone})</p>
            <p><strong>ที่อยู่จัดส่ง:</strong> {completedOrder.address} เขต/อำเภอ {completedOrder.district} {completedOrder.province} {completedOrder.postalCode}</p>
            <p><strong>วิธีชำระเงิน:</strong> {completedOrder.paymentMethod}</p>
            <p><strong>สถานะคำสั่งซื้อ:</strong> <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{completedOrder.status}</span></p>
          </div>

          <div className="pt-3 border-t border-[#F2EBE1] flex justify-between items-center">
            <span className="font-bold text-sm text-[#3E2723]">ยอดชำระทั้งสิ้น:</span>
            <span className="text-xl font-bold text-[#8C5258]">
              ฿{completedOrder.total.toLocaleString()}
            </span>
          </div>

          {/* QR Code prompt for PromptPay */}
          {completedOrder.paymentMethod.includes('พร้อมเพย์') && (
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D9C8BE] text-center space-y-2">
              <p className="text-xs font-bold text-[#3E2723]">สแกนเพื่อชำระเงินด้วย PromptPay QR</p>
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-center">
                <QrCode className="w-28 h-28 text-[#4A3E3D]" />
              </div>
              <p className="text-[11px] text-[#8C7063]">
                ชื่อบัญชี: บจก. ลูนาร่า กำไลหินมงคล • ยอด ฿{completedOrder.total.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('/orders')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-semibold text-sm transition-all shadow-md"
          >
            ดูประวัติคำสั่งซื้อทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#E8C5C8] text-[#4A3E3D] font-semibold text-sm transition-all hover:bg-[#FAF7F2]"
          >
            กลับสู่หน้าแรก
          </button>
        </div>
      </div>
    );
  }

  // Redirect or show empty state if cart empty
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-brand text-2xl font-bold text-[#3E2723]">
          ไม่มีสินค้าสำหรับสั่งซื้อ
        </h2>
        <p className="text-sm text-[#8C7063]">
          กรุณาเลือกสินค้าลงตะกร้าก่อนดำเนินการชำระเงิน
        </p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 rounded-full bg-[#8C5258] text-white text-sm font-semibold"
        >
          ไปหน้าร้านค้า
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate('/cart')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C5258] hover:text-[#5C2E33]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปที่ตะกร้าสินค้า</span>
      </button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8C5258]">
          <Sparkles className="w-4 h-4 text-[#C6A24D]" />
          <span>CHECKOUT PROCESS</span>
        </div>
        <h1 className="font-brand text-3xl sm:text-4xl font-bold text-[#3E2723] mt-1">
          กรอกข้อมูลจัดส่งและชำระเงิน
        </h1>
        <p className="text-sm text-[#8C7063]">
          ระบบตรวจสอบความถูกต้องด้วย React Hook Form และ Zod Validation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Form Container */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/50 shadow-md space-y-6"
          >
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3E2723] pb-2 border-b border-[#F2EBE1]">
                1. ข้อมูลผู้รับสินค้า
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="เช่น คุณกมลวรรณ ทรัพย์เจริญ"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-rose-500 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="เช่น 0812345678"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                  />
                  {errors.phone && (
                    <p className="text-sm text-rose-500 font-medium">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3E2723] pb-2 border-b border-[#F2EBE1]">
                2. ที่อยู่สำหรับจัดส่ง
              </h3>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                    ที่อยู่ เลขที่ ซอย ถนน <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    {...register('address')}
                    placeholder="เช่น 123/45 ซอยทองหล่อ 10 ถนนสุขุมวิท 55"
                    className="w-full px-4 py-3 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                  />
                  {errors.address && (
                    <p className="text-sm text-rose-500 font-medium">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                      จังหวัด <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('province')}
                      placeholder="กรุงเทพมหานคร"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                    />
                    {errors.province && (
                      <p className="text-sm text-rose-500 font-medium">{errors.province.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                      เขต / อำเภอ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('district')}
                      placeholder="วัฒนา"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                    />
                    {errors.district && (
                      <p className="text-sm text-rose-500 font-medium">{errors.district.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm sm:text-base font-semibold text-[#3E2723]">
                      รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('postalCode')}
                      placeholder="10110"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9C8BE] focus:border-[#C6A24D] outline-none text-base text-[#4A3E3D]"
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-rose-500 font-medium">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3E2723] pb-2 border-b border-[#F2EBE1]">
                3. ช่องทางการชำระเงิน
              </h3>

              <div className="space-y-3">
                {/* PromptPay */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPayment === 'promptpay'
                      ? 'bg-[#E8C5C8]/30 border-[#8C5258] shadow-xs'
                      : 'border-[#D9C8BE] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <input
                    type="radio"
                    value="promptpay"
                    {...register('paymentMethod')}
                    className="w-5 h-5 accent-[#8C5258]"
                  />
                  <QrCode className="w-6 h-6 text-[#8C5258]" />
                  <div className="flex-1">
                    <span className="font-semibold text-base sm:text-lg text-[#3E2723] block">
                      พร้อมเพย์ (PromptPay QR Code)
                    </span>
                    <span className="text-xs sm:text-sm text-[#8C7063]">
                      สแกนจ่ายทันทีผ่าน Mobile Banking ทุกธนาคาร ไม่มีค่าธรรมเนียม
                    </span>
                  </div>
                </label>

                {/* Credit Card */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPayment === 'credit_card'
                      ? 'bg-[#E8C5C8]/30 border-[#8C5258] shadow-xs'
                      : 'border-[#D9C8BE] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <input
                    type="radio"
                    value="credit_card"
                    {...register('paymentMethod')}
                    className="w-5 h-5 accent-[#8C5258]"
                  />
                  <CreditCard className="w-6 h-6 text-[#C6A24D]" />
                  <div className="flex-1">
                    <span className="font-semibold text-base sm:text-lg text-[#3E2723] block">
                      บัตรเครดิต / เดบิต (Visa, Mastercard, JCB)
                    </span>
                    <span className="text-xs sm:text-sm text-[#8C7063]">
                      ระบบความปลอดภัยระดับสากล 3D Secure
                    </span>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPayment === 'cod'
                      ? 'bg-[#E8C5C8]/30 border-[#8C5258] shadow-xs'
                      : 'border-[#D9C8BE] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <input
                    type="radio"
                    value="cod"
                    {...register('paymentMethod')}
                    className="w-5 h-5 accent-[#8C5258]"
                  />
                  <Truck className="w-6 h-6 text-[#8C7063]" />
                  <div className="flex-1">
                    <span className="font-semibold text-base sm:text-lg text-[#3E2723] block">
                      เก็บเงินปลายทาง (Cash on Delivery)
                    </span>
                    <span className="text-xs sm:text-sm text-[#8C7063]">
                      ชำระเงินสดกับเจ้าหน้าที่ขนส่งเมื่อได้รับพัสดุ
                    </span>
                  </div>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="text-sm text-rose-500 font-medium">{errors.paymentMethod.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#F2EBE1]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4.5 rounded-full bg-[#8C5258] hover:bg-[#734045] text-white font-bold text-lg sm:text-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'กำลังบันทึกคำสั่งซื้อ...' : `ยืนยันการสั่งซื้อ (฿${total.toLocaleString()})`}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Summary column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8C5C8]/50 shadow-md space-y-6 sticky top-28">
          <h3 className="font-serif text-xl font-bold text-[#3E2723] pb-3 border-b border-[#F2EBE1]">
            รายการสินค้าที่สั่งซื้อ ({cart.length} แบบ)
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="flex items-center gap-3 py-2 border-b border-[#FAF4ED]"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-[#E8C5C8]/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#3E2723] truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[#8C7063]">
                    <span>ไซส์: {item.selectedSize}</span>
                    <span>x {item.quantity}</span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#8C5258]">
                  ฿{(item.product.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-[#F2EBE1] text-xs sm:text-sm">
            <div className="flex justify-between text-[#5C4D4A]">
              <span>ยอดรวมสินค้า:</span>
              <span className="font-semibold text-[#3E2723]">฿{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#5C4D4A]">
              <span>ค่าจัดส่ง:</span>
              <span>{shippingFee === 0 ? 'ฟรีค่าจัดส่ง' : `฿${shippingFee}`}</span>
            </div>
            <div className="flex justify-between items-baseline text-[#3E2723] pt-2 border-t border-[#F2EBE1]">
              <span className="font-bold text-base">ยอดสุทธิที่ต้องชำระ:</span>
              <span className="font-bold text-xl sm:text-2xl text-[#8C5258]">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF4ED] rounded-xl text-xs text-[#8C7063] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>มีบริการออกใบเสร็จและรับประกันสินค้าของแท้ 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
