// src/types/reports.ts
import { EnhancedTransaction } from './accounting';

// ... سایر تایپ‌های موجود ...

export interface ReportSummary {
  totalRecords: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  dateRange: { from: string; to: string };
  generatedAt: string;
}

export interface ReportResult {
  id: string;
  config: ReportConfig;
  data: EnhancedTransaction[];
  groupedData: { [key: string]: EnhancedTransaction[] };
  summary: ReportSummary;
  chartData: { [chartId: string]: any };
  columns: ReportColumn[];
  generatedAt: string;
}

// اضافه کردن پراپرتی‌های جدید به AnalyticsMetrics
export interface AnalyticsMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  averageTransactionAmount: number;
  topExpenseCategories: CategorySummary[];
  topIncomeCategories: CategorySummary[];
  monthlyData: MonthlyData[];
  monthlyGrowth: {
    revenue: number;
    expense: number;
    net: number;
  };
  unitMetrics: { [unitId: number]: any };
  profitMargin: number;
  unitOccupancyRate: number;
  collectionRate: number;
  topPerformingUnits?: {
    unitId: number;
    unitNumber: string;
    totalRevenue: number;
    balance: number;
  }[];
  totalOverdue?: number;
}

// سایر تایپ‌های موجود...
export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportConfig {
  id?: string;
  title: string;
  description?: string;
  type: 'financial' | 'operational' | 'analytical';
  category: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'budget' | 'units' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dateRange?: { from: string; to: string };
  filters?: ReportFilters;
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  columns?: ReportColumn[];
  charts?: ChartConfig[];
  exportFormats?: string[];
  isTemplate?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface ReportFilters {
  status?: string[];
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  unitIds?: number[];
  vendorIds?: string[];
}

export interface ReportColumn {
  id: string;
  title: string;
  field: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'boolean';
  visible: boolean;
  width?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  title: string;
  xField: string;
  yField: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  width?: number;
  height?: number;
}
