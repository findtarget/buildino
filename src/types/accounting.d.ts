// src/types/accounting.d.ts
export interface ChartOfAccount {
  code: string; // e.g., "1101001"
  title: string;
  titleEn?: string;
  parent?: string;
  level: number;
  type: AccountType;
  normalBalance: 'Debit' | 'Credit';
  isActive: boolean;
  description?: string;
  balance: number;
}

export enum AccountType {
  Asset = 'Asset',           // دارایی
  Liability = 'Liability',   // بدهی
  Equity = 'Equity',         // حقوق صاحبان سهام
  Revenue = 'Revenue',       // درآمد
  Expense = 'Expense',       // هزینه
}

export interface EnhancedTransaction {
  id: string;
  transactionNumber: string;
  date: string; // Jalali date
  effectiveDate?: string;
  
  // Core Data
  title: string;
  description?: string;
  type: 'Income' | 'Expense';
  category: string;
  subCategory?: string;
  
  // Financial Details
  baseAmount: number;
  taxAmount?: number;
  discountAmount?: number;
  finalAmount: number;
  
  // References
  relatedUnitId?: number;
  vendorId?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  
  // Accounting
  accountCode: string;
  costCenter?: string;
  
  // Status & Workflow
  status: TransactionStatus;
  
  // Legacy compatibility
  amount: number; // = finalAmount
  isCharge: boolean;
  
  // Audit
  createdAt: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
  
  // Attachments
  attachments?: DocumentAttachment[];
  tags?: string[];
}

export enum TransactionStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Posted = 'Posted',
  Cancelled = 'Cancelled'
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'Individual' | 'Company';
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  nationalId?: string;
  economicCode?: string;
  bankAccount?: string;
  isActive: boolean;
}

export interface Budget {
  id: string;
  year: number;
  month?: number;
  category: string;
  subCategory?: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  variance: number;
  variancePercentage: number;
  lastUpdated: string;
}
