// src/lib/chargeCalculator.ts
import { UnitChargeInfo, ChargeCategory, ChargeCalculation } from '@/types/charge';
import { toPersianDigits } from '@/lib/utils';

export const defaultChargeCategories: ChargeCategory[] = [
  {
    id: 'maintenance',
    title: 'نگهداری و تعمیرات',
    baseAmount: 15000, // 15 هزار تومان به ازای هر متر
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.5,
    description: 'هزینه تعمیر و نگهداری مشاعات، آسانسور و تأسیسات'
  },
  {
    id: 'cleaning',
    title: 'نظافت مشاعات',
    baseAmount: 8000, // 8 هزار تومان به ازای هر متر
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.3,
    description: 'هزینه نظافت راه‌پله، لابی و محوطه مشترک'
  },
  {
    id: 'security',
    title: 'نگهبانی و حراست',
    baseAmount: 400000, // 400 هزار تومان ثابت
    calculationType: 'fixed',
    includeParking: true,
    commercialMultiplier: 2.0,
    description: 'هزینه نگهبان، سیستم امنیتی و کنترل دسترسی'
  },
  {
    id: 'utilities',
    title: 'برق و گاز مشاعات',
    baseAmount: 12000, // 12 هزار تومان به ازای هر متر
    calculationType: 'perArea',
    includeParking: false,
    commercialMultiplier: 1.8,
    description: 'هزینه برق راه‌پله، آسانسور و گرمایش مشترک'
  },
  {
    id: 'management',
    title: 'مدیریت و اداری',
    baseAmount: 250000, // 250 هزار تومان ثابت
    calculationType: 'fixed',
    includeParking: true,
    commercialMultiplier: 1.2,
    description: 'هزینه مدیریت ساختمان و امور اداری'
  },
  {
    id: 'parking',
    title: 'نگهداری پارکینگ',
    baseAmount: 120000, // 120 هزار تومان به ازای هر پارکینگ
    calculationType: 'perUnit',
    includeParking: true,
    commercialMultiplier: 1.0,
    description: 'هزینه نگهداری، نظافت و نور پارکینگ'
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
        const effectiveArea = unit.area + (category.includeParking && unit.hasParking ? unit.balconyArea : 0);
        amount = category.baseAmount * effectiveArea * unit.floorCoefficient;
        calculationDesc = `${toPersianDigits(category.baseAmount.toLocaleString())} × ${toPersianDigits(effectiveArea)} متر × ضریب ${toPersianDigits(unit.floorCoefficient)}`;
        break;
        
      case 'perUnit':
        if (category.includeParking && unit.hasParking && unit.parkingCount > 0) {
          amount = category.baseAmount * unit.parkingCount;
          calculationDesc = `${toPersianDigits(category.baseAmount.toLocaleString())} × ${toPersianDigits(unit.parkingCount)} پارکینگ`;
        } else if (!category.includeParking) {
          amount = category.baseAmount;
          calculationDesc = `مبلغ واحد: ${toPersianDigits(category.baseAmount.toLocaleString())} تومان`;
        } else {
          amount = 0;
          calculationDesc = 'بدون پارکینگ';
        }
        break;
    }

    // اعمال ضریب تجاری
    if (unit.isCommercial && amount > 0) {
      amount *= category.commercialMultiplier;
      calculationDesc += ` × ضریب تجاری ${toPersianDigits(category.commercialMultiplier)}`;
    }

    const finalAmount = Math.round(amount);
    calculation.categories[category.id] = {
      amount: finalAmount,
      calculation: calculationDesc
    };

    calculation.totalAmount += finalAmount;
    if (finalAmount > 0) {
      calculation.breakdown.push(`${category.title}: ${toPersianDigits(finalAmount.toLocaleString())} تومان`);
    }
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
