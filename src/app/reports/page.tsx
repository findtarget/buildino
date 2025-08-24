// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReportBuilder from '@/components/ReportBuilder';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { ReportConfig, AnalyticsMetrics } from '@/types/reports';
import { ReportsService } from '@/lib/reportsService';
import { mockEnhancedTransactions } from '@/lib/mockAccountingData';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  PresentationChartBarIcon
} from '@heroicons/react/24/outline';

const tabs = [
  { id: 'analytics', title: 'داشبورد تحلیلی', icon: ChartBarIcon },
  { id: 'builder', title: 'سازنده گزارش', icon: DocumentChartBarIcon },
  { id: 'reports', title: 'گزارشات من', icon: PresentationChartBarIcon },
  { id: 'settings', title: 'تنظیمات', icon: Cog6ToothIcon }
];

const reportTemplates: ReportConfig[] = [
  {
    id: 'income-statement-monthly',
    title: 'صورت سود و زیان ماهانه',
    description: 'گزارش کامل درآمدها و هزینه‌های ماهانه',
    type: 'financial',
    category: 'income-statement',
    frequency: 'monthly',
    dateRange: { from: '2024-01-01', to: '2024-12-31' },
    filters: { status: ['Posted'] },
    groupBy: ['month', 'category'],
    sortBy: [{ field: 'date', direction: 'desc' }],
    columns: [],
    charts: [
      {
        id: 'monthly-trend',
        type: 'line',
        title: 'روند ماهانه',
        xField: 'month',
        yField: 'amount',
        position: 'top'
      }
    ],
    exportFormats: ['pdf', 'excel'],
    isTemplate: true,
    createdBy: 'system',
    createdAt: '2024-01-01'
  },
  {
    id: 'cash-flow-quarterly',
    title: 'جریان نقدی فصلی',
    description: 'بررسی جریان نقدی به تفکیک فصل',
    type: 'financial',
    category: 'cash-flow',
    frequency: 'quarterly',
    dateRange: { from: '2024-01-01', to: '2024-12-31' },
    filters: { status: ['Posted'] },
    groupBy: ['quarter'],
    sortBy: [{ field: 'date', direction: 'asc' }],
    columns: [],
    charts: [
      {
        id: 'cash-flow-chart',
        type: 'bar',
        title: 'جریان نقدی فصلی',
        xField: 'quarter',
        yField: 'netAmount',
        position: 'top'
      }
    ],
    exportFormats: ['pdf', 'excel', 'csv'],
    isTemplate: true,
    createdBy: 'system',
    createdAt: '2024-01-01'
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: '2024-12-31'
  });
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState<ReportConfig[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const handleCreateReport = async (config: ReportConfig) => {
    try {
      // Simulate report generation
      const result = ReportsService.generateReport(config, mockEnhancedTransactions);
      console.log('Generated report:', result);
      
      // Add to my reports
      setMyReports(prev => [...prev, config]);
      
      // Switch to reports tab to show the result
      setActiveTab('reports');
      
      // Show success message
      alert('گزارش با موفقیت ایجاد شد!');
    } catch (error) {
      console.error('Error creating report:', error);
      alert('خطا در ایجاد گزارش');
    }
  };

  const handlePreviewReport = async (config: ReportConfig) => {
    try {
      const result = ReportsService.generateReport(config, mockEnhancedTransactions);
      console.log('Report preview:', result);
      
      // Open preview in new window or modal
      // This is a simplified version
      alert(`پیش‌نمایش گزارش: ${config.title}\nتعداد رکوردها: ${result.summary.totalRecords}`);
    } catch (error) {
      console.error('Error previewing report:', error);
      alert('خطا در نمایش پیش‌نمایش');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-2">
            گزارشات و تحلیل‌ها
          </h1>
          <p className="text-[var(--text-color-muted)]">
            داشبورد جامع تحلیل مالی و گزارش‌گیری پیشرفته
          </p>
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'analytics' && analytics && (
            <AnalyticsDashboard
              metrics={analytics}
              loading={loading}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          )}

          {activeTab === 'builder' && (
            <ReportBuilder
              onCreateReport={handleCreateReport}
              onPreviewReport={handlePreviewReport}
              templates={reportTemplates}
            />
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">گزارشات من</h2>
                <button
                  onClick={() => setActiveTab('builder')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ایجاد گزارش جدید
                </button>
              </div>

              {myReports.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <DocumentChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[var(--text-color)] mb-2">
                    هنوز گزارشی ایجاد نکرده‌اید
                  </h3>
                  <p className="text-[var(--text-color-muted)] mb-4">
                    با استفاده از سازنده گزارش، گزارش‌های سفارشی ایجاد کنید
                  </p>
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    شروع کنید
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myReports.map(report => (
                    <div
                      key={report.id}
                      className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)] hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <DocumentChartBarIcon className="w-8 h-8 text-blue-500" />
                        <span className="text-xs text-[var(--text-color-muted)]">
                          {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[var(--text-color)] mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-[var(--text-color-muted)] mb-4">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {report.category}
                        </span>
                        <button
                          onClick={() => handlePreviewReport(report)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          مشاهده
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
              <h2 className="text-xl font-semibold mb-6">تنظیمات گزارش‌گیری</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">تنظیمات عمومی</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>فرمت پیش‌فرض خروجی</span>
                      <select className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>زبان گزارش‌ها</span>
                      <select className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                        <option value="fa">فارسی</option>
                        <option value="en">انگلیسی</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">تنظیمات نمودارها</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>طرح رنگی پیش‌فرض</span>
                      <select className="px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                        <option value="default">پیش‌فرض</option>
                        <option value="colorful">رنگارنگ</option>
                        <option value="monochrome">تک‌رنگ</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>نمایش انیمیشن</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">تنظیمات امنیتی</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>واترمارک روی گزارش‌ها</span>
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>نیاز به تایید برای گزارش‌های مالی</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  ذخیره تنظیمات
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
