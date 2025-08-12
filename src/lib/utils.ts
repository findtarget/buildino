// src/lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Day } from 'react-modern-calendar-datepicker';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toPersianDigits = (n: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

// F: [اصلاح] تابع کمکی برای تبدیل آبجکت Day به رشته "YYYY/MM/DD"
export const dayToString = (day: Day | null): string | null => {
  if (!day) return null;
  return `${day.year}/${String(day.month).padStart(2, '0')}/${String(day.day).padStart(2, '0')}`;
};

// F: [اصلاح] تابع کمکی برای تبدیل رشته تاریخ "YYYY/MM/DD" به آبجکت Day
export const stringToDay = (dateStr: string | null | undefined): Day | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return { year, month, day };
};
