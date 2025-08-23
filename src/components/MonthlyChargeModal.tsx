// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types/index.d';
import { UnitChargeInfo, MonthlyChargeFormData } from '@/types/charge';
import { toPersianDigits, formatJalaliDate } from '@/lib/utils';
import { safeToString } from '@/lib/safeUtils';
import { calculateBulkCharges, defaultChargeCategories } from '@/lib/chargeCalculator';
import { format as formatJalali } from 'date-fns-jalali';
import { useChargeSettings } from '@/app/context/ChargeSettingsContext';
import { mockUnitsData } from '@/data/mockUnits';

// Import sub-components
import ChargeSelectionTab from '@/components/MonthlyCharge/ChargeSelectionTab';
import ChargePreviewTab from '@/components/MonthlyCharge/ChargePreviewTab';
import ChargeSummaryTab from '@/components/MonthlyCharge/ChargeSummaryTab';

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
  const [calculations, setCalculations] = useState([]);
  const [activeTab, setActiveTab] = useState<'selection' | 'preview' | 'summary'>('selection');
  const [chargeConflicts, setChargeConflicts] = useState<number[]>([]);

  // Safe settings with fallback
  const { currentSettings, activeCategories } = useMemo(() => {
    try {
      const settings = getCurrentYearSettings();
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
      return { 
        currentSettings: { year: 1404, categories: {}, coefficients: { commercial: 1.5, floor: 1.0, parking: 1.0 } }, 
        activeCategories: [] 
      };
    }
  }, [getCurrentYearSettings]);

  // Handlers
  const handleUnitSelection = useCallback((unitId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter(id => id !== unitId)
        : [...prev.selectedUnits, unitId]
    }));
  }, []);

  const handleCategorySelection = useCallback((categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
    }));
  }, []);

  const filterUnits = useCallback((filter: string) => {
    let filteredIds: number[] = [];
    switch (filter) {
      case 'all': filteredIds = unitsList.map(u => u.id); break;
      case 'residential': filteredIds = unitsList.filter(u => !u.isCommercial).map(u => u.id); break;
      case 'commercial': filteredIds = unitsList.filter(u => u.isCommercial).map(u => u.id); break;
      case 'owner': filteredIds = unitsList.filter(u => u.ownerType === 'owner').map(u => u.id); break;
      case 'tenant': filteredIds = unitsList.filter(u => u.ownerType === 'tenant').map(u => u.id); break;
    }
    setFormData(prev => ({ ...prev, selectedUnits: filteredIds }));
  }, [unitsList]);

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

  // Effects for conflict checking and calculations
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

  useEffect(() => {
    try {
      if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0 && activeCategories.length > 0) {
        const validUnits = formData.selectedUnits.filter(unitId => !chargeConflicts.includes(unitId));
        if (validUnits.length > 0) {
          const selectedActiveCategories = activeCategories.filter(cat =>
            formData.selectedCategories.includes(cat.id)
          );
          if (selectedActiveCategories.length > 0) {
            setCalculations(calculateBulkCharges(
              unitsList,
              selectedActiveCategories,
              formData.selectedCategories,
              validUnits
            ));
          }
        }
      } else {
        setCalculations([]);
      }
    } catch (error) {
      console.error('Error calculating charges:', error);
      setCalculations([]);
    }
  }, [formData.selectedUnits, formData.selectedCategories, unitsList, chargeConflicts, activeCategories]);

  useEffect(() => {
    if (isOpen && activeCategories.length > 0) {
      try {
        setFormData({
          chargeDate: new Date(),
          selectedUnits: [],
          selectedCategories: activeCategories.filter(cat => cat.isActive).map(cat => cat.id),
          description: '',
        });
        setActiveTab('selection');
        setCalculations([]);
        setChargeConflicts([]);
      } catch (error) {
        console.error('Error resetting form:', error);
      }
    }
  }, [isOpen]);

  // Computed values
  const totalAmount = calculations.reduce((sum, calc) => sum + (calc.totalAmount || 0), 0);
  const availableUnitsData = unitsList.filter(unit => 
    formData.selectedUnits.includes(unit.id) && !chargeConflicts.includes(unit.id)
  );
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
                  <ChargeSelectionTab
                    formData={formData}
                    setFormData={setFormData}
                    activeCategories={activeCategories}
                    unitsList={unitsList}
                    chargeConflicts={chargeConflicts}
                    currentSettings={currentSettings}
                    onUnitSelection={handleUnitSelection}
                    onCategorySelection={handleCategorySelection}
                    onFilterUnits={filterUnits}
                  />
                )}

                {activeTab === 'preview' && (
                  <ChargePreviewTab
                    calculations={calculations}
                    unitsList={unitsList}
                    totalAmount={totalAmount}
                  />
                )}

                {activeTab === 'summary' && (
                  <ChargeSummaryTab
                    calculations={calculations}
                    unitsList={unitsList}
                    formData={formData}
                    totalAmount={totalAmount}
                    chargeConflicts={chargeConflicts}
                  />
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
