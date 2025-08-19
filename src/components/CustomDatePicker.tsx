// src/components/CustomDatePicker.tsx
'use client';

import { Fragment } from 'react';
import { Popover, Transition, Portal } from '@headlessui/react';
import { CalendarIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { faIR } from 'date-fns/locale';
import { formatJalaliDate, toPersianDigits } from '@/lib/utils';
// F: [اصلاح نهایی] ایمپورت کتابخانه برای مدیریت موقعیت‌یابی هوشمند
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react';

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
  // F: [اصلاح نهایی] استفاده از هوک useFloating برای محاسبه موقعیت تقویم
  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start', // ترجیحاً پایین و در ابتدای دکمه باز شود
    whileElementsMounted: autoUpdate, // موقعیت را در حین اسکرول/تغییر سایز آپدیت می‌کند
    middleware: [
      offset(8), // 8 پیکسل فاصله از دکمه
      flip(),    // اگر جا نبود، به بالا منتقل می‌شود (هوشمند)
      shift({ padding: 8 }), // از لبه‌های صفحه بیرون نمی‌زند
    ],
  });

  return (
    <Popover className="relative w-full">
      {({ open, close }) => (
        <>
          <Popover.Button
            // F: [اصلاح نهایی] اتصال رفرنس دکمه به کتابخانه موقعیت‌یاب
            ref={refs.setReference}
            disabled={disabled}
            className="p-2 w-full rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] disabled:opacity-50 cursor-pointer text-right flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <span className={value ? 'text-[var(--text-color)]' : 'text-gray-400'}>
              {value ? toPersianDigits(formatJalaliDate(value)!) : placeholder}
            </span>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              {open ? (
                <ChevronUpIcon className="w-4 h-4 ml-1 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 ml-1 text-gray-400" />
              )}
            </div>
          </Popover.Button>

          <Portal>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                // F: [اصلاح نهایی] اتصال رفرنس پنل شناور
                ref={refs.setFloating}
                // F: [اصلاح نهایی] اعمال استایل‌های موقعیت (top, left) و z-index
                style={{ ...floatingStyles, zIndex: 60 }}
                className="shadow-lg rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)]"
              >
                <DayPicker
                  mode="single"
                  selected={value ?? undefined}
                  onSelect={(date) => {
                    onChange(date);
                    close(); // بستن تقویم پس از انتخاب
                  }}
                  locale={faIR}
                  dir="rtl"
                  classNames={{
                    caption_label: 'font-bold',
                    day: 'h-9 w-9 p-0 font-normal rounded-full',
                    day_selected: 'bg-[var(--accent-color)] text-white font-bold',
                    day_today: 'font-bold text-[var(--accent-color)]',
                    head_cell: 'text-sm font-medium text-[var(--text-secondary-color)]',
                  }}
                  formatters={{ formatCaption: (date) => toPersianDigits(formatJalaliDate(date, 'LLLL yyyy')),
                    // F: [اصلاح] این خط اعداد روزها را فارسی می‌کند
                    formatDay: (day) => toPersianDigits(day.getDate()), }}
                />
              </Popover.Panel>
            </Transition>
          </Portal>
        </>
      )}
    </Popover>
  );
}
