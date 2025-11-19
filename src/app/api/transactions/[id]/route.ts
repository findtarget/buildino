// src/app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        unit: true,
        category: true
      }
    });

    return NextResponse.json(transaction);
    
  } catch (error) {
    console.error('Transaction update error:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی تراکنش' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'تراکنش حذف شد' });
    
  } catch (error) {
    console.error('Transaction deletion error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف تراکنش' },
      { status: 500 }
    );
  }
}
