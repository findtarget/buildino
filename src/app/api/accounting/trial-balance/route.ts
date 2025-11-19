// src/app/api/accounting/trial-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AccountType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = parseInt(searchParams.get('buildingId') || '1');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // تنظیم بازه زمانی پیش‌فرض
    const fromDate = dateFrom ? new Date(dateFrom) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = dateTo ? new Date(dateTo) : new Date();

    // دریافت تمام حساب‌های موجود
    const accounts = await prisma.account.findMany({
      where: {
        buildingId,
        ...(includeInactive ? {} : { isActive: true })
      },
      select: {
        id: true,
        code: true,
        title: true,
        type: true,
        isActive: true
      },
      orderBy: { code: 'asc' }
    });

    // محاسبه مانده هر حساب
    const trialBalanceData = await Promise.all(
      accounts.map(async (account) => {
        // مجموع بدهکار و بستانکار از اسناد حسابداری
        const journalTotals = await prisma.journalEntryLine.aggregate({
          where: {
            accountId: account.id,
            journalEntry: {
              status: 'Posted',
              buildingId,
              date: {
                gte: fromDate,
                lte: toDate
              }
            }
          },
          _sum: {
            debit: true,
            credit: true
          }
        });

        // مجموع بدهکار و بستانکار از تراکنش‌ها
        const transactionTotals = await prisma.transaction.aggregate({
          where: {
            accountId: account.id,
            buildingId,
            date: {
              gte: fromDate,
              lte: toDate
            }
          },
          _sum: {
            amount: true
          }
        });

        const totalDebit = (journalTotals._sum.debit || 0);
        const totalCredit = (journalTotals._sum.credit || 0);
        
        // محاسبه مانده خالص بر اساس نوع حساب
        let debitBalance = 0;
        let creditBalance = 0;
        const netAmount = totalDebit - totalCredit + (transactionTotals._sum.amount || 0);

        // براساس نوع حساب، مانده در سمت مناسب نمایش داده می‌شود
        if ([AccountType.Asset, AccountType.Expense].includes(account.type)) {
          if (netAmount >= 0) {
            debitBalance = netAmount;
          } else {
            creditBalance = Math.abs(netAmount);
          }
        } else {
          if (netAmount <= 0) {
            creditBalance = Math.abs(netAmount);
          } else {
            debitBalance = netAmount;
          }
        }

        return {
          accountId: account.id,
          accountCode: account.code,
          accountTitle: account.title,
          accountType: account.type,
          isActive: account.isActive,
          debitBalance,
          creditBalance,
          netBalance: debitBalance - creditBalance,
          hasActivity: totalDebit > 0 || totalCredit > 0 || (transactionTotals._sum.amount || 0) > 0
        };
      })
    );

    // فیلتر کردن حساب‌های بدون فعالیت (اختیاری)
    const showZeroBalances = searchParams.get('showZeroBalances') === 'true';
    const filteredData = showZeroBalances 
      ? trialBalanceData 
      : trialBalanceData.filter(item => item.hasActivity);

    // محاسبه مجاميع
    const totals = filteredData.reduce(
      (acc, item) => ({
        totalDebit: acc.totalDebit + item.debitBalance,
        totalCredit: acc.totalCredit + item.creditBalance
      }),
      { totalDebit: 0, totalCredit: 0 }
    );

    // گروه‌بندی بر اساس نوع حساب
    const byAccountType = Object.values(AccountType).reduce((acc, type) => {
      const accountsOfType = filteredData.filter(item => item.accountType === type);
      const typeTotal = accountsOfType.reduce(
        (sum, item) => sum + Math.abs(item.netBalance),
        0
      );
      
      acc[type] = {
        accounts: accountsOfType,
        total: typeTotal,
        count: accountsOfType.length
      };
      return acc;
    }, {} as Record<AccountType, any>);

    return NextResponse.json({
      success: true,
      data: {
        entries: filteredData,
        totals,
        byAccountType,
        summary: {
          totalAccounts: filteredData.length,
          activeAccounts: filteredData.filter(item => item.isActive).length,
          accountsWithActivity: filteredData.filter(item => item.hasActivity).length,
          isBalanced: Math.abs(totals.totalDebit - totals.totalCredit) < 0.01,
          period: {
            from: fromDate.toISOString().split('T')[0],
            to: toDate.toISOString().split('T')[0]
          }
        }
      }
    });
  } catch (error) {
    console.error('Trial balance API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در تهیه میزان‌نامه'
    }, { status: 500 });
  }
}
