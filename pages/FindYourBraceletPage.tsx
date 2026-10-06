/**
 * LUNARA - PAGE: FIND YOUR BRACELET (ฟีเจอร์หลักของเว็บไซต์)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Algorithms & Math.round]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Multi-selection & Submit Event)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * 1. แสดงตัวเลือกทุกกลุ่มพร้อมกันบนหน้าเดียว (ไม่ใช่ Quiz ทีละข้อ)
 * 2. เลือกได้หลายข้อในทุกกลุ่ม
 * 3. กด "Find My Bracelet" เพื่อคำนวณ Match Score (%)
 * 4. Match Score = จำนวนเงื่อนไขที่ตรง / จำนวนเงื่อนไขที่เลือกทั้งหมด × 100
 * ============================================================================
 */

import React, { useRef, useState } from 'react';
import { Award, RotateCcw, Sparkles } from 'lucide-react';
import {
  COLOR_HEX,
  COLORS,
  INTENTIONS,
  matchesPriceRange,
  PRICE_RANGES,
  STYLES,
  type ColorType,
  type IntentionType,
  type MatchedProduct,
  type PriceRangeType,
  type Product,
  type StyleType,
} from '../types';
import { ProductCard } from '../components/ProductCard';
import { Badge, Button, Container, cx, PageHeader } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';

interface Props {
  products: Product[];
  onViewProduct: (productId: string) => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const FindYourBraceletPage: React.FC<Props> = ({ products, onViewProduct }) => {
  const { t } = useI18n();
  const content = useContent();
  const toast = useToast();

  const [intentions, setIntentions] = useState<IntentionType[]>(['Love']);
  const [colors, setColors] = useState<ColorType[]>(['Pink']);
  const [styles, setStyles] = useState<StyleType[]>([]);
  const [budget, setBudget] = useState<PriceRangeType[]>([]);
  const [results, setResults] = useState<MatchedProduct[] | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const totalSelected = intentions.length + colors.length + styles.length + budget.length;

  const reset = () => {
    setIntentions([]);
    setColors([]);
    setStyles([]);
    setBudget([]);
    setResults(null);
  };

  // [JavaScript Match Score Algorithm]
  const findMatches = () => {
    if (totalSelected === 0) {
      toast(t('find.selectAtLeastOne'), 'info');
      return;
    }

    const calculated: MatchedProduct[] = products.map((product) => {
      const reasons: string[] = [];
      intentions.forEach((i) => product.intentions.includes(i) && reasons.push(content.intention(i)));
      colors.forEach((c) => product.colors.includes(c) && reasons.push(content.color(c)));
      styles.forEach((s) => product.style === s && reasons.push(content.style(s)));
      budget.forEach((b) => matchesPriceRange(product.price, b) && reasons.push(content.priceRange(b)));
      return {
        product,
        matchScore: Math.min(100, Math.round((reasons.length / totalSelected) * 100)),
        matchedReasons: reasons,
      };
    });

    calculated.sort((a, b) => b.matchScore - a.matchScore);
    setResults(calculated.filter((r) => r.matchScore > 0));
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  };

  return (
    <Container narrow className="py-10 sm:py-14 space-y-10">
      <PageHeader center eyebrow={t('find.eyebrow')} title={t('find.title')} subtitle={t('find.subtitle')} />

      <div className="card p-5 sm:p-8 space-y-8">
        <Question n={1} title={t('find.q1')}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {INTENTIONS.map((i) => (
              <ChoiceCard
                key={i}
                active={intentions.includes(i)}
                onClick={() => setIntentions((l) => toggle(l, i))}
                title={content.intention(i)}
                desc={content.intentionDesc(i)}
              />
            ))}
          </div>
        </Question>

        <Question n={2} title={t('find.q2')}>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColors((l) => toggle(l, c))}
                aria-pressed={colors.includes(c)}
                className={cx(
                  'flex flex-col items-center gap-2 rounded-2xl border py-4 transition-colors',
                  colors.includes(c) ? 'border-gold bg-gold-soft/60 ring-1 ring-gold' : 'border-line hover:border-gold'
                )}
              >
                <span className="w-8 h-8 rounded-full ring-1 ring-black/10 shadow-inner" style={{ backgroundColor: COLOR_HEX[c] }} />
                <span className="text-sm text-ink">{content.color(c)}</span>
              </button>
            ))}
          </div>
        </Question>

        <Question n={3} title={t('find.q3')}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STYLES.map((s) => (
              <ChoiceCard
                key={s}
                active={styles.includes(s)}
                onClick={() => setStyles((l) => toggle(l, s))}
                title={content.style(s)}
                desc={content.styleDesc(s)}
              />
            ))}
          </div>
        </Question>

        <Question n={4} title={t('find.q4')}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRICE_RANGES.map((r) => (
              <ChoiceCard key={r} active={budget.includes(r)} onClick={() => setBudget((l) => toggle(l, r))} title={content.priceRange(r)} />
            ))}
          </div>
        </Question>

        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-2">{t('find.selectedCount', { count: totalSelected })}</p>
          <div className="flex gap-3 w-full sm:w-auto">
            {totalSelected > 0 && (
              <Button variant="ghost" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
                {t('find.reset')}
              </Button>
            )}
            <Button size="lg" className="flex-1 sm:flex-none" onClick={findMatches}>
              <Sparkles className="w-4 h-4" />
              {t('find.submit')}
            </Button>
          </div>
        </div>
      </div>

      <div ref={resultsRef} className="scroll-mt-24">
        {results && (
          <div className="space-y-6 animate-fade-up">
            <div className="text-center space-y-2">
              <Badge tone="success">
                <Award className="w-3.5 h-3.5" />
                {t('find.resultBadge')}
              </Badge>
              <h2 className="text-2xl sm:text-3xl text-ink">{t('find.resultTitle')}</h2>
              <p className="text-sm text-ink-2">{t('find.resultCount', { count: results.length })}</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {results.map((r) => (
                <ProductCard
                  key={r.product.id}
                  product={r.product}
                  onViewDetail={onViewProduct}
                  matchScore={r.matchScore}
                  matchedReasons={r.matchedReasons}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

const Question: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => {
  const { t } = useI18n();
  return (
    <fieldset className="space-y-4">
      <legend className="w-full flex items-center justify-between gap-3 mb-4">
        <span className="flex items-center gap-3 font-display text-xl sm:text-2xl text-ink">
          <span className="w-8 h-8 rounded-full bg-accent text-on-accent text-sm font-sans font-semibold flex items-center justify-center shrink-0">
            {n}
          </span>
          {title}
        </span>
        <span className="hidden sm:inline text-xs text-ink-3">{t('find.multi')}</span>
      </legend>
      {children}
    </fieldset>
  );
};

const ChoiceCard: React.FC<{ active: boolean; onClick: () => void; title: string; desc?: string }> = ({
  active,
  onClick,
  title,
  desc,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      'text-left rounded-2xl border p-4 transition-colors',
      active ? 'border-gold bg-gold-soft/60 ring-1 ring-gold' : 'border-line hover:border-gold'
    )}
  >
    <span className="block font-medium text-ink">{title}</span>
    {desc && <span className="block text-xs text-ink-3 mt-1 line-clamp-2">{desc}</span>}
  </button>
);
