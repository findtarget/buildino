// src/components/MyReports.tsx
'use client';

import { ReportConfig } from '@/types/reports';
import { motion } from 'framer-motion';
import {
  DocumentChartBarIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface MyReportsProps {
  reports: ReportConfig[];
  onPreview: (report: ReportConfig) => void;
  onDelete: (reportId: string) => void;
  onCreateNew: () => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'income-statement': 'bg-blue-100 text-blue-800',
    'balance-sheet': 'bg-green-100 text-green-800',
    'cash-flow': 'bg-purple-100 text-purple-800',
    'budget': 'bg-yellow-100 text-yellow-800',
    'units': 'bg-pink-100 text-pink-800',
    'custom': 'bg-gray-100 text-gray-800'
  };
  return colors[category] || colors.custom;
};

const getCategoryTitle = (category: string) => {
  const titles: Record<string, string> = {
    'income-statement': 'صورت سود و زیان',
    'balance-sheet': 'ترازنامه',
    'cash-flow': 'جریان نقدی',
    'budget': 'بودجه',
    'units': 'واحدها',
    'custom': 'سفارشی'
  };
  return titles[category] || 'نامشخص';
};

export default function MyReports({ reports, onPreview, onDelete, onCreateNew }: MyReportsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-color)]">گزارشات من</h2>
          <p className="text-[var(--text-color-muted)] mt-1">
            مدیریت و مشاهده گزارش‌های ایجاد شده
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          ایجاد گزارش جدید
        </button>
      </div>

      {reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]"
        >
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <DocumentChartBarIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-color)] mb-2">
            هنوز گزارشی ایجاد نکرده‌اید
          </h3>
          <p className="text-[var(--text-color-muted)] mb-6 max-w-md mx-auto">
            با استفاده از سازنده گزارش، گزارش‌های سفارشی و حرفه‌ای ایجاد کنید
          </p>
          <button
            onClick={onCreateNew}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            شروع کنید
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={`report-${report.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)] hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                  <DocumentChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-color-muted)]">
                  <CalendarIcon className="w-4 h-4" />
                  {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="font-bold text-[var(--text-color)] mb-2 text-lg group-hover:text-blue-600 transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-[var(--text-color-muted)] mb-3 line-clamp-2">
                  {report.description}
                </p>
              </div>

              {/* Tags and Info */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                  <TagIcon className="w-3 h-3" />
                  {getCategoryTitle(report.category)}
                </div>
                <div className="text-xs text-[var(--text-color-muted)] bg-gray-100 px-2 py-1 rounded">
                  {report.frequency === 'monthly' ? 'ماهانه' : 
                   report.frequency === 'quarterly' ? 'فصلی' : 
                   report.frequency === 'yearly' ? 'سالانه' : 'سفارشی'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onPreview(report)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  مشاهده
                </button>
                <button
                  onClick={() => onDelete(report.id!)}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
