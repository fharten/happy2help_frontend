import { JWTPayload } from '@/types/auth';

export function decodeToken(token: string): JWTPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  // 30 SECOND SAFETY BUFFER
  return Date.now() >= decoded.exp * 1000 - 30000;
}

export function getTokenTimeRemaining(token: string): number {
  const decoded = decodeToken(token);
  if (!decoded) return 0;

  return Math.max(0, decoded.exp * 1000 - Date.now());
}
