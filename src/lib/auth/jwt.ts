// src/lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export interface JwtPayload {
  userId: number; // ✅ تغییر از string به number
  email: string;
  role: string;
  buildingId?: number | null; // ✅ تغییر از string به number و اضافه کردن null
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: number; // ✅ تغییر از string به number
  iat?: number;
  exp?: number;
}

/**
 * تولید Access Token
 */
export function generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'buildino-app',
    audience: 'buildino-users'
  });
}

/**
 * تولید Refresh Token
 */
export function generateRefreshToken(userId: number): string { // ✅ تغییر از string به number
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      issuer: 'buildino-app',
      audience: 'buildino-users'
    }
  );
}

/**
 * تأیید Access Token
 */
export function verifyAccessToken(token: string): JwtPayload {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'buildino-app',
      audience: 'buildino-users'
    }) as JwtPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_TOKEN');
    }
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * تأیید Refresh Token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'buildino-app',
      audience: 'buildino-users'
    }) as RefreshTokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('REFRESH_TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
    throw new Error('REFRESH_TOKEN_VERIFICATION_FAILED');
  }
}

/**
 * استخراج توکن از header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * دکود کردن توکن بدون تأیید (برای خواندن payload)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * بررسی انقضای توکن
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * محاسبه زمان باقی‌مانده تا انقضای توکن (بر حسب ثانیه)
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;
    
    return timeLeft > 0 ? timeLeft : 0;
  } catch {
    return null;
  }
}
