// src/app/api/accounting/chart-of-accounts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true
          }
        },
        children: {
          select: {
            id: true,
            code: true,
            title: true,
            type: true,
            level: true,
            isActive: true
          },
          orderBy: { code: 'asc' }
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

    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'حساب یافت نشد'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: account
    });
  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت اطلاعات حساب'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id;
    const body = await request.json();
    const { title, titleEn, description, isActive } = body;

    // بررسی وجود حساب
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    if (!existingAccount) {
      return NextResponse.json({
        success: false,
        error: 'حساب یافت نشد'
      }, { status: 404 });
    }

    // عدم امکان غیرفعال کردن حسابی که دارای زیرحساب فعال است
    if (!isActive && existingAccount._count.children > 0) {
      const activeChildren = await prisma.account.count({
        where: {
          parentId: accountId,
          isActive: true
        }
      });

      if (activeChildren > 0) {
        return NextResponse.json({
          success: false,
          error: 'نمی‌توان حسابی را که دارای زیرحساب فعال است غیرفعال کرد'
        }, { status: 400 });
      }
    }

    // به‌روزرسانی حساب
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        title,
        titleEn: titleEn || null,
        description: description || null,
        isActive
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
      data: updatedAccount,
      message: 'حساب با موفقیت به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در به‌روزرسانی حساب'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = params.id;

    // بررسی وجود حساب
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        _count: {
          select: {
            children: true,
            journalLines: true,
            transactions: true
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'حساب یافت نشد'
      }, { status: 404 });
    }

    // بررسی عدم وجود زیرحساب
    if (account._count.children > 0) {
      return NextResponse.json({
        success: false,
        error: 'نمی‌توان حسابی را که دارای زیرحساب است حذف کرد'
      }, { status: 400 });
    }

    // بررسی عدم وجود تراکنش یا سند حسابداری
    if (account._count.journalLines > 0 || account._count.transactions > 0) {
      return NextResponse.json({
        success: false,
        error: 'نمی‌توان حسابی را که دارای تراکنش یا سند حسابداری است حذف کرد'
      }, { status: 400 });
    }

    // حذف حساب
    await prisma.account.delete({
      where: { id: accountId }
    });

    return NextResponse.json({
      success: true,
      message: 'حساب با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در حذف حساب'
    }, { status: 500 });
  }
}
