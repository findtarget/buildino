// src/lib/mockReportData.ts
import { Transaction } from '@/types/accounting';

export const mockReportTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    date: '1403/08/15',
    title: 'دریافت شارژ ماهانه - طبقه اول',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 101',
    status: 'Posted',
    description: 'شارژ ماهانه مهر ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/08/15',
    updatedAt: '1403/08/15'
  },
  {
    id: 'TXN-002',
    date: '1403/08/15',
    title: 'دریافت شارژ ماهانه - طبقه دوم',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 201',
    status: 'Posted',
    description: 'شارژ ماهانه مهر ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/08/15',
    updatedAt: '1403/08/15'
  },
  {
    id: 'TXN-003',
    date: '1403/08/15',
    title: 'دریافت شارژ ماهانه - طبقه سوم',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 301',
    status: 'Posted',
    description: 'شارژ ماهانه مهر ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/08/15',
    updatedAt: '1403/08/15'
  },
  {
    id: 'TXN-004',
    date: '1403/08/16',
    title: 'پرداخت قبض برق',
    category: 'utilities',
    type: 'expense',
    amount: 850000,
    finalAmount: 850000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'قبض برق مهر ماه - قبض شماره 12345',
    tags: ['برق', 'هزینه'],
    createdAt: '1403/08/16',
    updatedAt: '1403/08/16'
  },
  {
    id: 'TXN-005',
    date: '1403/08/17',
    title: 'پرداخت قبض آب',
    category: 'utilities',
    type: 'expense',
    amount: 450000,
    finalAmount: 450000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'قبض آب مهر ماه',
    tags: ['آب', 'هزینه'],
    createdAt: '1403/08/17',
    updatedAt: '1403/08/17'
  },
  {
    id: 'TXN-006',
    date: '1403/08/18',
    title: 'هزینه نظافت',
    category: 'maintenance',
    type: 'expense',
    amount: 600000,
    finalAmount: 600000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'دستمزد نظافتچی - هفته سوم مهر',
    tags: ['نظافت', 'نگهداری'],
    createdAt: '1403/08/18',
    updatedAt: '1403/08/18'
  },
  {
    id: 'TXN-007',
    date: '1403/08/20',
    title: 'تعمیر آسانسور',
    category: 'maintenance',
    type: 'expense',
    amount: 1200000,
    finalAmount: 1200000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'تعویض کابل آسانسور',
    tags: ['آسانسور', 'تعمیر'],
    createdAt: '1403/08/20',
    updatedAt: '1403/08/20'
  },
  {
    id: 'TXN-008',
    date: '1403/08/22',
    title: 'دریافت شارژ آسانسور - واحد 102',
    category: 'elevator-charge',
    type: 'income',
    amount: 500000,
    finalAmount: 500000,
    unit: 'واحد 102',
    status: 'Posted',
    description: 'شارژ آسانسور فوق‌العاده',
    tags: ['آسانسور', 'درآمد'],
    createdAt: '1403/08/22',
    updatedAt: '1403/08/22'
  },
  {
    id: 'TXN-009',
    date: '1403/08/25',
    title: 'خرید لوازم نظافت',
    category: 'supplies',
    type: 'expense',
    amount: 320000,
    finalAmount: 320000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'خرید مواد شوینده و ابزار نظافت',
    tags: ['لوازم', 'نظافت'],
    createdAt: '1403/08/25',
    updatedAt: '1403/08/25'
  },
  {
    id: 'TXN-010',
    date: '1403/08/28',
    title: 'دریافت شارژ پارکینگ - واحد 201',
    category: 'parking-charge',
    type: 'income',
    amount: 300000,
    finalAmount: 300000,
    unit: 'واحد 201',
    status: 'Pending',
    description: 'شارژ پارکینگ مهر ماه',
    tags: ['پارکینگ', 'درآمد'],
    createdAt: '1403/08/28',
    updatedAt: '1403/08/28'
  },
  {
    id: 'TXN-011',
    date: '1403/09/01',
    title: 'دریافت شارژ ماهانه - طبقه اول',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 101',
    status: 'Posted',
    description: 'شارژ ماهانه آبان ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/09/01',
    updatedAt: '1403/09/01'
  },
  {
    id: 'TXN-012',
    date: '1403/09/01',
    title: 'دریافت شارژ ماهانه - طبقه دوم',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 201',
    status: 'Posted',
    description: 'شارژ ماهانه آبان ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/09/01',
    updatedAt: '1403/09/01'
  },
  {
    id: 'TXN-013',
    date: '1403/09/01',
    title: 'دریافت شارژ ماهانه - طبقه سوم',
    category: 'monthly-charge',
    type: 'income',
    amount: 2500000,
    finalAmount: 2500000,
    unit: 'واحد 301',
    status: 'Draft',
    description: 'شارژ ماهانه آبان ماه',
    tags: ['شارژ', 'درآمد'],
    createdAt: '1403/09/01',
    updatedAt: '1403/09/01'
  },
  {
    id: 'TXN-014',
    date: '1403/09/05',
    title: 'پرداخت قبض گاز',
    category: 'utilities',
    type: 'expense',
    amount: 650000,
    finalAmount: 650000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'قبض گاز آبان ماه',
    tags: ['گاز', 'هزینه'],
    createdAt: '1403/09/05',
    updatedAt: '1403/09/05'
  },
  {
    id: 'TXN-015',
    date: '1403/09/10',
    title: 'هزینه نگهبانی',
    category: 'security',
    type: 'expense',
    amount: 1800000,
    finalAmount: 1800000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'حقوق نگهبان - آبان ماه',
    tags: ['نگهبانی', 'حقوق'],
    createdAt: '1403/09/10',
    updatedAt: '1403/09/10'
  },
  {
    id: 'TXN-016',
    date: '1403/09/12',
    title: 'تعمیر درب ورودی',
    category: 'maintenance',
    type: 'expense',
    amount: 750000,
    finalAmount: 750000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'تعمیر قفل و لولای درب اصلی',
    tags: ['درب', 'تعمیر'],
    createdAt: '1403/09/12',
    updatedAt: '1403/09/12'
  },
  {
    id: 'TXN-017',
    date: '1403/09/15',
    title: 'دریافت جریمه تاخیر - واحد 102',
    category: 'penalty',
    type: 'income',
    amount: 150000,
    finalAmount: 150000,
    unit: 'واحد 102',
    status: 'Posted',
    description: 'جریمه تاخیر در پرداخت شارژ',
    tags: ['جریمه', 'تاخیر'],
    createdAt: '1403/09/15',
    updatedAt: '1403/09/15'
  },
  {
    id: 'TXN-018',
    date: '1403/09/18',
    title: 'خرید کلید یدکی',
    category: 'supplies',
    type: 'expense',
    amount: 80000,
    finalAmount: 80000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'ساخت کلید یدکی درب ورودی',
    tags: ['کلید', 'لوازم'],
    createdAt: '1403/09/18',
    updatedAt: '1403/09/18'
  },
  {
    id: 'TXN-019',
    date: '1403/09/20',
    title: 'بیمه ساختمان',
    category: 'insurance',
    type: 'expense',
    amount: 2200000,
    finalAmount: 2200000,
    unit: 'مشترک',
    status: 'Posted',
    description: 'قسط فصلی بیمه ساختمان',
    tags: ['بیمه', 'فصلی'],
    createdAt: '1403/09/20',
    updatedAt: '1403/09/20'
  },
  {
    id: 'TXN-020',
    date: '1403/09/25',
    title: 'دریافت وام کوتاه‌مدت',
    category: 'loan',
    type: 'income',
    amount: 5000000,
    finalAmount: 5000000,
    unit: 'مشترک',
    status: 'Pending',
    description: 'وام برای تعمیرات اضطراری',
    tags: ['وام', 'اضطراری'],
    createdAt: '1403/09/25',
    updatedAt: '1403/09/25'
  }
];

// ستون‌های گزارش برای نمایش داده‌ها
export const reportColumns = [
  {
    id: 'date',
    field: 'date',
    title: 'تاریخ',
    type: 'text',
    sortable: true
  },
  {
    id: 'title',
    field: 'title',
    title: 'عنوان',
    type: 'text',
    sortable: true
  },
  {
    id: 'category',
    field: 'category',
    title: 'دسته‌بندی',
    type: 'text',
    sortable: true
  },
  {
    id: 'type',
    field: 'type',
    title: 'نوع',
    type: 'text',
    sortable: true
  },
  {
    id: 'amount',
    field: 'finalAmount',
    title: 'مبلغ (ریال)',
    type: 'currency',
    sortable: true
  },
  {
    id: 'unit',
    field: 'unit',
    title: 'واحد',
    type: 'text',
    sortable: true
  },
  {
    id: 'status',
    field: 'status',
    title: 'وضعیت',
    type: 'text',
    sortable: true
  }
];

// محاسبه خلاصه گزارش
export const calculateReportSummary = (transactions: Transaction[]) => {
  const totalRecords = transactions.length;
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.finalAmount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.finalAmount, 0);
  const netAmount = totalIncome - totalExpense;

  return {
    totalRecords,
    totalIncome,
    totalExpense,
    netAmount
  };
};

// گروه‌بندی بر اساس دسته‌بندی
export const groupByCategory = (transactions: Transaction[]) => {
  const groups: { [key: string]: { income: number; expense: number; count: number } } = {};

  transactions.forEach(transaction => {
    if (!groups[transaction.category]) {
      groups[transaction.category] = { income: 0, expense: 0, count: 0 };
    }
    
    if (transaction.type === 'income') {
      groups[transaction.category].income += transaction.finalAmount;
    } else {
      groups[transaction.category].expense += transaction.finalAmount;
    }
    
    groups[transaction.category].count++;
  });

  return groups;
};

// گروه‌بندی بر اساس واحد
export const groupByUnit = (transactions: Transaction[]) => {
  const units: { [key: string]: { income: number; expense: number; count: number } } = {};

  transactions.forEach(transaction => {
    if (!units[transaction.unit || 'نامشخص']) {
      units[transaction.unit || 'نامشخص'] = { income: 0, expense: 0, count: 0 };
    }
    
    if (transaction.type === 'income') {
      units[transaction.unit || 'نامشخص'].income += transaction.finalAmount;
    } else {
      units[transaction.unit || 'نامشخص'].expense += transaction.finalAmount;
    }
    
    units[transaction.unit || 'نامشخص'].count++;
  });

  return units;
};

// داده‌های نمودار ماهانه
export const getMonthlyData = (transactions: Transaction[]) => {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  transactions.forEach(transaction => {
    const month = transaction.date.substring(0, 7); // 1403/08
    
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.finalAmount;
    } else {
      monthlyData[month].expense += transaction.finalAmount;
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));
};
