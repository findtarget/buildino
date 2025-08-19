// src/components/CustomDatePicker.tsx
'use client';

import DatePicker, { Day } from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { toPersianDigits, dayToString } from '@/lib/utils';
import { useCallback } from 'react'; // F: [اصلاح اصلی] ایمپورت useCallback

interface CustomDatePickerProps {
  value: Day | null;
  onChange: (day: Day | null) => void;
  placeholder?: string;
  disabled?: boolean;
  themeColors: { accent: string };
}

const defaultTheme = { accent: '#4f46e5' };

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
  themeColors = defaultTheme,
}: CustomDatePickerProps) {

  // F: [اصلاح اصلی] این تابع حساس‌ترین بخش بود. با قرار دادن آن در useCallback،
  // از ساخته شدن مجدد آن در هر رندر جلوگیری می‌کنیم. این کار جلوی خطای
  // removeEventListener را می‌گیرد زیرا کتابخانه تقویم دیگر تلاش نمی‌کند
  // کامپوننت اینپوت را بی‌دلیل تخریب و بازسازی کند.
  const renderCustomInput = useCallback(({ ref }: { ref: any }) => (
    <div className="relative">
      <input
        ref={ref}
        readOnly
        disabled={disabled}
        value={value ? toPersianDigits(dayToString(value)!) : ''}
        placeholder={placeholder}
        className="p-2 w-full rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50 cursor-pointer text-right"
        aria-label={placeholder}
      />
      <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  ), [value, disabled, placeholder]); // F: وابستگی‌ها به درستی تعریف شده‌اند

  return (
    <DatePicker
      value={value}
      onChange={onChange}
      renderInput={renderCustomInput}
      locale="fa"
      shouldHighlightWeekends
      // F: [اصلاح] این کلاس به ما اجازه می‌دهد تا پاپ‌آپ تقویم را از جریان صفحه خارج کنیم
      calendarClassName="responsive-calendar z-[9999]" 
      colorPrimary={themeColors.accent}
      calendarTodayClassName="today"
    />
  );
}
