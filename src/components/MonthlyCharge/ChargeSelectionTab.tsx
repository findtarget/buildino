// src/components/MonthlyCharge/ChargeSelectionTab.tsx
'use client';

import { UnitChargeInfo, ChargeCategory, MonthlyChargeFormData } from '@/types/charge';
import { toPersianDigits } from '@/lib/utils';
import { safeToString } from '@/lib/safeUtils';
import CustomDatePicker from '@/components/CustomDatePicker';

interface ChargeSelectionTabProps {
  formData: MonthlyChargeFormData;
  setFormData: (data: MonthlyChargeFormData | ((prev: MonthlyChargeFormData) => MonthlyChargeFormData)) => void;
  activeCategories: ChargeCategory[];
  unitsList: UnitChargeInfo[];
  chargeConflicts: number[];
  currentSettings: any;
  onUnitSelection: (unitId: number) => void;
  onCategorySelection: (categoryId: string) => void;
  onFilterUnits: (filter: string) => void;
}

export default function ChargeSelectionTab({
  formData,
  setFormData,
  activeCategories,
  unitsList,
  chargeConflicts,
  currentSettings,
  onUnitSelection,
  onCategorySelection,
  onFilterUnits
}: ChargeSelectionTabProps) {
  const safeTotalBaseAmount = Math.round(
    activeCategories.reduce((sum, cat) => sum + (cat.baseAmount || 0), 0) / 1000
  );

  return (
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
            ضریب تجاری: {toPersianDigits(safeToString(currentSettings?.coefficients?.commercial || 1.5, '1.5'))}×
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
                onChange={() => onCategorySelection(category.id)}
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
            onClick={() => onFilterUnits('all')}
            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            همه واحدها ({toPersianDigits(safeToString(unitsList.length, '0'))})
          </button>
          <button
            onClick={() => onFilterUnits('residential')}
            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            مسکونی ({toPersianDigits(safeToString(unitsList.filter(u => !u.isCommercial).length, '0'))})
          </button>
          <button
            onClick={() => onFilterUnits('commercial')}
            className="px-3 py-1.5 text-xs bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            تجاری ({toPersianDigits(safeToString(unitsList.filter(u => u.isCommercial).length, '0'))})
          </button>
          <button
            onClick={() => onFilterUnits('owner')}
            className="px-3 py-1.5 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            مالک ({toPersianDigits(safeToString(unitsList.filter(u => u.ownerType === 'owner').length, '0'))})
          </button>
          <button
            onClick={() => onFilterUnits('tenant')}
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
                  onChange={() => onUnitSelection(unit.id)}
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
  );
}
