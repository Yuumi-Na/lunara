/**
 * LUNARA - AUTH CONTEXT (GOOGLE SIGN-IN)
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event + Authentication]
 *
 * การแยกสิทธิ์ผู้ใช้:
 * - ผู้เยี่ยมชม (ยังไม่ล็อกอิน) : ดูสินค้า / ใส่ตะกร้า / Wishlist ได้ แต่ Checkout ไม่ได้
 * - ลูกค้า (customer)          : ล็อกอินด้วย Google แล้ว สั่งซื้อและดูประวัติคำสั่งซื้อของตัวเองได้
 * - ผู้ดูแลร้าน (admin)         : อีเมลที่ได้รับสิทธิ์ (natpapattep@gmail.com) หรือ Username / Password ของ admin
 *
 * 🔐 การตั้งค่า Google OAuth:
 * 1. Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client ID (Web application)
 * 2. Authorized JavaScript origins: http://localhost:3000 (และโดเมนจริงตอน deploy)
 * 3. ใส่ Client ID ใน .env.local -> GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
 * 4. เซิร์ฟเวอร์ตรวจ ID Token กับ Google จริงที่ POST /api/auth/google (server/auth.ts)
 * ============================================================================
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { AppUser } from '../types';
import * as api from '../services/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  googleClientId: string;
  googleReady: boolean;
  /** เปิดใช้การล็อกอิน admin ด้วย Username / Password หรือไม่ */
  passwordLoginEnabled: boolean;
  loginAdmin: (username: string, password: string) => Promise<void>;
  loginError: string | null;
  isLoginOpen: boolean;
  /** เปิดหน้าต่างล็อกอิน แล้วเรียก onSuccess เมื่อล็อกอินสำเร็จ (เช่น ไปหน้า Checkout ต่อ) */
  openLogin: (onSuccess?: () => void) => void;
  closeLogin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let gsiScriptPromise: Promise<void> | null = null;
function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiScriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // hl = ภาษาของปุ่ม Google ตามภาษาที่ผู้ใช้เลือกไว้ตอนเปิดเว็บ
    script.src = `https://accounts.google.com/gsi/client?hl=${document.documentElement.lang === 'th' ? 'th' : 'en'}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gsiScriptPromise;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const [passwordLoginEnabled, setPasswordLoginEnabled] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const afterLoginRef = useRef<(() => void) | null>(null);

  // ส่ง ID Token จาก Google ไปให้เซิร์ฟเวอร์ตรวจสอบ แล้วรับข้อมูลผู้ใช้กลับมา
  const handleCredential = useCallback(async (response: { credential?: string }) => {
    if (!response.credential) return;
    setLoginError(null);
    try {
      const signedIn = await api.loginWithGoogleCredential(response.credential);
      setUser(signedIn);
      setIsLoginOpen(false);
      const next = afterLoginRef.current;
      afterLoginRef.current = null;
      next?.();
    } catch (err) {
      console.error('Google login failed:', err);
      setLoginError(err instanceof api.ApiError ? err.code : 'ERROR');
    }
  }, []);

  // โหลดสถานะการล็อกอินเดิม + ค่า Google Client ID ตอนเปิดเว็บ
  useEffect(() => {
    Promise.all([api.fetchCurrentUser().catch(() => null), api.fetchConfig().catch(() => ({ googleClientId: '', passwordLogin: false }))])
      .then(([current, config]) => {
        setUser(current);
        setGoogleClientId(config.googleClientId);
        setPasswordLoginEnabled(config.passwordLogin);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // เตรียม Google Identity Services เมื่อรู้ Client ID แล้ว
  useEffect(() => {
    if (!googleClientId) return;
    loadGoogleScript()
      .then(() => {
        window.google!.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
        });
        setGoogleReady(true);
      })
      .catch((err) => {
        console.error(err);
        setLoginError('SCRIPT_FAILED');
      });
  }, [googleClientId, handleCredential]);

  const openLogin = useCallback((onSuccess?: () => void) => {
    afterLoginRef.current = onSuccess ?? null;
    setLoginError(null);
    setIsLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    afterLoginRef.current = null;
    setIsLoginOpen(false);
  }, []);

// Admin: ล็อกอินด้วย Username / Password (โยน ApiError ให้หน้าฟอร์มแสดงข้อความ)
  const loginAdmin = useCallback(async (username: string, password: string) => {
    setUser(await api.loginAdminWithPassword(username, password));
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => undefined);
    window.google?.accounts.id.disableAutoSelect();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isLoading,
        googleClientId,
        googleReady,
        passwordLoginEnabled,
        loginAdmin,
        loginError,
        isLoginOpen,
        openLogin,
        closeLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
