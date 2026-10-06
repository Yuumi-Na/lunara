/**
 * LUNARA - COMPONENT: FOOTER
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Consistent Layout]
 * - จุดเด่นของร้าน, ลิงก์ด่วน, หมวดความมงคล และข้อความชี้แจงด้านความเชื่อ (Disclaimer)
 * ============================================================================
 */

import React from 'react';
import { Package, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n, type TKey } from '../i18n';
import { useContent } from '../i18n/content';
import type { IntentionType } from '../types';

interface FooterProps {
  onNavigate: (url: string) => void;
}

const PERKS: { icon: React.FC<{ className?: string }>; title: TKey; desc: TKey }[] = [
  { icon: Sparkles, title: 'perk.genuine', desc: 'perk.genuineDesc' },
  { icon: Package, title: 'perk.package', desc: 'perk.packageDesc' },
  { icon: RefreshCw, title: 'perk.resize', desc: 'perk.resizeDesc' },
  { icon: ShieldCheck, title: 'perk.checked', desc: 'perk.checkedDesc' },
];

const FOOTER_INTENTIONS: IntentionType[] = ['Love', 'Money', 'Work', 'Study', 'Calm'];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const content = useContent();

  const link = (label: string, url: string) => (
    <li key={url}>
      <button type="button" onClick={() => onNavigate(url)} className="text-ink-2 hover:text-ink transition-colors text-left">
        {label}
      </button>
    </li>
  );

  return (
    <footer className="mt-24 border-t border-line bg-surface">
      {/* Perks */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gold-soft text-gold flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div>
                <h4 className="font-sans text-sm font-semibold text-ink">{t(title)}</h4>
                <p className="text-xs text-ink-3 mt-0.5 leading-relaxed">{t(desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <span className="font-brand text-3xl text-ink">LUNARA</span>
          <p className="text-sm text-ink-2 leading-relaxed max-w-sm">{t('footer.about')}</p>
          <div className="rounded-2xl bg-surface-2 border border-line p-4 text-xs text-ink-2 leading-relaxed max-w-md">
            <p className="font-semibold text-ink mb-1">{t('disclaimer.title')}</p>
            <p>{t('disclaimer.body')}</p>
          </div>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h4 className="eyebrow">{t('footer.menu')}</h4>
          <ul className="space-y-2.5 text-sm">
            {link(t('nav.home'), '/')}
            {link(t('nav.shop'), '/shop')}
            {link(t('nav.craft'), '/craft')}
            {link(t('nav.find'), '/find')}
            {link(t('nav.stones'), '/stones')}
            {link(t('nav.myOrders'), '/account')}
          </ul>
        </div>

        <div className="md:col-span-4 space-y-3">
          <h4 className="eyebrow">{t('footer.intentions')}</h4>
          <ul className="space-y-2.5 text-sm">
            {FOOTER_INTENTIONS.map((i) => link(content.intention(i), `/shop?intention=${i}`))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-3">
          <p>© {new Date().getFullYear()} LUNARA Lucky Stone Bracelets</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3">
            <span>{t('footer.course')}</span>
            <button type="button" onClick={() => onNavigate('/admin')} className="underline underline-offset-4 hover:text-ink">
              {t('footer.adminLink')}
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};
