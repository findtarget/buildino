// src/app/api/units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUnits, createUnit } from '@/lib/services/unitService';
import { validateCreateUnit } from '@/lib/validation/unitValidation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filters = {
      buildingId: buildingId ? parseInt(buildingId) : undefined,
      search,
      status: status as 'occupied' | 'vacant' | 'maintenance' | '',
      page,
      limit
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
    console.error('Get units error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت لیست واحدها',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // اعتبارسنجی داده‌ها
    const validationResult = await validateCreateUnit(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'داده‌های ورودی نامعتبر',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    const newUnit = await createUnit(validationResult.data);

    return NextResponse.json(
      {
        success: true,
        data: newUnit,
        message: 'واحد جدید با موفقیت اضافه شد'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create unit error:', error);
    
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'شماره واحد تکراری است' 
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ایجاد واحد جدید',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
