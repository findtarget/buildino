// src/components/AccountingTable.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedTransaction, TransactionStatus, TransactionType } from '@/types/accounting';
import { mockEnhancedTransactions, getVendorName } from '@/lib/mockAccountingData';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import { getAccountByCode } from '@/lib/chartOfAccounts';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  TagIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface AccountingTableProps {
  transactions?: EnhancedTransaction[];
}

const statusColors = {
  [TransactionStatus.Posted]: 'bg-emerald-100 text-emerald-800',
  [TransactionStatus.Approved]: 'bg-blue-100 text-blue-800',
  [TransactionStatus.Pending]: 'bg-amber-100 text-amber-800',
};

const statusLabels = {
  [TransactionStatus.Posted]: 'ثبت شده',
  [TransactionStatus.Approved]: 'تایید شده', 
  [TransactionStatus.Pending]: 'در انتظار',
};

const typeColors = {
  [TransactionType.Income]: 'text-emerald-600',
  [TransactionType.Expense]: 'text-rose-600',
};

const typeLabels = {
  [TransactionType.Income]: 'درآمد',
  [TransactionType.Expense]: 'هزینه',
};

const categoryLabels: Record<string, string> = {
  'MonthlyCharge': 'شارژ ماهانه',
  'Parking': 'پارکینگ',
  'Repairs': 'تعمیرات',
  'Cleaning': 'نظافت',
  'Utilities': 'مشاعات',
  'Administrative': 'اداری'
};

export default function AccountingTable({ 
  transactions = mockEnhancedTransactions 
}: AccountingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [sortField, setSortField] = useState<keyof EnhancedTransaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'finalAmount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof EnhancedTransaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof EnhancedTransaction) => {
    if (sortField !== field) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />;
    return <ArrowsUpDownIcon className={`w-4 h-4 ${sortDirection === 'desc' ? 'text-blue-600' : 'text-blue-600 rotate-180'}`} />;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)]">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در تراکنش‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-sm w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
            className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value={TransactionStatus.Posted}>ثبت شده</option>
            <option value={TransactionStatus.Approved}>تایید شده</option>
            <option value={TransactionStatus.Pending}>در انتظار</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
            className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] text-sm"
          >
            <option value="all">همه انواع</option>
            <option value={TransactionType.Income}>درآمد</option>
            <option value={TransactionType.Expense}>هزینه</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-color-muted)]">
          <FunnelIcon className="w-4 h-4" />
          {toPersianDigits(filteredTransactions.length)} تراکنش از {toPersianDigits(transactions.length)}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-color)]">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('transactionNumber')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    شماره تراکنش
                    {getSortIcon('transactionNumber')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    تاریخ
                    {getSortIcon('date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    عنوان
                    {getSortIcon('title')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    دسته‌بندی
                    {getSortIcon('category')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    نوع
                    {getSortIcon('type')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('finalAmount')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    مبلغ نهایی
                    {getSortIcon('finalAmount')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">حساب</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 hover:text-[var(--text-color)] transition-colors"
                  >
                    وضعیت
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredTransactions.map((transaction, index) => {
                const account = getAccountByCode(transaction.accountCode);
                const vendorName = getVendorName(transaction.vendorId);
                
                return (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[var(--bg-color)] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--text-color)]">
                      {transaction.transactionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--text-color-muted)]">
                      {toPersianDigits(transaction.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-[var(--text-color)]">
                          {transaction.title}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-[var(--text-color-muted)] mt-1">
                            {transaction.description}
                          </div>
                        )}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <TagIcon className="w-3 h-3 text-gray-400" />
                            <div className="flex gap-1">
                              {transaction.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {transaction.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{toPersianDigits(transaction.tags.length - 2)}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {categoryLabels[transaction.category] || transaction.category}
                      </span>
                      {transaction.subCategory && (
                        <div className="text-xs text-[var(--text-color-muted)] mt-1">
                          {transaction.subCategory}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${typeColors[transaction.type]}`}>
                        {typeLabels[transaction.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className={`font-semibold ${typeColors[transaction.type]}`}>
                          {formatCurrency(transaction.finalAmount)}
                        </div>
                        {(transaction.taxAmount > 0 || transaction.discountAmount > 0) && (
                          <div className="text-xs text-[var(--text-color-muted)] mt-1">
                            {transaction.baseAmount !== transaction.finalAmount && (
                              <>
                                اصل: {formatCurrency(transaction.baseAmount)}
                                {transaction.taxAmount > 0 && (
                                  <> + مالیات: {formatCurrency(transaction.taxAmount)}</>
                                )}
                                {transaction.discountAmount > 0 && (
                                  <> - تخفیف: {formatCurrency(transaction.discountAmount)}</>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-[var(--text-color)]">
                          {transaction.accountCode}
                        </div>
                        <div className="text-xs text-[var(--text-color-muted)]">
                          {account?.title || 'نامشخص'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[transaction.status]}`}>
                        {statusLabels[transaction.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="text-amber-600 hover:text-amber-900 transition-colors"
                          title="ویرایش"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {transaction.attachments && transaction.attachments.length > 0 && (
                          <div className="relative">
                            <DocumentIcon className="w-4 h-4 text-gray-500" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {toPersianDigits(transaction.attachments.length)}
                            </span>
                          </div>
                        )}
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="حذف"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 text-[var(--text-color-muted)]">
          <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>هیچ تراکنشی یافت نشد</p>
        </div>
      )}
    </div>
  );
}
