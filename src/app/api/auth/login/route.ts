// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // جستجوی کاربر در دیتابیس
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        building: {
          select: { id: true, name: true, address: true }
        }
      }
    });

    if (!user) {
      console.warn(`⚠️ [Login API] User not found for email: ${email}`);
      return NextResponse.json(
        { success: false, error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.warn(`⚠️ [Login API] Inactive account: ${user.email}`);
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      );
    }

    // بررسی هش پسورد
    if (!user.passwordHash) {
      console.warn(`⚠️ [Login API] No password hash stored for: ${user.email}`);
      return NextResponse.json(
        { success: false, error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // بررسی رمز عبور با bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      console.warn(`⚠️ [Login API] Invalid password for: ${user.email}`);
      return NextResponse.json(
        { success: false, error: 'ایمیل یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // ایجاد توکن‌ها
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email!,
      role: user.role,
      buildingId: user.buildingId
    });
    const refreshToken = generateRefreshToken(user.id);

    // ذخیره refresh token در دیتابیس
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date()
      }
    });

    // ست کردن کوکی‌ها
    const cookieStore = cookies();
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 ساعت
    });
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    console.log(`✅ [Login API] User logged in: ${user.email}`);

    // پاسخ JSON با توکن‌ها هم در لایه بالا و هم در data
    return NextResponse.json({
      success: true,
      accessToken,   // اضافه برای فرانت
      refreshToken,  // اضافه برای فرانت
      data: {
        accessToken,
        refreshToken,
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
      }
    });

  } catch (error) {
    console.error('❌ [Login API] Server error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور داخلی' },
      { status: 500 }
    );
  }
}
