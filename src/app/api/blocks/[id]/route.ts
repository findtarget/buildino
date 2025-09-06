//src/app/blocks/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const block = await prisma.buildingBlock.findUnique({
      where: { id: Number(params.id) }
    });

    if (!block) {
      return NextResponse.json({ success: false, error: 'بلوک پیدا نشد' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: block });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطا در دریافت بلوک' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, floorsCount, description, buildingId } = body;

    if (!name?.trim() || !buildingId) {
      return NextResponse.json({ success: false, error: 'نام و شناسه ساختمان الزامی است' }, { status: 400 });
    }

    const block = await prisma.buildingBlock.update({
      where: { id: Number(params.id) },
      data: {
        name: name.trim(),
        floorsCount: floorsCount ?? null,
        description: description || null,
        buildingId: Number(buildingId)
      }
    });

    return NextResponse.json({ success: true, data: block });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطا در ویرایش بلوک' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.buildingBlock.delete({
      where: { id: Number(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'خطا در حذف بلوک' }, { status: 500 });
  }
}
