// src/components/MonthlyCharge/ChargePreviewTab.tsx
'use client';

import { UnitChargeInfo, ChargeCalculation } from '@/types/charge';
import { toPersianDigits } from '@/lib/utils';
import { safeToString } from '@/lib/safeUtils';

interface ChargePreviewTabProps {
  calculations: ChargeCalculation[];
  unitsList: UnitChargeInfo[];
  totalAmount: number;
}

export default function ChargePreviewTab({
  calculations,
  unitsList,
  totalAmount
}: ChargePreviewTabProps) {
  const availableUnitsData = unitsList.filter(unit => 
    calculations.some(calc => calc.unitId === unit.id)
  );

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-lg font-medium text-[var(--text-color)] mb-2">
          هیچ محاسبه‌ای انجام نشده
        </div>
        <div className="text-[var(--text-muted)]">
          لطفاً ابتدا واحدها و دسته‌های هزینه را انتخاب کنید
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              {toPersianDigits(safeToString(Object.keys(calculations[0]?.categories || {}).length, '0'))}
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
              {availableUnitsData.length > 0 
                ? toPersianDigits(Math.round(totalAmount / availableUnitsData.length / 1000).toString()) 
                : '۰'} K
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
    </div>
  );
}
