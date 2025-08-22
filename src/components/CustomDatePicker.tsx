// src/components/CustomDatePicker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { toPersianDigits, gregorianToJalali, jalaliToGregorian } from '@/lib/utils';
import './jalali-fix.css';

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [currentJalaliYear, setCurrentJalaliYear] = useState(0);
  const [currentJalaliMonth, setCurrentJalaliMonth] = useState(0);

  // تنظیم ماه و سال اولیه بر اساس تاریخ انتخابی یا امروز
  useEffect(() => {
    const dateToUse = value || new Date();
    const [jy, jm] = gregorianToJalali(
      dateToUse.getFullYear(),
      dateToUse.getMonth() + 1,
      dateToUse.getDate()
    );
    setCurrentJalaliYear(jy);
    setCurrentJalaliMonth(jm);
  }, [value]);

  // بستن تقویم با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تبدیل تاریخ به رشته نمایشی
  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return placeholder;
    try {
      const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return `${toPersianDigits(jy.toString())}/${toPersianDigits(String(jm).padStart(2, '0'))}/${toPersianDigits(String(jd).padStart(2, '0'))}`;
    } catch {
      return 'تاریخ نامعتبر';
    }
  };

  // تولید ماه‌های شمسی
  const getPersianMonths = () => [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // تولید روزهای هفته شمسی
  const getPersianWeekdays = () => [
    'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
  ];

  // دریافت تاریخ امروز شمسی
  const getTodayJalali = () => {
    const today = new Date();
    const [jy, jm, jd] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return { year: jy, month: jm, day: jd };
  };

  const today = getTodayJalali();

  // تغییر ماه
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentJalaliMonth === 1) {
        setCurrentJalaliMonth(12);
        setCurrentJalaliYear(currentJalaliYear - 1);
      } else {
        setCurrentJalaliMonth(currentJalaliMonth - 1);
      }
    } else {
      if (currentJalaliMonth === 12) {
        setCurrentJalaliMonth(1);
        setCurrentJalaliYear(currentJalaliYear + 1);
      } else {
        setCurrentJalaliMonth(currentJalaliMonth + 1);
      }
    }
  };

  // تولید روزهای ماه
  const generateCalendarDays = () => {
    // محاسبه تعداد روزهای ماه شمسی
    let daysInMonth = 31;
    if (currentJalaliMonth > 6 && currentJalaliMonth < 12) {
      daysInMonth = 30;
    } else if (currentJalaliMonth === 12) {
      // بررسی سال کبیسه
      const isLeap = ((((((currentJalaliYear - (currentJalaliYear > 0 ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
      daysInMonth = isLeap ? 30 : 29;
    }
    
    // محاسبه اولین روز ماه (روز هفته)
    const [gy, gm, gd] = jalaliToGregorian(currentJalaliYear, currentJalaliMonth, 1);
    const firstDayOfMonth = new Date(gy, gm - 1, gd);
    let startDay = firstDayOfMonth.getDay();
    
    // تبدیل به روز هفته شمسی (شنبه = 0)
    startDay = (startDay + 1) % 7;
    
    const days = [];
    
    // روزهای خالی اول ماه
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // روزهای واقعی ماه
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // انتخاب روز
  const selectDay = (day: number | null) => {
    if (day === null) return;
    
    // تبدیل تاریخ شمسی انتخاب شده به میلادی
    const [gy, gm, gd] = jalaliToGregorian(currentJalaliYear, currentJalaliMonth, day);
    const selectedDateObj = new Date(gy, gm - 1, gd);
    
    onChange(selectedDateObj);
    setIsOpen(false);
  };

  // بررسی آیا روز انتخاب شده است
  const isSelectedDay = (day: number | null): boolean => {
    if (!day || !value) return false;
    
    const [valueJy, valueJm, valueJd] = gregorianToJalali(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate()
    );
    
    return (valueJd === day && valueJm === currentJalaliMonth && valueJy === currentJalaliYear);
  };

  // بررسی آیا روز امروز است
  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    return (day === today.day && currentJalaliMonth === today.month && currentJalaliYear === today.year);
  };

  // نمایش ماه و سال
  const displayMonthYear = (): string => {
    const monthName = getPersianMonths()[currentJalaliMonth - 1];
    return `${monthName} ${toPersianDigits(currentJalaliYear)}`;
  };

  return (
    <div className="relative w-full" ref={popoverRef}>
      {/* فیلد نمایش تاریخ */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`p-3 w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } text-right flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all duration-200 shadow-sm hover:shadow-md`}
      >
        <span className={`text-sm ${value ? 'text-[var(--text-color)]' : 'text-gray-400'}`}>
          {formatDateDisplay(value)}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>

      {/* تقویم */}
      {isOpen && (
        <div className="absolute z-50 mt-2 shadow-2xl rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] right-0 w-[320px] overflow-hidden jalali-calendar">
          <div className="p-4">
            {/* هدر تقویم */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeMonth('next')}
                className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h3 className="text-lg font-bold text-[var(--text-color)]">
                {displayMonthYear()}
              </h3>
              
              <button
                onClick={() => changeMonth('prev')}
                className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* روزهای هفته */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {getPersianWeekdays().map((weekday, index) => (
                <div key={index} className="h-9 flex items-center justify-center text-xs font-medium text-gray-500">
                  {weekday}
                </div>
              ))}
            </div>

            {/* روزهای ماه */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`h-9 flex items-center justify-center text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ${
                    day === null
                      ? 'invisible'
                      : isSelectedDay(day)
                      ? 'bg-[var(--accent-color)] text-white font-bold shadow-md'
                      : isToday(day)
                      ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold border-2 border-[var(--accent-color)]/30'
                      : 'text-[var(--text-color)] hover:bg-[var(--bg-color)]'
                  }`}
                  onClick={() => selectDay(day)}
                >
                  {day !== null ? toPersianDigits(day) : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
