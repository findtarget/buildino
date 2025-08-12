'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { motion } from 'framer-motion';
import {
  BuildingOffice2Icon,
  UserIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme(); // F اضافه شد: برای اطمینان از بارگذاری تم

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // F اضافه شد: برای جلوگیری از فلش زدن صفحه در بار اول
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123456') {
      setError(null);
      router.push('/dashboard');
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  if (!isMounted) {
    return null; // یا یک اسپینر لودینگ نمایش دهید
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)', // F تغییر: استفاده از متغیر تم
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary)', // F تغییر: هماهنگ با داشبورد
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
        }}
      >
        <div className="text-center mb-8">
          <BuildingOffice2Icon
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--accent-color)' }} // F تغییر
          />
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-color)' }}>
            سامانه مدیریت ساختمان
          </h2>
          <p className="text-sm opacity-70 mt-1">برای ورود، اطلاعات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              className="w-full px-4 py-3 pr-12 rounded-xl border-none outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-color)', // F تغییر
                boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
              }}
              placeholder="نام کاربری"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="password"
              className="w-full px-4 py-3 pr-12 rounded-xl border-none outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-color)', // F تغییر
                boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
              }}
              placeholder="رمز عبور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl text-white font-bold transition-all shadow-lg hover:brightness-110"
            style={{
              backgroundColor: 'var(--accent-color)', // F تغییر
              boxShadow: '2px 2px 14px var(--shadow-light), -3px -3px 12px var(--shadow-dark)',
            }}
          >
            ورود
          </button>
        </form>
      </motion.div>
    </div>
  );
}
