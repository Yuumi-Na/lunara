/**
 * LUNARA - GOOGLE SIGN-IN BUTTON & LOGIN MODAL
 * ============================================================================
 * ปุ่มของ Google ถูกวาดโดย Google Identity Services (renderButton)
 * จึงเป็นปุ่มทางการ แสดงภาษาและธีมตามที่ผู้ใช้เลือก
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import { AlertCircle, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n, LANGUAGES, type TKey } from '../i18n';
import { Modal, Spinner } from './ui';

const ERROR_KEYS: Record<string, TKey> = {
  NOT_CONFIGURED: 'auth.errNotConfigured',
  SCRIPT_FAILED: 'auth.errScript',
  EMAIL_NOT_VERIFIED: 'auth.errEmail',
  INVALID_TOKEN: 'auth.errToken',
};

export const GoogleSignInButton: React.FC = () => {
  const { googleReady, googleClientId, isLoading, loginError } = useAuth();
  const { theme } = useTheme();
  const { lang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!googleReady || !ref.current || !window.google) return;
    ref.current.innerHTML = '';
    window.google.accounts.id.renderButton(ref.current, {
      type: 'standard',
      theme: theme === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'left',
      width: Math.min(360, ref.current.clientWidth || 320),
      locale: LANGUAGES.find((l) => l.code === lang)?.gsi,
    });
  }, [googleReady, theme, lang]);

  if (!isLoading && !googleClientId) {
    return (
      <div className="flex items-start gap-2 rounded-2xl bg-warn-soft text-warn p-4 text-sm text-left">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{t('auth.errNotConfigured')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center min-h-[44px] items-center">
        {!googleReady && <Spinner />}
        <div ref={ref} className="w-full flex justify-center" />
      </div>
      {loginError && (
        <p className="flex items-center justify-center gap-1.5 text-sm text-danger" role="alert">
          <AlertCircle className="w-4 h-4" />
          {t(ERROR_KEYS[loginError] ?? 'auth.errGeneric')}
        </p>
      )}
    </div>
  );
};

export const LoginModal: React.FC = () => {
  const { isLoginOpen, closeLogin } = useAuth();
  const { t } = useI18n();

  return (
    <Modal open={isLoginOpen} onClose={closeLogin} title={t('auth.title')} closeLabel={t('common.close')} size="sm">
      <div className="space-y-6">
        <p className="text-sm text-ink-2">{t('auth.subtitle')}</p>

        <ul className="space-y-3 text-sm text-ink-2">
          {[
            { icon: ShoppingBag, key: 'auth.benefitCheckout' as TKey },
            { icon: Truck, key: 'auth.benefitOrders' as TKey },
            { icon: ShieldCheck, key: 'auth.benefitSecure' as TKey },
          ].map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>

        <GoogleSignInButton />

        <p className="text-[11px] text-ink-3 text-center leading-relaxed">{t('auth.privacy')}</p>
      </div>
    </Modal>
  );
};
