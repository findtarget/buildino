// src/app/accounting/page.tsx - بخش اصلی صفحه (به‌روزرسانی شده)
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AccountingTable from '@/components/AccountingTable';
import TransactionFormModal from '@/components/TransactionFormModal';
import TransactionDetailsModal from '@/components/TransactionDetailsModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import MonthlyChargeModal from '@/components/MonthlyChargeModal'; // اضافه شد
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { mockEnhancedTransactions } from '@/lib/mockAccountingData';
import { ReportsService } from '@/lib/reportsService';
import { AnalyticsMetrics } from '@/types/reports';
import { EnhancedTransaction, TransactionStatus } from '@/types/accounting';
import { toPersianDigits } from '@/lib/utils';
import {
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

// تابع کمکی برای فرمت کردن مبلغ
const formatAmount = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '۰';
  }
  return toPersianDigits(new Intl.NumberFormat('fa-IR').format(amount));
};

// Interface برای واحدها
interface UnitInfo {
  id: number;
  unitNumber: string;
}

const mockUnits: UnitInfo[] = [
  { id: 1, unitNumber: '101' },
  { id: 2, unitNumber: '102' },
  { id: 3, unitNumber: '103' },
  { id: 4, unitNumber: '201' },
  { id: 5, unitNumber: '202' },
  { id: 6, unitNumber: '203' }
];

const tabs = [
  { id: 'transactions', title: 'تراکنش‌ها', icon: TableCellsIcon },
  { id: 'reports', title: 'گزارشات', icon: DocumentChartBarIcon },
  { id: 'analytics', title: 'آنالیتیکس', icon: ChartBarIcon }
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false); // اضافه شد
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-12-31'
  });
  const [loading, setLoading] = useState(false);
  
  // States برای مدیریت تراکنش‌ها
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>(mockEnhancedTransactions);
  const [editingTransaction, setEditingTransaction] = useState<EnhancedTransaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<EnhancedTransaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<number | null>(null);
  const [transactionType, setTransactionType] = useState<'Income' | 'Expense'>('Income');

  // Load analytics when tab changes to analytics
  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'reports') {
      loadAnalytics();
    }
  }, [activeTab, dateRange, transactions]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const analyticsData = ReportsService.generateAnalytics(transactions, dateRange);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = (transactionData: Omit<EnhancedTransaction, 'id' | 'transactionNumber' | 'createdAt' | 'status'>) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(tx => 
        tx.id === editingTransaction.id 
          ? { 
              ...tx, 
              ...transactionData,
              updatedAt: new Date().toISOString()
            }
          : tx
      ));
    } else {
      const newTransaction: EnhancedTransaction = {
        ...transactionData,
        id: Math.max(...transactions.map(t => t.id), 0) + 1,
        transactionNumber: `TXN-2024-${String(transactions.length + 1).padStart(3, '0')}`,
        status: TransactionStatus.Pending,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  // Handle bulk charge transactions
  const handleChargeSubmit = (chargeTransactions: EnhancedTransaction[]) => {
    setTransactions(prev => [...chargeTransactions, ...prev]);
    setIsChargeModalOpen(false);
  };

  const handleEditTransaction = (transaction: EnhancedTransaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setIsFormOpen(true);
  };

  const handleViewTransaction = (transaction: EnhancedTransaction) => {
    setViewingTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
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

  const handleUpdateStatus = (transactionId: number, status: TransactionStatus) => {
    setTransactions(prev => prev.map(tx => 
      tx.id === transactionId 
        ? { ...tx, status, updatedAt: new Date().toISOString() }
        : tx
    ));
    setIsDetailsModalOpen(false);
  };

  const handleOpenCreateModal = (type: 'Income' | 'Expense') => {
    setEditingTransaction(null);
    setTransactionType(type);
    setIsFormOpen(true);
  };

  // محاسبه آمار سریع با اصلاح مشکل "ناعدد"
  const quickStats = {
    totalIncome: transactions
      .filter(t => t.type === 'Income' && !isNaN(Number(t.amount)))
      .reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: transactions
      .filter(t => t.type === 'Expense' && !isNaN(Number(t.amount)))
      .reduce((sum, t) => sum + Number(t.amount), 0),
    transactionCount: transactions.length
  };
  
  const netBalance = quickStats.totalIncome - quickStats.totalExpense;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
              سیستم حسابداری
            </h1>
            <p className="text-[var(--text-color-muted)]">
              مدیریت تراکنش‌ها، گزارش‌گیری و تحلیل مالی
            </p>
          </div>
          
          {/* دکمه‌ها بر اساس تب فعال */}
          {activeTab === 'transactions' && (
            <div className="flex gap-3">
              {/* دکمه محاسبه شارژ ماهانه */}
              <button
                onClick={() => setIsChargeModalOpen(true)} // اصلاح شد
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <DocumentDuplicateIcon className="w-5 h-5" />
                صدور شارژ ماهانه
              </button>
              
              <button
                onClick={() => handleOpenCreateModal('Expense')}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                <ArrowTrendingDownIcon className="w-5 h-5" />
                ثبت هزینه
              </button>
              
              <button
                onClick={() => handleOpenCreateModal('Income')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <ArrowTrendingUpIcon className="w-5 h-5" />
                ثبت درآمد
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 space-x-reverse mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.title}
            </button>
          ))}
        </div>

        {/* Quick Stats - با اصلاح مشکل فرمت */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-color-muted)]">کل درآمد</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatAmount(quickStats.totalIncome)} تومان
                </p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-color-muted)]">کل هزینه‌ها</p>
                <p className="text-xl font-bold text-rose-600">
                  {formatAmount(quickStats.totalExpense)} تومان
                </p>
              </div>
              <div className="p-2 bg-rose-100 rounded-lg">
                <ArrowTrendingDownIcon className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-color-muted)]">مانده خالص</p>
                <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatAmount(netBalance)} تومان
                </p>
              </div>
              <div className={`p-2 ${netBalance >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} rounded-lg`}>
                <ChartBarIcon className={`w-6 h-6 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-color-muted)]">تعداد تراکنش‌ها</p>
                <p className="text-xl font-bold text-blue-600">
                  {toPersianDigits(quickStats.transactionCount)}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'transactions' && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <AccountingTable 
                transactions={transactions}
                onEdit={handleEditTransaction}
                onView={handleViewTransaction}
                onDelete={handleDeleteRequest}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Quick Reports */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-color)]">صورت سود و زیان</h3>
                      <p className="text-sm text-[var(--text-color-muted)]">گزارش درآمد و هزینه‌های ماهانه</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">ماهانه</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      مشاهده
                    </button>
                  </div>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <ChartBarIcon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-color)]">گزارش جریان نقدی</h3>
                      <p className="text-sm text-[var(--text-color-muted)]">تحلیل ورودی و خروجی نقدینگی</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded">فصلی</span>
                    <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                      مشاهده
                    </button>
                  </div>
                </div>

                <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TableCellsIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-color)]">گزارش تفصیلی</h3>
                      <p className="text-sm text-[var(--text-color-muted)]">جزئیات کامل همه تراکنش‌ها</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">سفارشی</span>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      مشاهده
                    </button>
                  </div>
                </div>
              </div>

              {/* Simple Summary Table */}
              {analytics && (
                <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] overflow-hidden">
                  <div className="p-6 border-b border-[var(--border-color)]">
                    <h3 className="text-lg font-semibold">خلاصه تراکنش‌ها بر اساس دسته‌بندی</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--bg-color)]">
                        <tr>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">دسته‌بندی</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">تعداد</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">مجموع مبلغ</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">درصد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {analytics?.topExpenseCategories.map(category => (
                          <tr key={category.category} className="hover:bg-[var(--bg-color)] transition-colors">
                            <td className="px-6 py-4 text-sm font-medium">{category.category}</td>
                            <td className="px-6 py-4 text-sm">
                              {toPersianDigits(transactions.filter(t => t.category === category.category).length)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {formatAmount(category.amount)} تومان
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {toPersianDigits(category.percentage.toFixed(1))}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <AnalyticsDashboard
              metrics={analytics}
              loading={loading}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          )}
        </motion.div>

        {/* Transaction Form Modal */}
        {isFormOpen && (
          <TransactionFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleCreateTransaction}
            initialData={editingTransaction}
            transactionType={transactionType}
            unitsList={mockUnits}
          />
        )}

        {/* Monthly Charge Modal */}
        <MonthlyChargeModal
          isOpen={isChargeModalOpen}
          onClose={() => setIsChargeModalOpen(false)}
          onSubmit={handleChargeSubmit}
          unitsList={[]} // یا داده‌های واقعی واحدها
          existingTransactions={transactions}
        />

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          transaction={viewingTransaction}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="تایید حذف تراکنش"
          message="آیا از حذف این تراکنش برای همیشه اطمینان دارید؟ این عمل غیرقابل بازگشت است."
        />
      </div>
    </div>
  );
}
