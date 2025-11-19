// src/app/api/buildings/[id]/units/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUnits, createUnit } from '@/lib/services/unitService';
import { validateCreateUnit } from '@/lib/validation/unitValidation';

// GET /api/buildings/:id/units
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params; // params باید await شود
    const buildingId = parseInt(id, 10);
    if (isNaN(buildingId)) {
      return NextResponse.json({ success: false, error: 'شناسه ساختمان معتبر نیست' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const blockId = searchParams.get('blockId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filters = {
      buildingId,
      blockId: blockId ? parseInt(blockId, 10) : undefined,
      search,
      status: status as 'occupied' | 'vacant' | 'maintenance' | '',
      page,
      limit,
      include: { block: true }
    };

    const result = await getUnits(filters);
    return NextResponse.json({
      success: true,
      data: result.units,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    console.error(`GET /api/buildings/:id/units error:`, error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت لیست واحدها' }, { status: 500 });
  }
}

// POST /api/buildings/:id/units
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const buildingId = parseInt(id, 10);
    if (isNaN(buildingId)) {
      return NextResponse.json({ success: false, error: 'شناسه ساختمان معتبر نیست' }, { status: 400 });
    }

    let body = await req.json();
    let blockId = body.block_id ?? body.blockId;
    body = { ...body, building_id: buildingId, block_id: blockId ?? null };

    const validationResult = await validateCreateUnit(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'داده‌های ورودی نامعتبر', details: validationResult.errors },
        { status: 400 }
      );
    }

    const newUnit = await createUnit(validationResult.data);
    return NextResponse.json(
      { success: true, data: newUnit, message: 'واحد جدید ایجاد شد' },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/buildings/:id/units error:`, error);
    return NextResponse.json({ success: false, error: 'خطا در ایجاد واحد جدید' }, { status: 500 });
  }
}
