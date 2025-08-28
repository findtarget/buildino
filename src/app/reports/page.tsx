// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReportBuilder from '@/components/ReportBuilder';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import MyReports from '@/components/MyReports';
import ReportSettings from '@/components/ReportSettings';
import ReportPreviewModal from '@/components/ReportPreviewModal';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { ReportConfig, AnalyticsMetrics } from '@/types/reports';
import { ReportsService } from '@/lib/reportsService';
import { reportTemplates } from '@/lib/reportTemplates';
import { 
  mockReportTransactions, 
  reportColumns, 
  calculateReportSummary 
} from '@/lib/mockReportData';
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

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: '1403/08/01',
    to: '1403/09/30'
  });
  const [loading, setLoading] = useState(true);
  const [myReports, setMyReports] = useState<ReportConfig[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Modal states
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  useEffect(() => {
    // بارگذاری گزارش‌های پیش‌فرض برای نمایش
    const sampleReports: ReportConfig[] = [
      {
        ...reportTemplates[0],
        id: 'report-001',
        createdAt: '1403/08/01',
        isTemplate: false
      },
      {
        ...reportTemplates[1],
        id: 'report-002',
        createdAt: '1403/08/15',
        isTemplate: false
      }
    ];
    setMyReports(sampleReports);
  }, []);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // فیلتر کردن تراکنش‌ها بر اساس بازه تاریخی
      const filteredTransactions = mockReportTransactions.filter(transaction => {
        const transactionDate = transaction.date;
        return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
      });

      const analyticsData = ReportsService.generateAnalytics(
        filteredTransactions,
        dateRange
      );
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showAlert('error', 'خطا در بارگذاری', 'خطا در بارگذاری داده‌های تحلیلی');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (config: ReportConfig) => {
    try {
      setLoading(true);
      
      // شبیه‌سازی ایجاد گزارش با داده‌های واقعی
      const reportData = {
        config,
        data: mockReportTransactions.filter(t => t.status === 'Posted'),
        columns: reportColumns,
        summary: calculateReportSummary(mockReportTransactions.filter(t => t.status === 'Posted')),
        generatedAt: new Date().toISOString()
      };

      console.log('Generated report:', reportData);
      
      // اضافه کردن گزارش جدید با ID یکتا
      const newReport = {
        ...config,
        id: `report-${Date.now()}`,
        createdAt: new Date().toLocaleDateString('fa-IR'),
        isTemplate: false
      };
      
      setMyReports(prev => [...prev, newReport]);
      setActiveTab('reports');
      showAlert('success', 'گزارش ایجاد شد', 'گزارش با موفقیت ایجاد شد!');
    } catch (error) {
      console.error('Error creating report:', error);
      showAlert('error', 'خطا در ایجاد گزارش', 'خطا در ایجاد گزارش');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewReport = async (config: ReportConfig) => {
    try {
      setLoading(true);
      
      // تولید گزارش با داده‌های واقعی
      const reportData = {
        config,
        data: mockReportTransactions.filter(t => {
          if (config.filters?.status) {
            return config.filters.status.includes(t.status);
          }
          return t.status === 'Posted';
        }),
        columns: reportColumns,
        summary: calculateReportSummary(
          mockReportTransactions.filter(t => {
            if (config.filters?.status) {
              return config.filters.status.includes(t.status);
            }
            return t.status === 'Posted';
          })
        ),
        generatedAt: new Date().toISOString()
      };
      
      setSelectedReport(reportData);
      setShowReportModal(true);
    } catch (error) {
      console.error('Error previewing report:', error);
      showAlert('error', 'خطا در نمایش پیش‌نمایش', 'خطا در نمایش پیش‌نمایش');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    const reportToDelete = myReports.find(r => r.id === reportId);
    if (reportToDelete) {
      showConfirm(
        'حذف گزارش',
        `آیا از حذف گزارش "${reportToDelete.title}" مطمئن هستید؟`,
        () => {
          setMyReports(prev => prev.filter(report => report.id !== reportId));
          showAlert('success', 'حذف موفقیت‌آمیز', 'گزارش با موفقیت حذف شد.');
        }
      );
    }
  };

  const handleSaveSettings = (settings: any) => {
    console.log('Saving settings:', settings);
    showAlert('success', 'تنظیمات ذخیره شد', 'تنظیمات با موفقیت ذخیره شد.');
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
        <div className="flex space-x-1 space-x-reverse mb-8 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-color)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'text-[var(--text-color-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-color)]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:block">{tab.title}</span>
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
            <MyReports
              reports={myReports}
              onPreview={handlePreviewReport}
              onDelete={handleDeleteReport}
              onCreateNew={() => setActiveTab('builder')}
            />
          )}

          {activeTab === 'settings' && (
            <ReportSettings onSave={handleSaveSettings} />
          )}
        </motion.div>

        {/* Modals */}
        <ReportPreviewModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportData={selectedReport}
          loading={loading}
          onAlert={showAlert}
        />

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
        />
      </div>
    </div>
  );
}
