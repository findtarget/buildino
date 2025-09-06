// src/app/api/dashboard/monthly-income/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    const monthlyData = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const monthStart = new Date(currentYear, i, 1);
        const monthEnd = new Date(currentYear, i + 1, 0);

        const income = await prisma.transaction.aggregate({
          _sum: {
            amount: true
          },
          where: {
            type: 'Income',  // از enum schema استفاده میکنیم
            transactionDate: {  // از transactionDate استفاده میکنیم نه date
              gte: monthStart,
              lte: monthEnd
            }
          }
        });

        return {
          name: persianMonths[i],
          value: Number(income._sum.amount || 0)
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Monthly income API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت درآمد ماهانه'
    }, { status: 500 });
  }
}
