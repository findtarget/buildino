// src/lib/enhancedMockData.ts
import { EnhancedTransaction, Vendor, Budget, TransactionStatus } from '@/types/accounting';
import { categoryAccountMapping } from './chartOfAccounts';

export const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'شرکت آسانسور پارس',
    type: 'Company',
    contactPerson: 'مهندس احمدی',
    phone: '02144556677',
    email: 'info@parseleveator.com',
    address: 'تهران، خیابان انقلاب',
    economicCode: '123456789',
    isActive: true
  },
  {
    id: 'vendor-2',
    name: 'علی رضایی',
    type: 'Individual',
    phone: '09121234567',
    nationalId: '0012345678',
    bankAccount: '6037-9919-1234-5678',
    isActive: true
  },
  {
    id: 'vendor-3',
    name: 'شرکت برق منطقه‌ای تهران',
    type: 'Company',
    phone: '02191',
    address: 'تهران',
    isActive: true
  }
];

export const mockBudgets: Budget[] = [
  {
    id: 'budget-1',
    year: 1404,
    category: 'Utilities',
    budgetAmount: 12000000,
    spentAmount: 8500000,
    remainingAmount: 3500000,
    variance: -8500000,
    variancePercentage: -70.8,
    lastUpdated: '1404/06/01'
  },
  {
    id: 'budget-2',
    year: 1404,
    category: 'Repairs',
    budgetAmount: 15000000,
    spentAmount: 12750000,
    remainingAmount: 2250000,
    variance: -12750000,
    variancePercentage: -85,
    lastUpdated: '1404/06/01'
  },
  {
    id: 'budget-3',
    year: 1404,
    category: 'Salaries',
    budgetAmount: 48000000,
    spentAmount: 24000000,
    remainingAmount: 24000000,
    variance: -24000000,
    variancePercentage: -50,
    lastUpdated: '1404/06/01'
  }
];

// Generate sequential transaction numbers
let transactionCounter = 1001;
const generateTransactionNumber = () => `TXN-${1404}-${String(transactionCounter++).padStart(4, '0')}`;

export const mockEnhancedTransactions: EnhancedTransaction[] = [
  {
    id: 'txn-1',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/01',
    title: 'شارژ ماه مرداد - واحد 101',
    description: 'شارژ ماهانه شامل: آسانسور، نظافت، نگهبانی',
    type: 'Income',
    category: 'MonthlyCharge',
    baseAmount: 500000,
    finalAmount: 500000,
    amount: 500000, // Legacy compatibility
    relatedUnitId: 1,
    accountCode: categoryAccountMapping['MonthlyCharge'],
    status: TransactionStatus.Posted,
    isCharge: true,
    createdAt: '1404/05/01',
    createdBy: 'admin',
    tags: ['شارژ_ماهانه', 'واحد_101']
  },
  {
    id: 'txn-2',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/03',
    title: 'تعمیر آسانسور - تعویض کابل',
    description: 'تعویض کابل فولادی آسانسور طبقه 3',
    type: 'Expense',
    category: 'Repairs',
    baseAmount: 1200000,
    taxAmount: 50000,
    finalAmount: 1250000,
    amount: 1250000,
    vendorId: 'vendor-1',
    invoiceNumber: 'INV-001234',
    accountCode: categoryAccountMapping['Repairs'],
    costCenter: 'CC-ELEVATOR',
    status: TransactionStatus.Posted,
    isCharge: false,
    createdAt: '1404/05/03',
    createdBy: 'admin',
    tags: ['تعمیرات', 'آسانسور', 'اضطراری']
  },
  {
    id: 'txn-3',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/05',
    title: 'قبض برق عمومی - مرداد 1404',
    description: 'برق مشاعات و روشنایی ساختمان',
    type: 'Expense',
    category: 'Utilities',
    subCategory: 'Electricity',
    baseAmount: 350000,
    finalAmount: 350000,
    amount: 350000,
    vendorId: 'vendor-3',
    invoiceNumber: 'ELEC-1404-05',
    accountCode: '5101001', // قبض برق
    status: TransactionStatus.Posted,
    isCharge: false,
    createdAt: '1404/05/05',
    createdBy: 'admin',
    tags: ['قبوض', 'برق', 'مشاعات']
  },
  {
    id: 'txn-4',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/10',
    title: 'شارژ ماه مرداد - واحد 102',
    description: 'شارژ ماهانه شامل کلیه هزینه‌های مشترک',
    type: 'Income',
    category: 'MonthlyCharge',
    baseAmount: 650000,
    finalAmount: 650000,
    amount: 650000,
    relatedUnitId: 2,
    accountCode: categoryAccountMapping['MonthlyCharge'],
    status: TransactionStatus.Posted,
    isCharge: true,
    createdAt: '1404/05/10',
    createdBy: 'admin',
    tags: ['شارژ_ماهانه', 'واحد_102']
  },
  {
    id: 'txn-5',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/12',
    title: 'حقوق سرایدار - مرداد 1404',
    description: 'حقوق ماهانه آقای حسینی - سرایدار ساختمان',
    type: 'Expense',
    category: 'Salaries',
    baseAmount: 4000000,
    finalAmount: 4000000,
    amount: 4000000,
    vendorId: 'vendor-2',
    accountCode: categoryAccountMapping['Salaries'],
    costCenter: 'CC-STAFF',
    status: TransactionStatus.Posted,
    isCharge: false,
    createdAt: '1404/05/12',
    createdBy: 'admin',
    tags: ['حقوق', 'سرایدار', 'ماهانه']
  },
  {
    id: 'txn-6',
    transactionNumber: generateTransactionNumber(),
    date: '1404/05/15',
    title: 'اجاره پارکینگ مهمان',
    description: 'درآمد اجاره پارکینگ مهمان - 10 روز',
    type: 'Income',
    category: 'ParkingRental',
    baseAmount: 200000,
    finalAmount: 200000,
    amount: 200000,
    accountCode: categoryAccountMapping['ParkingRental'],
    status: TransactionStatus.Posted,
    isCharge: false,
    createdAt: '1404/05/15',
    createdBy: 'admin',
    tags: ['پارکینگ', 'اجاره', 'مهمان']
  },
  {
    id: 'txn-7',
    transactionNumber: generateTransactionNumber(),
    date: '1404/06/01',
    title: 'خرید مواد شوینده و بهداشتی',
    description: 'خرید مواد نظافت و بهداشتی برای ساختمان',
    type: 'Expense',
    category: 'Cleaning',
    baseAmount: 150000,
    finalAmount: 150000,
    amount: 150000,
    receiptNumber: 'RCP-001',
    accountCode: categoryAccountMapping['Cleaning'],
    status: TransactionStatus.Pending,
    isCharge: false,
    createdAt: '1404/06/01',
    createdBy: 'admin',
    tags: ['نظافت', 'مواد_شوینده']
  },
  {
    id: 'txn-8',
    transactionNumber: generateTransactionNumber(),
    date: '1404/06/02',
    title: 'شارژ ماه شهریور - واحد 201',
    description: 'شارژ ماهانه واحد بزرگ طبقه دوم',
    type: 'Income',
    category: 'MonthlyCharge',
    baseAmount: 850000,
    finalAmount: 850000,
    amount: 850000,
    relatedUnitId: 4,
    accountCode: categoryAccountMapping['MonthlyCharge'],
    status: TransactionStatus.Draft,
    isCharge: true,
    createdAt: '1404/06/02',
    createdBy: 'admin',
    tags: ['شارژ_ماهانه', 'واحد_201', 'پیش_نویس']
  }
];

// Transaction number generator utility
export const getNextTransactionNumber = (): string => {
  return generateTransactionNumber();
};

// Get transactions by status
export const getTransactionsByStatus = (status: TransactionStatus): EnhancedTransaction[] => {
  return mockEnhancedTransactions.filter(t => t.status === status);
};

// Get transactions by date range
export const getTransactionsByDateRange = (fromDate: string, toDate: string): EnhancedTransaction[] => {
  return mockEnhancedTransactions.filter(t => t.date >= fromDate && t.date <= toDate);
};
