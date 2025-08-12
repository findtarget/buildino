// src/app/dashboard/page.tsx

'use client';
import { useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import ChartCard from '@/components/ChartCard';
import { motion } from 'framer-motion';
import { toPersianDigits } from '@/lib/utils'; // F: وارد کردن ابزار تبدیل اعداد

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
      }}
    >
      <div className="flex-1 p-6">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* F: تمام اعداد با استفاده از ابزار toPersianDigits به فارسی تبدیل شده‌اند */}
          <DashboardCard title="مجموع واحدها" value={toPersianDigits(24)} />
          <DashboardCard title="ساکنین ثبت‌شده" value={toPersianDigits(56)} />
          <DashboardCard title="موجودی صندوق" value={`${toPersianDigits('5,300,000')} تومان`} />
          <DashboardCard title="پرداخت‌های معوقه" value={toPersianDigits(5)} />
          <DashboardCard title="میانگین پرداخت" value={`${toPersianDigits('350,000')} تومان`} />
          <ChartCard />
        </motion.div>
      </div>
    </div>
  );
}
