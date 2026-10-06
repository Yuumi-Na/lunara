/**
 * LUNARA - PAGE: 24 LUCKY STONES GUIDE (สารานุกรมหินมงคล 24 ชนิด)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array & Objects]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowRight, Gem, Search } from 'lucide-react';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import { INTENTIONS, type IntentionType } from '../types';
import { Button, Container, PageHeader, ToggleChip } from '../components/ui';
import { Disclaimer } from './ProductDetailPage';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';

export const StonesGuidePage: React.FC<{ onNavigate: (url: string) => void }> = ({ onNavigate }) => {
  const { t } = useI18n();
  const content = useContent();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IntentionType | 'all'>('all');

  const stones = LUCKY_STONES_CATALOG.filter((s) => {
    const v = content.stone(s);
    const q = search.toLowerCase().trim();
    if (q && ![s.nameTh, s.nameEn, v.name, v.tagline, v.meaning].join(' ').toLowerCase().includes(q)) return false;
    return category === 'all' || s.category.includes(category);
  });

  return (
    <Container className="py-10 sm:py-14 space-y-8">
      <PageHeader center eyebrow={t('stones.eyebrow')} title={t('stones.title')} subtitle={t('stones.subtitle')} />
      <div className="max-w-2xl mx-auto">
        <Disclaimer />
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('stones.search')}
            className="input h-12 pl-11 rounded-2xl"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <ToggleChip active={category === 'all'} onClick={() => setCategory('all')} className="shrink-0">
            {t('stones.all', { count: LUCKY_STONES_CATALOG.length })}
          </ToggleChip>
          {INTENTIONS.map((i) => (
            <ToggleChip key={i} active={category === i} onClick={() => setCategory(i)} className="shrink-0">
              {content.intention(i)}
            </ToggleChip>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {stones.map((s) => {
          const v = content.stone(s);
          return (
            <article key={s.id} className="card card-hover p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-12 h-12 rounded-full ring-1 ring-black/10 shadow-inner shrink-0"
                  style={{ background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.8), ${s.hexColor} 50%)` }}
                />
                <div className="min-w-0">
                  <h3 className="text-xl text-ink leading-tight">{v.name}</h3>
                  <p className="text-xs text-ink-3">{v.subName}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gold">{v.tagline}</p>
              <p className="text-sm text-ink-2 leading-relaxed flex-1">{v.meaning}</p>
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-line">
                <div className="flex flex-wrap gap-1">
                  {s.category.slice(0, 3).map((c) => (
                    <span key={c} className="text-[11px] px-2 py-0.5 rounded-md bg-surface-2 text-ink-2">
                      {content.intention(c)}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/shop?q=${encodeURIComponent(s.nameEn)}`)}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-ink-2 hover:text-gold"
                >
                  {t('stones.viewProducts')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="card text-center p-8 sm:p-10 max-w-2xl mx-auto space-y-4">
        <Gem className="w-8 h-8 mx-auto text-gold" />
        <h3 className="text-2xl text-ink">{t('stones.ctaTitle')}</h3>
        <p className="text-sm text-ink-2">{t('stones.ctaDesc')}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => onNavigate('/craft')}>{t('home.craftCta')}</Button>
          <Button variant="secondary" onClick={() => onNavigate('/find')}>
            {t('home.ctaFind')}
          </Button>
        </div>
      </div>
    </Container>
  );
};
