// src/lib/chartOfAccounts.ts
import { ChartOfAccount, AccountType } from '@/types/accounting.d';

export const defaultChartOfAccounts: ChartOfAccount[] = [
  // Assets - دارایی‌ها (1000-1999)
  { code: '1000', title: 'دارایی‌ها', level: 1, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1100', title: 'دارایی‌های جاری', parent: '1000', level: 2, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1101', title: 'نقد و بانک', parent: '1100', level: 3, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1101001', title: 'صندوق', parent: '1101', level: 4, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1101002', title: 'بانک ملی', parent: '1101', level: 4, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1101003', title: 'بانک پاسارگاد', parent: '1101', level: 4, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  
  { code: '1102', title: 'حساب‌های دریافتنی', parent: '1100', level: 3, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1102001', title: 'مطالبات واحدهای مسکونی', parent: '1102', level: 4, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '1102002', title: 'مطالبات واحدهای تجاری', parent: '1102', level: 4, type: AccountType.Asset, normalBalance: 'Debit', isActive: true, balance: 0 },
  
  // Liabilities - بدهی‌ها (2000-2999)
  { code: '2000', title: 'بدهی‌ها', level: 1, type: AccountType.Liability, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '2100', title: 'بدهی‌های جاری', parent: '2000', level: 2, type: AccountType.Liability, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '2101', title: 'حساب‌های پرداختنی', parent: '2100', level: 3, type: AccountType.Liability, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '2101001', title: 'بدهی به پیمانکاران', parent: '2101', level: 4, type: AccountType.Liability, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '2101002', title: 'بدهی حقوق و دستمزد', parent: '2101', level: 4, type: AccountType.Liability, normalBalance: 'Credit', isActive: true, balance: 0 },
  
  // Revenue - درآمدها (4000-4999)
  { code: '4000', title: 'درآمدها', level: 1, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4100', title: 'درآمد عملیاتی', parent: '4000', level: 2, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4101', title: 'درآمد شارژ ماهانه', parent: '4100', level: 3, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4101001', title: 'شارژ واحدهای مسکونی', parent: '4101', level: 4, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4101002', title: 'شارژ واحدهای تجاری', parent: '4101', level: 4, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4102', title: 'سایر درآمدها', parent: '4100', level: 3, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  { code: '4102001', title: 'درآمد اجاره پارکینگ', parent: '4102', level: 4, type: AccountType.Revenue, normalBalance: 'Credit', isActive: true, balance: 0 },
  
  // Expenses - هزینه‌ها (5000-5999)
  { code: '5000', title: 'هزینه‌ها', level: 1, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5100', title: 'هزینه‌های عملیاتی', parent: '5000', level: 2, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5101', title: 'هزینه‌های مشاعات', parent: '5100', level: 3, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5101001', title: 'قبض برق', parent: '5101', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5101002', title: 'قبض گاز', parent: '5101', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5101003', title: 'قبض آب', parent: '5101', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  
  { code: '5102', title: 'هزینه‌های تعمیر و نگهداری', parent: '5100', level: 3, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5102001', title: 'تعمیر آسانسور', parent: '5102', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5102002', title: 'تعمیرات عمومی ساختمان', parent: '5102', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  
  { code: '5103', title: 'حقوق و دستمزد', parent: '5100', level: 3, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5103001', title: 'حقوق سرایدار', parent: '5103', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5103002', title: 'حقوق نظافتچی', parent: '5103', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  
  { code: '5104', title: 'هزینه‌های اداری', parent: '5100', level: 3, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
  { code: '5104001', title: 'لوازم‌التحریر', parent: '5104', level: 4, type: AccountType.Expense, normalBalance: 'Debit', isActive: true, balance: 0 },
];

// Category to Account Code Mapping
export const categoryAccountMapping: Record<string, string> = {
  // Income categories
  'MonthlyCharge': '4101001',
  'ParkingRental': '4102001',
  'MiscellaneousIncome': '4102001',
  
  // Expense categories
  'Utilities': '5101001', // Default to electricity, can be refined
  'Repairs': '5102001',
  'Salaries': '5103001',
  'Cleaning': '5103002',
  'Miscellaneous': '5104001',
};

export const getAccountByCode = (code: string): ChartOfAccount | undefined => {
  return defaultChartOfAccounts.find(acc => acc.code === code);
};

export const getAccountsByType = (type: AccountType): ChartOfAccount[] => {
  return defaultChartOfAccounts.filter(acc => acc.type === type);
};

export const getAccountsByParent = (parentCode: string): ChartOfAccount[] => {
  return defaultChartOfAccounts.filter(acc => acc.parent === parentCode);
};
