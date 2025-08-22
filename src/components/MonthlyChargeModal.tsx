// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types/index.d';
import { UnitChargeInfo, ChargeCategory, ChargeCalculation } from '@/types/charge';
import { toPersianDigits, formatJalaliDate } from '@/lib/utils';
import { defaultChargeCategories, calculateBulkCharges } from '@/lib/chargeCalculator';
import { format as formatJalali } from 'date-fns-jalali';
import dynamic from 'next/dynamic';

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
}

// نمونه واحدهای مجتمع 60 واحدی
const mockUnitsData: UnitChargeInfo[] = Array.from({ length: 60 }, (_, i) => {
  const unitNum = Math.floor(i / 4) + 1;
  const floorNum = Math.ceil(unitNum / 4);
  const isCommercial = floorNum === 1 && Math.random() > 0.7; // طبقه همکف احتمال تجاری
  
  return {
    id: i + 1,
    unitNumber: `${floorNum}0${(i % 4) + 1}`,
    area: isCommercial ? 80 + Math.floor(Math.random() * 100) : 90 + Math.floor(Math.random() * 60),
    ownerType: Math.random() > 0.3 ? 'owner' : 'tenant',
    hasParking: Math.random() > 0.2,
    parkingCount: Math.random() > 0.7 ? 2 : 1,
    isCommercial,
    floorCoefficient: floorNum === 1 ? 0.9 : floorNum <= 3 ? 1.0 : floorNum <= 6 ? 1.1 : 1.2,
    balconyArea: isCommercial ? 0 : 5 + Math.floor(Math.random() * 15),
  };
});

export default function MonthlyChargeModal({
  isOpen,
  onClose,
  onSubmit,
  unitsList = mockUnitsData,
}: MonthlyChargeModalProps) {
  const [formData, setFormData] = useState<MonthlyChargeFormData>({
    chargeDate: new Date(),
    selectedUnits: [],
    selectedCategories: ['maintenance', 'cleaning', 'security', 'utilities', 'management'],
    description: '',
  });
  const [calculations, setCalculations] = useState<ChargeCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<'selection' | 'preview' | 'summary'>('selection');

  useEffect(() => {
    if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0) {
      const newCalculations = calculateBulkCharges(
        unitsList,
        defaultChargeCategories,
        formData.selectedCategories,
        formData.selectedUnits
      );
      setCalculations(newCalculations);
    } else {
      setCalculations([]);
    }
  }, [formData.selectedUnits, formData.selectedCategories, unitsList]);

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

  const handleSelectAllUnits = () => {
    const allUnitIds = unitsList.map(unit => unit.id);
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.length === allUnitIds.length ? [] : allUnitIds
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
    if (calculations.length === 0) return;

    const jalaliDate = formatJalaliDate(formData.chargeDate!);
    const currentMonth = formatJalali(formData.chargeDate!, 'MMMM');
    const currentYear = toPersianDigits(formatJalali(formData.chargeDate!, 'yyyy'));

    const chargeTransactions: Transaction[] = calculations.map(calc => ({
      id: Date.now() + calc.unitId,
      title: `شارژ ماه ${currentMonth} ${currentYear}`,
      type: 'Income' as const,
      category: 'MonthlyCharge' as const,
      amount: calc.totalAmount,
      date: jalaliDate,
      relatedUnitId: calc.unitId,
      isCharge: true,
      description: formData.description || `شارژ ماهانه واحد ${calc.unitNumber} - ${calc.breakdown.join('، ')}`,
    }));

    onSubmit(chargeTransactions);
    onClose();
  };

  const totalAmount = calculations.reduce((sum, calc) => sum + calc.totalAmount, 0);
  const selectedUnitsData = unitsList.filter(unit => formData.selectedUnits.includes(unit.id));

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
            className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
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
              <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-color)]">
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

                    {/* انتخاب دسته‌بندی هزینه‌ها */}
                    <div className="bg-[var(--bg-color)] p-4 rounded-xl">
                      <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
                        انتخاب دسته‌بندی هزینه‌ها ({toPersianDigits(formData.selectedCategories.length)} از {toPersianDigits(defaultChargeCategories.length)})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {defaultChargeCategories.map((category) => (
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
                              <div className="font-medium text-[var(--text-color)]">{category.title}</div>
                              <div className="text-xs text-gray-500">
                                {category.calculationType === 'fixed' ? 'مبلغ ثابت' : 
                                 category.calculationType === 'perArea' ? 'بر اساس متراژ' : 'بر واحد'}
                                {category.includeParking && ' • شامل پارکینگ'}
                                {category.commercialMultiplier > 1 && ` • ضریب تجاری ${toPersianDigits(category.commercialMultiplier)}`}
                              </div>
                              <div className="text-xs text-blue-600">
                                پایه: {toPersianDigits(category.baseAmount.toLocaleString())} تومان
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
                        {unitsList.map((unit) => (
                          <label
                            key={unit.id}
                            className={`flex flex-col p-2 rounded-lg border cursor-pointer transition-all ${
                              formData.selectedUnits.includes(unit.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedUnits.includes(unit.id)}
                              onChange={() => handleUnitSelection(unit.id)}
                              className="sr-only"
                            />
                            <div className="text-sm font-medium text-center">
                              {toPersianDigits(unit.unitNumber)}
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
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && calculations.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
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
                            </div>
                            <div className="space-y-1 mb-3">
                              {Object.entries(calc.categories).map(([catId, catCalc]) => {
                                const category = defaultChargeCategories.find(c => c.id === catId)!;
                                return (
                                  <div key={catId} className="text-xs">
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
                          {toPersianDigits(formData.selectedUnits.length)}
                        </div>
                        <div className="text-sm text-blue-500">تعداد واحد انتخاب شده</div>
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
                        <div>مسکونی: {toPersianDigits(selectedUnitsData.filter(u => !u.isCommercial).length)}</div>
                        <div>تجاری: {toPersianDigits(selectedUnitsData.filter(u => u.isCommercial).length)}</div>
                        <div>مالک: {toPersianDigits(selectedUnitsData.filter(u => u.ownerType === 'owner').length)}</div>
                        <div>مستاجر: {toPersianDigits(selectedUnitsData.filter(u => u.ownerType === 'tenant').length)}</div>
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
              <div className="border-t border-[var(--border-color)] p-6">
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
                        disabled={formData.selectedUnits.length === 0 || formData.selectedCategories.length === 0}
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
                        صدور شارژ ({toPersianDigits(formData.selectedUnits.length)} واحد)
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
