import type { Response } from 'express';

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, REFRESH_TOKEN_COOKIE_OPTIONS);
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
  });
}