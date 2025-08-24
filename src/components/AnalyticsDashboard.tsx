// src/components/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut, Area } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { AnalyticsMetrics } from '@/types/reports.d';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import {
  BanknotesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChartBarIcon,
  HomeIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetrics;
  loading?: boolean;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function AnalyticsDashboard({
  metrics,
  loading = false,
  dateRange,
  onDateRangeChange
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [comparisonMode, setComparisonMode] = useState<'previous' | 'year'>('previous');

  const kpiCards = [
    {
      title: 'کل درآمد',
      value: formatCurrency(metrics.totalRevenue),
      change: metrics.monthlyGrowth,
      changeText: `${toPersianDigits(Math.abs(metrics.monthlyGrowth).toFixed(1))}%`,
      icon: BanknotesIcon,
      color: 'emerald',
      trend: metrics.monthlyGrowth >= 0 ? 'up' : 'down'
    },
    {
      title: 'کل هزینه‌ها',
      value: formatCurrency(metrics.totalExpenses),
      change: -2.1,
      changeText: '۲.۱%',
      icon: TrendingDownIcon,
      color: 'rose',
      trend: 'down'
    },
    {
      title: 'درآمد خالص',
      value: formatCurrency(metrics.netIncome),
      change: metrics.profitMargin,
      changeText: `${toPersianDigits(metrics.profitMargin.toFixed(1))}%`,
      icon: TrendingUpIcon,
      color: metrics.netIncome >= 0 ? 'emerald' : 'rose',
      trend: metrics.netIncome >= 0 ? 'up' : 'down'
    },
    {
      title: 'تعداد واحدها',
      value: toPersianDigits('24'),
      change: 0,
      changeText: '۰%',
      icon: HomeIcon,
      color: 'blue',
      trend: 'neutral'
    },
    {
      title: 'نرخ اشغال',
      value: `${toPersianDigits(metrics.unitOccupancyRate.toFixed(1))}%`,
      change: 2.3,
      changeText: '۲.۳%',
      icon: ChartBarIcon,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'نرخ وصولی',
      value: `${toPersianDigits(metrics.collectionRate.toFixed(1))}%`,
      change: 1.8,
      changeText: '۱.۸%',
      icon: CalendarDaysIcon,
      color: 'indigo',
      trend: 'up'
    }
  ];

  // Monthly Trends Chart Data
  const monthlyTrendsData = {
    labels: metrics.monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: 'درآمد',
        data: metrics.monthlyTrends.map(t => t.income),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'هزینه',
        data: metrics.monthlyTrends.map(t => t.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'خالص',
        data: metrics.monthlyTrends.map(t => t.net),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Expense Categories Chart
  const expenseCategoriesData = {
    labels: metrics.topExpenseCategories.map(c => c.category),
    datasets: [
      {
        data: metrics.topExpenseCategories.map(c => c.amount),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Income Categories Chart
  const incomeCategoriesData = {
    labels: metrics.topIncomeCategories.map(c => c.category),
    datasets: [
      {
        data: metrics.topIncomeCategories.map(c => c.amount),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded-lg"></div>
            <div className="h-80 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range and Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">از تاریخ:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">تا تاریخ:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)] text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {period === 'week' ? 'هفتگی' : 
               period === 'month' ? 'ماهانه' :
               period === 'quarter' ? 'فصلی' : 'سالانه'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                    <kpi.icon className={`w-5 h-5 text-${kpi.color}-600`} />
                  </div>
                  <h3 className="text-sm font-medium text-[var(--text-color-muted)]">
                    {kpi.title}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-[var(--text-color)] mb-2">
                  {kpi.value}
                </p>
                <div className="flex items-center gap-2">
                  {kpi.trend === 'up' && <TrendingUpIcon className="w-4 h-4 text-emerald-500" />}
                  {kpi.trend === 'down' && <TrendingDownIcon className="w-4 h-4 text-rose-500" />}
                  <span className={`text-sm ${
                    kpi.trend === 'up' ? 'text-emerald-600' :
                    kpi.trend === 'down' ? 'text-rose-600' : 'text-gray-600'
                  }`}>
                    {kpi.changeText} نسبت به ماه قبل
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">روند ماهانه درآمد و هزینه</h3>
            <ClockIcon className="w-5 h-5 text-[var(--text-color-muted)]" />
          </div>
          <Line 
            data={monthlyTrendsData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: false
                }
              }
            }} 
          />
        </motion.div>

        {/* Expense Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">توزیع هزینه‌ها</h3>
            <ChartBarIcon className="w-5 h-5 text-[var(--text-color-muted)]" />
          </div>
          <Doughnut 
            data={expenseCategoriesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }}
          />
        </motion.div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">منابع درآمد</h3>
            <BanknotesIcon className="w-5 h-5 text-[var(--text-color-muted)]" />
          </div>
          <Bar 
            data={{
              labels: metrics.topIncomeCategories.map(c => c.category),
              datasets: [{
                label: 'درآمد',
                data: metrics.topIncomeCategories.map(c => c.amount),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
              }]
            }}
            options={chartOptions}
          />
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">شاخص‌های عملکرد</h3>
            <TrendingUpIcon className="w-5 h-5 text-[var(--text-color-muted)]" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-color-muted)]">میانگین تراکنش</span>
              <span className="font-semibold">{formatCurrency(metrics.averageTransaction)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-color-muted)]">تعداد تراکنش‌ها</span>
              <span className="font-semibold">{toPersianDigits(metrics.transactionCount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-color-muted)]">حاشیه سود</span>
              <span className={`font-semibold ${metrics.profitMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {toPersianDigits(metrics.profitMargin.toFixed(1))}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-color-muted)]">میانگین شارژ ماهانه</span>
              <span className="font-semibold">{formatCurrency(metrics.averageMonthlyCharge)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Statistics Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold">آمار تفصیلی ماهانه</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-color)]">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">ماه</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">درآمد</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">هزینه</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">خالص</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-[var(--text-color-muted)]">تغییر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {metrics.monthlyTrends.map((trend, index) => {
                const previousNet = index > 0 ? metrics.monthlyTrends[index - 1].net : trend.net;
                const change = previousNet !== 0 ? ((trend.net - previousNet) / Math.abs(previousNet)) * 100 : 0;
                
                return (
                  <tr key={trend.month} className="hover:bg-[var(--bg-color)] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{trend.month}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600">{formatCurrency(trend.income)}</td>
                    <td className="px-6 py-4 text-sm text-rose-600">{formatCurrency(trend.expense)}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      <span className={trend.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(trend.net)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        {change > 0 ? (
                          <TrendingUpIcon className="w-4 h-4 text-emerald-500" />
                        ) : change < 0 ? (
                          <TrendingDownIcon className="w-4 h-4 text-rose-500" />
                        ) : null}
                        <span className={
                          change > 0 ? 'text-emerald-600' :
                          change < 0 ? 'text-rose-600' : 'text-gray-600'
                        }>
                          {toPersianDigits(Math.abs(change).toFixed(1))}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
