/**
 * LUNARA - COMPONENT: NAVBAR
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Reusability]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event]
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 5: Responsive Design]
 *
 * - แถบประกาศด้านบน + เมนูหลักแบบเรียบง่าย 4 เมนู
 * - ปุ่มภาษา, ธีมกลางวัน/กลางคืน, Wishlist, ตะกร้า, บัญชีผู้ใช้
 * - มือถือ: เมนูสไลด์ด้านซ้าย + แถบเมนูด้านล่าง (Bottom Tab Bar) กดง่ายด้วยนิ้วโป้ง
 * ============================================================================
 */

import React, { useState } from 'react';
import { Compass, Gem, Heart, Home, Menu, ShoppingBag, Sparkles, Store, UserRound, BookOpen, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useI18n, type TKey } from '../i18n';
import { LanguageGrid, LanguageSwitcher, ThemeToggle, UserMenu } from './HeaderControls';
import { cx, IconButton, Sheet } from './ui';

interface NavbarProps {
  currentPath: string;
  onNavigate: (url: string) => void;
  onOpenCart: () => void;
}

const NAV_LINKS: { key: TKey; path: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'nav.shop', path: '/shop', icon: Store },
  { key: 'nav.craft', path: '/craft', icon: Gem },
  { key: 'nav.find', path: '/find', icon: Compass },
  { key: 'nav.stones', path: '/stones', icon: BookOpen },
];

const CountBadge: React.FC<{ count: number; tone?: 'gold' | 'rose' }> = ({ count, tone = 'gold' }) =>
  count > 0 ? (
    <span
      className={cx(
        'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white ring-2 ring-bg',
        tone === 'gold' ? 'bg-gold' : 'bg-rose'
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenCart }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAdmin } = useAuth();
  const { t } = useI18n();

  const go = (path: string) => {
    setMenuOpen(false);
    onNavigate(path);
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(`${path}/`);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-accent text-on-accent text-xs sm:text-[0.8rem] py-2 px-4 text-center tracking-wide">
        <span>{t('announce.freeShip')}</span>
        <span aria-hidden="true" className="mx-2.5 opacity-40">·</span>
        <span className="font-semibold text-gold-soft dark:text-bg">{t('announce.code')}</span>
      </div>

      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 lg:h-[72px] flex items-center justify-between gap-2">
          {/* Left: menu + logo */}
          <div className="flex items-center gap-1 lg:gap-0 min-w-0">
            <IconButton label={t('nav.menu')} onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </IconButton>
            <button type="button" onClick={() => go('/')} className="px-1 focus:outline-none" aria-label="LUNARA">
              <span className="font-brand text-[1.6rem] sm:text-3xl text-ink">LUNARA</span>
            </button>
          </div>

          {/* Center: desktop links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label={t('nav.menu')}>
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => go(link.path)}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={cx(
                  'relative h-10 px-4 rounded-full text-[0.95rem] transition-colors flex items-center gap-1.5',
                  isActive(link.path) ? 'text-ink bg-surface-2 font-medium' : 'text-ink-2 hover:text-ink'
                )}
              >
                {link.path === '/craft' && <Sparkles className="w-3.5 h-3.5 text-gold" />}
                {t(link.key)}
              </button>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <IconButton label={t('nav.wishlist')} onClick={() => go('/wishlist')} className="hidden sm:inline-flex">
              <Heart className="w-[18px] h-[18px]" />
              <CountBadge count={wishlistCount} tone="rose" />
            </IconButton>
            <IconButton label={t('nav.cart')} onClick={onOpenCart}>
              <ShoppingBag className="w-[18px] h-[18px]" />
              <CountBadge count={cartCount} />
            </IconButton>
            <div className="ml-1">
              <UserMenu onNavigate={go} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile side menu */}
      <Sheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        side="left"
        closeLabel={t('common.close')}
        title={<span className="font-brand text-2xl text-ink">LUNARA</span>}
      >
        <div className="p-4 space-y-6">
          <nav className="space-y-1">
            {[{ key: 'nav.home' as TKey, path: '/', icon: Home }, ...NAV_LINKS, { key: 'nav.wishlist' as TKey, path: '/wishlist', icon: Heart }].map(
              (link) => {
                const Icon = link.icon;
                const active = link.path === '/' ? currentPath === '/' : isActive(link.path);
                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => go(link.path)}
                    className={cx(
                      'w-full flex items-center gap-3 h-12 px-4 rounded-xl text-[0.95rem] transition-colors',
                      active ? 'bg-surface-2 text-ink font-medium' : 'text-ink-2 hover:bg-surface-2'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] text-gold" />
                    {t(link.key)}
                  </button>
                );
              }
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => go('/admin')}
                className="w-full flex items-center gap-3 h-12 px-4 rounded-xl text-[0.95rem] text-ink-2 hover:bg-surface-2"
              >
                <LayoutDashboard className="w-[18px] h-[18px] text-gold" />
                {t('nav.admin')}
              </button>
            )}
          </nav>

          <div className="space-y-2">
            <p className="eyebrow">{t('nav.language')}</p>
            <LanguageGrid />
          </div>

          <div className="space-y-2">
            <p className="eyebrow">{t('theme.label')}</p>
            <ThemeToggle withLabel />
          </div>
        </div>
      </Sheet>
    </>
  );
};

/** แถบเมนูด้านล่างบนมือถือ */
export const MobileTabBar: React.FC<{ currentPath: string; onNavigate: (url: string) => void }> = ({
  currentPath,
  onNavigate,
}) => {
  const { t } = useI18n();
  const { wishlistCount } = useWishlist();

  const tabs: { key: TKey; path: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { key: 'nav.home', path: '/', icon: Home },
    { key: 'nav.shop', path: '/shop', icon: Store },
    { key: 'nav.craftShort', path: '/craft', icon: Gem },
    { key: 'nav.wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { key: 'nav.account', path: '/account', icon: UserRound },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]"
      aria-label={t('nav.menu')}
    >
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.path === '/' ? currentPath === '/' : currentPath.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => onNavigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'relative flex flex-col items-center justify-center gap-1 text-[11px] transition-colors',
                active ? 'text-ink font-medium' : 'text-ink-3'
              )}
            >
              <span className="relative">
                <Icon className={cx('w-5 h-5', active && 'text-gold')} />
                {!!tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="truncate max-w-full px-1">{t(tab.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
