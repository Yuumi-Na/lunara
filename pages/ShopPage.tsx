/**
 * LUNARA - PAGE: SHOP PAGE (หน้ารวมสินค้าทั้งหมด)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 1: JavaScript Array Methods (filter, includes, some, sort)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event (useState, onChange, multi-select)]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design (Filter Sheet บนมือถือ)]
 *
 * ตัวกรองหลายเงื่อนไข:
 * 1. Intentions : สินค้าต้องมี intention อย่างน้อย 1 รายการที่ตรงกับที่เลือก
 * 2. Colors     : สินค้าต้องมีสีอย่างน้อย 1 สีที่ตรงกับที่เลือก
 * 3. Style      : สไตล์ต้องตรงกับที่เลือก
 * 4. Price      : อยู่ในช่วงราคาที่เลือก
 * 5. Search     : ค้นหาจากชื่อสินค้า ชื่อหิน คำอธิบาย (ทั้งภาษาไทยและภาษาที่เลือก)
 * ============================================================================
 */

import React, { useMemo, useState } from 'react';
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  COLOR_HEX,
  COLORS,
  INTENTIONS,
  matchesPriceRange,
  PRICE_RANGES,
  STYLES,
  type ColorType,
  type IntentionType,
  type PriceRangeType,
  type Product,
  type StyleType,
} from '../types';
import { ProductGrid } from '../components/ProductCard';
import { Button, Container, EmptyState, PageHeader, Select, Sheet, ToggleChip } from '../components/ui';
import { useI18n } from '../i18n';
import { useContent } from '../i18n/content';

interface ShopPageProps {
  products: Product[];
  loading: boolean;
  onViewProduct: (productId: string) => void;
  initialIntention?: string | null;
  initialQuery?: string | null;
}

type SortKey = 'featured' | 'popular' | 'price-asc' | 'price-desc';

interface Filters {
  intentions: IntentionType[];
  colors: ColorType[];
  styles: StyleType[];
  prices: PriceRangeType[];
}

const EMPTY_FILTERS: Filters = { intentions: [], colors: [], styles: [], prices: [] };

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const ShopPage: React.FC<ShopPageProps> = ({ products, loading, onViewProduct, initialIntention, initialQuery }) => {
  const { t } = useI18n();
  const content = useContent();

  const [query, setQuery] = useState(initialQuery ?? '');
  const [filters, setFilters] = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    intentions: INTENTIONS.includes(initialIntention as IntentionType) ? [initialIntention as IntentionType] : [],
  }));
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [sheetOpen, setSheetOpen] = useState(false);

  const update = <K extends keyof Filters>(key: K, value: Filters[K][number]) =>
    setFilters((f) => ({ ...f, [key]: toggle(f[key] as Filters[K][number][], value) }));

  const reset = () => {
    setQuery('');
    setFilters(EMPTY_FILTERS);
  };

  // [JavaScript Array Filtering] ตรวจสอบเงื่อนไขหลายข้อพร้อมกัน
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return products
      .filter((p) => {
        if (q) {
          const view = content.product(p);
          const haystack = [p.name, p.englishName, p.stone, p.description, view.name, view.stone, view.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (filters.intentions.length && !p.intentions.some((i) => filters.intentions.includes(i))) return false;
        if (filters.colors.length && !p.colors.some((c) => filters.colors.includes(c))) return false;
        if (filters.styles.length && !filters.styles.includes(p.style)) return false;
        if (filters.prices.length && !filters.prices.some((r) => matchesPriceRange(p.price, r))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'popular') return (b.reviewCount || 0) - (a.reviewCount || 0);
        return 0;
      });
  }, [products, query, filters, sortBy, content]);

  const activeCount = filters.intentions.length + filters.colors.length + filters.styles.length + filters.prices.length;

  const activePills: { label: string; onRemove: () => void }[] = [
    ...filters.intentions.map((v) => ({ label: content.intention(v), onRemove: () => update('intentions', v) })),
    ...filters.colors.map((v) => ({ label: content.color(v), onRemove: () => update('colors', v) })),
    ...filters.styles.map((v) => ({ label: content.style(v), onRemove: () => update('styles', v) })),
    ...filters.prices.map((v) => ({ label: content.priceRange(v), onRemove: () => update('prices', v) })),
  ];

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title={t('filter.intention')}>
        {INTENTIONS.map((i) => (
          <ToggleChip key={i} active={filters.intentions.includes(i)} onClick={() => update('intentions', i)}>
            {content.intention(i)}
          </ToggleChip>
        ))}
      </FilterGroup>
      <FilterGroup title={t('filter.color')}>
        {COLORS.map((c) => (
          <ToggleChip key={c} active={filters.colors.includes(c)} onClick={() => update('colors', c)}>
            <span className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: COLOR_HEX[c] }} />
            {content.color(c)}
          </ToggleChip>
        ))}
      </FilterGroup>
      <FilterGroup title={t('filter.style')}>
        {STYLES.map((s) => (
          <ToggleChip key={s} active={filters.styles.includes(s)} onClick={() => update('styles', s)}>
            {content.style(s)}
          </ToggleChip>
        ))}
      </FilterGroup>
      <FilterGroup title={t('filter.price')}>
        {PRICE_RANGES.map((r) => (
          <ToggleChip key={r} active={filters.prices.includes(r)} onClick={() => update('prices', r)}>
            {content.priceRange(r)}
          </ToggleChip>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <Container className="py-10 sm:py-14 space-y-8">
      <PageHeader eyebrow={t('shop.eyebrow')} title={t('shop.title')} subtitle={t('shop.subtitle')} />

      {/* Search + sort + filter button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('shop.searchPlaceholder')}
            aria-label={t('shop.searchPlaceholder')}
            className="input h-12 pl-11 pr-10 rounded-2xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('common.clear')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="lg:hidden flex-1 sm:flex-none h-12" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="w-4 h-4" />
            {t('filter.title')}
            {activeCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-accent text-on-accent text-xs flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </Button>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label={t('sort.label')}
            className="h-12 rounded-2xl flex-1 sm:w-52"
          >
            <option value="featured">{t('sort.featured')}</option>
            <option value="popular">{t('sort.popular')}</option>
            <option value="price-asc">{t('sort.priceAsc')}</option>
            <option value="price-desc">{t('sort.priceDesc')}</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-sans text-base font-semibold text-ink">{t('filter.title')}</h3>
            {activeCount > 0 && (
              <button type="button" onClick={reset} className="text-xs text-ink-3 hover:text-danger">
                {t('filter.clearAll')}
              </button>
            )}
          </div>
          {filterPanel}
        </aside>

        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-wrap items-center gap-2 min-h-8">
            <span className="text-sm text-ink-3 mr-1">{t('shop.resultCount', { count: filtered.length })}</span>
            {activePills.map((pill) => (
              <button
                key={pill.label}
                type="button"
                onClick={pill.onRemove}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-surface-2 text-sm text-ink-2 hover:text-ink"
              >
                {pill.label}
                <X className="w-3.5 h-3.5" />
              </button>
            ))}
            {activePills.length > 0 && (
              <button type="button" onClick={reset} className="text-sm text-ink-3 underline underline-offset-4 hover:text-ink ml-1">
                {t('filter.clearAll')}
              </button>
            )}
          </div>

          {!loading && filtered.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="w-7 h-7" />}
              title={t('shop.emptyTitle')}
              description={t('shop.emptyDesc')}
              action={<Button onClick={reset}>{t('filter.clearAll')}</Button>}
            />
          ) : (
            <ProductGrid products={filtered} loading={loading} onViewDetail={onViewProduct} compact />
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        closeLabel={t('common.close')}
        title={<h3 className="text-lg text-ink">{t('filter.title')}</h3>}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={reset} className="flex-1">
              {t('filter.clearAll')}
            </Button>
            <Button onClick={() => setSheetOpen(false)} className="flex-[2]">
              {t('filter.showResults', { count: filtered.length })}
            </Button>
          </div>
        }
      >
        <div className="p-5">{filterPanel}</div>
      </Sheet>
    </Container>
  );
};

const FilterGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <fieldset className="space-y-3">
    <legend className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">{title}</legend>
    <div className="flex flex-wrap gap-2">{children}</div>
  </fieldset>
);
