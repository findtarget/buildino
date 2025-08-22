// src/components/TransactionFormModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types/index.d';
import { toPersianDigits, formatJalaliDate, parseJalaliDate, toEnglishDigits, formatCurrency } from '@/lib/utils';
import dynamic from 'next/dynamic';

const CustomDatePicker = dynamic(() => import('@/components/CustomDatePicker'), { ssr: false });

interface UnitInfo {
  id: number;
  unitNumber: string;
}

type TransactionFormData = Omit<Transaction, 'id' | 'date' | 'amount'> & {
  date: Date | null;
  amount: string;
};

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  initialData: Transaction | null;
  transactionType: 'Income' | 'Expense';
  unitsList: UnitInfo[];
}

const expenseCategories = ['Repairs', 'Utilities', 'Salaries', 'Cleaning', 'Miscellaneous'];
const incomeCategories = ['MonthlyCharge', 'ParkingRental', 'MiscellaneousIncome'];
const categoryTranslations: { [key: string]: string } = {
  Repairs: 'تعمیرات و نگهداری', Utilities: 'هزینه قبوض و مشاعات', Salaries: 'حقوق و دستمزد', Cleaning: 'نظافت', Miscellaneous: 'هزینه‌های متفرقه',
  MonthlyCharge: 'شارژ ماهانه', ParkingRental: 'درآمد اجاره پارکینگ', MiscellaneousIncome: 'درآمد متفرقه'
};

export default function TransactionFormModal({
  isOpen, onClose, onSubmit, initialData, transactionType, unitsList,
}: TransactionFormModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    title: '', amount: '', type: transactionType, category: transactionType === 'Income' ? 'MonthlyCharge' : 'Repairs', date: new Date(),
    relatedUnitId: undefined, isCharge: false, description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setFormData({
          ...initialData,
          amount: formatCurrency(initialData.amount).replace(' تومان', ''),
          relatedUnitId: initialData.relatedUnitId ?? undefined,
          date: initialData.date ? parseJalaliDate(initialData.date) : null,
        });
      } else {
        setFormData({
          title: '', amount: '', type: transactionType, category: transactionType === 'Income' ? 'MonthlyCharge' : 'Repairs',
          date: new Date(), relatedUnitId: undefined, isCharge: false, description: '',
        });
      }
    }
  }, [isOpen, initialData, transactionType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // حذف همه چیز غیر از اعداد فارسی و انگلیسی
    const cleanValue = value.replace(/[^\d۰-۹]/g, '');
    const englishValue = toEnglishDigits(cleanValue);
    
    if (englishValue) {
      const numericValue = parseInt(englishValue);
      const formattedValue = new Intl.NumberFormat('fa-IR').format(numericValue);
      setFormData(prev => ({ ...prev, amount: toPersianDigits(formattedValue) }));
    } else {
      setFormData(prev => ({ ...prev, amount: '' }));
    }

    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'عنوان تراکنش نمی‌تواند خالی باشد.';
    
    const numericAmount = parseFloat(toEnglishDigits(formData.amount.replace(/,/g, '')));
    if (!formData.amount || isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = 'مبلغ باید یک عدد مثبت باشد.';
    }
    
    if (!formData.date) newErrors.date = 'انتخاب تاریخ الزامی است.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // تبدیل تاریخ به فرمت شمسی قبل از ارسال
    const jalaliDate = formatJalaliDate(formData.date!);
    const numericAmount = parseFloat(toEnglishDigits(formData.amount.replace(/,/g, '')));

    onSubmit({
      ...formData,
      amount: numericAmount,
      relatedUnitId: formData.relatedUnitId ? parseInt(String(formData.relatedUnitId)) : undefined,
      date: jalaliDate, // ارسال تاریخ به فرمت شمسی
    });
    onClose();
  };

  const modalTitle = `${initialData ? 'ویرایش' : 'ثبت'} ${transactionType === 'Income' ? 'درآمد' : 'هزینه'}`;
  const submitButtonClass = transactionType === 'Income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600';
  const categories = transactionType === 'Income' ? incomeCategories : expenseCategories;

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
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[var(--text-color)]">{modalTitle}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                    عنوان تراکنش
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200"
                    placeholder="عنوان تراکنش را وارد کنید"
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                      مبلغ (تومان)
                    </label>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleAmountChange}
                      className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200"
                      placeholder="۰"
                    />
                    {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                      تاریخ
                    </label>
                    <CustomDatePicker
                      value={formData.date}
                      onChange={handleDateChange}
                      placeholder="انتخاب تاریخ"
                    />
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                    دسته‌بندی
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {categoryTranslations[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                    واحد مرتبط (اختیاری)
                  </label>
                  <select
                    name="relatedUnitId"
                    value={formData.relatedUnitId || ''}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200"
                  >
                    <option value="">بدون واحد مرتبط</option>
                    {unitsList.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        واحد {toPersianDigits(unit.unitNumber)}
                      </option>
                    ))}
                  </select>
                </div>

                {transactionType === 'Expense' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isCharge"
                      checked={formData.isCharge}
                      onChange={(e) => setFormData(prev => ({ ...prev, isCharge: e.target.checked }))}
                      className="w-5 h-5 text-[var(--accent-color)] bg-[var(--bg-color)] border-[var(--border-color)] rounded focus:ring-[var(--accent-color)] focus:ring-2"
                    />
                    <label className="text-sm font-medium text-[var(--text-color)]">
                      هزینه شارژ است
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-all duration-200 resize-none"
                    placeholder="توضیحات اضافی در صورت نیاز..."
                  />
                </div>

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
                    className={`flex-1 px-6 py-3 ${submitButtonClass} text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
                  >
                    ذخیره
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
