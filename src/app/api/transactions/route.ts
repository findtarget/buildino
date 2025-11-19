// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { TransactionType, TransactionStatus } from '@/types/accounting';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') as TransactionType;
    const status = searchParams.get('status') as TransactionStatus;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where = {
      ...(type && { type }),
      ...(status && { status }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          unit: true,
          building: true
          // categoryModel: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت تراکنش‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        transactionNumber: `TXN-${Date.now()}`,
        status: TransactionStatus.Pending
      },
      include: {
        unit: true,
        building: true
        //categoryModel: true
      }
    });

    return NextResponse.json(transaction, { status: 201 });
    
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد تراکنش' },
      { status: 500 }
    );
  }
}
