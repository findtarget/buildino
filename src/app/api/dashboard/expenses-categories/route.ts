// src/app/api/dashboard/expenses-categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    // گروه‌بندی بر اساس category (رشته‌ای است نه ID)
    const categories = await prisma.transaction.groupBy({
      by: ['category'],
      _sum: {
        amount: true
      },
      where: {
        type: 'Expense'  // از enum schema
      }
    });

    const categoryData = categories.map((cat, index) => {
      // رنگ‌های مختلف برای هر دسته
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];
      const color = colors[index % colors.length];

      return {
        name: cat.category || 'نامشخص',
        value: Number(cat._sum.amount || 0),
        color: color
      };
    });

    return NextResponse.json({
      success: true,
      data: categoryData
    });

  } catch (error) {
    console.error('Expenses categories API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت دسته‌بندی هزینه‌ها'
    }, { status: 500 });
  }
}
