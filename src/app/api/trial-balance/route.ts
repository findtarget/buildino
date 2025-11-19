// src/app/api/trial-balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AccountType } from '@/types/accounting';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = parseInt(searchParams.get('buildingId') || '1');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const accountType = searchParams.get('type') as AccountType;

    let dateFilter: any = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
    }

    // دریافت تمام حساب‌های فعال
    let accountsWhere: any = { 
      buildingId,
      isActive: true 
    };
    if (accountType) {
      accountsWhere.accountType = accountType;
    }

    const accounts = await prisma.account.findMany({
      where: accountsWhere,
      include: {
        journalLines: {
          where: {
            journalEntry: {
              isPosted: true,
              buildingId,
              ...(Object.keys(dateFilter).length > 0 && { entryDate: dateFilter })
            }
          }
        }
      },
      orderBy: { accountCode: 'asc' }
    });

    // دریافت تراکنش‌های مرتبط با هر حساب (از طریق buildingId و type)
    const transactions = await prisma.transaction.findMany({
      where: {
        buildingId,
        ...(Object.keys(dateFilter).length > 0 && { transactionDate: dateFilter })
      }
    });

    const trialBalance = accounts.map(account => {
      // محاسبه بدهکار و بستانکار از اسناد حسابداری
      const journalDebit = account.journalLines.reduce((sum, line) => 
        sum + (line.debitAmount?.toNumber() || 0), 0);
      const journalCredit = account.journalLines.reduce((sum, line) => 
        sum + (line.creditAmount?.toNumber() || 0), 0);

      // محاسبه از تراکنش‌ها بر اساس نوع حساب و نوع تراکنش
      const relatedTransactions = transactions.filter(transaction => {
        // اینجا می‌توانید منطق مطابقت تراکنش با حساب را تعریف کنید
        // برای مثال بر اساس category یا سایر معیارها
        return transaction.category === account.accountName ||
               (transaction.type === 'Income' && account.accountType === 'INCOME') ||
               (transaction.type === 'Expense' && account.accountType === 'EXPENSE');
      });

      const transactionAmount = relatedTransactions.reduce((sum, transaction) => {
        const amount = transaction.amount.toNumber();
        if (transaction.type === 'Income') {
          // درآمد معمولاً بستانکار است
          return account.accountType === 'INCOME' ? sum + amount : sum - amount;
        } else {
          // هزینه معمولاً بدهکار است
          return account.accountType === 'EXPENSE' ? sum + amount : sum - amount;
        }
      }, 0);

      let totalDebit = journalDebit;
      let totalCredit = journalCredit;

      // تنظیم بدهکار/بستانکار بر اساس نوع حساب و تراکنش‌ها
      if (transactionAmount > 0) {
        if (['ASSET', 'EXPENSE'].includes(account.accountType)) {
          totalDebit += transactionAmount;
        } else {
          totalCredit += transactionAmount;
        }
      } else if (transactionAmount < 0) {
        if (['ASSET', 'EXPENSE'].includes(account.accountType)) {
          totalCredit += Math.abs(transactionAmount);
        } else {
          totalDebit += Math.abs(transactionAmount);
        }
      }

      const balance = totalDebit - totalCredit;

      return {
        accountId: account.id,
        accountCode: account.accountCode,
        accountTitle: account.accountName,
        accountType: account.accountType,
        debit: totalDebit,
        credit: totalCredit,
        balance: balance,
        balanceType: balance >= 0 ? 'debit' : 'credit',
        hasActivity: totalDebit > 0 || totalCredit > 0
      };
    }).filter(account => account.hasActivity); // فقط حساب‌های دارای تحرک

    // محاسبه مجاميع
    const totals = trialBalance.reduce((acc, account) => {
      acc.totalDebit += account.debit;
      acc.totalCredit += account.credit;
      return acc;
    }, { totalDebit: 0, totalCredit: 0 });

    return NextResponse.json({
      success: true,
      data: {
        accounts: trialBalance,
        totals: {
          ...totals,
          isBalanced: Math.abs(totals.totalDebit - totals.totalCredit) < 0.01
        },
        period: {
          from: dateFrom,
          to: dateTo
        }
      }
    });

  } catch (error) {
    console.error('Error generating trial balance:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در تولید تراز آزمایشی' },
      { status: 500 }
    );
  }
}
