/**
 * LUNARA - COMPONENT: PRODUCT REVIEWS (รีวิวจริงจากผู้ซื้อ)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 7: React Hook Form] [โมดูลที่ 8: Zod (reviewSchema)] [โมดูลที่ 10: API]
 *
 * กติกาการรีวิว (ตรวจซ้ำที่เซิร์ฟเวอร์ทุกครั้ง):
 * - ต้องล็อกอินด้วย Google
 * - ต้องเคยสั่งซื้อสินค้านี้ (คำสั่งซื้อที่ไม่ถูกยกเลิก) -> ได้ป้าย "ซื้อจริง"
 * - Admin รีวิวเพื่อทดสอบระบบได้ -> แสดงป้าย "Admin ทดสอบ"
 * - ชื่อและรูปผู้รีวิว "ล็อก" ตามบัญชีที่ล็อกอิน แก้ไขเองไม่ได้
 * - 1 บัญชีรีวิวได้ 1 ครั้งต่อสินค้า (ส่งใหม่ = แก้ไขรีวิวเดิม)
 * - คำตอบจากร้าน (admin ตอบในหลังร้าน) แสดงใต้รีวิว
 * ============================================================================
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeCheck, FlaskConical, Lock, MessageCircleReply, MessageSquareText, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { reviewSchema, type Review, type ReviewFormValues } from '../types';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { Avatar } from './HeaderControls';
import { Badge, Button, cx, Field, Skeleton, Textarea } from './ui';

export const Stars: React.FC<{ value: number; className?: string }> = ({ value, className = 'w-4 h-4' }) => (
  <span className="inline-flex text-gold" aria-label={`${value}/5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={cx(className, i < Math.round(value) ? 'fill-current' : 'opacity-30')} />
    ))}
  </span>
);

const StarInput: React.FC<{ value: number; onChange: (v: number) => void; label: (n: number) => string }> = ({
  value,
  onChange,
  label,
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1" role="radiogroup" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={label(n)}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="p-1 rounded-lg text-gold hover:scale-110 transition-transform"
        >
          <Star className={cx('w-7 h-7', n <= (hover || value) ? 'fill-current' : 'opacity-30')} />
        </button>
      ))}
    </div>
  );
};

export const ReviewBadge: React.FC<{ review: Pick<Review, 'verifiedPurchase' | 'isTest'> }> = ({ review }) => {
  const { t } = useI18n();
  if (review.verifiedPurchase)
    return (
      <Badge tone="success">
        <BadgeCheck className="w-3 h-3" />
        {t('review.verified')}
      </Badge>
    );
  if (review.isTest)
    return (
      <Badge tone="info">
        <FlaskConical className="w-3 h-3" />
        {t('review.adminTest')}
      </Badge>
    );
  return null;
};

interface ProductReviewsProps {
  productId: string;
  onStatsChange?: (stats: { rating: number; count: number }) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, onStatsChange }) => {
  const { user, isAdmin, openLogin } = useAuth();
  const toast = useToast();
  const { t, tk, date } = useI18n();
  const [data, setData] = useState<api.ProductReviews | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 5, comment: '' } });

  const load = useCallback(async () => {
    try {
      const result = await api.fetchProductReviews(productId);
      setData(result);
      const count = result.reviews.length;
      const rating = count ? result.reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
      onStatsChange?.({ rating: Math.round(rating * 10) / 10, count });
      reset(result.me.review ? { rating: result.me.review.rating, comment: result.me.review.comment } : { rating: 5, comment: '' });
    } catch {
      setData({ reviews: [], me: { eligibility: 'login', review: null } });
    }
  }, [productId, onStatsChange, reset]);

  // โหลดใหม่เมื่อเปลี่ยนสินค้า หรือผู้ใช้ล็อกอิน / ออกจากระบบ
  useEffect(() => {
    load();
  }, [load, user?.email]);

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      await api.submitReview(productId, values);
      toast(data?.me.review ? t('review.updated') : t('review.thanks'));
      await load();
    } catch (err) {
      const code = err instanceof api.ApiError ? err.code : '';
      toast(code === 'NOT_PURCHASED' ? t('review.needPurchase') : t('review.failed'), 'error');
    }
  };

  const remove = async (review: Review) => {
    if (!window.confirm(t('review.deleteConfirm'))) return;
    try {
      await api.deleteReview(review.id);
      toast(t('review.deleted'));
      await load();
    } catch {
      toast(t('admin.deleteFailed'), 'error');
    }
  };

  const reviews = data?.reviews ?? [];
  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const myReview = data?.me.review;

  return (
    <section id="reviews" className="grid lg:grid-cols-12 gap-8 scroll-mt-24">
      {/* List */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl text-ink">{t('review.title')}</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Stars value={average} />
              <span className="font-semibold text-ink">{average.toFixed(1)}</span>
              <span className="text-ink-3">{t('pd.reviewCount', { count: reviews.length })}</span>
            </div>
          )}
        </div>

        {data === null ? (
          <Skeleton className="h-32" />
        ) : reviews.length === 0 ? (
          <div className="card p-8 text-center space-y-2">
            <MessageSquareText className="w-8 h-8 mx-auto text-ink-3" />
            <p className="text-ink">{t('review.emptyTitle')}</p>
            <p className="text-sm text-ink-3">{t('review.emptyDesc')}</p>
          </div>
        ) : (
          reviews.map((r) => {
            const canDelete = user && (r.userEmail === user.email || isAdmin);
            return (
              <article key={r.id} className="card p-5 space-y-3">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={r.avatar} name={r.name} size={38} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-ink text-sm truncate">{r.name}</span>
                        <ReviewBadge review={r} />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars value={r.rating} className="w-3.5 h-3.5" />
                        <span className="text-xs text-ink-3">{date(r.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      aria-label={t('common.delete')}
                      title={t('common.delete')}
                      className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-ink-3 hover:text-danger hover:bg-danger-soft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </header>
                <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{r.comment}</p>
                {r.reply && (
                  <div className="rounded-2xl bg-surface-2 p-4 border-l-2 border-gold">
                    <p className="text-xs font-semibold text-ink flex items-center gap-1.5 mb-1">
                      <MessageCircleReply className="w-3.5 h-3.5 text-gold" />
                      {t('ar.replyFrom')} <span className="font-normal text-ink-3">· {date(r.reply.at)}</span>
                    </p>
                    <p className="text-sm text-ink-2 whitespace-pre-line">{r.reply.text}</p>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Write a review */}
      <div className="lg:col-span-5">
        <div className="card p-6 space-y-4 lg:sticky lg:top-28">
          <h3 className="text-xl text-ink">{myReview ? t('review.edit') : t('review.write')}</h3>

          {!data ? (
            <Skeleton className="h-24" />
          ) : data.me.eligibility === 'login' ? (
            <div className="space-y-4">
              <p className="text-sm text-ink-2">{t('review.loginToReview')}</p>
              <Button block onClick={() => openLogin()}>
                {t('auth.signIn')}
              </Button>
            </div>
          ) : data.me.eligibility === 'purchase' ? (
            <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-4 text-sm text-ink-2">
              <ShoppingBag className="w-5 h-5 text-gold shrink-0" />
              <p>{t('review.needPurchase')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* ชื่อผู้รีวิวล็อกตามบัญชี */}
              <div className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <Avatar src={user?.avatar} name={user?.name ?? '?'} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                  <p className="text-[11px] text-ink-3 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('review.nameLocked')}
                  </p>
                </div>
              </div>

              {isAdmin && !myReview?.verifiedPurchase && (
                <p className="text-xs text-info bg-info-soft rounded-xl px-3 py-2">{t('review.adminNote')}</p>
              )}

              <Field label={t('review.rating')} error={tk(errors.rating?.message)}>
                <Controller
                  control={control}
                  name="rating"
                  render={({ field }) => (
                    <StarInput value={field.value} onChange={field.onChange} label={(n) => t('review.stars', { n })} />
                  )}
                />
              </Field>

              <Field label={t('review.comment')} required error={tk(errors.comment?.message)} htmlFor="review-text">
                <Textarea
                  id="review-text"
                  rows={4}
                  maxLength={1000}
                  placeholder={t('review.placeholder')}
                  aria-invalid={!!errors.comment}
                  {...register('comment')}
                />
              </Field>

              <Button type="submit" block loading={isSubmitting}>
                {myReview ? t('review.update') : t('review.submit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
