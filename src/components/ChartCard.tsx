// src/components/ChartCard.tsx
'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

// F: همان انیمیشن برای کارت چارت جهت هماهنگی با بقیه کارت‌ها
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export default function ChartCard() {
  const data = {
    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد'],
    datasets: [
      {
        label: 'پرداخت‌ها',
        data: [10, 15, 8, 20, 17],
        borderColor: 'var(--accent-color)',
        backgroundColor: 'var(--accent-color-light)',
        tension: 0.4, // F: اضافه کردن انحنا به خطوط نمودار برای زیبایی بیشتر
      },
    ],
  };

  return (
    // F: div به motion.div تبدیل شد و برای گرفتن کل عرض در دسکتاپ، col-span-3 اضافه شد
    <motion.div
      variants={cardVariants}
      className="p-6 rounded-xl transition-colors md:col-span-3"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-color)',
        boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
        border: '1px solid var(--border-color)',
      }}
    >
      <h3 className="font-bold mb-4" style={{ color: 'var(--accent-color)' }}>
        آمار پرداخت‌ها
      </h3>
      <Line data={data} />
    </motion.div>
  );
}
