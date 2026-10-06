/**
 * LUNARA - PAGE: CRAFT YOUR BRACELET (คราฟต์กำไลผสมหิน / เลือกหินเองได้)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (Interactive Customizer)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Algorithms & Dynamic Price Calculation]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * 1. เลือกรวมหินได้ 1 - 4 ชนิดจากหินมงคลแท้ 24 ชนิดของทางร้าน
 * 2. ตัวจำลองกำไลแบบเรียลไทม์ (Live Bracelet Bead Preview)
 * 3. เลือกขนาดเม็ดหิน (3 มิล, 8mm, 10mm), รอบข้อมือ และอะไหล่ชาร์ม
 * 4. คำนวณราคาอัตโนมัติ (ฟังก์ชันเดียวกับฝั่งเซิร์ฟเวอร์ใน data/craft.ts)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { Check, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { LUCKY_STONES_CATALOG } from '../data/stones';
import {
  calcCraftPrice,
  CRAFT_BEAD_SIZES,
  CRAFT_CHARMS,
  CRAFT_MAX_STONES,
  CRAFT_WRIST_SIZES,
  type CraftBeadSizeId,
  type CraftCharmId,
} from '../data/craft';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types';
import { Badge, Button, Container, cx, PageHeader } from '../components/ui';
import { useI18n, type TKey } from '../i18n';
import { useContent } from '../i18n/content';

const BEAD_COUNT = 18;

export const CraftBraceletPage: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { addToCart } = useCart();
  const toast = useToast();
  const { t, price } = useI18n();
  const content = useContent();

  const [stoneIds, setStoneIds] = useState<string[]>(['rose-quartz', 'citrine', 'amethyst']);
  const [beadSize, setBeadSize] = useState<CraftBeadSizeId>('3mm');
  const [wristSize, setWristSize] = useState('16.0 cm');
  const [charm, setCharm] = useState<CraftCharmId>('gold14k');
  const [search, setSearch] = useState('');
  const [added, setAdded] = useState(false);

  const activeStones = stoneIds
    .map((id) => LUCKY_STONES_CATALOG.find((s) => s.id === id))
    .filter((s): s is (typeof LUCKY_STONES_CATALOG)[number] => !!s);
  const intentions = Array.from(new Set(activeStones.flatMap((s) => s.category)));
  const total = calcCraftPrice(beadSize, activeStones.length);

  const visibleStones = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return LUCKY_STONES_CATALOG;
    return LUCKY_STONES_CATALOG.filter((s) => {
      const v = content.stone(s);
      return [s.nameTh, s.nameEn, v.name, v.tagline].join(' ').toLowerCase().includes(q);
    });
  }, [search, content]);

  const toggleStone = (id: string) => {
    if (stoneIds.includes(id)) {
      if (stoneIds.length <= 1) return toast(t('craft.minStone'), 'info');
      setStoneIds((prev) => prev.filter((x) => x !== id));
    } else {
      if (stoneIds.length >= CRAFT_MAX_STONES) return toast(t('craft.maxStone', { max: CRAFT_MAX_STONES }), 'info');
      setStoneIds((prev) => [...prev, id]);
    }
  };

  const handleAdd = () => {
    const craftProduct: Product = {
      id: `craft-${beadSize}-${charm}-${[...stoneIds].sort().join('+')}`,
      name: `กำไลคราฟต์ผสมหิน "${activeStones.map((s) => s.nameTh).join(' & ')}"`,
      englishName: `Custom Bracelet (${activeStones.map((s) => s.nameEn).join(' & ')})`,
      stone: activeStones.map((s) => `${s.nameTh} (${s.nameEn})`).join(' + '),
      price: total,
      image: '/bracelet-placeholder.svg',
      intentions,
      colors: Array.from(new Set(activeStones.map((s) => s.color))),
      style: 'Luxury',
      stock: 99,
      description: '',
      belief: '',
      craft: { stoneIds, beadSize, charm },
    };
    addToCart(craftProduct, 1, wristSize);
    setAdded(true);
    toast(t('craft.added'));
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Container className="py-10 sm:py-14 space-y-10">
      <PageHeader center eyebrow={t('craft.eyebrow')} title={t('craft.title')} subtitle={t('craft.subtitle')} />

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Preview */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28 card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{t('craft.preview')}</span>
            <Badge>{t('craft.stoneCount', { count: activeStones.length, max: CRAFT_MAX_STONES })}</Badge>
          </div>

          <div className="relative aspect-square w-full max-w-[300px] mx-auto">
            <div className="absolute inset-[8%] rounded-full border border-dashed border-line-strong" />
            <div className="absolute inset-[34%] rounded-full bg-surface-2 border border-line flex flex-col items-center justify-center text-center">
              <span className="font-brand text-[0.7rem] text-ink">LUNARA</span>
              <span className="text-[10px] text-gold mt-0.5">{wristSize}</span>
            </div>
            {Array.from({ length: BEAD_COUNT }).map((_, i) => {
              const stone = activeStones[i % activeStones.length];
              const angle = (i / BEAD_COUNT) * 2 * Math.PI - Math.PI / 2;
              const r = 42; // % ของรัศมีวง
              const isCharm = charm !== 'none' && i === 0;
              return (
                <span
                  key={i}
                  title={isCharm ? t(`craft.charm.${charm}` as TKey) : content.stone(stone).name}
                  className={cx(
                    'absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-500 shadow-md',
                    isCharm ? 'w-[9%] h-[9%] ring-2 ring-white/70' : 'w-[11%] h-[11%] ring-1 ring-black/10'
                  )}
                  style={{
                    left: `${50 + r * Math.cos(angle)}%`,
                    top: `${50 + r * Math.sin(angle)}%`,
                    background: isCharm
                      ? charm === 'whiteGold18k'
                        ? 'linear-gradient(135deg,#f4f4f4,#bdbdbd)'
                        : charm === 'roseGold'
                          ? 'linear-gradient(135deg,#f3c7b5,#b97a62)'
                          : 'linear-gradient(135deg,#f6dd8f,#b38b3b)'
                      : `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.75), ${stone.hexColor} 45%, ${stone.hexColor})`,
                  }}
                />
              );
            })}
          </div>

          <ul className="space-y-2">
            {activeStones.map((s) => {
              const v = content.stone(s);
              return (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 shrink-0" style={{ backgroundColor: s.hexColor }} />
                  <span className="font-medium text-ink">{v.name}</span>
                  <span className="text-ink-3 truncate">{v.tagline}</span>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap gap-1.5">
            {intentions.map((i) => (
              <Badge key={i} tone="gold">
                ✦ {content.intention(i)}
              </Badge>
            ))}
          </div>

          <div className="pt-5 border-t border-line space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-2">{t('craft.total')}</span>
              <span className="text-3xl font-semibold text-ink tabular-nums">{price(total)}</span>
            </div>
            <Button size="lg" block onClick={handleAdd} variant={added ? 'secondary' : 'primary'}>
              {added ? <Check className="w-5 h-5 text-success" /> : <ShoppingBag className="w-5 h-5" />}
              {added ? t('craft.addedShort') : t('craft.addToCart')}
            </Button>
            {added && (
              <button type="button" onClick={onOpenCart} className="w-full text-sm text-gold hover:underline underline-offset-4">
                {t('pd.viewCart')} →
              </button>
            )}
          </div>
        </aside>

        {/* Options */}
        <div className="lg:col-span-7 space-y-6">
          <Step n={1} title={t('craft.step1')}>
            <div className="space-y-5">
              <OptionGroup label={t('craft.beadSize')}>
                <div className="grid sm:grid-cols-3 gap-2.5">
                  {CRAFT_BEAD_SIZES.map((b) => (
                    <OptionCard key={b.id} active={beadSize === b.id} onClick={() => setBeadSize(b.id)}>
                      <span className="block font-semibold">{t(`craft.bead.${b.id}` as TKey)}</span>
                      <span className="block text-xs opacity-75 mt-0.5">{t(`craft.beadDesc.${b.id}` as TKey)}</span>
                      <span className="block text-xs font-semibold mt-1.5 text-gold">
                        {t('craft.from', { price: price(b.basePrice) })}
                      </span>
                    </OptionCard>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label={t('craft.wrist')}>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {CRAFT_WRIST_SIZES.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWristSize(w)}
                      aria-pressed={wristSize === w}
                      className={cx(
                        'h-11 rounded-xl border text-sm font-medium transition-colors',
                        wristSize === w ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line hover:border-gold'
                      )}
                    >
                      {w.replace(' cm', '')}
                    </button>
                  ))}
                </div>
              </OptionGroup>

              <OptionGroup label={t('craft.charm')}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CRAFT_CHARMS.map((c) => (
                    <OptionCard key={c} active={charm === c} onClick={() => setCharm(c)} compact>
                      {t(`craft.charm.${c}` as TKey)}
                    </OptionCard>
                  ))}
                </div>
              </OptionGroup>
            </div>
          </Step>

          <Step
            n={2}
            title={t('craft.step2', { max: CRAFT_MAX_STONES })}
            aside={<span className="text-sm text-ink-3">{t('craft.selected', { count: stoneIds.length, max: CRAFT_MAX_STONES })}</span>}
          >
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('stones.search')}
                className="input pl-10"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[560px] overflow-y-auto pr-1 -mr-1">
              {visibleStones.map((s) => {
                const v = content.stone(s);
                const selected = stoneIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStone(s.id)}
                    aria-pressed={selected}
                    className={cx(
                      'relative text-left rounded-2xl border p-3.5 transition-all',
                      selected ? 'border-gold bg-gold-soft/60 ring-1 ring-gold' : 'border-line bg-surface hover:border-gold'
                    )}
                  >
                    <span className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: s.hexColor }} />
                      <span
                        className={cx(
                          'w-5 h-5 rounded-full flex items-center justify-center',
                          selected ? 'bg-gold text-white' : 'border border-line-strong'
                        )}
                      >
                        {selected && <Check className="w-3 h-3" />}
                      </span>
                    </span>
                    <span className="block font-medium text-sm text-ink leading-snug">{v.name}</span>
                    <span className="block text-[11px] text-ink-3">{v.subName}</span>
                    <span className="block text-xs text-ink-2 mt-1.5 line-clamp-2">{v.tagline}</span>
                  </button>
                );
              })}
            </div>
          </Step>

          <p className="flex items-center gap-2 text-xs text-ink-3">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            {t('disclaimer.short')}
          </p>
        </div>
      </div>
    </Container>
  );
};

const Step: React.FC<{ n: number; title: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  n,
  title,
  aside,
  children,
}) => (
  <section className="card p-5 sm:p-7">
    <div className="flex items-center justify-between gap-3 mb-5">
      <h2 className="flex items-center gap-3 text-xl sm:text-2xl text-ink">
        <span className="w-8 h-8 rounded-full bg-accent text-on-accent text-sm font-sans font-semibold flex items-center justify-center shrink-0">
          {n}
        </span>
        {title}
      </h2>
      {aside}
    </div>
    {children}
  </section>
);

const OptionGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2.5">
    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{label}</p>
    {children}
  </div>
);

const OptionCard: React.FC<{ active: boolean; onClick: () => void; compact?: boolean; children: React.ReactNode }> = ({
  active,
  onClick,
  compact,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cx(
      'rounded-2xl border text-left transition-colors text-sm',
      compact ? 'px-3 py-3 text-center font-medium' : 'p-4',
      active ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line text-ink hover:border-gold'
    )}
  >
    {children}
  </button>
);
