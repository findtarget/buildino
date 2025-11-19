// src/app/api/accounting/journal-entries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { JournalEntryStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = parseInt(searchParams.get('buildingId') || '1');
    const status = searchParams.get('status') as JournalEntryStatus | null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const whereClause: any = {
      buildingId
    };

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

    if (search) {
      whereClause.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          lines: {
            some: {
              account: {
                OR: [
                  { code: { contains: search, mode: 'insensitive' } },
                  { title: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          }
        }
      ];
    }

    const skip = (page - 1) * limit;

    const [entries, totalCount] = await Promise.all([
      prisma.journalEntry.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { date: 'desc' },
          { reference: 'desc' }
        ],
        include: {
          lines: {
            include: {
              account: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  type: true
                }
              }
            },
            orderBy: [
              { debit: 'desc' },
              { credit: 'desc' }
            ]
          }
        }
      }),
      prisma.journalEntry.count({ where: whereClause })
    ]);

    // محاسبه آمار
    const stats = await prisma.journalEntry.aggregate({
      where: { buildingId },
      _sum: {
        totalDebit: true,
        totalCredit: true
      },
      _count: {
        _all: true
      }
    });

    const statusCounts = await prisma.journalEntry.groupBy({
      by: ['status'],
      where: { buildingId },
      _count: {
        _all: true
      }
    });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      success: true,
      data: {
        entries,
        pagination,
        stats: {
          total: stats._count._all,
          totalDebit: stats._sum.totalDebit || 0,
          totalCredit: stats._sum.totalCredit || 0,
          byStatus: statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count._all;
            return acc;
          }, {} as Record<string, number>)
        }
      }
    });
  } catch (error) {
    console.error('Journal entries API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت اسناد حسابداری'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, reference, description, lines, buildingId = 1 } = body;

    // اعتبارسنجی ورودی‌ها
    if (!date || !reference || !description || !lines || !Array.isArray(lines)) {
      return NextResponse.json({
        success: false,
        error: 'تاریخ، شماره سند، شرح و ردیف‌ها الزامی هستند'
      }, { status: 400 });
    }

    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'حداقل دو ردیف برای سند حسابداری لازم است'
      }, { status: 400 });
    }

    // بررسی تراز بودن بدهکار و بستانکار
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json({
        success: false,
        error: `مجموع بدهکار (${totalDebit}) و بستانکار (${totalCredit}) برابر نیستند`
      }, { status: 400 });
    }

    // بررسی یکتا بودن شماره سند
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        reference,
        buildingId: parseInt(buildingId.toString())
      }
    });

    if (existingEntry) {
      return NextResponse.json({
        success: false,
        error: 'این شماره سند قبلاً استفاده شده است'
      }, { status: 400 });
    }

    // بررسی وجود حساب‌ها
    const accountIds = lines.map((line: any) => line.accountId);
    const accounts = await prisma.account.findMany({
      where: {
        id: { in: accountIds },
        isActive: true
      }
    });

    if (accounts.length !== accountIds.length) {
      return NextResponse.json({
        success: false,
        error: 'برخی از حسابهای انتخاب شده معتبر نیستند'
      }, { status: 400 });
    }

    // ایجاد سند حسابداری
    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        reference,
        description,
        totalDebit,
        totalCredit,
        status: JournalEntryStatus.Draft,
        buildingId: parseInt(buildingId.toString()),
        createdBy: 'system', // TODO: Replace with actual user ID
        lines: {
          create: lines.map((line: any) => ({
            accountId: line.accountId,
            description: line.description || description,
            debit: line.debit || 0,
            credit: line.credit || 0
          }))
        }
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                title: true,
                type: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: journalEntry,
      message: 'سند حسابداری با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در ایجاد سند حسابداری'
    }, { status: 500 });
  }
}
