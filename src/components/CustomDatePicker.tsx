// src/components/CustomDatePicker.tsx
'use client';

import DatePicker, { Day } from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { toPersianDigits, dayToString } from '@/lib/utils';

interface CustomDatePickerProps {
  value: Day | null;
  onChange: (day: Day | null) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function CustomDatePicker({ value, onChange, placeholder, disabled }: CustomDatePickerProps) {
  // F: [بهینه سازی] رنگ اصلی تم را به صورت ثابت تعریف می‌کنیم تا از useEffect و خطای Hydration جلوگیری شود.
  // این کد دیگر نیازی به useEffect برای خواندن CSS variable ندارد و پایدارتر است.
  const accentColor = '#4f46e5'; 

  const renderCustomInput = ({ ref }: any) => (
    <div className="relative">
      <input
        ref={ref}
        readOnly
        disabled={disabled}
        value={value ? toPersianDigits(dayToString(value) || '') : ''}  // اضافه کردن || '' برای جلوگیری از undefined
        placeholder={placeholder}
        className="p-2 w-full rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50 cursor-pointer"
        style={{ direction: 'ltr', textAlign: 'right' }}
        suppressHydrationWarning  // اگر hydration همچنان issue بود، این رو اضافه کنین (موقتی)

      />
      <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <DatePicker
      value={value}
      onChange={onChange}
      renderInput={renderCustomInput}
      locale="fa"
      shouldHighlightWeekends
      calendarClassName="responsive-calendar"
      colorPrimary={accentColor}
      calendarTodayClassName="today"
    />
  );
}
