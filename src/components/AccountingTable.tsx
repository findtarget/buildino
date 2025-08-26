// src/components/AccountingTable.tsx
'use client';

// دیگر نیازی به useState نداریم چون منطق expand حذف شده
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

// ترجمه‌های فارسی (بدون تغییر)
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
  'monthly': 'ماهانه', 'repair': 'تعمیر', 'elevator': 'آسانسور', 'urgent': 'فوری', 'utilities': 'قبوض', 'electricity': 'برق', 'common': 'مشاعات', 'unit-101': 'واحد ۱۰۱', 'unit-102': 'واحد ۱۰۲', 'unit-103': 'واحد ۱۰۳'
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
      return acc + (tx.type === TransactionType.Income ? tx.finalAmount : -tx.finalAmount);
    }, 0);
  };

  let runningBalance = calculateRunningBalance();

  return (
    <div className="space-y-4 p-4"> {/* افزودن padding برای فاصله بهتر کارت‌ها */}
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
              const account = getAccountByCode(tx.accountCode);

              return (
                <tr
                  key={tx.id || index} // فال‌بک برای key
                  className="hover:bg-[var(--bg-color)] transition-colors duration-200 cursor-pointer"
                  onClick={() => onView?.(tx)} // <-- تغییر اصلی: کلیک روی ردیف مودال را باز می‌کند
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
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <div className="font-mono">{toPersianDigits(tx.accountCode)}</div>
                    <div className="text-xs text-[var(--text-color-muted)] truncate">
                      {account?.title.slice(0, 15) || 'نامشخص'}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-rose-500 font-semibold">
                    {tx.type === TransactionType.Expense ? formatCurrency(tx.finalAmount, false) : '–'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-emerald-500 font-semibold">
                    {tx.type === TransactionType.Income ? formatCurrency(tx.finalAmount, false) : '–'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-bold">
                    {formatCurrency(currentBalance, false)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {statusTranslations[tx.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(tx); }}
                        className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors p-1"
                        title="ویرایش"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* خلاصه جدول (بازگردانده شد) */}
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
