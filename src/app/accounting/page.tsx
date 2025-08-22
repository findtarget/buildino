// src/app/accounting/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import AccountingTable from '@/components/AccountingTable';
import TransactionFormModal from '@/components/TransactionFormModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import MonthlyChargeModal from '@/components/MonthlyChargeModal';
import { Transaction } from '@/types/index.d';
import { DocumentDuplicateIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { parseJalaliDate } from '@/lib/utils';

const mockUnits = [
  { id: 1, unitNumber: '101' }, { id: 2, unitNumber: '102' }, { id: 3, unitNumber: '103' },
  { id: 4, unitNumber: '201' }, { id: 5, unitNumber: 'G1' },
];

const mockTransactions: Transaction[] = [
  { id: 1, date: '1404/05/01', title: 'شارژ ماه مرداد', type: 'Income', category: 'MonthlyCharge', amount: 500000, relatedUnitId: 1, isCharge: true },
  { id: 2, date: '1404/05/03', title: 'هزینه تعمیر آسانسور', type: 'Expense', category: 'Repairs', amount: 1250000, isCharge: false },
  { id: 3, date: '1404/05/05', title: 'پرداخت قبض برق عمومی', type: 'Expense', category: 'Utilities', amount: 350000, isCharge: false },
  { id: 4, date: '1404/05/10', title: 'شارژ ماه مرداد', type: 'Income', category: 'MonthlyCharge', amount: 650000, relatedUnitId: 2, isCharge: true },
  { id: 5, date: '1404/05/12', title: 'حقوق سرایدار', type: 'Expense', category: 'Salaries', amount: 4000000, isCharge: false },
  { id: 6, date: '1404/05/15', title: 'درآمد حاصل از اجاره پارکینگ مهمان', type: 'Income', category: 'ParkingRental', amount: 200000, isCharge: false },
];

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Income' | 'Expense'>('Expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // State های مودال تایید حذف
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null);
  
  // State های مودال صدور شارژ ماهانه
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);

  const handleOpenModalForCreate = (type: 'Income' | 'Expense') => {
    setEditingTransaction(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleOpenModalForEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalType(transaction.type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // ویرایش تراکنش موجود
      setTransactions(
        transactions.map(t =>
          t.id === editingTransaction.id ? { ...editingTransaction, ...data } : t
        )
      );
    } else {
      // ایجاد تراکنش جدید
      const newTransaction: Transaction = { id: Date.now(), ...data };
      setTransactions([newTransaction, ...transactions]);
    }
    handleCloseModal();
  };

  const handleDeleteRequest = (id: number) => {
    setDeletingTransactionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTransactionId) {
      setTransactions(transactions.filter(t => t.id !== deletingTransactionId));
    }
    setDeletingTransactionId(null);
    setIsDeleteModalOpen(false);
  };

  const handleGenerateCharges = () => {
    setIsChargeModalOpen(true);
  };

  const handleChargeGenerated = (chargeTransactions: Transaction[]) => {
    setTransactions([...chargeTransactions, ...transactions]);
    setIsChargeModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="p-4 md:p-6 space-y-6"
    >
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
          دفتر کل حسابداری
        </h1>
        
        <div className="flex gap-3">
          <button
            onClick={handleGenerateCharges}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
            <span>صدور شارژ ماهانه</span>
          </button>
          <button
            onClick={() => handleOpenModalForCreate('Expense')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-rose-500 hover:bg-rose-600 transition-colors"
          >
            <ArrowTrendingDownIcon className="w-5 h-5" />
            <span>ثبت هزینه</span>
          </button>
          <button
            onClick={() => handleOpenModalForCreate('Income')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            <ArrowTrendingUpIcon className="w-5 h-5" />
            <span>ثبت درآمد</span>
          </button>
        </div>
      </div>

      <AccountingTable
        transactions={transactions}
        onEdit={handleOpenModalForEdit}
        onDelete={handleDeleteRequest}
      />

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        transactionType={modalType}
        initialData={editingTransaction}
        unitsList={mockUnits}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تایید حذف تراکنش"
        message="آیا از حذف این تراکنش برای همیشه اطمینان دارید؟ این عمل غیرقابل بازگشت است."
      />

      <MonthlyChargeModal
        isOpen={isChargeModalOpen}
        onClose={() => setIsChargeModalOpen(false)}
        onSubmit={handleChargeGenerated}
        unitsList={mockUnits}
      />
    </motion.div>
  );
}
