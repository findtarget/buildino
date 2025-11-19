// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db/prisma';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
      console.error('❌ [Refresh API] JWT secrets not configured');
      return NextResponse.json(
        { success: false, error: 'پیکربندی سرور ناقص است' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      console.log('❌ [Refresh API] No refresh token found');
      return NextResponse.json(
        { success: false, error: 'توکن تازه‌سازی یافت نشد' },
        { status: 401 }
      );
    }

    // تأیید صحت refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    
    // بررسی وجود کاربر و refresh token در دیتابیس
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        refreshToken: refreshToken, // اطمینان از اینکه refresh token در DB موجود است
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
      console.log('❌ [Refresh API] User not found or refresh token mismatch');
      return NextResponse.json(
        { success: false, error: 'کاربر یافت نشد یا توکن نامعتبر است' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log('❌ [Refresh API] User account is inactive');
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      );
    }

    // ایجاد access token جدید
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        buildingId: user.buildingId,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // تنظیم access token جدید در cookie
    cookieStore.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 ساعت
      path: '/',
    });

    console.log('✅ [Refresh API] Token refreshed successfully for user:', user.email);

    return NextResponse.json({
      success: true,
      message: 'توکن با موفقیت تازه‌سازی شد',
      accessToken: newAccessToken,
      user: {
        id: user.id,
        buildingId: user.buildingId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        building: user.building,
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [Refresh API] Invalid refresh token:', error.message);
      return NextResponse.json(
        { success: false, error: 'توکن تازه‌سازی نامعتبر است' },
        { status: 401 }
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ [Refresh API] Refresh token expired');
      return NextResponse.json(
        { success: false, error: 'توکن تازه‌سازی منقضی شده است' },
        { status: 401 }
      );
    }

    console.error('❌ [Refresh API] Server error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور داخلی' },
      { status: 500 }
    );
  }
}
