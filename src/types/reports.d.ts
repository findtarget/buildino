// src/types/reports.d.ts
export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'operational' | 'analytical';
  category: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'budget' | 'units' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dateRange: {
    from: string;
    to: string;
  };
  filters: ReportFilters;
  groupBy: ReportGroupBy[];
  sortBy: ReportSortBy[];
  columns: ReportColumn[];
  charts: ChartConfig[];
  exportFormats: ('pdf' | 'excel' | 'csv')[];
  isTemplate: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ReportFilters {
  accounts?: string[];
  categories?: string[];
  units?: number[];
  vendors?: string[];
  status?: TransactionStatus[];
  amountRange?: { min: number; max: number };
  tags?: string[];
}

export type ReportGroupBy = 'date' | 'account' | 'category' | 'unit' | 'vendor' | 'status' | 'month' | 'quarter';

export interface ReportSortBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportColumn {
  id: string;
  title: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'currency';
  width?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  visible: boolean;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  xField: string;
  yField: string;
  groupBy?: string;
  colors?: string[];
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ReportResult {
  id: string;
  config: ReportConfig;
  data: ReportData[];
  summary: ReportSummary;
  charts: ChartData[];
  generatedAt: string;
  executionTime: number;
}

export interface ReportData {
  [key: string]: any;
}

export interface ReportSummary {
  totalRecords: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransaction: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  trends: { period: string; amount: number; change: number }[];
}

export interface ChartData {
  id: string;
  type: string;
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }[];
  };
  options?: any;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  monthlyGrowth: number;
  averageTransaction: number;
  transactionCount: number;
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
  topIncomeCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrends: { month: string; income: number; expense: number; net: number }[];
  unitOccupancyRate: number;
  averageMonthlyCharge: number;
  collectionRate: number;
}
// src/types/reports.d.ts
export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'operational' | 'analytical';
  category: 'income-statement' | 'balance-sheet' | 'cash-flow' | 'budget' | 'units' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  dateRange: {
    from: string;
    to: string;
  };
  filters: ReportFilters;
  groupBy: ReportGroupBy[];
  sortBy: ReportSortBy[];
  columns: ReportColumn[];
  charts: ChartConfig[];
  exportFormats: ('pdf' | 'excel' | 'csv')[];
  isTemplate: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface ReportFilters {
  accounts?: string[];
  categories?: string[];
  units?: number[];
  vendors?: string[];
  status?: TransactionStatus[];
  amountRange?: { min: number; max: number };
  tags?: string[];
}

export type ReportGroupBy = 'date' | 'account' | 'category' | 'unit' | 'vendor' | 'status' | 'month' | 'quarter';

export interface ReportSortBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ReportColumn {
  id: string;
  title: string;
  field: string;
  type: 'text' | 'number' | 'date' | 'currency';
  width?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  visible: boolean;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  xField: string;
  yField: string;
  groupBy?: string;
  colors?: string[];
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface ReportResult {
  id: string;
  config: ReportConfig;
  data: ReportData[];
  summary: ReportSummary;
  charts: ChartData[];
  generatedAt: string;
  executionTime: number;
}

export interface ReportData {
  [key: string]: any;
}

export interface ReportSummary {
  totalRecords: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  averageTransaction: number;
  topCategories: { category: string; amount: number; percentage: number }[];
  trends: { period: string; amount: number; change: number }[];
}

export interface ChartData {
  id: string;
  type: string;
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }[];
  };
  options?: any;
}

export interface AnalyticsMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  monthlyGrowth: number;
  averageTransaction: number;
  transactionCount: number;
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
  topIncomeCategories: { category: string; amount: number; percentage: number }[];
  monthlyTrends: { month: string; income: number; expense: number; net: number }[];
  unitOccupancyRate: number;
  averageMonthlyCharge: number;
  collectionRate: number;
}
