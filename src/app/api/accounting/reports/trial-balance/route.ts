// src/app/api/accounting/reports/trial-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const accountType = searchParams.get('accountType');
    const includeZeroBalance = searchParams.get('includeZeroBalance') === 'true';
    const buildingId = searchParams.get('buildingId') || '1';

    // تاریخ پیش‌فرض (ابتدای سال مالی تا امروز)
    const currentYear = new Date().getFullYear();
    const defaultFromDate = fromDate || `${currentYear}-01-01`;
    const defaultToDate = toDate || new Date().toISOString().split('T')[0];

    // دریافت تمام سندهای ثبت شده در بازه زمانی
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        status: 'Posted',
        buildingId: parseInt(buildingId.toString()),
        date: {
          gte: new Date(defaultFromDate),
          lte: new Date(defaultToDate)
        }
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });

    // محاسبه مانده حسابها
    const accountBalances = new Map();

    journalEntries.forEach(entry => {
      entry.lines.forEach(line => {
        const account = line.account;
        const accountCode = account.code;

        if (accountType && account.type !== accountType) {
          return; // فیلتر بر اساس نوع حساب
        }

        const current = accountBalances.get(accountCode) || {
          id: account.id,
          code: accountCode,
          title: account.title,
          type: account.type,
          level: account.level,
          parentId: account.parentId,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
          transactionCount: 0
        };

        current.totalDebit += Number(line.debit);
        current.totalCredit += Number(line.credit);
        current.transactionCount += 1;

        // محاسبه مانده بر اساس نوع حساب
        switch (account.type) {
          case 'Asset':
          case 'Expense':
            current.balance = current.totalDebit - current.totalCredit;
            break;
          case 'Liability':
          case 'Equity':
          case 'Revenue':
            current.balance = current.totalCredit - current.totalDebit;
            break;
        }

        accountBalances.set(accountCode, current);
      });
    });

    // تبدیل به آرایه و فیلتر
    let trialBalance = Array.from(accountBalances.values())
      .sort((a, b) => a.code.localeCompare(b.code));

    // حذف حسابهای با مانده صفر در صورت نیاز
    if (!includeZeroBalance) {
      trialBalance = trialBalance.filter(account => Math.abs(account.balance) > 0.01);
    }

    // محاسبه مجاميع
    const totals = trialBalance.reduce((acc, account) => ({
      totalDebit: acc.totalDebit + account.totalDebit,
      totalCredit: acc.totalCredit + account.totalCredit,
      totalAssets: acc.totalAssets + (account.type === 'Asset' && account.balance > 0 ? account.balance : 0),
      totalLiabilities: acc.totalLiabilities + (account.type === 'Liability' && account.balance > 0 ? account.balance : 0),
      totalEquity: acc.totalEquity + (account.type === 'Equity' && account.balance > 0 ? account.balance : 0),
      totalRevenue: acc.totalRevenue + (account.type === 'Revenue' && account.balance > 0 ? account.balance : 0),
      totalExpenses: acc.totalExpenses + (account.type === 'Expense' && account.balance > 0 ? account.balance : 0)
    }), {
      totalDebit: 0,
      totalCredit: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0,
      totalRevenue: 0,
      totalExpenses: 0
    });

    // گروه‌بندی بر اساس نوع حساب
    const groupedByType = trialBalance.reduce((groups: any, account) => {
      const type = account.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(account);
      return groups;
    }, {});

    // آمار اضافی
    const stats = {
      totalAccounts: trialBalance.length,
      totalTransactions: journalEntries.reduce((sum, entry) => sum + entry.lines.length, 0),
      balanceCheck: Math.abs(totals.totalDebit - totals.totalCredit) < 0.01,
      period: {
        from: defaultFromDate,
        to: defaultToDate
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        accounts: trialBalance,
        groupedByType,
        totals,
        stats,
        period: {
          from: defaultFromDate,
          to: defaultToDate
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Trial balance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در تولید میزان‌نامه'
    }, { status: 500 });
  }
}
