// src/lib/chargeCalculator.ts
import { UnitChargeInfo, ChargeCategory, ChargeCalculation, CategoryCalculation } from '@/types/charge';

export const defaultChargeCategories: ChargeCategory[] = [
  {
    id: 'maintenance',
    title: 'تعمیرات و نگهداری',
    description: 'هزینه‌های تعمیر و نگهداری ساختمان',
    baseAmount: 120000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.5,
    isActive: true,
  },
  {
    id: 'cleaning',
    title: 'نظافت و بهداشت',
    description: 'هزینه‌های نظافت مشاعات',
    baseAmount: 80000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.3,
    isActive: true,
  },
  {
    id: 'security',
    title: 'حراست و نگهبانی',
    description: 'حقوق نگهبان و هزینه‌های امنیتی',
    baseAmount: 250000,
    calculationType: 'fixed',
    includeParking: false,
    commercialMultiplier: 1.2,
    isActive: true,
  },
  {
    id: 'utilities',
    title: 'مشاعات و قبوض',
    description: 'آب، برق، گاز و تلفن مشاعات',
    baseAmount: 90000,
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.4,
    isActive: true,
  },
  {
    id: 'management',
    title: 'مدیریت ساختمان',
    description: 'هزینه‌های اداری و مدیریت',
    baseAmount: 180000,
    calculationType: 'fixed',
    includeParking: false,
    commercialMultiplier: 1.1,
    isActive: true,
  },
  {
    id: 'parking',
    title: 'نگهداری پارکینگ',
    description: 'تعمیر و نگهداری پارکینگ',
    baseAmount: 50000,
    calculationType: 'perUnit',
    includeParking: true,
    commercialMultiplier: 1.0,
    isActive: true,
  },
];

export function calculateUnitCharge(
  unit: UnitChargeInfo,
  categories: ChargeCategory[],
  selectedCategoryIds: string[],
  coefficients: { commercial: number; floor: number; parking: number } = {
    commercial: 1.5,
    floor: 1.0,
    parking: 1.0
  }
): ChargeCalculation {
  const categoryCalculations: Record<string, CategoryCalculation> = {};
  const breakdown: string[] = [];
  let totalAmount = 0;

  const activeCategories = categories.filter(cat => 
    selectedCategoryIds.includes(cat.id) && cat.isActive
  );

  for (const category of activeCategories) {
    let amount = 0;
    let calculation = '';

    switch (category.calculationType) {
      case 'fixed':
        amount = category.baseAmount;
        calculation = `${category.baseAmount.toLocaleString()} تومان ثابت`;
        break;

      case 'perArea':
        const effectiveArea = unit.area + (unit.balconyArea || 0);
        amount = category.baseAmount * effectiveArea;
        calculation = `${category.baseAmount.toLocaleString()} × ${effectiveArea} متر = ${amount.toLocaleString()}`;
        break;

      case 'perUnit':
        if (category.includeParking && unit.hasParking) {
          amount = category.baseAmount * unit.parkingCount;
          calculation = `${category.baseAmount.toLocaleString()} × ${unit.parkingCount} پارکینگ = ${amount.toLocaleString()}`;
        } else if (!category.includeParking) {
          amount = category.baseAmount;
          calculation = `${category.baseAmount.toLocaleString()} تومان ثابت`;
        }
        break;
    }

    // اعمال ضریب طبقه
    if (unit.floorCoefficient !== 1.0) {
      amount *= unit.floorCoefficient;
      calculation += ` × ضریب طبقه ${unit.floorCoefficient}`;
    }

    // اعمال ضریب تجاری
    if (unit.isCommercial && category.commercialMultiplier > 1) {
      amount *= category.commercialMultiplier;
      calculation += ` × ضریب تجاری ${category.commercialMultiplier}`;
    }

    amount = Math.round(amount);

    categoryCalculations[category.id] = {
      categoryId: category.id,
      amount,
      calculation,
    };

    breakdown.push(`${category.title}: ${amount.toLocaleString()} تومان`);
    totalAmount += amount;
  }

  return {
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    area: unit.area,
    totalAmount: Math.round(totalAmount),
    categories: categoryCalculations,
    breakdown,
  };
}

export function calculateBulkCharges(
  units: UnitChargeInfo[],
  categories: ChargeCategory[],
  selectedCategoryIds: string[],
  selectedUnitIds: number[],
  coefficients?: { commercial: number; floor: number; parking: number }
): ChargeCalculation[] {
  const selectedUnits = units.filter(unit => selectedUnitIds.includes(unit.id));
  
  return selectedUnits.map(unit => 
    calculateUnitCharge(unit, categories, selectedCategoryIds, coefficients)
  );
}
