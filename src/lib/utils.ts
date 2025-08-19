// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as formatJalali, parse as parseJalali } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toPersianDigits = (n: string | number): string => {
  if (n === null || n === undefined) return '';
  const numStr = String(n);
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return numStr.replace(/[0-9]/g, (w) => persianDigits[+w]);
};

// F: [راه حل نهایی] تابع جدید برای فرمت کردن تاریخ شمسی
// ورودی: آبجکت Date جاوااسکریپت
// خروجی: رشته تاریخ شمسی مانند "۱۴۰۳/۰۵/۲۸"
export const formatJalaliDate = (date: Date | null): string => {
  if (!date) return '';
  // 'yyyy/MM/dd' فرمت خروجی را مشخص میکند
  return formatJalali(date, 'yyyy/MM/dd', { locale: faIR });
};

// F: [راه حل نهایی] تابع جدید برای تبدیل رشته تاریخ شمسی به آبجکت Date
// ورودی: رشته تاریخ شمسی مانند "1403/05/28"
// خروجی: آبجکت Date جاوااسکریپت
export const parseJalaliDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  try {
    // 'yyyy/MM/dd' فرمت ورودی را مشخص میکند
    const parsedDate = parseJalali(dateStr, 'yyyy/MM/dd', new Date());
    // بررسی میکنیم که تاریخ معتبر باشد
    if (isNaN(parsedDate.getTime())) return null;
    return parsedDate;
  } catch (error) {
    return null;
  }
};