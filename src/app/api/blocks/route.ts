// src/app/api/blocks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get('buildingId');

    if (!buildingId) {
      return NextResponse.json(
        { success: false, error: 'شناسه ساختمان الزامی است' },
        { status: 400 }
      );
    }

    const blocks = await prisma.buildingBlock.findMany({
      where: { buildingId: Number(buildingId) },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({ success: true, data: blocks });
  } catch (err) {
    console.error('خطا در دریافت بلوک‌ها:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت بلوک‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, floorsCount, unitsCount, description, buildingId } = body;

    if (!name?.trim() || !buildingId) {
      return NextResponse.json(
        { success: false, error: 'نام و شناسه ساختمان الزامی است' },
        { status: 400 }
      );
    }

    const block = await prisma.buildingBlock.create({
      data: {
        name: name.trim(),
        floorsCount: floorsCount ?? null,
        unitsCount: unitsCount ?? null,
        description: description || null,
        buildingId: Number(buildingId)
      }
    });

    return NextResponse.json({ success: true, data: block });
  } catch (err) {
    console.error('خطا در ایجاد بلوک:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد بلوک' },
      { status: 500 }
    );
  }
}
