/**
 * LUNARA - THEME CONTEXT (ธีมกลางวัน / กลางคืน)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event + Context]
 * - ค่าเริ่มต้นตามการตั้งค่าเครื่อง (prefers-color-scheme)
 * - บันทึกธีมที่เลือกไว้ใน localStorage
 * - สลับธีมด้วย <html data-theme="..."> (สีทั้งหมดมาจากตัวแปร CSS ใน index.css)
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'lunara_theme';

function initialTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme;
  return fromDom === 'dark' ? 'dark' : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#131010' : '#faf7f2');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* โหมดส่วนตัวของเบราว์เซอร์อาจบันทึกไม่ได้ */
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
