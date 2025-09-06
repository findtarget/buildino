// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // آمار کلی واحدها
    const totalUnits = await prisma.unit.count();
    
    // واحدهای اشغالی (بر اساس isOccupied)
    const occupiedUnits = await prisma.unit.count({
      where: { isOccupied: true }
    });
    
    const vacantUnits = await prisma.unit.count({
      where: { isOccupied: false }
    });

    // آمار مالی
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    // درآمدها این ماه (TransactionType.Income)
    const monthlyIncome = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'Income',
        transactionDate: {
          gte: firstDayOfMonth
        }
      }
    });

    // هزینه‌ها این ماه (TransactionType.Expense)
    const monthlyExpenses = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'Expense',
        transactionDate: {
          gte: firstDayOfMonth
        }
      }
    });

    // موجودی کل
    const totalIncome = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'Income'
      }
    });

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        type: 'Expense'
      }
    });

    const balance = Number(totalIncome._sum.amount || 0) - Number(totalExpenses._sum.amount || 0);

    // پرداخت‌های معوقه (شارژهای پرداخت نشده)
    // فعلاً یه عدد تست میذاریم چون ChargeSettings وجود داره ولی جدول Charge نداریم
    const overduePayments = 0;

    // میانگین پرداخت
    const avgPayment = await prisma.transaction.aggregate({
      _avg: {
        amount: true
      },
      where: {
        type: 'Income'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        units: {
          total: totalUnits,
          occupied: occupiedUnits,
          vacant: vacantUnits
        },
        financial: {
          monthlyIncome: Number(monthlyIncome._sum.amount || 0),
          monthlyExpenses: Number(monthlyExpenses._sum.amount || 0),
          balance: balance,
          overduePayments: overduePayments,
          averagePayment: Number(avgPayment._avg.amount || 0)
        }
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت اطلاعات داشبورد'
    }, { status: 500 });
  }
}
