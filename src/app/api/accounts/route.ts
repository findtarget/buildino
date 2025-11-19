import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { AccountType } from '@/types/accounting';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as AccountType;
    const parentId = searchParams.get('parentId');
    const level = searchParams.get('level');

    let whereClause: any = {
      isActive: true
    };

    if (type) {
      whereClause.type = type;
    }

    if (parentId) {
      whereClause.parentId = parentId;
    } else if (parentId === null) {
      whereClause.parentId = null;
    }

    if (level) {
      whereClause.level = parseInt(level);
    }

    const accounts = await prisma.account.findMany({
      where: whereClause,
      include: {
        parent: true,
        children: {
          where: { isActive: true }
        },
        _count: {
          select: {
            children: true,
            journalLines: true,
            transactions: true
          }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: accounts
    });

  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت حساب‌ها' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, title, titleEn, type, parentId, description } = body;

    // بررسی تکراری بودن کد
    const existingAccount = await prisma.account.findUnique({
      where: { code }
    });

    if (existingAccount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'کد حساب تکراری است' 
        },
        { status: 400 }
      );
    }

    // محاسبه سطح
    let level = 1;
    if (parentId) {
      const parent = await prisma.account.findUnique({
        where: { id: parentId }
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const account = await prisma.account.create({
      data: {
        code,
        title,
        titleEn,
        type,
        parentId,
        level,
        description,
        isActive: true
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد حساب' 
      },
      { status: 500 }
    );
  }
}
