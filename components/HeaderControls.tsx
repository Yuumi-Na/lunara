/**
 * LUNARA - HEADER CONTROLS
 * ============================================================================
 * - LanguageSwitcher : เลือกภาษา TH / EN
 * - ThemeToggle      : สลับธีมกลางวัน / กลางคืน
 * - UserMenu         : เมนูบัญชีผู้ใช้ (ล็อกอิน / คำสั่งซื้อ / หลังร้าน / ออกจากระบบ)
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, LayoutDashboard, LogOut, Moon, Package, Sun, UserRound } from 'lucide-react';
import { useI18n, LANGUAGES } from '../i18n';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Badge, cx, IconButton } from './ui';

function useClickOutside(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  return ref;
}

const Dropdown: React.FC<{ open: boolean; children: React.ReactNode; className?: string }> = ({
  open,
  children,
  className,
}) =>
  open ? (
    <div
      className={cx(
        'absolute right-0 top-full mt-2 z-50 min-w-[13rem] rounded-2xl border border-line bg-surface p-1.5 shadow-xl animate-pop origin-top-right',
        className
      )}
    >
      {children}
    </div>
  ) : null;

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));
  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.language')}
        className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-medium text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
      >
        <Globe className="w-[18px] h-[18px]" />
        <span>{current.short}</span>
        {!compact && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
      </button>
      <Dropdown open={open}>
        <ul role="listbox" aria-label={t('nav.language')}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cx(
                  'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                  l.code === lang ? 'bg-surface-2 text-ink font-medium' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="w-7 text-xs font-semibold text-ink-3">{l.short}</span>
                  {l.label}
                </span>
                {l.code === lang && <Check className="w-4 h-4 text-gold" />}
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
};

/** ตัวเลือกภาษาแบบปุ่มเรียงกัน (ใช้ในเมนูมือถือ) */
export const LanguageGrid: React.FC = () => {
  const { lang, setLang } = useI18n();
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={l.code === lang}
          className={cx(
            'h-11 rounded-xl text-sm font-semibold border transition-colors',
            l.code === lang ? 'bg-accent text-on-accent border-accent' : 'bg-surface border-line text-ink-2'
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
};

export const ThemeToggle: React.FC<{ withLabel?: boolean }> = ({ withLabel }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center justify-between h-12 px-4 rounded-xl bg-surface border border-line text-sm text-ink"
      >
        <span className="flex items-center gap-3">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-gold" /> : <Sun className="w-4 h-4 text-gold" />}
          {theme === 'dark' ? t('theme.dark') : t('theme.light')}
        </span>
        <span
          className={cx(
            'relative w-11 h-6 rounded-full transition-colors',
            theme === 'dark' ? 'bg-gold' : 'bg-surface-3'
          )}
        >
          <span
            className={cx(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
              theme === 'dark' ? 'left-[22px]' : 'left-0.5'
            )}
          />
        </span>
      </button>
    );
  }

  return (
    <IconButton label={label} onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
    </IconButton>
  );
};

export const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 32 }) =>
  src ? (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      style={{ width: size, height: size }}
      className="rounded-full object-cover border border-line"
    />
  ) : (
    <span
      style={{ width: size, height: size }}
      className="rounded-full bg-rose-soft text-rose font-semibold text-sm flex items-center justify-center"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );

export const UserMenu: React.FC<{ onNavigate: (url: string) => void }> = ({ onNavigate }) => {
  const { user, isAdmin, openLogin, logout, isLoading } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(open, () => setOpen(false));

  if (isLoading) return <div className="w-10 h-10" />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openLogin()}
        className="inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full border border-line-strong text-sm font-medium text-ink whitespace-nowrap hover:border-gold transition-colors"
      >
        <UserRound className="w-4 h-4" />
        <span className="hidden sm:inline">{t('auth.signIn')}</span>
      </button>
    );
  }

  const go = (url: string) => {
    setOpen(false);
    onNavigate(url);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
        className="flex items-center gap-2 h-10 pl-1 pr-1 sm:pr-3 rounded-full hover:bg-surface-2 transition-colors"
      >
        <Avatar src={user.avatar} name={user.name} />
        <span className="hidden sm:block max-w-[7rem] truncate text-sm font-medium text-ink">
          {user.name.split(' ')[0]}
        </span>
      </button>
      <Dropdown open={open} className="w-64">
        <div className="px-3 py-3 border-b border-line mb-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-ink truncate">{user.name}</p>
            {isAdmin && <Badge tone="gold">{t('role.admin')}</Badge>}
          </div>
          <p className="text-xs text-ink-3 truncate">{user.email}</p>
        </div>
        <MenuItem icon={<Package className="w-4 h-4" />} onClick={() => go('/account')}>
          {t('nav.myOrders')}
        </MenuItem>
        {isAdmin && (
          <MenuItem icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => go('/admin')}>
            {t('nav.admin')}
          </MenuItem>
        )}
        <MenuItem
          icon={<LogOut className="w-4 h-4" />}
          onClick={() => {
            setOpen(false);
            logout();
          }}
        >
          {t('auth.signOut')}
        </MenuItem>
      </Dropdown>
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; onClick: () => void; children: React.ReactNode }> = ({
  icon,
  onClick,
  children,
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
  >
    <span className="text-ink-3">{icon}</span>
    {children}
  </button>
);
