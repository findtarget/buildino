'use client';
import { useState } from 'react';
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

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  // دیتای فرضی واحدها
  const unitsData = {
    total: 24,
    residential: 20,
    commercial: 4,
    occupied: 18,
    vacant: 6,
    ownerOccupied: 12,
    tenantOccupied: 6
  };

  // دیتای فرضی مالی
  const financialData = {
    totalIncome: 45600000,
    totalExpenses: 23400000,
    balance: 22200000,
    pendingPayments: 8,
    averagePayment: 450000,
    monthlyCharge: 38400000
  };

  // دیتای فرضی نمودار درآمد ماهانه
  const monthlyIncomeData = [
    { name: 'فروردین', value: 42000000 },
    { name: 'اردیبهشت', value: 45000000 },
    { name: 'خرداد', value: 48000000 },
    { name: 'تیر', value: 46000000 },
    { name: 'مرداد', value: 49000000 },
    { name: 'شهریور', value: 45600000 }
  ];

  // دیتای فرضی نمودار هزینه‌ها
  const expensesCategoryData = [
    { name: 'تعمیرات', value: 8500000, color: '#ef4444' },
    { name: 'مشاعات', value: 6200000, color: '#f97316' },
    { name: 'حقوق', value: 5400000, color: '#eab308' },
    { name: 'نظافت', value: 2100000, color: '#22c55e' },
    { name: 'متفرقه', value: 1200000, color: '#3b82f6' }
  ];

  // دیتای فرضی پرداخت‌های اخیر
  const recentPayments = [
    { unit: '101', amount: 520000, date: '1403/06/01', status: 'paid' },
    { unit: '102', amount: 480000, date: '1403/06/01', status: 'paid' },
    { unit: '103', amount: 450000, date: '1403/05/30', status: 'pending' },
    { unit: '201', amount: 600000, date: '1403/05/29', status: 'paid' },
    { unit: '202', amount: 520000, date: '1403/05/28', status: 'overdue' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
          value={toPersianDigits(unitsData.total)} 
          icon={<HomeIcon className="w-6 h-6" />}
          description={`${toPersianDigits(unitsData.residential)} مسکونی، ${toPersianDigits(unitsData.commercial)} تجاری`}
          color="var(--accent-color)"
        />
        <DashboardCard 
          title="واحدهای اشغال" 
          value={toPersianDigits(unitsData.occupied)} 
          icon={<UsersIcon className="w-6 h-6" />}
          description={`${toPersianDigits(unitsData.vacant)} واحد خالی`}
          color="#22c55e"
        />
        <DashboardCard 
          title="موجودی صندوق" 
          value={`${toPersianDigits(Math.round(financialData.balance/1000000))} میلیون`} 
          icon={<BanknotesIcon className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
          color="#3b82f6"
        />
        <DashboardCard 
          title="پرداخت‌های معوقه" 
          value={toPersianDigits(financialData.pendingPayments)} 
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
          value={`${toPersianDigits(Math.round(financialData.averagePayment/1000))} هزار`} 
          icon={<BanknotesIcon className="w-6 h-6" />}
          description="تومان"
          color="#8b5cf6"
        />
        <DashboardCard 
          title="پارکینگ‌ها" 
          value={toPersianDigits(18)} 
          icon={<TruckIcon className="w-6 h-6" />}
          description={`از ${toPersianDigits(24)} واحد`}
          color="#f59e0b"
        />
        <DashboardCard 
          title="نرخ تکمیل" 
          value={`${toPersianDigits(75)}%`} 
          icon={<CheckCircleIcon className="w-6 h-6" />}
          description="اشغال واحدها"
          color="#10b981"
        />
      </div>

      {/* پرداخت‌های اخیر */}
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
    </div>
  );
}
