// src/components/MonthlyChargeModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calculator, Save, AlertTriangle, Info } from 'lucide-react';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import { ChargeSettings } from '@/types/charge';

interface MonthlyChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalculate: (charges: ChargeCalculation[]) => Promise<void>;
  selectedUnits: Array<{
    id: number;
    number: string;
    type: 'RESIDENTIAL' | 'COMMERCIAL';
    area: number;
    floor: number;
    ownerName?: string;
    previousWaterBill?: number;
    previousGasBill?: number;
    previousElectricityBill?: number;
  }>;
  chargeSettings: ChargeSettings;
  selectedMonth: string;
}

interface PreviousCharge {
  unitId: number;
  waterBill: number;
  gasBill: number;
  electricityBill: number;
}

interface ChargeCalculation {
  unitId: number;
  unitNumber: string;
  charges: {
    maintenance: number;
    elevator: number;
    janitor: number;
    security: number;
    waterBill: number;
    gasBill: number;
    electricityBill: number;
    penalty: number;
    discount: number;
    total: number;
  };
  dueDate: string;
}

const MonthlyChargeModal = ({
  isOpen,
  onClose,
  onCalculate,
  selectedUnits,
  chargeSettings,
  selectedMonth
}: MonthlyChargeModalProps) => {
  const [calculations, setCalculations] = useState<ChargeCalculation[]>([]);
  const [customRates, setCustomRates] = useState<Record<string, any>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  useEffect(() => {
    if (isOpen && selectedUnits.length > 0) {
      const initialCustomRates: Record<string, any> = {};
      selectedUnits.forEach(unit => {
        initialCustomRates[`water_${unit.id}`] = unit.previousWaterBill || 0;
        initialCustomRates[`gas_${unit.id}`] = unit.previousGasBill || 0;
        initialCustomRates[`electricity_${unit.id}`] = unit.previousElectricityBill || 0;
      });
      setCustomRates(initialCustomRates);
    }
  }, [isOpen, selectedUnits]);

  useEffect(() => {
    if (isOpen) {
      calculateCharges();
    }
  }, [customRates, chargeSettings, selectedMonth, isOpen]);

  const calculateCharges = () => {
    const newCalculations: ChargeCalculation[] = selectedUnits.map(unit => {
      const isCommercial = unit.type === 'COMMERCIAL';
      const multiplier = isCommercial ? chargeSettings.commercialMultiplier : 1;
      
      // محاسبه شارژ نگهداری (بر اساس متراژ)
      const maintenance = Math.round(unit.area * chargeSettings.maintenanceRatePerSqm * multiplier);
      
      // محاسبه شارژ آسانسور (بر اساس طبقه)
      const elevator = unit.floor > 0 
        ? Math.round(chargeSettings.elevatorBaseRate * unit.floor * multiplier)
        : 0;
      
      // سایر شارژها
      const janitor = Math.round(chargeSettings.janitorRate * multiplier);
      const security = Math.round(chargeSettings.securityRate * multiplier);
      
      // قبوضات (می‌تواند دستی وارد شود)
      const waterBill = customRates[`water_${unit.id}`] || 0;
      const gasBill = customRates[`gas_${unit.id}`] || 0;
      const electricityBill = customRates[`electricity_${unit.id}`] || 0;
      
      // جریمه و تخفیف
      const penalty = customRates[`penalty_${unit.id}`] || 0;
      const discount = customRates[`discount_${unit.id}`] || 0;
      
      const total = maintenance + elevator + janitor + security + 
                   waterBill + gasBill + electricityBill + penalty - discount;

      // تعیین تاریخ سررسید (۱۰ روز از آخر ماه)
      const [year, month] = selectedMonth.split('-');
      const dueDate = `${year}-${month.padStart(2, '0')}-${chargeSettings.dueDayOfMonth || 10}`;

      return {
        unitId: unit.id,
        unitNumber: unit.number,
        charges: {
          maintenance,
          elevator,
          janitor,
          security,
          waterBill,
          gasBill,
          electricityBill,
          penalty,
          discount,
          total: Math.max(0, total) // حداقل صفر
        },
        dueDate
      };
    });

    setCalculations(newCalculations);
  };

  const handleCustomRateChange = (key: string, value: number) => {
    setCustomRates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toEnglishDigits = (str: string) => {
    const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let newStr = str;
    for (let i = 0; i < 10; i++) {
      newStr = newStr.replace(new RegExp(persian[i], 'g'), english[i]);
    }
    return newStr;
  };

  const handleFormattedInputChange = (key: string, value: string) => {
    const englishValue = toEnglishDigits(value);
    const numberValue = parseInt(englishValue.replace(/,/g, ''), 10) || 0;
    handleCustomRateChange(key, numberValue);
  };

  const formatNumber = (num: number) => {
    return toPersianDigits(num.toLocaleString('en-US'));
  };

  const handleSubmit = async () => {
    if (calculations.length === 0) {
      return;
    }

    setIsCalculating(true);
    try {
      await onCalculate(calculations);
      onClose();
    } catch (error) {
      console.error('Error calculating charges:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const totalAmount = calculations.reduce((sum, calc) => sum + calc.charges.total, 0);
  const averagePerUnit = calculations.length > 0 ? totalAmount / calculations.length : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              محاسبه شارژ ماهانه
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ماه {persianMonths[parseInt(selectedMonth.split('-')[1]) - 1]} • {toPersianDigits(selectedUnits.length.toString())} واحد
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* خلاصه کلی */}
        <div className="p-6 bg-blue-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-gray-600">مجموع کل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(averagePerUnit)}
              </div>
              <div className="text-sm text-gray-600">میانگین هر واحد</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {toPersianDigits(selectedUnits.length.toString())}
              </div>
              <div className="text-sm text-gray-600">تعداد واحد</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* توگل نمایش جزئیات */}
          <div className="mb-4 flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="mr-2 text-sm font-medium">نمایش جزئیات محاسبه</span>
            </label>
            
            <div className="flex items-center text-sm text-gray-600">
              <Info className="h-4 w-4 ml-1" />
              نرخ‌های قابل ویرایش را می‌توانید تغییر دهید
            </div>
          </div>

          {/* جدول محاسبات */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    واحد
                  </th>
                  {showDetails && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        نگهداری
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        آسانسور
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        نظافت
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        حراست
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        آب
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        گاز
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        برق
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        جریمه/تخفیف
                      </th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    مجموع
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map((calc) => {
                  const unit = selectedUnits.find(u => u.id === calc.unitId);
                  return (
                    <tr key={calc.unitId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{toPersianDigits(calc.unitNumber)}</div>
                          <div className="text-gray-500 text-xs">
                            {toPersianDigits(unit?.area?.toString() ?? '0')} متر • طبقه {toPersianDigits(unit?.floor?.toString() ?? '0')}
                          </div>
                        </div>
                      </td>
                      
                      {showDetails && (
                        <>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(calc.charges.maintenance)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(calc.charges.elevator)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(calc.charges.janitor)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(calc.charges.security)}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={formatNumber(customRates[`water_${calc.unitId}`] || 0)}
                              onChange={(e) => handleFormattedInputChange(`water_${calc.unitId}`, e.target.value)}
                              className="w-24 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 font-sans text-center"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={formatNumber(customRates[`gas_${calc.unitId}`] || 0)}
                              onChange={(e) => handleFormattedInputChange(`gas_${calc.unitId}`, e.target.value)}
                              className="w-24 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 font-sans text-center"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={formatNumber(customRates[`electricity_${calc.unitId}`] || 0)}
                              onChange={(e) => handleFormattedInputChange(`electricity_${calc.unitId}`, e.target.value)}
                              className="w-24 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500 font-sans text-center"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-1 space-x-reverse">
                              <input
                                type="text"
                                placeholder="جریمه"
                                value={formatNumber(customRates[`penalty_${calc.unitId}`] || 0)}
                                onChange={(e) => handleFormattedInputChange(`penalty_${calc.unitId}`, e.target.value)}
                                className={`w-20 px-1 py-1 text-sm border rounded focus:ring-1 font-sans text-center ${
                                  (customRates[`penalty_${calc.unitId}`] || 0) > 0
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'focus:ring-gray-500'
                                }`}
                              />
                              <input
                                type="text"
                                placeholder="تخفیف"
                                value={formatNumber(customRates[`discount_${calc.unitId}`] || 0)}
                                onChange={(e) => handleFormattedInputChange(`discount_${calc.unitId}`, e.target.value)}
                                className={`w-20 px-1 py-1 text-sm border rounded focus:ring-1 font-sans text-center ${
                                  (customRates[`discount_${calc.unitId}`] || 0) > 0
                                    ? 'border-green-500 focus:ring-green-500'
                                    : 'focus:ring-gray-500'
                                }`}
                              />
                            </div>
                          </td>
                        </>
                      )}
                      
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(calc.charges.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* هشدار و اطلاعات */}
          {calculations.some(calc => calc.charges.total === 0) && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 ml-2" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">توجه:</p>
                <p>برخی واحدها مبلغ شارژ صفر دارند. لطفاً محاسبات را بررسی کنید.</p>
              </div>
            </div>
          )}

          {/* دکمه‌های عملیات */}
          <div className="flex justify-end items-center pt-6 border-t mt-6 space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isCalculating}
            >
              انصراف
            </button>
            <button
              onClick={calculateCharges}
              className="px-6 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              disabled={isCalculating}
            >
              <Calculator className="h-4 w-4 ml-2" />
              محاسبه مجدد
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCalculating || calculations.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="h-4 w-4 ml-2" />
              {isCalculating ? 'در حال ثبت...' : 'ثبت شارژها'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChargeModal;
