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

// نمونه واحدهای واقعی 20 واحدی
const mockUnitsData: UnitChargeInfo[] = [
  // طبقه همکف (تجاری)
  { id: 1, unitNumber: '001', area: 120, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: true, floorCoefficient: 0.9, balconyArea: 0 },
  { id: 2, unitNumber: '002', area: 80, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: true, floorCoefficient: 0.9, balconyArea: 0 },
  
  // طبقه اول
  { id: 3, unitNumber: '101', area: 95, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 8 },
  { id: 4, unitNumber: '102', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 12 },
  { id: 5, unitNumber: '103', area: 85, ownerType: 'tenant', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.0, balconyArea: 6 },
  { id: 6, unitNumber: '104', area: 105, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.0, balconyArea: 10 },
  
  // طبقه دوم
  { id: 7, unitNumber: '201', area: 95, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 8 },
  { id: 8, unitNumber: '202', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 12 },
  { id: 9, unitNumber: '203', area: 85, ownerType: 'owner', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.1, balconyArea: 6 },
  { id: 10, unitNumber: '204', area: 105, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.1, balconyArea: 10 },
  
  // طبقه سوم
  { id: 11, unitNumber: '301', area: 95, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.2, balconyArea: 8 },
  { id: 12, unitNumber: '302', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.2, balconyArea: 12 },
  { id: 13, unitNumber: '303', area: 85, ownerType: 'tenant', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.2, balconyArea: 6 },
  { id: 14, unitNumber: '304', area: 105, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.2, balconyArea: 10 },
  
  // طبقه چهارم
  { id: 15, unitNumber: '401', area: 95, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 8 },
  { id: 16, unitNumber: '402', area: 110, ownerType: 'owner', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 12 },
  { id: 17, unitNumber: '403', area: 85, ownerType: 'owner', hasParking: false, parkingCount: 0, isCommercial: false, floorCoefficient: 1.3, balconyArea: 6 },
  { id: 18, unitNumber: '404', area: 105, ownerType: 'tenant', hasParking: true, parkingCount: 1, isCommercial: false, floorCoefficient: 1.3, balconyArea: 10 },
  
  // طبقه پنجم (پنت‌هاوس)
  { id: 19, unitNumber: '501', area: 150, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.4, balconyArea: 25 },
  { id: 20, unitNumber: '502', area: 130, ownerType: 'owner', hasParking: true, parkingCount: 2, isCommercial: false, floorCoefficient: 1.4, balconyArea: 20 },
];

export default function MonthlyChargeModal({
  isOpen,
  onClose,
  onSubmit,
  unitsList = mockUnitsData,
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
    if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0) {
      const validUnits = formData.selectedUnits.filter(unitId => !chargeConflicts.includes(unitId));
      if (validUnits.length > 0) {
        // استفاده از دسته‌های بروزرسانی شده
        const selectedActiveCategories = activeCategories.filter(cat => 
          formData.selectedCategories.includes(cat.id)
        );
        
        const newCalculations = calculateBulkCharges(
          unitsList,
          selectedActiveCategories,
          formData.selectedCategories,
          validUnits
        );
        setCalculations(newCalculations);
      } else {
        setCalculations([]);
      }
    } else {
      setCalculations([]);
    }
  }, [formData.selectedUnits, formData.selectedCategories, unitsList, chargeConflicts, activeCategories]);

  // بازنشانی فرم هنگام باز شدن مودال
  useEffect(() => {
    if (isOpen) {
      // انتخاب پیش‌فرض دسته‌های فعال
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
  }, [isOpen, activeCategories, currentSettings]);

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
        filteredIds = unitsList.map(u => u.id);
        break;
      case 'residential':
        filteredIds = unitsList.filter(u => !u.isCommercial).map(u => u.id);
        break;
      case 'commercial':
        filteredIds = unitsList.filter(u => u.isCommercial).map(u => u.id);
        break;
      case 'owner':
        filteredIds = unitsList.filter(u => u.ownerType === 'owner').map(u => u.id);
        break;
      case 'tenant':
        filteredIds = unitsList.filter(u => u.ownerType === 'tenant').map(u => u.id);
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
  const selectedUnitsData = unitsList.filter(unit => formData.selectedUnits.includes(unit.id));
  const availableUnitsData = selectedUnitsData.filter(unit => !chargeConflicts.includes(unit.id));

  const currentMonth = formData.chargeDate ? formatJalali(formData.chargeDate, 'MMMM') : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formatJalali(formData.chargeDate, 'yyyy')) : '';

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
                      </div>
                    </div>

                    {/* انتخاب دسته‌بندی هزینه‌ها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                        انتخاب دسته‌بندی هزینه‌ها ({toPersianDigits(formData.selectedCategories.length)} از {toPersianDigits(activeCategories.length)})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeCategories.map((category) => {
                          const isFromSettings = currentSettings.categories[category.id];
                          return (
                            <label
                              key={category.id}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border border-[var(--border-color)]"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedCategories.includes(category.id)}
                                onChange={() => handleCategorySelection(category.id)}
                                className="mt-1 w-4 h-4 text-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-[var(--text-color)] flex items-center gap-2">
                                  {category.title}
                                  {isFromSettings && (
                                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                                      از تنظیمات
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {category.description}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {category.calculationType === 'fixed' ? 'مبلغ ثابت' : 
                                   category.calculationType === 'perArea' ? 'بر اساس متراژ' : 'بر واحد پارکینگ'}
                                  {category.includeParking && ' • شامل پارکینگ'}
                                  {category.commercialMultiplier > 1 && ` • ضریب تجاری ×${toPersianDigits(category.commercialMultiplier)}`}
                                </div>
                                <div className="text-xs font-medium flex items-center gap-2">
                                  <span className="text-blue-600">
                                    پایه: {toPersianDigits(category.baseAmount.toLocaleString())} تومان
                                    {category.calculationType === 'perArea' && ' / متر'}
                                    {category.calculationType === 'perUnit' && category.includeParking && ' / پارکینگ'}
                                  </span>
                                  {isFromSettings && category.baseAmount !== defaultChargeCategories.find(c => c.id === category.id)?.baseAmount && (
                                    <span className="text-orange-600 text-xs">
                                      (تغییر یافته)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      
                      {activeCategories.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-2xl mb-2">⚠️</div>
                          <div className="text-sm">هیچ دسته‌ای در تنظیمات فعال نیست!</div>
                          <div className="text-xs mt-1">لطفاً ابتدا از منوی تنظیمات، دسته‌های مورد نظر را فعال کنید.</div>
                        </div>
                      )}
                    </div>

                    {/* انتخاب واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-[var(--text-color)]">
                          انتخاب واحدها ({toPersianDigits(formData.selectedUnits.length)} از {toPersianDigits(unitsList.length)})
                        </h3>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => filterUnits('all')} className="px-3 py-1 text-xs bg-blue-500 text-white rounded">همه</button>
                          <button onClick={() => filterUnits('residential')} className="px-3 py-1 text-xs bg-green-500 text-white rounded">مسکونی</button>
                          <button onClick={() => filterUnits('commercial')} className="px-3 py-1 text-xs bg-orange-500 text-white rounded">تجاری</button>
                          <button onClick={() => filterUnits('owner')} className="px-3 py-1 text-xs bg-purple-500 text-white rounded">مالک</button>
                          <button onClick={() => filterUnits('tenant')} className="px-3 py-1 text-xs bg-pink-500 text-white rounded">مستاجر</button>
                        </div>
                      </div>

                      {/* نمایش تداخل شارژ */}
                      {chargeConflicts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="text-red-700 font-medium text-sm">
                            ⚠️ تداخل شارژ: {toPersianDigits(chargeConflicts.length)} واحد قبلاً شارژ شده‌اند
                          </div>
                          <div className="text-red-600 text-xs mt-1">
                            واحدهای {chargeConflicts.map(id => {
                              const unit = unitsList.find(u => u.id === id);
                              return unit ? toPersianDigits(unit.unitNumber) : id;
                            }).join('، ')} در این ماه قبلاً شارژ محاسبه شده‌اند.
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
                        {unitsList.map((unit) => {
                          const hasConflict = chargeConflicts.includes(unit.id);
                          const isSelected = formData.selectedUnits.includes(unit.id);
                          return (
                            <label
                              key={unit.id}
                              className={`flex flex-col p-2 rounded-lg border cursor-pointer transition-all ${
                                hasConflict
                                  ? 'border-red-300 bg-red-50 opacity-50'
                                  : isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleUnitSelection(unit.id)}
                                disabled={hasConflict}
                                className="sr-only"
                              />
                              <div className="text-sm font-medium text-center">
                                {toPersianDigits(unit.unitNumber)}
                                {hasConflict && <span className="text-red-500 text-xs"> (شارژ شده)</span>}
                              </div>
                              <div className="text-xs text-gray-500 text-center mt-1">
                                {toPersianDigits(unit.area)} م²
                                {unit.isCommercial && <span className="text-orange-500"> • تجاری</span>}
                                {unit.hasParking && <span className="text-green-500"> • P{toPersianDigits(unit.parkingCount)}</span>}
                              </div>
                              <div className="text-xs text-gray-400 text-center">
                                {unit.ownerType === 'owner' ? '👤 مالک' : '🏠 مستاجر'}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && calculations.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {calculations.map((calc) => {
                        const unit = unitsList.find(u => u.id === calc.unitId)!;
                        return (
                          <div key={calc.unitId} className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-[var(--text-color)]">
                                واحد {toPersianDigits(calc.unitNumber)}
                              </h4>
                              <div className="text-xs text-gray-500">
                                {unit.isCommercial ? '🏢 تجاری' : '🏠 مسکونی'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mb-3">
                              متراژ: {toPersianDigits(calc.area)} م² • 
                              ضریب طبقه: {toPersianDigits(unit.floorCoefficient)} • 
                              {unit.hasParking ? `پارکینگ: ${toPersianDigits(unit.parkingCount)}` : 'بدون پارکینگ'}
                              {unit.isCommercial && (
                                <span className="text-orange-600">
                                  {' • ضریب تجاری: ×'}{toPersianDigits(currentSettings.coefficients?.commercial?.toString() || '1.5')}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2 mb-3">
                              {Object.entries(calc.categories).map(([catId, catCalc]) => {
                                const category = activeCategories.find(c => c.id === catId)!;
                                return (
                                  <div key={catId} className="text-xs border-b border-gray-200 pb-1">
                                    <div className="font-medium text-[var(--text-color)]">{category.title}</div>
                                    <div className="text-gray-500">{catCalc.calculation}</div>
                                    <div className="text-blue-600 font-medium">
                                      {toPersianDigits(catCalc.amount.toLocaleString())} تومان
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="border-t border-[var(--border-color)] pt-2">
                              <div className="font-bold text-[var(--accent-color)] text-center">
                                مجموع: {toPersianDigits(calc.totalAmount.toLocaleString())} تومان
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {toPersianDigits(availableUnitsData.length)}
                        </div>
                        <div className="text-sm text-blue-500">واحد قابل شارژ</div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {toPersianDigits(totalAmount.toLocaleString())}
                        </div>
                        <div className="text-sm text-green-500">مجموع درآمد (تومان)</div>
                      </div>
                      
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {calculations.length > 0 ? toPersianDigits(Math.round(totalAmount / calculations.length).toLocaleString()) : '۰'}
                        </div>
                        <div className="text-sm text-purple-500">میانگین هر واحد (تومان)</div>
                      </div>
                    </div>

                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="font-semibold text-[var(--text-color)] mb-3">آمار واحدهای انتخاب شده:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>مسکونی: {toPersianDigits(availableUnitsData.filter(u => !u.isCommercial).length)}</div>
                        <div>تجاری: {toPersianDigits(availableUnitsData.filter(u => u.isCommercial).length)}</div>
                        <div>مالک: {toPersianDigits(availableUnitsData.filter(u => u.ownerType === 'owner').length)}</div>
                        <div>مستاجر: {toPersianDigits(availableUnitsData.filter(u => u.ownerType === 'tenant').length)}</div>
                      </div>
                    </div>

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
