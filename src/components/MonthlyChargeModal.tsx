// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
  
  const [formData, setFormData] = useState<MonthlyChargeFormData>({
    chargeDate: new Date(),
    selectedUnits: [],
    selectedCategories: [],
    description: '',
  });
  const [calculations, setCalculations] = useState<ChargeCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<'selection' | 'preview' | 'summary'>('selection');
  const [chargeConflicts, setChargeConflicts] = useState<number[]>([]);

  // 🔧 Fix: محافظت از undefined با fallback values
  const { currentSettings, activeCategories } = useMemo(() => {
    try {
      const settings = getCurrentYearSettings();
      
      // محافظت از undefined با fallback
      const safeSettings = {
        year: settings?.year || 1404,
        categories: settings?.categories || {},
        coefficients: {
          commercial: settings?.coefficients?.commercial || 1.5,
          floor: settings?.coefficients?.floor || 1.0,
          parking: settings?.coefficients?.parking || 1.0,
          ...settings?.coefficients
        },
        ...settings
      };
      
      const categories = defaultChargeCategories
        .filter(cat => safeSettings.categories[cat.id]?.isActive !== false)
        .map(cat => ({
          ...cat,
          baseAmount: safeSettings.categories[cat.id]?.baseAmount ?? cat.baseAmount
        }));
      
      return { currentSettings: safeSettings, activeCategories: categories };
    } catch (error) {
      console.error('Error getting charge settings:', error);
      
      // Fallback در صورت خطا
      const fallbackSettings = {
        year: 1404,
        categories: {},
        coefficients: {
          commercial: 1.5,
          floor: 1.0,
          parking: 1.0
        }
      };
      
      return { 
        currentSettings: fallbackSettings, 
        activeCategories: defaultChargeCategories 
      };
    }
  }, [getCurrentYearSettings]);

  // 🔧 Fix: useCallback برای handleUnitSelection
  const handleUnitSelection = useCallback((unitId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter(id => id !== unitId)
        : [...prev.selectedUnits, unitId]
    }));
  }, []);

  // 🔧 Fix: useCallback برای handleCategorySelection
  const handleCategorySelection = useCallback((categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  }, []);

  // 🔧 Fix: useCallback برای filterUnits
  const filterUnits = useCallback((filter: 'all' | 'residential' | 'commercial' | 'owner' | 'tenant') => {
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
  }, [unitsList]);

  // بررسی تداخل شارژ - با dependencies مناسب
  useEffect(() => {
    if (formData.chargeDate && formData.selectedUnits.length > 0) {
      try {
        const currentMonth = formatJalali(formData.chargeDate, 'yyyy/MM');
        const conflictingUnits = formData.selectedUnits.filter(unitId => {
          return existingTransactions.some(transaction =>
            transaction.relatedUnitId === unitId &&
            transaction.isCharge &&
            transaction.date.startsWith(currentMonth)
          );
        });
        setChargeConflicts(conflictingUnits);
      } catch (error) {
        console.error('Error checking charge conflicts:', error);
        setChargeConflicts([]);
      }
    } else {
      setChargeConflicts([]);
    }
  }, [formData.chargeDate, formData.selectedUnits, existingTransactions]);

  // محاسبه شارژها - با useMemo و محافظت از خطا
  const calculationsResult = useMemo(() => {
    try {
      if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0 && activeCategories.length > 0) {
        const validUnits = formData.selectedUnits.filter(unitId => !chargeConflicts.includes(unitId));
        if (validUnits.length > 0) {
          const selectedActiveCategories = activeCategories.filter(cat =>
            formData.selectedCategories.includes(cat.id)
          );

          if (selectedActiveCategories.length > 0) {
            return calculateBulkCharges(
              unitsList,
              selectedActiveCategories,
              formData.selectedCategories,
              validUnits
            );
          }
        }
      }
      return [];
    } catch (error) {
      console.error('Error calculating charges:', error);
      return [];
    }
  }, [formData.selectedUnits, formData.selectedCategories, unitsList, chargeConflicts, activeCategories]);

  // Update calculations when result changes
  useEffect(() => {
    setCalculations(calculationsResult);
  }, [calculationsResult]);

  // بازنشانی فرم - فقط وقتی modal باز می‌شود
  useEffect(() => {
    if (isOpen && activeCategories.length > 0) {
      try {
        const defaultSelectedCategories = activeCategories
          .filter(cat => cat.isActive)
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
      } catch (error) {
        console.error('Error resetting form:', error);
      }
    }
  }, [isOpen]); // فقط isOpen در dependency

  // handleSubmit با useCallback
  const handleSubmit = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Error submitting charges:', error);
    }
  }, [calculations, formData.chargeDate, formData.description, onSubmit, onClose]);

  // محاسبات نهایی با محافظت
  const totalAmount = calculations.reduce((sum, calc) => sum + (calc.totalAmount || 0), 0);
  const selectedUnitsData = unitsList.filter(unit => formData.selectedUnits.includes(unit.id));
  const availableUnitsData = selectedUnitsData.filter(unit => !chargeConflicts.includes(unit.id));

  // 🔧 Fix: محافظت از undefined در تاریخ
  const currentMonth = formData.chargeDate ? formatJalali(formData.chargeDate, 'MMMM') : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formatJalali(formData.chargeDate, 'yyyy')) : '';

  // 🔧 Fix: محافظت از toString errors
  const safeToString = (value: any, fallback = '0'): string => {
    try {
      if (value === null || value === undefined) return fallback;
      return String(value);
    } catch (error) {
      console.error('Error converting to string:', value, error);
      return fallback;
    }
  };

  const safeCommercialCoefficient = safeToString(currentSettings?.coefficients?.commercial || 1.5, '1.5');
  const safeTotalBaseAmount = Math.round(activeCategories.reduce((sum, cat) => sum + (cat.baseAmount || 0), 0) / 1000);

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
                        📋 تنظیمات فعلی شارژ (سال {toPersianDigits(safeToString(currentSettings?.year, '1404'))})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="text-blue-600 dark:text-blue-400">
                          دسته‌های فعال: {toPersianDigits(safeToString(activeCategories.length, '0'))}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          ضریب تجاری: {toPersianDigits(safeCommercialCoefficient)}×
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">
                          مجموع پایه: {toPersianDigits(safeToString(safeTotalBaseAmount, '0'))}K ت
                        </div>
                      </div>
                    </div>

                    {/* انتخاب دسته‌های هزینه */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-3">
                        انتخاب دسته‌های هزینه
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeCategories.map((category) => (
                          <label key={category.id} className="flex items-start gap-3 p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.selectedCategories.includes(category.id)}
                              onChange={() => handleCategorySelection(category.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[var(--text-color)]">
                                {category.title}
                              </div>
                              <div className="text-xs text-[var(--text-muted)] mt-1">
                                {category.description}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                مبلغ پایه: {toPersianDigits((category.baseAmount || 0).toLocaleString())} تومان
                                {category.calculationType === 'perArea' && ' (بر متر)'}
                                {category.calculationType === 'fixed' && ' (ثابت)'}
                                {category.calculationType === 'perUnit' && category.includeParking && ' (بر پارکینگ)'}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* فیلترهای سریع واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-3">
                        فیلترهای سریع انتخاب واحدها
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => filterUnits('all')}
                          className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          همه واحدها ({toPersianDigits(safeToString(unitsList.length, '0'))})
                        </button>
                        <button
                          onClick={() => filterUnits('residential')}
                          className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          مسکونی ({toPersianDigits(safeToString(unitsList.filter(u => !u.isCommercial).length, '0'))})
                        </button>
                        <button
                          onClick={() => filterUnits('commercial')}
                          className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          تجاری ({toPersianDigits(safeToString(unitsList.filter(u => u.isCommercial).length, '0'))})
                        </button>
                        <button
                          onClick={() => filterUnits('owner')}
                          className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          مالک ({toPersianDigits(safeToString(unitsList.filter(u => u.ownerType === 'owner').length, '0'))})
                        </button>
                        <button
                          onClick={() => filterUnits('tenant')}
                          className="px-3 py-1.5 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          مستأجر ({toPersianDigits(safeToString(unitsList.filter(u => u.ownerType === 'tenant').length, '0'))})
                        </button>
                      </div>
                    </div>

                    {/* لیست واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-3">
                        انتخاب واحدها ({toPersianDigits(safeToString(formData.selectedUnits.length, '0'))} انتخاب شده)
                      </label>
                      
                      {chargeConflicts.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-1">
                            ⚠️ هشدار: تداخل شارژ
                          </div>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400">
                            واحدهای زیر قبلاً در این ماه شارژ شده‌اند: {chargeConflicts.map(id => unitsList.find(u => u.id === id)?.unitNumber || '').join('، ')}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                        {unitsList.map((unit) => {
                          const isConflicted = chargeConflicts.includes(unit.id);
                          const isSelected = formData.selectedUnits.includes(unit.id);
                          
                          return (
                            <label
                              key={unit.id}
                              className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                                  : isConflicted
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 opacity-60'
                                  : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isConflicted}
                                onChange={() => handleUnitSelection(unit.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-[var(--text-color)]">
                                  واحد {toPersianDigits(safeToString(unit.unitNumber, ''))}
                                </div>
                                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                  <span>{toPersianDigits(safeToString(unit.area, '0'))} متر</span>
                                  {unit.isCommercial && (
                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px]">
                                      تجاری
                                    </span>
                                  )}
                                  {unit.ownerType === 'tenant' && (
                                    <span className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[10px]">
                                      مستأجر
                                    </span>
                                  )}
                                  {unit.hasParking && unit.parkingCount > 0 && (
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded text-[10px]">
                                      {toPersianDigits(safeToString(unit.parkingCount, '0'))}🅿️
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* توضیحات */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-[var(--text-color)] mb-2">
                        توضیحات (اختیاری)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="توضیحات اضافی برای این شارژ..."
                        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-[var(--text-color)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && (
                  <div className="space-y-6">
                    {calculations.length > 0 ? (
                      <>
                        {/* خلاصه کلی */}
                        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {toPersianDigits(safeToString(availableUnitsData.length, '0'))}
                              </div>
                              <div className="text-sm text-[var(--text-muted)]">واحد انتخابی</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {toPersianDigits(safeToString(formData.selectedCategories.length, '0'))}
                              </div>
                              <div className="text-sm text-[var(--text-muted)]">دسته هزینه</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {toPersianDigits((totalAmount / 1000000).toFixed(1))} M
                              </div>
                              <div className="text-sm text-[var(--text-muted)]">مجموع کل</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {availableUnitsData.length > 0 ? toPersianDigits(Math.round(totalAmount / availableUnitsData.length / 1000).toString()) : '۰'} K
                              </div>
                              <div className="text-sm text-[var(--text-muted)]">میانگین واحد</div>
                            </div>
                          </div>
                        </div>

                        {/* جدول محاسبات */}
                        <div className="bg-[var(--bg-color)] rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-[var(--bg-secondary)]">
                                <tr>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">واحد</th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">متراژ</th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">نوع</th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-color)]">مبلغ کل</th>
                                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-color)]">جزئیات</th>
                                </tr>
                              </thead>
                              <tbody>
                                {calculations.map((calc, index) => {
                                  const unit = unitsList.find(u => u.id === calc.unitId);
                                  if (!unit) return null;
                                  
                                  return (
                                    <tr key={calc.unitId} className={index % 2 === 0 ? 'bg-[var(--bg-secondary)]/30' : ''}>
                                      <td className="px-4 py-3 text-sm font-medium text-[var(--text-color)]">
                                        {toPersianDigits(safeToString(calc.unitNumber, ''))}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-[var(--text-color)]">
                                        {toPersianDigits(safeToString(calc.area, '0'))} متر
                                        {unit.balconyArea && unit.balconyArea > 0 && (
                                          <span className="text-xs text-[var(--text-muted)] block">
                                            + {toPersianDigits(safeToString(unit.balconyArea, '0'))} بالکن
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm">
                                        <div className="flex flex-wrap gap-1">
                                          {unit.isCommercial && (
                                            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded text-xs">
                                              تجاری
                                            </span>
                                          )}
                                          {unit.ownerType === 'tenant' && (
                                            <span className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                                              مستأجر
                                            </span>
                                          )}
                                          {unit.hasParking && (
                                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs">
                                              {toPersianDigits(safeToString(unit.parkingCount, '0'))}🅿️
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm font-bold text-blue-600 dark:text-blue-400">
                                        {toPersianDigits((calc.totalAmount || 0).toLocaleString())} ت
                                      </td>
                                      <td className="px-4 py-3 text-center">
                                        <details className="inline-block">
                                          <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">
                                            جزئیات محاسبه
                                          </summary>
                                          <div className="mt-2 p-3 bg-[var(--bg-secondary)] rounded-lg text-right">
                                            {(calc.breakdown || []).map((item, i) => (
                                              <div key={i} className="text-xs text-[var(--text-muted)] mb-1">
                                                {item}
                                              </div>
                                            ))}
                                          </div>
                                        </details>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <div className="text-lg font-medium text-[var(--text-color)] mb-2">
                          هیچ محاسبه‌ای انجام نشده
                        </div>
                        <div className="text-[var(--text-muted)]">
                          لطفاً ابتدا واحدها و دسته‌های هزینه را انتخاب کنید
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-6">
                    {calculations.length > 0 ? (
                      <>
                        {/* خلاصه نهایی */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                          <h3 className="text-lg font-bold text-green-700 dark:text-green-300 mb-4">
                            ✅ آماده صدور شارژ - {currentMonth} {currentYear}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">تعداد واحدهای انتخابی:</span>
                                <span className="font-medium text-[var(--text-color)]">
                                  {toPersianDigits(safeToString(availableUnitsData.length, '0'))} واحد
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">تعداد دسته‌های هزینه:</span>
                                <span className="font-medium text-[var(--text-color)]">
                                  {toPersianDigits(safeToString(formData.selectedCategories.length, '0'))} دسته
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">تاریخ شارژ:</span>
                                <span className="font-medium text-[var(--text-color)]">
                                  {formData.chargeDate ? formatJalaliDate(formData.chargeDate) : '-'}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">مجموع کل مبلغ:</span>
                                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                  {toPersianDigits(totalAmount.toLocaleString())} تومان
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">میانگین هر واحد:</span>
                                <span className="font-medium text-[var(--text-color)]">
                                  {availableUnitsData.length > 0 
                                    ? toPersianDigits(Math.round(totalAmount / availableUnitsData.length).toLocaleString()) 
                                    : '۰'} تومان
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--text-muted)]">تعداد تراکنش:</span>
                                <span className="font-medium text-[var(--text-color)]">
                                  {toPersianDigits(safeToString(calculations.length, '0'))} تراکنش
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* پیش‌نمایش تراکنش‌ها */}
                        <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                          <h4 className="text-md font-semibold text-[var(--text-color)] mb-4">
                            پیش‌نمایش تراکنش‌های ایجاد شده
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {calculations.map((calc) => (
                              <div key={calc.unitId} className="flex justify-between items-center p-3 bg-[var(--bg-secondary)] rounded-lg">
                                <div>
                                  <div className="text-sm font-medium text-[var(--text-color)]">
                                    شارژ ماه {currentMonth} {currentYear} - واحد {toPersianDigits(safeToString(calc.unitNumber, ''))}
                                  </div>
                                  <div className="text-xs text-[var(--text-muted)] mt-1">
                                    {formData.description || (calc.breakdown || []).slice(0, 2).join(' - ')}
                                    {(calc.breakdown || []).length > 2 && '...'}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {toPersianDigits((calc.totalAmount || 0).toLocaleString())} ت
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {chargeConflicts.length > 0 && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium mb-2">
                              ⚠️ توجه: واحدهای با تداخل
                            </div>
                            <div className="text-xs text-yellow-600 dark:text-yellow-400">
                              {chargeConflicts.length} واحد به دلیل وجود شارژ قبلی در این ماه، از محاسبات حذف شده‌اند
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <div className="text-lg font-medium text-[var(--text-color)] mb-2">
                          هیچ آیتمی برای صدور آماده نیست
                        </div>
                        <div className="text-[var(--text-muted)]">
                          لطفاً به تب انتخاب بروید و واحدها را انتخاب کنید
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center p-6 border-t border-[var(--border-color)] bg-[var(--bg-color)] flex-shrink-0">
                <div className="flex gap-2">
                  {activeTab === 'selection' && (
                    <button
                      onClick={() => setActiveTab('preview')}
                      disabled={formData.selectedUnits.length === 0 || formData.selectedCategories.length === 0}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      مرحله بعد: پیش‌نمایش
                    </button>
                  )}
                  {activeTab === 'preview' && (
                    <>
                      <button
                        onClick={() => setActiveTab('selection')}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        بازگشت: انتخاب
                      </button>
                      <button
                        onClick={() => setActiveTab('summary')}
                        disabled={calculations.length === 0}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        مرحله بعد: خلاصه
                      </button>
                    </>
                  )}
                  {activeTab === 'summary' && (
                    <>
                      <button
                        onClick={() => setActiveTab('preview')}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        بازگشت: پیش‌نمایش
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={calculations.length === 0}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        تایید و صدور شارژ ({toPersianDigits(safeToString(calculations.length, '0'))} تراکنش)
                      </button>
                    </>
                  )}
                </div>

                <div className="text-sm text-[var(--text-muted)]">
                  {calculations.length > 0 && (
                    <div className="text-left">
                      <div>مجموع: {toPersianDigits(totalAmount.toLocaleString())} تومان</div>
                      <div>میانگین: {availableUnitsData.length > 0 ? toPersianDigits(Math.round(totalAmount / availableUnitsData.length).toLocaleString()) : '۰'} تومان</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
