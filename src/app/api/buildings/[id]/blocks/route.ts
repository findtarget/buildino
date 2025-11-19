// src/app/api/buildings/[id]/blocks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// F: استفاده از امضای استاندارد و صریح برای کنترلر مسیر
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const buildingId = parseInt(params.id, 10);

    // F: بررسی دقیق برای اطمینان از معتبر بودن شناسه
    if (isNaN(buildingId)) {
      return NextResponse.json({ success: false, error: 'شناسه ساختمان نامعتبر است' }, { status: 400 });
    }

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
    console.error('API Error in /api/buildings/[id]/blocks:', error);
    return NextResponse.json({ success: false, error: 'خطا در پردازش درخواست' }, { status: 500 });
  }
}
