// src/app/api/units/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  getUnitById,
  updateUnit,
  deleteUnit
} from '@/lib/services/unitService';
import { validateUpdateUnit } from '@/lib/validation/unitValidation';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه واحد معتبر نیست' },
        { status: 400 }
      );
    }

    const unit = await getUnitById(unitId, { include: { block: true } }); // include block
    if (!unit) {
      return NextResponse.json(
        { success: false, error: 'واحد یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: unit });
  } catch (error) {
    console.error(`GET /api/units/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت اطلاعات واحد' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه واحد معتبر نیست' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const normalizedData = {
      buildingId: body.buildingId ?? body.building_id,
      blockId: body.blockId ?? body.block_id ?? null, // اضافه شد
      unitNumber: body.unitNumber ?? body.unit_number,
      area: body.area ?? null,
      balconyArea: body.balconyArea ?? body.balcony_area ?? null,
      floorNumber: body.floorNumber ?? body.floor_number ?? null,
      residentName: body.residentName ?? body.resident_name ?? null,
      residentPhone: body.residentPhone ?? body.resident_phone ?? null,
      rentAmount: body.rentAmount ?? body.rent_amount ?? 0,
      isOccupied: body.isOccupied ?? body.is_occupied ?? false,
      hasParking: body.hasParking ?? body.has_parking ?? false,
      parkingCount: body.parkingCount ?? body.parking_count ?? 0,
      description: body.description ?? null
    };

    const validationResult = await validateUpdateUnit(normalizedData);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { success: false, error: 'داده‌های ورودی نامعتبر', details: validationResult.errors },
        { status: 400 }
      );
    }

    const updated = await updateUnit(unitId, validationResult.data!);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'واحد یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'واحد با موفقیت بروزرسانی شد'
    });
  } catch (error: any) {
    console.error(`PUT /api/units/${params.id} error:`, error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'شماره واحد تکراری است' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'خطا در بروزرسانی واحد' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitId = parseInt(params.id, 10);
    if (isNaN(unitId)) {
      return NextResponse.json(
        { success: false, error: 'شناسه واحد معتبر نیست' },
        { status: 400 }
      );
    }

    const deleted = await deleteUnit(unitId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'واحد یافت نشد یا قبلاً حذف شده' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'واحد با موفقیت حذف شد'
    });
  } catch (error) {
    console.error(`DELETE /api/units/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'خطا در حذف واحد' },
      { status: 500 }
    );
  }
}
