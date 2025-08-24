// src/types/accounting.ts

export enum TransactionType {
  Income = 'Income',
  Expense = 'Expense'
}

export enum TransactionStatus {
  Pending = 'Pending',
  Approved = 'Approved', 
  Posted = 'Posted',
  Cancelled = 'Cancelled'
}

export enum AccountType {
  Asset = 'Asset',
  Liability = 'Liability',
  Equity = 'Equity',
  Revenue = 'Revenue',
  Expense = 'Expense'
}

export interface ChartOfAccount {
  code: string;
  title: string;
  type: AccountType;
  parent?: string;
  level: number;
  isActive: boolean;
  description?: string;
}

export interface EnhancedTransaction {
  id: number;
  transactionNumber: string;
  date: string; // Jalali format: "1403/01/15"
  title: string;
  description?: string;
  type: TransactionType;
  category: string;
  subCategory?: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  accountCode: string;
  relatedUnitId?: number;
  status: TransactionStatus;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  vendorId?: string | null;
  attachments?: string[];
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact: string;
  email?: string;
  address?: string;
  taxId?: string;
  isActive: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  averageTransactionAmount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}
