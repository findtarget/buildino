// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('🚀 [Login API] Received a POST request to /api/auth/login.');

    const { email, password } = await request.json();
    console.log(`🔵 [Login API] Attempting to find user with email: ${email}`);

    if (!email || !password) {
      console.log('❌ [Login API] Email or password is missing.');
      return NextResponse.json(
        { success: false, error: 'ایمیل و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        building: true,
      },
    });

    if (!user) {
      console.log('❌ [Login API] User not found with email: ', email);
      return NextResponse.json(
        { success: false, error: 'کاربری با این ایمیل یافت نشد' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log('❌ [Login API] User account is inactive: ', email);
      return NextResponse.json(
        { success: false, error: 'حساب کاربری غیرفعال است' },
        { status: 401 }
      );
    }

    // Check password - استفاده از نام درست فیلد
    const passwordField = user.password || user.password_hash;
    const isPasswordValid = await bcrypt.compare(password, passwordField);
    if (!isPasswordValid) {
      console.log('❌ [Login API] Invalid password for user: ', email);
      return NextResponse.json(
        { success: false, error: 'رمز عبور نادرست است' },
        { status: 401 }
      );
    }

    console.log(`✅ [Login API] User authenticated successfully: ${email}`);

    // Get JWT secrets from environment variables
    const accessTokenSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    console.log('🔍 [Login API] Checking JWT secrets...');
    console.log('JWT_SECRET exists:', !!accessTokenSecret);
    console.log('REFRESH_TOKEN_SECRET exists:', !!refreshTokenSecret);

    // Check if JWT secrets are defined
    if (!accessTokenSecret || !refreshTokenSecret) {
      console.error('❌ [Login API] JWT secrets are not defined in .env.local');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('JWT')));
      return NextResponse.json(
        { 
          success: false, 
          error: 'خطای تنظیمات سرور. لطفاً با مدیر سیستم تماس بگیرید.' 
        },
        { status: 500 }
      );
    }
    console.log('✅ [Login API] JWT secrets are loaded successfully.');

    // Generate access token
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        buildingId: user.buildingId,
      },
      accessTokenSecret,
      { expiresIn: '1h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    // Update user's refresh token and last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        refreshToken,
        lastLogin: new Date() 
      },
    });

    // Set cookies
    const cookieStore = cookies();
    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`✅ [Login API] Login successful for user: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'ورود موفقیت‌آمیز بود',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        building: user.building,
      },
      accessToken,
      refreshToken,
    });

  } catch (error) {
    console.error('❌ [Login API] An unhandled error occurred in the try-catch block:', error);
    return NextResponse.json(
      { success: false, error: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
