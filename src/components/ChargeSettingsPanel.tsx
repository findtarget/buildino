// src/components/ChargeSettingsPanel.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import { defaultChargeCategories } from '@/lib/chargeCalculator';
import { useChargeSettings } from '@/app/context/ChargeSettingsContext';

export default function ChargeSettingsPanel() {
  const { chargeSettings, updateChargeSettings, resetToDefaults, getCurrentYearSettings, setCurrentYear } = useChargeSettings();
  const currentSettings = getCurrentYearSettings();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<string>('');

  const handleAmountEdit = (categoryId: string, currentAmount: number) => {
    setEditingCategory(categoryId);
    setTempAmount(currentAmount.toString());
  };

  const handleAmountSave = (categoryId: string) => {
    const newAmount = parseInt(tempAmount.replace(/[^\d]/g, ''));
    if (newAmount && newAmount > 0) {
      updateChargeSettings(currentSettings.year, {
        categories: {
          ...currentSettings.categories,
          [categoryId]: {
            ...currentSettings.categories[categoryId],
            baseAmount: newAmount,
            lastUpdated: new Date().toISOString(),
          }
        }
      });
    }
    setEditingCategory(null);
    setTempAmount('');
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isCurrentlyActive = currentSettings.categories[categoryId]?.isActive !== false;
    updateChargeSettings(currentSettings.year, {
      categories: {
        ...currentSettings.categories,
        [categoryId]: {
          ...currentSettings.categories[categoryId],
          isActive: !isCurrentlyActive,
          lastUpdated: new Date().toISOString(),
        }
      }
    });
  };

  const handleCoefficientChange = (type: 'commercial' | 'floor' | 'parking', value: string) => {
    const numValue = parseFloat(value);
    if (numValue && numValue > 0) {
      updateChargeSettings(currentSettings.year, {
        coefficients: {
          ...currentSettings.coefficients,
          [type]: numValue,
        }
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* انتخاب سال */}
      <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--text-color)] mb-3">انتخاب سال مالی</h3>
        <select
          value={chargeSettings.currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)]"
        >
          <option value={1403}>۱۴۰۳</option>
          <option value={1404}>۱۴۰۴</option>
          <option value={1405}>۱۴۰۵</option>
        </select>
      </div>

      {/* ضرایب */}
      <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
        <h3 className="font-semibold text-[var(--text-color)] mb-3">ضرایب محاسبه</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ضریب تجاری</label>
            <input
              type="number"
              step="0.1"
              value={currentSettings.coefficients.commercial}
              onChange={(e) => handleCoefficientChange('commercial', e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ضریب طبقه</label>
            <input
              type="number"
              step="0.1"
              value={currentSettings.coefficients.floor}
              onChange={(e) => handleCoefficientChange('floor', e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ضریب پارکینگ</label>
            <input
              type="number"
              step="0.1"
              value={currentSettings.coefficients.parking}
              onChange={(e) => handleCoefficientChange('parking', e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)]"
            />
          </div>
        </div>
      </div>

      {/* دسته‌بندی‌ها */}
      <div className="bg-[var(--bg-color)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-[var(--text-color)]">مبالغ پایه دسته‌ها</h3>
          <button
            onClick={() => resetToDefaults(currentSettings.year)}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            بازنشانی
          </button>
        </div>

        <div className="space-y-3">
          {defaultChargeCategories.map((category) => {
            const settingsData = currentSettings.categories[category.id];
            const currentAmount = settingsData?.baseAmount ?? category.baseAmount;
            const isActive = settingsData?.isActive !== false;
            const isEditing = editingCategory === category.id;

            return (
              <motion.div
                key={category.id}
                className={`p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-900/20 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          isActive 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-400'
                        }`}
                      >
                        {isActive && '✓'}
                      </button>
                      <h4 className="font-medium text-[var(--text-color)]">{category.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                    <div className="text-xs text-gray-600">
                      نوع: {category.calculationType === 'fixed' ? 'ثابت' : 
                           category.calculationType === 'perArea' ? 'متری' : 'واحد پارکینگ'}
                      {category.commercialMultiplier > 1 && ` • ضریب تجاری: ×${toPersianDigits(category.commercialMultiplier)}`}
                    </div>
                  </div>

                  <div className="text-left">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(e.target.value)}
                          className="w-24 p-1 text-xs rounded border"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAmountSave(category.id);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                        />
                        <button
                          onClick={() => handleAmountSave(category.id)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAmountEdit(category.id, currentAmount)}
                        className="text-xs text-blue-600 hover:bg-blue-50 p-1 rounded"
                        disabled={!isActive}
                      >
                        <div className="font-medium">
                          {toPersianDigits(currentAmount.toLocaleString())} ت
                        </div>
                        <div className="text-gray-500">
                          {category.calculationType === 'perArea' && '/ متر'}
                          {category.calculationType === 'perUnit' && category.includeParking && '/ پارکینگ'}
                        </div>
                      </button>
                    )}
                    
                    {settingsData && currentAmount !== category.baseAmount && (
                      <div className="text-xs text-orange-600 mt-1">
                        (تغییر یافته)
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* خلاصه */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
          خلاصه تنظیمات سال {toPersianDigits(currentSettings.year)}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-600 dark:text-blue-400">
          <div>
            دسته‌های فعال: {toPersianDigits(
              Object.values(currentSettings.categories).filter(cat => cat.isActive !== false).length.toString()
            )}
          </div>
          <div>
            مجموع پایه: {toPersianDigits(
              Math.round(
                Object.entries(currentSettings.categories)
                  .filter(([_, cat]) => cat.isActive !== false)
                  .reduce((sum, [catId, _]) => {
                    const defaultCat = defaultChargeCategories.find(c => c.id === catId);
                    return sum + (currentSettings.categories[catId]?.baseAmount ?? defaultCat?.baseAmount ?? 0);
                  }, 0) / 1000
              ).toString()
            )}K ت
          </div>
          <div>
            ضریب تجاری: ×{toPersianDigits(currentSettings.coefficients.commercial.toString())}
          </div>
          <div>
            آخرین بروزرسانی: {new Date(currentSettings.lastUpdated).toLocaleDateString('fa-IR')}
          </div>
        </div>
      </div>
    </div>
  );
}
