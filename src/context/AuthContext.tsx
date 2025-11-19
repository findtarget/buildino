// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/index.d';
import api, { apiHelpers } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تابع برای واکشی اطلاعات کاربر
  const fetchUser = async () => {
    try {
      const response = await apiHelpers.get('/users/me');
      if (response.success && response.data) {
        const userData = response.data.user || response.data;
        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }
    } catch (error: any) {
      // بررسی نوع خطا
      if (error?.status === 401) {
        // احتمال token expired - تلاش برای refresh
        try {
          console.info("🔄 [AuthContext] Token may be expired, trying refresh...");
          const refreshResponse = await apiHelpers.post('/auth/refresh');
          
          if (refreshResponse.success && refreshResponse.data?.user) {
            console.log("✅ [AuthContext] Token refreshed successfully");
            setUser(refreshResponse.data.user);
            
            // تنظیم هدر Authorization با توکن جدید
            if (refreshResponse.data.accessToken) {
              api.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
            }
            
            return refreshResponse.data.user;
          } else {
            throw new Error('Refresh failed');
          }
        } catch (refreshError) {
          console.info("🔐 [AuthContext] Authentication required - refresh failed");
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
          return null;
        }
      } else {
        // خطاهای دیگر (شبکه، سرور و...)
        console.error("❌ [AuthContext] Error fetching user:", error);
        setUser(null);
        return null;
      }
    }
  };

  // اجرای اولیه برای بررسی وضعیت احراز هویت
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        console.log("🔄 [AuthContext] Initializing authentication...");
        await fetchUser();
      } finally {
        setIsLoading(false);
        console.log("✅ [AuthContext] Authentication initialization completed");
      }
    };

    initializeAuth();
  }, []);

  // تابع ورود به سیستم
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log("🔄 [AuthContext] Attempting login for:", email);

      const response = await apiHelpers.post('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        console.log("✅ [AuthContext] Login successful");
        
        // تنظیم کاربر
        const userData = response.data.user || response.data;
        setUser(userData);
        
        // اگر accessToken در پاسخ باشد، آن را به هدر Authorization اضافه کن
        if (response.data.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        }
        
        return { success: true };
      } else {
        console.log("❌ [AuthContext] Login failed:", response.error);
        setUser(null);
        return { 
          success: false, 
          error: response.error || 'خطا در ورود به سیستم' 
        };
      }
    } catch (error: any) {
      console.error("❌ [AuthContext] Login error:", error);
      setUser(null);
      return { 
        success: false, 
        error: error.error || 'خطا در برقراری ارتباط با سرور' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // تابع خروج از سیستم
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 [AuthContext] Logging out...");
      
      // درخواست logout به سرور
      await apiHelpers.post('/auth/logout');
    } catch (error) {
      // حتی اگر درخواست به سرور ناموفق بود، باید کلاینت را پاک کنیم
      console.error("❌ [AuthContext] Server logout failed:", error);
    } finally {
      // در هر صورت، اطلاعات کاربر را پاک کن
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      setIsLoading(false);
      
      console.log("✅ [AuthContext] Logout completed");
      
      // انتقال به صفحه لاگین
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  // تابع برای بروزرسانی اطلاعات کاربر
  const refreshUser = async () => {
    if (!isLoading) { // جلوگیری از چندین درخواست همزمان
      await fetchUser();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
