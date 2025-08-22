// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types/index.d';
import { toPersianDigits, formatJalaliDate, toEnglishDigits } from '@/lib/utils';
import dynamic from 'next/dynamic';

const CustomDatePicker = dynamic(() => import('@/components/CustomDatePicker'), { ssr: false });

interface UnitInfo {
  id: number;
  unitNumber: string;
}

interface MonthlyChargeFormData {
  chargeDate: Date | null;
  baseAmount: string;
  selectedUnits: number[];
  description: string;
}

interface MonthlyChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactions: Transaction[]) => void;
  unitsList: UnitInfo[];
}

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export default function MonthlyChargeModal({
  isOpen,
  onClose,
  onSubmit,
  unitsList,
}: MonthlyChargeModalProps) {
  const [formData, setFormData] = useState<MonthlyChargeFormData>({
    chargeDate: new Date(),
    baseAmount: '',
    selectedUnits: [],
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setFormData({
        chargeDate: new Date(),
        baseAmount: '',
        selectedUnits: [],
        description: '',
      });
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanValue = value.replace(/[^\d۰-۹]/g, '');
    const englishValue = toEnglishDigits(cleanValue);
    
    if (englishValue) {
      const numericValue = parseInt(englishValue);
      const formattedValue = new Intl.NumberFormat('fa-IR').format(numericValue);
      setFormData(prev => ({ ...prev, baseAmount: toPersianDigits(formattedValue) }));
    } else {
      setFormData(prev => ({ ...prev, baseAmount: '' }));
    }

    if (errors.baseAmount) {
      setErrors(prev => ({ ...prev, baseAmount: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, chargeDate: date }));
    if (errors.chargeDate) {
      setErrors(prev => ({ ...prev, chargeDate: '' }));
    }
  };

  const handleUnitSelection = (unitId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter(id => id !== unitId)
        : [...prev.selectedUnits, unitId]
    }));
    if (errors.selectedUnits) {
      setErrors(prev => ({ ...prev, selectedUnits: '' }));
    }
  };

  const handleSelectAll = () => {
    const allUnitIds = unitsList.map(unit => unit.id);
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.length === allUnitIds.length ? [] : allUnitIds
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const numericAmount = parseFloat(toEnglishDigits(formData.baseAmount.replace(/,/g, '')));
    if (!formData.baseAmount || isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.baseAmount = 'مبلغ پایه باید یک عدد مثبت باشد.';
    }
    
    if (!formData.chargeDate) {
      newErrors.chargeDate = 'انتخاب تاریخ الزامی است.';
    }
    
    if (formData.selectedUnits.length === 0) {
      newErrors.selectedUnits = 'حداقل یک واحد باید انتخاب شود.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const jalaliDate = formatJalaliDate(formData.chargeDate!);
    const numericAmount = parseFloat(toEnglishDigits(formData.baseAmount.replace(/,/g, '')));
    const currentMonth = persianMonths[formData.chargeDate!.getMonth()];
    const currentYear = toPersianDigits(formData.chargeDate!.getFullYear().toString());

    // ایجاد تراکنش‌های شارژ برای واحدهای انتخاب شده
    const chargeTransactions: Transaction[] = formData.selectedUnits.map(unitId => {
      const unit = unitsList.find(u => u.id === unitId);
      return {
        id: Date.now() + unitId,
        title: `شارژ ماه ${currentMonth} ${currentYear}`,
        type: 'Income' as const,
        category: 'MonthlyCharge' as const,
        amount: numericAmount,
        date: jalaliDate,
        relatedUnitId: unitId,
        isCharge: true,
        description: formData.description || `شارژ ماهانه واحد ${unit?.unitNumber}`,
      };
    });

    onSubmit(chargeTransactions);
  };

  const currentMonth = formData.chargeDate ? persianMonths[formData.chargeDate.getMonth()] : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formData.chargeDate.getFullYear().toString()) : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ direction: 'rtl' }}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                  صدور شارژ ماهانه - {currentMonth} {currentYear}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                      مبلغ پایه شارژ (تومان)
                    </label>
                    <input
                      type="text"
                      value={formData.baseAmount}
                      onChange={handleAmountChange}
                      className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="۰"
                    />
                    {errors.baseAmount && <p className="text-red-400 text-xs mt-1">{errors.baseAmount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                      تاریخ شارژ
                    </label>
                    <CustomDatePicker
                      value={formData.chargeDate}
                      onChange={handleDateChange}
                      placeholder="انتخاب تاریخ"
                    />
                    {errors.chargeDate && <p className="text-red-400 text-xs mt-1">{errors.chargeDate}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-[var(--text-color)]">
                      انتخاب واحدها ({toPersianDigits(formData.selectedUnits.length.toString())} از {toPersianDigits(unitsList.length.toString())})
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      {formData.selectedUnits.length === unitsList.length ? 'حذف همه' : 'انتخاب همه'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-3 bg-[var(--bg-color)] rounded-xl border border-[var(--border-color)]">
                    {unitsList.map((unit) => (
                      <label
                        key={unit.id}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedUnits.includes(unit.id)}
                          onChange={() => handleUnitSelection(unit.id)}
                          className="w-4 h-4 text-blue-500 bg-[var(--bg-color)] border-[var(--border-color)] rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-sm text-[var(--text-color)]">
                          واحد {toPersianDigits(unit.unitNumber)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.selectedUnits && <p className="text-red-400 text-xs mt-1">{errors.selectedUnits}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                    placeholder="توضیحات اضافی برای شارژ ماهانه..."
                  />
                </div>

                {formData.selectedUnits.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      خلاصه شارژ:
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      تعداد واحد: {toPersianDigits(formData.selectedUnits.length.toString())} واحد
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      مبلغ هر واحد: {formData.baseAmount} تومان
                    </p>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      مجموع درآمد: {
                        formData.baseAmount ? 
                        toPersianDigits(
                          new Intl.NumberFormat('fa-IR').format(
                            parseFloat(toEnglishDigits(formData.baseAmount.replace(/,/g, ''))) * formData.selectedUnits.length
                          )
                        ) + ' تومان' : 
                        '۰ تومان'
                      }
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    صدور شارژ ({toPersianDigits(formData.selectedUnits.length.toString())} واحد)
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
