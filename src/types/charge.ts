// src/types/charge.ts
export interface UnitChargeInfo {
  id: number;
  unitNumber: string;
  area: number;
  ownerType: 'owner' | 'tenant';
  hasParking: boolean;
  parkingCount: number;
  isCommercial: boolean;
  floorCoefficient: number;
  balconyArea: number;
}

export interface ChargeCategory {
  id: string;
  title: string;
  baseAmount: number;
  calculationType: 'fixed' | 'perArea' | 'perUnit';
  includeParking: boolean;
  commercialMultiplier: number;
  description: string;
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

export interface MonthlyChargeRecord {
  id: string;
  month: string; // 1404/06
  unitId: number;
  amount: number;
  createdAt: string;
}
