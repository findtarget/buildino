// src/components/CustomDatePicker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { toPersianDigits, toEnglishDigits, gregorianToJalali, jalaliToGregorian } from '@/lib/utils';
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
  const [inputValue, setInputValue] = useState('');
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

    // تنظیم مقدار input
    if (value) {
      const formattedDate = formatDateDisplay(value);
      setInputValue(formattedDate);
    } else {
      setInputValue('');
    }
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
    if (!date) return '';
    try {
      const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return `${toPersianDigits(jy.toString())}/${toPersianDigits(String(jm).padStart(2, '0'))}/${toPersianDigits(String(jd).padStart(2, '0'))}`;
    } catch {
      return 'تاریخ نامعتبر';
    }
  };

  // پردازش ورودی دستی
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // بررسی فرمت تاریخ شمسی
    const englishValue = toEnglishDigits(newValue);
    const datePattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    const match = englishValue.match(datePattern);

    if (match) {
      const [, year, month, day] = match;
      const jy = parseInt(year);
      const jm = parseInt(month);
      const jd = parseInt(day);

      // اعتبارسنجی تاریخ شمسی
      if (jy >= 1300 && jy <= 1500 && jm >= 1 && jm <= 12 && jd >= 1 && jd <= 31) {
        try {
          const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
          const gregorianDate = new Date(gy, gm - 1, gd);
          onChange(gregorianDate);
        } catch (error) {
          console.error('خطا در تبدیل تاریخ:', error);
        }
      }
    } else if (englishValue === '') {
      onChange(null);
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

    try {
      // تبدیل تاریخ شمسی انتخاب شده به میلادی
      const [gy, gm, gd] = jalaliToGregorian(currentJalaliYear, currentJalaliMonth, day);
      const selectedDateObj = new Date(gy, gm - 1, gd);
      
      onChange(selectedDateObj);
      
      // به‌روزرسانی input value
      const formattedDate = formatDateDisplay(selectedDateObj);
      setInputValue(formattedDate);
      
      setIsOpen(false);
    } catch (error) {
      console.error('خطا در انتخاب تاریخ:', error);
    }
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

  // بررسی آیا امروز است
  const isToday = (day: number | null): boolean => {
    if (!day) return false;
    return (day === today.day && currentJalaliMonth === today.month && currentJalaliYear === today.year);
  };

  // نمایش ماه و سال
  const displayMonthYear = (): string => {
    return `${getPersianMonths()[currentJalaliMonth - 1]} ${toPersianDigits(currentJalaliYear.toString())}`;
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Date Field */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-3 pr-10 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-right placeholder:text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ fontFamily: 'inherit' }}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-[var(--border-color)] z-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <h3 className="font-semibold text-center flex-1">{displayMonthYear()}</h3>

            <button
              onClick={() => changeMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {getPersianWeekdays().map((day, index) => (
              <div key={index} className="text-center text-sm font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days of Month */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => selectDay(day)}
                disabled={day === null}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${day === null ? 'invisible' : 'hover:bg-gray-100'}
                  ${isSelectedDay(day) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${isToday(day) && !isSelectedDay(day) ? 'bg-gray-200 font-semibold' : ''}
                `}
              >
                {day && toPersianDigits(day.toString())}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
