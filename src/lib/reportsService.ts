// src/lib/reportsService.ts
import { EnhancedTransaction, TransactionType, CategorySummary, MonthlyData } from '@/types/accounting';
import { AnalyticsMetrics, ReportConfig } from '@/types/reports';

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
    };
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
      const month = transaction.date.substring(0, 7); // Extract YYYY/MM
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
