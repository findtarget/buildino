// src/app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';

// این خط را برای اطمینان نگه می‌داریم
export const dynamic = 'force-dynamic';

interface TokenPayload {
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    // راه‌حل جایگزین: خواندن کوکی مستقیماً از آبجکت request
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: 'No refresh token found' }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
    } catch (error) {
      console.error('Invalid or expired refresh token:', error);
      // برای حذف کوکی، باید یک پاسخ جدید بسازیم و روی آن عمل کنیم
      const response = NextResponse.json({ success: false, error: 'Invalid or expired refresh token' }, { status: 401 });
      response.cookies.delete('refreshToken');
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      // اگر کاربر حذف شده باشد، کوکی او را پاک می‌کنیم
      const response = NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
      response.cookies.delete('refreshToken');
      return response;
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: userWithoutPassword,
      },
    });

  } catch (error) {
    console.error('Error in /api/auth/refresh:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
