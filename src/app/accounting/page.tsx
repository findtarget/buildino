// src/app/accounting/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AccountingTable from '@/components/AccountingTable';
import TransactionFormModal from '@/components/TransactionFormModal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { mockEnhancedTransactions } from '@/lib/mockAccountingData';
import { ReportsService } from '@/lib/reportsService';
import { AnalyticsMetrics } from '@/types/reports';
import { toPersianDigits } from '@/lib/utils';
import {
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const tabs = [
  { id: 'transactions', title: 'تراکنش‌ها', icon: TableCellsIcon },
  { id: 'reports', title: 'گزارشات', icon: DocumentChartBarIcon },
  { id: 'analytics', title: 'آنالیتیکس', icon: ChartBarIcon }
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-12-31'
  });
  const [loading, setLoading] = useState(false);

  // Load analytics when tab changes to analytics
  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'reports') {
      loadAnalytics();
    }
  }, [activeTab, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const analyticsData = ReportsService.generateAnalytics(
        mockEnhancedTransactions, 
        dateRange
      );
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = (transactionData: any) => {
    console.log('Create transaction:', transactionData);
    // Add logic to save transaction
    setIsFormOpen(false);
  };

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
          
          {activeTab === 'transactions' && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              تراکنش جدید
            </button>
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

        {/* Quick Stats */}
        {analytics && (activeTab === 'reports' || activeTab === 'analytics') && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-color-muted)]">کل درآمد</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {toPersianDigits(new Intl.NumberFormat('fa-IR').format(analytics.totalRevenue))} تومان
                  </p>
                </div>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-color-muted)]">کل هزینه‌ها</p>
                  <p className="text-xl font-bold text-rose-600">
                    {toPersianDigits(new Intl.NumberFormat('fa-IR').format(analytics.totalExpenses))} تومان
                  </p>
                </div>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-rose-600" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-color-muted)]">درآمد خالص</p>
                  <p className={`text-xl font-bold ${analytics.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {toPersianDigits(new Intl.NumberFormat('fa-IR').format(analytics.netIncome))} تومان
                  </p>
                </div>
                <div className={`p-2 ${analytics.netIncome >= 0 ? 'bg-emerald-100' : 'bg-rose-100'} rounded-lg`}>
                  <ChartBarIcon className={`w-6 h-6 ${analytics.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-color-muted)]">تعداد تراکنش‌ها</p>
                  <p className="text-xl font-bold text-blue-600">
                    {toPersianDigits(analytics.transactionCount)}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'transactions' && (
            <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
              <AccountingTable transactions={mockEnhancedTransactions} />
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
                      مشاهده <EyeIcon className="w-4 h-4 inline mr-1" />
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
                      مشاهده <EyeIcon className="w-4 h-4 inline mr-1" />
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
                      مشاهده <EyeIcon className="w-4 h-4 inline mr-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Simple Summary Table */}
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
                            {toPersianDigits(mockEnhancedTransactions.filter(t => t.category === category.category).length)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {toPersianDigits(new Intl.NumberFormat('fa-IR').format(category.amount))} تومان
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
            onSubmit={handleCreateTransaction} initialData={null} transactionType={'Income'} unitsList={[]}          />
        )}
      </div>
    </div>
  );
}
