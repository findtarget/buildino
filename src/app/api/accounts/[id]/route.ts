///src/app/api/accounts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await prisma.account.findUnique({
      where: { id: params.id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        },
        journalLines: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            journal: true
          }
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            unit: true,
            building: true
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'حساب یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: account
    });

  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت حساب' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, titleEn, description, isActive } = body;

    const account = await prisma.account.update({
      where: { id: params.id },
      data: {
        title,
        titleEn,
        description,
        isActive,
        updatedAt: new Date()
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
    console.error('Error updating account:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در به‌روزرسانی حساب' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // بررسی وجود تراکنش یا سند حسابداری
    const hasTransactions = await prisma.transaction.count({
      where: { accountId: params.id }
    });

    const hasJournalEntries = await prisma.journalEntryLine.count({
      where: { accountId: params.id }
    });

    if (hasTransactions > 0 || hasJournalEntries > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'امکان حذف حساب دارای تراکنش وجود ندارد' 
        },
        { status: 400 }
      );
    }

    // بررسی وجود زیرحساب
    const hasChildren = await prisma.account.count({
      where: { parentId: params.id, isActive: true }
    });

    if (hasChildren > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'امکان حذف حساب دارای زیرحساب وجود ندارد' 
        },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'حساب با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف حساب' },
      { status: 500 }
    );
  }
}
