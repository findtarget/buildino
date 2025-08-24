// src/lib/mockAccountingData.ts
import { EnhancedTransaction, TransactionStatus, TransactionType, Vendor } from '@/types/accounting';

export const mockEnhancedTransactions: EnhancedTransaction[] = [
  // درآمدها - شارژ ماهانه
  {
    id: 1,
    transactionNumber: 'TXN-2024-001',
    date: '1403/01/15',
    title: 'شارژ ماهانه واحد 101',
    description: 'شارژ ماهانه فروردین ماه',
    type: TransactionType.Income,
    category: 'MonthlyCharge',
    subCategory: 'Regular',
    baseAmount: 500000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 500000,
    accountCode: '4111',
    relatedUnitId: 1,
    status: TransactionStatus.Posted,
    tags: ['monthly', 'unit-101'],
    createdAt: '1403/01/15 10:30:00',
    vendorId: null,
    attachments: []
  },
  {
    id: 2,
    transactionNumber: 'TXN-2024-002',
    date: '1403/01/15',
    title: 'شارژ ماهانه واحد 102',
    description: 'شارژ ماهانه فروردین ماه',
    type: TransactionType.Income,
    category: 'MonthlyCharge',
    subCategory: 'Regular',
    baseAmount: 520000,
    taxAmount: 0,
    discountAmount: 20000,
    finalAmount: 500000,
    accountCode: '4111',
    relatedUnitId: 2,
    status: TransactionStatus.Posted,
    tags: ['monthly', 'unit-102', 'discount'],
    createdAt: '1403/01/15 10:35:00',
    vendorId: null,
    attachments: []
  },
  {
    id: 3,
    transactionNumber: 'TXN-2024-003',
    date: '1403/01/20',
    title: 'شارژ ماهانه واحد 201',
    description: 'شارژ ماهانه فروردین ماه - واحد دوبلکس',
    type: TransactionType.Income,
    category: 'MonthlyCharge',
    subCategory: 'Premium',
    baseAmount: 750000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 750000,
    accountCode: '4112',
    relatedUnitId: 4,
    status: TransactionStatus.Posted,
    tags: ['monthly', 'unit-201', 'premium'],
    createdAt: '1403/01/20 14:20:00',
    vendorId: null,
    attachments: []
  },

  // درآمدها - پارکینگ
  {
    id: 4,
    transactionNumber: 'TXN-2024-004',
    date: '1403/01/10',
    title: 'اجاره پارکینگ مهمان',
    description: 'اجاره پارکینگ برای مهمانان ساختمان',
    type: TransactionType.Income,
    category: 'Parking',
    subCategory: 'Guest',
    baseAmount: 200000,
    taxAmount: 18000,
    discountAmount: 0,
    finalAmount: 218000,
    accountCode: '4210',
    relatedUnitId: null,
    status: TransactionStatus.Posted,
    tags: ['parking', 'guest', 'monthly'],
    createdAt: '1403/01/10 09:15:00',
    vendorId: null,
    attachments: []
  },

  // هزینه‌ها - تعمیرات
  {
    id: 5,
    transactionNumber: 'TXN-2024-005',
    date: '1403/01/08',
    title: 'تعمیر آسانسور',
    description: 'تعمیر موتورخانه آسانسور اصلی',
    type: TransactionType.Expense,
    category: 'Repairs',
    subCategory: 'Elevator',
    baseAmount: 1200000,
    taxAmount: 108000,
    discountAmount: 50000,
    finalAmount: 1258000,
    accountCode: '5111',
    relatedUnitId: null,
    status: TransactionStatus.Posted,
    tags: ['repair', 'elevator', 'urgent'],
    createdAt: '1403/01/08 16:45:00',
    vendorId: 'VND-001',
    attachments: ['invoice-001.pdf', 'repair-photo.jpg']
  },
  {
    id: 6,
    transactionNumber: 'TXN-2024-006',
    date: '1403/01/12',
    title: 'تعویض لوله‌کشی',
    description: 'تعویض لوله‌های فرسوده طبقه سوم',
    type: TransactionType.Expense,
    category: 'Repairs',
    subCategory: 'Plumbing',
    baseAmount: 850000,
    taxAmount: 76500,
    discountAmount: 0,
    finalAmount: 926500,
    accountCode: '5112',
    relatedUnitId: null,
    status: TransactionStatus.Approved,
    tags: ['repair', 'plumbing', 'floor-3'],
    createdAt: '1403/01/12 11:20:00',
    vendorId: 'VND-002',
    attachments: ['quote-plumbing.pdf']
  },

  // هزینه‌ها - نظافت
  {
    id: 7,
    transactionNumber: 'TXN-2024-007',
    date: '1403/01/05',
    title: 'خدمات نظافت ماهانه',
    description: 'نظافت مشاعات و راه‌پله‌ها - فروردین',
    type: TransactionType.Expense,
    category: 'Cleaning',
    subCategory: 'Monthly',
    baseAmount: 400000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 400000,
    accountCode: '5121',
    relatedUnitId: null,
    status: TransactionStatus.Posted,
    tags: ['cleaning', 'monthly', 'common-area'],
    createdAt: '1403/01/05 08:00:00',
    vendorId: 'VND-003',
    attachments: []
  },

  // هزینه‌ها - مشاعات
  {
    id: 8,
    transactionNumber: 'TXN-2024-008',
    date: '1403/01/25',
    title: 'قبض برق مشاعات',
    description: 'قبض برق راه‌پله و آسانسور - فروردین',
    type: TransactionType.Expense,
    category: 'Utilities',
    subCategory: 'Electricity',
    baseAmount: 320000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 320000,
    accountCode: '5131',
    relatedUnitId: null,
    status: TransactionStatus.Posted,
    tags: ['utilities', 'electricity', 'common'],
    createdAt: '1403/01/25 14:30:00',
    vendorId: null,
    attachments: ['electricity-bill.pdf']
  },
  {
    id: 9,
    transactionNumber: 'TXN-2024-009',
    date: '1403/01/28',
    title: 'قبض گاز مشاعات',
    description: 'قبض گاز موتورخانه و گرمایش مشترک',
    type: TransactionType.Expense,
    category: 'Utilities',
    subCategory: 'Gas',
    baseAmount: 180000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 180000,
    accountCode: '5132',
    relatedUnitId: null,
    status: TransactionStatus.Posted,
    tags: ['utilities', 'gas', 'heating'],
    createdAt: '1403/01/28 16:00:00',
    vendorId: null,
    attachments: ['gas-bill.pdf']
  },

  // اردیبهشت
  {
    id: 10,
    transactionNumber: 'TXN-2024-010',
    date: '1403/02/10',
    title: 'شارژ ماهانه واحد 101',
    description: 'شارژ ماهانه اردیبهشت ماه',
    type: TransactionType.Income,
    category: 'MonthlyCharge',
    subCategory: 'Regular',
    baseAmount: 500000,
    taxAmount: 0,
    discountAmount: 0,
    finalAmount: 500000,
    accountCode: '4111',
    relatedUnitId: 1,
    status: TransactionStatus.Posted,
    tags: ['monthly', 'unit-101'],
    createdAt: '1403/02/10 10:30:00',
    vendorId: null,
    attachments: []
  },

  // خرداد - هزینه بزرگ
  {
    id: 11,
    transactionNumber: 'TXN-2024-011',
    date: '1403/03/15',
    title: 'تعمیرات اساسی نما',
    description: 'بازسازی و رنگ‌آمیزی نمای ساختمان',
    type: TransactionType.Expense,
    category: 'Repairs',
    subCategory: 'Building',
    baseAmount: 3500000,
    taxAmount: 315000,
    discountAmount: 100000,
    finalAmount: 3715000,
    accountCode: '5110',
    relatedUnitId: null,
    status: TransactionStatus.Approved,
    tags: ['repair', 'building', 'facade', 'major'],
    createdAt: '1403/03/15 13:45:00',
    vendorId: 'VND-005',
    attachments: ['contract-facade.pdf', 'before-after.jpg']
  }
];

// Mock Vendors Data
export const mockVendors: Vendor[] = [
  {
    id: 'VND-001',
    name: 'شرکت تعمیرات آسانسور پارس',
    category: 'تعمیرات',
    contact: '021-88123456',
    email: 'info@parseelevator.com',
    isActive: true
  },
  {
    id: 'VND-002',
    name: 'لوله‌کشی احمدی',
    category: 'تعمیرات',
    contact: '0912-3456789',
    isActive: true
  },
  {
    id: 'VND-003',
    name: 'خدمات نظافتی گلدن',
    category: 'نظافت',
    contact: '021-77456789',
    email: 'golden.cleaning@gmail.com',
    isActive: true
  },
  {
    id: 'VND-004',
    name: 'فروشگاه مواد شوینده رضا',
    category: 'تأمین کالا',
    contact: '0935-1234567',
    isActive: true
  },
  {
    id: 'VND-005',
    name: 'پیمانکاری ساختمان نوین',
    category: 'تعمیرات',
    contact: '021-66789123',
    email: 'novin.construction@yahoo.com',
    isActive: true
  }
];

// Helper function to get vendor name
export const getVendorName = (vendorId: string | null): string => {
  if (!vendorId) return '-';
  const vendor = mockVendors.find(v => v.id === vendorId);
  return vendor?.name || 'نامشخص';
};

// Helper function to get vendor
export const getVendorById = (vendorId: string): Vendor | undefined => {
  return mockVendors.find(v => v.id === vendorId);
};
