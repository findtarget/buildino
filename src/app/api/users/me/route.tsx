// src/app/api/users/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    if (!JWT_SECRET) {
      console.error('❌ [Users/Me API] JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'پیکربندی سرور ناقص است' },
        { status: 500 }
      );
    }

    // دریافت توکن از کوکی یا هدر Authorization
    let token: string | undefined;
    
    // ابتدا از کوکی بخوانیم
    const cookieStore = await cookies();
    token = cookieStore.get('accessToken')?.value;
    
    // اگر در کوکی نبود، از هدر Authorization بخوانیم
    if (!token) {
      const authorization = request.headers.get('authorization');
      if (authorization && authorization.startsWith('Bearer ')) {
        token = authorization.substring(7);
      }
    }

    if (!token) {
      console.log('❌ [Users/Me API] No access token found');
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت یافت نشد' },
        { status: 401 }
      );
    }

    // تأیید صحت access token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // دریافت اطلاعات کاربر از دیتابیس
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
      },
      select: {
        id: true,
        buildingId: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        // ❌ حذف شد: updatedAt چون در schema موجود نیست
        building: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      },
    });

    if (!user) {
      console.log('❌ [Users/Me API] User not found with ID:', decoded.userId);
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      console.log('❌ [Users/Me API] User account is inactive:', user.email);
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      );
    }

    console.log('✅ [Users/Me API] User info retrieved successfully:', user.email);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        buildingId: user.buildingId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        // ❌ حذف شد: updatedAt
        building: user.building,
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [Users/Me API] Invalid access token:', error.message);
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت نامعتبر است' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ [Users/Me API] Access token expired');
      return NextResponse.json(
        { success: false, error: 'توکن احراز هویت منقضی شده است' },
        { status: 401 }
      );
    }

    console.error('❌ [Users/Me API] Server error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور داخلی' },
      { status: 500 }
    );
  }
}
