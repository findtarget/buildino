// src/app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import { motion } from 'framer-motion';
import { toPersianDigits } from '@/lib/utils';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  BanknotesIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardData {
  units: {
    total: number;
    occupied: number;
    vacant: number;
  };
  financial: {
    monthlyIncome: number;
    monthlyExpenses: number;
    balance: number;
    overduePayments: number;
    averagePayment: number;
  };
}

interface MonthlyIncomeData {
  name: string;
  value: number;
}

interface ExpenseCategoryData {
  name: string;
  value: number;
  color: string;
}

interface RecentPayment {
  unit: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyIncomeData[]>([]);
  const [expensesCategoryData, setExpensesCategoryData] = useState<ExpenseCategoryData[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت داده‌های داشبورد
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // دریافت آمار کلی
        const dashboardResponse = await fetch('/api/dashboard');
        const dashboardResult = await dashboardResponse.json();
        
        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          setError(dashboardResult.error);
        }

        // دریافت درآمد ماهانه
        const incomeResponse = await fetch('/api/dashboard/monthly-income');
        const incomeResult = await incomeResponse.json();
        
        if (incomeResult.success) {
          setMonthlyIncomeData(incomeResult.data);
        }

        // دریافت دسته‌بندی هزینه‌ها
        const expensesResponse = await fetch('/api/dashboard/expenses-categories');
        const expensesResult = await expensesResponse.json();
        
        if (expensesResult.success) {
          setExpensesCategoryData(expensesResult.data);
        }

        // دریافت پرداخت‌های اخیر
        const paymentsResponse = await fetch('/api/dashboard/recent-payments');
        const paymentsResult = await paymentsResponse.json();
        
        if (paymentsResult.success) {
          setRecentPayments(paymentsResult.data);
        }

      } catch (error) {
        console.error('خطا در دریافت اطلاعات داشبورد:', error);
        setError('خطا در دریافت اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--accent-color)' }}></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg" style={{ color: 'var(--text-color)' }}>
            {error || 'خطا در بارگذاری اطلاعات داشبورد'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  // محاسبه نرخ اشغال
  const occupancyRate = dashboardData.units.total > 0 
    ? Math.round((dashboardData.units.occupied / dashboardData.units.total) * 100) 
    : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>
            داشبورد مدیریت
          </h1>
          <p className="text-sm opacity-70 mt-1">
            خلاصه‌ای از وضعیت مجتمع شما
          </p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-color)'
          }}
        >
          <option value="thisMonth">این ماه</option>
          <option value="lastMonth">ماه گذشته</option>
          <option value="thisYear">امسال</option>
        </select>
      </div>

      {/* کارت‌های اصلی */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <DashboardCard
          title="کل واحدها"
          value={toPersianDigits(dashboardData.units.total)}
          icon={<HomeIcon className="w-6 h-6" />}
          description={`${toPersianDigits(dashboardData.units.occupied)} اشغالی، ${toPersianDigits(dashboardData.units.vacant)} خالی`}
          color="var(--accent-color)"
        />
        <DashboardCard
          title="واحدهای اشغال"
          value={toPersianDigits(dashboardData.units.occupied)}
          icon={<UsersIcon className="w-6 h-6" />}
          description={`${toPersianDigits(occupancyRate)}% نرخ اشغال`}
          color="#22c55e"
        />
        <DashboardCard
          title="موجودی صندوق"
          value={`${toPersianDigits(Math.round(dashboardData.financial.balance/1000000))} میلیون`}
          icon={<BanknotesIcon className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: dashboardData.financial.balance > 0 }}
          color="#3b82f6"
        />
        <DashboardCard
          title="پرداخت‌های معوقه"
          value={toPersianDigits(dashboardData.financial.overduePayments)}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          description="واحد"
          color="#ef4444"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نمودار درآمد ماهانه */}
        <div className="lg:col-span-2">
          <ChartCard
            title="درآمد ماهانه"
            data={monthlyIncomeData}
            type="bar"
            icon={<ChartBarIcon className="w-6 h-6" />}
          />
        </div>

        {/* نمودار هزینه‌ها */}
        <div>
          <ChartCard
            title="هزینه‌ها بر اساس دسته"
            data={expensesCategoryData}
            type="pie"
            icon={<BanknotesIcon className="w-6 h-6" />}
          />
        </div>
      </div>

      {/* کارت‌های اضافی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="میانگین پرداخت"
          value={`${toPersianDigits(Math.round(dashboardData.financial.averagePayment/1000))} هزار`}
          icon={<BanknotesIcon className="w-6 h-6" />}
          description="تومان"
          color="#8b5cf6"
        />
        <DashboardCard
          title="درآمد ماهانه"
          value={`${toPersianDigits(Math.round(dashboardData.financial.monthlyIncome/1000000))} میلیون`}
          icon={<TruckIcon className="w-6 h-6" />}
          description="تومان"
          color="#f59e0b"
        />
        <DashboardCard
          title="نرخ اشغال"
          value={`${toPersianDigits(occupancyRate)}%`}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          description="از کل واحدها"
          color="#10b981"
        />
      </div>

      {/* پرداخت‌های اخیر */}
      {recentPayments.length > 0 && (
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClockIcon className="w-5 h-5" style={{ color: 'var(--accent-color)' }} />
              پرداخت‌های اخیر
            </h3>
            <button
              className="text-sm hover:underline"
              style={{ color: 'var(--accent-color)' }}
              onClick={() => window.location.href = '/accounting'}
            >
              مشاهده همه
            </button>
          </div>

          <div className="space-y-3">
            {recentPayments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-color)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="w-4 h-4 opacity-60" />
                    <span className="font-medium">واحد {toPersianDigits(payment.unit)}</span>
                  </div>
                  <span className="text-sm opacity-60">{toPersianDigits(payment.date)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {toPersianDigits(payment.amount.toLocaleString())} تومان
                  </span>
                  <div className="flex items-center">
                    {payment.status === 'paid' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    {payment.status === 'pending' && (
                      <ClockIcon className="w-5 h-5 text-yellow-500" />
                    )}
                    {payment.status === 'overdue' && (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
