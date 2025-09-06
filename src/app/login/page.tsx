// src/app/login/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  BuildingOffice2Icon,
  UserIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface ValidationError {
  field: string;
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // تابع اعتبارسنجی ایمیل
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // تابع اعتبارسنجی رمز عبور
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // تابع اعتبارسنجی فرم
  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // بررسی ایمیل
    if (!email.trim()) {
      errors.push({
        field: 'email',
        message: 'لطفاً ایمیل خود را وارد کنید'
      });
    } else if (!validateEmail(email.trim())) {
      errors.push({
        field: 'email',
        message: 'فرمت ایمیل صحیح نیست (مثال: user@example.com)'
      });
    }

    // بررسی رمز عبور
    if (!password) {
      errors.push({
        field: 'password',
        message: 'لطفاً رمز عبور خود را وارد کنید'
      });
    } else if (!validatePassword(password)) {
      errors.push({
        field: 'password',
        message: 'رمز عبور باید حداقل ۶ کاراکتر باشد'
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // تابع بررسی خطاهای سرور و تبدیل به پیام فارسی
  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Invalid credentials': 'ایمیل یا رمز عبور اشتباه است',
      'User not found': 'کاربری با این ایمیل یافت نشد',
      'Invalid email format': 'فرمت ایمیل صحیح نیست',
      'Password too short': 'رمز عبور کوتاه است',
      'Account suspended': 'حساب کاربری شما مسدود شده است',
      'Too many attempts': 'تعداد تلاش‌های شما بیش از حد مجاز است. لطفاً بعداً تلاش کنید',
      'Network error': 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید',
      'Server error': 'خطای سرور. لطفاً دوباره تلاش کنید',
      'Email required': 'ایمیل الزامی است',
      'Password required': 'رمز عبور الزامی است',
    };

    return errorMessages[error] || 'خطای ناشناخته. لطفاً دوباره تلاش کنید';
  };

  // تابع پاک کردن خطاهای فیلد خاص
  const clearFieldError = (fieldName: string) => {
    setValidationErrors(prev => prev.filter(err => err.field !== fieldName));
    if (error) setError(null);
  };

  // تابع مدیریت تغییر ایمیل
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    clearFieldError('email');
    
    // اعتبارسنجی بلادرنگ
    if (value.trim() && !validateEmail(value.trim())) {
      setValidationErrors(prev => [
        ...prev.filter(err => err.field !== 'email'),
        { field: 'email', message: 'فرمت ایمیل صحیح نیست' }
      ]);
    }
  };

  // تابع مدیریت تغییر رمز عبور
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    clearFieldError('password');
    
    // اعتبارسنجی بلادرنگ
    if (value && value.length < 6) {
      setValidationErrors(prev => [
        ...prev.filter(err => err.field !== 'password'),
        { field: 'password', message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }
      ]);
    }
  };

  // تابع ارسال فرم
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // پاک کردن خطاهای قبلی
    setError(null);
    setValidationErrors([]);

    // اعتبارسنجی فرم
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (response.success && response.data?.accessToken) {
        await login(response.data.accessToken);
        
        // پیام موفقیت (اختیاری)
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
      } else {
        const errorMessage = getErrorMessage(response.error || 'Unknown error');
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError('خطای اتصال به سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  // تابع دریافت خطای فیلد خاص
  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(err => err.field === fieldName)?.message;
  };

  // تابع بررسی معتبر بودن فیلد
  const isFieldValid = (fieldName: string): boolean => {
    if (fieldName === 'email') {
      return email.trim() !== '' && validateEmail(email.trim()) && !getFieldError('email');
    }
    if (fieldName === 'password') {
      return password !== '' && validatePassword(password) && !getFieldError('password');
    }
    return true;
  };

  // تابع هدایت به صفحه ثبت‌نام
  const handleRegisterRedirect = () => {
    router.push('/register');
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen p-4 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)',
          boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
        }}
      >
        {/* هدر */}
        <div className="text-center mb-8">
          <BuildingOffice2Icon
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--accent-color)' }}
          />
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--accent-color)' }}>
            سامانه مدیریت ساختمان
          </h2>
          <p className="text-sm opacity-70 mt-2">برای ورود، اطلاعات خود را وارد کنید</p>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* فیلد ایمیل */}
          <div className="space-y-2">
            <div className="relative">
              <UserIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                className={`w-full px-4 py-3 pr-12 pl-14 rounded-xl border-none outline-none transition-all ${
                  getFieldError('email') ? 'ring-2 ring-red-500/50' : 
                  isFieldValid('email') && email.trim() ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="ایمیل (نام کاربری)"
                value={email}
                onChange={handleEmailChange}
                autoFocus
                autoComplete="email"
                dir="ltr"
              />
              {/* آیکن وضعیت - کنار چپ اینپوت */}
              {email.trim() && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  {isFieldValid('email') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {/* پیام خطای ایمیل */}
            {getFieldError('email') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm pr-2 flex items-center gap-1"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                {getFieldError('email')}
              </motion.p>
            )}
          </div>

          {/* فیلد رمز عبور */}
          <div className="space-y-2">
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 pr-12 pl-20 rounded-xl border-none outline-none transition-all ${
                  getFieldError('password') ? 'ring-2 ring-red-500/50' : 
                  isFieldValid('password') && password ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="رمز عبور"
                value={password}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
              
              {/* آیکن وضعیت رمز عبور - کنار آیکن نمایش رمز */}
              {password && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10">
                  {isFieldValid('password') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
              
              {/* دکمه نمایش/مخفی کردن رمز */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-70 transition-opacity z-20"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {/* پیام خطای رمز عبور */}
            {getFieldError('password') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm pr-2 flex items-center gap-1"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                {getFieldError('password')}
              </motion.p>
            )}
          </div>

          {/* پیام خطای عمومی */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-center text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-center gap-2"
            >
              <ExclamationTriangleIcon className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {/* دکمه ورود */}
          <motion.button
            type="submit"
            disabled={isLoading || validationErrors.length > 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center items-center py-3 mt-6 rounded-xl text-white font-bold transition-all shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--accent-color)',
              boxShadow: '2px 2px 14px var(--shadow-light), -3px -3px 12px var(--shadow-dark)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>در حال ورود...</span>
              </div>
            ) : (
              'ورود'
            )}
          </motion.button>
        </form>

        {/* بخش ثبت‌نام */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="flex-1 h-px" 
              style={{ backgroundColor: 'var(--border-color)' }}
            ></div>
            <span className="px-4 text-sm opacity-60">یا</span>
            <div 
              className="flex-1 h-px" 
              style={{ backgroundColor: 'var(--border-color)' }}
            ></div>
          </div>
          
          <p className="text-sm opacity-70 mb-3">
            حساب کاربری ندارید؟
          </p>
          
          <motion.button
            type="button"
            onClick={handleRegisterRedirect}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-bold transition-all border-2 hover:brightness-110"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
              boxShadow: '2px 2px 8px var(--shadow-light), -2px -2px 8px var(--shadow-dark)',
            }}
          >
            ثبت‌نام
          </motion.button>
        </div>

        {/* راهنمایی */}
        <div className="mt-6 text-center text-xs opacity-60">
          <p>در صورت فراموشی رمز عبور با مدیر سیستم تماس بگیرید</p>
        </div>
      </motion.div>
    </div>
  );
}
