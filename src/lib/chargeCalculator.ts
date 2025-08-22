// src/lib/chargeCalculator.ts
import { UnitChargeInfo, ChargeCategory, ChargeCalculation } from '@/types/charge';
import { toPersianDigits } from '@/lib/utils';

export const defaultChargeCategories: ChargeCategory[] = [
  {
    id: 'maintenance',
    title: 'نگهداری و تعمیرات',
    baseAmount: 50000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.5
  },
  {
    id: 'cleaning',
    title: 'نظافت مشاعات',
    baseAmount: 30000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.3
  },
  {
    id: 'security',
    title: 'نگهبانی و حراست',
    baseAmount: 200000,
    calculationType: 'fixed',
    includeParking: true,
    commercialMultiplier: 2.0
  },
  {
    id: 'utilities',
    title: 'برق و گاز مشاعات',
    baseAmount: 40000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.8
  },
  {
    id: 'management',
    title: 'مدیریت و اداری',
    baseAmount: 150000,
    calculationType: 'fixed',
    includeParking: true,
    commercialMultiplier: 1.2
  },
  {
    id: 'parking',
    title: 'نگهداری پارکینگ',
    baseAmount: 80000,
    calculationType: 'perUnit',
    includeParking: true,
    commercialMultiplier: 1.0
  },
  {
    id: 'elevator',
    title: 'نگهداری آسانسور',
    baseAmount: 60000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.4
  },
  {
    id: 'insurance',
    title: 'بیمه ساختمان',
    baseAmount: 25000,
    calculationType: 'perArea',
    includeParking: true,
    commercialMultiplier: 2.5
  }
];

export function calculateUnitCharge(
  unit: UnitChargeInfo,
  categories: ChargeCategory[],
  selectedCategoryIds: string[]
): ChargeCalculation {
  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));
  const calculation: ChargeCalculation = {
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    area: unit.area,
    categories: {},
    totalAmount: 0,
    breakdown: []
  };

  selectedCategories.forEach(category => {
    let amount = 0;
    let calculationDesc = '';

    switch (category.calculationType) {
      case 'fixed':
        amount = category.baseAmount;
        calculationDesc = `مبلغ ثابت: ${toPersianDigits(category.baseAmount.toLocaleString())} تومان`;
        break;
        
      case 'perArea':
        const effectiveArea = unit.area + (category.includeParking ? unit.balconyArea : 0);
        amount = category.baseAmount * effectiveArea * unit.floorCoefficient;
        calculationDesc = `${toPersianDigits(category.baseAmount.toLocaleString())} × ${toPersianDigits(effectiveArea)} متر × ضریب ${toPersianDigits(unit.floorCoefficient)}`;
        break;
        
      case 'perUnit':
        if (category.includeParking && unit.hasParking) {
          amount = category.baseAmount * Math.max(1, unit.parkingCount);
          calculationDesc = `${toPersianDigits(category.baseAmount.toLocaleString())} × ${toPersianDigits(unit.parkingCount)} پارکینگ`;
        } else if (!category.includeParking) {
          amount = category.baseAmount;
          calculationDesc = `مبلغ واحد: ${toPersianDigits(category.baseAmount.toLocaleString())} تومان`;
        }
        break;
    }

    // اعمال ضریب تجاری
    if (unit.isCommercial) {
      amount *= category.commercialMultiplier;
      calculationDesc += ` × ضریب تجاری ${toPersianDigits(category.commercialMultiplier)}`;
    }

    calculation.categories[category.id] = {
      amount: Math.round(amount),
      calculation: calculationDesc
    };

    calculation.totalAmount += Math.round(amount);
    calculation.breakdown.push(`${category.title}: ${toPersianDigits(Math.round(amount).toLocaleString())} تومان`);
  });

  return calculation;
}

export function calculateBulkCharges(
  units: UnitChargeInfo[],
  categories: ChargeCategory[],
  selectedCategoryIds: string[],
  selectedUnitIds: number[]
): ChargeCalculation[] {
  const selectedUnits = units.filter(unit => selectedUnitIds.includes(unit.id));
  return selectedUnits.map(unit => calculateUnitCharge(unit, categories, selectedCategoryIds));
}
