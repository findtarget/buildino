// src/app/api/accounting/journal-entries/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.id },
      include: {
        lines: {
          include: {
            account: true
          },
          orderBy: [
            { debit: 'desc' },
            { credit: 'desc' }
          ]
        }
      }
    });

    if (!entry) {
      return NextResponse.json({
        success: false,
        error: 'سند مورد نظر یافت نشد'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get journal entry error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت سند'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, reference, description, lines, status } = body;

    // بررسی وجود سند
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    });

    if (!existingEntry) {
      return NextResponse.json({
        success: false,
        error: 'سند مورد نظر یافت نشد'
      }, { status: 404 });
    }

    // اگر سند ثبت شده است نمی‌توان ویرایش کرد
    if (existingEntry.status === 'Posted') {
      return NextResponse.json({
        success: false,
        error: 'سندهای ثبت شده قابل ویرایش نیستند'
      }, { status: 400 });
    }

    let updateData: any = {
      updatedAt: new Date()
    };

    // اگر فقط وضعیت تغییر می‌کند
    if (status && !lines) {
      updateData.status = status;
      
      if (status === 'Posted') {
        updateData.approvedBy = 'system'; // در آینده از JWT token گرفته شود
      }
    } else {
      // ویرایش کامل سند
      if (lines) {
        const totalDebit = lines.reduce((sum: number, line: any) => 
          sum + (parseFloat(line.debit) || 0), 0);
        const totalCredit = lines.reduce((sum: number, line: any) => 
          sum + (parseFloat(line.credit) || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
          return NextResponse.json({
            success: false,
            error: 'مجموع بدهکار و بستانکار باید برابر باشد'
          }, { status: 400 });
        }

        updateData = {
          ...updateData,
          date: new Date(date),
          reference,
          description,
          totalDebit,
          totalCredit,
          status: status || existingEntry.status
        };
      }
    }

    const updatedEntry = await prisma.$transaction(async (tx) => {
      // حذف آیتم‌های قبلی در صورت ویرایش کامل
      if (lines) {
        await tx.journalEntryLine.deleteMany({
          where: { journalId: params.id }
        });
      }

      // بروزرسانی سند
      const updated = await tx.journalEntry.update({
        where: { id: params.id },
        data: updateData,
        include: {
          lines: {
            include: {
              account: true
            }
          }
        }
      });

      // ایجاد آیتم‌های جدید
      if (lines) {
        await tx.journalEntryLine.createMany({
          data: lines.map((line: any) => ({
            journalId: params.id,
            accountId: line.accountId,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0,
            description: line.description
          }))
        });

        // دریافت سند با آیتم‌های جدید
        return await tx.journalEntry.findUnique({
          where: { id: params.id },
          include: {
            lines: {
              include: {
                account: true
              }
            }
          }
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: 'سند با موفقیت بروزرسانی شد'
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در بروزرسانی سند'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.journalEntry.findUnique({
      where: { id: params.id }
    });

    if (!entry) {
      return NextResponse.json({
        success: false,
        error: 'سند مورد نظر یافت نشد'
      }, { status: 404 });
    }

    if (entry.status === 'Posted') {
      return NextResponse.json({
        success: false,
        error: 'سندهای ثبت شده قابل حذف نیستند'
      }, { status: 400 });
    }

    await prisma.journalEntry.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'سند با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در حذف سند'
    }, { status: 500 });
  }
}
