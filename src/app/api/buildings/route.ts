// src/app/api/buildings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const buildings = await prisma.building.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        usage: true,
        hasBlocks: true,
        blocksCount: true,
        address: true,
        description: true,
        blocks: {
          select: {
            id: true,
            name: true,
            floorsCount: true,
            unitsCount: true,
            description: true
          },
          orderBy: { id: 'asc' }
        },
        units: {
          select: {
            id: true,
            unitNumber: true,
            floorNumber: true,
            residentName: true,
            isOccupied: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ success: true, data: buildings });
  } catch (err) {
    console.error('Error fetching buildings:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت ساختمان‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const building = await prisma.building.create({
      data: {
        name,
        type,
        usage,
        hasBlocks: !!hasBlocks,
        blocksCount: hasBlocks ? blocksCount ?? 0 : 0,
        address,
        description,
        blocks: hasBlocks && Array.isArray(blocks)
          ? { create: blocks.map((b: any) => ({
              name: b.name?.trim(),
              floorsCount: b.floorsCount ?? null,
              unitsCount: b.unitsCount ?? null,
              description: b.description || null
            })) }
          : undefined
      },
      select: {
        id: true,
        name: true,
        type: true,
        usage: true,
        hasBlocks: true,
        blocksCount: true,
        address: true,
        description: true,
        blocks: true
      }
    });

    return NextResponse.json({ success: true, data: building });
  } catch (err) {
    console.error('Error creating building:', err);
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد ساختمان' },
      { status: 500 }
    );
  }
}
