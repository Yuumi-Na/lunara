/**
 * LUNARA - AUTH CONTEXT & GOOGLE OAUTH
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 4: State & Event + Authentication]
 *
 * 🔐 คู่มือการเชื่อมต่อ Google OAuth สำหรับผู้ดูแลระบบ (Admin):
 * ----------------------------------------------------------------------------
 * 1. ไปที่ Google Cloud Console (console.cloud.google.com)
 * 2. สร้างโปรเจกต์ใหม่ -> ไปที่ "APIs & Services" -> "Credentials"
 * 3. สร้าง "OAuth 2.0 Client ID" เลือก Application type: "Web application"
 * 4. ใส่ Authorized JavaScript origins เช่น http://localhost:3000
 * 5. นำ Client ID ที่ได้มาใส่ใน .env:
 *    VITE_GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
 * 6. ในโค้ด frontend สามารถเรียก Google Identity Services SDK (gapi หรือ google.accounts.id)
 *    เพื่อรับ id_token แล้วส่ง POST ไปตรวจสอบที่ /api/auth/google
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { getCurrentAdmin, loginWithGoogleOAuth, logoutAdmin as apiLogoutAdmin } from '../services/api';

interface AuthContextType {
  adminUser: AdminUser | null;
  isAdmin: boolean;
  loginWithGoogle: (customData?: Partial<AdminUser>) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ตรวจสอบสถานะการล็อกอินเดิมตอนโหลดหน้าเว็บ
  useEffect(() => {
    const saved = getCurrentAdmin();
    if (saved) {
      setAdminUser(saved);
    }
    setIsLoading(false);
  }, []);

  // ฟังก์ชันล็อกอินด้วย Google OAuth
  const loginWithGoogle = async (customData?: Partial<AdminUser>) => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogleOAuth(customData);
      setAdminUser(user);
    } catch (e) {
      console.error('Google login error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันออกจากระบบ
  const logout = () => {
    apiLogoutAdmin();
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAdmin: !!adminUser,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
