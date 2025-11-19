// src/app/api/accounting/chart-of-accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AccountType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = parseInt(searchParams.get('buildingId') || '1');
    const accountType = searchParams.get('accountType') as AccountType | null;
    const parentOnly = searchParams.get('parentOnly') === 'true';
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {
      buildingId,
      ...(accountType && { type: accountType }),
      ...(parentOnly && { parentId: null }),
      ...(!includeInactive && { isActive: true })
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { titleEn: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [accounts, totalCount] = await Promise.all([
      prisma.account.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: [
          { code: 'asc' }
        ],
        include: {
          parent: {
            select: {
              id: true,
              code: true,
              title: true,
              type: true
            }
          },
          _count: {
            select: {
              children: true,
              journalLines: true,
              transactions: true
            }
          }
        }
      }),
      prisma.account.count({ where: whereClause })
    ]);

    // محاسبه آمار کلی
    const stats = await prisma.account.groupBy({
      by: ['type'],
      where: { buildingId, isActive: true },
      _count: {
        _all: true
      }
    });

    const accountsByType = stats.reduce((acc, item) => {
      acc[item.type] = item._count._all;
      return acc;
    }, {} as Record<AccountType, number>);

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
        accounts,
        pagination,
        stats: {
          total: totalCount,
          byType: accountsByType,
          activeCount: accounts.filter(acc => acc.isActive).length
        }
      }
    });
  } catch (error) {
    console.error('Chart of accounts API error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت دسته‌حساب‌ها'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code, 
      title, 
      titleEn, 
      type, 
      parentId, 
      description, 
      isActive = true,
      buildingId = 1 
    } = body;

    // اعتبارسنجی ورودی‌ها
    if (!code || !title || !type) {
      return NextResponse.json({
        success: false,
        error: 'کد، نام و نوع حساب الزامی هستند'
      }, { status: 400 });
    }

    // بررسی قالب کد حساب
    if (!/^\d{4,10}$/.test(code)) {
      return NextResponse.json({
        success: false,
        error: 'کد حساب باید عددی و بین ۴ تا ۱۰ رقم باشد'
      }, { status: 400 });
    }

    // بررسی یکتایی کد حساب
    const existingAccount = await prisma.account.findFirst({
      where: {
        code,
        buildingId: parseInt(buildingId.toString())
      }
    });

    if (existingAccount) {
      return NextResponse.json({
        success: false,
        error: 'این کد حساب قبلاً استفاده شده است'
      }, { status: 400 });
    }

    // بررسی حساب والد
    let level = 1;
    let parentAccount = null;

    if (parentId) {
      parentAccount = await prisma.account.findFirst({
        where: {
          id: parentId,
          buildingId: parseInt(buildingId.toString()),
          isActive: true
        }
      });

      if (!parentAccount) {
        return NextResponse.json({
          success: false,
          error: 'حساب والد یافت نشد'
        }, { status: 400 });
      }

      if (parentAccount.type !== type) {
        return NextResponse.json({
          success: false,
          error: 'نوع حساب باید با نوع حساب والد مطابقت داشته باشد'
        }, { status: 400 });
      }

      level = parentAccount.level + 1;
    }

    // ایجاد حساب جدید
    const newAccount = await prisma.account.create({
      data: {
        code,
        title,
        titleEn: titleEn || null,
        type,
        parentId: parentId || null,
        level,
        description: description || null,
        isActive,
        buildingId: parseInt(buildingId.toString())
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true
          }
        },
        _count: {
          select: {
            children: true,
            journalLines: true,
            transactions: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newAccount,
      message: 'حساب جدید با موفقیت ایجاد شد'
    });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در ایجاد حساب جدید'
    }, { status: 500 });
  }
}
