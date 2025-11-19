// src/types/index.d.ts

// =======================
// Enums based on Prisma
// =======================
export type BuildingType = 'APARTMENT' | 'COMMERCIAL' | 'MIXED_USE' | 'RESIDENTIAL_COMPLEX';
export type UsageType = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';

export type TransactionType = 'Income' | 'Expense';

// =======================
// Database-synced Models
// =======================

// ---- Building ----
export interface Building {
  id: number;
  name: string;
  address?: string | null;
  totalUnits?: number | null;
  managerName?: string | null;
  managerPhone?: string | null;
  type?: BuildingType | null;
  usage?: UsageType | null;
  hasBlocks?: boolean | null;
  blocksCount?: number | null;
  floorsCount?: number | null;
  description?: string | null;
  createdAt?: string | null; // ISO date
  updatedAt?: string | null; // ISO date
}

// ---- Unit ----
export interface Unit {
  id: number;
  buildingId: number;
  blockId?: number | null;
  unitNumber: string;
  floorNumber?: number | null;
  area: string; // Decimal from DB as string
  parkingCount: number;
  hasStorage: boolean;
  balance: number;
  type: 'Residential' | 'Commercial' | 'Official';
  status: 'Vacant' | 'OwnerOccupied' | 'TenantOccupied';
  
  // Owner Info
  ownerName: string;
  ownerContact: string;
  ownerSince?: string | null; // ISO date
  
  // Resident Info
  residentName: string;
  residentContact: string;
  residentSince?: string | null; // ISO date

  description?: string | null;
  createdAt?: string | null;    // ISO date
  updatedAt?: string | null;    // ISO date
}

// ---- User ----
export interface User {
  id: number;
  buildingId: number;
  username: string;
  password?: string;           // Usually not sent to client
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: 'admin' | 'manager' | 'accountant';
  isActive?: boolean | null;
  lastLogin?: string | null;   // ISO date
  createdAt?: string | null;   // ISO date
}

// ---- Transaction ----
export type TransactionCategory =
  // Expense
  'Maintenance' | 'Utilities' | 'StaffSalary' | 'Repairs' | 'Supplies' | 'Management' |
  // Income
  'MonthlyCharge' | 'MiscellaneousIncome' | 'LateFee';

export interface Transaction {
  id: number;
  buildingId: number;
  unitId?: number | null;
  title: string;
  amount: string;               // Decimal from DB as string
  type: TransactionType;
  category: TransactionCategory;
  transactionDate: string;      // "YYYY-MM-DD"
  description?: string | null;
  isCharge?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
