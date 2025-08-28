// src/components/ReportBuilder.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportConfig, ReportFilters, ReportColumn, ChartConfig } from '@/types/reports';
import { TransactionStatus } from '@/types/accounting';
import { toPersianDigits, formatCurrency, dateToJalaliString } from '@/lib/utils';
import CustomDatePicker from './CustomDatePicker';
import {
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface ReportBuilderProps {
  onCreateReport: (config: ReportConfig) => void;
  onPreviewReport: (config: ReportConfig) => void;
  templates: ReportConfig[];
  loading?: boolean;
}

const reportTypes = [
  { id: 'financial', title: 'گزارشات مالی', icon: ChartBarIcon },
  { id: 'operational', title: 'گزارشات عملیاتی', icon: TableCellsIcon },
  { id: 'analytical', title: 'گزارشات تحلیلی', icon: DocumentChartBarIcon }
];

const reportCategories = {
  'income-statement': 'صورت سود و زیان',
  'balance-sheet': 'ترازنامه',
  'cash-flow': 'جریان نقدی',
  'budget': 'بودجه',
  'units': 'واحدها',
  'custom': 'سفارشی'
};

const frequencies = {
  'daily': 'روزانه',
  'weekly': 'هفتگی',
  'monthly': 'ماهانه',
  'quarterly': 'فصلی',
  'yearly': 'سالانه',
  'custom': 'سفارشی'
};

const groupByOptions = [
  { id: 'date', title: 'تاریخ' },
  { id: 'month', title: 'ماه' },
  { id: 'quarter', title: 'فصل' },
  { id: 'account', title: 'حساب' },
  { id: 'category', title: 'دسته‌بندی' },
  { id: 'unit', title: 'واحد' },
  { id: 'vendor', title: 'تامین‌کننده' },
  { id: 'status', title: 'وضعیت' }
];

const chartTypes = [
  { id: 'bar', title: 'ستونی', icon: ChartBarIcon },
  { id: 'line', title: 'خطی', icon: ChartBarIcon },
  { id: 'pie', title: 'دایره‌ای', icon: ChartBarIcon },
  { id: 'doughnut', title: 'حلقه‌ای', icon: ChartBarIcon },
  { id: 'area', title: 'مساحت', icon: ChartBarIcon }
];

const statusOptions = [
  { value: TransactionStatus.Posted, label: 'ثبت شده' },
  { value: TransactionStatus.Approved, label: 'تایید شده' },
  { value: TransactionStatus.Pending, label: 'در انتظار' }
];

const categoryOptions = [
  { value: 'monthly-charge', label: 'شارژ ماهانه' },
  { value: 'utilities', label: 'قبوض و خدمات' },
  { value: 'maintenance', label: 'نگهداری و تعمیرات' },
  { value: 'supplies', label: 'لوازم و تجهیزات' },
  { value: 'security', label: 'نگهبانی و امنیت' },
  { value: 'insurance', label: 'بیمه' },
  { value: 'loan', label: 'وام و تسهیلات' },
  { value: 'penalty', label: 'جریمه' },
  { value: 'parking-charge', label: 'شارژ پارکینگ' },
  { value: 'elevator-charge', label: 'شارژ آسانسور' }
];

export default function ReportBuilder({
  onCreateReport,
  onPreviewReport,
  templates,
  loading = false
}: ReportBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    title: '',
    description: '',
    type: 'financial',
    category: 'income-statement',
    frequency: 'monthly',
    dateRange: { from: '', to: '' },
    filters: {},
    groupBy: ['month'],
    sortBy: [{ field: 'date', direction: 'desc' }],
    columns: [],
    charts: [],
    exportFormats: ['pdf', 'excel'],
    isTemplate: false
  });

  const [availableColumns, setAvailableColumns] = useState<ReportColumn[]>([
    { id: 'date', title: 'تاریخ', field: 'date', type: 'date', visible: true },
    { id: 'transactionNumber', title: 'شماره تراکنش', field: 'transactionNumber', type: 'text', visible: true },
    { id: 'title', title: 'عنوان', field: 'title', type: 'text', visible: true },
    { id: 'category', title: 'دسته‌بندی', field: 'category', type: 'text', visible: true },
    { id: 'amount', title: 'مبلغ', field: 'finalAmount', type: 'currency', visible: true, aggregation: 'sum' },
    { id: 'account', title: 'حساب', field: 'accountCode', type: 'text', visible: false },
    { id: 'vendor', title: 'تامین‌کننده', field: 'vendorName', type: 'text', visible: false },
    { id: 'unit', title: 'واحد', field: 'relatedUnitId', type: 'text', visible: false },
    { id: 'status', title: 'وضعیت', field: 'status', type: 'text', visible: true }
  ]);

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Update available columns based on report type and category
    if (config.type && config.category) {
      updateColumnsForCategory();
    }
  }, [config.type, config.category]);

  const updateColumnsForCategory = () => {
    let newColumns = [...availableColumns];

    if (config.category === 'balance-sheet') {
      newColumns = newColumns.map(col =>
        col.id === 'amount' ? { ...col, title: 'مانده' } : col
      );
    } else if (config.category === 'cash-flow') {
      newColumns.push(
        { id: 'cashIn', title: 'ورودی نقد', field: 'cashIn', type: 'currency', visible: true, aggregation: 'sum' },
        { id: 'cashOut', title: 'خروجی نقد', field: 'cashOut', type: 'currency', visible: true, aggregation: 'sum' }
      );
    }

    setAvailableColumns(newColumns);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFiltersChange = (filters: Partial<ReportFilters>) => {
    setConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  const handleColumnToggle = (columnId: string) => {
    const updatedColumns = availableColumns.map(col =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    setAvailableColumns(updatedColumns);
    setConfig(prev => ({ ...prev, columns: updatedColumns.filter(col => col.visible) }));
  };

  const addChart = () => {
    const newChart: ChartConfig = {
      id: `chart_${Date.now()}`,
      type: 'bar',
      title: 'نمودار جدید',
      xField: 'date',
      yField: 'finalAmount',
      position: 'top'
    };

    setConfig(prev => ({
      ...prev,
      charts: [...(prev.charts || []), newChart]
    }));
  };

  const removeChart = (chartId: string) => {
    setConfig(prev => ({
      ...prev,
      charts: prev.charts?.filter(chart => chart.id !== chartId) || []
    }));
  };

  const handlePreview = () => {
    if (validateConfig()) {
      // اضافه کردن نمودارها به config قبل از ارسال
      const finalConfig = {
        ...config,
        charts: config.charts || [],
        columns: availableColumns.filter(col => col.visible)
      };
      onPreviewReport(finalConfig as ReportConfig);
    }
  };

  const handleCreate = () => {
    if (validateConfig()) {
      const finalConfig: ReportConfig = {
        id: `report_${Date.now()}`,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        ...config,
        charts: config.charts || [],
        columns: availableColumns.filter(col => col.visible)
      } as ReportConfig;

      onCreateReport(finalConfig);
    }
  };

  const validateConfig = (): boolean => {
    return !!(config.title && config.type && config.category && config.dateRange?.from && config.dateRange?.to);
  };

  const loadTemplate = (template: ReportConfig) => {
    setConfig({
      ...template,
      id: undefined,
      title: `${template.title} - کپی`,
      isTemplate: false
    });
    setCurrentStep(1);
  };

  const handleStatusSelection = (statusValue: string, checked: boolean) => {
    let updatedStatuses;
    if (checked) {
      updatedStatuses = [...selectedStatuses, statusValue];
    } else {
      updatedStatuses = selectedStatuses.filter(s => s !== statusValue);
    }
    setSelectedStatuses(updatedStatuses);
    handleFiltersChange({ status: updatedStatuses as TransactionStatus[] });
  };

  const handleCategorySelection = (categoryValue: string, checked: boolean) => {
    let updatedCategories;
    if (checked) {
      updatedCategories = [...selectedCategories, categoryValue];
    } else {
      updatedCategories = selectedCategories.filter(c => c !== categoryValue);
    }
    setSelectedCategories(updatedCategories);
    handleFiltersChange({ categories: updatedCategories });
  };

  const steps = [
    { id: 1, title: 'تنظیمات کلی', icon: Cog6ToothIcon },
    { id: 2, title: 'فیلترها', icon: FunnelIcon },
    { id: 3, title: 'ستون‌ها و چیدمان', icon: TableCellsIcon },
    { id: 4, title: 'نمودارها', icon: ChartBarIcon },
    { id: 5, title: 'بررسی و ایجاد', icon: EyeIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Templates Section */}
      {templates.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DocumentChartBarIcon className="w-5 h-5" />
            قالب‌های آماده
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="p-4 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors cursor-pointer"
                onClick={() => loadTemplate(template)}
              >
                <h4 className="font-medium mb-2">{template.title}</h4>
                <p className="text-sm text-[var(--text-color-muted)] mb-3">{template.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {reportCategories[template.category]}
                  </span>
                  <span className="text-[var(--text-color-muted)]">
                    {frequencies[template.frequency]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Steps Indicator */}
      <div className="flex items-center justify-between bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--border-color)]">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepChange(step.id)}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                currentStep >= step.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              <step.icon className="w-5 h-5" />
            </button>
            <span className={`mx-3 text-sm hidden md:block ${
              currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 hidden md:block ${
                currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-6 border border-[var(--border-color)]">
        <AnimatePresence mode="wait">
          {/* Step 1: General Settings */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold mb-4">تنظیمات کلی گزارش</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    عنوان گزارش <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.title || ''}
                    onChange={(e) => handleConfigChange('title', e.target.value)}
                    placeholder="عنوان گزارش"
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    نوع گزارش <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={config.type || ''}
                    onChange={(e) => handleConfigChange('type', e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  >
                    {reportTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">توضیحات</label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  placeholder="توضیحات گزارش..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    دسته‌بندی <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={config.category || ''}
                    onChange={(e) => handleConfigChange('category', e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  >
                    {Object.entries(reportCategories).map(([key, title]) => (
                      <option key={key} value={key}>{title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">دوره‌بندی</label>
                  <select
                    value={config.frequency || ''}
                    onChange={(e) => handleConfigChange('frequency', e.target.value)}
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  >
                    {Object.entries(frequencies).map(([key, title]) => (
                      <option key={key} value={key}>{title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Range Selection - با تقویم شمسی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-3">
                    <CalendarDaysIcon className="w-4 h-4 inline ml-1" />
                    از تاریخ (شمسی) <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={config.dateRange?.from ? 
                      (() => {
                        try {
                          // اگر تاریخ به فرمت شمسی است، تبدیل کن
                          if (config.dateRange.from.includes('/') && config.dateRange.from.length === 10) {
                            const [jy, jm, jd] = config.dateRange.from.split('/').map(Number);
                            if (jy && jm && jd) {
                              const [gy, gm, gd_g] = jalaliToGregorian(jy, jm, jd);
                              return new Date(gy, gm - 1, gd_g);
                            }
                          }
                          return new Date(config.dateRange.from);
                        } catch {
                          return null;
                        }
                      })() 
                      : null}
                    onChange={(date) => {
                      if (date) {
                        const jalaliString = dateToJalaliString(date);
                        handleConfigChange('dateRange', {
                          ...config.dateRange,
                          from: jalaliString
                        });
                      }
                    }}
                    placeholder="انتخاب تاریخ شروع"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-color)] mb-3">
                    <CalendarDaysIcon className="w-4 h-4 inline ml-1" />
                    تا تاریخ (شمسی) <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={config.dateRange?.to ? 
                      (() => {
                        try {
                          // اگر تاریخ به فرمت شمسی است، تبدیل کن
                          if (config.dateRange.to.includes('/') && config.dateRange.to.length === 10) {
                            const [jy, jm, jd] = config.dateRange.to.split('/').map(Number);
                            if (jy && jm && jd) {
                              const [gy, gm, gd_g] = jalaliToGregorian(jy, jm, jd);
                              return new Date(gy, gm - 1, gd_g);
                            }
                          }
                          return new Date(config.dateRange.to);
                        } catch {
                          return null;
                        }
                      })() 
                      : null}
                    onChange={(date) => {
                      if (date) {
                        const jalaliString = dateToJalaliString(date);
                        handleConfigChange('dateRange', {
                          ...config.dateRange,
                          to: jalaliString
                        });
                      }
                    }}
                    placeholder="انتخاب تاریخ پایان"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Filters */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold mb-4">فیلترهای گزارش</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* وضعیت تراکنش‌ها */}
                <div>
                  <label className="block text-sm font-medium mb-3">وضعیت تراکنش‌ها</label>
                  <div className="space-y-3 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                    {statusOptions.map(option => (
                      <div key={option.value} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`status-${option.value}`}
                          checked={selectedStatuses.includes(option.value)}
                          onChange={(e) => handleStatusSelection(option.value, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`status-${option.value}`}
                          className="text-sm text-[var(--text-color)] cursor-pointer select-none"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* دسته‌های مورد نظر */}
                <div>
                  <label className="block text-sm font-medium mb-3">دسته‌های مورد نظر</label>
                  <div className="space-y-3 p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                    {categoryOptions.map(option => (
                      <div key={option.value} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id={`category-${option.value}`}
                          checked={selectedCategories.includes(option.value)}
                          onChange={(e) => handleCategorySelection(option.value, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`category-${option.value}`}
                          className="text-sm text-[var(--text-color)] cursor-pointer select-none"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">حداقل مبلغ</label>
                  <input
                    type="number"
                    placeholder="حداقل مبلغ"
                    onChange={(e) => handleFiltersChange({
                      amountRange: {
                        ...config.filters?.amountRange,
                        min: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">حداکثر مبلغ</label>
                  <input
                    type="number"
                    placeholder="حداکثر مبلغ"
                    onChange={(e) => handleFiltersChange({
                      amountRange: {
                        ...config.filters?.amountRange,
                        max: parseFloat(e.target.value) || Number.MAX_VALUE
                      }
                    })}
                    className="w-full p-3 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Columns */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold mb-4">انتخاب ستون‌ها</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableColumns.map(column => (
                  <div key={column.id} className="flex items-center gap-3 p-3 border border-[var(--border-color)] rounded-lg">
                    <input
                      type="checkbox"
                      id={`column-${column.id}`}
                      checked={column.visible}
                      onChange={() => handleColumnToggle(column.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`column-${column.id}`}
                      className="text-sm text-[var(--text-color)] cursor-pointer select-none flex-1"
                    >
                      {column.title}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">گروه‌بندی بر اساس</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {groupByOptions.map(option => (
                    <div key={option.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`groupby-${option.id}`}
                        checked={config.groupBy?.includes(option.id) || false}
                        onChange={(e) => {
                          const currentGroupBy = config.groupBy || [];
                          const newGroupBy = e.target.checked
                            ? [...currentGroupBy, option.id]
                            : currentGroupBy.filter(g => g !== option.id);
                          handleConfigChange('groupBy', newGroupBy);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`groupby-${option.id}`}
                        className="text-sm text-[var(--text-color)] cursor-pointer select-none"
                      >
                        {option.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Charts */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">نمودارها</h3>
                <button
                  onClick={addChart}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  افزودن نمودار
                </button>
              </div>

              <div className="space-y-4">
                {(config.charts || []).map((chart, index) => (
                  <div key={chart.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)]">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">نمودار {toPersianDigits((index + 1).toString())}</h4>
                      <button
                        onClick={() => removeChart(chart.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">عنوان نمودار</label>
                        <input
                          type="text"
                          value={chart.title}
                          onChange={(e) => {
                            const updatedCharts = config.charts?.map(c =>
                              c.id === chart.id ? { ...c, title: e.target.value } : c
                            );
                            handleConfigChange('charts', updatedCharts);
                          }}
                          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">نوع نمودار</label>
                        <select
                          value={chart.type}
                          onChange={(e) => {
                            const updatedCharts = config.charts?.map(c =>
                              c.id === chart.id ? { ...c, type: e.target.value as any } : c
                            );
                            handleConfigChange('charts', updatedCharts);
                          }}
                          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          {chartTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">محور X</label>
                        <select
                          value={chart.xField}
                          onChange={(e) => {
                            const updatedCharts = config.charts?.map(c =>
                              c.id === chart.id ? { ...c, xField: e.target.value } : c
                            );
                            handleConfigChange('charts', updatedCharts);
                          }}
                          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          <option value="date">تاریخ</option>
                          <option value="category">دسته‌بندی</option>
                          <option value="month">ماه</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">محور Y</label>
                        <select
                          value={chart.yField}
                          onChange={(e) => {
                            const updatedCharts = config.charts?.map(c =>
                              c.id === chart.id ? { ...c, yField: e.target.value } : c
                            );
                            handleConfigChange('charts', updatedCharts);
                          }}
                          className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)]"
                        >
                          <option value="finalAmount">مبلغ</option>
                          <option value="count">تعداد</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">موقعیت</label>
                      <select
                        value={chart.position}
                        onChange={(e) => {
                          const updatedCharts = config.charts?.map(c =>
                            c.id === chart.id ? { ...c, position: e.target.value as any } : c
                          );
                          handleConfigChange('charts', updatedCharts);
                        }}
                        className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--border-color)]"
                      >
                        <option value="top">بالای جدول</option>
                        <option value="bottom">پایین جدول</option>
                        <option value="left">سمت چپ</option>
                        <option value="right">سمت راست</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {(!config.charts || config.charts.length === 0) && (
                <div className="text-center py-12 text-[var(--text-color-muted)]">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>هنوز نموداری اضافه نشده است</p>
                  <p className="text-sm mt-1">برای افزودن نمودار از دکمه "افزودن نمودار" استفاده کنید</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold mb-4">بررسی و تایید نهایی</h3>

              <div className="bg-[var(--bg-color)] rounded-lg p-6 border border-[var(--border-color)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">عنوان:</span>
                    <span className="mr-2">{config.title}</span>
                  </div>
                  <div>
                    <span className="font-medium">نوع:</span>
                    <span className="mr-2">{reportTypes.find(t => t.id === config.type)?.title}</span>
                  </div>
                  <div>
                    <span className="font-medium">دسته‌بندی:</span>
                    <span className="mr-2">{reportCategories[config.category as keyof typeof reportCategories]}</span>
                  </div>
                  <div>
                    <span className="font-medium">دوره‌بندی:</span>
                    <span className="mr-2">{frequencies[config.frequency as keyof typeof frequencies]}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">بازه زمانی (شمسی):</span>
                    <span className="mr-2">
                      {config.dateRange?.from && toPersianDigits(config.dateRange.from)} الی{' '}
                      {config.dateRange?.to && toPersianDigits(config.dateRange.to)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">تعداد ستون‌ها:</span>
                    <span className="mr-2">{toPersianDigits(availableColumns.filter(col => col.visible).length.toString())}</span>
                  </div>
                  <div>
                    <span className="font-medium">تعداد نمودارها:</span>
                    <span className="mr-2">{toPersianDigits((config.charts?.length || 0).toString())}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">فرمت‌های خروجی:</span>
                    <span className="mr-2">{config.exportFormats?.join(', ')}</span>
                  </div>
                </div>
              </div>

              {config.description && (
                <div className="bg-[var(--bg-color)] rounded-lg p-4 border border-[var(--border-color)]">
                  <span className="font-medium">توضیحات:</span>
                  <p className="mt-2 text-[var(--text-color-muted)]">{config.description}</p>
                </div>
              )}

              {/* نمایش فیلترهای انتخابی */}
              {(selectedStatuses.length > 0 || selectedCategories.length > 0) && (
                <div className="bg-[var(--bg-color)] rounded-lg p-4 border border-[var(--border-color)]">
                  <span className="font-medium">فیلترهای اعمال شده:</span>
                  <div className="mt-2 space-y-2">
                    {selectedStatuses.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">وضعیت‌ها: </span>
                        <span className="text-sm text-[var(--text-color-muted)]">
                          {selectedStatuses.map(status => 
                            statusOptions.find(opt => opt.value === status)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    {selectedCategories.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">دسته‌ها: </span>
                        <span className="text-sm text-[var(--text-color-muted)]">
                          {selectedCategories.map(category => 
                            categoryOptions.find(opt => opt.value === category)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* نمایش نمودارهای انتخابی */}
              {config.charts && config.charts.length > 0 && (
                <div className="bg-[var(--bg-color)] rounded-lg p-4 border border-[var(--border-color)]">
                  <span className="font-medium">نمودارهای انتخابی:</span>
                  <div className="mt-2 space-y-2">
                    {config.charts.map((chart, index) => (
                      <div key={chart.id} className="text-sm">
                        <span className="font-medium">{toPersianDigits((index + 1).toString())}. {chart.title}</span>
                        <span className="text-[var(--text-color-muted)] mr-2">
                          (نوع: {chartTypes.find(t => t.id === chart.type)?.title})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] mt-6">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => handleStepChange(currentStep - 1)}
                className="px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors"
              >
                قبلی
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < 5 ? (
              <button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={!validateConfig() && currentStep === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بعدی
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-color)] transition-colors"
                >
                  <EyeIcon className="w-4 h-4" />
                  پیش‌نمایش
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || !validateConfig()}
                  className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {loading ? 'در حال ایجاد...' : 'ایجاد گزارش'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
