// src/components/AccountingTable.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTransaction, TransactionStatus, TransactionType } from '@/types/accounting';
import { toPersianDigits, formatCurrency, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import { getVendorName } from '@/lib/mockAccountingData';
import { getAccountByCode } from '@/lib/chartOfAccounts';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface AccountingTableProps {
  transactions: EnhancedTransaction[];
  onEdit: (transaction: EnhancedTransaction) => void;
  onDelete: (transactionId: number) => void;
  onView?: (transaction: EnhancedTransaction) => void;
  onUpdateStatus?: (transactionId: number, status: TransactionStatus) => void;
  loading?: boolean;
  error?: string;
}

// ترجمه‌های فارسی
const statusTranslations: Record<TransactionStatus, string> = {
  [TransactionStatus.Pending]: 'در انتظار',
  [TransactionStatus.Approved]: 'تایید شده',
  [TransactionStatus.Posted]: 'ثبت شده',
  [TransactionStatus.Cancelled]: 'لغو شده'
};

const categoryTranslations: Record<string, string> = {
  'MonthlyCharge': 'شارژ ماهانه',
  'ParkingRental': 'اجاره پارکینگ',
  'MiscellaneousIncome': 'درآمد متفرقه',
  'Repairs': 'تعمیرات',
  'Utilities': 'قبوض و مشاعات',
  'Salaries': 'حقوق',
  'Cleaning': 'نظافت',
  'Miscellaneous': 'متفرقه',
  'Elevator': 'آسانسور',
  'Electricity': 'برق',
  'Water': 'آب',
  'Gas': 'گاز'
};

const tagTranslations: Record<string, string> = {
  'monthly': 'ماهانه',
  'repair': 'تعمیر',
  'elevator': 'آسانسور',
  'urgent': 'فوری',
  'utilities': 'قبوض',
  'electricity': 'برق',
  'common': 'مشاعات',
  'unit-101': 'واحد ۱۰۱',
  'unit-102': 'واحد ۱۰۲',
  'unit-103': 'واحد ۱۰۳'
};

const getStatusColor = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.Pending: return 'text-yellow-600 bg-yellow-100';
    case TransactionStatus.Approved: return 'text-blue-600 bg-blue-100';
    case TransactionStatus.Posted: return 'text-green-600 bg-green-100';
    case TransactionStatus.Cancelled: return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getTypeColor = (type: TransactionType): string => {
  return type === TransactionType.Income 
    ? 'text-green-600 bg-green-50' 
    : 'text-red-600 bg-red-50';
};

// کامپوننت کارت موبایل
const MobileTransactionCard = ({ 
  transaction, 
  onEdit, 
  onDelete, 
  onView, 
  onUpdateStatus 
}: {
  transaction: EnhancedTransaction;
  onEdit: (tx: EnhancedTransaction) => void;
  onDelete: (id: number) => void;
  onView?: (tx: EnhancedTransaction) => void;
  onUpdateStatus?: (id: number, status: TransactionStatus) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4 mb-3 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
            {transaction.type === TransactionType.Income ? 'درآمد' : 'هزینه'}
          </span>
          <span className="text-xs text-[var(--text-color-muted)] font-mono">
            {toPersianDigits(transaction.transactionNumber)}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--text-color-muted)] hover:text-[var(--text-color)] p-1"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Title and Amount */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-color)] truncate">
            {transaction.title}
          </h3>
          <p className="text-sm text-[var(--text-color-muted)] flex items-center gap-1 mt-1">
            <CalendarIcon className="w-4 h-4" />
            {formatJalaliDate(new Date(transaction.date))}
          </p>
        </div>
        <div className="text-left">
          <p className={`font-bold text-lg ${
            transaction.type === TransactionType.Income 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {transaction.type === TransactionType.Income ? '+' : '-'}
            {formatCurrency(transaction.finalAmount || 0)}
          </p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
            {statusTranslations[transaction.status]}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--text-color-muted)] mb-1">دسته‌بندی</p>
                  <p className="text-[var(--text-color)] font-medium">
                    {categoryTranslations[transaction.category] || transaction.category}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-color-muted)] mb-1">حساب</p>
                  <p className="text-[var(--text-color)] font-medium">
                    {getAccountByCode(transaction.accountCode)?.title || transaction.accountCode}
                  </p>
                </div>
                {transaction.relatedUnitId && (
                  <div>
                    <p className="text-[var(--text-color-muted)] mb-1">واحد مرتبط</p>
                    <p className="text-[var(--text-color)] font-medium flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      واحد {toPersianDigits(transaction.relatedUnitId.toString())}
                    </p>
                  </div>
                )}
                {transaction.vendorId && (
                  <div>
                    <p className="text-[var(--text-color-muted)] mb-1">فروشنده</p>
                    <p className="text-[var(--text-color)] font-medium">
                      {getVendorName(transaction.vendorId)}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {transaction.description && (
                <div>
                  <p className="text-[var(--text-color-muted)] mb-1">توضیحات</p>
                  <p className="text-[var(--text-color)] text-sm bg-[var(--bg-color)] p-2 rounded">
                    {transaction.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {transaction.tags && transaction.tags.length > 0 && (
                <div>
                  <p className="text-[var(--text-color-muted)] mb-2">برچسب‌ها</p>
                  <div className="flex flex-wrap gap-1">
                    {transaction.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tagTranslations[tag] || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {onView && (
                  <button
                    onClick={() => onView(transaction)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <EyeIcon className="w-4 h-4" />
                    مشاهده
                  </button>
                )}
                <button
                  onClick={() => onEdit(transaction)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  ویرایش
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                  حذف
                </button>
                {onUpdateStatus && transaction.status === TransactionStatus.Pending && (
                  <button
                    onClick={() => onUpdateStatus(transaction.id, TransactionStatus.Approved)}
                    className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    تایید
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function AccountingTable({
  transactions,
  onEdit,
  onDelete,
  onView,
  onUpdateStatus,
  loading = false,
  error
}: AccountingTableProps) {

  // مرتب‌سازی تراکنش‌ها بر اساس تاریخ
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = parseJalaliDate(a.date);
    const dateB = parseJalaliDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  // محاسبه مانده جاری
  const calculateRunningBalance = () => {
    return sortedTransactions.reduce((acc, tx) => {
      const amount = tx.finalAmount || 0;
      return acc + (tx.type === TransactionType.Income ? amount : -amount);
    }, 0);
  };

  let runningBalance = calculateRunningBalance();

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-[var(--text-color-muted)]">در حال بارگذاری تراکنش‌ها...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">خطا در بارگذاری</h3>
          <p className="text-[var(--text-color-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (sortedTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-2">هیچ تراکنشی یافت نشد</h3>
          <p className="text-[var(--text-color-muted)]">برای شروع، اولین تراکنش خود را ثبت کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <table className="min-w-full text-right divide-y divide-[var(--border-color)] text-sm">
            <thead style={{ backgroundColor: 'var(--bg-color)' }}>
              <tr>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-16">ردیف</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-24">شماره</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-20">تاریخ</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)]">شرح</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-20">حساب</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-24">بدهکار</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-24">بستانکار</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-24">مانده</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-20">وضعیت</th>
                <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] text-center w-28">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-color)]">
              {sortedTransactions.map((tx, index) => {
                const currentBalance = runningBalance;
                const amount = tx.finalAmount || 0;
                runningBalance -= (tx.type === TransactionType.Income ? amount : -amount);
                const account = getAccountByCode(tx.accountCode);

                return (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
                    onClick={() => onView && onView(tx)}
                  >
                    <td className="px-3 py-3 text-xs">{toPersianDigits((index + 1).toString())}</td>
                    <td className="px-3 py-3 text-xs font-mono">{toPersianDigits(tx.transactionNumber)}</td>
                    <td className="px-3 py-3 text-xs">{formatJalaliDate(new Date(tx.date))}</td>
                    <td className="px-3 py-3">
                      <div>
                        <div className="font-medium">{tx.title}</div>
                        <div className="text-xs text-[var(--text-color-muted)]">
                          {categoryTranslations[tx.category] || tx.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs">{account?.code || tx.accountCode}</td>
                    <td className="px-3 py-3 text-xs">
                      {tx.type === TransactionType.Expense ? formatCurrency(tx.finalAmount) : '-'}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      {tx.type === TransactionType.Income ? formatCurrency(tx.finalAmount) : '-'}
                    </td>
                    <td className="px-3 py-3 text-xs font-bold">
                      <span className={currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(Math.abs(currentBalance))}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {statusTranslations[tx.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {onView && (
                          <button
                            onClick={() => onView(tx)}
                            className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                            title="مشاهده جزئیات"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(tx)}
                          className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
                          title="ویرایش"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(tx.id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        {onUpdateStatus && tx.status === TransactionStatus.Pending && (
                          <button
                            onClick={() => onUpdateStatus(tx.id, TransactionStatus.Approved)}
                            className="p-1 hover:bg-yellow-100 text-yellow-600 rounded transition-colors"
                            title="تایید"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {sortedTransactions.map((tx) => (
          <MobileTransactionCard
            key={tx.id}
            transaction={tx}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onUpdateStatus={onUpdateStatus}
          />
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <BanknotesIcon className="w-5 h-5" />
          خلاصه مالی
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 mb-1">کل درآمدها</p>
            <p className="text-xl font-bold text-green-700">
              {formatCurrency(
                sortedTransactions
                  .filter(tx => tx.type === TransactionType.Income)
                  .reduce((sum, tx) => sum + (tx.finalAmount || 0), 0)
              )}
            </p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 mb-1">کل هزینه‌ها</p>
            <p className="text-xl font-bold text-red-700">
              {formatCurrency(
                sortedTransactions
                  .filter(tx => tx.type === TransactionType.Expense)
                  .reduce((sum, tx) => sum + (tx.finalAmount || 0), 0)
              )}
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">مانده نهایی</p>
            <p className={`text-xl font-bold ${
              calculateRunningBalance() >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(Math.abs(calculateRunningBalance()))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
