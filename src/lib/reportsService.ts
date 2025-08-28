// src/lib/reportsService.ts
import { EnhancedTransaction, TransactionType, CategorySummary, MonthlyData } from '@/types/accounting';
import { AnalyticsMetrics, ReportConfig, ReportResult, ReportSummary } from '@/types/reports';

export class ReportsService {
  static generateAnalytics(
    transactions: EnhancedTransaction[],
    dateRange: { from: string; to: string }
  ): AnalyticsMetrics {
    // Filter transactions by date range if needed
    const filteredTransactions = transactions; // Add date filtering here if needed

    const totalRevenue = filteredTransactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.finalAmount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.finalAmount, 0);

    const netIncome = totalRevenue - totalExpenses;
    const transactionCount = filteredTransactions.length;
    const averageTransactionAmount = transactionCount > 0 ? (totalRevenue + totalExpenses) / transactionCount : 0;

    // >>>>>>>>>> بخش جدید اضافه شده <<<<<<<<<<
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    // Placeholder logic for occupancy and collection rates
    const occupiedUnitIds = new Set(filteredTransactions.map(t => t.relatedUnitId).filter(Boolean));
    const totalUnitsInBuilding = 24; // فرض می‌کنیم ۲۴ واحد در کل وجود دارد
    const unitOccupancyRate = totalUnitsInBuilding > 0 ? (occupiedUnitIds.size / totalUnitsInBuilding) * 100 : 0;
    const collectionRate = 95.5; // مقدار فرضی برای نمایش
    // >>>>>>>>>> پایان بخش جدید <<<<<<<<<<

    const expenseCategories = this.getCategorySummary(
      filteredTransactions.filter(t => t.type === TransactionType.Expense)
    );

    const incomeCategories = this.getCategorySummary(
      filteredTransactions.filter(t => t.type === TransactionType.Income)
    );

    const monthlyData = this.getMonthlyData(filteredTransactions);

    const unitMetrics: { [unitId: number]: any } = {};
    filteredTransactions
      .filter(t => t.relatedUnitId)
      .forEach(transaction => {
        const unitId = transaction.relatedUnitId!;
        if (!unitMetrics[unitId]) {
          unitMetrics[unitId] = { totalCharges: 0, totalPayments: 0, balance: 0 };
        }

        if (transaction.type === TransactionType.Income) {
          unitMetrics[unitId].totalCharges += transaction.finalAmount;
        }
      });

    // محاسبه واحدهای برتر
    const topPerformingUnits = Object.entries(unitMetrics)
      .map(([unitId, metrics]: [string, any]) => ({
        unitId: parseInt(unitId),
        unitNumber: `${unitId}`,
        totalRevenue: metrics.totalCharges,
        balance: metrics.balance
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      transactionCount,
      averageTransactionAmount,
      topExpenseCategories: expenseCategories,
      topIncomeCategories: incomeCategories,
      monthlyData,
      monthlyGrowth: {
        revenue: 12.5, // مقدار فرضی
        expense: 4.2,  // مقدار فرضی
        net: 15.1     // مقدار فرضی
      },
      unitMetrics,
      // >>>>>>>>>> پراپرتی‌های جدید اضافه شده به خروجی <<<<<<<<<<
      profitMargin,
      unitOccupancyRate,
      collectionRate,
      topPerformingUnits,
      totalOverdue: 150000 // مقدار فرضی
    };
  }

  // >>>>>>>>>> متد جدید generateReport <<<<<<<<<<
  static generateReport(
    config: ReportConfig,
    transactions: EnhancedTransaction[]
  ): ReportResult {
    try {
      // فیلتر کردن تراکنش‌ها بر اساس تنظیمات گزارش
      let filteredTransactions = [...transactions];

      // فیلتر بر اساس محدوده تاریخ
      if (config.dateRange?.from && config.dateRange?.to) {
        filteredTransactions = filteredTransactions.filter(t => {
          const transactionDate = t.date;
          return transactionDate >= config.dateRange!.from && transactionDate <= config.dateRange!.to;
        });
      }

      // فیلتر بر اساس وضعیت
      if (config.filters?.status && config.filters.status.length > 0) {
        filteredTransactions = filteredTransactions.filter(t =>
          config.filters!.status!.includes(t.status)
        );
      }

      // فیلتر بر اساس دسته‌بندی‌ها
      if (config.filters?.categories && config.filters.categories.length > 0) {
        filteredTransactions = filteredTransactions.filter(t =>
          config.filters!.categories!.includes(t.category)
        );
      }

      // فیلتر بر اساس مبلغ
      if (config.filters?.minAmount !== undefined) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.finalAmount >= config.filters!.minAmount!
        );
      }

      if (config.filters?.maxAmount !== undefined) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.finalAmount <= config.filters!.maxAmount!
        );
      }

      // مرتب‌سازی
      if (config.sortBy && config.sortBy.length > 0) {
        const sortField = config.sortBy[0];
        filteredTransactions.sort((a, b) => {
          let aVal = (a as any)[sortField.field];
          let bVal = (b as any)[sortField.field];

          if (sortField.field === 'finalAmount') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
          }

          if (sortField.direction === 'desc') {
            return bVal > aVal ? 1 : -1;
          } else {
            return aVal > bVal ? 1 : -1;
          }
        });
      }

      // گروه‌بندی داده‌ها
      let groupedData: any = {};
      if (config.groupBy && config.groupBy.length > 0) {
        const groupField = config.groupBy[0];
        groupedData = this.groupTransactionsByField(filteredTransactions, groupField);
      }

      // محاسبه خلاصه آماری
      const summary: ReportSummary = {
        totalRecords: filteredTransactions.length,
        totalIncome: filteredTransactions
          .filter(t => t.type === TransactionType.Income)
          .reduce((sum, t) => sum + t.finalAmount, 0),
        totalExpense: filteredTransactions
          .filter(t => t.type === TransactionType.Expense)
          .reduce((sum, t) => sum + t.finalAmount, 0),
        netAmount: 0,
        dateRange: config.dateRange || { from: '', to: '' },
        generatedAt: new Date().toISOString()
      };

      summary.netAmount = summary.totalIncome - summary.totalExpense;

      // ایجاد داده‌های نمودار
      const chartData: any = {};
      if (config.charts && config.charts.length > 0) {
        config.charts.forEach(chartConfig => {
          chartData[chartConfig.id] = this.generateChartData(
            filteredTransactions,
            chartConfig,
            groupedData
          );
        });
      }

      // تنظیم ستون‌های نمایش
      const displayColumns = config.columns && config.columns.length > 0 
        ? config.columns 
        : [
            { id: 'date', title: 'تاریخ', field: 'date', type: 'date', visible: true },
            { id: 'title', title: 'عنوان', field: 'title', type: 'text', visible: true },
            { id: 'amount', title: 'مبلغ', field: 'finalAmount', type: 'currency', visible: true },
            { id: 'category', title: 'دسته‌بندی', field: 'category', type: 'text', visible: true }
          ];

      const result: ReportResult = {
        id: config.id || `report_${Date.now()}`,
        config,
        data: filteredTransactions,
        groupedData,
        summary,
        chartData,
        columns: displayColumns,
        generatedAt: new Date().toISOString()
      };

      return result;

    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error(`خطا در تولید گزارش: ${error instanceof Error ? error.message : 'خطای نامشخص'}`);
    }
  }

  // >>>>>>>>>> متدهای کمکی جدید <<<<<<<<<<
  private static groupTransactionsByField(
    transactions: EnhancedTransaction[],
    field: string
  ): { [key: string]: EnhancedTransaction[] } {
    const grouped: { [key: string]: EnhancedTransaction[] } = {};

    transactions.forEach(transaction => {
      let key: string;

      switch (field) {
        case 'month':
          key = transaction.date.substring(0, 7); // YYYY-MM
          break;
        case 'quarter':
          const month = parseInt(transaction.date.substring(5, 7));
          const quarter = Math.ceil(month / 3);
          key = `Q${quarter} ${transaction.date.substring(0, 4)}`;
          break;
        case 'category':
          key = transaction.category;
          break;
        case 'status':
          key = transaction.status;
          break;
        case 'unit':
          key = transaction.relatedUnitId ? `واحد ${transaction.relatedUnitId}` : 'عمومی';
          break;
        default:
          key = (transaction as any)[field] || 'نامشخص';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(transaction);
    });

    return grouped;
  }

  private static generateChartData(
    transactions: EnhancedTransaction[],
    chartConfig: any,
    groupedData: any
  ): any {
    const { type, xField, yField } = chartConfig;

    if (Object.keys(groupedData).length > 0) {
      // استفاده از داده‌های گروه‌بندی شده
      const labels = Object.keys(groupedData);
      const data = labels.map(label => {
        const groupTransactions = groupedData[label];
        if (yField === 'finalAmount') {
          return groupTransactions.reduce((sum: number, t: EnhancedTransaction) => sum + t.finalAmount, 0);
        }
        return groupTransactions.length;
      });

      return {
        labels,
        datasets: [{
          label: chartConfig.title,
          data,
          backgroundColor: this.getChartColors(type, labels.length),
          borderColor: this.getChartColors(type, labels.length, true),
          borderWidth: 2
        }]
      };
    } else {
      // داده‌های ساده بدون گروه‌بندی
      const labels = transactions.map(t => (t as any)[xField]);
      const data = transactions.map(t => (t as any)[yField]);

      return {
        labels,
        datasets: [{
          label: chartConfig.title,
          data,
          backgroundColor: this.getChartColors(type, data.length),
          borderColor: this.getChartColors(type, data.length, true),
          borderWidth: 2
        }]
      };
    }
  }

  private static getChartColors(type: string, count: number, border: boolean = false): string[] {
    const baseColors = [
      'rgba(59, 130, 246, 0.8)',   // blue
      'rgba(16, 185, 129, 0.8)',   // emerald
      'rgba(245, 158, 11, 0.8)',   // amber
      'rgba(239, 68, 68, 0.8)',    // red
      'rgba(139, 92, 246, 0.8)',   // violet
      'rgba(236, 72, 153, 0.8)',   // pink
      'rgba(14, 165, 233, 0.8)',   // sky
      'rgba(34, 197, 94, 0.8)',    // green
    ];

    const borderColors = baseColors.map(color => color.replace('0.8', '1'));

    const colors = border ? borderColors : baseColors;
    
    // تکرار رنگ‌ها در صورت نیاز
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }

  private static getCategorySummary(transactions: EnhancedTransaction[]): CategorySummary[] {
    const categoryTotals: { [category: string]: { amount: number; count: number } } = {};
    const totalAmount = transactions.reduce((sum, t) => sum + t.finalAmount, 0);

    transactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = { amount: 0, count: 0 };
      }
      categoryTotals[transaction.category].amount += transaction.finalAmount;
      categoryTotals[transaction.category].count += 1;
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 categories
  }

  private static getMonthlyData(transactions: EnhancedTransaction[]): MonthlyData[] {
    const monthlyTotals: { [month: string]: { income: number; expense: number } } = {};

    transactions.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // Extract YYYY-MM
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = { income: 0, expense: 0 };
      }

      if (transaction.type === TransactionType.Income) {
        monthlyTotals[month].income += transaction.finalAmount;
      } else {
        monthlyTotals[month].expense += transaction.finalAmount;
      }
    });

    return Object.entries(monthlyTotals)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
