// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types/index.d';
import { UnitChargeInfo, ChargeCategory, ChargeCalculation, MonthlyChargeRecord } from '@/types/charge';
import { toPersianDigits, formatJalaliDate } from '@/lib/utils';
import { defaultChargeCategories, calculateBulkCharges } from '@/lib/chargeCalculator';
import { format as formatJalali } from 'date-fns-jalali';
import dynamic from 'next/dynamic';
import { useChargeSettings } from '@/app/context/ChargeSettingsContext';

const CustomDatePicker = dynamic(() => import('@/components/CustomDatePicker'), { ssr: false });

interface MonthlyChargeFormData {
  chargeDate: Date | null;
  selectedUnits: number[];
  selectedCategories: string[];
  description: string;
}

interface MonthlyChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactions: Transaction[]) => void;
  unitsList: UnitChargeInfo[];
  existingTransactions: Transaction[];
}

export default function MonthlyChargeModal({
  isOpen,
  onClose,
  onSubmit,
  unitsList = [],
  existingTransactions = []
}: MonthlyChargeModalProps) {
  const { getCurrentYearSettings } = useChargeSettings();
  const currentSettings = getCurrentYearSettings();

  const [formData, setFormData] = useState<MonthlyChargeFormData>({
    chargeDate: new Date(),
    selectedUnits: [],
    selectedCategories: ['maintenance', 'cleaning', 'security', 'utilities', 'management'],
    description: '',
  });
  const [calculations, setCalculations] = useState<ChargeCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<'selection' | 'preview' | 'summary'>('selection');
  const [chargeConflicts, setChargeConflicts] = useState<number[]>([]);

  // تبدیل units به UnitChargeInfo اگه ساختار متفاوت باشه
  const normalizedUnits: UnitChargeInfo[] = unitsList.map(unit => {
    // اگه قبلاً UnitChargeInfo هست، همونطور برگردون
    if ('area' in unit && 'ownerType' in unit) {
      return unit as UnitChargeInfo;
    }
    
    // اگه Unit معمولی هست، تبدیل کن
    return {
      id: unit.id,
      unitNumber: unit.unitNumber || 'نامشخص',
      area: unit.area || 100, // مقدار پیش‌فرض
      ownerType: unit.status === 'OwnerOccupied' ? 'owner' : 'tenant',
      hasParking: unit.hasParking || false,
      parkingCount: unit.parkingCount || 0,
      isCommercial: unit.isCommercial || false,
      floorCoefficient: unit.floorCoefficient || 1.0,
      balconyArea: unit.balconyArea || 0,
    } as UnitChargeInfo;
  });

  // دسته‌های فعال بر اساس تنظیمات
  const activeCategories = defaultChargeCategories
    .filter(cat => currentSettings.categories[cat.id]?.isActive !== false)
    .map(cat => ({
      ...cat,
      baseAmount: currentSettings.categories[cat.id]?.baseAmount ?? cat.baseAmount
    }));

  // بررسی تداخل شارژ برای ماه جاری
  useEffect(() => {
    if (formData.chargeDate && formData.selectedUnits.length > 0) {
      const currentMonth = formatJalali(formData.chargeDate, 'yyyy/MM');
      const conflictingUnits = formData.selectedUnits.filter(unitId => {
        return existingTransactions.some(transaction =>
          transaction.relatedUnitId === unitId &&
          transaction.isCharge &&
          transaction.date.startsWith(currentMonth)
        );
      });
      setChargeConflicts(conflictingUnits);
    } else {
      setChargeConflicts([]);
    }
  }, [formData.chargeDate, formData.selectedUnits, existingTransactions]);

  // محاسبه شارژها با استفاده از تنظیمات
  useEffect(() => {
    if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0 && normalizedUnits.length > 0) {
      const validUnits = formData.selectedUnits.filter(unitId => !chargeConflicts.includes(unitId));
      if (validUnits.length > 0) {
        try {
          const selectedActiveCategories = activeCategories.filter(cat =>
            formData.selectedCategories.includes(cat.id)
          );

          const newCalculations = calculateBulkCharges(
            normalizedUnits,
            selectedActiveCategories,
            formData.selectedCategories,
            validUnits
          );
          setCalculations(newCalculations);
        } catch (error) {
          console.error('خطا در محاسبه شارژ:', error);
          setCalculations([]);
        }
      } else {
        setCalculations([]);
      }
    } else {
      setCalculations([]);
    }
  }, [formData.selectedUnits, formData.selectedCategories, normalizedUnits, chargeConflicts, activeCategories]);

  // بازنشانی فرم هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      const defaultSelectedCategories = activeCategories
        .filter(cat => currentSettings.categories[cat.id]?.isActive !== false)
        .map(cat => cat.id);

      setFormData({
        chargeDate: new Date(),
        selectedUnits: [],
        selectedCategories: defaultSelectedCategories,
        description: '',
      });
      setActiveTab('selection');
      setCalculations([]);
      setChargeConflicts([]);
    }
  }, [isOpen, currentSettings]);

  const handleUnitSelection = (unitId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter(id => id !== unitId)
        : [...prev.selectedUnits, unitId]
    }));
  };

  const handleCategorySelection = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  };

  const filterUnits = (filter: 'all' | 'residential' | 'commercial' | 'owner' | 'tenant') => {
    let filteredIds: number[] = [];

    switch (filter) {
      case 'all':
        filteredIds = normalizedUnits.map(u => u.id);
        break;
      case 'residential':
        filteredIds = normalizedUnits.filter(u => !u.isCommercial).map(u => u.id);
        break;
      case 'commercial':
        filteredIds = normalizedUnits.filter(u => u.isCommercial).map(u => u.id);
        break;
      case 'owner':
        filteredIds = normalizedUnits.filter(u => u.ownerType === 'owner').map(u => u.id);
        break;
      case 'tenant':
        filteredIds = normalizedUnits.filter(u => u.ownerType === 'tenant').map(u => u.id);
        break;
    }

    setFormData(prev => ({ ...prev, selectedUnits: filteredIds }));
  };

  const handleSubmit = () => {
    if (calculations.length === 0 || !formData.chargeDate) return;

    const jalaliDate = formatJalaliDate(formData.chargeDate);
    const currentMonth = formatJalali(formData.chargeDate, 'MMMM');
    const currentYear = toPersianDigits(formatJalali(formData.chargeDate, 'yyyy'));

    const chargeTransactions: Transaction[] = calculations.map(calc => ({
      id: Date.now() + calc.unitId,
      title: `شارژ ماه ${currentMonth} ${currentYear}`,
      type: 'Income' as const,
      category: 'MonthlyCharge' as const,
      amount: calc.totalAmount,
      date: jalaliDate,
      relatedUnitId: calc.unitId,
      isCharge: true,
      description: formData.description || calc.breakdown.join(' - '),
    }));

    onSubmit(chargeTransactions);
    onClose();
  };

  const totalAmount = calculations.reduce((sum, calc) => sum + calc.totalAmount, 0);
  const selectedUnitsData = normalizedUnits.filter(unit => formData.selectedUnits.includes(unit.id));
  const availableUnitsData = selectedUnitsData.filter(unit => !chargeConflicts.includes(unit.id));

  const currentMonth = formData.chargeDate ? formatJalali(formData.chargeDate, 'MMMM') : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formatJalali(formData.chargeDate, 'yyyy')) : '';

  // Debug log
  console.log('Units Data:', { unitsList, normalizedUnits, selectedUnitsData });

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
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] w-full max-w-6xl h-[95vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] flex-shrink-0">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                  صدور شارژ ماهانه - {currentMonth} {currentYear}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors">
                  <svg className="w-5 h-5 text-[var(--text-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-color)] flex-shrink-0">
                {[
                  { id: 'selection', title: 'انتخاب واحدها و هزینه‌ها', icon: '⚙️' },
                  { id: 'preview', title: 'پیش‌نمایش محاسبات', icon: '📊' },
                  { id: 'summary', title: 'خلاصه نهایی', icon: '📋' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-[var(--bg-secondary)]'
                        : 'text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <span className="ml-2">{tab.icon}</span>
                    {tab.title}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'selection' && (
                  <div className="space-y-6">
                    {/* تاریخ شارژ */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                        تاریخ شارژ
                      </label>
                      <div className="w-64">
                        <CustomDatePicker
                          value={formData.chargeDate}
                          onChange={(date) => setFormData(prev => ({ ...prev, chargeDate: date }))}
                        />
                      </div>
                    </div>

                    {/* نمایش تنظیمات فعلی */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                      <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        📋 تنظیمات فعلی شارژ (سال {toPersianDigits(currentSettings.year)})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="text-blue-600 dark:text-blue-400">
                          دسته‌های فعال: {toPersianDigits(activeCategories.length.toString())}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          ضریب تجاری: {toPersianDigits(currentSettings.coefficients?.commercial?.toString() || '1.5')}×
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          مجموع پایه: {toPersianDigits(Math.round(activeCategories.reduce((sum, cat) => sum + cat.baseAmount, 0) / 1000).toString())}K ت
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          واحدهای موجود: {toPersianDigits(normalizedUnits.length.toString())}
                        </div>
                      </div>
                    </div>

                    {/* انتخاب واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-semibold text-[var(--text-color)]">
                          انتخاب واحدها ({toPersianDigits(formData.selectedUnits.length)} از {toPersianDigits(normalizedUnits.length)})
                        </label>
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => filterUnits('all')}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            همه
                          </button>
                          <button
                            onClick={() => filterUnits('residential')}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                          >
                            مسکونی
                          </button>
                          <button
                            onClick={() => filterUnits('commercial')}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                          >
                            تجاری
                          </button>
                          <button
                            onClick={() => filterUnits('owner')}
                            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                          >
                            مالک
                          </button>
                          <button
                            onClick={() => filterUnits('tenant')}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            مستاجر
                          </button>
                        </div>
                      </div>

                      {normalizedUnits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          هیچ واحدی یافت نشد
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-64 overflow-y-auto">
                          {normalizedUnits.map((unit) => {
                            const isSelected = formData.selectedUnits.includes(unit.id);
                            const hasConflict = chargeConflicts.includes(unit.id);
                            
                            return (
                              <div
                                key={unit.id}
                                onClick={() => handleUnitSelection(unit.id)}
                                className={`
                                  p-3 rounded-lg border-2 cursor-pointer transition-all
                                  ${isSelected 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                  }
                                  ${hasConflict 
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 cursor-not-allowed' 
                                    : ''
                                  }
                                `}
                              >
                                <div className="text-sm font-semibold text-[var(--text-color)] mb-1">
                                  واحد {toPersianDigits(unit.unitNumber)}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                  <div>متراژ: {toPersianDigits(unit.area)} متر</div>
                                  <div>نوع: {unit.ownerType === 'owner' ? 'مالک' : 'مستاجر'}</div>
                                  {unit.isCommercial && (
                                    <div className="text-purple-600 dark:text-purple-400">تجاری</div>
                                  )}
                                  {unit.hasParking && (
                                    <div className="text-green-600 dark:text-green-400">
                                      پارکینگ: {toPersianDigits(unit.parkingCount)}
                                    </div>
                                  )}
                                  {hasConflict && (
                                    <div className="text-red-600 dark:text-red-400 text-xs">
                                      تداخل شارژ
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* انتخاب دسته‌های هزینه */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-4">
                        دسته‌های هزینه ({toPersianDigits(formData.selectedCategories.length)} از {toPersianDigits(activeCategories.length)})
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeCategories.map((category) => {
                          const isSelected = formData.selectedCategories.includes(category.id);
                          return (
                            <div
                              key={category.id}
                              onClick={() => handleCategorySelection(category.id)}
                              className={`
                                p-3 rounded-lg border cursor-pointer transition-all
                                ${isSelected 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }
                              `}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-semibold text-[var(--text-color)] mb-1">
                                    {category.title}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {category.description}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-[var(--text-color)]">
                                  {toPersianDigits((category.baseAmount / 1000).toFixed(0))}K
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* توضیحات اضافی */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                        توضیحات اضافی
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="توضیحات اضافی برای شارژ این ماه..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="space-y-6">
                    {calculations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">
                          محاسبه‌ای موجود نیست
                        </h3>
                        <p className="text-gray-500">
                          لطفاً واحدها و دسته‌های هزینه را انتخاب کنید
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">
                            📊 پیش‌نمایش محاسبات شارژ
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-blue-600 dark:text-blue-400">
                              تعداد واحد: {toPersianDigits(availableUnitsData.length)}
                            </div>
                            <div className="text-green-600 dark:text-green-400">
                              دسته‌ها: {toPersianDigits(formData.selectedCategories.length)}
                            </div>
                            <div className="text-purple-600 dark:text-purple-400">
                              مجموع درآمد: {toPersianDigits((totalAmount / 1000000).toFixed(1))}M ت
                            </div>
                            <div className="text-orange-600 dark:text-orange-400">
                              متوسط واحد: {toPersianDigits(Math.round(totalAmount / Math.max(availableUnitsData.length, 1) / 1000))}K ت
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          {calculations.map((calc) => {
                            const unit = normalizedUnits.find(u => u.id === calc.unitId);
                            return (
                              <div
                                key={calc.unitId}
                                className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-[var(--text-color)]">
                                      واحد {toPersianDigits(calc.unitNumber)}
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {unit && (
                                        <>
                                          متراژ: {toPersianDigits(unit.area)} متر
                                          {unit.balconyArea && unit.balconyArea > 0 && (
                                            <span> + {toPersianDigits(unit.balconyArea)} بالکن</span>
                                          )}
                                          {unit.isCommercial && <span> • تجاری</span>}
                                          {unit.hasParking && (
                                            <span> • پارکینگ: {toPersianDigits(unit.parkingCount)}</span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {toPersianDigits(calc.totalAmount.toLocaleString())} ت
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                  {calc.breakdown.map((item, index) => (
                                    <div key={index}>{item}</div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-[var(--text-color)] mb-4">
                        آماده صدور شارژ ماهانه
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 max-w-md mx-auto">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {toPersianDigits(totalAmount.toLocaleString())} تومان
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          برای {toPersianDigits(calculations.length)} واحد
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                        <h4 className="font-semibold text-[var(--text-color)] mb-3">
                          📊 خلاصه آمار
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>تعداد واحد:</span>
                            <span className="font-semibold">{toPersianDigits(calculations.length)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>دسته‌های هزینه:</span>
                            <span className="font-semibold">{toPersianDigits(formData.selectedCategories.length)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>متوسط هر واحد:</span>
                            <span className="font-semibold">
                              {toPersianDigits(Math.round(totalAmount / Math.max(calculations.length, 1)).toLocaleString())} ت
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span>مجموع کل:</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              {toPersianDigits(totalAmount.toLocaleString())} ت
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                        <h4 className="font-semibold text-[var(--text-color)] mb-3">
                          📋 جزئیات شارژ
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>تاریخ شارژ:</span>
                            <span className="font-semibold">
                              {formData.chargeDate ? formatJalaliDate(formData.chargeDate) : 'نامشخص'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>دوره شارژ:</span>
                            <span className="font-semibold">{currentMonth} {currentYear}</span>
                          </div>
                          {chargeConflicts.length > 0 && (
                            <div className="text-red-600 dark:text-red-400 text-xs mt-2">
                              تداخل شارژ: {toPersianDigits(chargeConflicts.length)} واحد
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--border-color)] p-6 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {calculations.length > 0 && (
                      <span>
                        مجموع درآمد: {toPersianDigits(totalAmount.toLocaleString())} تومان
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors"
                    >
                      انصراف
                    </button>

                    {activeTab !== 'summary' && (
                      <button
                        onClick={() => {
                          if (activeTab === 'selection') setActiveTab('preview');
                          else if (activeTab === 'preview') setActiveTab('summary');
                        }}
                        disabled={formData.selectedUnits.length === 0 || formData.selectedCategories.length === 0 || calculations.length === 0}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl transition-colors"
                      >
                        مرحله بعد
                      </button>
                    )}

                    {activeTab === 'summary' && (
                      <button
                        onClick={handleSubmit}
                        disabled={calculations.length === 0}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-semibold"
                      >
                        صدور شارژ ({toPersianDigits(calculations.length)} واحد)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
