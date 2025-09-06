// src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/index.d';
import api from '@/lib/api'; // حالا این api به درستی کار می‌کند

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // حالا api.post یک تابع معتبر است
        const response = await api.post('/auth/refresh');

        // با توجه به interceptor، ساختار پاسخ به این شکل است
        if (response.success && response.data.user) {
          setUser(response.data.user);
          // تنظیم هدر برای درخواست‌های بعدی
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        } else {
          // این حالت معمولاً رخ نمی‌دهد چون در صورت عدم موفقیت، به catch می‌رود
          // اما برای اطمینان اینجا باقی می‌ماند
          setUser(null);
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (error: any) { // تایپ error را 'any' در نظر می‌گیریم تا به پراپرتی‌هایش دسترسی داشته باشیم
        // بررسی می‌کنیم که آیا خطا از نوع 401 (عدم احراز هویت) است یا خیر
        // این وضعیت زمانی که کاربر لاگین نکرده کاملا طبیعی است
        if (error?.status === 401) {
          console.info("Auth session not found. User needs to log in.");
        } else {
          // اگر خطای دیگری (مانند خطای شبکه یا سرور) رخ دهد، آن را به عنوان یک خطای واقعی لاگ می‌کنیم
          console.error("An unexpected error occurred during auth initialization:", error);
        }
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (accessToken: string) => {
    // هدر Authorization را برای تمام درخواست‌های بعدی تنظیم می‌کنیم
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    try {
      // اطلاعات کاربر را مجددا واکشی میکنیم تا context آپدیت شود
      // فرض میکنیم چنین route ای برای گرفتن اطلاعات کاربر لاگین شده وجود دارد
      const response = await api.get('/users/me'); 
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
      // در صورت خطا، بهتر است کاربر را logout کنیم تا در وضعیت نامشخص باقی نماند
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const logout = async () => {
    try {
      // ابتدا سعی می‌کنیم کوکی را از سمت سرور پاک کنیم
      await api.post('/auth/logout');
    } catch (error) {
      // حتی اگر درخواست به سرور ناموفق بود، باید کلاینت را پاک کنیم
      console.error("Server logout failed, proceeding with client-side logout:", error);
    } finally {
      // در هر صورت، اطلاعات کاربر را از state و هدرهای api پاک می‌کنیم
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
