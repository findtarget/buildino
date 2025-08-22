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
  balconyArea?: number;
}

export interface ChargeCategory {
  id: string;
  title: string;
  description: string;
  baseAmount: number;
  calculationType: 'fixed' | 'perArea' | 'perUnit';
  includeParking: boolean;
  commercialMultiplier: number;
  isActive: boolean;
}

export interface CategoryCalculation {
  categoryId: string;
  amount: number;
  calculation: string;
}

export interface ChargeCalculation {
  unitId: number;
  unitNumber: string;
  area: number;
  totalAmount: number;
  categories: Record<string, CategoryCalculation>;
  breakdown: string[];
}

export interface MonthlyChargeRecord {
  id: string;
  year: number;
  month: number;
  unitId: number;
  totalAmount: number;
  categories: CategoryCalculation[];
  createdAt: string;
}

// تنظیمات شارژ
export interface ChargeSettings {
  year: number;
  categories: Record<string, {
    baseAmount: number;
    isActive: boolean;
    lastUpdated: string;
  }>;
  coefficients: {
    commercial: number;
    floor: number;
    parking: number;
  };
  lastUpdated: string;
}

export interface AppSettings {
  chargeSettings: Record<number, ChargeSettings>; // کلید: سال
  currentYear: number;
}
