/**
 * LUNARA - INTERNATIONALIZATION (ไทย / English)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: Context + State]
 *
 * - t('key', { name: 'value' })  -> ข้อความตามภาษาที่เลือก รองรับตัวแปร {name}
 * - คีย์ทั้งหมดอยู่ใน i18n/locales/th.ts (ภาษาไทยคือภาษาหลัก)
 *   ภาษาอังกฤษต้องมีคีย์ครบทุกตัว (TypeScript จะแจ้ง error ถ้าขาด)
 * - เลือกภาษาแล้วบันทึกใน localStorage + ตั้ง <html lang="...">
 * ============================================================================
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Lang } from '../types';
import { th, type Dict, type TKey } from './locales/th';
import { en } from './locales/en';

export type { TKey };

const DICTIONARIES: Record<Lang, Dict> = { th, en };

export const LANGUAGES: { code: Lang; label: string; short: string; locale: string; gsi: string }[] = [
  { code: 'th', label: 'ไทย', short: 'TH', locale: 'th-TH', gsi: 'th' },
  { code: 'en', label: 'English', short: 'EN', locale: 'en-US', gsi: 'en' },
];

const STORAGE_KEY = 'lunara_lang';

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'th' || saved === 'en') return saved;
  } catch {
    /* ignore */
  }
  return navigator.language.toLowerCase().startsWith('th') ? 'th' : 'en';
}

type Vars = Record<string, string | number>;

interface I18nContextType {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  t: (key: TKey, vars?: Vars) => string;
  /** แปลคีย์ที่ได้มาแบบไดนามิก (เช่น message จาก Zod) ถ้าไม่มีคีย์จะคืนค่าเดิม */
  tk: (key: string | undefined, vars?: Vars) => string;
  price: (amount: number) => string;
  date: (iso: string, withTime?: boolean) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const meta = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    (key: TKey, vars?: Vars) => interpolate(DICTIONARIES[lang][key] ?? th[key] ?? key, vars),
    [lang]
  );

  const tk = useCallback(
    (key: string | undefined, vars?: Vars) => {
      if (!key) return '';
      return key in th ? t(key as TKey, vars) : key;
    },
    [t]
  );

  const value = useMemo<I18nContextType>(
    () => ({
      lang,
      locale: meta.locale,
      setLang: setLangState,
      t,
      tk,
      price: (amount: number) => `฿${amount.toLocaleString(meta.locale)}`,
      date: (iso: string, withTime = false) =>
        new Date(iso).toLocaleDateString(meta.locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
        }),
    }),
    [lang, meta.locale, t, tk]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
