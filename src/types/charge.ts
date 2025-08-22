// src/types/charge.ts
export interface UnitChargeInfo {
  id: number;
  unitNumber: string;
  area: number; // مساحت به متر مربع
  ownerType: 'owner' | 'tenant'; // مالک یا مستاجر
  hasParking: boolean;
  parkingCount: number;
  isCommercial: boolean; // تجاری یا مسکونی
  floorCoefficient: number; // ضریب طبقه
  balconyArea: number; // مساحت بالکن
}

export interface ChargeCategory {
  id: string;
  title: string;
  baseAmount: number;
  calculationType: 'fixed' | 'perArea' | 'perUnit';
  includeParking: boolean;
  commercialMultiplier: number;
}

export interface ChargeCalculation {
  unitId: number;
  unitNumber: string;
  area: number;
  categories: {
    [categoryId: string]: {
      amount: number;
      calculation: string;
    };
  };
  totalAmount: number;
  breakdown: string[];
}
