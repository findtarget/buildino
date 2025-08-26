// src/components/MonthlyCharge/ChargeSummaryTab.tsx
'use client';

import { UnitChargeInfo, ChargeCalculation, MonthlyChargeFormData } from '@/types/charge';
import { toPersianDigits, formatJalaliDate } from '@/lib/utils';
import { safeToString } from '@/lib/safeUtils';
import { format as formatJalali } from 'date-fns-jalali';
import { formatCurrency } from '@/lib/formatCurrency';

interface ChargeSummaryTabProps {
  calculations: ChargeCalculation[];
  unitsList: UnitChargeInfo[];
  formData: MonthlyChargeFormData;
  totalAmount: number;
  chargeConflicts: number[];
}

export default function ChargeSummaryTab({
  calculations,
  unitsList,
  formData,
  totalAmount,
  chargeConflicts,
}: ChargeSummaryTabProps) {
  const availableUnitsData = unitsList.filter(unit =>
    calculations.some(calc => calc.unitId === unit.id)
  );

  const currentMonth = formData.chargeDate ? formatJalali(formData.chargeDate, 'MMMM') : '';
  const currentYear = formData.chargeDate ? toPersianDigits(formatJalali(formData.chargeDate, 'yyyy')) : '';

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-lg font-medium text-[var(--text-color)] mb-2">
          هیچ آیتمی برای صدور آماده نیست
        </div>
        <div className="text-[var(--text-muted)]">
          لطفاً به تب انتخاب بروید و واحدها را انتخاب کنید
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">میانگین هر واحد:</span>
              <span className="font-medium text-[var(--text-color)]">
                {availableUnitsData.length > 0
                  ? formatCurrency(Math.round(totalAmount / availableUnitsData.length))
                  : '۰ تومان'}
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
                  {[formData.description, ...(calc.breakdown || [])]
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(' • ')}
                  {(calc.breakdown || []).length > 2 && '...'}
                </div>
              </div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatCurrency(calc.totalAmount || 0)}
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
        
      {/* دکمه‌ها از اینجا حذف شدند */}
      
    </div>
  );
}
