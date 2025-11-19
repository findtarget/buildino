import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { JournalStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const journal = await prisma.journalEntry.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });

    if (!journal) {
      return NextResponse.json(
        { success: false, error: 'سند یافت نشد' },
        { status: 404 }
      );
    }

    if (journal.status !== JournalStatus.Draft) {
      return NextResponse.json(
        { success: false, error: 'فقط اسناد پیش‌نویس قابل ثبت هستند' },
        { status: 400 }
      );
    }

    // بررسی متعادل بودن سند
    if (Math.abs(journal.totalDebit - journal.totalCredit) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'سند حسابداری متعادل نیست' },
        { status: 400 }
      );
    }

    const updatedJournal = await prisma.journalEntry.update({
      where: { id: params.id },
      data: {
        status: JournalStatus.Posted,
        updatedAt: new Date()
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
      data: updatedJournal,
      message: 'سند با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('Error posting journal:', error);
    return NextResponse.json(
      { success: false, error: 'خطا در ثبت سند' },
      { status: 500 }
    );
  }
}
