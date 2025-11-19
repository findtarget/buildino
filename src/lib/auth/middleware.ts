// src/lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number; // ✅ تغییر از string به number
    email: string;
    role: string;
    buildingId?: number | null; // ✅ تغییر از string به number و اضافه کردن null
  };
}

/**
 * Middleware برای تأیید احراز هویت
 */
export async function authMiddleware(
  request: NextRequest,
  requiredRoles?: string[]
): Promise<{ success: boolean; response?: NextResponse; user?: any }> {
  try {
    // بررسی توکن در کوکی
    const cookieToken = request.cookies.get('accessToken')?.value;
    
    // بررسی توکن در هدر Authorization
    const authHeader = request.headers.get('Authorization');
    const headerToken = extractTokenFromHeader(authHeader);
    
    const token = cookieToken || headerToken;

    if (!token) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: 'توکن احراز هویت یافت نشد' },
          { status: 401 }
        )
      };
    }

    // تأیید توکن
    const payload = verifyAccessToken(token);

    // بررسی نقش کاربر در صورت نیاز
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(payload.role)) {
        return {
          success: false,
          response: NextResponse.json(
            { success: false, error: 'دسترسی غیرمجاز' },
            { status: 403 }
          )
        };
      }
    }

    return {
      success: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        buildingId: payload.buildingId
      }
    };

  } catch (error) {
    console.error('❌ [Auth Middleware] Error:', error);

    let errorMessage = 'خطا در احراز هویت';
    let statusCode = 401;

    if (error instanceof Error) {
      switch (error.message) {
        case 'TOKEN_EXPIRED':
          errorMessage = 'توکن منقضی شده است';
          break;
        case 'INVALID_TOKEN':
          errorMessage = 'توکن نامعتبر است';
          break;
        case 'TOKEN_VERIFICATION_FAILED':
          errorMessage = 'تأیید توکن با مشکل مواجه شد';
          break;
        default:
          errorMessage = 'خطا در احراز هویت';
      }
    }

    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: errorMessage },
        { status: statusCode }
      )
    };
  }
}

/**
 * Wrapper برای محافظت از API route ها
 */
export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request, requiredRoles);
    
    if (!authResult.success) {
      return authResult.response!;
    }

    // اضافه کردن اطلاعات کاربر به request
    (request as AuthenticatedRequest).user = authResult.user;
    
    return handler(request as AuthenticatedRequest);
  };
}
