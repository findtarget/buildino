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
  Asset = 'ASSET',
  Liability = 'LIABILITY', 
  Equity = 'EQUITY',
  Revenue = 'REVENUE',
  Expense = 'EXPENSE'
}

// Base interface
export interface BaseAccount {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  type: AccountType;
  parentId?: string;
  level: number;
  isActive: boolean;
  description?: string;
  buildingId: number;
}

// Database Account with relations
export interface Account extends BaseAccount {
  createdAt: Date;
  updatedAt: Date;
  parent?: Account;
  children?: Account[];
  _count: {
    children: number;
    journalLines: number;
    transactions: number;
  };
}

export enum JournalEntryStatus {
  Draft = 'Draft',
  Posted = 'Posted',
  Cancelled = 'Cancelled'
}


export enum JournalStatus {
  Draft = 'Draft',
  Posted = 'Posted',
  Reversed = 'Reversed'
}

// اینترفیس‌ها
export interface Account {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  type: AccountType;
  parentId?: string;
  level: number;
  isActive: boolean;
  description?: string;
  buildingId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent?: Account;
  children?: Account[];
  _count: {
    children: number;
    journalLines: number;
    transactions: number;
  };
}

export interface JournalEntry {
  id: string;
  date: Date;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: JournalEntryStatus;
  createdBy: string;
  approvedBy?: string;
  buildingId: number;
  lines: JournalEntryLine[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntryLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  account?: ChartOfAccount;
  description: string;
  debit: number;
  credit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChartOfAccount {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  type: AccountType;
  parentId?: string;
  level: number;
  description?: string;
  isActive: boolean;
  buildingId: number;
  createdAt: Date;
  updatedAt: Date;

  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
  _count: {
    children: number;
    journalLines: number;
    transactions: number;
  };
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

export interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountTitle: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'debit' | 'credit';
  hasActivity: boolean;
}

export interface TrialBalance {
  accounts: TrialBalanceItem[];
  totals: {
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
  };
  period: {
    from?: string;
    to?: string;
  };
}

export interface TrialBalanceEntry {
  accountId: string;
  accountCode: string;
  accountTitle: string;
  accountType: AccountType;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface BalanceSheetData {
  assets: {
    current: TrialBalanceEntry[];
    nonCurrent: TrialBalanceEntry[];
    total: number;
  };
  liabilities: {
    current: TrialBalanceEntry[];
    nonCurrent: TrialBalanceEntry[];
    total: number;
  };
  equity: {
    items: TrialBalanceEntry[];
    total: number;
  };
}

export interface IncomeStatementData {
  revenue: {
    items: TrialBalanceEntry[];
    total: number;
  };
  expenses: {
    items: TrialBalanceEntry[];
    total: number;
  };
  netIncome: number;
}

export interface Account extends ChartOfAccount {
  parent?: ChartOfAccount;
  children?: ChartOfAccount[];
  _count: {
    children: number;
    journalLines: number;
    transactions: number;
  };
}

//export { AccountType } from '@prisma/client';

export interface TrialBalanceAccount {
  accountId: number;
  accountCode: string;
  accountTitle: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
  balanceType: 'debit' | 'credit';
  hasActivity: boolean;
}

export interface TrialBalanceTotals {
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}