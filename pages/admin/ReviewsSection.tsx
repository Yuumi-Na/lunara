/**
 * LUNARA - ADMIN: REVIEWS MANAGEMENT (จัดการรีวิว)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 9: CRUD] [โมดูลที่ 10: API]
 *
 * - ดูรีวิวทั้งหมดจากทุกสินค้า (รวมรีวิวที่ซ่อนไว้)
 * - ตอบกลับลูกค้า -> คำตอบแสดงใต้รีวิวในหน้าสินค้า ในชื่อ "LUNARA"
 * - แก้ไข / ลบคำตอบ
 * - ซ่อน / แสดงรีวิว (รีวิวที่ซ่อนไม่แสดงหน้าร้าน และไม่นับคะแนนดาว)
 * - ลบรีวิวถาวร
 * ============================================================================
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, MessageCircleReply, MessageSquareText, Pencil, RotateCw, Search, Send, Star, Trash2, X } from 'lucide-react';
import * as api from '../../services/api';
import type { AdminReview } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../../components/HeaderControls';
import { ProductImage } from '../../components/ProductCard';
import { ReviewBadge, Stars } from '../../components/ProductReviews';
import { Badge, Button, cx, EmptyState, Modal, Skeleton, Textarea } from '../../components/ui';
import { useI18n, type TKey } from '../../i18n';

type Filter = 'all' | 'unanswered' | 'verified' | 'test' | 'hidden' | 'low';

const FILTERS: { id: Filter; label: TKey }[] = [
  { id: 'all', label: 'account.all' },
  { id: 'unanswered', label: 'ar.unanswered' },
  { id: 'verified', label: 'review.verified' },
  { id: 'test', label: 'review.adminTest' },
  { id: 'low', label: 'ar.lowRating' },
  { id: 'hidden', label: 'ar.hidden' },
];

const matches = (r: AdminReview, f: Filter) =>
  f === 'all' ||
  (f === 'unanswered' && !r.reply && !r.hidden) ||
  (f === 'verified' && r.verifiedPurchase) ||
  (f === 'test' && r.isTest) ||
  (f === 'low' && r.rating <= 3) ||
  (f === 'hidden' && r.hidden);

export const ReviewsSection: React.FC<{ onViewProduct: (id: string) => void }> = ({ onViewProduct }) => {
  const { t } = useI18n();
  const toast = useToast();
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<AdminReview | null>(null);
  const [busy, setBusy] = useState(false);

  const [loadError, setLoadError] = useState(false);

  // โหลดรีวิว ถ้าล้มเหลวให้แสดงข้อความ error (ไม่แสดงเป็น "0 รีวิว" ซึ่งทำให้เข้าใจผิด)
  const load = useCallback(() => {
    setReviews(null);
    setLoadError(false);
    api
      .fetchAdminReviews()
      .then(setReviews)
      .catch((err) => {
        console.error('Load admin reviews failed:', err);
        setLoadError(true);
      });
  }, []);

  useEffect(load, [load]);

  // อัปเดตรีวิวในรายการหลังแก้ไข (คงชื่อ/รูปสินค้าไว้)
  const applyUpdate = (updated: Partial<AdminReview> & { id: string }) =>
    setReviews((prev) => prev?.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)) ?? null);

  const toggleHidden = async (review: AdminReview) => {
    try {
      applyUpdate(await api.updateAdminReview(review.id, { hidden: !review.hidden }));
      toast(review.hidden ? t('ar.shown') : t('ar.hiddenToast'));
    } catch {
      toast(t('admin.saveFailed'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteReview(deleting.id);
      setReviews((prev) => prev?.filter((r) => r.id !== deleting.id) ?? null);
      toast(t('review.deleted'));
      setDeleting(null);
    } catch {
      toast(t('admin.deleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (reviews ?? []).filter(
      (r) =>
        matches(r, filter) &&
        (!q || [r.name, r.userEmail, r.comment, r.productName ?? ''].join(' ').toLowerCase().includes(q))
    );
  }, [reviews, filter, search]);

  const all = reviews ?? [];
  const shown = all.filter((r) => !r.hidden);
  const average = shown.length ? shown.reduce((s, r) => s + r.rating, 0) / shown.length : 0;

  const stats: { label: TKey; value: string | number }[] = [
    { label: 'ar.total', value: all.length },
    { label: 'ar.average', value: shown.length ? average.toFixed(1) : '—' },
    { label: 'ar.unanswered', value: all.filter((r) => matches(r, 'unanswered')).length },
    { label: 'ar.hidden', value: all.filter((r) => r.hidden).length },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="eyebrow">{t('admin.eyebrow')}</p>
        <h1 className="text-3xl text-ink">{t('admin.reviews')}</h1>
        <p className="text-sm text-ink-2 mt-1">{t('ar.desc')}</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-ink-3">{t(s.label)}</p>
            {reviews === null || loadError ? (
              <Skeleton className="h-7 w-14 mt-1" />
            ) : (
              <p className="text-2xl font-semibold text-ink tabular-nums mt-0.5 flex items-center gap-1.5">
                {s.value}
                {s.label === 'ar.average' && shown.length > 0 && <Star className="w-4 h-4 text-gold fill-gold" />}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('ar.search')}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cx(
                'shrink-0 h-10 px-3.5 rounded-full text-sm border transition-colors',
                filter === f.id ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line text-ink-2 hover:border-gold'
              )}
            >
              {t(f.label)} ({all.filter((r) => matches(r, f.id)).length})
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <EmptyState
          icon={<AlertTriangle className="w-7 h-7" />}
          title={t('ar.loadFailed')}
          description={t('ar.loadFailedDesc')}
          action={
            <Button onClick={load}>
              <RotateCw className="w-4 h-4" />
              {t('common.retry')}
            </Button>
          }
        />
      ) : reviews === null ? (
        <div className="space-y-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={<MessageSquareText className="w-7 h-7" />} title={t('ar.empty')} description={t('ar.emptyDesc')} />
      ) : (
        <div className="space-y-4">
          {visible.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onViewProduct={onViewProduct}
              onUpdated={applyUpdate}
              onToggleHidden={() => toggleHidden(r)}
              onDelete={() => setDeleting(r)}
            />
          ))}
        </div>
      )}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title={t('ar.deleteTitle')} closeLabel={t('common.close')} size="sm">
        <p className="text-sm text-ink-2 mb-2">{t('ar.deleteConfirm', { name: deleting?.name ?? '' })}</p>
        <p className="text-sm text-ink-3 italic mb-6 line-clamp-3">“{deleting?.comment}”</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={busy} onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const ReviewCard: React.FC<{
  review: AdminReview;
  onViewProduct: (id: string) => void;
  onUpdated: (r: AdminReview) => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}> = ({ review, onViewProduct, onUpdated, onToggleHidden, onDelete }) => {
  const { t, date } = useI18n();
  const toast = useToast();
  const [replying, setReplying] = useState(false);
  const [text, setText] = useState(review.reply?.text ?? '');
  const [saving, setSaving] = useState(false);

  const saveReply = async (value: string | null) => {
    setSaving(true);
    try {
      const updated = await api.updateAdminReview(review.id, { reply: value });
      onUpdated(updated as AdminReview);
      setReplying(false);
      setText(updated.reply?.text ?? '');
      toast(value ? t('ar.replySaved') : t('ar.replyRemoved'));
    } catch {
      toast(t('admin.saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className={cx('card p-5 space-y-4', review.hidden && 'opacity-70 border-dashed')}>
      {/* Product */}
      <button
        type="button"
        onClick={() => onViewProduct(review.productId)}
        className="flex items-center gap-3 text-left group max-w-full"
      >
        <ProductImage src={review.productImage ?? undefined} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
        <span className="text-sm text-ink-2 group-hover:text-gold line-clamp-1">{review.productName ?? t('ar.deletedProduct')}</span>
      </button>

      {/* Reviewer */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={review.avatar} name={review.name} size={40} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink truncate">{review.name}</span>
              <ReviewBadge review={review} />
              {review.hidden && (
                <Badge tone="warn">
                  <EyeOff className="w-3 h-3" />
                  {t('ar.hidden')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-ink-3 truncate">
              {review.userEmail} · {date(review.updatedAt, true)}
            </p>
          </div>
        </div>
        <Stars value={review.rating} />
      </div>

      <p className="text-sm text-ink leading-relaxed whitespace-pre-line">{review.comment}</p>

      {/* Reply */}
      {review.reply && !replying && (
        <div className="rounded-2xl bg-surface-2 p-4 border-l-2 border-gold">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <MessageCircleReply className="w-3.5 h-3.5 text-gold" />
              {t('ar.replyFrom')} · <span className="font-normal text-ink-3">{date(review.reply.at)}</span>
            </p>
            <div className="flex">
              <button
                type="button"
                onClick={() => setReplying(true)}
                aria-label={t('common.edit')}
                title={t('common.edit')}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => saveReply(null)}
                aria-label={t('ar.removeReply')}
                title={t('ar.removeReply')}
                className="w-7 h-7 rounded-full flex items-center justify-center text-ink-3 hover:text-danger hover:bg-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-ink-2 whitespace-pre-line">{review.reply.text}</p>
        </div>
      )}

      {replying && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) saveReply(text.trim());
          }}
          className="space-y-2"
        >
          <Textarea
            autoFocus
            rows={3}
            maxLength={1000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('ar.replyPlaceholder', { name: review.name })}
            aria-label={t('ar.reply')}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplying(false);
                setText(review.reply?.text ?? '');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" size="sm" loading={saving} disabled={!text.trim()}>
              <Send className="w-3.5 h-3.5" />
              {t('ar.sendReply')}
            </Button>
          </div>
        </form>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-line">
        {!review.reply && !replying && (
          <Button size="sm" onClick={() => setReplying(true)}>
            <MessageCircleReply className="w-4 h-4" />
            {t('ar.reply')}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onToggleHidden}>
          {review.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {review.hidden ? t('ar.show') : t('ar.hide')}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="hover:text-danger ml-auto">
          <Trash2 className="w-4 h-4" />
          {t('common.delete')}
        </Button>
      </div>
    </article>
  );
};
