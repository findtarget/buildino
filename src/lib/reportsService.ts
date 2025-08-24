// src/lib/reportsService.ts
import { ReportConfig, ReportResult, AnalyticsMetrics, ReportData } from '@/types/reports.d';
import { EnhancedTransaction, TransactionStatus } from '@/types/accounting.d';
import { formatJalaliDate, parseJalaliDate } from '@/lib/utils';
import { getAccountByCode } from '@/lib/chartOfAccounts';

export class ReportsService {
  static generateReport(config: ReportConfig, transactions: EnhancedTransaction[]): ReportResult {
    const startTime = Date.now();
    
    // Filter transactions based on config
    const filteredTransactions = this.filterTransactions(transactions, config);
    
    // Process and group data
    const processedData = this.processData(filteredTransactions, config);
    
    // Generate summary
    const summary = this.generateSummary(processedData, config);
    
    // Generate chart data
    const charts = this.generateChartData(processedData, config);
    
    const executionTime = Date.now() - startTime;
    
    return {
      id: `report_${Date.now()}`,
      config,
      data: processedData,
      summary,
      charts,
      generatedAt: new Date().toISOString(),
      executionTime
    };
  }

  static generateAnalytics(
    transactions: EnhancedTransaction[],
    dateRange: { from: string; to: string }
  ): AnalyticsMetrics {
    const postedTransactions = transactions.filter(t => 
      t.status === TransactionStatus.Posted &&
      this.isInDateRange(t.date, dateRange)
    );

    const incomeTransactions = postedTransactions.filter(t => t.type === 'Income');
    const expenseTransactions = postedTransactions.filter(t => t.type === 'Expense');

    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.finalAmount, 0);
    const netIncome = totalRevenue - totalExpenses;
    
    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(postedTransactions, dateRange);
    
    // Calculate growth
    const currentMonthNet = monthlyTrends[monthlyTrends.length - 1]?.net || 0;
    const previousMonthNet = monthlyTrends[monthlyTrends.length - 2]?.net || 0;
    const monthlyGrowth = previousMonthNet !== 0 ? 
      ((currentMonthNet - previousMonthNet) / Math.abs(previousMonthNet)) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin: totalRevenue !== 0 ? (netIncome / totalRevenue) * 100 : 0,
      monthlyGrowth,
      averageTransaction: postedTransactions.length > 0 ? 
        postedTransactions.reduce((sum, t) => sum + t.finalAmount, 0) / postedTransactions.length : 0,
      transactionCount: postedTransactions.length,
      topExpenseCategories: this.getTopCategories(expenseTransactions, 5),
      topIncomeCategories: this.getTopCategories(incomeTransactions, 5),
      monthlyTrends,
      unitOccupancyRate: 95.8, // TODO: Calculate from actual unit data
      averageMonthlyCharge: this.calculateAverageMonthlyCharge(incomeTransactions),
      collectionRate: 87.2 // TODO: Calculate from actual collection data
    };
  }

  private static filterTransactions(
    transactions: EnhancedTransaction[], 
    config: ReportConfig
  ): EnhancedTransaction[] {
    return transactions.filter(transaction => {
      // Date range filter
      if (!this.isInDateRange(transaction.date, config.dateRange)) {
        return false;
      }

      // Status filter
      if (config.filters.status?.length && 
          !config.filters.status.includes(transaction.status)) {
        return false;
      }

      // Category filter
      if (config.filters.categories?.length && 
          !config.filters.categories.includes(transaction.category)) {
        return false;
      }

      // Unit filter
      if (config.filters.units?.length && transaction.relatedUnitId &&
          !config.filters.units.includes(transaction.relatedUnitId)) {
        return false;
      }

      // Amount range filter
      if (config.filters.amountRange) {
        const { min, max } = config.filters.amountRange;
        if (transaction.finalAmount < min || transaction.finalAmount > max) {
          return false;
        }
      }

      // Account filter
      if (config.filters.accounts?.length &&
          !config.filters.accounts.includes(transaction.accountCode)) {
        return false;
      }

      // Vendor filter
      if (config.filters.vendors?.length && transaction.vendorId &&
          !config.filters.vendors.includes(transaction.vendorId)) {
        return false;
      }

      // Tags filter
      if (config.filters.tags?.length) {
        const transactionTags = transaction.tags || [];
        const hasRequiredTag = config.filters.tags.some(tag => 
          transactionTags.includes(tag)
        );
        if (!hasRequiredTag) {
          return false;
        }
      }

      return true;
    });
  }

  private static processData(
    transactions: EnhancedTransaction[],
    config: ReportConfig
  ): ReportData[] {
    let processedData: ReportData[] = transactions.map(transaction => {
      const account = getAccountByCode(transaction.accountCode);
      
      return {
        id: transaction.id,
        date: transaction.date,
        transactionNumber: transaction.transactionNumber,
        title: transaction.title,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        subCategory: transaction.subCategory,
        baseAmount: transaction.baseAmount,
        taxAmount: transaction.taxAmount,
        discountAmount: transaction.discountAmount,
        finalAmount: transaction.finalAmount,
        accountCode: transaction.accountCode,
        accountTitle: account?.title || 'نامشخص',
        relatedUnitId: transaction.relatedUnitId,
        vendorId: transaction.vendorId,
        vendorName: '', // TODO: Get vendor name
        status: transaction.status,
        tags: transaction.tags,
        createdAt: transaction.createdAt,
        // Add derived fields
        month: this.getMonthFromDate(transaction.date),
        quarter: this.getQuarterFromDate(transaction.date),
        year: this.getYearFromDate(transaction.date),
        cashIn: transaction.type === 'Income' ? transaction.finalAmount : 0,
        cashOut: transaction.type === 'Expense' ? transaction.finalAmount : 0,
        netAmount: transaction.type === 'Income' ? transaction.finalAmount : -transaction.finalAmount
      };
    });

    // Apply grouping
    if (config.groupBy?.length) {
      processedData = this.groupData(processedData, config.groupBy);
    }

    // Apply sorting
    if (config.sortBy?.length) {
      processedData = this.sortData(processedData, config.sortBy);
    }

    return processedData;
  }

  private static generateSummary(data: ReportData[], config: ReportConfig) {
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, row) => sum + (row.cashIn || 0), 0);
    const totalExpenses = data.reduce((sum, row) => sum + (row.cashOut || 0), 0);
    const netAmount = totalIncome - totalExpenses;
    const averageTransaction = totalRecords > 0 ? 
      data.reduce((sum, row) => sum + Math.abs(row.finalAmount || 0), 0) / totalRecords : 0;

    // Top categories analysis
    const categoryMap = new Map<string, number>();
    data.forEach(row => {
      const category = row.category;
      const amount = Math.abs(row.finalAmount || 0);
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    });

    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome + totalExpenses > 0 ? 
          (amount / (totalIncome + totalExpenses)) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly trends (simplified)
    const monthlyMap = new Map<string, number>();
    data.forEach(row => {
      const month = row.month;
      const amount = row.netAmount || 0;
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + amount);
    });

    const trends = Array.from(monthlyMap.entries())
      .map(([period, amount], index, array) => ({
        period,
        amount,
        change: index > 0 ? amount - array[index - 1][1] : 0
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      totalRecords,
      totalIncome,
      totalExpenses,
      netAmount,
      averageTransaction,
      topCategories,
      trends
    };
  }

  private static generateChartData(data: ReportData[], config: ReportConfig) {
    return config.charts?.map(chartConfig => {
      const { type, title, xField, yField, groupBy } = chartConfig;
      
      let chartData: any = {
        labels: [],
        datasets: []
      };

      if (groupBy) {
        // Group data by specified field
        const groupedData = data.reduce((acc, row) => {
          const groupKey = row[groupBy] || 'نامشخص';
          if (!acc[groupKey]) {
            acc[groupKey] = [];
          }
          acc[groupKey].push(row);
          return acc;
        }, {} as Record<string, ReportData[]>);

        chartData.labels = Object.keys(groupedData);
        chartData.datasets = [{
          label: title,
          data: Object.values(groupedData).map(group => 
            group.reduce((sum, item) => sum + (item[yField] || 0), 0)
          ),
          backgroundColor: this.generateColors(chartData.labels.length),
          borderColor: this.generateColors(chartData.labels.length, 1),
        }];
      } else {
        // Simple aggregation
        chartData.labels = data.map(row => row[xField] || '');
        chartData.datasets = [{
          label: title,
          data: data.map(row => row[yField] || 0),
          backgroundColor: this.generateColors(data.length),
          borderColor: this.generateColors(data.length, 1),
        }];
      }

      return {
        id: chartConfig.id,
        type: chartConfig.type,
        title: chartConfig.title,
        data: chartData,
        options: this.getChartOptions(chartConfig.type)
      };
    }) || [];
  }

  private static calculateMonthlyTrends(
    transactions: EnhancedTransaction[],
    dateRange: { from: string; to: string }
  ) {
    const monthlyData = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(transaction => {
      const month = this.getMonthFromDate(transaction.date);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { income: 0, expense: 0 });
      }
      
      const data = monthlyData.get(month)!;
      if (transaction.type === 'Income') {
        data.income += transaction.finalAmount;
      } else {
        data.expense += transaction.finalAmount;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private static getTopCategories(transactions: EnhancedTransaction[], limit: number) {
    const categoryMap = new Map<string, number>();
    const total = transactions.reduce((sum, t) => sum + t.finalAmount, 0);
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + transaction.finalAmount);
    });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  private static calculateAverageMonthlyCharge(incomeTransactions: EnhancedTransaction[]): number {
    const monthlyCharges = incomeTransactions.filter(t => t.category === 'MonthlyCharge');
    if (monthlyCharges.length === 0) return 0;
    
    return monthlyCharges.reduce((sum, t) => sum + t.finalAmount, 0) / monthlyCharges.length;
  }

  // Helper methods
  private static isInDateRange(dateStr: string, range: { from: string; to: string }): boolean {
    const date = parseJalaliDate(dateStr);
    const fromDate = new Date(range.from);
    const toDate = new Date(range.to);
    
    if (!date) return false;
    
    return date >= fromDate && date <= toDate;
  }

  private static getMonthFromDate(dateStr: string): string {
    const date = parseJalaliDate(dateStr);
    if (!date) return '';
    
    // Convert to Jalali month name
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    // This is a simplified version - in real implementation, 
    // you'd need proper Jalali calendar conversion
    return monthNames[date.getMonth()] || '';
  }

  private static getQuarterFromDate(dateStr: string): string {
    const date = parseJalaliDate(dateStr);
    if (!date) return '';
    
    const month = date.getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  }

  private static getYearFromDate(dateStr: string): string {
    const date = parseJalaliDate(dateStr);
    return date ? date.getFullYear().toString() : '';
  }

  private static groupData(data: ReportData[], groupBy: string[]): ReportData[] {
    // Simplified grouping implementation
    // In real implementation, you'd properly aggregate data based on groupBy fields
    return data;
  }

  private static sortData(data: ReportData[], sortBy: any[]): ReportData[] {
    return data.sort((a, b) => {
      for (const sort of sortBy) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        
        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private static generateColors(count: number, alpha: number = 0.8): string[] {
    const baseColors = [
      `rgba(239, 68, 68, ${alpha})`,   // red
      `rgba(245, 158, 11, ${alpha})`,  // amber
      `rgba(16, 185, 129, ${alpha})`,  // emerald
      `rgba(59, 130, 246, ${alpha})`,  // blue
      `rgba(139, 92, 246, ${alpha})`,  // violet
      `rgba(236, 72, 153, ${alpha})`,  // pink
      `rgba(20, 184, 166, ${alpha})`,  // teal
      `rgba(251, 146, 60, ${alpha})`,  // orange
    ];

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  }

  private static getChartOptions(type: string): any {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
    };

    if (type === 'pie' || type === 'doughnut') {
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'bottom' as const,
          },
        },
      };
    }

    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }
}
