// src/lib/reportTemplates.ts
import { ReportConfig } from '@/types/reports';

export const reportTemplates: ReportConfig[] = [
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
  },
  {
    id: 'units-financial-summary',
    title: 'خلاصه مالی واحدها',
    description: 'گزارش مالی تفصیلی واحدهای ساختمان',
    type: 'operational',
    category: 'units',
    frequency: 'monthly',
    dateRange: { from: '2024-01-01', to: '2024-12-31' },
    filters: { status: ['Posted', 'Approved'] },
    groupBy: ['unit', 'category'],
    sortBy: [{ field: 'finalAmount', direction: 'desc' }],
    columns: [],
    charts: [
      {
        id: 'units-comparison',
        type: 'bar',
        title: 'مقایسه واحدها',
        xField: 'unit',
        yField: 'finalAmount',
        position: 'top'
      }
    ],
    exportFormats: ['pdf', 'excel'],
    isTemplate: true,
    createdBy: 'system',
    createdAt: '2024-01-01'
  }
];
