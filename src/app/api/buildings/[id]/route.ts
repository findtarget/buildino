// src/app/api/buildings/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

//export async function GET(_req: Request,  { params }: { params: { id: string } }) {
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const building = await prisma.building.findUnique({
      where: { id: Number((await ctx.params).id) },
      select: {
        id: true,
        name: true,
        type: true,
        usage: true,
        hasBlocks: true,
        blocksCount: true,
        floorsCount: true,
        address: true,
        description: true,
        blocks: true
      }
    });
    if (!building) {
      return NextResponse.json({ success: false, error: 'ساختمان پیدا نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: building });
  } catch (err) {
    console.error('Error fetching building:', err);
    return NextResponse.json({ success: false, error: 'خطا در دریافت ساختمان' }, { status: 500 });
  }
}

//export async function PUT(req: Request, { params }: { params: { id: string } }) {
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const {
      name,
      type,
      usage,
      hasBlocks,
      blocksCount,
      address,
      description,
      blocks
    } = body;

    const building = await prisma.building.update({
      where: { id: Number((await ctx.params).id) },
      data: {
        name,
        type,
        usage,
        hasBlocks: !!hasBlocks,
        blocksCount: blocksCount ?? null, // اضافه شد
        address,
        description,
        blocks: hasBlocks
          ? { deleteMany: {}, create: blocks || [] }
          : { deleteMany: {} }
      },
      select: {
        id: true,
        name: true,
        type: true,
        usage: true,
        hasBlocks: true,
        blocksCount: true,
        floorsCount: true,
        address: true,
        description: true,
        blocks: true
      }
    });

    return NextResponse.json({ success: true, data: building });
  } catch (err) {
    console.error('Error updating building:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش ساختمان' },
      { status: 500 }
    );
  }
}

//export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    await prisma.building.delete({ where: { id: Number((await ctx.params).id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting building:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف ساختمان' },
      { status: 500 }
    );
  }
}
