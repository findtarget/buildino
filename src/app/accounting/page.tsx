// src/app/accounting/page.tsx - نسخه بهینه شده موبایل
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AccountingTable from '@/components/AccountingTable';
import TransactionFormModal from '@/components/TransactionFormModal';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import MonthlyChargeModal from '@/components/MonthlyChargeModal';
import AccountFormModal from '@/components/AccountFormModal';
import JournalEntryModal from '@/components/JournalEntryModal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import {
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  CogIcon,
  BookOpenIcon,
  CalculatorIcon,
  EllipsisVerticalIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

// Types
type TransactionStatus = 'PENDING' | 'APPROVED' | 'POSTED' | 'CANCELLED';

interface Transaction {
  id: string;
  transactionNumber: string;
  date: string;
  title: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  baseAmount?: number;
  finalAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  unitId?: string;
  relatedUnitId?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt?: string;
  accountCode?: string;
  vendorId?: string | null;
  tags?: string[];
  attachments?: string[];
}

interface Unit {
  id: string;
  unitNumber: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL';
  area: number;
  floor: number;
  isOccupied: boolean;
}

interface Account {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId?: string;
  isActive: boolean;
}

const handleJournalEntrySave = async (journalEntryData: any) => {
  console.log('Journal entry saved:', journalEntryData);
  setIsJournalEntryModalOpen(false);
};

// ✅ حساب‌های نمونه برای تست سند حسابداری
const mockAccounts: Account[] = [
  { id: '1', code: '1010', title: 'صندوق', type: 'ASSET', isActive: true },
  { id: '2', code: '1020', title: 'بانک ملی', type: 'ASSET', isActive: true },
  // ... سایر حساب‌ها
];

// تب‌های بهینه شده برای حسابداری پیشرفته
const tabs = [
  { id: 'transactions', title: 'تراکنش‌ها', icon: TableCellsIcon, mobileTitle: 'تراکنش' },
  { id: 'journal-entries', title: 'اسناد حسابداری', icon: BookOpenIcon, mobileTitle: 'اسناد' },
  { id: 'chart-of-accounts', title: 'دسته‌حساب‌ها', icon: DocumentChartBarIcon, mobileTitle: 'حساب‌ها' },
  { id: 'trial-balance', title: 'میزان‌نامه', icon: CalculatorIcon, mobileTitle: 'میزان' },
  { id: 'reports', title: 'گزارشات', icon: ChartBarIcon, mobileTitle: 'گزارش' }
];

export default function AccountingPage() {

  const handleUpdateTransactionStatus = (transactionId: string, status: TransactionStatus) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === transactionId
        ? { ...tx, status, updatedAt: new Date().toISOString() }
        : tx
    ));
    setIsDetailsModalOpen(false);
  };

  // ✅ تعریف handleEditTransaction
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setIsTransactionFormOpen(true); // Corrected state name
  };

  const handleChargeSubmit = async (chargeCalculations: any[]) => {
    const buildingId = 1; // Replace with actual buildingId
    const [year, month] = new Date().toISOString().slice(0, 7).split('-');

    const chargeData = {
      buildingId,
      year: parseInt(year),
      month: parseInt(month),
      details: chargeCalculations.map(calc => ({
        unitId: calc.unitId,
        amount: calc.charges.total,
        description: `شارژ ماهانه واحد ${calc.unitNumber}`,
      })),
    };

    try {
      const response = await fetch('/api/accounting/charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chargeData),
      });

      if (response.ok) {
        await loadTransactions(); // Refresh the transaction list
        setIsChargeModalOpen(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'خطا در ثبت شارژ');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error submitting charge:', err);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingTransactionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
  if (deletingTransactionId !== null) {
    setTransactions(prev => prev.filter(tx => tx.id !== deletingTransactionId));
    setDeletingTransactionId(null);
    setIsDeleteModalOpen(false);
  }
};


  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // ✅ State و handler برای JournalEntryModal
const [isJournalEntryModalOpen, setIsJournalEntryModalOpen] = useState(false);

  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  
  const [activeTab, setActiveTab] = useState('transactions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // States برای تراکنش‌ها
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isJournalEntryOpen, setIsJournalEntryOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'EXPENSE'>('INCOME');

  const handleSaveAccount = async (accountData: any) => {
    try {
      if (editingAccount) {
        // ویرایش حساب موجود
        setAccounts(prev => prev.map(acc =>
          acc.id === editingAccount.id ? { ...accountData, id: editingAccount.id } : acc
        ));
      } else {
        // ایجاد حساب جدید
        const newAccount = {
          ...accountData,
          id: Math.max(...accounts.map(a => parseInt(a.id) || 0), 0) + 1
        };
        setAccounts(prev => [...prev, newAccount]);
      }
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
      throw error;
    }
  };

  // States برای دسته‌حساب‌ها
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  //onst [editingAccount, setEditingAccount] = useState<any | null>(null);

  // States برای واحدها و تنظیمات
  const [units, setUnits] = useState<Unit[]>([]);
  const [chargeSettings, setChargeSettings] = useState({
    maintenanceRatePerSqm: 3000,
    elevatorBaseRate: 15000,
    janitorRate: 25000,
    securityRate: 20000,
    commercialMultiplier: 1.5,
    dueDayOfMonth: 10
  });

  // Load initial data
  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
    loadUnits();
    if (activeTab === 'chart-of-accounts') {
      loadAccounts();
    }
  }, [activeTab]);

  // API functions (بدون تغییر - از قبل تعریف شده)
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming you have a way to get the current buildingId, e.g., from context or props
      const buildingId = 1; // Replace with actual buildingId
      const response = await fetch(`/api/accounting/transactions?buildingId=${buildingId}`);
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data);
      } else {
        setError(data.message || 'خطا در دریافت تراکنش‌ها');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch('/api/units');
      const result = await response.json();
      
      if (result.success) {
        setUnits(result.data);
      }
    } catch (err) {
      console.error('Error loading units:', err);
    }
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/accounting/chart-of-accounts');
      const result = await response.json();
      
      if (result.success) {
        setAccounts(result.data.accounts);
      } else {
        setError(result.error || 'خطا در دریافت دسته‌حساب‌ها');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers (ادامه مانند قبل...)
  const handleSaveTransaction = async (transactionData: any) => {
    try {
      setLoading(true);
      
      const url = editingTransaction 
        ? `/api/transactions/${editingTransaction.id}`
        : '/api/transactions';
      
      const method = editingTransaction ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        await loadTransactions();
        setIsTransactionFormOpen(false);
        setEditingTransaction(null);
      } else {
        setError(result.error || 'خطا در ذخیره تراکنش');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      console.error('Error saving transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalIncome: transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0),
    transactionCount: transactions.length
  };

  const netBalance = stats.totalIncome - stats.totalExpense;

  // دکمه‌های اکشن بر اساس تب فعال و حسابداری پیشرفته
  const getActionButtons = () => {
    const commonClasses = `flex items-center gap-2 px-3 py-2 ${isMobile ? 'text-sm' : 'px-4 py-2'} rounded-lg transition-colors font-medium`;
    
    switch (activeTab) {
      case 'transactions':
        return [
          {
            key: 'charge',
            onClick: () => setIsChargeModalOpen(true),
            className: `${commonClasses} bg-blue-500 text-white hover:bg-blue-600`,
            icon: <DocumentDuplicateIcon className="w-5 h-5" />,
            text: isMobile ? 'شارژ' : 'صدور شارژ ماهانه',
            priority: 1
          },
          {
            key: 'expense',
            onClick: () => {
              setEditingTransaction(null);
              setTransactionType('EXPENSE');
              setIsTransactionFormOpen(true);
            },
            className: `${commonClasses} bg-rose-500 text-white hover:bg-rose-600`,
            icon: <ArrowTrendingDownIcon className="w-5 h-5" />,
            text: isMobile ? 'هزینه' : 'ثبت هزینه',
            priority: 2
          },
          {
            key: 'income',
            onClick: () => {
              setEditingTransaction(null);
              setTransactionType('INCOME');
              setIsTransactionFormOpen(true);
            },
            className: `${commonClasses} bg-emerald-500 text-white hover:bg-emerald-600`,
            icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
            text: isMobile ? 'درآمد' : 'ثبت درآمد',
            priority: 3
          }
        ];

      case 'journal-entries':
        return [
          {
            key: 'journal',
            onClick: () => setIsJournalEntryOpen(true),
            className: `${commonClasses} bg-purple-500 text-white hover:bg-purple-600`,
            icon: <BookOpenIcon className="w-5 h-5" />,
            text: isMobile ? 'سند جدید' : 'ثبت سند حسابداری',
            priority: 1
          }
        ];

      case 'chart-of-accounts':
        return [
          {
            key: 'account',
            onClick: () => {
              setEditingAccount(null);
              setIsAccountFormOpen(true);
            },
            className: `${commonClasses} bg-blue-500 text-white hover:bg-blue-600`,
            icon: <PlusIcon className="w-5 h-5" />,
            text: isMobile ? 'حساب جدید' : 'ایجاد حساب جدید',
            priority: 1
          },
          {
            key: 'import',
            onClick: () => {/* TODO: import accounts */},
            className: `${commonClasses} bg-gray-500 text-white hover:bg-gray-600`,
            icon: <DocumentDuplicateIcon className="w-5 h-5" />,
            text: isMobile ? 'ورود' : 'ورود از فایل',
            priority: 2
          }
        ];

      case 'trial-balance':
        return [
          {
            key: 'refresh',
            onClick: () => {/* TODO: refresh trial balance */},
            className: `${commonClasses} bg-indigo-500 text-white hover:bg-indigo-600`,
            icon: <CalculatorIcon className="w-5 h-5" />,
            text: isMobile ? 'محاسبه' : 'محاسبه مجدد',
            priority: 1
          },
          {
            key: 'export',
            onClick: () => {/* TODO: export trial balance */},
            className: `${commonClasses} bg-green-500 text-white hover:bg-green-600`,
            icon: <DocumentChartBarIcon className="w-5 h-5" />,
            text: isMobile ? 'خروجی' : 'خروجی Excel',
            priority: 2
          }
        ];

      case 'reports':
        return [
          {
            key: 'settings',
            onClick: () => {/* TODO: report settings */},
            className: `${commonClasses} bg-gray-500 text-white hover:bg-gray-600`,
            icon: <CogIcon className="w-5 h-5" />,
            text: isMobile ? 'تنظیمات' : 'تنظیمات گزارش',
            priority: 1
          }
        ];

      default:
        return [];
    }
  };

  const actionButtons = getActionButtons();
  const visibleButtons = isMobile ? actionButtons.slice(0, 2) : actionButtons;
  const hiddenButtons = isMobile ? actionButtons.slice(2) : [];
  const commonClasses = `flex items-center gap-2 px-3 py-2 ${isMobile ? 'text-sm' : 'px-4 py-2'} rounded-lg transition-colors font-medium`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex-1 p-3 sm:p-6">
        {/* Header - ریسپانسیو */}
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} mb-6 sm:mb-8`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-[var(--text-color)] mb-2`}>
              سیستم حسابداری
            </h1>
            <p className={`text-[var(--text-color-muted)] ${isMobile ? 'text-sm' : ''}`}>
              {isMobile ? 'مدیریت مالی هوشمند' : 'مدیریت تراکنش‌ها، دسته‌حساب‌ها و گزارش‌گیری مالی'}
            </p>
          </div>

          {/* Action buttons - ریسپانسیو */}
          <div className={`flex ${isMobile ? 'justify-center' : 'gap-3'} items-center`}>
            <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
              {visibleButtons.map((button) => (
                <button
                  key={button.key}
                  onClick={button.onClick}
                  className={button.className}
                  disabled={loading}
                >
                  {button.icon}
                  <span className={isMobile ? 'hidden sm:inline' : ''}>{button.text}</span>
                </button>
              ))}
            </div>

            {/* Overflow menu for mobile */}
            {hiddenButtons.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className={`${commonClasses} bg-gray-500 text-white hover:bg-gray-600`}
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
                {showMobileMenu && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-50">
                    {hiddenButtons.map((button) => (
                      <button
                        key={button.key}
                        onClick={() => {
                          button.onClick();
                          setShowMobileMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-3 text-right hover:bg-[var(--bg-color)] transition-colors"
                        disabled={loading}
                      >
                        {button.icon}
                        <span>{button.text}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-700">
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="mr-auto text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tabs - ریسپانسیو */}
        <div className={`${isMobile ? 'overflow-x-auto pb-2' : ''} mb-6 sm:mb-8`}>
          <div className={`flex ${isMobile ? 'min-w-max gap-1' : 'flex-wrap gap-2'} space-x-reverse`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }}
                className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2 text-sm whitespace-nowrap' : 'px-6 py-3'} rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
                }`}
                disabled={loading}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span>{isMobile ? tab.mobileTitle : tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats - ریسپانسیو فقط در تب تراکنش‌ها */}
        {activeTab === 'transactions' && (
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-4'} mb-6 sm:mb-8`}>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 sm:p-4 border border-[var(--border-color)]">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>کل درآمد</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-emerald-600 ${isMobile ? 'truncate' : ''}`}>
                    {isMobile ? toPersianDigits((stats.totalIncome / 1000000).toFixed(0)) + 'M' : formatCurrency(stats.totalIncome)}
                  </p>
                </div>
                <div className={`p-2 bg-emerald-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                  <ArrowTrendingUpIcon className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 sm:p-4 border border-[var(--border-color)]">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>کل هزینه‌ها</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-rose-600 ${isMobile ? 'truncate' : ''}`}>
                    {isMobile ? toPersianDigits((stats.totalExpense / 1000000).toFixed(0)) + 'M' : formatCurrency(stats.totalExpense)}
                  </p>
                </div>
                <div className={`p-2 bg-rose-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                  <ArrowTrendingDownIcon className="w-4 h-4 sm:w-6 sm:h-6 text-rose-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 sm:p-4 border border-[var(--border-color)]">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>مانده خالص</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'} ${isMobile ? 'truncate' : ''}`}>
                    {isMobile ? toPersianDigits((netBalance / 1000000).toFixed(0)) + 'M' : formatCurrency(netBalance)}
                  </p>
                </div>
                <div className={`p-2 ${netBalance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} rounded-lg ${isMobile ? 'self-center' : ''}`}>
                  <ChartBarIcon className={`w-4 h-4 sm:w-6 sm:h-6 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-3 sm:p-4 border border-[var(--border-color)]">
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center justify-between'}`}>
                <div className={isMobile ? 'text-center' : ''}>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>تعداد تراکنش</p>
                  <p className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-600`}>
                    {toPersianDigits(stats.transactionCount.toString())}
                  </p>
                </div>
                <div className={`p-2 bg-blue-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                  <DocumentChartBarIcon className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="mr-3 text-[var(--text-color-muted)]">در حال بارگذاری...</span>
          </div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pb-4"
        >
          {activeTab === 'transactions' && !loading && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
              <AccountingTable
                transactions={transactions as any}
                onEdit={handleEditTransaction as any}
                onView={handleViewTransaction as any}
                onDelete={handleDeleteRequest as any}
                onUpdateStatus={handleUpdateTransactionStatus as any}
              />
            </div>
          )}

          {activeTab === 'journal-entries' && !loading && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4 sm:p-6">
              <div className="text-center py-12">
                <BookOpenIcon className="w-16 h-16 mx-auto text-[var(--text-color-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">اسناد حسابداری</h3>
                <p className="text-[var(--text-color-muted)] mb-4">ثبت و مدیریت اسناد حسابداری دوطرفه</p>
                <button
                  onClick={() => setIsJournalEntryOpen(true)}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  ثبت سند جدید
                </button>
              </div>
            </div>
          )}

          {activeTab === 'chart-of-accounts' && !loading && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <div className={`overflow-x-auto ${isMobile ? 'text-sm' : ''}`}>
                <table className="min-w-full divide-y divide-[var(--border-color)]">
                  <thead className="bg-[var(--bg-color)]">
                    <tr>
                      <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'} text-right font-medium text-[var(--text-color-muted)] uppercase`}>
                        کد
                      </th>
                      <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'} text-right font-medium text-[var(--text-color-muted)] uppercase`}>
                        عنوان
                      </th>
                      {!isMobile && (
                        <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-color-muted)] uppercase">
                          نوع
                        </th>
                      )}
                      <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'} text-right font-medium text-[var(--text-color-muted)] uppercase`}>
                        وضعیت
                      </th>
                      <th className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-xs'} text-center font-medium text-[var(--text-color-muted)] uppercase`}>
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {accounts.map((account) => (
                      <tr key={account.id} className="hover:bg-[var(--bg-color)]">
                        <td className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} font-mono`}>
                          {account.code}
                        </td>
                        <td className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'} ${isMobile ? 'max-w-[100px] truncate' : ''}`}>
                          {account.title}
                        </td>
                        {!isMobile && (
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {account.type}
                            </span>
                          </td>
                        )}
                        <td className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'} text-sm`}>
                          <span className={`inline-flex px-2 py-1 ${isMobile ? 'text-xs' : 'text-xs'} font-medium rounded ${
                            account.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {account.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </td>
                        <td className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'} text-center`}>
                          <button
                            onClick={() => {
                              setEditingAccount(account);
                              setIsAccountFormOpen(true);
                            }}
                            className={`text-blue-600 hover:text-blue-800 ${isMobile ? 'text-xs' : 'text-sm'}`}
                          >
                            ویرایش
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'trial-balance' && !loading && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4 sm:p-6">
              <div className="text-center py-12">
                <CalculatorIcon className="w-16 h-16 mx-auto text-[var(--text-color-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">میزان‌نامه</h3>
                <p className="text-[var(--text-color-muted)] mb-4">مانده کلیه حساب‌های دفتری</p>
                <button
                  onClick={() => {/* TODO: load trial balance */}}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <CalculatorIcon className="w-5 h-5" />
                  محاسبه میزان‌نامه
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reports' && !loading && (
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : isTablet ? 'grid-cols-2 gap-4' : 'grid-cols-3 gap-6'}`}>
              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 sm:p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`flex ${isMobile ? 'flex-col text-center gap-3' : 'items-center gap-4'} mb-4`}>
                  <div className={`p-3 bg-blue-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                    <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[var(--text-color)] ${isMobile ? 'text-base' : ''}`}>
                      صورت سود و زیان
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>
                      گزارش درآمد و هزینه‌های ماهانه
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 sm:p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`flex ${isMobile ? 'flex-col text-center gap-3' : 'items-center gap-4'} mb-4`}>
                  <div className={`p-3 bg-emerald-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                    <ChartBarIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[var(--text-color)] ${isMobile ? 'text-base' : ''}`}>
                      ترازنامه
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>
                      وضعیت دارایی‌ها و بدهی‌ها
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-lg p-4 sm:p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                <div className={`flex ${isMobile ? 'flex-col text-center gap-3' : 'items-center gap-4'} mb-4`}>
                  <div className={`p-3 bg-purple-100 rounded-lg ${isMobile ? 'self-center' : ''}`}>
                    <TableCellsIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[var(--text-color)] ${isMobile ? 'text-base' : ''}`}>
                      گزارش جریان نقدی
                    </h3>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-[var(--text-color-muted)]`}>
                      تحلیل ورودی و خروجی نقدینگی
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* همه Modal ها بدون تغییر... */}
        <TransactionFormModal
          isOpen={isTransactionFormOpen}
          onClose={() => {
            setIsTransactionFormOpen(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleSaveTransaction}
          initialData={editingTransaction as any}
          transactionType={transactionType as any}
          unitsList={units as any}
        />

        <MonthlyChargeModal
          isOpen={isChargeModalOpen}
          onClose={() => setIsChargeModalOpen(false)}
          onCalculate={handleChargeSubmit}
          selectedUnits={units.map(u => ({
            id: parseInt(u.id, 10),
            number: u.unitNumber,
            type: u.type,
            area: u.area,
            floor: u.floor || 0,
            ownerName: 'N/A',
            previousWaterBill: Math.floor(Math.random() * 50000) + 20000, // Mock data
            previousGasBill: Math.floor(Math.random() * 30000) + 10000, // Mock data
            previousElectricityBill: Math.floor(Math.random() * 80000) + 40000, // Mock data
          }))}
          chargeSettings={chargeSettings}
          selectedMonth={new Date().toISOString().slice(0, 7)}
        />

        <AccountFormModal
          isOpen={isAccountFormOpen}
          onClose={() => {
            setIsAccountFormOpen(false);
            setEditingAccount(null);
          }}
          onSave={handleSaveAccount}
          account={editingAccount as any}
          parentAccounts={accounts.filter(acc => acc.isActive) as any}
          mode={editingAccount ? 'edit' : 'create'}
        />

        {/* مودال سند حسابداری جدید */}
        <JournalEntryModal
          isOpen={isJournalEntryOpen}
          onClose={() => setIsJournalEntryOpen(false)}
          onSave={async (journalData) => {
            // TODO: save journal entry
            setIsJournalEntryOpen(false);
          }}
          accounts={accounts as any}
        />

        <TransactionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          transaction={viewingTransaction as any}
          onUpdateStatus={handleUpdateTransactionStatus as any}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingTransactionId(null);
          }}
          onConfirm={handleConfirmDelete}
          title="تایید حذف تراکنش"
          message="آیا از حذف این تراکنش اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        />

        {/* Backdrop for mobile menu */}
        {showMobileMenu && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </div>
    </div>
  );
}
