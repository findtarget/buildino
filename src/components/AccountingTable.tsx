// src/components/AccountingTable.tsx
'use client';

import { Transaction } from '@/types/index.d';
import { toPersianDigits, parseJalaliDate, formatCurrency, formatJalaliDate } from '@/lib/utils';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AccountingTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: number) => void;
}

const categoryTranslations: { [key: string]: string } = {
    Repairs: 'تعمیرات', Utilities: 'مشاعات', Salaries: 'حقوق', Cleaning: 'نظافت', Miscellaneous: 'متفرقه',
    MonthlyCharge: 'شارژ', ParkingRental: 'اجاره پارکینگ', MiscellaneousIncome: 'درآمد متفرقه'
};

export default function AccountingTable({ transactions, onEdit, onDelete }: AccountingTableProps) {
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = parseJalaliDate(a.date);
    const dateB = parseJalaliDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateB.getTime() - dateA.getTime();
  });

  const finalBalance = sortedTransactions.reduce((acc, tx) => {
    return acc + (tx.type === 'Income' ? tx.amount : -tx.amount);
  }, 0);

  let runningBalance = finalBalance;

  return (
    <div className="overflow-x-auto rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
      <table className="min-w-full text-right divide-y divide-[var(--border-color)]">
        <thead style={{ backgroundColor: 'var(--bg-color)' }}>
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">ردیف</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">تاریخ</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">عنوان / شرح</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">بدهکار (هزینه)</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">بستانکار (درآمد)</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)]">مانده کل</th>
            <th className="px-4 py-3 text-sm font-semibold text-[var(--text-color-muted)] text-center">عملیات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-color)]">
          {sortedTransactions.map((tx, index) => {
            const currentBalance = runningBalance;
            runningBalance -= (tx.type === 'Income' ? tx.amount : -tx.amount);

            return (
              <tr key={tx.id} className="hover:bg-[var(--bg-color)] transition-colors duration-200">
                <td className="px-4 py-3 whitespace-nowrap">{toPersianDigits(sortedTransactions.length - index)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{toPersianDigits(formatJalaliDate(parseJalaliDate(tx.date) || new Date(tx.date)))}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{tx.title}</div>
                  <div className="text-xs text-[var(--text-color-muted)]">
                    {(categoryTranslations[tx.category] || tx.category)}
                    {tx.relatedUnitId && ` (واحد ${toPersianDigits(tx.relatedUnitId)})`}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-rose-500">
                  {tx.type === 'Expense' ? formatCurrency(tx.amount) : '–'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-emerald-500">
                  {tx.type === 'Income' ? formatCurrency(tx.amount) : '–'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-bold">{formatCurrency(currentBalance)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => onEdit(tx)} className="text-[var(--text-color-muted)] hover:text-blue-500 transition-colors" title="ویرایش">
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(tx.id)} className="text-[var(--text-color-muted)] hover:text-rose-500 transition-colors" title="حذف">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
