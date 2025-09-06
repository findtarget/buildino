export const mockUnits = [
  {
    id: 1,
    unitNumber: '101',
    floor: 1,
    area: 85,
    balconyArea: 12,
    isCommercial: false,
    ownerName: 'احمد محمدی',
    ownerPhone: '09121234567',
    tenantName: 'علی رضایی',
    tenantPhone: '09129876543',
    hasParking: true,
    parkingCount: 1,
    status: 'TenantOccupied',
    residentSince: '1403/01/15'
  },
  {
    id: 2,
    unitNumber: '102',
    floor: 1,
    area: 90,
    balconyArea: 15,
    isCommercial: false,
    ownerName: 'فاطمه احمدی',
    ownerPhone: '09121234568',
    tenantName: '',
    tenantPhone: '',
    hasParking: true,
    parkingCount: 1,
    status: 'OwnerOccupied',
    residentSince: '1402/08/10'
  },
  {
    id: 3,
    unitNumber: '103',
    floor: 1,
    area: 75,
    balconyArea: 8,
    isCommercial: false,
    ownerName: 'محسن کریمی',
    ownerPhone: '09121234569',
    tenantName: '',
    tenantPhone: '',
    hasParking: false,
    parkingCount: 0,
    status: 'Vacant',
    residentSince: undefined
  },
  {
    id: 4,
    unitNumber: '104',
    floor: 1,
    area: 120,
    balconyArea: 0,
    isCommercial: true,
    ownerName: 'شرکت آریا',
    ownerPhone: '02188776655',
    tenantName: 'مهدی نوری',
    tenantPhone: '09121234570',
    hasParking: true,
    parkingCount: 2,
    status: 'TenantOccupied',
    residentSince: '1403/02/01'
  }
  // ... می‌توانید واحدهای بیشتری اضافه کنید
];

export const mockTransactions = [
  {
    id: 1,
    title: 'شارژ ماهانه - شهریور ۱۴۰۳',
    amount: 2400000,
    type: 'Income',
    category: 'MonthlyCharge',
    date: '1403/06/01',
    description: 'شارژ ماهانه واحد 101',
    relatedUnitId: 101
  },
  {
    id: 2,
    title: 'تعمیر آسانسور',
    amount: 850000,
    type: 'Expense',
    category: 'Repairs',
    date: '1403/05/28',
    description: 'تعویض موتور آسانسور'
  },
  {
    id: 3,
    title: 'قبض برق مشاعات',
    amount: 320000,
    type: 'Expense',
    category: 'Utilities',
    date: '1403/05/25',
    description: 'قبض برق راه‌پله و پارکینگ'
  }
  // ... می‌توانید تراکنش‌های بیشتری اضافه کنید
];
