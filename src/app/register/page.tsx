// src/app/register/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // توابع اعتبارسنجی
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[\u0600-\u06FF\s]+$/.test(name.trim());
  };

  // تابع اعتبارسنجی فرم کامل
  const validateForm = (): boolean => {
    const errors: ValidationError[] = [];

    // بررسی نام
    if (!formData.firstName.trim()) {
      errors.push({
        field: 'firstName',
        message: 'لطفاً نام خود را وارد کنید'
      });
    } else if (!validateName(formData.firstName)) {
      errors.push({
        field: 'firstName',
        message: 'نام باید حداقل ۲ کاراکتر و فقط شامل حروف فارسی باشد'
      });
    }

    // بررسی نام خانوادگی
    if (!formData.lastName.trim()) {
      errors.push({
        field: 'lastName',
        message: 'لطفاً نام خانوادگی خود را وارد کنید'
      });
    } else if (!validateName(formData.lastName)) {
      errors.push({
        field: 'lastName',
        message: 'نام خانوادگی باید حداقل ۲ کاراکتر و فقط شامل حروف فارسی باشد'
      });
    }

    // بررسی ایمیل
    if (!formData.email.trim()) {
      errors.push({
        field: 'email',
        message: 'لطفاً ایمیل خود را وارد کنید'
      });
    } else if (!validateEmail(formData.email.trim())) {
      errors.push({
        field: 'email',
        message: 'فرمت ایمیل صحیح نیست (مثال: user@example.com)'
      });
    }

    // بررسی شماره تلفن
    if (!formData.phone.trim()) {
      errors.push({
        field: 'phone',
        message: 'لطفاً شماره موبایل خود را وارد کنید'
      });
    } else if (!validatePhone(formData.phone)) {
      errors.push({
        field: 'phone',
        message: 'فرمت شماره موبایل صحیح نیست (مثال: 09123456789)'
      });
    }

    // بررسی رمز عبور
    if (!formData.password) {
      errors.push({
        field: 'password',
        message: 'لطفاً رمز عبور خود را وارد کنید'
      });
    } else if (!validatePassword(formData.password)) {
      errors.push({
        field: 'password',
        message: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
      });
    }

    // بررسی تکرار رمز عبور
    if (!formData.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'لطفاً رمز عبور را تکرار کنید'
      });
    } else if (formData.password !== formData.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'رمز عبور و تکرار آن مطابقت ندارند'
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // تابع بررسی خطاهای سرور
  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Email already exists': 'این ایمیل قبلاً ثبت شده است',
      'Phone already exists': 'این شماره موبایل قبلاً ثبت شده است',
      'Invalid email format': 'فرمت ایمیل صحیح نیست',
      'Password too short': 'رمز عبور کوتاه است',
      'Invalid phone format': 'فرمت شماره موبایل صحیح نیست',
      'Network error': 'خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید',
      'Server error': 'خطای سرور. لطفاً دوباره تلاش کنید',
      'Validation failed': 'اطلاعات وارد شده صحیح نیست',
    };

    return errorMessages[error] || 'خطای ناشناخته. لطفاً دوباره تلاش کنید';
  };

  // تابع پاک کردن خطای فیلد خاص
  const clearFieldError = (fieldName: string) => {
    setValidationErrors(prev => prev.filter(err => err.field !== fieldName));
    if (error) setError(null);
    if (successMessage) setSuccessMessage(null);
  };

  // تابع مدیریت تغییر فیلدها
  const handleFieldChange = (fieldName: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    clearFieldError(fieldName);
    
    // اعتبارسنجی بلادرنگ
    if (value.trim()) {
      let isValid = true;
      let errorMessage = '';

      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          isValid = validateName(value);
          errorMessage = 'نام باید حداقل ۲ کاراکتر و فقط شامل حروف فارسی باشد';
          break;
        case 'email':
          isValid = validateEmail(value.trim());
          errorMessage = 'فرمت ایمیل صحیح نیست';
          break;
        case 'phone':
          isValid = validatePhone(value);
          errorMessage = 'فرمت شماره موبایل صحیح نیست';
          break;
        case 'password':
          isValid = validatePassword(value);
          errorMessage = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
          break;
        case 'confirmPassword':
          isValid = value === formData.password;
          errorMessage = 'رمز عبور و تکرار آن مطابقت ندارند';
          break;
      }

      if (!isValid) {
        setValidationErrors(prev => [
          ...prev.filter(err => err.field !== fieldName),
          { field: fieldName, message: errorMessage }
        ]);
      }
    }
  };

  // تابع ارسال فرم
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // پاک کردن پیام‌های قبلی
    setError(null);
    setSuccessMessage(null);
    setValidationErrors([]);

    // اعتبارسنجی فرم
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\s|-/g, ''),
        password: formData.password,
      });

      if (response.success) {
        setSuccessMessage('ثبت نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...');
        
        // انتقال به صفحه ورود بعد از 2 ثانیه
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } else {
        const errorMessage = getErrorMessage(response.error || 'Unknown error');
        setError(errorMessage);
      }
      
    } catch (err) {
      console.error('Registration error:', err);
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
  const isFieldValid = (fieldName: keyof FormData): boolean => {
    const value = formData[fieldName];
    if (!value.trim()) return false;

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return validateName(value) && !getFieldError(fieldName);
      case 'email':
        return validateEmail(value.trim()) && !getFieldError(fieldName);
      case 'phone':
        return validatePhone(value) && !getFieldError(fieldName);
      case 'password':
        return validatePassword(value) && !getFieldError(fieldName);
      case 'confirmPassword':
        return value === formData.password && !getFieldError(fieldName);
      default:
        return true;
    }
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
        className="w-full max-w-lg p-8 rounded-2xl"
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
            ثبت نام در سامانه
          </h2>
          <p className="text-sm opacity-70 mt-2">برای ایجاد حساب کاربری، اطلاعات خود را وارد کنید</p>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ردیف نام و نام خانوادگی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* فیلد نام */}
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  className={`w-full px-4 py-3 pr-12 pl-14 rounded-xl border-none outline-none transition-all ${
                    getFieldError('firstName') ? 'ring-2 ring-red-500/50' : 
                    isFieldValid('firstName') ? 'ring-2 ring-green-500/50' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                  }}
                  placeholder="نام"
                  value={formData.firstName}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  autoComplete="given-name"
                />
                {/* آیکن وضعیت */}
                {formData.firstName.trim() && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {isFieldValid('firstName') ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {getFieldError('firstName') && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs pr-2 flex items-center gap-1"
                >
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  {getFieldError('firstName')}
                </motion.p>
              )}
            </div>

            {/* فیلد نام خانوادگی */}
            <div className="space-y-2">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  className={`w-full px-4 py-3 pr-12 pl-14 rounded-xl border-none outline-none transition-all ${
                    getFieldError('lastName') ? 'ring-2 ring-red-500/50' : 
                    isFieldValid('lastName') ? 'ring-2 ring-green-500/50' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-color)',
                    boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                  }}
                  placeholder="نام خانوادگی"
                  value={formData.lastName}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  autoComplete="family-name"
                />
                {/* آیکن وضعیت */}
                {formData.lastName.trim() && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    {isFieldValid('lastName') ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {getFieldError('lastName') && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs pr-2 flex items-center gap-1"
                >
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  {getFieldError('lastName')}
                </motion.p>
              )}
            </div>
          </div>

          {/* فیلد ایمیل */}
          <div className="space-y-2">
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                className={`w-full px-4 py-3 pr-12 pl-14 rounded-xl border-none outline-none transition-all ${
                  getFieldError('email') ? 'ring-2 ring-red-500/50' : 
                  isFieldValid('email') ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="ایمیل"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                autoComplete="email"
                dir="ltr"
              />
              {/* آیکن وضعیت */}
              {formData.email.trim() && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  {isFieldValid('email') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
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

          {/* فیلد شماره موبایل */}
          <div className="space-y-2">
            <div className="relative">
              <PhoneIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="tel"
                className={`w-full px-4 py-3 pr-12 pl-14 rounded-xl border-none outline-none transition-all ${
                  getFieldError('phone') ? 'ring-2 ring-red-500/50' : 
                  isFieldValid('phone') ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="شماره موبایل (09123456789)"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                autoComplete="tel"
                dir="ltr"
              />
              {/* آیکن وضعیت */}
              {formData.phone.trim() && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  {isFieldValid('phone') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {getFieldError('phone') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm pr-2 flex items-center gap-1"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                {getFieldError('phone')}
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
                  isFieldValid('password') ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="رمز عبور (حداقل ۸ کاراکتر)"
                value={formData.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                autoComplete="new-password"
              />
              
              {/* آیکن وضعیت */}
              {formData.password && (
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

          {/* فیلد تکرار رمز عبور */}
          <div className="space-y-2">
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`w-full px-4 py-3 pr-12 pl-20 rounded-xl border-none outline-none transition-all ${
                  getFieldError('confirmPassword') ? 'ring-2 ring-red-500/50' : 
                  isFieldValid('confirmPassword') ? 'ring-2 ring-green-500/50' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-color)',
                  boxShadow: 'inset 2px 2px 6px var(--shadow-light), inset -2px -2px 6px var(--shadow-dark)',
                }}
                placeholder="تکرار رمز عبور"
                value={formData.confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                autoComplete="new-password"
              />
              
              {/* آیکن وضعیت */}
              {formData.confirmPassword && (
                <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10">
                  {isFieldValid('confirmPassword') ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
              
              {/* دکمه نمایش/مخفی کردن رمز */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-70 transition-opacity z-20"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {getFieldError('confirmPassword') && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm pr-2 flex items-center gap-1"
              >
                <ExclamationTriangleIcon className="w-4 h-4" />
                {getFieldError('confirmPassword')}
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

          {/* پیام موفقیت */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-500 text-center text-sm p-3 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {successMessage}
            </motion.div>
          )}

          {/* دکمه ثبت نام */}
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
                <span>در حال ثبت نام...</span>
              </div>
            ) : (
              'ثبت نام'
            )}
          </motion.button>
        </form>

        {/* لینک ورود */}
        <div className="mt-6 text-center text-sm">
          <p className="opacity-70">
            قبلاً ثبت نام کرده‌اید؟{' '}
            <Link 
              href="/login" 
              className="font-bold hover:underline transition-colors"
              style={{ color: 'var(--accent-color)' }}
            >
              وارد شوید
            </Link>
          </p>
        </div>

        {/* راهنمایی */}
        <div className="mt-4 text-center text-xs opacity-60">
          <p>با ثبت نام، شما قوانین و مقررات سایت را می‌پذیرید</p>
        </div>
      </motion.div>
    </div>
  );
}
