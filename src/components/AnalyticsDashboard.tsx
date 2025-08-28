// src/components/AnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { AnalyticsMetrics } from '@/types/reports';
import { toPersianDigits, formatCurrency } from '@/lib/utils';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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

  // اصلاح KPI Cards با استفاده از آیکون‌های صحیح
  const kpiCards = [
    {
      title: 'کل درآمد',
      value: formatCurrency(metrics.totalRevenue),
      change: metrics.monthlyGrowth?.net ?? 0,
      changeText: `${toPersianDigits(Math.abs(metrics.monthlyGrowth?.net ?? 0).toFixed(1))}%`,
      icon: BanknotesIcon,
      color: 'emerald',
      trend: (metrics.monthlyGrowth?.net ?? 0) >= 0 ? 'up' : 'down'
    },
    {
      title: 'کل هزینه‌ها',
      value: formatCurrency(metrics.totalExpenses),
      change: -2.1,
      changeText: '۲.۱%',
      icon: ArrowTrendingDownIcon, // اصلاح شده
      color: 'rose',
      trend: 'down'
    },
    {
      title: 'درآمد خالص',
      value: formatCurrency(metrics.netIncome),
      change: metrics.profitMargin ?? 0,
      changeText: `${toPersianDigits((metrics.profitMargin ?? 0).toFixed(1))}%`,
      icon: ArrowTrendingUpIcon, // اصلاح شده
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
      value: `${toPersianDigits((metrics.unitOccupancyRate ?? 0).toFixed(1))}%`,
      change: 2.3,
      changeText: '۲.۳%',
      icon: ChartBarIcon,
      color: 'purple',
      trend: 'up'
    },
    {
      title: 'نرخ وصولی',
      value: `${toPersianDigits((metrics.collectionRate ?? 0).toFixed(1))}%`,
      change: 1.8,
      changeText: '۱.۸%',
      icon: CalendarDaysIcon,
      color: 'indigo',
      trend: 'up'
    }
  ];

  // Monthly Trends Chart Data
  const monthlyTrendsData = {
    labels: metrics.monthlyData.map(t => t.month),
    datasets: [
      {
        label: 'درآمد',
        data: metrics.monthlyData.map(t => t.income),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'هزینه',
        data: metrics.monthlyData.map(t => t.expense),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'خالص',
        data: metrics.monthlyData.map(t => t.net),
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

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {period === 'week' ? 'هفتگی' : 
               period === 'month' ? 'ماهانه' :
               period === 'quarter' ? 'فصلی' : 'سالانه'}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setComparisonMode('previous')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode === 'previous'
                ? 'bg-blue-500 text-white'
                : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            مقایسه با دوره قبل
          </button>
          <button
            onClick={() => setComparisonMode('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode === 'year'
                ? 'bg-blue-500 text-white'
                : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            مقایسه با سال قبل
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-[var(--border-color)]"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-[var(--text-color-muted)] mb-2">
                    {card.title}
                  </h3>
                  <p className={`text-2xl font-bold mb-1 text-${card.color}-500`}>
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      card.trend === 'up' 
                        ? 'bg-green-100 text-green-600' 
                        : card.trend === 'down'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {card.trend === 'up' ? '↗' : card.trend === 'down' ? '↘' : '→'} {card.changeText}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                  <IconComponent className={`w-6 h-6 text-${card.color}-500`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-[var(--border-color)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            روند ماهانه درآمد و هزینه
          </h3>
          <div className="h-80">
            <Line data={monthlyTrendsData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Expense Categories Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-[var(--border-color)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            توزیع هزینه‌ها بر اساس دسته
          </h3>
          <div className="h-80">
            <Doughnut 
              data={expenseCategoriesData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </motion.div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Units */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border border-[var(--border-color)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            واحدهای برتر
          </h3>
          <div className="space-y-3">
            {metrics.topPerformingUnits?.slice(0, 5).map((unit, index) => (
              <div key={unit.unitId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {toPersianDigits((index + 1).toString())}
                  </div>
                  <span className="font-medium text-[var(--text-color)]">
                    واحد {toPersianDigits(unit.unitNumber)}
                  </span>
                </div>
                <span className="text-green-600 font-semibold">
                  {formatCurrency(unit.totalRevenue)}
                </span>
              </div>
            )) ?? <div className="text-[var(--text-color-muted)]">داده‌ای موجود نیست</div>}
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border border-[var(--border-color)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            وضعیت پرداخت‌ها
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-color-muted)]">پرداخت شده</span>
              <span className="text-green-600 font-semibold">
                {toPersianDigits((metrics.collectionRate ?? 0).toFixed(1))}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.collectionRate ?? 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-color-muted)]">معوق</span>
              <span className="text-red-600 font-semibold">
                {formatCurrency(metrics.totalOverdue ?? 0)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl border border-[var(--border-color)]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <h3 className="text-lg font-semibold text-[var(--text-color)] mb-4">
            فعالیت‌های اخیر
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-[var(--text-color-muted)]">
                شارژ ماهانه واحدها - امروز
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-[var(--text-color-muted)]">
                پرداخت قبض آب - دیروز
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-sm text-[var(--text-color-muted)]">
                تعمیر آسانسور - ۳ روز پیش
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-sm text-[var(--text-color-muted)]">
                نظافت راه‌پله - هفته گذشته
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
