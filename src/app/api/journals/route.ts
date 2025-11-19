///src/app/api/journals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { JournalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as JournalStatus;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const offset = (page - 1) * limit;

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.date.lte = new Date(dateTo);
      }
    }

    const [journals, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: whereClause,
        include: {
          lines: {
            include: {
              account: true
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.journalEntry.count({ where: whereClause })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        journals,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching journals:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اسناد حسابداری' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, reference, description, lines, attachments } = body;

    // بررسی متعادل بودن سند
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'سند حسابداری متعادل نیست' 
        },
        { status: 400 }
      );
    }

    // تولید شماره سند
    const lastJournal = await prisma.journalEntry.findFirst({
      orderBy: { journalNumber: 'desc' }
    });

    let journalNumber = 'JE-1404-0001';
    if (lastJournal?.journalNumber) {
      const lastNumber = parseInt(lastJournal.journalNumber.split('-').pop() || '0');
      journalNumber = `JE-1404-${(lastNumber + 1).toString().padStart(4, '0')}`;
    }

    const journal = await prisma.journalEntry.create({
      data: {
        journalNumber,
        date: new Date(date),
        reference,
        description,
        totalDebit,
        totalCredit,
        attachments: attachments?.join(',') || null,
        status: JournalStatus.Draft,
        lines: {
          create: lines.map((line: any) => ({
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description
          }))
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

    return NextResponse.json({
      success: true,
      data: journal
    });

  } catch (error) {
    console.error('Error creating journal:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد سند حسابداری' },
      { status: 500 }
    );
  }
}
