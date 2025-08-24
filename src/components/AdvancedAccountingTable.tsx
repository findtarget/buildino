// src/components/AdvancedAccountingTable.tsx
'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTransaction, TransactionStatus } from '@/types/accounting.d';
import { toPersianDigits, formatCurrency, formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import { TransactionService } from '@/lib/transactionUtils';
import { getAccountByCode } from '@/lib/chartOfAccounts';
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface AdvancedAccountingTableProps {
  transactions: EnhancedTransaction[];
  onEdit: (transaction: EnhancedTransaction) => void;
  onDelete: (transactionId: string) => void;
  onView: (transaction: EnhancedTransaction) => void;
  onDuplicate?: (transaction: EnhancedTransaction) => void;
  loading?: boolean;
}

type SortField = 'date' | 'amount' | 'title' | 'status' | 'transactionNumber';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  status: TransactionStatus | 'All';
  type: 'Income' | 'Expense' | 'All';
  category: string;
  dateRange: {
    from: string;
    to: string;
  };
  amountRange: {
    min: number;
    max: number;
  };
  searchTerm: string;
}

const statusTranslations = {
  [TransactionStatus.Draft]: 'پیش‌نویس',
  [TransactionStatus.Pending]: 'در انتظار تایید',
  [TransactionStatus.Approved]: 'تایید شده',
  [TransactionStatus.Posted]: 'ثبت شده',
  [TransactionStatus.Rejected]: 'رد شده',
  [TransactionStatus.Cancelled]: 'لغو شده'
};

const statusColors = {
  [TransactionStatus.Draft]: 'text-gray-500 bg-gray-100',
  [TransactionStatus.Pending]: 'text-yellow-700 bg-yellow-100',
  [TransactionStatus.Approved]: 'text-blue-700 bg-blue-100',
  [TransactionStatus.Posted]: 'text-green-700 bg-green-100',
  [TransactionStatus.Rejected]: 'text-red-700 bg-red-100',
  [TransactionStatus.Cancelled]: 'text-gray-700 bg-gray-200'
};

const categoryTranslations = {
  'Repairs': 'تعمیرات', 'Utilities': 'مشاعات', 'Salaries': 'حقوق', 
  'Cleaning': 'نظافت', 'Miscellaneous': 'متفرقه',
  'MonthlyCharge': 'شارژ ماهانه', 'ParkingRental': 'اجاره پارکینگ', 
  'MiscellaneousIncome': 'درآمد متفرقه'
};

export default function AdvancedAccountingTable({
  transactions,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  loading = false
}: AdvancedAccountingTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'All',
    type: 'All',
    category: '',
    dateRange: { from: '', to: '' },
    amountRange: { min: 0, max: 0 },
    searchTerm: ''
  });

  // Memoized filtered and sorted transactions
  const processedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply filters
    if (filters.status !== 'All') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.type !== 'All') {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term) ||
        t.transactionNumber.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'date':
          aVal = parseJalaliDate(a.date)?.getTime() || 0;
          bVal = parseJalaliDate(b.date)?.getTime() || 0;
          break;
        case 'amount':
          aVal = a.finalAmount;
          bVal = b.finalAmount;
          break;
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'transactionNumber':
          aVal = a.transactionNumber;
          bVal = b.transactionNumber;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, filters, sortField, sortDirection]);

  // Calculate running balance
  const transactionsWithBalance = useMemo(() => {
    const postedTransactions = transactions.filter(t => t.status === TransactionStatus.Posted);
    const sortedPosted = postedTransactions.sort((a, b) => {
      const dateA = parseJalaliDate(a.date)?.getTime() || 0;
      const dateB = parseJalaliDate(b.date)?.getTime() || 0;
      return dateB - dateA;
    });

    let runningBalance = sortedPosted.reduce((acc, t) => {
      return acc + (t.type === 'Income' ? t.finalAmount : -t.finalAmount);
    }, 0);

    return processedTransactions.map(transaction => {
      if (transaction.status === TransactionStatus.Posted) {
        const currentBalance = runningBalance;
        runningBalance -= (transaction.type === 'Income' ? transaction.finalAmount : -transaction.finalAmount);
        return { ...transaction, runningBalance: currentBalance };
      }
      return { ...transaction, runningBalance: null };
    });
  }, [transactions, processedTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === processedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedTransactions.map(t => t.id)));
    }
  };

  const handleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (action: 'delete' | 'approve' | 'reject') => {
    // TODO: Implement bulk actions
    console.log(`Bulk ${action} for:`, Array.from(selectedIds));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 inline mr-1" /> : 
      <ArrowDownIcon className="w-4 h-4 inline mr-1" />;
  };

  const StatusBadge = ({ status }: { status: TransactionStatus }) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status === TransactionStatus.Posted && <CheckCircleIcon className="w-3 h-3 ml-1" />}
      {status === TransactionStatus.Pending && <ClockIcon className="w-3 h-3 ml-1" />}
      {status === TransactionStatus.Rejected && <XCircleIcon className="w-3 h-3 ml-1" />}
      {statusTranslations[status]}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در تراکنش‌ها..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)] text-[var(--text-color)] focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            فیلترها
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-color-muted)]">
              {toPersianDigits(selectedIds.size)} انتخاب شده
            </span>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              حذف گروهی
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as TransactionStatus | 'All' 
                  }))}
                  className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]"
                >
                  <option value="All">همه وضعیت‌ها</option>
                  {Object.entries(statusTranslations).map(([status, title]) => (
                    <option key={status} value={status}>{title}</option>
                  ))}
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'Income' | 'Expense' | 'All' 
                  }))}
                  className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]"
                >
                  <option value="All">همه انواع</option>
                  <option value="Income">درآمد</option>
                  <option value="Expense">هزینه</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]"
                >
                  <option value="">همه دسته‌ها</option>
                  {Object.entries(categoryTranslations).map(([category, title]) => (
                    <option key={category} value={category}>{title}</option>
                  ))}
                </select>

                <button
                  onClick={() => setFilters({
                    status: 'All',
                    type: 'All',
                    category: '',
                    dateRange: { from: '', to: '' },
                    amountRange: { min: 0, max: 0 },
                    searchTerm: ''
                  })}
                  className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">کل درآمدها</div>
          <div className="text-xl font-bold text-green-800">
            {formatCurrency(
              processedTransactions
                .filter(t => t.type === 'Income' && t.status === TransactionStatus.Posted)
                .reduce((sum, t) => sum + t.finalAmount, 0)
            )}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">کل هزینه‌ها</div>
          <div className="text-xl font-bold text-red-800">
            {formatCurrency(
              processedTransactions
                .filter(t => t.type === 'Expense' && t.status === TransactionStatus.Posted)
                .reduce((sum, t) => sum + t.finalAmount, 0)
            )}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">درانتظار تایید</div>
          <div className="text-xl font-bold text-blue-800">
            {toPersianDigits(
              processedTransactions.filter(t => t.status === TransactionStatus.Pending).length
            )}
          </div>
        </div>
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">کل تراکنش‌ها</div>
          <div className="text-xl font-bold text-gray-800">
            {toPersianDigits(processedTransactions.length)}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="mr-3 text-[var(--text-color-muted)]">در حال بارگذاری...</span>
        </div>
      )}

      {/* Advanced Table */}
      <div className="overflow-x-auto rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <table className="min-w-full text-right divide-y divide-[var(--border-color)]">
          <thead style={{ backgroundColor: 'var(--bg-color)' }}>
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === processedTransactions.length && processedTransactions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">ردیف</th>
              <th 
                className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => handleSort('transactionNumber')}
              >
                <SortIcon field="transactionNumber" />
                شماره تراکنش
              </th>
              <th 
                className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => handleSort('date')}
              >
                <SortIcon field="date" />
                تاریخ
              </th>
              <th 
                className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => handleSort('title')}
              >
                <SortIcon field="title" />
                عنوان / شرح
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">حساب</th>
              <th 
                className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => handleSort('amount')}
              >
                <SortIcon field="amount" />
                بدهکار (هزینه)
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">بستانکار (درآمد)</th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">مانده کل</th>
              <th 
                className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
                onClick={() => handleSort('status')}
              >
                <SortIcon field="status" />
                وضعیت
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-color)]">
            <AnimatePresence>
              {transactionsWithBalance.map((transaction, index) => {
                const account = getAccountByCode(transaction.accountCode);
                const canEdit = TransactionService.canEditTransaction(transaction);
                const canDelete = TransactionService.canDeleteTransaction(transaction);
                
                return (
                  <motion.tr
                    key={transaction.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`hover:bg-[var(--bg-color)] transition-colors duration-200 ${
                      selectedIds.has(transaction.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(transaction.id)}
                        onChange={() => handleSelectTransaction(transaction.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {toPersianDigits(index + 1)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                      {transaction.transactionNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {toPersianDigits(formatJalaliDate(parseJalaliDate(transaction.date) || new Date()))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{transaction.title}</div>
                      <div className="text-xs text-[var(--text-color-muted)]">
                        {categoryTranslations[transaction.category] || transaction.category}
                        {transaction.relatedUnitId && (
                          <span className="mr-2">واحد {toPersianDigits(transaction.relatedUnitId)}</span>
                        )}
                      </div>
                      {transaction.description && (
                        <div className="text-xs text-[var(--text-color-muted)] mt-1 truncate">
                          {transaction.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-mono">{transaction.accountCode}</div>
                      <div className="text-[var(--text-color-muted)] truncate">
                        {account?.title || 'نامشخص'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-rose-500 font-medium">
                      {transaction.type === 'Expense' ? formatCurrency(transaction.finalAmount) : '–'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-500 font-medium">
                      {transaction.type === 'Income' ? formatCurrency(transaction.finalAmount) : '–'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold">
                      {transaction.runningBalance !== null 
                        ? formatCurrency(transaction.runningBalance)
                        : '–'
                      }
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onView(transaction)}
                          className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors p-1"
                          title="مشاهده جزئیات"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {canEdit && (
                          <button
                            onClick={() => onEdit(transaction)}
                            className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors p-1"
                            title="ویرایش"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {onDuplicate && (
                          <button
                            onClick={() => onDuplicate(transaction)}
                            className="text-[var(--text-color-muted)] hover:text-green-500 transition-colors p-1"
                            title="کپی"
                          >
                            <DocumentDuplicateIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {transaction.attachments && transaction.attachments.length > 0 && (
                          <button
                            className="text-[var(--text-color-muted)] hover:text-purple-500 transition-colors p-1"
                            title={`${transaction.attachments.length} فایل ضمیمه`}
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => onDelete(transaction.id)}
                            className="text-[var(--text-color-muted)] hover:text-rose-500 transition-colors p-1"
                            title="حذف"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {!loading && processedTransactions.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-[var(--text-color)]">
            تراکنشی یافت نشد
          </h3>
          <p className="mt-2 text-[var(--text-color-muted)]">
            {filters.searchTerm || filters.status !== 'All' || filters.type !== 'All' || filters.category
              ? 'فیلترهای اعمال شده را تغییر دهید'
              : 'هنوز تراکنشی ثبت نشده است'
            }
          </p>
        </div>
      )}

      {/* Pagination would go here */}
      {processedTransactions.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-color-muted)]">
            نمایش {toPersianDigits(processedTransactions.length)} تراکنش از {toPersianDigits(transactions.length)} تراکنش
          </div>
          {/* TODO: Add pagination controls */}
        </div>
      )}
    </div>
  );
}
