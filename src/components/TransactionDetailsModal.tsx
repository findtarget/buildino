// src/components/TransactionDetailsModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedTransaction, TransactionStatus, TransactionType } from '@/types/accounting';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import { getVendorName } from '@/lib/mockAccountingData';
import { getAccountByCode } from '@/lib/chartOfAccounts';
import { XMarkIcon, DocumentIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: EnhancedTransaction | null;
  onUpdateStatus?: (transactionId: number, status: TransactionStatus) => void;
}

const statusTranslations: Record<TransactionStatus, string> = {
  [TransactionStatus.Pending]: 'در انتظار تایید',
  [TransactionStatus.Approved]: 'تایید شده',
  [TransactionStatus.Posted]: 'ثبت شده در دفاتر',
  [TransactionStatus.Cancelled]: 'لغو شده'
};

const categoryTranslations: Record<string, string> = {
  'MonthlyCharge': 'شارژ ماهانه',
  'ParkingRental': 'اجاره پارکینگ',
  'MiscellaneousIncome': 'درآمد متفرقه',
  'Repairs': 'تعمیرات و نگهداری',
  'Utilities': 'قبوض و مشاعات',
  'Salaries': 'حقوق و دستمزد',
  'Cleaning': 'نظافت',
  'Miscellaneous': 'متفرقه'
};

const tagTranslations: Record<string, string> = {
  'monthly': 'ماهانه',
  'repair': 'تعمیر',
  'elevator': 'آسانسور',
  'urgent': 'فوری',
  'utilities': 'قبوض',
  'electricity': 'برق',
  'common': 'مشاعات'
};

export default function TransactionDetailsModal({ 
  isOpen, 
  onClose, 
  transaction, 
  onUpdateStatus 
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const account = getAccountByCode(transaction.accountCode);

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.Pending: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case TransactionStatus.Approved: return 'bg-blue-100 text-blue-800 border-blue-300';
      case TransactionStatus.Posted: return 'bg-green-100 text-green-800 border-green-300';
      case TransactionStatus.Cancelled: return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-color)] mb-1">
                  جزئیات تراکنش {toPersianDigits(transaction.transactionNumber)}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                  {statusTranslations[transaction.status]}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--text-color-muted)] hover:text-[var(--text-color)] transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* اطلاعات اصلی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">اطلاعات کلی</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">عنوان:</span>
                      <span className="col-span-2 text-[var(--text-color)] font-medium">{transaction.title}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">نوع:</span>
                      <span className={`col-span-2 font-medium ${transaction.type === TransactionType.Income ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {transaction.type === TransactionType.Income ? 'درآمد' : 'هزینه'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">دسته‌بندی:</span>
                      <span className="col-span-2 text-[var(--text-color)]">
                        {categoryTranslations[transaction.category] || transaction.category}
                        {transaction.subCategory && ` • ${categoryTranslations[transaction.subCategory] || transaction.subCategory}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">تاریخ:</span>
                      <span className="col-span-2 text-[var(--text-color)]">{toPersianDigits(transaction.date)}</span>
                    </div>
                    {transaction.relatedUnitId && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-[var(--text-color-muted)] text-sm">واحد مرتبط:</span>
                        <span className="col-span-2 text-[var(--text-color)]">واحد {toPersianDigits(transaction.relatedUnitId)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">اطلاعات حسابداری</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">کد حساب:</span>
                      <span className="col-span-2 text-[var(--text-color)] font-mono">{toPersianDigits(transaction.accountCode)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">نام حساب:</span>
                      <span className="col-span-2 text-[var(--text-color)]">{account?.title || 'نامشخص'}</span>
                    </div>
                    {transaction.vendorId && (
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-[var(--text-color-muted)] text-sm">فروشنده:</span>
                        <span className="col-span-2 text-[var(--text-color)]">{getVendorName(transaction.vendorId)}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-[var(--text-color-muted)] text-sm">تاریخ ایجاد:</span>
                      <span className="col-span-2 text-[var(--text-color)] text-sm">{toPersianDigits(transaction.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* جزئیات مالی */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">تفکیک مالی</h3>
                <div className="bg-[var(--bg-color)] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-color-muted)]">مبلغ پایه:</span>
                    <span className="text-[var(--text-color)] font-medium">{formatCurrency(transaction.baseAmount)}</span>
                  </div>
                  {transaction.taxAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-color-muted)]">مالیات:</span>
                      <span className="text-[var(--text-color)] font-medium">{formatCurrency(transaction.taxAmount)}</span>
                    </div>
                  )}
                  {transaction.discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--text-color-muted)]">تخفیف:</span>
                      <span className="text-rose-500 font-medium">-{formatCurrency(transaction.discountAmount)}</span>
                    </div>
                  )}
                  <hr className="border-[var(--border-color)]" />
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-color)] font-semibold">مبلغ نهایی:</span>
                    <span className={`text-lg font-bold ${transaction.type === TransactionType.Income ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(transaction.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* توضیحات */}
              {transaction.description && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">توضیحات</h3>
                  <div className="bg-[var(--bg-color)] rounded-lg p-4">
                    <p className="text-[var(--text-color)] leading-relaxed">{transaction.description}</p>
                  </div>
                </div>
              )}

              {/* تگ‌ها */}
              {transaction.tags && transaction.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">تگ‌ها</h3>
                  <div className="flex flex-wrap gap-2">
                    {transaction.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20"
                      >
                        {tagTranslations[tag] || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* فایل‌های پیوست */}
              {transaction.attachments && transaction.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">فایل‌های پیوست</h3>
                  <div className="space-y-2">
                    {transaction.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-[var(--bg-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                      >
                        <DocumentIcon className="w-5 h-5 text-[var(--accent-color)]" />
                        <span className="text-[var(--text-color)] hover:text-[var(--accent-color)] transition-colors">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* عملیات تایید/رد */}
              {transaction.status === TransactionStatus.Pending && onUpdateStatus && (
                <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => onUpdateStatus(transaction.id, TransactionStatus.Approved)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    تایید تراکنش
                  </button>
                  <button
                    onClick={() => onUpdateStatus(transaction.id, TransactionStatus.Cancelled)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    رد تراکنش
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
