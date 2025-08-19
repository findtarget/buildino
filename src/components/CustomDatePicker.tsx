// src/components/CustomDatePicker.tsx
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { faIR } from 'date-fns-jalali/locale';
import { formatJalaliDate, toPersianDigits } from '@/lib/utils';
import { Fragment } from 'react';

interface CustomDatePickerProps {
  value: Date | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
}: CustomDatePickerProps) {

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton className="relative w-full text-right p-2 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]">
            <span className="block truncate">
              {value ? toPersianDigits(formatJalaliDate(value)) : <span className="text-gray-400">{placeholder}</span>}
            </span>
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pr-2">
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            </span>
             {value && !disabled && (
              <span className="absolute inset-y-0 left-10 flex items-center pr-2" onClick={handleClearDate}>
                <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-[var(--accent-color)] cursor-pointer"/>
              </span>
            )}
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <PopoverPanel className="absolute z-10 mt-1 w-auto rounded-md bg-[var(--bg-secondary)] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2 border border-[var(--border-color)]">
              <DayPicker
                mode="single"
                selected={value || undefined}
                onSelect={(date) => {
                  onChange(date);
                  close(); // بستن پاپ‌آپ پس از انتخاب
                }}
                locale={faIR} // F: [راه حل نهایی] استفاده از لوکیل شمسی
                dir="rtl"
                initialFocus
                // استایل‌های css variables برای هماهنگی با تم
                classNames={{
                  caption_label: 'text-[var(--text-color)]',
                  head_cell: 'text-[var(--text-secondary-color)]',
                  day: 'text-[var(--text-color)]',
                  day_today: 'text-[var(--accent-color)] font-bold',
                  day_selected: 'bg-[var(--accent-color)] text-white',
                }}
              />
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
