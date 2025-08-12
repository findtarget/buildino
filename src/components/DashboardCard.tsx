// src/components/DashboardCard.tsx
import { motion } from 'framer-motion';
// F: آیکون‌های مورد نیاز برای نمایش وضعیت تغییرات اضافه شدند
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// F: پراپ‌های جدید برای نمایش جزئیات تغییرات اضافه شد
interface DashboardCardProps {
  title: string;
  value: string;
  changeText?: string; // متن تغییرات (مثلا: +۵.۲٪)
  changeType?: 'increase' | 'decrease'; // نوع تغییر برای تعیین رنگ و آیکون
}

export default function DashboardCard({
  title,
  value,
  changeText,
  changeType,
}: DashboardCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      className="p-6 rounded-xl transform transition duration-300 hover:-translate-y-1 hover:scale-105 transition-colors flex flex-col justify-between" // F: فلکس برای چیدمان بهتر
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-color)',
        boxShadow: '4px 4px 20px var(--shadow-light), -4px -4px 20px var(--shadow-dark)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div>
        <h3
          className="font-bold mb-2 text-right"
          style={{ color: 'var(--accent-color)' }}
        >
          {title}
        </h3>
        <p
          className="text-3xl font-bold text-right"
          style={{ color: 'var(--text-color)' }} // F: اصلاح رنگ برای خوانایی بالا
        >
          {value}
        </p>
      </div>

      {/* F: بخش جدید برای نمایش درصد تغییرات */}
      {changeText && changeType && (
        <div className="mt-4 flex items-center justify-end">
          <span
            className={`text-sm font-semibold flex items-center gap-1 ${
              changeType === 'increase' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
            {changeText}
          </span>
          <span className="text-sm text-gray-400 mr-2">نسبت به ماه قبل</span>
        </div>
      )}
    </motion.div>
  );
}
