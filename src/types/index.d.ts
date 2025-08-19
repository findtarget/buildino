// src/types/index.d.ts

export type UnitStatus = 'OwnerOccupied' | 'TenantOccupied' | 'Vacant';
export type UnitType = 'Residential' | 'Commercial';

export interface Unit {
  id: number;
  unitNumber: string;
  floor: number;
  area: number;
  type: UnitType;
  ownerName: string;
  ownerContact: string;
  ownerNationalId: string | null; // F: [جدید] کد ملی مالک
  status: UnitStatus;
  residentName: string;
  residentContact: string;
  residentNationalId: string | null; // F: [جدید] کد ملی ساکن
  residentCount: number; // F: [اصلاح] این فیلد از قبل بود و حفظ شده
  parkingSpots: number;
  hasStorage: boolean;
  balance: number;
  ownerSince: string | null;
  residentSince: string | null;
}

// F: [جدید] تعریف انواع داده برای ماژول حسابداری

export type TransactionType = 'Income' | 'Expense';

export type TransactionCategory = 
  // Expense Categories
  'Maintenance' | 'Utilities' | 'StaffSalary' | 'Repairs' | 'Supplies' | 'Management' |
  // Income Categories
  'MonthlyCharge' | 'MiscellaneousIncome' | 'LateFee';

export interface Transaction {
  id: number;
  date: string; // "YYYY/MM/DD"
  title: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  relatedUnitId?: number; // Optional: Links transaction to a specific unit
  isCharge: boolean; // True if it's a charge (debit), false if it's a payment (credit) for a unit
}
