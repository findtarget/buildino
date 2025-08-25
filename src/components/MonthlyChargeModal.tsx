// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CheckIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  EyeIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
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
  unitsList?: UnitChargeInfo[];
  existingTransactions?: Transaction[];
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
  unitsList,
  existingTransactions = []
}: MonthlyChargeModalProps) {
  const { getCurrentYearSettings } = useChargeSettings();
  const currentSettings = getCurrentYearSettings();

  // استفاده از mockData در صورت عدم وجود یا خالی بودن unitsList
  const actualUnitsList = unitsList && unitsList.length > 0 ? unitsList : mockUnitsData;
  
  // لاگ برای دیباگ
  console.log('Original unitsList:', unitsList);
  console.log('Using actualUnitsList:', actualUnitsList);

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

  // محاسبه شارژها با استفاده از actualUnitsList
  useEffect(() => {
    if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0) {
      const validUnits = formData.selectedUnits.filter(unitId => !chargeConflicts.includes(unitId));
      if (validUnits.length > 0) {
        const selectedActiveCategories = activeCategories.filter(cat =>
          formData.selectedCategories.includes(cat.id)
        );

        const newCalculations = calculateBulkCharges(
          actualUnitsList, // استفاده از actualUnitsList
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
  }, [formData.selectedUnits, formData.selectedCategories, actualUnitsList, chargeConflicts, activeCategories]);

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
        filteredIds = actualUnitsList.map(u => u.id);
        break;
      case 'residential':
        filteredIds = actualUnitsList.filter(u => !u.isCommercial).map(u => u.id);
        break;
      case 'commercial':
        filteredIds = actualUnitsList.filter(u => u.isCommercial).map(u => u.id);
        break;
      case 'owner':
        filteredIds = actualUnitsList.filter(u => u.ownerType === 'owner').map(u => u.id);
        break;
      case 'tenant':
        filteredIds = actualUnitsList.filter(u => u.ownerType === 'tenant').map(u => u.id);
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
      description: formData.description || calc.breakdown.join(' • '),
    }));

    onSubmit(chargeTransactions);
    onClose();
  };

  const totalAmount = calculations.reduce((sum, calc) => sum + calc.totalAmount, 0);
  const selectedUnitsData = actualUnitsList.filter(unit => formData.selectedUnits.includes(unit.id));
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
                  <XMarkIcon className="w-5 h-5 text-[var(--text-color)]" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-color)] flex-shrink-0">
                {[
                  { id: 'selection', title: 'انتخاب واحدها و هزینه‌ها', icon: CogIcon },
                  { id: 'preview', title: 'پیش‌نمایش محاسبات', icon: EyeIcon },
                  { id: 'summary', title: 'خلاصه نهایی', icon: DocumentIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-[var(--bg-secondary)]'
                        : 'text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
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

                    {/* انتخاب سریع واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3">انتخاب سریع واحدها</h3>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => filterUnits('all')}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <BuildingOfficeIcon className="w-4 h-4" />
                          همه واحدها ({toPersianDigits(actualUnitsList.length)})
                        </button>
                        <button 
                          onClick={() => filterUnits('residential')}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <HomeIcon className="w-4 h-4" />
                          مسکونی ({toPersianDigits(actualUnitsList.filter(u => !u.isCommercial).length)})
                        </button>
                        <button 
                          onClick={() => filterUnits('commercial')}
                          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <BuildingOfficeIcon className="w-4 h-4" />
                          تجاری ({toPersianDigits(actualUnitsList.filter(u => u.isCommercial).length)})
                        </button>
                        <button 
                          onClick={() => filterUnits('owner')}
                          className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <UserIcon className="w-4 h-4" />
                          مالک ({toPersianDigits(actualUnitsList.filter(u => u.ownerType === 'owner').length)})
                        </button>
                        <button 
                          onClick={() => filterUnits('tenant')}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                        >
                          <UsersIcon className="w-4 h-4" />
                          مستاجر ({toPersianDigits(actualUnitsList.filter(u => u.ownerType === 'tenant').length)})
                        </button>
                      </div>
                    </div>

                    {/* انتخاب واحدها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3">
                        انتخاب واحدها ({toPersianDigits(formData.selectedUnits.length)} از {toPersianDigits(actualUnitsList.length)})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                        {actualUnitsList.map(unit => {
                          const isSelected = formData.selectedUnits.includes(unit.id);
                          const hasConflict = chargeConflicts.includes(unit.id);
                          
                          return (
                            <button
                              key={unit.id}
                              onClick={() => handleUnitSelection(unit.id)}
                              disabled={hasConflict}
                              className={`p-2 rounded-lg text-xs font-medium transition-all border-2 ${
                                hasConflict
                                  ? 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-blue-500 border-blue-500 text-white'
                                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-color)] hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{toPersianDigits(unit.unitNumber)}</span>
                                {isSelected && <CheckIcon className="w-3 h-3" />}
                                {hasConflict && <span className="text-xs">⚠️</span>}
                              </div>
                              <div className="text-xs opacity-70 mt-1">
                                {toPersianDigits(unit.area)}م² - {unit.isCommercial ? 'تجاری' : 'مسکونی'}
                              </div>
                              <div className="text-xs opacity-70">
                                {unit.ownerType === 'owner' ? 'مالک' : 'مستاجر'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {chargeConflicts.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            ⚠️ واحدهای زیر قبلاً برای این ماه شارژ شده‌اند و از محاسبه حذف می‌شوند:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {chargeConflicts.map(unitId => {
                              const unit = actualUnitsList.find(u => u.id === unitId);
                              return (
                                <span key={unitId} className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 rounded text-xs">
                                  {unit ? toPersianDigits(unit.unitNumber) : unitId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* انتخاب دسته‌های هزینه */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3">
                        انتخاب دسته‌های هزینه ({toPersianDigits(formData.selectedCategories.length)} از {toPersianDigits(activeCategories.length)})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeCategories.map(category => {
                          const isSelected = formData.selectedCategories.includes(category.id);
                          
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategorySelection(category.id)}
                              className={`p-3 rounded-lg text-right transition-all border-2 ${
                                isSelected
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-color)] hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{category.title}</span>
                                {isSelected && <CheckIcon className="w-4 h-4" />}
                              </div>
                              <div className="text-xs opacity-80">
                                {category.description}
                              </div>
                              <div className="text-xs font-medium mt-1">
                                مبلغ پایه: {toPersianDigits(category.baseAmount.toLocaleString())} تومان
                              </div>
                            </button>
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
                  <div className="space-y-4">
                    {calculations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-500 mb-2">هیچ محاسبه‌ای انجام نشده</div>
                        <div className="text-sm text-gray-400">لطفاً ابتدا واحدها و دسته‌های هزینه را انتخاب کنید</div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                          <h3 className="text-green-700 dark:text-green-300 font-semibold mb-2">
                            📊 خلاصه محاسبات
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">تعداد واحد</div>
                              <div className="font-bold text-green-600">{toPersianDigits(calculations.length)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">کل درآمد</div>
                              <div className="font-bold text-green-600">{toPersianDigits(totalAmount.toLocaleString())} ت</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">میانگین</div>
                              <div className="font-bold text-green-600">{toPersianDigits(Math.round(totalAmount / calculations.length).toLocaleString())} ت</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">دسته‌ها</div>
                              <div className="font-bold text-green-600">{toPersianDigits(formData.selectedCategories.length)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {calculations.map(calc => {
                            const unit = actualUnitsList.find(u => u.id === calc.unitId);
                            if (!unit) return null;

                            return (
                              <div key={calc.unitId} className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-[var(--text-color)]">
                                      واحد {toPersianDigits(calc.unitNumber)}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {toPersianDigits(unit.area)}م² - {unit.isCommercial ? 'تجاری' : 'مسکونی'} - {unit.ownerType === 'owner' ? 'مالک' : 'مستاجر'}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <div className="text-lg font-bold text-green-600">
                                      {toPersianDigits(calc.totalAmount.toLocaleString())} تومان
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {calc.breakdown.map((item, index) => (
                                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-[var(--bg-secondary)] p-2 rounded">
                                      {toPersianDigits(item)}
                                    </div>
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                      <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">
                        🎯 آماده صدور شارژ ماهانه
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">{toPersianDigits(calculations.length)}</div>
                          <div className="text-sm text-gray-600">واحد انتخابی</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">{toPersianDigits(totalAmount.toLocaleString())}</div>
                          <div className="text-sm text-gray-600">کل درآمد (تومان)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">{toPersianDigits(formData.selectedCategories.length)}</div>
                          <div className="text-sm text-gray-600">دسته هزینه</div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-2">
                        <div><strong>تاریخ شارژ:</strong> {formData.chargeDate ? formatJalaliDate(formData.chargeDate) : 'نامشخص'}</div>
                        <div><strong>دسته‌های انتخابی:</strong> {formData.selectedCategories.map(catId => {
                          const cat = activeCategories.find(c => c.id === catId);
                          return cat ? cat.title : catId;
                        }).join('، ')}</div>
                        {formData.description && (
                          <div><strong>توضیحات:</strong> {formData.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">⚠️ نکات مهم:</h4>
                      <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-1">
                        <li>• پس از صدور، امکان ویرایش یا حذف شارژ وجود ندارد</li>
                        <li>• شارژ برای هر واحد به صورت جداگانه در سیستم ثبت می‌شود</li>
                        <li>• مالکین/مستاجرین می‌توانند جزئیات شارژ خود را مشاهده کنند</li>
                        <li>• گزارش‌های مالی بلافاصله بروزرسانی خواهند شد</li>
                      </ul>
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
