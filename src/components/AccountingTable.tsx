// src/components/AccountingTable.tsx
'use client';

import { useState } from 'react';
import { EnhancedTransaction, TransactionStatus, TransactionType } from '@/types/accounting';
import { toPersianDigits, formatCurrency, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import { getVendorName } from '@/lib/mockAccountingData';
import { getAccountByCode } from '@/lib/chartOfAccounts';
import { PencilSquareIcon, TrashIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AccountingTableProps {
  transactions: EnhancedTransaction[];
  onEdit: (transaction: EnhancedTransaction) => void;
  onDelete: (transactionId: number) => void;
  onView?: (transaction: EnhancedTransaction) => void;
  onUpdateStatus?: (transactionId: number, status: TransactionStatus) => void;
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
    case TransactionStatus.Pending: return 'text-yellow-500';
    case TransactionStatus.Approved: return 'text-blue-500';
    case TransactionStatus.Posted: return 'text-green-500';
    case TransactionStatus.Cancelled: return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export default function AccountingTable({ 
  transactions, 
  onEdit, 
  onDelete, 
  onView,
  onUpdateStatus 
}: AccountingTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // مرتب‌سازی تراکنش‌ها بر اساس تاریخ
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = parseJalaliDate(a.date);
    const dateB = parseJalaliDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  // محاسبه مانده جاری
  const calculateRunningBalance = () => {
    const finalBalance = sortedTransactions.reduce((acc, tx) => {
      return acc + (tx.type === TransactionType.Income ? tx.finalAmount : -tx.finalAmount);
    }, 0);
    return finalBalance;
  };

  let runningBalance = calculateRunningBalance();

  return (
    <div className="space-y-4">
      {/* جدول اصلی */}
      <div className="overflow-x-auto rounded-lg shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <table className="min-w-full text-right divide-y divide-[var(--border-color)] text-sm">
          <thead style={{ backgroundColor: 'var(--bg-color)' }}>
            <tr>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-16">ردیف</th>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-24">شماره تراکنش</th>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)] w-20">تاریخ</th>
              <th className="px-3 py-3 text-xs font-semibold text-[var(--text-color-muted)]">عنوان / شرح</th>
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
              runningBalance -= (tx.type === TransactionType.Income ? tx.finalAmount : -tx.finalAmount);
              const isExpanded = expandedRows.has(tx.id);
              const account = getAccountByCode(tx.accountCode);

              return (
                <>
                  <tr 
                    key={tx.id} 
                    className="hover:bg-[var(--bg-color)] transition-colors duration-200 cursor-pointer"
                    onClick={() => toggleRowExpansion(tx.id)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {toPersianDigits(sortedTransactions.length - index)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-mono">
                      {toPersianDigits(tx.transactionNumber)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      {toPersianDigits(tx.date)}
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="font-medium text-sm truncate">{tx.title}</div>
                      <div className="text-xs text-[var(--text-color-muted)] mt-1">
                        <span>{categoryTranslations[tx.category] || tx.category}</span>
                        {tx.subCategory && <span> • {categoryTranslations[tx.subCategory] || tx.subCategory}</span>}
                        {tx.relatedUnitId && <span> • واحد {toPersianDigits(tx.relatedUnitId)}</span>}
                      </div>
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tx.tags.slice(0, 2).map((tag, i) => (
                            <span 
                              key={i} 
                              className="inline-block px-2 py-0.5 text-xs rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20"
                            >
                              {tagTranslations[tag] || tag}
                            </span>
                          ))}
                          {tx.tags.length > 2 && (
                            <span className="text-xs text-[var(--text-color-muted)]">
                              +{toPersianDigits(tx.tags.length - 2)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <div className="font-mono">{toPersianDigits(tx.accountCode)}</div>
                      <div className="text-xs text-[var(--text-color-muted)] truncate">
                        {account?.title.slice(0, 15) || 'نامشخص'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-rose-500 font-semibold">
                      {tx.type === TransactionType.Expense ? formatCurrency(tx.finalAmount) : '–'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-emerald-500 font-semibold">
                      {tx.type === TransactionType.Income ? formatCurrency(tx.finalAmount) : '–'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs font-bold">
                      {formatCurrency(currentBalance)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {statusTranslations[tx.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onView?.(tx); }} 
                          className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors p-1" 
                          title="مشاهده جزئیات"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(tx); }} 
                          className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors p-1" 
                          title="ویرایش"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        {tx.status === TransactionStatus.Pending && onUpdateStatus && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(tx.id, TransactionStatus.Approved); }} 
                            className="text-[var(--text-color-muted)] hover:text-green-500 transition-colors p-1" 
                            title="تایید"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(tx.id); }} 
                          className="text-[var(--text-color-muted)] hover:text-rose-500 transition-colors p-1" 
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* ردیف جزئیات توسعه‌یافته */}
                  {isExpanded && (
                    <tr className="bg-[var(--bg-color)]/50">
                      <td colSpan={10} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-[var(--accent-color)] mb-2">جزئیات مالی</h4>
                            <div className="space-y-1 text-xs">
                              <div>مبلغ پایه: {formatCurrency(tx.baseAmount)}</div>
                              {tx.taxAmount > 0 && <div>مالیات: {formatCurrency(tx.taxAmount)}</div>}
                              {tx.discountAmount > 0 && <div>تخفیف: {formatCurrency(tx.discountAmount)}</div>}
                              <div className="font-semibold">مبلغ نهایی: {formatCurrency(tx.finalAmount)}</div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-[var(--accent-color)] mb-2">اطلاعات تکمیلی</h4>
                            <div className="space-y-1 text-xs">
                              <div>تاریخ ایجاد: {toPersianDigits(tx.createdAt)}</div>
                              {tx.vendorId && <div>فروشنده: {getVendorName(tx.vendorId)}</div>}
                              {tx.description && <div>توضیحات: {tx.description}</div>}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-[var(--accent-color)] mb-2">پیوست‌ها و تگ‌ها</h4>
                            <div className="space-y-2 text-xs">
                              {tx.attachments && tx.attachments.length > 0 && (
                                <div>
                                  <span className="font-medium">فایل‌ها:</span>
                                  <div className="mt-1 space-y-1">
                                    {tx.attachments.map((file, i) => (
                                      <div key={i} className="text-blue-500 hover:underline cursor-pointer">
                                        {file}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {tx.tags && tx.tags.length > 0 && (
                                <div>
                                  <span className="font-medium">تگ‌ها:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {tx.tags.map((tag, i) => (
                                      <span 
                                        key={i} 
                                        className="inline-block px-2 py-0.5 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20"
                                      >
                                        {tagTranslations[tag] || tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* خلاصه جدول */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[var(--text-color-muted)] mb-2">کل درآمدها</h3>
          <p className="text-lg font-bold text-emerald-500">
            {formatCurrency(
              transactions
                .filter(t => t.type === TransactionType.Income)
                .reduce((sum, t) => sum + t.finalAmount, 0)
            )}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[var(--text-color-muted)] mb-2">کل هزینه‌ها</h3>
          <p className="text-lg font-bold text-rose-500">
            {formatCurrency(
              transactions
                .filter(t => t.type === TransactionType.Expense)
                .reduce((sum, t) => sum + t.finalAmount, 0)
            )}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[var(--text-color-muted)] mb-2">مانده نهایی</h3>
          <p className="text-lg font-bold text-[var(--text-color)]">
            {formatCurrency(calculateRunningBalance())}
          </p>
        </div>
      </div>
    </div>
  );
}
