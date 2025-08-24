// src/lib/chartOfAccounts.ts
import { ChartOfAccount, AccountType } from '@/types/accounting';

export const defaultChartOfAccounts: ChartOfAccount[] = [
  // Assets - دارایی‌ها (1000-1999)
  {
    code: '1000',
    title: 'دارایی‌ها',
    type: AccountType.Asset,
    level: 0,
    isActive: true,
    description: 'گروه اصلی دارایی‌ها'
  },
  {
    code: '1100',
    title: 'دارایی‌های جاری',
    type: AccountType.Asset,
    parent: '1000',
    level: 1,
    isActive: true,
  },
  {
    code: '1110',
    title: 'نقد و بانک',
    type: AccountType.Asset,
    parent: '1100',
    level: 2,
    isActive: true,
  },
  {
    code: '1111',
    title: 'صندوق',
    type: AccountType.Asset,
    parent: '1110',
    level: 3,
    isActive: true,
  },
  {
    code: '1112',
    title: 'حساب جاری بانک',
    type: AccountType.Asset,
    parent: '1110',
    level: 3,
    isActive: true,
  },
  {
    code: '1113',
    title: 'حساب پس‌انداز',
    type: AccountType.Asset,
    parent: '1110',
    level: 3,
    isActive: true,
  },

  // Liabilities - بدهی‌ها (2000-2999)
  {
    code: '2000',
    title: 'بدهی‌ها',
    type: AccountType.Liability,
    level: 0,
    isActive: true,
    description: 'گروه اصلی بدهی‌ها'
  },
  {
    code: '2100',
    title: 'بدهی‌های جاری',
    type: AccountType.Liability,
    parent: '2000',
    level: 1,
    isActive: true,
  },
  {
    code: '2110',
    title: 'حساب‌های پرداختنی',
    type: AccountType.Liability,
    parent: '2100',
    level: 2,
    isActive: true,
  },
  {
    code: '2120',
    title: 'پیش‌دریافت‌ها',
    type: AccountType.Liability,
    parent: '2100',
    level: 2,
    isActive: true,
  },
  {
    code: '2121',
    title: 'پیش‌دریافت شارژ ماهانه',
    type: AccountType.Liability,
    parent: '2120',
    level: 3,
    isActive: true,
  },

  // Equity - حقوق صاحبان سهام (3000-3999)
  {
    code: '3000',
    title: 'حقوق مالکین',
    type: AccountType.Equity,
    level: 0,
    isActive: true,
    description: 'گروه اصلی حقوق مالکین'
  },
  {
    code: '3100',
    title: 'سرمایه',
    type: AccountType.Equity,
    parent: '3000',
    level: 1,
    isActive: true,
  },
  {
    code: '3200',
    title: 'سود انباشته',
    type: AccountType.Equity,
    parent: '3000',
    level: 1,
    isActive: true,
  },

  // Revenue - درآمدها (4000-4999)
  {
    code: '4000',
    title: 'درآمدها',
    type: AccountType.Revenue,
    level: 0,
    isActive: true,
    description: 'گروه اصلی درآمدها'
  },
  {
    code: '4100',
    title: 'درآمد شارژ ماهانه',
    type: AccountType.Revenue,
    parent: '4000',
    level: 1,
    isActive: true,
  },
  {
    code: '4110',
    title: 'شارژ ماهانه واحدهای مسکونی',
    type: AccountType.Revenue,
    parent: '4100',
    level: 2,
    isActive: true,
  },
  {
    code: '4111',
    title: 'شارژ عادی',
    type: AccountType.Revenue,
    parent: '4110',
    level: 3,
    isActive: true,
  },
  {
    code: '4112',
    title: 'شارژ ویژه',
    type: AccountType.Revenue,
    parent: '4110',
    level: 3,
    isActive: true,
  },
  {
    code: '4200',
    title: 'سایر درآمدها',
    type: AccountType.Revenue,
    parent: '4000',
    level: 1,
    isActive: true,
  },
  {
    code: '4210',
    title: 'درآمد پارکینگ',
    type: AccountType.Revenue,
    parent: '4200',
    level: 2,
    isActive: true,
  },
  {
    code: '4220',
    title: 'درآمد جریمه تاخیر',
    type: AccountType.Revenue,
    parent: '4200',
    level: 2,
    isActive: true,
  },

  // Expenses - هزینه‌ها (5000-5999)
  {
    code: '5000',
    title: 'هزینه‌ها',
    type: AccountType.Expense,
    level: 0,
    isActive: true,
    description: 'گروه اصلی هزینه‌ها'
  },
  {
    code: '5100',
    title: 'هزینه‌های عملیاتی',
    type: AccountType.Expense,
    parent: '5000',
    level: 1,
    isActive: true,
  },
  {
    code: '5110',
    title: 'هزینه تعمیر و نگهداری',
    type: AccountType.Expense,
    parent: '5100',
    level: 2,
    isActive: true,
  },
  {
    code: '5111',
    title: 'تعمیر آسانسور',
    type: AccountType.Expense,
    parent: '5110',
    level: 3,
    isActive: true,
  },
  {
    code: '5112',
    title: 'تعمیر لوله‌کشی',
    type: AccountType.Expense,
    parent: '5110',
    level: 3,
    isActive: true,
  },
  {
    code: '5113',
    title: 'تعمیر برق',
    type: AccountType.Expense,
    parent: '5110',
    level: 3,
    isActive: true,
  },
  {
    code: '5120',
    title: 'هزینه نظافت',
    type: AccountType.Expense,
    parent: '5100',
    level: 2,
    isActive: true,
  },
  {
    code: '5121',
    title: 'حقوق نظافتچی',
    type: AccountType.Expense,
    parent: '5120',
    level: 3,
    isActive: true,
  },
  {
    code: '5122',
    title: 'مواد شوینده',
    type: AccountType.Expense,
    parent: '5120',
    level: 3,
    isActive: true,
  },
  {
    code: '5130',
    title: 'هزینه مشاعات',
    type: AccountType.Expense,
    parent: '5100',
    level: 2,
    isActive: true,
  },
  {
    code: '5131',
    title: 'برق مشاعات',
    type: AccountType.Expense,
    parent: '5130',
    level: 3,
    isActive: true,
  },
  {
    code: '5132',
    title: 'گاز مشاعات',
    type: AccountType.Expense,
    parent: '5130',
    level: 3,
    isActive: true,
  },
  {
    code: '5133',
    title: 'آب مشاعات',
    type: AccountType.Expense,
    parent: '5130',
    level: 3,
    isActive: true,
  },
  {
    code: '5200',
    title: 'هزینه‌های اداری',
    type: AccountType.Expense,
    parent: '5000',
    level: 1,
    isActive: true,
  },
  {
    code: '5210',
    title: 'حقوق و دستمزد',
    type: AccountType.Expense,
    parent: '5200',
    level: 2,
    isActive: true,
  },
  {
    code: '5211',
    title: 'حقوق سرایدار',
    type: AccountType.Expense,
    parent: '5210',
    level: 3,
    isActive: true,
  },
  {
    code: '5220',
    title: 'لوازم اداری',
    type: AccountType.Expense,
    parent: '5200',
    level: 2,
    isActive: true,
  },
];

// Helper functions
export const getAccountByCode = (code: string): ChartOfAccount | undefined => {
  return defaultChartOfAccounts.find(account => account.code === code);
};

export const getAccountsByType = (type: AccountType): ChartOfAccount[] => {
  return defaultChartOfAccounts.filter(account => account.type === type && account.isActive);
};

export const getAccountsByParent = (parentCode: string): ChartOfAccount[] => {
  return defaultChartOfAccounts.filter(account => account.parent === parentCode && account.isActive);
};

export const getAccountHierarchy = (code: string): ChartOfAccount[] => {
  const hierarchy: ChartOfAccount[] = [];
  let currentAccount = getAccountByCode(code);

  while (currentAccount) {
    hierarchy.unshift(currentAccount);
    if (currentAccount.parent) {
      currentAccount = getAccountByCode(currentAccount.parent);
    } else {
      break;
    }
  }

  return hierarchy;
};

export const formatAccountTitle = (code: string): string => {
  const account = getAccountByCode(code);
  return account ? `${account.code} - ${account.title}` : code;
};
