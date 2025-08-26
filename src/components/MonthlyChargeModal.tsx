// src/components/MonthlyChargeModal.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CogIcon,
  TableCellsIcon, // <-- آیکون جدید
  ClipboardDocumentCheckIcon, // <-- آیکون جدید
} from '@heroicons/react/24/outline';
import { Transaction } from '@/types/index.d';
import { UnitChargeInfo, ChargeCalculation, MonthlyChargeFormData } from '@/types/charge';
import { toPersianDigits, formatJalaliDate } from '@/lib/utils';
import { defaultChargeCategories, calculateBulkCharges } from '@/lib/chargeCalculator';
import { format as formatJalali } from 'date-fns-jalali';
import { useChargeSettings } from '@/app/context/ChargeSettingsContext';
import ChargeSelectionTab from './MonthlyCharge/ChargeSelectionTab';
import ChargePreviewTab from './MonthlyCharge/ChargePreviewTab';
import ChargeSummaryTab from './MonthlyCharge/ChargeSummaryTab';
import { mockUnitsData } from '@/data/mockUnits';
import { formatCurrency } from '@/lib/formatCurrency';


export default function MonthlyChargeModal({
  isOpen,
  onClose,
  onSubmit,
  unitsList,
  existingTransactions = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactions: Transaction[]) => void;
  unitsList?: UnitChargeInfo[];
  existingTransactions?: Transaction[];
}) {
  const { getCurrentYearSettings } = useChargeSettings();
  const currentSettings = getCurrentYearSettings();
  const actualUnitsList = unitsList && unitsList.length > 0 ? unitsList : mockUnitsData;

  const [formData, setFormData] = useState<MonthlyChargeFormData>({
    chargeDate: new Date(),
    selectedUnits: [],
    selectedCategories: [],
    description: '',
  });
  const [calculations, setCalculations] = useState<ChargeCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<'selection' | 'preview' | 'summary'>('selection');
  const [chargeConflicts, setChargeConflicts] = useState<number[]>([]);

  const activeCategories = useMemo(() => defaultChargeCategories
    .filter(cat => currentSettings.categories[cat.id]?.isActive !== false)
    .map(cat => ({
      ...cat,
      baseAmount: currentSettings.categories[cat.id]?.baseAmount ?? cat.baseAmount
    })), [currentSettings]);

  // بررسی تداخل
  useEffect(() => {
    if (formData.chargeDate && formData.selectedUnits.length > 0) {
      const currentMonth = formatJalali(formData.chargeDate, 'yyyy/MM');
      const conflictingUnits = formData.selectedUnits.filter(unitId =>
        existingTransactions.some(tx =>
          tx.relatedUnitId === unitId &&
          tx.isCharge &&
          tx.date.startsWith(currentMonth)
        )
      );
      setChargeConflicts(conflictingUnits);
    } else {
      setChargeConflicts([]);
    }
  }, [formData.chargeDate, formData.selectedUnits, existingTransactions]);

  // محاسبه شارژ
  useEffect(() => {
    if (formData.selectedUnits.length > 0 && formData.selectedCategories.length > 0) {
      const validUnits = formData.selectedUnits.filter(id => !chargeConflicts.includes(id));
      if (validUnits.length > 0) {
        const selectedCats = activeCategories.filter(cat =>
          formData.selectedCategories.includes(cat.id)
        );
        const newCalcs = calculateBulkCharges(actualUnitsList, selectedCats, formData.selectedCategories, validUnits);
        setCalculations(newCalcs);
      } else {
        setCalculations([]);
      }
    } else {
      setCalculations([]);
    }
  }, [formData.selectedUnits, formData.selectedCategories, actualUnitsList, chargeConflicts, activeCategories]);

  // ریست فرم
  useEffect(() => {
    if (isOpen) {
      const defaultSelectedCategories = activeCategories.map(cat => cat.id);
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
  }, [isOpen, activeCategories]);

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

  const handleFilterUnits = useCallback((filter: string) => {
    let ids: number[] = [];
    switch (filter) {
      case 'all':
        ids = actualUnitsList.map(u => u.id); break;
      case 'residential':
        ids = actualUnitsList.filter(u => !u.isCommercial).map(u => u.id); break;
      case 'commercial':
        ids = actualUnitsList.filter(u => u.isCommercial).map(u => u.id); break;
      case 'owner':
        ids = actualUnitsList.filter(u => u.ownerType === 'owner').map(u => u.id); break;
      case 'tenant':
        ids = actualUnitsList.filter(u => u.ownerType === 'tenant').map(u => u.id); break;
    }
    setFormData(prev => ({ ...prev, selectedUnits: ids }));
  }, [actualUnitsList]);

  const handleSubmit = () => {
    if (calculations.length === 0 || !formData.chargeDate) return;
    const jalaliDate = formatJalaliDate(formData.chargeDate);
    const month = formatJalali(formData.chargeDate, 'MMMM');
    const year = toPersianDigits(formatJalali(formData.chargeDate, 'yyyy'));
    const txs: Transaction[] = calculations.map(calc => ({
      id: Date.now() + calc.unitId,
      title: `شارژ ماه ${month} ${year}`,
      type: 'Income',
      category: 'MonthlyCharge',
      amount: calc.totalAmount,
      date: jalaliDate,
      relatedUnitId: calc.unitId,
      isCharge: true,
      description: [formData.description, calc.breakdown.join(' • ')].filter(Boolean).join(' | ')
    }));
    onSubmit(txs);
    onClose();
  };
  
  const totalAmount = calculations.reduce((sum, c) => sum + c.totalAmount, 0);
  const currentMonth = formData.chargeDate ? formatJalali(formData.chargeDate, 'MMMM') : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formatJalali(formData.chargeDate, 'yyyy')) : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              {/* هدر */}
              <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                  صدور شارژ ماهانه - {currentMonth} {currentYear}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--bg-color)] transition-colors">
                  <XMarkIcon className="w-5 h-5 text-[var(--text-color)]" />
                </button>
              </div>

              {/* تب‌ها */}
              <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-color)]">
                {[
                  { id: 'selection', title: 'انتخاب واحدها و هزینه‌ها', icon: CogIcon },
                  { id: 'preview', title: 'پیش‌نمایش محاسبات', icon: TableCellsIcon }, // <-- آیکون تغییر کرد
                  { id: 'summary', title: 'خلاصه نهایی', icon: ClipboardDocumentCheckIcon } // <-- آیکون تغییر کرد
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-500 border-b-2 border-blue-500 bg-[var(--bg-secondary)]'
                        : 'text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.title}
                  </button>
                ))}
              </div>

              {/* محتوا */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'selection' && (
                  <ChargeSelectionTab
                    formData={formData}
                    setFormData={setFormData}
                    activeCategories={activeCategories}
                    unitsList={actualUnitsList}
                    chargeConflicts={chargeConflicts}
                    currentSettings={currentSettings}
                    onUnitSelection={handleUnitSelection}
                    onCategorySelection={handleCategorySelection}
                    onFilterUnits={handleFilterUnits}
                  />
                )}
                {activeTab === 'preview' && (
                  <ChargePreviewTab
                    calculations={calculations}
                    unitsList={actualUnitsList}
                    totalAmount={totalAmount}
                  />
                )}
                {activeTab === 'summary' && (
                  <ChargeSummaryTab
                    calculations={calculations}
                    unitsList={actualUnitsList}
                    formData={formData}
                    totalAmount={totalAmount}
                    chargeConflicts={chargeConflicts}
                  />
                )}
              </div>
              
              {/* فوتر */}
              <div className="border-t border-[var(--border-color)] p-6 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {calculations.length > 0 && (
                      <span>
                        مجموع: {formatCurrency(totalAmount)}
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
                    
                    {activeTab === 'selection' && (
                      <button
                        onClick={() => setActiveTab('preview')}
                        disabled={formData.selectedUnits.length === 0 || formData.selectedCategories.length === 0}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl transition-colors"
                      >
                        مرحله بعد
                      </button>
                    )}

                    {activeTab === 'preview' && (
                       <button
                        onClick={() => setActiveTab('summary')}
                        disabled={calculations.length === 0}
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
