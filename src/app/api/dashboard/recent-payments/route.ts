// src/app/api/dashboard/recent-payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        type: 'Income'  // از enum schema
      },
      include: {
        unit: true
      }
    });

    const paymentsData = recentTransactions.map(transaction => {
      // تعیین وضعیت بر اساس تاریخ
      let status = 'paid';
      const daysDiff = Math.floor((new Date().getTime() - transaction.transactionDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff > 30) status = 'overdue';
      else if (daysDiff > 0) status = 'pending';

      return {
        unit: transaction.unit?.unitNumber || 'نامشخص',
        amount: Number(transaction.amount),
        date: transaction.transactionDate.toLocaleDateString('fa-IR'),
        status: status
      };
    });

    return NextResponse.json({
      success: true,
      data: paymentsData
    });

  } catch (error) {
    console.error('Recent payments API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت پرداخت‌های اخیر'
    }, { status: 500 });
  }
}
