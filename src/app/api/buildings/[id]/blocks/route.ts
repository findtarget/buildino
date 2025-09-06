// src/app/api/buildings/[id]/blocks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const buildingId = parseInt(params.id, 10);
  if (isNaN(buildingId)) {
    return NextResponse.json({ success: false, error: 'شناسه ساختمان نامعتبر است' }, { status: 400 });
  }

  try {
    const blocks = await prisma.buildingBlock.findMany({
      where: {
        buildingId: buildingId,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (error) {
    console.error('Failed to fetch blocks:', error);
    return NextResponse.json({ success: false, error: 'خطا در واکشی بلوک‌ها' }, { status: 500 });
  }
}
